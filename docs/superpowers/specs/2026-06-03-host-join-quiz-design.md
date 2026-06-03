# 主持人「我也要玩」功能設計

日期：2026-06-03
分支：siygle/beatitudes-match-game

## 目標

讓主持人在建立場次後，可以直接以參與者身分加入並遊玩八福連連看，而不必另外掃描 QR code。主持人的成績照常計入場次統計與完成名單。

## 背景

目前流程：

1. 主持人在 `HostStart` 輸入教師密碼建立場次。
2. 導向 `HostRoomPage`，顯示參與者加入用的 QR code（`participantUrl`，含 `room` 與 `token`）與即時結果。
3. 一般參與者掃 QR 進入 `ParticipantGame`，先看到加入畫面（選匿名或輸入名稱），按「開始配對」後 `joinRoom`、遊玩、`submitResult`。

主持頁本身沒有讓主持人遊玩的入口。

## 設計

### 1. 路由參數（`src/router.tsx`）

`BeatitudesSearch` 新增選用參數：

```ts
type BeatitudesSearch = {
  room?: string;
  token?: string;
  host?: string; // "1" 代表主持人自動加入模式
};
```

`validateSearch` 同步解析 `host`（字串型別，否則 `undefined`）。

### 2. 主持頁（`src/screens/HostRoomPage.tsx`）

- 在既有 `host-actions` 區塊（複製連結／結束場次旁）新增一顆「我也要玩」按鈕。
- 點擊行為：以 `participantUrl` 為基礎加上 `host=1` 參數，`window.open(url, "_blank")` 另開新分頁。
- 主持頁維持原狀，繼續輪詢顯示 QR 與即時結果。
- 主持人需有 `joinToken`（已存在於 `hostRoom`）才顯示／啟用此按鈕；無權限的空狀態不顯示。

### 3. 遊戲頁（`src/screens/BeatitudesPage.tsx`）

- `BeatitudesPage` 從 search 讀取 `host`，傳入 `ParticipantGame`（例如 `asHost={host === "1"}`）。
- `ParticipantGame`：
  - `startGame` 重構為可接受覆寫設定，例如 `startGame(override?: { name: string; anonymous: boolean })`，直接用傳入值建立 profile，避免依賴非同步的 `name` / `anonymous` state。一般流程仍用目前的 state 值。
  - 新增一次性 `useEffect`：當 `asHost` 為真且尚未建立 profile 時，自動呼叫 `startGame({ name: "主持人", anonymous: false })`，直接跳過加入畫面開始配對。
  - 其餘玩法、完成畫面、`submitResult` 流程完全沿用，主持人成績照常上傳並出現在完成名單（顯示名稱「主持人」）。

## 不在範圍內

- 不提供主持人成績是否計入的開關（一律計入）。
- 不改動一般參與者的加入與遊玩流程。
- 不處理主持人多次重玩去重（沿用既有 `getPlayerId(roomId)` 行為）。

## 影響檔案

- `src/router.tsx`
- `src/screens/HostRoomPage.tsx`
- `src/screens/BeatitudesPage.tsx`

純新增邏輯，不影響既有參與者流程。
