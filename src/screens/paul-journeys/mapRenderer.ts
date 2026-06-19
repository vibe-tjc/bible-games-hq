// maplibre-gl CSS is already imported in src/main.tsx — no duplicate import needed.
import maplibregl from "maplibre-gl";
import type { Feature, LineString } from "geojson";
import { CITIES } from "../../data/paulJourneys";
import type { CityId } from "../../data/paulJourneys";
import type { Renderer, RendererDeps, ScreenPoint } from "./types";

const OPENFREEMAP_STYLE_URL = "https://tiles.openfreemap.org/styles/bright";

const PAUL_SVG_HTML =
  '<svg width="34" height="42" viewBox="0 0 34 42"><path d="M17 1C8.2 1 1 8 1 16.6 1 28 17 41 17 41s16-13 16-24.4C33 8 25.8 1 17 1z" fill="#b23b22" stroke="#fbf4e2" stroke-width="2.4"/><circle cx="17" cy="16" r="6.2" fill="#fbf4e2"/></svg>';

export function createMapRenderer(
  container: HTMLElement,
  deps: RendererDeps,
  callbacks: { onReady: () => void; onError: () => void },
): Renderer & { destroy(): void } {
  // ---- mutable state ----
  let map: maplibregl.Map;
  const cityMarkers: Partial<Record<CityId, maplibregl.Marker>> = {};
  let paulMarker: maplibregl.Marker | null = null;
  let ringMarker: maplibregl.Marker | null = null;

  // route cleanup tracking
  const routeLayerIds: string[] = [];
  const routeSourceIds: string[] = [];
  let routeSeq = 0;

  // rAF / timeout cancellation
  let pendingRaf: number | null = null;
  const routeRafIds: number[] = [];
  let pendingShakeTimers: ReturnType<typeof setTimeout>[] = [];

  // ---- init ----
  try {
    map = new maplibregl.Map({
      container,
      style: OPENFREEMAP_STYLE_URL,
      center: [30, 38],
      zoom: 6,
      minZoom: 5,
      maxZoom: 9,
    });
  } catch {
    callbacks.onError();
    // Return a no-op renderer so the caller has a valid object.
    const noop = () => {};
    const noopXY = (): ScreenPoint => ({ x: 0, y: 0 });
    return {
      show: noop, after: noop, fit: noop, reset: noop, addCity: noop,
      markVisited: noop, shake: noop, placePaul: noop, movePaul: noop,
      drawRoute: noop, ring: noop, clearRing: noop, paulXY: noopXY,
      destroy: noop,
    };
  }

  function onInitError() {
    map.off("error", onInitError);
    callbacks.onError();
  }
  map.once("error", onInitError);
  map.on("load", () => {
    map.off("error", onInitError);
    callbacks.onReady();
  });

  // ---- helpers ----
  function getPinEl(id: CityId): HTMLElement | null {
    const m = cityMarkers[id];
    if (!m) return null;
    const el = m.getElement();
    return el.querySelector<HTMLElement>(".pin") ?? null;
  }

  // ---- Renderer methods ----

  function show(): void {
    container.style.display = "block";
  }

  function after(): void {
    map.resize();
  }

  function fit(ids: CityId[]): void {
    if (!ids.length) return;
    const first = CITIES[ids[0]];
    const bounds = ids.reduce(
      (b, id) => b.extend([CITIES[id].lng, CITIES[id].lat]),
      new maplibregl.LngLatBounds([first.lng, first.lat], [first.lng, first.lat]),
    );
    map.fitBounds(bounds, { padding: 70, maxZoom: 8 });
  }

  function reset(): void {
    // Remove route layers then sources
    for (const lid of routeLayerIds) {
      if (map.getLayer(lid)) map.removeLayer(lid);
    }
    for (const sid of routeSourceIds) {
      if (map.getSource(sid)) map.removeSource(sid);
    }
    routeLayerIds.length = 0;
    routeSourceIds.length = 0;
    routeSeq = 0;

    // Remove city markers
    for (const id of Object.keys(cityMarkers) as CityId[]) {
      cityMarkers[id]?.remove();
      delete cityMarkers[id];
    }

    // Remove paul & ring
    paulMarker?.remove();
    paulMarker = null;
    clearRing();
  }

  function addCity(id: CityId): void {
    const c = CITIES[id];
    const el = document.createElement("div");
    const pin = document.createElement("div");
    // challenge mode: SVG uses .hide; mapRenderer uses .nolabel — keep parity
    pin.className = "pin" + (deps.isChallenge() ? " nolabel" : "");

    const dot = document.createElement("span");
    dot.className = "dot";

    const lbl = document.createElement("span");
    lbl.className = `lbl ${c.dir}`;
    lbl.textContent = c.zh;

    pin.appendChild(dot);
    pin.appendChild(lbl);
    el.appendChild(pin);

    el.addEventListener("click", () => deps.onCityClick(id));

    const marker = new maplibregl.Marker({ element: el, anchor: "center" })
      .setLngLat([c.lng, c.lat])
      .addTo(map);

    cityMarkers[id] = marker;
  }

  function markVisited(id: CityId): void {
    const pin = getPinEl(id);
    if (!pin) return;
    pin.classList.add("visited");
    pin.classList.remove("nolabel");
  }

  function shake(id: CityId): void {
    const pin = getPinEl(id);
    if (!pin) return;
    pin.classList.remove("shake");
    void pin.offsetWidth; // force reflow to restart animation
    pin.classList.add("shake");
    const t = setTimeout(() => pin.classList.remove("shake"), 450);
    pendingShakeTimers.push(t);
  }

  function placePaul(id: CityId): void {
    const c = CITIES[id];

    paulMarker?.remove();
    paulMarker = null;

    const el = document.createElement("div");
    const paulDiv = document.createElement("div");
    paulDiv.className = "paul";

    const ring = document.createElement("span");
    ring.className = "ring";

    const svgWrapper = document.createElement("span");
    svgWrapper.innerHTML = PAUL_SVG_HTML;

    const ptag = document.createElement("span");
    ptag.className = "ptag";
    ptag.textContent = "保羅";

    paulDiv.appendChild(ring);
    paulDiv.appendChild(svgWrapper.firstChild!);
    paulDiv.appendChild(ptag);
    el.appendChild(paulDiv);

    paulMarker = new maplibregl.Marker({ element: el, anchor: "bottom" })
      .setLngLat([c.lng, c.lat])
      .addTo(map);
  }

  function movePaul(id: CityId, cb?: () => void): void {
    if (!paulMarker) { cb?.(); return; }
    const target = CITIES[id];

    if (deps.reduceMotion()) {
      paulMarker.setLngLat([target.lng, target.lat]);
      cb?.();
      return;
    }

    const start = paulMarker.getLngLat();
    const startLng = start.lng;
    const startLat = start.lat;
    const t0 = performance.now();
    const dur = 700;

    function an(now: number) {
      const k = Math.min(1, (now - t0) / dur);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      paulMarker!.setLngLat([
        startLng + (target.lng - startLng) * e,
        startLat + (target.lat - startLat) * e,
      ]);
      if (k < 1) {
        pendingRaf = requestAnimationFrame(an);
      } else {
        pendingRaf = null;
        cb?.();
      }
    }

    pendingRaf = requestAnimationFrame(an);
  }

  function drawRoute(aId: CityId, bId: CityId, sea: boolean, anim: boolean): void {
    const a = CITIES[aId];
    const b = CITIES[bId];
    const seq = ++routeSeq;

    const underSourceId = `pg-route-${seq}-u-src`;
    const underLayerId = `pg-route-${seq}-u-lyr`;
    const mainSourceId = `pg-route-${seq}-m-src`;
    const mainLayerId = `pg-route-${seq}-m-lyr`;

    const coords: [number, number][] = [
      [a.lng, a.lat],
      [b.lng, b.lat],
    ];

    const geojson: Feature<LineString> = {
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: coords },
    };

    // Under-line (dark shadow)
    map.addSource(underSourceId, { type: "geojson", data: geojson });
    routeSourceIds.push(underSourceId);

    const firstSymbolLayerId = map.getStyle().layers?.find((l) => l.type === "symbol")?.id;

    map.addLayer(
      {
        id: underLayerId,
        type: "line",
        source: underSourceId,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#5c3e06",
          "line-width": sea ? 6 : 8,
          "line-opacity": 0.3,
        },
      },
      firstSymbolLayerId,
    );
    routeLayerIds.push(underLayerId);

    // Main line (gold)
    map.addSource(mainSourceId, { type: "geojson", data: geojson });
    routeSourceIds.push(mainSourceId);

    const mainPaint: Record<string, unknown> = {
      "line-color": "#d9a441",
      "line-width": sea ? 4 : 5.5,
      "line-opacity": anim && !deps.reduceMotion() ? 0 : 0.97,
    };
    if (sea && !(anim && !deps.reduceMotion())) {
      mainPaint["line-dasharray"] = [2, 10];
    }

    map.addLayer(
      {
        id: mainLayerId,
        type: "line",
        source: mainSourceId,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: mainPaint,
      },
      firstSymbolLayerId,
    );
    routeLayerIds.push(mainLayerId);

    // Simple fade-in animation (maplibre line-dashoffset animation is complex; fade is sufficient)
    if (anim && !deps.reduceMotion()) {
      const t0 = performance.now();
      const dur = 680;
      function fadeIn(now: number) {
        const k = Math.min(1, (now - t0) / dur);
        map.setPaintProperty(mainLayerId, "line-opacity", k * 0.97);
        if (k < 1) {
          routeRafIds.push(requestAnimationFrame(fadeIn));
        } else {
          // Apply sea dasharray after animation completes
          if (sea) {
            map.setPaintProperty(mainLayerId, "line-dasharray", [2, 10]);
          }
        }
      }
      routeRafIds.push(requestAnimationFrame(fadeIn));
    }
  }

  function ring(id: CityId): void {
    clearRing();
    const c = CITIES[id];

    const el = document.createElement("div");
    el.className = "paul-game-ring-marker";
    el.style.cssText =
      "width:30px;height:30px;border-radius:50%;border:3px solid #d4502f;background:transparent;animation:paul-ring-pulse 1s ease-out infinite;pointer-events:none;transform:translate(-50%,-50%)";
    // paul-ring-pulse @keyframes is defined in paul-journeys.css

    ringMarker = new maplibregl.Marker({ element: el, anchor: "center" })
      .setLngLat([c.lng, c.lat])
      .addTo(map);
  }

  function clearRing(): void {
    ringMarker?.remove();
    ringMarker = null;
  }

  function paulXY(): ScreenPoint {
    if (!paulMarker) return { x: 0, y: 0 };
    const p = map.project(paulMarker.getLngLat());
    const r = container.getBoundingClientRect();
    return { x: p.x + r.left, y: p.y + r.top - 30 };
  }

  // ---- destroy ----
  function destroy(): void {
    if (pendingRaf !== null) {
      cancelAnimationFrame(pendingRaf);
      pendingRaf = null;
    }
    for (const id of routeRafIds) cancelAnimationFrame(id);
    routeRafIds.length = 0;
    for (const t of pendingShakeTimers) clearTimeout(t);
    pendingShakeTimers.length = 0;
    map.remove();
  }

  return {
    show,
    after,
    fit,
    reset,
    addCity,
    markVisited,
    shake,
    placePaul,
    movePaul,
    drawRoute,
    ring,
    clearRing,
    paulXY,
    destroy,
  };
}
