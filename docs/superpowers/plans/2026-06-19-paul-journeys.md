# 保羅宣道旅程 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把獨立的 HTML 遊戲「保羅宣道大冒險」整合進 Bible Games HQ React 專案,成為 `/games/paul-journeys` 路由的一個遊戲。

**Architecture:** 命令式核心 + React 外殼。React 頁面 (`PaulJourneysPage`) 渲染靜態 HUD/地圖容器 JSX,並在 effect 中建立一個封裝了所有遊戲狀態與 DOM/SVG 操作的引擎實例(`createPaulGame(root)`);引擎透過 **root 範圍內的 querySelector**(非 document 全域)操作 DOM。真實地圖以 maplibre-gl(專案既有依賴)取代原作的 Leaflet。沿用 `JesusMinistryMapPage` 操作 maplibre 的 effect/refs pattern。

**Tech Stack:** React 19、TypeScript、Vite、TanStack Router、maplibre-gl、SVG、Web Audio API、Canvas(彩帶)。

**來源檔案:** `.context/attachments/JGrBEG/paul-journeys-dual.html`(下稱「來源」)。多數遊戲邏輯為此檔案的忠實移植;本計畫對每個需要修改之處給出明確指示,其餘為逐字移植並標註來源行號。

## Global Constraints

- 純中文 UI,沿用來源的所有中文字串。
- 視覺風格保留羊皮紙古地圖風;所有遊戲 CSS 必須**命名空間化於 `.paul-game` 容器之下**,不得污染專案全域 `src/styles.css` 的淡綠主題或既有 `.real-map-*` 樣式。
- 真實地圖一律使用 maplibre-gl + `https://tiles.openfreemap.org/styles/bright`,**不得**引入 Leaflet 或任何 CDN 動態載入。
- **移除**手繪地圖的海怪裝飾(來源 `buildBG` 內的 `monster` 變數及其使用)。
- 遊戲狀態封裝在引擎實例,**不得**使用模組層級的 `let` 全域可變變數。
- 引擎只透過傳入的 root 元素做 scoped 查詢,**不得**使用 `document.querySelector` / 全域 `$`。
- 卸載時必須清理 maplibre 實例、所有 `requestAnimationFrame`、`setTimeout`、AudioContext,避免重複掛載洩漏。
- 保留 `@media (prefers-reduced-motion: reduce)` 行為。
- 每個 task 結束須通過 `npm run check`(tsc)與 `npm run lint`(oxlint)。
- 縮排與格式遵循 oxfmt(2 空白縮排,雙引號)。

---

### Task 1: 資料與型別 (`paulJourneys.ts`)

把來源的城市表 `P`(來源 165–193 行)與三趟旅程 `JOURNEYS`(來源 196–245 行)抽成獨立資料模組並加上 TS 型別。

**Files:**
- Create: `src/data/paulJourneys.ts`

**Interfaces:**
- Produces:
  ```ts
  export type CityDir = "top" | "bottom" | "left" | "right";
  export type City = {
    zh: string; en: string;
    x: number; y: number;      // 手繪地圖 viewBox 0 0 1200 760 座標
    lat: number; lng: number;  // 真實地圖經緯度
    reg: string; dir: CityDir; // dir 為地名標籤相對圓點的方位
  };
  export type LegKind = "start" | "land" | "sea";
  export type Stop = { p: CityId; leg: LegKind; ref: string; ft: string };
  export type Journey = {
    id: number; title: string; ref: string; desc: string;
    route: string; verse: string; stops: Stop[];
  };
  export type CityId = keyof typeof CITIES;
  export const CITIES: Record<string, City>;
  export const JOURNEYS: Journey[];
  ```
  > 注意:來源變數名為 `P` 與 `JOURNEYS`。本專案改名 `CITIES`(語意清楚),`JOURNEYS` 維持。`CityId` 由 `CITIES` 的 key 推導。

- [ ] **Step 1: 建立資料檔**

從來源 165–193 行複製 `P` 的內容作為 `CITIES` 的值;從來源 196–245 行複製 `JOURNEYS`。加上上述型別。`stops` 內每筆的 `p` 欄位型別為 `CityId`。

檔案骨架(值的部分逐字取自來源,以下僅示意前後與型別,中間城市/旅程資料完整保留):

```ts
export type CityDir = "top" | "bottom" | "left" | "right";

export type City = {
  zh: string;
  en: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
  reg: string;
  dir: CityDir;
};

export const CITIES = {
  antioch: { zh: "安提阿", en: "Antioch", x: 1083, y: 378, lat: 36.2, lng: 36.16, reg: "敘利亞", dir: "top" },
  // … 來源 167–192 行其餘 26 座城市,逐字移植,欄位順序不限,dir 值需為 CityDir 之一 …
  jerusalem: { zh: "耶路撒冷", en: "Jerusalem", x: 1019, y: 644, lat: 31.78, lng: 35.21, reg: "猶太", dir: "left" },
} satisfies Record<string, City>;

export type CityId = keyof typeof CITIES;

export type LegKind = "start" | "land" | "sea";
export type Stop = { p: CityId; leg: LegKind; ref: string; ft: string };
export type Journey = {
  id: number;
  title: string;
  ref: string;
  desc: string;
  route: string;
  verse: string;
  stops: Stop[];
};

export const JOURNEYS: Journey[] = [
  // … 來源 197–244 行三趟旅程,逐字移植,stops[].p 對應 CityId …
];
```

- [ ] **Step 2: 驗證型別**

Run: `npm run check`
Expected: PASS(無型別錯誤;若 `dir` 或 `leg` 字串有 typo 會在此被抓出)

- [ ] **Step 3: Commit**

```bash
git add src/data/paulJourneys.ts
git commit -m "feat(paul-journeys): add cities and journeys data with types"
```

---

### Task 2: Renderer 介面與共用型別 (`paul-journeys/types.ts`)

定義兩個 renderer 共用的介面,讓遊戲引擎與底圖種類解耦。

**Files:**
- Create: `src/screens/paul-journeys/types.ts`

**Interfaces:**
- Consumes: `CityId` from `src/data/paulJourneys.ts`
- Produces:
  ```ts
  export type ScreenPoint = { x: number; y: number };
  export interface Renderer {
    show(): void;
    after(): void;
    fit(ids: CityId[]): void;
    reset(): void;
    addCity(id: CityId): void;
    markVisited(id: CityId): void;
    shake(id: CityId): void;
    placePaul(id: CityId): void;
    movePaul(id: CityId, cb?: () => void): void;
    drawRoute(a: CityId, b: CityId, sea: boolean, anim: boolean): void;
    ring(id: CityId): void;
    clearRing(): void;
    paulXY(): ScreenPoint;
  }
  // renderer 工廠所需的共用相依
  export type RendererDeps = {
    root: HTMLElement;            // 遊戲根容器(scoped 查詢用)
    onCityClick: (id: CityId) => void;
    isChallenge: () => boolean;   // 是否挑戰模式(隱藏未抵達地名)
    reduceMotion: () => boolean;  // prefers-reduced-motion
  };
  ```

- [ ] **Step 1: 建立型別檔**

依上述 Interfaces 區塊完整寫出 `types.ts`,從 `../../data/paulJourneys` 匯入 `CityId`。

- [ ] **Step 2: 驗證**

Run: `npm run check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/screens/paul-journeys/types.ts
git commit -m "feat(paul-journeys): add shared Renderer interface"
```

---

### Task 3: 手繪 SVG 地圖 renderer (`svgRenderer.ts`)

把來源的 `buildBG`(262–280 行,**移除 monster**)、`cat`/`mtn`/`tree`(255–261 行)、`svgR` 物件(294–326 行)移植成一個工廠函式,實作 `Renderer`,並以 scoped 查詢取代全域 `$`。

**Files:**
- Create: `src/screens/paul-journeys/svgRenderer.ts`

**Interfaces:**
- Consumes: `Renderer`, `RendererDeps`, `ScreenPoint` from `./types`;`CITIES`, `CityId` from `../../data/paulJourneys`
- Produces:
  ```ts
  // svgEl 為頁面中的 <svg> 元素(viewBox 0 0 1200 760)
  export function createSvgRenderer(svgEl: SVGSVGElement, deps: RendererDeps): Renderer;
  ```

- [ ] **Step 1: 移植幾何與背景工具**

把來源 247–280 行的常數(`GREECE`、`ANATOLIA`、`CYPRUS`、`SAMO`、`LESBOS`、`CRETE`、`AFRICA`)與函式(`cat`、`mtn`、`tree`)移到本檔(模組私有)。`NS` 與 `ce` helper 也移植(來源 160–162 行的 `ce`),`ce` 改為本檔私有函式:
```ts
const NS = "http://www.w3.org/2000/svg";
function ce(tag: string, attrs: Record<string, string | number> = {}): SVGElement {
  const el = document.createElementNS(NS, tag);
  for (const k in attrs) el.setAttribute(k, String(attrs[k]));
  return el;
}
```

`buildBG` 移植時:
- 把所有 `$("#map")` 改為傳入的 `svgEl`。
- **刪除** `monster` 變數宣告(來源 269 行)與其在 `g.innerHTML` 模板字串中的 `${monster}` 使用(來源 276 行)。
- 其餘(海浪、指南針 `comp`、船 `ship`、樹、山、地區標籤、陸地)逐字保留。

- [ ] **Step 2: 移植 renderer 物件為工廠**

把來源 `svgR`(294–326 行)改寫為 `createSvgRenderer(svgEl, deps)`,回傳實作 `Renderer` 的物件。逐項對應,差異如下:
- `show()`:來源切換 `#map`/`#leaf` 顯示。改為操作 `svgEl` 與透過 `deps.root` 找到 leaf 容器:`svgEl.style.display = "block"`;`(deps.root.querySelector(".paul-leaf") as HTMLElement).style.display = "none"`。
- 所有 `$("#routes")`、`$("#dots")`、`$("#marker")` 改為對 `svgEl` 內的子群組查詢(這些群組在 `buildBG` 末尾 277–279 行建立);保留參考於閉包變數。
- `addCity(id)`:`P[id]` → `CITIES[id]`;`challenge` 旗標 → `deps.isChallenge()`;`hit.addEventListener("click", ()=>onClick(id))` → `deps.onCityClick(id)`。
- `REDUCE()` → `deps.reduceMotion()`(來源 314、320 行)。
- `paulXY()`:保留 `getScreenCTM` 量測邏輯(來源 325 行),`$("#map")` → `svgEl`。
- `fit()`、`after()` 維持空實作(來源 297–298 行)。

工廠開頭先呼叫 `buildBG`(若尚未建立),並快取 routes/dots/marker 群組:
```ts
export function createSvgRenderer(svgEl: SVGSVGElement, deps: RendererDeps): Renderer {
  buildBG(svgEl); // 建立背景與 #routes/#dots/#marker 三個群組(改用 class 命名以免 id 衝突)
  const routes = svgEl.querySelector(".pg-routes") as SVGGElement;
  const dots = svgEl.querySelector(".pg-dots") as SVGGElement;
  const marker = svgEl.querySelector(".pg-marker") as SVGGElement;
  // … dots 快取、paul、ring 等閉包狀態 …
  return { show, after, fit, reset, addCity, markVisited, shake, placePaul, movePaul, drawRoute, ring, clearRing, paulXY };
}
```
> 注意:把來源用 `id="routes"/"dots"/"marker"` 的三個 `<g>` 改成 `class="pg-routes"/"pg-dots"/"pg-marker"`(來源 278 行),避免多實例或與專案其他元素 id 衝突。`buildBG` 內最後 append 這三個群組時改用 class。

- [ ] **Step 3: 驗證**

Run: `npm run check && npm run lint`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/screens/paul-journeys/svgRenderer.ts
git commit -m "feat(paul-journeys): port hand-drawn SVG map renderer (no sea monster)"
```

---

### Task 4: 真實地圖 renderer (`mapRenderer.ts`,maplibre-gl)

把來源 Leaflet 的 `leafR`(329–357 行)與相關初始化(`ensureLeaflet`/`initLeaf`,360–373 行)改寫為 maplibre-gl 實作,沿用 `JesusMinistryMapPage` 的做法。

**Files:**
- Create: `src/screens/paul-journeys/mapRenderer.ts`

**Interfaces:**
- Consumes: `Renderer`, `RendererDeps`, `ScreenPoint` from `./types`;`CITIES`, `CityId` from `../../data/paulJourneys`;`maplibre-gl`
- Produces:
  ```ts
  // container 為真實地圖的 div;onReady 在地圖 style 載入後呼叫;onError 在 WebGL/初始化失敗時呼叫
  export function createMapRenderer(
    container: HTMLElement,
    deps: RendererDeps,
    callbacks: { onReady: () => void; onError: () => void },
  ): Renderer;
  ```

- [ ] **Step 1: 建立 maplibre renderer**

關鍵移植對應(Leaflet → maplibre):
- 初始化:`new maplibregl.Map({ container, style: "https://tiles.openfreemap.org/styles/bright", center: [30, 38], zoom: 6, minZoom: 5, maxZoom: 9 })`;try/catch 失敗呼叫 `callbacks.onError()`。
- `addCity(id)`:用 `new maplibregl.Marker({ element, anchor: "center" }).setLngLat([c.lng, c.lat]).addTo(map)`。`element` 是一個 `div.pin`(沿用來源 33–44 行的 pin HTML 結構與 class:`.pin > .dot + .lbl.<dir>`),`challenge` 時加 `nolabel`。綁定 `element.addEventListener("click", () => deps.onCityClick(id))`。
- `markVisited(id)`:對該 marker 的 `.pin` 元素 `classList.add("visited")`、移除 `nolabel`。
- `shake(id)`:對 `.pin` 重播 `shake` 動畫(來源 340 行邏輯)。
- `placePaul(id)`:移除舊 paul marker,新增一個 `div.paul`(來源 `PAUL_SVG_HTML` 287 行 + ring + ptag,來源 342 行結構),`interactive:false`。
- `movePaul(id, cb)`:以 `requestAnimationFrame` 內插經緯度,套用來源 345 行的 easing(`k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2`),700ms;`deps.reduceMotion()` 時直接 setLngLat。用 `marker.setLngLat(...)`。
- `drawRoute(a, b, sea, anim)`:用 GeoJSON LineString 圖層繪製。為每段建立獨立 source/layer(id 以遞增序號避免衝突),底線一層(深色 weight 大)+ 主線一層(金色)。海路設定 `line-dasharray`。`anim` 時可用簡化處理:直接畫出(maplibre 的 line-dashoffset 動畫較複雜,動畫非必要時可僅淡入,reduceMotion 時無動畫)。記錄所有 layer/source id 以便 `reset()` 移除。
  > 參考 `JesusMinistryMapPage.tsx:615-651` 的 `addMinistryRoute`(GeoJSON line layer 寫法)與 dasharray paint 屬性。
- `ring(id)` / `clearRing()`:用一個 `maplibregl.Marker`(含 CSS 脈動圓環的 div)或 circle layer 標出目標位置。沿用既有 `.paul-game` 命名空間下的 ring 樣式。
- `fit(ids)`:用 `maplibregl.LngLatBounds` + `map.fitBounds(bounds, { padding: 70, maxZoom: 8 })`。參考 `JesusMinistryMapPage.tsx:693-707` 的 `fitStops`。
- `after()`:`map.resize()`(對應 Leaflet 的 `invalidateSize`)。
- `paulXY()`:`const p = map.project(paulMarker.getLngLat()); const r = container.getBoundingClientRect(); return { x: p.x + r.left, y: p.y + r.top - 30 };`
- `show()`:`container.style.display = "block"`;隱藏 svg(由引擎切換負責,renderer 只負責自己的容器顯示)。
- 地圖 `style.load` 後呼叫 `callbacks.onReady()`(引擎據此 rebuildScene)。

- [ ] **Step 2: 匯入 maplibre CSS**

確認 `maplibre-gl/dist/maplibre-gl.css` 已被專案匯入。檢查:

Run: `grep -rn "maplibre-gl.css" src/`
- 若已存在(`JesusMinistryMapPage` 或 `main.tsx` 已匯入),不需再加。
- 若不存在,於 `mapRenderer.ts` 頂部加入 `import "maplibre-gl/dist/maplibre-gl.css";`

- [ ] **Step 3: 驗證**

Run: `npm run check && npm run lint`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/screens/paul-journeys/mapRenderer.ts
git commit -m "feat(paul-journeys): add maplibre-gl real-map renderer"
```

---

### Task 5: 遊戲引擎 (`game.ts`)

把來源的遊戲狀態與所有流程(START/SUCCESS/FAIL/HINT/WIN/LOG/SOUND/HUD/DIALOG、地圖切換)封裝成一個工廠 `createPaulGame(root)`,狀態為實例欄位。

**Files:**
- Create: `src/screens/paul-journeys/game.ts`

**Interfaces:**
- Consumes: `Renderer`, `RendererDeps` from `./types`;`createSvgRenderer` from `./svgRenderer`;`createMapRenderer` from `./mapRenderer`;`CITIES`, `JOURNEYS`, `CityId`, `Journey`, `Stop` from `../../data/paulJourneys`
- Produces:
  ```ts
  export type PaulGame = {
    start(): void;     // 顯示旅程選單(初始狀態)
    destroy(): void;   // 清理 raf/timeout/maplibre/audio
  };
  export function createPaulGame(root: HTMLElement): PaulGame;
  ```

- [ ] **Step 1: 建立引擎骨架與狀態**

實例欄位取代來源 283–285 行的全域:`J`(目前旅程 `Journey | null`)、`cur`、`miss`、`hintsUsed`、`score`、`combo`、`challenge`、`soundOn`、`mapMode`(`"svg" | "real"`)、`R`(目前 renderer)、`logRows: Stop[]`、以及 `svgRenderer`/`mapRenderer` 參考。

scoped 查詢 helper(取代來源全域 `$`):
```ts
const $ = <T extends Element = HTMLElement>(sel: string) => root.querySelector(sel) as T | null;
```

追蹤需清理的資源:`const timers = new Set<number>()`、`const rafs = new Set<number>()`,包裝 `setTimeout`/`requestAnimationFrame` 以便 `destroy()` 全清。AudioContext 於 `destroy()` 呼叫 `actx?.close()`。

- [ ] **Step 2: 移植音效**

移植來源 290–291 行的 `tone`/`sOK`/`sNo`/`sWin`,`soundOn` 改為實例欄位,`actx` 為實例欄位。

- [ ] **Step 3: 移植 renderer 建立與地圖切換**

- 建立 svg renderer:`createSvgRenderer(svgEl, rendererDeps)`,`svgEl = $("svg.paul-map")`。
- `rendererDeps`:`{ root, onCityClick: (id) => this.onClick(id), isChallenge: () => this.challenge, reduceMotion: REDUCE }`(`REDUCE` 同來源 286 行)。
- maplibre renderer 延後建立:第一次切到真實地圖時才 `createMapRenderer(leafEl, deps, { onReady, onError })`,`leafEl = $(".paul-leaf")`。
- `toggleMap()`:移植來源 375–388 行邏輯,但 ensureLeaflet → 直接建立/重用 maplibre renderer;`onError` 時 `setQuest("真實地圖需要 WebGL / 網路,已留在繪製地圖。", true)` 並維持 svg。
- `rebuildScene()`:移植來源 389–397 行(reset → addCity 去重 → markVisited 已抵達 → drawRoute 已連 → placePaul → fit)。`P` → `CITIES`,`J.stops` 照舊。
- `updateMapBtn()`:移植 374 行,操作 `$("#bMap")`(改 scoped)。

- [ ] **Step 4: 移植遊戲流程**

移植以下函式為引擎方法,`$` 改 scoped、`P`→`CITIES`、`REDUCE`→實例、計時器/raf 用包裝版:
- `startJourney(ji)`(400–407 行)、`buildDots`/`paintDots`(408–409)、`reached`(410)。
- `onClick(id)`(411–412)、`success(idx)`(413–420)、`fail(id,tgt)`(421)。
- `kmBetween`(422)、`hintText`(423–431)。
- HUD:`setQuestRaw`(434)、`setQuest`(435–437)、`updateScore`(438)、`starCount`(439)、`floatPts`(440)、`showCombo`(441)、`flash`(442)。`floatPts`/`showCombo` 中 append 到 `$("#stage")`/`$("#combo")` 改 scoped。
- 對話框/勝利/記錄:`showDlg`(445)、`hideDlg`(446)、`win`(447–453)、`burst`(454–456)、`openMenu`(457)、`openLog`(458)、`buildJsel`(461)。

`win()` 內 `$("#winReplay").onclick` 等綁定改 scoped。彩帶 `burst` 的 raf 用包裝版以便清理。

- [ ] **Step 5: 移植初始化與事件綁定為 `start()`**

把來源 `window.addEventListener("load", ...)`(462–471 行)的內容搬進引擎:`buildJsel`、`R=svgRenderer`、`show`、`updateMapBtn`、各按鈕 `onclick`(`#bMap`/`#dCont`/`#bMenu`/`#bRe`/`#bLog`/`#logClose`/`#bHint`/`#bSound`)綁定,全部 scoped。resize 監聽:`window.addEventListener("resize", onResize)`,`onResize` 在 mapMode==="real" 時呼叫 `mapRenderer.after()`;記得在 `destroy()` 移除。

`destroy()`:移除 resize 監聽、清空 `timers`/`rafs`、`mapRenderer?.destroy?.()`(maplibre `map.remove()`)、`actx?.close()`。

- [ ] **Step 6: 驗證**

Run: `npm run check && npm run lint`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/screens/paul-journeys/game.ts
git commit -m "feat(paul-journeys): port game engine with encapsulated state"
```

---

### Task 6: React 頁面外殼 (`PaulJourneysPage.tsx`)

渲染靜態 HUD/地圖 JSX(來源 124–157 行的 body 結構),在 effect 中建立引擎並於卸載時 destroy。頂部保留專案的返回首頁連結。

**Files:**
- Create: `src/screens/PaulJourneysPage.tsx`

**Interfaces:**
- Consumes: `createPaulGame` from `./paul-journeys/game`;`Link` from `@tanstack/react-router`
- Produces: `export function PaulJourneysPage(): JSX.Element`

- [ ] **Step 1: 建立頁面元件**

把來源 `#stage` 內的整個結構翻成 JSX,包在 `<section className="paul-game">` 內(命名空間根)。`<svg id="map">` → `<svg className="paul-map" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid meet" />`;`<div id="leaf">` → `<div className="paul-leaf" />`。HUD/對話框/overlay 的 id 保留(引擎用 scoped `$("#...")` 找,因為在 root 範圍內,id 仍可被 `querySelector` 命中;但要確保這些 id 不與專案他處衝突 —— 加前綴 `pg-` 較安全,例如 `#hudTL`→`#pgHudTL`)。

> 決策:為求穩妥,把來源所有 HUD/overlay 的 id 加上 `pg` 前綴(`bMap`→`pgMap`、`quest`→`pgQuest`、`dlg`→`pgDlg`、`startOv`→`pgStartOv` 等),並在 `game.ts` 的 scoped 查詢中使用同樣前綴。class(`.hud`/`.panel`/`.scorebox` 等)維持不變,因為它們已在 `.paul-game` 命名空間樣式下。

頂部加返回首頁(沿用專案 `.back-link` 樣式,參考 `JesusMinistryMapPage.tsx:290-293`):
```tsx
<Link to="/" className="back-link">
  <ArrowLeft aria-hidden="true" size={18} />
  回首頁
</Link>
```

effect:
```tsx
const rootRef = useRef<HTMLDivElement | null>(null);
useEffect(() => {
  if (!rootRef.current) return;
  const game = createPaulGame(rootRef.current);
  game.start();
  return () => game.destroy();
}, []);
```
`rootRef` 綁在 `.paul-game` 容器。

- [ ] **Step 2: 驗證**

Run: `npm run check && npm run lint`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/screens/PaulJourneysPage.tsx
git commit -m "feat(paul-journeys): add React page shell"
```

---

### Task 7: 樣式 (`paul-journeys.css`,命名空間化)

把來源 `<style>`(8–121 行)移植成命名空間化於 `.paul-game` 的 CSS。

**Files:**
- Create: `src/screens/paul-journeys/paul-journeys.css`
- Modify: `src/screens/PaulJourneysPage.tsx`(頂部 `import "./paul-journeys/paul-journeys.css";`)

- [ ] **Step 1: 移植並命名空間化 CSS**

- 把來源 `:root` 變數區塊(8–15 行)放在 `.paul-game { … }` 內(成為容器 scoped 的 CSS 變數),避免覆蓋全域。
- `html,body` 的 `overflow:hidden;height:100%`(17 行)**不要**全域套用;改為 `.paul-game` 容器自己處理:
  ```css
  .paul-game {
    position: relative;
    width: 100%;
    height: calc(100dvh - var(--paul-header-offset, 64px));
    overflow: hidden;
    background: #1c5462;
    color: var(--ink);
    font-family: var(--sans);
  }
  ```
- 來源所有選擇器加上 `.paul-game ` 前綴(例如 `#stage` → `.paul-game .pg-stage`,`.city-label` → `.paul-game .city-label`,`.pin` → `.paul-game .pin`,`#dlg` → `.paul-game #pgDlg`)。id 前綴對應 Task 6 的 `pg` 前綴決策。
- `#map`/`#leaf` → `.paul-game .paul-map` / `.paul-game .paul-leaf`。
- Leaflet 專屬樣式(`.leaflet-*`,21–23 行)**刪除**(改用 maplibre);改加 maplibre marker 容器不需特別樣式,pin/paul 樣式保留。
- 保留 media queries(119–120 行),選擇器同樣加 `.paul-game` 前綴。

- [ ] **Step 2: 匯入 CSS 並驗證**

在 `PaulJourneysPage.tsx` 頂部加 `import "./paul-journeys/paul-journeys.css";`

Run: `npm run check && npm run lint`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/screens/paul-journeys/paul-journeys.css src/screens/PaulJourneysPage.tsx
git commit -m "feat(paul-journeys): add namespaced parchment styles"
```

---

### Task 8: 路由與遊戲註冊

把遊戲接上路由與首頁列表。

**Files:**
- Modify: `src/router.tsx`
- Modify: `src/data/games.ts`

**Interfaces:**
- Consumes: `PaulJourneysPage` from `./screens/PaulJourneysPage`

- [ ] **Step 1: 註冊路由**

在 `src/router.tsx`:
- 頂部 import:`import { PaulJourneysPage } from "./screens/PaulJourneysPage";`
- 新增 route(仿 `jesusMinistryMapRoute`,無 search params):
  ```ts
  const paulJourneysRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/games/paul-journeys",
    component: PaulJourneysPage,
  });
  ```
- 加入 `routeTree`:在 `rootRoute.addChildren([...])` 陣列中加入 `paulJourneysRoute`。

- [ ] **Step 2: 新增首頁遊戲卡**

在 `src/data/games.ts`:
- import 增加一個地圖/羅盤系圖示:`import { Archive, Compass, HeartHandshake, Map, Mountain } from "lucide-react";`
- 在 `games` 陣列末端加入:
  ```ts
  {
    id: "paul-journeys",
    title: "保羅宣道旅程",
    description: "操作保羅依正確順序連出三次宣道旅程的路線，解鎖每一站的事蹟與經文，可切換手繪古地圖與真實地圖。",
    href: "/games/paul-journeys",
    icon: Compass,
    status: "ready",
  },
  ```

- [ ] **Step 3: 驗證**

Run: `npm run check && npm run lint`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/router.tsx src/data/games.ts
git commit -m "feat(paul-journeys): register route and home card"
```

---

### Task 9: 整合驗證與手動測試

此為視覺/互動遊戲,以建置與手動驗證確認端到端可用。

**Files:** 無(僅驗證;若發現問題回到對應 task 修正)

- [ ] **Step 1: 型別、lint、建置**

```bash
npm run check && npm run lint && npm run build
```
Expected: 三者皆成功。

- [ ] **Step 2: 手動驗證(`npm run dev` 後在瀏覽器)**

逐項確認(對照 spec 測試清單):
- [ ] 首頁出現「保羅宣道旅程」卡片,計數 +1,點進進入遊戲。
- [ ] 旅程選單顯示三趟旅程;選一趟可開始。
- [ ] 三趟旅程皆能依序連完並觸發勝利畫面(彩帶)。
- [ ] 連對加分、連擊 ×N 顯示、星等隨 miss/hint 變化。
- [ ] 點錯:晃動 + 紅光 + 方向距離提示;錯 3 次標出目標位置。
- [ ] 點已抵達的舊點:提示仍要找第幾站。
- [ ] 提示按鈕三階運作;挑戰模式隱藏未抵達地名。
- [ ] 「真實地圖 ↔ 繪製地圖」切換後,場景(城市/已連路線/保羅位置)正確重建;真實地圖為 maplibre + OpenFreeMap,**無 Leaflet**。
- [ ] 手繪地圖**無海怪**。
- [ ] 音效開關、旅程記錄、重來、選單、返回首頁皆正常。
- [ ] 離開頁面再進入,狀態乾淨(無殘留分數/路線),無 console 錯誤。
- [ ] 真實地圖在無 WebGL 環境顯示 fallback 並留在手繪地圖(可於支援的瀏覽器略過此項,信任 try/catch)。

- [ ] **Step 3: 更新 README 遊戲清單**

`README.md` 的「目前包含」清單加入一行:`- 保羅宣道旅程(互動地圖)`。

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: list Paul's journeys game in README"
```

---

## Self-Review

**Spec coverage:**
- 真實地圖改 maplibre → Task 4 ✓
- 保留羊皮紙風格、命名空間化 → Task 7 ✓
- 沉浸式容器(頁首以下) → Task 7 `.paul-game` 高度 + Task 6 返回連結 ✓
- 純中文 → 全程沿用來源字串 ✓
- 1:1 功能(三旅程/雙地圖/計分連擊星等/三階提示/挑戰/記錄/彩帶/音效) → Task 5 ✓
- 移除海怪 → Task 3 Step 2 ✓
- 命令式核心 + React 外殼 → Task 5 + Task 6 ✓
- 封裝狀態、scoped 查詢、卸載清理 → Task 5 Step 1/5 ✓
- 資料抽出 + TS 型別 → Task 1 ✓
- Renderer 介面解耦 → Task 2 ✓
- 路由 + games.ts 註冊 → Task 8 ✓
- WebGL fallback、AudioContext try/catch、清理 → Task 4/Task 5 ✓
- prefers-reduced-motion → Task 7 + `deps.reduceMotion()` ✓

**Placeholder scan:** 移植型 task 引用了來源明確行號 + 列出每處需修改點;無 "TBD/TODO/適當處理" 等空泛字眼。逐字移植的大段(資料、SVG 背景、流程)以行號 + 修改清單界定,屬具體可執行指示。

**Type consistency:** `createPaulGame`/`PaulGame`、`createSvgRenderer`/`createMapRenderer`、`Renderer`/`RendererDeps`/`ScreenPoint`、`CITIES`/`CityId`/`Journey`/`Stop` 在各 task 間命名一致。id 前綴 `pg` 在 Task 6/7 一致;群組 class `pg-routes/pg-dots/pg-marker` 在 Task 3/7 一致。
