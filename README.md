# Bible Games HQ

有助於聖經分享可使用的小遊戲與資源集合。首頁以頁籤區分「聖經小遊戲」與「聖經資源」兩大主題。

## 聖經小遊戲

- 登山寶訓中的八福連連看
- 渴望清單：人生三階段
- 耶穌傳道的腳蹤（互動地圖）
- 經卷歸檔
- 保羅宣道旅程（互動地圖，手繪／真實地圖雙模式）

## 聖經資源

- 聖經單位換算器（長度、重量、乾量、液量、工資理解的公制／英制換算，附現代生活直覺理解）
- 聖經戰爭（舊約代表性戰役的背景、戰爭流程與信仰功課，互動式真實地圖對照相關地點）

## 開發

```bash
pnpm install
pnpm dev
```

前端使用 Vite、React、TypeScript、TanStack Router、TanStack Query，並以「晨光」視覺語言（冷調紙感背景、靜謐青綠 accent、襯線標題）呈現首頁與各遊戲／資源介面。

## 課堂模式後端：Apps Script + Google Sheet

跨裝置場次統計由 Google Apps Script Web App 提供，資料寫入同一個 Google Sheet。GitHub Pages 只負責前端部署。

### 1. 建立後端

1. 新增一個 Google Sheet
2. Extensions -> Apps Script
3. 將 `apps-script/Code.gs` 整份貼上
4. 將檔案最上方 `TEACHER_KEY` 改成自己的隨機字串，建議至少 16 字元
5. Deploy -> New deployment -> Type: Web app
   - Execute as: Me
   - Who has access: Anyone
6. 複製 Web App URL，通常以 `/exec` 結尾

第一次部署可能會出現 Google 未驗證警告，這是個人 Apps Script 常見流程；確認是自己的 script 後，從 Advanced 進入並授權。

### 2. 設定前端

本機 `.env` 或 GitHub Pages repository variable 設定：

```bash
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
```

GitHub Pages workflow 會在 build 時讀取 `VITE_APPS_SCRIPT_URL`。

### 3. 使用流程

- 主持人進入「登山寶訓中的八福連連看」
- 輸入 Apps Script 內設定的 `TEACHER_KEY`
- 建立場次後取得 QR code
- 參與者掃 QR，可匿名或輸入名稱
- 參與者完成後，主持頁會輪詢顯示總答對比例與完成名單
- 主持人按「結束場次」會清除該場次資料

## 安全機制

- 前端不含 `TEACHER_KEY`
- 建立場次需要 `TEACHER_KEY`
- 後端會為每場產生兩種 token：
  - `joinToken`：放在 QR 連結，僅能加入與提交
  - `hostToken`：只存在主持人瀏覽器 localStorage，用於讀結果與結束場次
- 場次 4 小時過期
- 後端驗證 room/token/payload/容量，單場上限 200 人
- 後端用 CacheService 做讀寫節流，降低公開 Web App URL 被誤用時的配額風險
- 後端不信任 client 分數，會從每題第一次選擇重新計算答對數
- 同一 room + 同一 playerId 重複加入或提交會覆蓋原列，不會重複計算
- Apps Script 使用 LockService 序列化寫入
- 可在 Apps Script 編輯器手動執行 `cleanupExpiredRooms()` 清理過期場次資料

## 部署

GitHub Pages workflow：`.github/workflows/deploy-pages.yml`

GitHub 需要設定：

- Pages source：GitHub Actions
- Repository variable：`VITE_APPS_SCRIPT_URL`

## 驗證

```bash
pnpm check
pnpm lint
pnpm format:check
pnpm build
pnpm bundle:check
```

Apps Script 可用臨時 `.cjs` 副本做基本語法檢查：

```bash
cp apps-script/Code.gs .context/Code-check.cjs
node --check .context/Code-check.cjs
```

## 上課前 checklist

1. 用實際活動網路測一次：主持人建場 -> 手機掃 QR -> 送出一筆 -> 主持頁看到結果
2. 確認 Google Sheet 出現 `Participants` 與 `Submissions` 工作表
3. 注意部分場地網路可能阻擋 `script.google.com`，必要時改用行動網路
4. 課程結束按「結束場次」清除資料
