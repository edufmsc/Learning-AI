# Learning-AI

個人 AI 學習管理系統，使用 GitHub Pages 作為前端網站，並串接 Google Identity Services、Google Apps Script 與 Google Sheets，建立每位使用者獨立的 AI 學習紀錄與進度管理機制。

## 目前架構

- GitHub Pages：負責 Learning-AI 前端網站發布與操作介面。
- Google Identity Services：提供 Google 帳號登入，作為使用者身分識別。
- Google Apps Script Web App：作為前端與 Google Sheets 之間的後端服務，負責帳號驗證、Session、學習資料讀取與寫入。
- Google Sheets：作為 Learning-AI 中央資料庫，保存使用者帳號、登入紀錄、學習進度、Checklist、打卡、作品集及 AI 能力報告。
- localStorage：保留瀏覽器端學習資料作為本機快取，並與 Google Sheets 雲端資料進行同步。

## Google Sheets 資料結構

目前後端資料統一使用 `LMS_` 開頭的工作表：

- `LMS_Users`：使用者帳號、登入資訊、學習進度與累積學習時間。
- `LMS_LoginLogs`：使用者登入與登出紀錄。
- `LMS_LearningPlan`：20 天 AI 學習計畫基本資料。
- `LMS_LearningRecords`：每日學習進度、完成狀態、學習時間及成果紀錄。
- `LMS_Checklist`：每日學習 Checklist 完成狀態。
- `LMS_Checkins`：每日打卡紀錄。
- `LMS_Portfolio`：個人作品集成果。
- `LMS_AI_Report`：個人 AI 能力報告。
- `LMS_AuditLog`：系統操作與資料同步紀錄。
- `LMS_Settings`：系統後端設定。

## 使用流程

使用者進入 Learning-AI 後，以個人 Google 帳號登入。

登入成功後，系統會透過 Google Apps Script 驗證帳號並建立個人學習身分，再從 Google Sheets 載入該使用者的學習資料。

使用者在網站中的學習行為，例如：

- 每日打卡
- Checklist
- Focus Timer 與累積學習時間
- DAY 01～20 學習進度
- 學習成果紀錄
- 作品集
- AI 能力報告

都會以個人 Google 帳號為基礎保存於中央資料庫。

## 資料同步方式

Learning-AI 採用：

`localStorage + Google Apps Script + Google Sheets`

的混合資料架構。

localStorage 作為瀏覽器端快取，確保使用者操作時維持良好的速度與資料暫存能力；Google Sheets 則作為中央學習資料庫，讓使用者未來可在不同裝置登入相同 Google 帳號後繼續自己的學習紀錄。

## 登入與安全機制

使用者不需要輸入額外的 API Key、系統密碼或後端 Token。

登入流程為：

Google 帳號登入  
→ Google Identity Services 驗證  
→ Google Apps Script 建立短效 Session  
→ 讀取個人 Google Sheets 學習資料  
→ 進入 Learning-AI 學習系統

Google 登入憑證只用於身分驗證，後續系統透過短效 Session 處理學習資料存取。

## 目前系統目標

Learning-AI 目前以「個人 AI 學習管理系統」為核心，讓每位使用者可以：

- 擁有自己的 20 天 AI 學習進度
- 記錄每日學習時間
- 建立學習成果
- 累積個人作品集
- 追蹤 AI 應用能力
- 產生個人 AI 能力報告

後續可再擴充教育中心管理端、人員學習統計、課程指派、學習成效分析及主管管理功能。
