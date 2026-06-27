# 經卷歸檔 — 背景線索 ＋ 快速歸檔 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 為經卷歸檔遊戲加入「modal 背景線索」與「快速歸檔（歸檔手牌／全部歸檔）」兩項功能。

**Architecture:** 線索是資料層的可選欄位 `clue`，在 modal 條件式渲染；快速歸檔是 `BibleCanonArchivePage` 內兩個新 handler，重用既有 `categoryOf` / `placed` / `deck` / `hand` 狀態流，不改拖曳與點選歸檔邏輯。

**Tech Stack:** React 19 + TypeScript + Vite，套件管理用 pnpm；樣式為純 CSS（`src/styles.css`）。

## Global Constraints

- 套件管理器一律用 **pnpm**（建置腳本內含 `pnpm run`）。
- **不新增任何相依套件、不引入測試框架**；驗證關卡＝`pnpm run check`（tsc）＋ `pnpm run lint`（oxlint）＋ 瀏覽器手動確認。
- 每個任務結束前須 `pnpm run check` 與 `pnpm run lint` 皆通過。
- 既有拖曳／點選歸檔邏輯、其他遊戲模式設定不得更動。
- 文案一律繁體中文（zh-TW）。

---

### Task 1: 資料層新增 `clue` 欄位與內容

**Files:**
- Modify: `src/data/bibleCanon.ts`

**Interfaces:**
- Produces: `CanonBook.clue?: string`（供 Task 2 在 modal 讀取）。內部 books 元組型別擴充為 `[string, string, CanonCategoryId, string, string?]`。

- [ ] **Step 1: 型別新增可選欄位**

在 `CanonBook` type（約第 21-28 行）的 `theme: string;` 後加入一行：

```typescript
  clue?: string;
```

- [ ] **Step 2: 元組型別與 map 帶出 clue**

把 books 宣告（約第 48 行）的型別由：

```typescript
const books: Array<[string, string, CanonCategoryId, string]> = [
```

改為：

```typescript
const books: Array<[string, string, CanonCategoryId, string, string?]> = [
```

並把底部 `canonBooks` 的 map（約第 377 行）由：

```typescript
export const canonBooks: CanonBook[] = books.map(([abbr, name, cat, theme], order) => {
```

改為：

```typescript
export const canonBooks: CanonBook[] = books.map(([abbr, name, cat, theme, clue], order) => {
```

並在回傳物件（約第 384-392 行）的 `theme,` 後加入：

```typescript
    clue,
```

- [ ] **Step 3: 為指定卷加入第 5 個元素 `clue`**

對下列每一卷，在其陣列現有 `theme` 字串之後，補上一個逗號與線索字串作為第 5 個元素（其餘未列出的卷不動）。對照表（以 `abbr` 定位）：

| abbr | clue |
|------|------|
| 書 | 以帶領以色列人進迦南的領袖約書亞為名的歷史記載。 |
| 得 | 以外邦女子路得為名的故事，她是大衛王的曾祖母。 |
| 撒上 | 以先知撒母耳為名，記以色列由士師時代進入王國的歷史。 |
| 撒下 | 延續撒母耳記，記載大衛建立王朝的歷史。 |
| 拉 | 以文士以斯拉為名，記被擄之民歸回、重建聖殿的歷史。 |
| 尼 | 以省長尼希米為名，記歸回後重建耶路撒冷城牆的歷史。 |
| 斯 | 以猶大裔王后以斯帖為名，記神暗中保守百姓脫離滅族之禍。 |
| 羅 | 收信地是羅馬帝國的首都；保羅寫給當地教會、盼望前往探訪的信。 |
| 林前 | 哥林多是希臘亞該亞省繁華的港口商城，風氣放縱，教會問題不少。 |
| 林後 | 同樣寫給哥林多教會；是保羅與這間教會往來書信的續篇。 |
| 加 | 加拉太是小亞細亞中部的地區，保羅寫給那一帶的眾教會。 |
| 弗 | 以弗所是羅馬亞細亞省第一大城，有著名的亞底米女神大廟。 |
| 腓 | 腓立比是馬其頓的羅馬殖民城，是保羅在歐洲建立的第一間教會。 |
| 西 | 歌羅西是小亞細亞弗呂家的城市，保羅寫信防備當地的異端思想。 |
| 帖前 | 帖撒羅尼迦是馬其頓的首府、羅馬時代重要的商業大城。 |
| 帖後 | 同樣寫給帖撒羅尼迦教會，澄清關於主再來的誤解。 |
| 提前 | 收信人提摩太是保羅栽培的年輕同工，這是教導牧養的「教牧書信」。 |
| 提後 | 保羅殉道前寫給接棒人提摩太的最後囑咐。 |
| 多 | 收信人提多是保羅的同工，當時在克里特島牧養教會。 |
| 門 | 寫給弟兄腓利門的一封私人短信，為逃奴阿尼西母求情。 |
| 來 | 寫給信主的猶太（希伯來）人，勉勵在逼迫中不要退回舊約的禮儀。 |
| 雅 | 以作者雅各（主耶穌的兄弟）為名，不像保羅書信以收信地命名。 |
| 彼前 | 以作者使徒彼得為名，寫給分散各地、受苦的信徒。 |
| 彼後 | 同以使徒彼得為名，提醒防備假師傅、等候主再來。 |
| 約一 | 以作者使徒約翰為名，主題是神就是愛、彼此相愛。 |
| 約二 | 以作者約翰為名的一封短信，談在真理中彼此相愛。 |
| 約三 | 以作者約翰為名的一封短信，稱許接待主工人的該猶。 |
| 猶 | 以作者猶大（雅各的弟弟）為名，勸人為真道竭力爭辯。 |

範例（以「帖前」為例，逗號後即為新增的第 5 元素）：

```typescript
  [
    "帖前",
    "帖撒羅尼迦前書",
    "pauline",
    "主必再來——安慰並勸勉信徒儆醒等候主的降臨，常常喜樂、不住禱告、凡事謝恩。",
    "帖撒羅尼迦是馬其頓的首府、羅馬時代重要的商業大城。",
  ],
```

- [ ] **Step 4: 型別檢查與 lint**

Run: `pnpm run check && pnpm run lint`
Expected: 兩者皆無錯誤（exit 0）。

- [ ] **Step 5: Commit**

```bash
git add src/data/bibleCanon.ts
git commit -m "feat(canon): add background clue field and content for place/person-named books

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: modal 顯示背景線索

**Files:**
- Modify: `src/screens/BibleCanonArchivePage.tsx`（modal 區塊，約第 538-541 行）
- Modify: `src/styles.css`（約第 615-632 行附近，`.canon-modal-theme` 與 `.canon-modal-src` 之間）

**Interfaces:**
- Consumes: `CanonBook.clue?`（Task 1 產出）。

- [ ] **Step 1: 在 modal 主題下方加入條件式線索區塊**

在 `src/screens/BibleCanonArchivePage.tsx` 的 modal 中，找到：

```tsx
            <div className="canon-modal-theme">
              <b>主題：</b>
              {modalBook.theme}
            </div>
            <div className="canon-modal-src">
```

在 `canon-modal-theme` 的 `</div>` 之後、`canon-modal-src` 之前插入：

```tsx
            {modalBook.clue ? (
              <div className="canon-modal-clue">
                <b>📍 背景小提示：</b>
                {modalBook.clue}
              </div>
            ) : null}
```

- [ ] **Step 2: 新增對應 CSS**

在 `src/styles.css` 的 `.canon-modal-theme b { ... }` 規則之後、`.canon-modal-src` 之前插入：

```css
.canon-modal-clue {
  padding-top: 12px;
  margin-top: 14px;
  font-size: 0.9rem;
  line-height: 1.85;
  color: rgb(74 60 40 / 90%);
  border-top: 1px dashed #b8a87f;
}

.canon-modal-clue b {
  font-family: "Noto Serif TC", serif;
}
```

- [ ] **Step 3: 型別檢查與 lint**

Run: `pnpm run check && pnpm run lint`
Expected: 兩者皆無錯誤。

- [ ] **Step 4: 手動驗證**

Run: `pnpm run dev`，開啟經卷歸檔，點「帖撒羅尼迦前書」卡片的「卷」鈕。
Expected: modal 主題下方出現「📍 背景小提示：帖撒羅尼迦是馬其頓的首府……」；點一張無線索的卷（如「創世記」），不出現該區塊。

- [ ] **Step 5: Commit**

```bash
git add src/screens/BibleCanonArchivePage.tsx src/styles.css
git commit -m "feat(canon): show background clue in book modal

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: 快速歸檔（歸檔手牌／全部歸檔）

**Files:**
- Modify: `src/screens/BibleCanonArchivePage.tsx`

**Interfaces:**
- Consumes: 既有 `categoryOf`、`placed`、`hand`、`deck`、`HAND_SIZE`、`BOOK_TOTAL`、`totalDone`、`startTime`、`addSparkles`、`showToast`、`canonBooks`。
- Produces: `usedQuickArchive` state、`archiveHand()`、`archiveAll()`。

- [ ] **Step 1: 新增 `usedQuickArchive` 狀態**

在 component 內既有 `const [finished, setFinished] = useState(false);`（約第 117 行）之後新增：

```tsx
  const [usedQuickArchive, setUsedQuickArchive] = useState(false);
```

- [ ] **Step 2: `startGame` 重設旗標**

在 `startGame` 中既有 `setFinished(false);`（約第 207 行）之後新增：

```tsx
    setUsedQuickArchive(false);
```

- [ ] **Step 3: 新增 `archiveHand` 與 `archiveAll`**

在 `handleHint` 函式（約第 289-307 行）之後新增：

```tsx
  const archiveHand = () => {
    if (finished || hand.length === 0) {
      return;
    }

    const archivedCount = hand.length;

    setPlaced((current) => {
      const next = { ...current };
      for (const book of hand) {
        const key = categoryOf(book, mode);
        next[key] = [...(next[key] ?? []), book];
      }
      return next;
    });
    setRevealed((current) => {
      const next = new Set(current);
      hand.forEach((book) => next.add(book.abbr));
      return next;
    });

    const nextHand = deck.slice(0, HAND_SIZE);
    setHand(nextHand);
    setDeck(deck.slice(HAND_SIZE));
    setSelectedAbbr(null);
    setUsedQuickArchive(true);

    const pile = document.querySelector<HTMLElement>("[data-canon-pile-key]");
    addSparkles(pile);
    showToast(`已快速歸檔 ${archivedCount} 卷`);

    if (totalDone + archivedCount === BOOK_TOTAL) {
      setFinished(true);
      setElapsedMs(startTime ? Date.now() - startTime : elapsedMs);
      window.setTimeout(() => setShowWin(true), 600);
    }
  };

  const archiveAll = () => {
    if (finished) {
      return;
    }

    const remaining = [...hand, ...deck];

    setPlaced((current) => {
      const next = { ...current };
      for (const book of remaining) {
        const key = categoryOf(book, mode);
        next[key] = [...(next[key] ?? []), book];
      }
      return next;
    });
    setRevealed(new Set(canonBooks.map((book) => book.abbr)));
    setHand([]);
    setDeck([]);
    setSelectedAbbr(null);
    setUsedQuickArchive(true);
    setFinished(true);
    setElapsedMs(startTime ? Date.now() - startTime : elapsedMs);
    window.setTimeout(() => setShowWin(true), 600);
  };
```

- [ ] **Step 4: header 新增兩顆按鈕**

在 header 中既有「💡 提示」按鈕（約第 396-398 行）之後、「↺ 重新開始」之前插入：

```tsx
        <button className="canon-btn" onClick={archiveHand}>
          ⏩ 歸檔手牌
        </button>
        <button className="canon-btn" onClick={archiveAll}>
          ⏭ 全部歸檔
        </button>
```

- [ ] **Step 5: 結算畫面標註快速歸檔**

在 showWin panel 的 `canon-win-stats` 區塊（約第 590-603 行的 `</div>` 收尾）之後插入：

```tsx
            {usedQuickArchive ? (
              <div className="canon-panel-sub canon-panel-note">（含快速歸檔）</div>
            ) : null}
```

- [ ] **Step 6: 型別檢查與 lint**

Run: `pnpm run check && pnpm run lint`
Expected: 兩者皆無錯誤。

- [ ] **Step 7: 手動驗證**

Run: `pnpm run dev`，開始「完整・九大分類」。
Expected:
- 點「⏩ 歸檔手牌」：手牌 6 張正確飛入書架、補滿至 6 張，失誤數不變，toast 顯示「已快速歸檔 6 卷」。
- 連點至牌堆耗盡後再點「⏩ 歸檔手牌」會正常進結算。
- 重開一局後點「⏭ 全部歸檔」：直接進結算畫面，且統計下方顯示「（含快速歸檔）」。

- [ ] **Step 8: Commit**

```bash
git add src/screens/BibleCanonArchivePage.tsx
git commit -m "feat(canon): add quick-archive (archive hand / archive all) teaching tools

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review Notes

- **Spec coverage**：功能一（資料 clue＋撰寫範圍＋modal 呈現）→ Task 1、2；功能二（archiveHand/archiveAll＋usedQuickArchive＋結算附註＋按鈕）→ Task 3。皆有對應。
- **型別一致**：`clue` 在 Task 1 定義、Task 2 消費，名稱一致；`archiveHand`/`archiveAll`/`usedQuickArchive` 在 Task 3 內定義並使用，名稱一致。
- **無 placeholder**：所有步驟含實際程式碼與完整線索文字。
- **驗證調整**：專案無測試框架，依 Global Constraints 以 tsc check ＋ lint ＋ 手動驗證取代單元測試。
