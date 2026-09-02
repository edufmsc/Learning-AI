# 正式架構

## 目標
把人才發展管理師學習系統做成可長期使用、可直接部署、可持續更新的 Web App，而不是 ZIP 版本集合。

## 使用者情境
1. 工作快複習：30–90 秒卡片，到期桌面通知，點擊後直接進考點。
2. 深度學習：以概念單元教學，不以逐張 PPT 當主流程。
3. 題庫與模考：可選 Day／章節／知識類型／題型，並追蹤弱點。
4. 有聲課程：完整版章節、單章／Day／全課循環。
5. 學習分析：覆蓋率、Recall、Completeness、Retention、Stability。

## 技術責任分工
- GitHub：Web App 程式、PWA、路由、題庫邏輯、版本管理、GitHub Pages。
- Google Drive：原始教材、受限制圖像、完整版語音腳本、MP3、大型備份。
- 瀏覽器/PWA：個人操作與快取。
- 後續同步層：學習紀錄跨裝置同步，不把教材公開化。

## 內容安全
目前 `Learning-AI` 是 public repository，因此原始課程投影片與整套教材圖片不直接提交到 public GitHub。正式網站程式與私人教材內容分離，避免 GitHub Pages 等同公開散布教材。

## 版本策略
不再建立 v8/v9/final-final 資料夾。Git commit / branch / release 就是版本；Google Drive 只維持一套正式內容＋舊版封存。
