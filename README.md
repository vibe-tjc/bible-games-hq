# Bible Games HQ

有助於聖經分享可使用的小遊戲集合。

目前包含：

- 登山寶訓中的八福連連看

## 開發

```bash
npm install
npm run dev
```

前端使用 Vite、React、TypeScript、TanStack Router、TanStack Query，並以淡綠色系呈現首頁與遊戲介面。

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
npm run check
npm run lint
npm run format:check
npm run build
npm run bundle:check
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
