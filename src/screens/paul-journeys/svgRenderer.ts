import { CITIES } from "../../data/paulJourneys";
import type { CityId } from "../../data/paulJourneys";
import type { Renderer, RendererDeps, ScreenPoint } from "./types";

/* ===== SVG HELPER ===== */
const NS = "http://www.w3.org/2000/svg";
function ce(tag: string, attrs: Record<string, string | number> = {}): SVGElement {
  const el = document.createElementNS(NS, tag);
  for (const k in attrs) el.setAttribute(k, String(attrs[k]));
  return el;
}

/* ===== HAND-DRAWN MAP GEOMETRY ===== */
const GREECE: number[][] = [[70,70],[150,58],[248,66],[320,108],[300,150],[332,196],[284,224],[330,252],[300,300],[286,338],[232,360],[166,356],[132,322],[120,270],[92,232],[116,168],[80,118]];
const ANATOLIA: number[][] = [[398,45],[1200,45],[1200,720],[1010,690],[1002,650],[985,605],[995,560],[1015,510],[1055,460],[1095,410],[1075,372],[1010,360],[920,356],[820,352],[745,360],[700,374],[660,358],[560,335],[470,318],[445,283],[430,240],[388,200],[382,150]];
const CYPRUS: number[][] = [[802,470],[842,454],[902,444],[960,447],[986,438],[996,452],[958,468],[900,473],[845,479],[806,478]];
const SAMO: number[][] = [[352,124],[372,118],[382,128],[372,138],[354,136]];
const LESBOS: number[][] = [[420,206],[440,200],[452,210],[444,222],[424,222]];
const CRETE: number[][] = [[318,420],[380,408],[452,411],[486,419],[452,431],[372,433],[322,429]];
const AFRICA: number[][] = [[0,760],[0,712],[220,700],[470,710],[700,704],[900,718],[900,760]];

function cat(p: number[][], closed = true): string {
  const n = p.length;
  if (n < 3) return "";
  let d = `M ${p[0][0]} ${p[0][1]} `;
  const lim = closed ? n : n - 1;
  for (let i = 0; i < lim; i++) {
    const a = p[(i - 1 + n) % n], b = p[i % n], c = p[(i + 1) % n], e = p[(i + 2) % n];
    const c1 = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6];
    const c2 = [c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6];
    d += `C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${c[0]} ${c[1]} `;
  }
  return closed ? d + "Z" : d;
}

function mtn(cx: number, cy: number, k: number): string {
  let s = "";
  for (let i = 0; i < k; i++) {
    const x = cx + i * 26;
    s += `<path d="M${x} ${cy} l16 -26 l16 26 Z" fill="#cdb277" stroke="#8a6d3b" stroke-width="2" stroke-linejoin="round"/><path d="M${x + 9} ${cy - 15} l7 -11 l7 11 Z" fill="#efe3c5"/>`;
  }
  return s;
}

function tree(x: number, y: number): string {
  return `<rect x="${x - 2}" y="${y}" width="4" height="8" fill="#7a5c2a"/><circle cx="${x}" cy="${y - 3}" r="9" fill="#86b56a" stroke="#5c7a42" stroke-width="2"/>`;
}

function buildBG(svgEl: SVGSVGElement): void {
  const lands = [GREECE, ANATOLIA, CYPRUS, SAMO, LESBOS, CRETE].map(l => cat(l));
  let waves = "";
  for (let i = 0; i < 46; i++) {
    const x = 40 + Math.random() * 1120, y = 60 + Math.random() * 680;
    waves += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} q6 -6 12 0 q6 6 12 0" stroke="#bfe6ec" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".5"/>`;
  }
  let comp = '<g transform="translate(150,600)" opacity=".85">';
  for (let i = 0; i < 8; i++) {
    const a = i * 0.7853981 - 1.5708, a2 = (i + 1) * 0.7853981 - 1.5708, L = i % 2 ? 20 : 40;
    comp += `<path d="M0 0 L${(Math.cos(a) * 7).toFixed(1)} ${(Math.sin(a) * 7).toFixed(1)} L${(Math.cos(a) * L).toFixed(1)} ${(Math.sin(a) * L).toFixed(1)} L${(Math.cos(a2) * 7).toFixed(1)} ${(Math.sin(a2) * 7).toFixed(1)} Z" fill="${i % 2 ? '#9c6c16' : '#d9a441'}" fill-opacity="${i % 2 ? .6 : .9}"/>`;
  }
  comp += '<circle r="6" fill="#fbf4e2" stroke="#9c6c16" stroke-width="2"/><text x="0" y="-46" text-anchor="middle" font-size="15" fill="#fbf4e2" font-family="Georgia,serif">N</text></g>';
  const ship = '<g transform="translate(590,470)" opacity=".9"><path d="M-26 6 Q0 22 26 6 L20 12 Q0 24 -20 12 Z" fill="#8a5a2a" stroke="#5c3a16" stroke-width="2"/><rect x="-1.5" y="-30" width="3" height="36" fill="#5c3a16"/><path d="M1 -28 Q24 -20 20 0 L1 0 Z" fill="#fbf4e2" stroke="#c9b48a" stroke-width="1.5"/><path d="M-1 -22 Q-20 -16 -16 0 L-1 0 Z" fill="#f0e3bd" stroke="#c9b48a" stroke-width="1.5"/></g>';
  const trees = tree(150, 180) + tree(210, 150) + tree(120, 250) + tree(640, 250) + tree(965, 300);
  const regions: [string, number, number][] = [["MACEDONIA", 205, 52], ["ACHAIA", 230, 235], ["ASIA", 560, 250], ["GALATIA", 820, 210], ["PAMPHYLIA", 640, 330], ["CYPRVS", 895, 460], ["SYRIA", 1120, 332], ["IVDÆA", 1112, 560], ["CRETA", 400, 422], ["AEGYPTVS", 430, 735]];
  let reg = "";
  regions.forEach(([t, x, y]) => reg += `<text x="${x}" y="${y}" font-size="17" text-anchor="middle" fill="#7a5c2a" font-family="Georgia,serif" font-style="italic" opacity=".34" letter-spacing="3">${t}</text>`);
  const landSvg = lands.map(p => `<path d="${p}" fill="none" stroke="#8fd4dd" stroke-width="12" stroke-linejoin="round" opacity=".6"/>`).join("") + lands.map(p => `<path d="${p}" fill="#e9d6a0" stroke="#8a6d3b" stroke-width="4" stroke-linejoin="round"/>`).join("") + lands.map(p => `<path d="${p}" fill="none" stroke="#f3e6c2" stroke-width="1.6" stroke-linejoin="round" opacity=".8"/>`).join("");
  const g = ce("g", {});
  g.innerHTML = `<defs><radialGradient id="sea" cx="50%" cy="42%" r="75%"><stop offset="0%" stop-color="#39a3b8"/><stop offset="100%" stop-color="#21788c"/></radialGradient><radialGradient id="vig" cx="50%" cy="45%" r="72%"><stop offset="62%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#0a3a44" stop-opacity=".4"/></radialGradient></defs>
    <rect width="1200" height="760" fill="url(#sea)"/>${waves}<path d="${cat(AFRICA)}" fill="#e3cf98" stroke="#8a6d3b" stroke-width="4"/>${landSvg}${trees}${mtn(560, 205, 3)}${mtn(880, 235, 2)}${mtn(700, 150, 2)}${comp}${ship}${reg}<rect width="1200" height="760" fill="url(#vig)"/>`;
  svgEl.appendChild(g);
  svgEl.appendChild(ce("g", { class: "pg-routes" }));
  svgEl.appendChild(ce("g", { class: "pg-dots" }));
  svgEl.appendChild(ce("g", { class: "pg-marker" }));
  svgEl.appendChild(ce("rect", { x: 6, y: 6, width: 1188, height: 748, fill: "none", stroke: "#fbf4e2", "stroke-width": 3, opacity: .45, rx: 6 }));
}

/* ===== FACTORY ===== */
export function createSvgRenderer(svgEl: SVGSVGElement, deps: RendererDeps): Renderer {
  buildBG(svgEl);
  const routes = svgEl.querySelector(".pg-routes") as SVGGElement;
  const dots = svgEl.querySelector(".pg-dots") as SVGGElement;
  const marker = svgEl.querySelector(".pg-marker") as SVGGElement;

  const dotMap: Record<string, { g: SVGGElement; core: SVGElement; lab: SVGElement }> = {};
  let paul: SVGElement | null = null;
  let ringEl: SVGElement | null = null;

  function show(): void {
    svgEl.style.display = "block";
    const leaf = deps.root.querySelector(".paul-leaf") as HTMLElement | null;
    if (leaf) leaf.style.display = "none";
  }

  function after(): void {}

  function fit(_ids: CityId[]): void {}

  function reset(): void {
    routes.innerHTML = "";
    dots.innerHTML = "";
    marker.innerHTML = "";
    for (const k in dotMap) delete dotMap[k];
    paul = null;
    ringEl = null;
  }

  function addCity(id: CityId): void {
    const p = CITIES[id];
    const g = ce("g", {}) as SVGGElement;
    const core = ce("circle", { cx: p.x, cy: p.y, r: 7, class: "dot-core", fill: "var(--cream)", "fill-opacity": .55, stroke: "#5c3e06", "stroke-width": 2.5 });
    let tx = p.x, ty = p.y + 4, anc = "start";
    if (p.dir === "left") { tx = p.x - 13; anc = "end"; }
    else if (p.dir === "right") { tx = p.x + 13; }
    else if (p.dir === "top") { ty = p.y - 12; anc = "middle"; }
    else { ty = p.y + 19; anc = "middle"; }
    const lab = ce("text", { x: tx, y: ty, "text-anchor": anc, class: "city-label" + (deps.isChallenge() ? " hide" : "") });
    lab.textContent = p.zh;
    const hit = ce("circle", { cx: p.x, cy: p.y, r: 18, fill: "transparent", class: "dot-hit" });
    hit.addEventListener("click", () => deps.onCityClick(id));
    g.append(core, lab, hit);
    dots.appendChild(g);
    dotMap[id] = { g, core, lab };
  }

  function markVisited(id: CityId): void {
    const d = dotMap[id];
    if (!d) return;
    d.core.setAttribute("fill", "var(--gold-bright)");
    d.core.setAttribute("fill-opacity", "1");
    d.core.setAttribute("r", "8");
    d.lab.classList.add("on");
    d.lab.classList.remove("hide");
  }

  function shake(id: CityId): void {
    const d = dotMap[id];
    if (!d) return;
    d.g.classList.remove("shakeg");
    void d.g.getBBox();
    d.g.classList.add("shakeg");
    setTimeout(() => d.g.classList.remove("shakeg"), 450);
  }

  function placePaul(id: CityId): void {
    const p = CITIES[id];
    marker.innerHTML = "";
    const g = ce("g", { transform: `translate(${p.x},${p.y})` });
    g.innerHTML = `<circle cx="0" cy="-23" r="9" fill="#b23b22" opacity=".25"><animate attributeName="r" values="8;22" dur="1.6s" repeatCount="indefinite"/><animate attributeName="opacity" values=".5;0" dur="1.6s" repeatCount="indefinite"/></circle><path d="M0 0 C-13 -19 -14 -31 0 -35 C14 -31 13 -19 0 0 Z" fill="#b23b22" stroke="#fbf4e2" stroke-width="2.6"/><circle cx="0" cy="-23" r="6.4" fill="#fbf4e2"/><text x="0" y="-44" text-anchor="middle" font-size="13" font-weight="800" fill="#fff" paint-order="stroke" stroke="#b23b22" stroke-width="3.4" stroke-linejoin="round">保羅</text>`;
    marker.appendChild(g);
    paul = g;
  }

  function movePaul(id: CityId, cb?: () => void): void {
    const p = CITIES[id];
    const g = paul;
    if (!g) return;
    const m = g.getAttribute("transform")?.match(/translate\(([-\d.]+),([-\d.]+)\)/);
    if (!m) return;
    const x0 = +m[1], y0 = +m[2];
    if (deps.reduceMotion()) {
      g.setAttribute("transform", `translate(${p.x},${p.y})`);
      cb?.();
      return;
    }
    const t0 = performance.now(), dur = 700;
    (function an(now: number) {
      const k = Math.min(1, (now - t0) / dur);
      const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      g.setAttribute("transform", `translate(${x0 + (p.x - x0) * e},${y0 + (p.y - y0) * e})`);
      if (k < 1) requestAnimationFrame(an);
      else cb?.();
    })(t0);
  }

  function drawRoute(aId: CityId, bId: CityId, sea: boolean, anim: boolean): void {
    const a = CITIES[aId], b = CITIES[bId];
    routes.appendChild(ce("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: "#5c3e06", "stroke-width": sea ? 6 : 7.5, "stroke-linecap": "round", opacity: .3 }));
    const line = ce("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: "#d9a441", "stroke-width": sea ? 4 : 5.5, "stroke-linecap": "round" });
    routes.appendChild(line);
    if (sea) line.setAttribute("stroke-dasharray", "3 11");
    if (anim && !deps.reduceMotion()) {
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      line.setAttribute("stroke-dasharray", String(len));
      line.setAttribute("stroke-dashoffset", String(len));
      const t0 = performance.now(), dur = 680;
      (function an(now: number) {
        const k = Math.min(1, (now - t0) / dur);
        line.setAttribute("stroke-dashoffset", String(len * (1 - k)));
        if (k < 1) requestAnimationFrame(an);
        else if (sea) line.setAttribute("stroke-dasharray", "3 11");
        else line.removeAttribute("stroke-dasharray");
      })(t0);
    }
  }

  function ring(id: CityId): void {
    clearRing();
    const p = CITIES[id];
    const c = ce("circle", { cx: p.x, cy: p.y, r: 14, fill: "none", stroke: "#d4502f", "stroke-width": 3 });
    c.innerHTML = '<animate attributeName="r" values="11;24" dur="1s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0" dur="1s" repeatCount="indefinite"/>';
    dots.appendChild(c);
    ringEl = c;
  }

  function clearRing(): void {
    if (ringEl) { ringEl.remove(); ringEl = null; }
  }

  function paulXY(): ScreenPoint {
    const g = paul;
    if (!g) return { x: 0, y: 0 };
    const m = g.getAttribute("transform")?.match(/translate\(([-\d.]+),([-\d.]+)\)/);
    if (!m) return { x: 0, y: 0 };
    const pt = svgEl.createSVGPoint();
    pt.x = +m[1];
    pt.y = +m[2] - 30;
    const sp = pt.matrixTransform(svgEl.getScreenCTM()!);
    return { x: sp.x, y: sp.y };
  }

  return { show, after, fit, reset, addCity, markVisited, shake, placePaul, movePaul, drawRoute, ring, clearRing, paulXY };
}
