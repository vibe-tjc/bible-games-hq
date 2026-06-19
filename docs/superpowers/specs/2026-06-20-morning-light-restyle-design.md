# 晨光（Morning Light）視覺語言改版 — 設計文件

日期：2026-06-20
範圍：全站共用層的**純視覺**改版（不改任何功能/邏輯）

## 目標

把參考設計圖「晨光」的視覺語言（冷調紙感背景、單一靜謐青綠 accent、襯線顯示字、
晨光暈染 hero、柔邊圓角卡片、膠囊 chip、柔和陰影）套用到現有站台的共用層，
取代現有的森林綠＋金色調，讓首頁與各遊戲頁的「外框與通用 UI」視覺一致。

## 不在範圍內（明確排除）

- 不新增功能模組（今日經文、讀經計畫、收藏、複製、toast 等一律不做）。
- 不改任何遊戲邏輯、`src/data/*`、`src/lib/*`、路由設定、元件 props 與行為。
- 自帶沉浸主題的遊戲畫面維持原樣：經卷歸檔（木質）、保羅旅程（羊皮紙／地圖）。
  它們使用各自 scoped 的 `--canon-*` 等 token，不受全域 token 變更影響。
- 不影響現有功能運作：頁籤切換、QR、地圖、配對等行為完全不變。

## 變更內容

### 1. 全域設計 token（`src/styles.css` `:root`）
沿用現有變數名稱，改其值，讓全站 `var(--…)` 自動套用：

| 變數 | 改為（晨光） |
|---|---|
| `--bg` | `oklch(98.5% 0.006 165)` 冷調近白 |
| `--surface` | `oklch(100% 0 0)` |
| `--surface-soft` | `oklch(99% 0.005 170)` / `--primary-soft` 對應淺青 |
| `--ink` | `oklch(26% 0.02 205)` |
| `--muted` | `oklch(52% 0.018 205)` |
| `--line` | `oklch(91% 0.012 175)`；另加 `--border-strong: oklch(85% 0.014 180)` |
| `--primary` / `--primary-strong` | `oklch(52% 0.072 188)` 靜謐青綠 |
| `--primary-soft` | `oklch(94% 0.03 185)` |
| `--accent` | 改為晨光暖光暈色 `oklch(90% 0.05 75)`（保留變數定義，供 hero 光暈與既有 3 處裝飾沿用，避免破壞） |
| 圓角 | 卡片 16px、小元件 10–11px、膠囊 999px |
| 陰影 | `--shadow` → 柔和 `0 1px 2px …/.04, 0 8px 24px …/.05` |

> `--accent` 全域僅 3 處裝飾性使用（progress 漸層、desire metric bar），改為暖光暈色不破版。

### 2. 字型
- 標題 `h1/h2/h3`：襯線顯示字
  `'Iowan Old Style','Source Han Serif TC','Noto Serif TC','PingFang TC',Georgia,serif`（系統／CJK 字型，免載 web font）。
- 內文：系統 sans 堆疊（沿用設計圖 `--font-body`）。

### 3. 頂部 header（`.site-header` / `router.tsx`）
sticky 玻璃導覽：半透明背景 ＋ `backdrop-filter` 模糊、底部細線、wordmark 用襯線字。
維持只放品牌（不加日期/連結）。結構若需微調僅限 className 與 wrapper，不動路由。

### 4. 首頁（`HomePage.tsx` + CSS）
- Hero：保留結構與文案，加 `--dawn` 暖光暈背景（模糊 radial 光斑）、襯線大標、eyebrow 加左右短線。
- 頁籤（聖經小遊戲／聖經資源）：功能與無障礙屬性不變，外觀改為晨光膠囊 chip。
- 遊戲卡片：16px 圓角、柔邊、hover 上浮＋柔和陰影、方形圓角 icon、底部箭頭 hover 右移。
- 「聖經資源」空狀態：改為晨光虛線 dashed 卡片風。

### 5. 共用元件（`Button` / `Card` / `Input` 樣式）
微調圓角、邊框、hover、focus 對齊晨光。**只改樣式，不改 props/行為。**

## 涉及檔案
- `src/styles.css`（主要）
- `src/screens/HomePage.tsx`（hero 光暈 DOM / className）
- `src/router.tsx`（header 結構微調，若需要）

## 驗證
- `pnpm run check`（tsc）與 `pnpm run lint` 通過。
- 實際開首頁與至少一個遊戲頁，確認版面正常、功能可用、沉浸主題遊戲未受影響。
