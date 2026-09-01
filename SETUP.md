# AI Learning System｜部署步驟

## 已建立
- GitHub：`edufmsc/Learning-AI`
- Google Sheet：`AI Learning System DB`
- Sheet ID：`1F7xV0zrEAkcMkDgLun_T-6Pm4fWmu4Bubxksdy9ubBI`
- GAS 後端程式：`gas/Code.gs`

## 1. 建立 Apps Script
1. 打開 Google Sheet `AI Learning System DB`。
2. 擴充功能 → Apps Script。
3. 將 `gas/Code.gs` 全部貼到 `Code.gs`。
4. 執行 `setupDatabase()`，完成授權。

## 2. 建立 Google OAuth Client ID
1. 到 Google Cloud Console 建立/選擇專案。
2. Google Auth Platform / OAuth consent screen 完成基本設定。
3. 建立 OAuth 2.0 Client ID，類型選「Web application」。
4. Authorized JavaScript origins 加入 `https://edufmsc.github.io`。
5. 複製 Client ID。
6. 同一個 Client ID 填到 `config.js` 的 `GOOGLE_CLIENT_ID` 與 Apps Script `CONFIG.GOOGLE_CLIENT_ID`。

## 3. 部署 Apps Script Web App
1. Apps Script → 部署 → 新部署。
2. 類型：網頁應用程式。
3. 執行身分：我。
4. 誰可以存取：任何人。
5. 部署後複製 `/exec` 網址。
6. 把完整 `/exec` 網址填入 GitHub `config.js` 的 `API_URL`。

## 4. 啟用 GitHub Pages
GitHub repo → Settings → Pages → Deploy from a branch → `main` / `(root)` → Save。

正式網址：`https://edufmsc.github.io/Learning-AI/`

## 5. 測試
Google 登入後，首次登入會自動建立 Users；打卡寫入 Checkins；Checklist 寫入 Checklist；每日進度寫入 LearningRecords；作品寫入 Portfolio；能力報告寫入 AI_Report。

## 安全
不在 GitHub 儲存密碼或 Client Secret。前端只放可公開的 Google Client ID；GAS 會向 Google tokeninfo 驗證 ID Token，再以驗證後的 Email 區隔個人資料。
