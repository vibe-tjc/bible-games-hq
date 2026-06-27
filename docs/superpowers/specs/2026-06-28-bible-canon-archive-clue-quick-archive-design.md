# 經卷歸檔 — 背景線索 ＋ 快速歸檔 設計

日期：2026-06-28
範圍：`src/data/bibleCanon.ts`、`src/screens/BibleCanonArchivePage.tsx`、`src/styles.css`

## 背景與目標

`bible-canon-archive`（經卷歸檔）是一款分類牌局：玩家把打散的聖經 66 卷，依分類拖曳／點選歸入正確書架。目前每卷有 `theme`（主題摘要），玩家可點卡片「卷」鈕在 modal 查看。

本次新增兩項功能：

1. **背景線索**：在 modal 主題之外，補上更明確、容易聯想分類的背景訊息（如「帖撒羅尼迦是羅馬時代重要的商業大城」），幫助玩家由名稱／背景推出分類。
2. **快速歸檔**：提供教學用的一鍵歸檔，讓老師上課時可帶過／跳過部分歸檔。採 A＋C 兩種：
   - A：一鍵歸檔目前手牌。
   - C：一鍵歸檔全部剩餘並直接結算。

## 功能一：背景線索（clue）

### 資料模型（`src/data/bibleCanon.ts`）

- `CanonBook` 型別新增可選欄位 `clue?: string`。
- 內部 books 元組型別由 `[string, string, CanonCategoryId, string]` 擴充為 `[string, string, CanonCategoryId, string, string?]`（第 5 個元素 `clue` 可省略）。
- `canonBooks.map` 解構為 `[abbr, name, cat, theme, clue]`，並把 `clue` 帶入回傳物件（未提供時為 `undefined`）。

### 撰寫範圍（選擇性）

只針對「靠名稱／背景較好猜分類」的卷填寫，其餘 `clue` 留空：

- **新約書信全部（21 卷）**：
  - 保羅書信（羅、林前、林後、加、弗、腓、西、帖前、帖後、提前、提後、多、門）——線索點出「保羅寫給某地教會或某位同工的信」，地名類補上城市背景（如帖撒羅尼迦＝馬其頓首府、羅馬時代重要商業大城）。
  - 普通書信（來、雅、彼前、彼後、約一、約二、約三、猶）——線索點出「以作者／對象命名（彼得、約翰、雅各、猶大、希伯來信徒）」，與保羅書信「以收信地命名」對照。
- **舊約以人名命名的歷史書（6 卷）**：約書亞記、路得記、撒母耳記上、撒母耳記下、以斯拉記、尼希米記、以斯帖記——線索點出「以主角人物為名的歷史記載」。

合計約 27 卷有線索。其餘各卷不變。

### 呈現（modal）

- 在 `canon-modal-theme` 區塊**下方**、`canon-modal-src` 上方，新增 `canon-modal-clue` 區塊。
- 僅當 `modalBook.clue` 存在時才渲染。
- 文案標題「📍 背景小提示」，沿用既有 dashed 分隔線與羊皮紙配色（`src/styles.css` 新增 `.canon-modal-clue` 樣式，比照 `.canon-modal-theme`）。
- 打開 modal（點「卷」鈕）即可見，不加額外揭露門檻。

## 功能二：快速歸檔（教學工具）

### UI

在 header 既有「💡 提示」「↺ 重新開始」旁新增兩顆按鈕，沿用 `.canon-btn` 樣式（header 已 `flex-wrap`，可自動換行）：

- 「⏩ 歸檔手牌」→ `archiveHand()`
- 「⏭ 全部歸檔」→ `archiveAll()`

### `archiveHand()`（A）

- `finished` 時不作用。
- 把目前 `hand` 每張依 `categoryOf(book, mode)` 放入對應 pile（一律正確，**不計 `misses`、不計 `hints`**）。
- 全部標記為 `revealed`。
- 從 `deck` 補滿手牌至 `HAND_SIZE`：新手牌 = `deck.slice(0, HAND_SIZE)`，新牌堆 = `deck.slice(HAND_SIZE)`。
- 觸發既有 sparkle，toast 顯示「已快速歸檔 N 卷」（N＝本次歸檔張數）。
- 計算 `nextDone = totalDone + hand.length`；若 `nextDone === BOOK_TOTAL`（手牌與牌堆皆空），則 `setFinished(true)`、停錶，0.6s 後 `setShowWin(true)`。
- 設定 `usedQuickArchive = true`。

### `archiveAll()`（C）

- `finished` 時不作用。
- `remaining = [...hand, ...deck]`，每張依 `categoryOf` 歸位。
- 清空 `hand`、`deck`；全部 `revealed`。
- `setFinished(true)`、停錶（`elapsedMs`），0.6s 後 `setShowWin(true)`。
- 設定 `usedQuickArchive = true`。

### 狀態

- 新增 `usedQuickArchive` 布林狀態。
- `startGame()` 重設為 `false`。
- 結算畫面（`showWin`）若 `usedQuickArchive` 為真，於統計列附一行小字「（含快速歸檔）」，避免用時／失誤被誤讀為全程手動成績。

## 不在範圍內（YAGNI）

- 不做卡片飛行動畫，沿用既有 sparkle。
- 不改既有拖曳／點選歸檔邏輯與其他模式設定。
- 不為全部 66 卷補線索。

## 驗證

- `npm run build`（TypeScript 編譯）通過，無型別錯誤。
- 手動：開啟經卷歸檔 → 點書信類卡片「卷」鈕，確認「📍 背景小提示」顯示；非範圍卷不顯示該區塊。
- 手動：點「⏩ 歸檔手牌」，手牌正確歸位並補滿、失誤數不變；牌堆耗盡時可正常進結算。
- 手動：點「⏭ 全部歸檔」，直接進結算，且結算列顯示「（含快速歸檔）」。
