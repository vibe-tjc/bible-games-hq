# 保羅宣道旅程 — 設計文件

日期:2026-06-19

## 目標

把新設計的互動遊戲「保羅宣道大冒險」(來源:`.context/attachments/JGrBEG/paul-journeys-dual.html`)整合進 Bible Games HQ 專案。玩家操作傳道者保羅,依正確順序連出保羅三次宣道旅程的路線;連對下一站得分並解鎖事蹟,連得越順、用越少提示,星等越高。同時提供「手繪古地圖」與「真實地圖」兩種底圖切換。

## 範圍決策

| 項目 | 決定 |
| --- | --- |
| 真實地圖引擎 | 改用專案既有的 **maplibre-gl + OpenFreeMap**,不引入 Leaflet 與 CDN 外部載入 |
| 視覺風格 | **保留**原作的羊皮紙/古地圖風(金色、緋紅、米色、襯線字、指南針),僅外層導覽與專案一致 |
| 容器 | 沉浸式:填滿專案頁首以下的整個可視區域,HUD 浮於地圖之上;保留專案頁首以便返回 |
| 語言 | **純中文**(忠於原作,不做中英雙語) |
| 功能範圍 | **1:1 保留**:三趟旅程、雙地圖切換、計分/連擊/星等、三階提示、挑戰模式(隱藏未抵達地名)、旅程記錄、完成慶祝(彩帶)、音效開關 |
| 例外 | **移除**手繪地圖上的海怪裝飾 |
| 架構 | **命令式核心 + React 外殼**(沿用 `JesusMinistryMapPage` 操作 maplibre 的 effect/refs pattern) |

## 架構

採「命令式核心 + React 外殼」。遊戲含 SVG path 動畫、`requestAnimationFrame`、DOM 量測(`getBBox`、`getScreenCTM`、`latLngToContainerPoint`),完全改寫成 React 狀態驅動風險高且失真;因此遊戲的繪製與互動維持命令式,封裝在 React 元件的 effect/refs 生命週期內 —— 這與現有 `JesusMinistryMapPage` 操作 maplibre 的方式一致。

### 檔案結構

```
src/data/paulJourneys.ts          # 城市資料 P、三趟旅程 JOURNEYS、TS 型別
src/screens/PaulJourneysPage.tsx  # React 頁面外殼:頁首下沉浸容器、初始化、卸載清理
src/screens/paul-journeys/
  game.ts        # 遊戲引擎:狀態機(目前旅程、進度、分數、連擊、提示、星等)、成功/失敗/提示/勝利流程、音效
  svgRenderer.ts # 手繪古地圖 renderer(實作共用 Renderer 介面)
  mapRenderer.ts # maplibre-gl 真實地圖 renderer(實作共用 Renderer 介面)
  types.ts       # Renderer 介面與共用型別
```

> 若 `game.ts` 因含 HUD/對話框/勝利畫面而過大,可再拆出 `hud.ts`;以「單一檔案聚焦單一職責」為原則,實作時視體積決定。

### Renderer 介面

兩個 renderer 實作同一介面,遊戲引擎不需知道底圖種類:

```ts
interface Renderer {
  show(): void;
  after(): void;                 // 切換後重新計算尺寸(maplibre invalidateSize 等)
  fit(ids: string[]): void;      // 把可見城市框進視野
  reset(): void;
  addCity(id: string): void;
  markVisited(id: string): void;
  shake(id: string): void;
  placePaul(id: string): void;
  movePaul(id: string, cb?: () => void): void;
  drawRoute(a: string, b: string, sea: boolean, anim: boolean): void;
  ring(id: string): void;
  clearRing(): void;
  paulXY(): { x: number; y: number };  // 浮動加分動畫的螢幕座標
}
```

`onCityClick(id)` 由引擎提供給兩個 renderer 綁定點擊。

### 真實地圖(maplibre-gl)移植要點

- 沿用 `OPENFREEMAP_STYLE_URL`(`https://tiles.openfreemap.org/styles/bright`)。
- 城市用自訂 HTML marker(沿用古地圖風的 pin 樣式)。
- 路線用 GeoJSON `LineString` 圖層;海路以 `line-dasharray` 呈現。逐段繪製,連對才新增該段。
- 保羅 marker 用 `easeTo`/marker 位移做移動動畫(以 `requestAnimationFrame` 內插經緯度,對齊原作 700ms easing)。
- `fitBounds` 取代 Leaflet 的 `fitBounds`。
- WebGL 不支援時顯示與 `JesusMinistryMapPage` 一致的 fallback 文案。

## 資料流

1. `PaulJourneysPage` 掛載 → 建立 SVG 容器與 maplibre 容器(後者延後到切換到真實地圖時才初始化)→ 建立遊戲引擎實例(預設 SVG renderer)→ 顯示旅程選單。
2. 玩家選旅程 → 引擎 `startJourney` 重設狀態、畫出城市與保羅起點、設定任務提示。
3. 玩家點城市 → 引擎判斷:
   - 正確(下一站):加分(連擊加成)、畫路線動畫、保羅移動、標記已抵達、彈出事蹟對話框、更新星等;若為最後一站 → 勝利畫面(彩帶)。
   - 已抵達的舊點:提示仍要找第幾站。
   - 錯誤:連擊歸零、晃動、紅光閃爍、方向距離提示;錯 3 次標出目標位置。
4. 切換地圖:`toggleMap` 切換 renderer,`rebuildScene` 依目前進度重畫城市/路線/保羅。

## 狀態管理

遊戲狀態(目前旅程、`cur` 進度、`miss`、`hintsUsed`、`score`、`combo`、`challenge`、`soundOn`、`mapMode`、`logRows`)封裝在引擎實例內,而非模組層級的全域可變變數(原作的全域 `let` 改為實例欄位),確保頁面重新掛載時乾淨重置、不殘留跨場次狀態。

## 路由與註冊

- `src/router.tsx`:新增 `/games/paul-journeys` 路由 → `PaulJourneysPage`。
- `src/data/games.ts`:新增遊戲卡(`id: "paul-journeys"`、標題「保羅宣道旅程」、適當描述、`lucide-react` 圖示如 `Compass` 或 `Navigation`、`status: "ready"`)。
- 首頁 `games.length` 會自動更新計數。

## 樣式

- 遊戲自帶的羊皮紙風 CSS 以**有命名空間的方式**併入(包在容器 class 如 `.paul-game` 之下,或維持 scoped class 名稱),避免污染專案全域 `styles.css` 的淡綠主題與既有 `.real-map-*` 等樣式。
- 沉浸容器:填滿 `100dvh - 頁首高度`,`overflow:hidden`,HUD `position:absolute` 浮層。
- 保留 `@media(prefers-reduced-motion:reduce)` 降低動畫。
- maplibre 必要的基底 CSS 透過既有依賴的 `maplibre-gl/dist/maplibre-gl.css` 匯入(若尚未匯入)。

## 錯誤處理

- maplibre 初始化失敗 / WebGL 不支援 → 顯示 fallback,並停留在手繪地圖。
- AudioContext 建立失敗 → 靜默忽略(同原作 try/catch)。
- 卸載時清除 maplibre 實例、marker、`requestAnimationFrame`、計時器,避免記憶體洩漏與重複掛載問題。

## 測試與驗證

此為視覺/互動遊戲,以手動驗證為主:

1. `npm run check`(tsc)、`npm run lint`(oxlint)通過。
2. `npm run dev` 後手動驗證:三趟旅程皆可完整連線完成;連對加分與連擊;錯誤提示與三階提示;挑戰模式隱藏地名;手繪↔真實地圖切換後場景正確重建;勝利彩帶;音效開關;返回首頁。
3. 真實地圖在無 WebGL 時顯示 fallback。
4. `npm run build` 成功。

## 非目標(YAGNI)

- 不做中英雙語。
- 不做分數持久化(localStorage 排行榜)。
- 不做跨裝置 / QR 多人(此遊戲為單人操作)。
- 不做海怪裝飾。
