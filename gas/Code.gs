const CONFIG = {
  SPREADSHEET_ID: '1F7xV0zrEAkcMkDgLun_T-6Pm4fWmu4Bubxksdy9ubBI',
  GOOGLE_CLIENT_ID: '731637287753-diajenfrr7p0bs43isijf1t40u7a07m6.apps.googleusercontent.com',
  ADMIN_EMAIL: 'edu.fmsc@gmail.com',
  TIMEZONE: 'Asia/Taipei',
  API_VERSION: '2.1'
};

const HEADERS = {
  Users: ['user_id','email','name','picture','start_date','last_login','current_day','status','created_at','updated_at'],
  LearningPlan: ['day_no','phase','title','tool','default_minutes','deliverable','summary','points_json','checklist_json','case_text','practice_prompt','output_task','capability_tags','active'],
  LearningRecords: ['record_id','user_id','day_no','schedule_date','planned_minutes','actual_minutes','status','completed_at','result_note','updated_at'],
  Checklist: ['user_id','day_no','item_no','item_text','checked','checked_at','updated_at'],
  Checkins: ['checkin_id','user_id','checkin_date','checkin_time','day_no','created_at'],
  Portfolio: ['portfolio_id','user_id','day_no','title','tools','result','result_link','created_at','updated_at'],
  AI_Report: ['report_id','user_id','generated_at','completion_rate','total_minutes','prompt_score','document_score','research_score','data_score','automation_score','visual_score','workflow_score','strengths','skill_gaps','next_steps'],
  Settings: ['key','value','description']
};

const PLAN = [
  [1,'基礎','AI 基礎與工作任務拆解','ChatGPT',90,'完成 3 組工作提示詞','prompt'],
  [2,'基礎','提示詞進階與品質檢查','ChatGPT',90,'建立 Prompt 範本','prompt'],
  [3,'文件','文件摘要與重點提取','ChatGPT / NotebookLM',90,'完成 1 份摘要表','document,research'],
  [4,'文件','訓練手冊與 SOP 協作','ChatGPT',120,'完成 1 頁 SOP','document,workflow'],
  [5,'文件','Email、公告與內部溝通','ChatGPT',60,'建立 3 種訊息模板','document,prompt'],
  [6,'研究','AI 搜尋與資料查核','ChatGPT Search',90,'完成來源比較表','research'],
  [7,'研究','比較分析與決策建議','ChatGPT',90,'完成決策矩陣','research,data'],
  [8,'研究','問卷與需求調查設計','ChatGPT / Forms',90,'完成 10 題問卷','research,document'],
  [9,'資料','Sheets 公式與資料清理','ChatGPT + Sheets',120,'完成自動計算表','data'],
  [10,'資料','數據分析與 HRD 洞察','ChatGPT',90,'完成 3 點數據洞察','data,research'],
  [11,'自動化','Forms × Sheets 工作流','Forms / Sheets',120,'完成流程草圖','workflow,automation'],
  [12,'自動化','Apps Script 入門','Apps Script',120,'完成 1 個簡單自動化','automation'],
  [13,'自動化','建立 AI 工作流程 SOP','ChatGPT',90,'完成 1 份 AI SOP','workflow,prompt'],
  [14,'資料','AI 輔助月報與視覺化','ChatGPT / Sheets',120,'完成一頁月報','data,visual'],
  [15,'視覺','AI 圖像與教材視覺','Image AI',90,'完成 2 張教材圖','visual,prompt'],
  [16,'視覺','AI 簡報架構與設計','ChatGPT / Slides',120,'完成 5 頁簡報','visual,document'],
  [17,'整合','NotebookLM 知識整理','NotebookLM',90,'建立 1 個知識庫','research,document'],
  [18,'整合','多工具 AI 工作流','AI + Google Workspace',120,'完成一條跨工具流程','workflow,automation'],
  [19,'整合','AI 工作效益量化','ChatGPT / Sheets',90,'完成效益比較表','data,workflow'],
  [20,'成果','作品集與能力總結','ChatGPT',120,'完成個人 AI 作品集','prompt,document,research,data,automation,visual,workflow']
];

function setupDatabase() {
  const ss = db_();
  Object.keys(HEADERS).forEach(function(name) {
    ensureSheet_(ss, name, HEADERS[name]);
  });
  seedPlan_();
  setSetting_('admin_email', CONFIG.ADMIN_EMAIL, '系統管理者');
  setSetting_('schedule_mode', 'weekday', '週一至週五自動排程');
  setSetting_('version', CONFIG.API_VERSION, 'AI Learning System GAS API');
  SpreadsheetApp.flush();
  return 'OK - Learning-AI GAS API ' + CONFIG.API_VERSION;
}

function diagnoseDatabase() {
  const ss = db_();
  const result = {
    spreadsheet_id: CONFIG.SPREADSHEET_ID,
    api_version: CONFIG.API_VERSION,
    sheets: {}
  };
  Object.keys(HEADERS).forEach(function(name) {
    const sheet = ss.getSheetByName(name);
    result.sheets[name] = sheet ? {
      exists: true,
      rows: sheet.getLastRow(),
      columns: sheet.getLastColumn()
    } : {exists: false};
  });
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function ensureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getMaxColumns() < headers.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  }
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  return sheet;
}

function setSetting_(key, value, description) {
  const sheet = db_().getSheetByName('Settings');
  const rows = rows_('Settings');
  const old = rows.find(function(item) { return String(item.key) === String(key); });
  if (old) {
    const row = findRow_('Settings', 'key', key);
    sheet.getRange(row, 1, 1, 3).setValues([[key, value, description]]);
  } else {
    sheet.appendRow([key, value, description]);
  }
}

function seedPlan_() {
  const sheet = db_().getSheetByName('LearningPlan');
  if (sheet.getLastRow() > 1) return;

  PLAN.forEach(function(item) {
    const title = item[2];
    const deliverable = item[5];
    const points = [
      '了解「' + title + '」的核心方法',
      '完成一個與工作相關的實作',
      '檢查成果是否可重複使用'
    ];
    const checks = [
      '閱讀今日學習重點',
      '完成至少一次實際操作',
      '留下成果或學習紀錄',
      '完成今日成果：' + deliverable
    ];

    sheet.appendRow([
      item[0], item[1], title, item[3], item[4], deliverable,
      '以實際工作情境練習「' + title + '」，把學習轉成可重複使用的成果。',
      JSON.stringify(points), JSON.stringify(checks),
      '選擇一項目前工作上的真實任務，使用今日方法完成改善。',
      '請依今日主題協助我拆解任務、提出步驟，並在輸出前檢查遺漏與風險。',
      '完成並記錄：' + deliverable,
      JSON.stringify(item[6].split(',')), true
    ]);
  });
}

function doGet(e) {
  const query = e && e.parameter ? e.parameter : {};
  const callback = query.callback || '';

  try {
    const action = query.action || 'health';

    if (action === 'health') {
      return out_({
        ok: true,
        data: {
          message: 'AI Learning API OK',
          api_version: CONFIG.API_VERSION,
          time: now_()
        }
      }, callback);
    }

    const profile = verify_(query.credential || '');
    const payload = query.payload ? JSON.parse(query.payload) : {};
    let data;

    if (action === 'bootstrap') data = withLock_(function() { return bootstrap_(profile); });
    else if (action === 'checkin') data = withLock_(function() { return checkin_(profile, payload); });
    else if (action === 'saveChecklist') data = withLock_(function() { return saveChecklist_(profile, payload); });
    else if (action === 'saveRecord') data = withLock_(function() { return saveRecord_(profile, payload); });
    else if (action === 'savePortfolio') data = withLock_(function() { return savePortfolio_(profile, payload); });
    else if (action === 'generateReport') data = withLock_(function() { return generateReport_(profile); });
    else if (action === 'importCheckins') data = withLock_(function() { return importCheckins_(profile, payload); });
    else if (action === 'importChecklist') data = withLock_(function() { return importChecklist_(profile, payload); });
    else throw Error('未知 action：' + action);

    return out_({ok: true, data: data}, callback);
  } catch (error) {
    return out_({
      ok: false,
      error: error && error.message ? error.message : String(error)
    }, callback);
  }
}

function withLock_(callback) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}

function verify_(token) {
  if (!token) throw Error('請先登入 Google 帳號');

  const response = UrlFetchApp.fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token),
    {muteHttpExceptions: true}
  );

  if (response.getResponseCode() !== 200) {
    throw Error('Google 登入憑證無效或已過期');
  }

  const payload = JSON.parse(response.getContentText());
  if (String(payload.email_verified) !== 'true') throw Error('Google Email 尚未驗證');
  if (CONFIG.GOOGLE_CLIENT_ID && payload.aud !== CONFIG.GOOGLE_CLIENT_ID) {
    throw Error('Google Client ID 不符');
  }

  return {
    email: payload.email,
    name: payload.name || payload.email,
    picture: payload.picture || ''
  };
}

function bootstrap_(profile) {
  setupDatabase();

  const user = upsertUser_(profile);
  const plan = plan_();
  const records = rows_('LearningRecords').filter(function(item) { return item.user_id === user.user_id; });
  const checklist = rows_('Checklist').filter(function(item) { return item.user_id === user.user_id; });
  const checkins = rows_('Checkins').filter(function(item) { return item.user_id === user.user_id; });
  const portfolio = rows_('Portfolio').filter(function(item) { return item.user_id === user.user_id; });
  const reports = rows_('AI_Report').filter(function(item) { return item.user_id === user.user_id; });
  const completed = records.filter(function(item) { return item.status === 'completed'; }).map(function(item) { return Number(item.day_no); });
  let currentNo = 20;

  for (let i = 0; i < plan.length; i++) {
    if (completed.indexOf(Number(plan[i].day_no)) === -1) {
      currentNo = Number(plan[i].day_no);
      break;
    }
  }

  const planWithDates = plan.map(function(item) {
    const copy = Object.assign({}, item);
    copy.schedule_date = scheduleDate_(user.start_date, Number(item.day_no));
    return copy;
  });

  const currentPlan = planWithDates.find(function(item) { return Number(item.day_no) === Number(currentNo); }) || planWithDates[0] || null;
  const currentRecord = records.find(function(item) { return Number(item.day_no) === Number(currentNo); }) || null;
  const currentChecklist = checklist
    .filter(function(item) { return Number(item.day_no) === Number(currentNo); })
    .map(function(item) {
      const copy = Object.assign({}, item);
      copy.checked = isTrue_(item.checked);
      return copy;
    });
  const todayCheckin = checkins.find(function(item) { return item.checkin_date === today_(); }) || null;
  const report = reports.length ? reports[reports.length - 1] : null;

  return {
    api_version: CONFIG.API_VERSION,
    user: user,
    plan: planWithDates,
    records: records,
    checklist: checklist,
    checkins: checkins,
    currentPlan: currentPlan,
    currentRecord: currentRecord,
    currentChecklist: currentChecklist,
    todayCheckin: todayCheckin,
    portfolio: portfolio,
    report: report,
    stats: {
      completedDays: completed.length,
      streakDays: streak_(checkins),
      totalMinutes: records.reduce(function(sum, item) {
        return sum + (Number(item.actual_minutes) || 0);
      }, 0),
      portfolioCount: portfolio.length
    }
  };
}

function upsertUser_(profile) {
  const sheet = db_().getSheetByName('Users');
  const all = rows_('Users');
  let user = all.find(function(item) {
    return String(item.email).toLowerCase() === String(profile.email).toLowerCase();
  });
  const now = now_();

  if (!user) {
    const id = 'U-' + Utilities.getUuid().slice(0, 8);
    sheet.appendRow([
      id, profile.email, profile.name, profile.picture,
      today_(), now, 1, 'active', now, now
    ]);
    user = rows_('Users').find(function(item) { return item.user_id === id; });
  } else {
    const row = findRow_('Users', 'user_id', user.user_id);
    sheet.getRange(row, 2, 1, 9).setValues([[
      profile.email,
      profile.name,
      profile.picture,
      user.start_date || today_(),
      now,
      user.current_day || 1,
      user.status || 'active',
      user.created_at || now,
      now
    ]]);
    user = rows_('Users').find(function(item) { return item.user_id === user.user_id; });
  }

  return user;
}

function checkin_(profile, data) {
  const user = upsertUser_(profile);
  const today = today_();
  const all = rows_('Checkins');

  if (all.some(function(item) {
    return item.user_id === user.user_id && item.checkin_date === today;
  })) {
    return {message: '今天已打卡'};
  }

  db_().getSheetByName('Checkins').appendRow([
    Utilities.getUuid(),
    user.user_id,
    today,
    Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'HH:mm:ss'),
    positiveInt_(data.day_no, 1),
    now_()
  ]);

  return {message: '打卡成功'};
}

function importCheckins_(profile, data) {
  const user = upsertUser_(profile);
  const dates = Array.isArray(data.dates) ? data.dates : [];
  const sheet = db_().getSheetByName('Checkins');
  const existing = new Set(
    rows_('Checkins')
      .filter(function(item) { return item.user_id === user.user_id; })
      .map(function(item) { return item.checkin_date; })
  );
  let imported = 0;

  dates.forEach(function(date) {
    const value = String(date || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || existing.has(value)) return;
    sheet.appendRow([Utilities.getUuid(), user.user_id, value, '', '', now_()]);
    existing.add(value);
    imported++;
  });

  return {imported: imported};
}

function saveChecklist_(profile, data) {
  const user = upsertUser_(profile);
  const dayNo = positiveInt_(data.day_no, 0);
  const itemNo = positiveInt_(data.item_no, 0);
  if (!dayNo || !itemNo) throw Error('Checklist day_no / item_no 無效');

  return upsertChecklist_(
    user,
    dayNo,
    itemNo,
    String(data.item_text || ''),
    !!data.checked
  );
}

function importChecklist_(profile, data) {
  const user = upsertUser_(profile);
  const items = Array.isArray(data.items) ? data.items : [];
  const plans = new Map(
    plan_().map(function(item) { return [Number(item.day_no), item]; })
  );
  let imported = 0;

  items.forEach(function(item) {
    const day = positiveInt_(item.day_no, 0);
    const no = positiveInt_(item.item_no, 0);
    if (!day || !no) return;

    const plan = plans.get(day);
    const text = plan && Array.isArray(plan.checklist)
      ? (plan.checklist[no - 1] || '')
      : '';

    upsertChecklist_(user, day, no, text, !!item.checked);
    imported++;
  });

  return {imported: imported};
}

function upsertChecklist_(user, dayNo, itemNo, itemText, checked) {
  const sheet = db_().getSheetByName('Checklist');
  const old = rows_('Checklist').find(function(item) {
    return item.user_id === user.user_id &&
      Number(item.day_no) === Number(dayNo) &&
      Number(item.item_no) === Number(itemNo);
  });
  const row = [
    user.user_id,
    Number(dayNo),
    Number(itemNo),
    itemText,
    !!checked,
    checked ? now_() : '',
    now_()
  ];

  if (old) {
    const rowNo = findCompositeRow_('Checklist', [
      ['user_id', user.user_id],
      ['day_no', dayNo],
      ['item_no', itemNo]
    ]);
    sheet.getRange(rowNo, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  return {saved: true};
}

function saveRecord_(profile, data) {
  const user = upsertUser_(profile);
  const dayNo = positiveInt_(data.day_no, 0);
  if (!dayNo) throw Error('LearningRecords day_no 無效');

  const sheet = db_().getSheetByName('LearningRecords');
  const old = rows_('LearningRecords').find(function(item) {
    return item.user_id === user.user_id && Number(item.day_no) === dayNo;
  });

  const recordId = old ? old.record_id : Utilities.getUuid();
  let status = ['not_started','in_progress','completed'].indexOf(String(data.status)) >= 0
    ? String(data.status)
    : 'in_progress';

  if (old && old.status === 'completed' && status !== 'completed') {
    status = 'completed';
  }

  const plannedMinutes = clampNumber_(data.planned_minutes, 10, 360, old ? Number(old.planned_minutes) || 90 : 90);
  const incomingActual = clampNumber_(data.actual_minutes, 0, 1000000, 0);
  const previousActual = old ? clampNumber_(old.actual_minutes, 0, 1000000, 0) : 0;
  const actualMinutes = Math.max(previousActual, incomingActual);
  const incomingNote = String(data.result_note || '');
  const resultNote = incomingNote.trim() || !old ? incomingNote : String(old.result_note || '');
  const completedAt = status === 'completed'
    ? (old && old.completed_at ? old.completed_at : now_())
    : '';

  const row = [
    recordId,
    user.user_id,
    dayNo,
    scheduleDate_(user.start_date, dayNo),
    plannedMinutes,
    actualMinutes,
    status,
    completedAt,
    resultNote,
    now_()
  ];

  if (old) {
    const rowNo = findCompositeRow_('LearningRecords', [
      ['user_id', user.user_id],
      ['day_no', dayNo]
    ]);
    sheet.getRange(rowNo, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  return {
    saved: true,
    status: status,
    day_no: dayNo,
    actual_minutes: actualMinutes
  };
}

function savePortfolio_(profile, data) {
  const title = String(data.title || '').trim();
  if (!title) throw Error('請輸入作品名稱');

  const user = upsertUser_(profile);
  const dayNo = positiveInt_(data.day_no, 20);
  const tools = String(data.tools || '');
  const result = String(data.result || '');
  const resultLink = String(data.result_link || '');
  const sheet = db_().getSheetByName('Portfolio');
  const old = rows_('Portfolio').find(function(item) {
    return item.user_id === user.user_id &&
      Number(item.day_no) === dayNo &&
      String(item.title) === title &&
      String(item.result_link || '') === resultLink;
  });

  if (old) {
    const rowNo = findRow_('Portfolio', 'portfolio_id', old.portfolio_id);
    sheet.getRange(rowNo, 1, 1, HEADERS.Portfolio.length).setValues([[
      old.portfolio_id,
      user.user_id,
      dayNo,
      title,
      tools,
      result,
      resultLink,
      old.created_at || now_(),
      now_()
    ]]);
    return {saved: true, portfolio_id: old.portfolio_id, updated: true};
  }

  const id = Utilities.getUuid();
  sheet.appendRow([
    id, user.user_id, dayNo, title, tools, result,
    resultLink, now_(), now_()
  ]);
  return {saved: true, portfolio_id: id, updated: false};
}

function generateReport_(profile) {
  const user = upsertUser_(profile);
  const plan = plan_();
  const records = rows_('LearningRecords').filter(function(item) {
    return item.user_id === user.user_id;
  });
  const completed = new Set(
    records
      .filter(function(item) { return item.status === 'completed'; })
      .map(function(item) { return Number(item.day_no); })
  );
  const minutes = records.reduce(function(sum, item) {
    return sum + (Number(item.actual_minutes) || 0);
  }, 0);

  const keys = ['prompt','document','research','data','automation','visual','workflow'];
  const total = {};
  const achieved = {};
  keys.forEach(function(key) {
    total[key] = 0;
    achieved[key] = 0;
  });

  plan.forEach(function(item) {
    (item.capability_tags || []).forEach(function(key) {
      if (!(key in total)) return;
      total[key]++;
      if (completed.has(Number(item.day_no))) achieved[key]++;
    });
  });

  function score(key) {
    return total[key] ? Math.round(achieved[key] / total[key] * 100) : 0;
  }

  const scores = {
    prompt_score: score('prompt'),
    document_score: score('document'),
    research_score: score('research'),
    data_score: score('data'),
    automation_score: score('automation'),
    visual_score: score('visual'),
    workflow_score: score('workflow')
  };

  const pairs = Object.keys(scores)
    .map(function(key) { return [key, scores[key]]; })
    .sort(function(a, b) { return b[1] - a[1]; });
  const strengths = pairs.slice(0, 2).map(function(item) { return label_(item[0]); }).join('、');
  const gaps = pairs.slice(-2).map(function(item) { return label_(item[0]); }).join('、');
  const next = '優先加強「' + gaps + '」，並從作品集中挑選 1 個流程持續優化。';
  const rate = plan.length ? Math.round(completed.size / plan.length * 100) : 0;

  db_().getSheetByName('AI_Report').appendRow([
    Utilities.getUuid(),
    user.user_id,
    now_(),
    rate,
    minutes,
    scores.prompt_score,
    scores.document_score,
    scores.research_score,
    scores.data_score,
    scores.automation_score,
    scores.visual_score,
    scores.workflow_score,
    strengths,
    gaps,
    next
  ]);

  return {
    completion_rate: rate,
    total_minutes: minutes,
    prompt_score: scores.prompt_score,
    document_score: scores.document_score,
    research_score: scores.research_score,
    data_score: scores.data_score,
    automation_score: scores.automation_score,
    visual_score: scores.visual_score,
    workflow_score: scores.workflow_score,
    strengths: strengths,
    skill_gaps: gaps,
    next_steps: next
  };
}

function plan_() {
  return rows_('LearningPlan')
    .filter(function(item) {
      return String(item.active).toUpperCase() !== 'FALSE';
    })
    .map(function(item) {
      return {
        day_no: Number(item.day_no),
        phase: item.phase,
        title: item.title,
        tool: item.tool,
        default_minutes: Number(item.default_minutes),
        deliverable: item.deliverable,
        summary: item.summary,
        points: parse_(item.points_json),
        checklist: parse_(item.checklist_json),
        case_text: item.case_text,
        practice_prompt: item.practice_prompt,
        output_task: item.output_task,
        capability_tags: parse_(item.capability_tags),
        active: item.active
      };
    })
    .sort(function(a, b) { return a.day_no - b.day_no; });
}

function scheduleDate_(start, day) {
  const date = new Date((start || today_()) + 'T12:00:00');
  let count = 1;

  while (count < day) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) count++;
  }

  return Utilities.formatDate(date, CONFIG.TIMEZONE, 'yyyy-MM-dd');
}

function streak_(items) {
  const dates = Array.from(new Set(
    items.map(function(item) { return item.checkin_date; }).filter(Boolean)
  )).sort().reverse();

  if (!dates.length) return 0;

  const current = new Date(today_() + 'T12:00:00');
  let count = 0;

  for (let i = 0; i < dates.length; i++) {
    while (current.getDay() === 0 || current.getDay() === 6) {
      current.setDate(current.getDate() - 1);
    }

    const currentText = Utilities.formatDate(current, CONFIG.TIMEZONE, 'yyyy-MM-dd');
    if (dates[i] === currentText) {
      count++;
      current.setDate(current.getDate() - 1);
    } else if (dates[i] < currentText) {
      break;
    }
  }

  return count;
}

function label_(key) {
  const labels = {
    prompt_score: 'Prompt',
    document_score: '文件處理',
    research_score: '搜尋研究',
    data_score: '資料分析',
    automation_score: '自動化',
    visual_score: '視覺表達',
    workflow_score: '工作流程整合'
  };
  return labels[key] || key;
}

function rows_(name) {
  const sheet = db_().getSheetByName(name);
  if (!sheet || sheet.getLastRow() < 2) return [];

  const values = sheet.getDataRange().getDisplayValues();
  const headers = values[0];

  return values
    .slice(1)
    .filter(function(row) {
      return row.some(function(cell) { return cell !== ''; });
    })
    .map(function(row) {
      const object = {};
      headers.forEach(function(key, index) {
        object[key] = row[index];
      });
      return object;
    });
}

function findRow_(name, key, value) {
  const rows = rows_(name);
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][key]) === String(value)) return i + 2;
  }
  return -1;
}

function findCompositeRow_(name, pairs) {
  const rows = rows_(name);

  for (let i = 0; i < rows.length; i++) {
    let matched = true;
    for (let j = 0; j < pairs.length; j++) {
      if (String(rows[i][pairs[j][0]]) !== String(pairs[j][1])) {
        matched = false;
        break;
      }
    }
    if (matched) return i + 2;
  }

  throw Error('找不到要更新的資料');
}

function parse_(value) {
  try {
    return JSON.parse(value || '[]');
  } catch (error) {
    return [];
  }
}

function isTrue_(value) {
  return value === true || String(value).toUpperCase() === 'TRUE';
}

function positiveInt_(value, fallback) {
  const number = Math.floor(Number(value));
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function clampNumber_(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function db_() {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}

function today_() {
  return Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');
}

function now_() {
  return Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
}

function out_(object, callback) {
  const text = JSON.stringify(object);

  if (callback) {
    if (!/^[A-Za-z_$][\w$]*$/.test(callback)) {
      throw Error('callback 不合法');
    }
    return ContentService
      .createTextOutput(callback + '(' + text + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(text)
    .setMimeType(ContentService.MimeType.JSON);
}
