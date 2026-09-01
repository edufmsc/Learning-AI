'use strict';

const learningPlan = [
  {
    day: 1, phase: '基礎', title: 'AI 基礎與工作任務拆解', tool: 'ChatGPT', duration: 90,
    summary: '建立正確的生成式 AI 使用觀念，學會把模糊工作轉換成可執行的任務。',
    deliverable: '完成 3 組工作提示詞',
    points: ['了解生成式 AI 能做與不能做的事', '學會「角色＋任務＋背景＋格式」提示結構', '把一項日常人資工作拆成可交給 AI 協助的步驟'],
    caseText: '將「幫我整理課程資料」改寫成具備對象、目的、內容限制與輸出格式的完整提示詞。',
    prompt: '請以人資教育訓練專員角度，將以下課程資料整理成「課程目的／適用對象／學習重點／課後行動」四欄表格。',
    output: '選 3 個你最常做的工作，分別寫出一組可以重複使用的高品質提示詞。'
  },
  {
    day: 2, phase: '基礎', title: '提示詞進階：讓 AI 回答更穩定', tool: 'ChatGPT', duration: 90,
    summary: '透過範例、限制條件與檢查清單，減少 AI 回答過於空泛或偏離需求。',
    deliverable: '建立個人 Prompt 範本',
    points: ['加入輸出範例（Few-shot）', '設定禁止事項與判斷標準', '要求 AI 自我檢查遺漏項目'],
    caseText: '製作可重複使用的「訓練通知信」提示詞，固定口吻、欄位與檢查項目。',
    prompt: '輸出前請檢查日期、時間、地點、對象、注意事項是否齊全；若缺資料請標記「待補」。',
    output: '建立一份你的「工作 Prompt 模板」，未來只需替換變數即可使用。'
  },
  {
    day: 3, phase: '文件', title: '文件摘要與重點提取', tool: 'ChatGPT / NotebookLM', duration: 90,
    summary: '學會從長篇文件快速萃取決策重點，並保留來源與待確認事項。',
    deliverable: '完成 1 份摘要表',
    points: ['區分摘要、分析與推論', '建立固定摘要欄位', '針對不確定資訊要求標註來源'],
    caseText: '將外部培訓課程簡章整理成公司內部可判讀的課程摘要表。',
    prompt: '請整理課程名稱、日期、地點、費用、適合對象、課程重點、報名期限與風險提醒，沒有資料不得自行補寫。',
    output: '挑一份課程簡章或制度文件，產出可直接交給主管閱讀的一頁摘要。'
  },
  {
    day: 4, phase: '文件', title: '訓練手冊與 SOP 協作', tool: 'ChatGPT', duration: 120,
    summary: '把零散知識整理成一致、好教、好查詢的教學文件。',
    deliverable: '完成 1 頁 SOP 草稿',
    points: ['建立 SOP 的目的、步驟、標準、異常處理', '把口語經驗轉為可教學文字', '設計學習檢核題'],
    caseText: '將門市現場操作說明整理成新人也能理解的標準教學頁。',
    prompt: '請把以下操作內容改寫為「目的／準備／標準步驟／常見錯誤／檢核題」格式，文字需簡短可執行。',
    output: '完成一個目前工作上實際需要的 SOP 或手冊頁面。'
  },
  {
    day: 5, phase: '文件', title: 'Email、公告與內部溝通', tool: 'ChatGPT', duration: 60,
    summary: '用 AI 協助調整不同溝通情境的語氣、結構與行動指令。',
    deliverable: '建立 3 種訊息模板',
    points: ['區分主管、同仁、外部廠商語氣', '讓行動事項與截止日期明確', '縮短冗長訊息並保留必要資訊'],
    caseText: '同一則外訓通知，分別改寫成給主管核准、學員通知與廠商詢問三個版本。',
    prompt: '請提供正式版、簡潔版與提醒版，每版都必須保留明確的下一步行動。',
    output: '建立至少 3 個日後可直接套用的工作訊息模板。'
  },
  {
    day: 6, phase: '研究', title: 'AI 搜尋與資料查核', tool: 'ChatGPT Search', duration: 90,
    summary: '培養查找最新資訊、比較來源與避免誤用過期資料的能力。',
    deliverable: '完成 1 份來源比較表',
    points: ['先定義搜尋條件與時間範圍', '比較至少兩個可信來源', '區分事實、推測與建議'],
    caseText: '搜尋外部訓練課程時，同步整理開課日期、地區、費用、承辦單位與報名網址。',
    prompt: '只列出仍可報名或日期尚未截止的課程，並逐項附來源與查詢日期。',
    output: '完成一個真實工作主題的資料蒐集與來源驗證表。'
  },
  {
    day: 7, phase: '研究', title: '比較分析與決策建議', tool: 'ChatGPT', duration: 90,
    summary: '讓 AI 不只整理資料，也能依照公司條件形成可比較的決策表。',
    deliverable: '完成 1 張決策矩陣',
    points: ['先設定評估構面與權重', '避免只看單一價格指標', '把建議與依據分開呈現'],
    caseText: '比較不同外訓供應商、AI 工具或課程方案，形成主管可決策的比較表。',
    prompt: '請依成本、功能、導入難度、適用情境、風險五項評估，並說明每項判斷依據。',
    output: '挑選 2–3 個方案，完成一份可交付主管的比較建議。'
  },
  {
    day: 8, phase: '研究', title: '問卷與需求調查設計', tool: 'ChatGPT', duration: 90,
    summary: '將模糊的培訓需求轉成可以蒐集與分析的問卷題目。',
    deliverable: '完成 10 題問卷',
    points: ['定義調查目的與對象', '區分行為、能力、需求題', '避免誘導與重複題目'],
    caseText: '設計 AI 使用能力與學習需求問卷，辨識不同能力層級的培訓需求。',
    prompt: '題目需能區分「未使用、接觸過、能獨立使用、能優化他人工作」四種程度。',
    output: '完成一份至少 10 題且可直接放入 Google Form 的問卷。'
  },
  {
    day: 9, phase: '資料', title: '試算表公式與資料清理', tool: 'ChatGPT + Google Sheets', duration: 120,
    summary: '利用 AI 解釋公式、設計欄位與處理重複性資料整理。',
    deliverable: '完成 1 個自動計算表',
    points: ['用自然語言描述計算規則', '理解公式而非直接複製', '測試空白、錯誤與邊界情境'],
    caseText: '建立訓練參訓率、完課率、未回覆累積等自動計算欄位。',
    prompt: '請先用文字解釋公式邏輯，再提供 Google Sheets 公式，並列出三種需要測試的例外。',
    output: '改善一個目前需要人工計算的工作表欄位。'
  },
  {
    day: 10, phase: '資料', title: '數據分析與 HRD 洞察', tool: 'ChatGPT', duration: 90,
    summary: '從培訓數據找出異常、趨勢與下一步行動，而不只呈現數字。',
    deliverable: '完成 3 點數據洞察',
    points: ['先確認資料定義與品質', '拆分趨勢、異常與原因假設', '將分析轉成可行動建議'],
    caseText: '分析參訓率、完課率、評核分數與訓後回饋，找出需要改善的課程。',
    prompt: '請分成「觀察到的事實／可能原因／建議驗證方式／下一步行動」，不要把推測寫成事實。',
    output: '使用一份既有數據，產出至少 3 點主管可採取行動的洞察。'
  },
  {
    day: 11, phase: '自動化', title: 'Google Forms × Sheets 工作流', tool: 'Google Forms / Sheets', duration: 120,
    summary: '把資料蒐集、整理與追蹤串成一條可維護的工作流程。',
    deliverable: '完成流程草圖',
    points: ['設計表單欄位與資料表對應', '建立狀態欄與後續動作', '思考誰負責、何時觸發'],
    caseText: '從課程報名表單一路追蹤到參訓、完課與證書紀錄。',
    prompt: '請用流程圖文字列出「填表→資料整理→通知→追蹤→結案」各步驟的欄位與負責角色。',
    output: '畫出一個目前工作流程的自動化藍圖，標出可減少人工的步驟。'
  },
  {
    day: 12, phase: '自動化', title: 'Apps Script 入門', tool: 'Gemini / ChatGPT + Apps Script', duration: 120,
    summary: '學會請 AI 產生小型腳本，並知道如何閱讀、測試與修正。',
    deliverable: '完成 1 個簡單自動化',
    points: ['理解觸發器與資料範圍', '逐段請 AI 解釋程式碼', '先用測試資料驗證再套正式檔'],
    caseText: '自動寄送課程提醒、整理表單回覆或依條件標記資料。',
    prompt: '請提供可測試的最小版本程式碼，逐段註解，並告訴我需要授權的權限與可能風險。',
    output: '完成一個不涉及敏感資料的簡單 Apps Script 自動化。'
  },
  {
    day: 13, phase: '自動化', title: '建立 AI 工作流程 SOP', tool: 'ChatGPT', duration: 90,
    summary: '把已成功的 AI 用法固定成標準流程，讓自己下次不需要重新摸索。',
    deliverable: '完成 1 份 AI SOP',
    points: ['定義輸入資料與輸出格式', '建立品質檢查點', '保留人工判斷與資訊安全規則'],
    caseText: '將「外訓課程搜尋→比較→摘要→通知」整理成可重複執行的工作流程。',
    prompt: '請將流程整理成步驟、使用工具、輸入、輸出、檢查點、常見錯誤六欄。',
    output: '選一個已經有效的 AI 工作方式，整理成自己的標準作業流程。'
  },
  {
    day: 14, phase: '視覺', title: 'AI 簡報架構與故事線', tool: 'ChatGPT + Canva', duration: 90,
    summary: '從目的與受眾出發，快速產出有邏輯而不是堆文字的簡報。',
    deliverable: '完成 8–10 頁簡報架構',
    points: ['一頁只傳遞一個核心訊息', '用問題→分析→方案→行動建立故事線', '區分講者內容與投影片文字'],
    caseText: '將教育訓練專案整理成主管可快速理解的提案簡報。',
    prompt: '每頁請提供「頁面目的／主標題／最多三個重點／適合視覺」，不要直接堆滿段落。',
    output: '選一個工作主題，完成 8–10 頁可直接製作的簡報腳本。'
  },
  {
    day: 15, phase: '視覺', title: '圖片生成與教材視覺', tool: 'ChatGPT Image / Canva', duration: 90,
    summary: '學會用清楚的視覺指令製作教材示意圖、情境圖與簡報素材。',
    deliverable: '完成 3 張教材視覺',
    points: ['描述主體、場景、構圖、風格與比例', '讓視覺服務內容而非只追求好看', '檢查文字、品牌與人物一致性'],
    caseText: '為課程情境、SOP 或內部宣導製作一致風格的示意圖片。',
    prompt: '請生成專業企業教育風格的 16:9 圖像，畫面保留右側 40% 留白供簡報上字，不加入任何文字。',
    output: '完成一組同主題、同風格的 3 張工作用視覺素材。'
  },
  {
    day: 16, phase: '教學', title: 'AI 輔助課程設計', tool: 'ChatGPT', duration: 120,
    summary: '把課程目標、活動、教材與評量串在一起，而不是只產生課程大綱。',
    deliverable: '完成 1 份課程設計表',
    points: ['從可觀察的學習目標開始', '設計活動與目標對應', '加入課前、課中、課後評量'],
    caseText: '設計主管培訓、口語表達或新人訓課程的完整教學流程。',
    prompt: '請用「學習目標／教學內容／活動／時間／講師提醒／評量方式」六欄設計課程。',
    output: '將一門既有課程重新整理成完整的教學設計表。'
  },
  {
    day: 17, phase: '教學', title: '題庫與評量設計', tool: 'ChatGPT', duration: 90,
    summary: '利用 AI 產生題目後，學會檢查難度、干擾選項與答案依據。',
    deliverable: '完成 10 題評量題',
    points: ['題目需對應實際學習目標', '避免答案太明顯或固定位置', '為每題保留答案依據與解析'],
    caseText: '依照 SOP 或訓練手冊建立單選、情境題與實作檢核題。',
    prompt: '每題需提供題目、四個選項、正解、解析、題目測量的能力點，並避免語意線索暴露答案。',
    output: '從一份真實教材建立 10 題可用於評核的題目，並人工複核。'
  },
  {
    day: 18, phase: '管理', title: 'AI 使用品質與資訊安全', tool: 'ChatGPT', duration: 60,
    summary: '建立資料分級、事實查核與人工覆核習慣，避免方便變成風險。',
    deliverable: '完成個人 AI 檢查清單',
    points: ['辨識不可直接上傳的敏感資料', '重要資訊需要來源與人工確認', '建立輸出前的品質檢查清單'],
    caseText: '判斷員工資料、評核內容、公司制度與公開資訊哪些可以直接使用 AI。',
    prompt: '請先判斷資料敏感度與潛在風險，再提供可以匿名化或替代的處理方式。',
    output: '建立一份 8–10 點的「工作使用 AI 前／後檢查清單」。'
  },
  {
    day: 19, phase: '整合', title: '打造個人 AI 工作系統', tool: '多工具整合', duration: 120,
    summary: '整理哪些工作已能交給 AI 協作，建立自己的工具分工與標準流程。',
    deliverable: '完成 AI 工作地圖',
    points: ['列出高頻、重複、耗時工作', '依工作類型分配適合工具', '標記可自動化與必須人工判斷的環節'],
    caseText: '把外訓、教材、報表、能力盤點、簡報與行政溝通整理成一張 AI 工作地圖。',
    prompt: '請依「工作任務／目前時間／AI 可協助比例／適合工具／品質風險／預期改善」建立盤點表。',
    output: '完成一張屬於自己的 AI 工作應用地圖。'
  },
  {
    day: 20, phase: '整合', title: '成果回顧與下一階段計畫', tool: 'ChatGPT', duration: 90,
    summary: '回顧 20 天成果，找出真正有用的能力並規劃下一個 30 天深化目標。',
    deliverable: '完成個人 AI 成果報告',
    points: ['整理已完成的實際成果', '比較學習前後工作方式差異', '選 2–3 個高價值能力持續深化'],
    caseText: '將 20 天的產出整理成可放入履歷、作品集或年度工作成果的案例。',
    prompt: '請用「原本問題／我的做法／AI 如何協助／最終成果／學到什麼／下次優化」整理每個案例。',
    output: '完成一頁 AI 學習成果總結，並設定下一階段 3 個可衡量目標。'
  }
];

const tools = [
  { symbol: 'GPT', name: 'ChatGPT', use: '文字、分析、協作', text: '適合提示詞、文件整理、比較分析、課程設計與程式協作。', caseText: '外訓摘要、訓練手冊、問卷、教材、Email 初稿。' },
  { symbol: 'NB', name: 'NotebookLM', use: '文件型知識整理', text: '適合針對既有文件做來源導向的摘要、問答與跨文件整理。', caseText: '制度文件、教材、課程資料與會議文件彙整。' },
  { symbol: 'GS', name: 'Google Sheets', use: '資料與流程', text: '搭配 AI 規劃公式、欄位、統計邏輯，處理培訓與人員資料。', caseText: '參訓率、完課率、名單追蹤、每週進度。' },
  { symbol: 'AS', name: 'Apps Script', use: '工作自動化', text: '將表單、試算表、Email 與排程串接，減少重複人工操作。', caseText: '通知、標記、資料整理、定時更新。' },
  { symbol: 'CV', name: 'Canva', use: '簡報與視覺', text: '適合把 AI 產生的內容轉換成簡報、教學海報與視覺素材。', caseText: '教育訓練簡報、課程圖卡、宣導素材。' },
  { symbol: 'IMG', name: 'AI 圖像生成', use: '情境圖與素材', text: '快速製作教材示意圖、角色情境、流程視覺與簡報主視覺。', caseText: 'SOP 情境、課程案例、內部提案視覺。' },
  { symbol: 'SR', name: 'AI Search', use: '搜尋與查核', text: '查找最新課程、工具、規範或市場資訊，並整理來源。', caseText: '外訓課程搜尋、工具比較、近期資訊確認。' },
  { symbol: 'WF', name: 'Workflow', use: '多工具串接', text: '把搜尋、整理、產出與追蹤設計成可重複執行的工作流。', caseText: '報名→通知→追蹤→結訓→成果紀錄。' }
];

const storageKeys = {
  started: 'aiLearningStarted',
  completed: 'aiLearningCompletedDays',
  results: 'aiLearningResults',
  stepProgress: 'aiLearningStepProgress',
  durationOverrides: 'aiLearningDurationOverrides'
};

const state = {
  completed: readJson(storageKeys.completed, []),
  results: readJson(storageKeys.results, []),
  stepProgress: readJson(storageKeys.stepProgress, {}),
  durationOverrides: readJson(storageKeys.durationOverrides, {}),
  selectedMinutes: 90,
  remainingSeconds: 90 * 60,
  timerId: null,
  timerRunning: false
};

const elements = {
  startScreen: document.getElementById('startScreen'),
  appShell: document.getElementById('appShell'),
  startButton: document.getElementById('startButton'),
  backToStart: document.getElementById('backToStart'),
  dayBadge: document.getElementById('dayBadge'),
  todayTitle: document.getElementById('todayTitle'),
  todaySummary: document.getElementById('todaySummary'),
  todayDuration: document.getElementById('todayDuration'),
  todayTool: document.getElementById('todayTool'),
  todayDeliverable: document.getElementById('todayDeliverable'),
  dailyStepChecklist: document.getElementById('dailyStepChecklist'),
  stepProgressText: document.getElementById('stepProgressText'),
  stepCheckHint: document.getElementById('stepCheckHint'),
  learningPoints: document.getElementById('learningPoints'),
  todayCase: document.getElementById('todayCase'),
  practicePrompt: document.getElementById('practicePrompt'),
  outputTask: document.getElementById('outputTask'),
  completeDayButton: document.getElementById('completeDayButton'),
  roadmapBody: document.getElementById('roadmapBody'),
  toolGrid: document.getElementById('toolGrid'),
  headerProgressText: document.getElementById('headerProgressText'),
  headerProgressBar: document.getElementById('headerProgressBar'),
  mainProgressBar: document.getElementById('mainProgressBar'),
  progressPercent: document.getElementById('progressPercent'),
  timerDisplay: document.getElementById('timerDisplay'),
  timerStart: document.getElementById('timerStart'),
  timerReset: document.getElementById('timerReset'),
  timerStatus: document.getElementById('timerStatus'),
  customMinutes: document.getElementById('customMinutes'),
  applyCustomTime: document.getElementById('applyCustomTime'),
  floatingTimer: document.getElementById('floatingTimer'),
  floatingTimerDisplay: document.getElementById('floatingTimerDisplay'),
  floatingTimerStatus: document.getElementById('floatingTimerStatus'),
  floatingTimerToggle: document.getElementById('floatingTimerToggle'),
  floatingTimerReset: document.getElementById('floatingTimerReset'),
  resultInput: document.getElementById('resultInput'),
  saveResultButton: document.getElementById('saveResultButton'),
  saveMessage: document.getElementById('saveMessage'),
  savedResultsList: document.getElementById('savedResultsList'),
  clearResultsButton: document.getElementById('clearResultsButton')
};

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn(`無法讀取 ${key}`, error);
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getCurrentPlan() {
  return learningPlan.find(item => !state.completed.includes(item.day)) || learningPlan[learningPlan.length - 1];
}

function getDuration(item) {
  const override = Number(state.durationOverrides[item.day]);
  return Number.isFinite(override) && override >= 10 && override <= 360 ? override : item.duration;
}

function getStepItems(item) {
  return [...item.points, `完成今日成果：${item.deliverable}`];
}

function getStepState(day, stepCount) {
  const saved = Array.isArray(state.stepProgress[day]) ? state.stepProgress[day] : [];
  return Array.from({ length: stepCount }, (_, index) => Boolean(saved[index]));
}

function renderStepChecklist(item, finishedAll = false) {
  const steps = getStepItems(item);
  const checked = getStepState(item.day, steps.length);
  elements.dailyStepChecklist.innerHTML = steps.map((text, index) => `
    <li class="step-check-item ${checked[index] ? 'checked' : ''} ${index === steps.length - 1 ? 'final-step' : ''}">
      <label>
        <input type="checkbox" data-step-index="${index}" ${checked[index] ? 'checked' : ''}>
        <span>${escapeHtml(text)}</span>
      </label>
    </li>`).join('');
  const count = checked.filter(Boolean).length;
  elements.stepProgressText.textContent = `${count} / ${steps.length}`;
  const allDone = count === steps.length;
  elements.stepCheckHint.textContent = allDone
    ? '今日步驟已全部確認完成，可標記本日完成。'
    : `尚有 ${steps.length - count} 項未確認；可依實際進度逐項勾選。`;
  elements.stepCheckHint.classList.toggle('complete', allDone);
}

function setStepChecked(day, index, checked) {
  const item = learningPlan.find(plan => plan.day === day);
  if (!item) return;
  const steps = getStepItems(item);
  const progress = getStepState(day, steps.length);
  progress[index] = checked;
  state.stepProgress[day] = progress;
  saveJson(storageKeys.stepProgress, state.stepProgress);
  if (getCurrentPlan().day === day) renderStepChecklist(item, state.completed.length === learningPlan.length);
}

function toggleDayCompletion(day, checked) {
  const wasCurrentDay = getCurrentPlan().day;
  if (checked && !state.completed.includes(day)) state.completed.push(day);
  if (!checked) state.completed = state.completed.filter(value => value !== day);
  state.completed.sort((a, b) => a - b);
  saveJson(storageKeys.completed, state.completed);
  refreshApp();
  const newCurrentDay = getCurrentPlan().day;
  if (wasCurrentDay !== newCurrentDay && !state.timerRunning) syncTimerToCurrentPlan();
}

function updateDuration(day, minutes, syncTimer = false) {
  const value = Math.round(Number(minutes));
  if (!Number.isFinite(value) || value < 10 || value > 360) return false;
  state.durationOverrides[day] = value;
  saveJson(storageKeys.durationOverrides, state.durationOverrides);
  const current = getCurrentPlan();
  if (current.day === day) {
    elements.todayDuration.textContent = `${value} 分鐘`;
    elements.customMinutes.value = String(value);
    if (syncTimer && !state.timerRunning) {
      state.selectedMinutes = value;
      state.remainingSeconds = value * 60;
      document.querySelectorAll('.time-presets button').forEach(btn => {
        btn.classList.toggle('active', Number(btn.dataset.minutes) === value);
      });
      updateTimerControls('尚未開始', false);
      updateTimerDisplay();
    }
  }
  renderRoadmap();
  return true;
}

function syncTimerToCurrentPlan() {
  const current = getCurrentPlan();
  const minutes = getDuration(current);
  pauseTimer();
  state.selectedMinutes = minutes;
  state.remainingSeconds = minutes * 60;
  elements.customMinutes.value = String(minutes);
  document.querySelectorAll('.time-presets button').forEach(btn => {
    btn.classList.toggle('active', Number(btn.dataset.minutes) === minutes);
  });
  updateTimerControls('尚未開始', false);
  updateTimerDisplay();
}

function renderToday() {
  const item = getCurrentPlan();
  const finishedAll = state.completed.length === learningPlan.length;
  const duration = getDuration(item);
  elements.dayBadge.textContent = finishedAll ? '20 DAYS COMPLETE' : `DAY ${String(item.day).padStart(2, '0')} · ${item.phase}`;
  elements.todayTitle.textContent = finishedAll ? '20 天 AI 學習計畫已完成' : item.title;
  elements.todaySummary.textContent = finishedAll ? '你已完成本階段全部任務。可以回顧成果紀錄，挑選下一階段最值得深化的能力。' : item.summary;
  elements.todayDuration.textContent = finishedAll ? '回顧 30–60 分鐘' : `${duration} 分鐘`;
  elements.todayTool.textContent = item.tool;
  elements.todayDeliverable.textContent = finishedAll ? '整理成果作品集' : item.deliverable;
  elements.customMinutes.value = String(duration);
  renderStepChecklist(item, finishedAll);
  elements.learningPoints.innerHTML = item.points.map(point => `<li>${point}</li>`).join('');
  elements.todayCase.textContent = item.caseText;
  elements.practicePrompt.textContent = item.prompt;
  elements.outputTask.textContent = item.output;
  elements.completeDayButton.textContent = finishedAll ? '✓ 全部完成' : '✓ 標記今日完成';
  elements.completeDayButton.classList.toggle('completed', finishedAll);
  elements.completeDayButton.disabled = finishedAll;
}

function renderRoadmap() {
  const current = getCurrentPlan();
  elements.roadmapBody.innerHTML = learningPlan.map(item => {
    const done = state.completed.includes(item.day);
    const isCurrent = !done && item.day === current.day;
    const duration = getDuration(item);
    return `
      <tr class="${done ? 'done' : ''} ${isCurrent ? 'current' : ''}">
        <td>
          <label class="roadmap-check-wrap">
            <input class="roadmap-check" type="checkbox" data-day-complete="${item.day}" ${done ? 'checked' : ''} aria-label="標記 DAY ${String(item.day).padStart(2, '0')} ${done ? '未完成' : '完成'}">
            <span>DAY ${String(item.day).padStart(2, '0')}</span>
          </label>
        </td>
        <td><strong>${item.title}</strong><span class="phase-tag">${item.phase}</span></td>
        <td>${item.tool}</td>
        <td>${item.deliverable}</td>
        <td>
          <label class="roadmap-duration-control">
            <input class="roadmap-duration-input" type="number" min="10" max="360" step="5" value="${duration}" data-duration-day="${item.day}" aria-label="DAY ${String(item.day).padStart(2, '0')} 學習分鐘數">
            <span>分</span>
          </label>
        </td>
      </tr>`;
  }).join('');
}

function renderTools() {
  elements.toolGrid.innerHTML = tools.map(tool => `
    <article class="tool-card">
      <span class="tool-symbol">${tool.symbol}</span>
      <h3>${tool.name}</h3>
      <span class="tool-use">${tool.use}</span>
      <p>${tool.text}</p>
      <div class="tool-case"><strong>實用案例：</strong>${tool.caseText}</div>
    </article>`).join('');
}

function renderProgress() {
  const total = learningPlan.length;
  const count = state.completed.length;
  const percent = Math.round((count / total) * 100);
  elements.headerProgressText.textContent = `${count} / ${total}`;
  elements.headerProgressBar.style.width = `${percent}%`;
  elements.mainProgressBar.style.width = `${percent}%`;
  elements.progressPercent.textContent = `${percent}%`;
}

function renderResults() {
  if (!state.results.length) {
    elements.savedResultsList.innerHTML = '<div class="empty-state">尚未建立成果紀錄。完成今天的實作後，把結果留在這裡。</div>';
    return;
  }
  elements.savedResultsList.innerHTML = [...state.results].reverse().map(entry => `
    <div class="result-entry">
      <strong>DAY ${String(entry.day).padStart(2, '0')}<br>${entry.date}</strong>
      <p>${escapeHtml(entry.text)}</p>
    </div>`).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function refreshApp() {
  renderToday();
  renderRoadmap();
  renderProgress();
  renderResults();
}

function enterApp() {
  localStorage.setItem(storageKeys.started, 'true');
  elements.startScreen.classList.add('hidden');
  elements.appShell.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showStart() {
  pauseTimer();
  elements.appShell.classList.add('hidden');
  elements.startScreen.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function completeCurrentDay() {
  const item = getCurrentPlan();
  if (state.completed.includes(item.day)) return;
  const steps = getStepItems(item);
  const checkedCount = getStepState(item.day, steps.length).filter(Boolean).length;
  if (checkedCount < steps.length) {
    const confirmed = window.confirm(`今日還有 ${steps.length - checkedCount} 個步驟尚未勾選確認，仍要標記 DAY ${String(item.day).padStart(2, '0')} 完成嗎？`);
    if (!confirmed) return;
  }
  toggleDayCompletion(item.day, true);
  syncTimerToCurrentPlan();
  document.getElementById('today').scrollIntoView({ behavior: 'smooth' });
}

function saveResult() {
  const text = elements.resultInput.value.trim();
  if (text.length < 5) {
    elements.saveMessage.textContent = '請至少輸入 5 個字，記錄今天真正完成的成果。';
    return;
  }
  const item = getCurrentPlan();
  const today = new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  state.results.push({ day: item.day, date: today, text });
  saveJson(storageKeys.results, state.results);
  elements.resultInput.value = '';
  elements.saveMessage.textContent = '成果已儲存。';
  renderResults();
  setTimeout(() => { elements.saveMessage.textContent = ''; }, 2500);
}

function clearResults() {
  if (!state.results.length) return;
  const confirmed = window.confirm('確定要清除所有學習成果紀錄嗎？此動作無法復原。');
  if (!confirmed) return;
  state.results = [];
  saveJson(storageKeys.results, state.results);
  renderResults();
}

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map(value => String(value).padStart(2, '0')).join(':');
}

function updateTimerDisplay() {
  const timeText = formatTime(state.remainingSeconds);
  elements.timerDisplay.textContent = timeText;
  elements.floatingTimerDisplay.textContent = timeText;
}

function updateTimerControls(statusText, isRunning = false) {
  elements.timerStatus.textContent = statusText;
  elements.timerStatus.classList.toggle('running', isRunning);
  elements.floatingTimerStatus.textContent = statusText;
  elements.floatingTimerStatus.classList.toggle('running', isRunning);
  elements.timerStart.textContent = isRunning ? '暫停' : '開始計時';
  elements.floatingTimerToggle.textContent = isRunning ? '暫停' : '開始';
}

function initFloatingTimer() {
  const mainTimer = document.querySelector('.timer-card');
  if (!mainTimer || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(([entry]) => {
    const shouldFloat = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    elements.floatingTimer.classList.toggle('visible', shouldFloat);
    elements.floatingTimer.setAttribute('aria-hidden', String(!shouldFloat));
  }, { threshold: 0.08 });

  observer.observe(mainTimer);
}

function setTimerPreset(minutes, button) {
  if (state.timerRunning) return;
  state.selectedMinutes = minutes;
  state.remainingSeconds = minutes * 60;
  elements.customMinutes.value = String(minutes);
  document.querySelectorAll('.time-presets button').forEach(btn => btn.classList.toggle('active', btn === button));
  updateTimerDisplay();
}

function startOrPauseTimer() {
  if (state.timerRunning) {
    pauseTimer();
    return;
  }
  if (state.remainingSeconds <= 0) resetTimer();
  state.timerRunning = true;
  updateTimerControls('專注中', true);
  state.timerId = window.setInterval(() => {
    state.remainingSeconds -= 1;
    updateTimerDisplay();
    if (state.remainingSeconds <= 0) {
      pauseTimer();
      updateTimerControls('完成', false);
      updateTimerDisplay();
    }
  }, 1000);
}

function pauseTimer() {
  if (state.timerId) window.clearInterval(state.timerId);
  state.timerId = null;
  state.timerRunning = false;
  if (state.remainingSeconds > 0) {
    updateTimerControls('已暫停', false);
  } else {
    updateTimerControls('完成', false);
  }
}

function resetTimer() {
  pauseTimer();
  state.remainingSeconds = state.selectedMinutes * 60;
  updateTimerControls('尚未開始', false);
  updateTimerDisplay();
}

function applyCustomTime() {
  const current = getCurrentPlan();
  const minutes = Math.round(Number(elements.customMinutes.value));
  if (!Number.isFinite(minutes) || minutes < 10 || minutes > 360) {
    elements.customMinutes.setCustomValidity('請輸入 10 到 360 分鐘之間的時間。');
    elements.customMinutes.reportValidity();
    return;
  }
  elements.customMinutes.setCustomValidity('');
  if (state.timerRunning) pauseTimer();
  updateDuration(current.day, minutes, true);
}

function bindEvents() {
  elements.startButton.addEventListener('click', enterApp);
  elements.backToStart.addEventListener('click', showStart);
  elements.completeDayButton.addEventListener('click', completeCurrentDay);
  elements.saveResultButton.addEventListener('click', saveResult);
  elements.clearResultsButton.addEventListener('click', clearResults);
  elements.timerStart.addEventListener('click', startOrPauseTimer);
  elements.timerReset.addEventListener('click', resetTimer);
  elements.applyCustomTime.addEventListener('click', applyCustomTime);
  elements.customMinutes.addEventListener('keydown', event => {
    if (event.key === 'Enter') applyCustomTime();
  });
  elements.floatingTimerToggle.addEventListener('click', startOrPauseTimer);
  elements.floatingTimerReset.addEventListener('click', resetTimer);
  document.querySelectorAll('.time-presets button').forEach(button => {
    button.addEventListener('click', () => setTimerPreset(Number(button.dataset.minutes), button));
  });

  elements.dailyStepChecklist.addEventListener('change', event => {
    const checkbox = event.target.closest('input[data-step-index]');
    if (!checkbox) return;
    const item = getCurrentPlan();
    setStepChecked(item.day, Number(checkbox.dataset.stepIndex), checkbox.checked);
  });

  elements.roadmapBody.addEventListener('change', event => {
    const completeCheckbox = event.target.closest('input[data-day-complete]');
    if (completeCheckbox) {
      toggleDayCompletion(Number(completeCheckbox.dataset.dayComplete), completeCheckbox.checked);
      return;
    }
    const durationInput = event.target.closest('input[data-duration-day]');
    if (durationInput) {
      const day = Number(durationInput.dataset.durationDay);
      const minutes = Math.round(Number(durationInput.value));
      if (!updateDuration(day, minutes, getCurrentPlan().day === day)) {
        durationInput.value = String(getDuration(learningPlan.find(item => item.day === day)));
        durationInput.setCustomValidity('請輸入 10 到 360 分鐘之間的時間。');
        durationInput.reportValidity();
        durationInput.setCustomValidity('');
      }
    }
  });
}

function init() {
  const initialMinutes = getDuration(getCurrentPlan());
  state.selectedMinutes = initialMinutes;
  state.remainingSeconds = initialMinutes * 60;
  renderTools();
  refreshApp();
  updateTimerDisplay();
  updateTimerControls('尚未開始', false);
  bindEvents();
  initFloatingTimer();
  // 每次重新進入仍保留 START 首頁，符合「第一個畫面先出現 START」的需求。
}

init();
