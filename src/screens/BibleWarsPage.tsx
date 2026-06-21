import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import maplibregl from "maplibre-gl";
import {
  ArrowLeft,
  BookOpen,
  Maximize2,
  MapPin,
  RotateCcw,
  Search,
  Sword,
  Users,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import {
  bibleWars,
  periodFilters,
  periodLabels,
  type BibleWar,
  type PeriodFilter,
} from "../data/bibleWars";
import { cn } from "../lib/utils";

const OPENFREEMAP_STYLE_URL = "https://tiles.openfreemap.org/styles/bright";
const WAR_ROUTE_SOURCE_ID = "bible-war-route";
const WAR_ROUTE_LAYER_ID = "bible-war-route-line";
const NON_LOCALIZED_BASE_LABEL_LAYER_IDS = new Set([
  "highway-shield-non-us",
  "highway-shield-us-interstate",
  "road_shield_us",
]);

const MAP_ATTRIBUTION = "地圖底圖：OpenFreeMap；資料：OpenStreetMap。地點為教學用近似定位。";

function matchesQuery(war: BibleWar, query: string) {
  const haystack = [
    war.title,
    war.ref,
    war.time,
    war.place,
    war.people,
    war.summary,
    ...war.lessons,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function BibleWarsPage() {
  const [selectedId, setSelectedId] = useState(bibleWars[0].id);
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [query, setQuery] = useState("");
  const fitRef = useRef<(() => void) | null>(null);

  const filteredWars = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return bibleWars.filter(
      (war) =>
        (period === "all" || war.period === period) &&
        (!normalized || matchesQuery(war, normalized)),
    );
  }, [period, query]);

  // Keep the selection valid as filters narrow the list.
  useEffect(() => {
    if (filteredWars.length && !filteredWars.some((war) => war.id === selectedId)) {
      setSelectedId(filteredWars[0].id);
    }
  }, [filteredWars, selectedId]);

  const selected =
    filteredWars.find((war) => war.id === selectedId) ??
    bibleWars.find((war) => war.id === selectedId) ??
    bibleWars[0];

  const resetFilters = () => {
    setQuery("");
    setPeriod("all");
    setSelectedId(bibleWars[0].id);
  };

  return (
    <section className="map-page" lang="zh-Hant">
      <Link to="/" className="back-link">
        <ArrowLeft aria-hidden="true" size={18} />
        回首頁
      </Link>

      <header className="map-header">
        <p className="eyebrow">聖經資源 · 互動地圖</p>
        <h1>聖經戰爭</h1>
        <p>
          互動整理舊約中幾場具代表性的戰役：從背景、危機、神的介入、戰爭流程到信仰功課。點選戰役卡片，查看流程與真實地圖上的相關地點。
        </p>
      </header>

      <div className="map-controls">
        <div className="map-filter" aria-label="篩選時期">
          {periodFilters.map((item) => (
            <button
              key={item}
              type="button"
              className={cn({ active: period === item })}
              onClick={() => setPeriod(item)}
            >
              {periodLabels[item]}
            </button>
          ))}
        </div>
        <div className="war-tools">
          <label className="war-search">
            <Search aria-hidden="true" size={18} />
            <input
              type="search"
              value={query}
              placeholder="搜尋戰役、人物、地點、經文…"
              aria-label="搜尋戰役"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <button type="button" className="war-reset" onClick={resetFilters}>
            <RotateCcw aria-hidden="true" size={16} />
            重設
          </button>
        </div>
      </div>

      <div className="map-layout">
        <Card className="map-stage-card">
          <div className="map-stage-toolbar">
            <div>
              <p className="eyebrow">真實地圖 · 相關地點</p>
              <h2>{selected.title}</h2>
            </div>
            <div className="map-stage-actions">
              <button type="button" className="war-fit" onClick={() => fitRef.current?.()}>
                <Maximize2 aria-hidden="true" size={16} />
                回到此戰役範圍
              </button>
              <span>
                <MapPin aria-hidden="true" size={18} />
                {selected.points.length} 個地點
              </span>
            </div>
          </div>
          <MapLibreWarMap selected={selected} fitRef={fitRef} />
        </Card>

        <aside className="map-detail-panel">
          <Card className="map-detail-card">
            <div className="map-detail-kicker">
              <span>
                <Sword aria-hidden="true" size={18} />
              </span>
              <strong>{selected.time}</strong>
            </div>
            <h2>{selected.title}</h2>
            <p className="map-region">
              <MapPin aria-hidden="true" size={18} />
              {selected.place}
            </p>
            <div className="map-scripture">
              <BookOpen aria-hidden="true" size={18} />
              <span>{selected.ref}</span>
            </div>
            <p>{selected.summary}</p>

            <div className="war-people">
              <Users aria-hidden="true" size={18} />
              <div>
                <b>主要人物</b>
                <span>{selected.people}</span>
              </div>
            </div>

            <div className="war-flow">
              <h3>戰爭流程</h3>
              <ol className="war-steps">
                {selected.steps.map((step, index) => (
                  <li key={`${selected.id}-step-${index}`} className="war-step">
                    <span className="war-num">{index + 1}</span>
                    <div>
                      <b>{step.title}</b>
                      <p>{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="war-lessons">
              <h3>重要信仰功課</h3>
              <div className="war-chips">
                {selected.lessons.map((lesson) => (
                  <span key={lesson} className="war-chip">
                    {lesson}
                  </span>
                ))}
              </div>
            </div>

            <p className="war-note">{selected.mapNote}</p>
          </Card>

          <Card className="map-route-card">
            <h3>戰役清單</h3>
            {filteredWars.length ? (
              <ol>
                {filteredWars.map((war, index) => (
                  <li key={war.id}>
                    <button
                      type="button"
                      className={cn({ active: war.id === selected.id })}
                      onClick={() => setSelectedId(war.id)}
                    >
                      <span>{index + 1}</span>
                      <strong>{war.title}</strong>
                      <small>
                        {war.ref}・{war.place}
                      </small>
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="war-empty">找不到符合條件的戰役，試著調整時期或關鍵字。</p>
            )}
          </Card>
        </aside>
      </div>
    </section>
  );
}

function MapLibreWarMap({
  selected,
  fitRef,
}: {
  selected: BibleWar;
  fitRef: React.RefObject<(() => void) | null>;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) {
      return;
    }

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container,
        style: OPENFREEMAP_STYLE_URL,
        center: [35.3, 31.8],
        zoom: 7,
        minZoom: 4,
        maxZoom: 11,
      });
    } catch {
      setMapError(true);
      return;
    }

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");
    map.on("load", () => localizeBaseMap(map));

    // The map lives in a responsive grid that shifts (e.g. 2-col → 1-col at the
    // 820px breakpoint) and may not have its final width when the map is
    // created. Keep MapLibre's internal size in sync with the container so the
    // markers stay aligned with the base map, especially after zooming.
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const render = () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = selected.points.map((point, index) => {
        const element = createWarMarkerElement(point.label, index + 1);
        return new maplibregl.Marker({ anchor: "center", element })
          .setLngLat([point.lng, point.lat])
          .addTo(map);
      });

      updateWarRoute(map, selected);
      fitPoints(map, selected);
    };

    // Expose a "fit to this battle" action for the toolbar button.
    fitRef.current = () => {
      if (map.isStyleLoaded()) {
        fitPoints(map, selected);
      }
    };

    if (map.isStyleLoaded()) {
      render();
    } else {
      map.once("load", render);
    }

    return () => {
      fitRef.current = null;
    };
  }, [selected, fitRef]);

  return (
    <div className="real-map-wrap">
      <div className="real-map" ref={containerRef}>
        {mapError ? (
          <div className="real-map-fallback">
            <strong>此瀏覽器目前無法載入互動地圖</strong>
            <span>請確認瀏覽器支援 WebGL，或改用最新版 Chrome、Safari、Edge。</span>
          </div>
        ) : null}
      </div>
      <div className="map-attribution-note">{MAP_ATTRIBUTION}</div>
    </div>
  );
}

function createWarMarkerElement(label: string, order: number) {
  const element = document.createElement("div");
  element.className = "real-map-marker";
  element.title = `${order}. ${label}`;

  const number = document.createElement("span");
  number.textContent = String(order);
  const name = document.createElement("strong");
  name.textContent = label;
  element.replaceChildren(number, name);

  return element;
}

function updateWarRoute(map: maplibregl.Map, war: BibleWar) {
  const data: GeoJSON.Feature<GeoJSON.LineString> = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: war.points.map((point) => [point.lng, point.lat]),
    },
  };

  const source = map.getSource(WAR_ROUTE_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
  if (source) {
    source.setData(data);
    return;
  }

  map.addSource(WAR_ROUTE_SOURCE_ID, { type: "geojson", data });
  const firstSymbolLayerId = map.getStyle().layers?.find((layer) => layer.type === "symbol")?.id;
  map.addLayer(
    {
      id: WAR_ROUTE_LAYER_ID,
      type: "line",
      source: WAR_ROUTE_SOURCE_ID,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#d48b1f",
        "line-dasharray": [2, 1.6],
        "line-opacity": 0.9,
        "line-width": 5,
      },
    },
    firstSymbolLayerId,
  );
}

function fitPoints(map: maplibregl.Map, war: BibleWar) {
  const [first, ...rest] = war.points;
  if (!first) {
    return;
  }

  const bounds = rest.reduce(
    (current, point) => current.extend([point.lng, point.lat]),
    new maplibregl.LngLatBounds([first.lng, first.lat], [first.lng, first.lat]),
  );

  map.fitBounds(bounds, { maxZoom: 9, padding: 48, duration: 480 });
}

function localizeBaseMap(map: maplibregl.Map) {
  const expression = [
    "coalesce",
    ["get", "name:zh-Hant"],
    ["get", "name:zh"],
    ["get", "name:zh-Hans"],
    ["get", "name_zh"],
    ["get", "name:en"],
    ["get", "name_en"],
    ["get", "name:latin"],
    ["get", "name"],
  ];

  map.getStyle().layers?.forEach((layer) => {
    if (
      layer.type !== "symbol" ||
      !("text-field" in (layer.layout ?? {})) ||
      NON_LOCALIZED_BASE_LABEL_LAYER_IDS.has(layer.id)
    ) {
      return;
    }

    map.setLayoutProperty(layer.id, "text-field", expression);
  });
}
