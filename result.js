'use strict';

const CFG = window.AI_LMS_CONFIG || {};
const $ = id => document.getElementById(id);

const DAY_META = [
  [1,'基礎','AI 基礎與工作任務拆解','完成 3 組工作提示詞',90],
  [2,'基礎','提示詞進階與品質檢查','建立 Prompt 範本',90],
  [3,'文件','文件摘要與重點提取','完成 1 份摘要表',90],
  [4,'文件','訓練手冊與 SOP 協作','完成 1 頁 SOP',120],
  [5,'文件','Email、公告與內部溝通','建立 3 種訊息模板',60],
  [6,'研究','AI 搜尋與資料查核','完成來源比較表',90],
  [7,'研究','比較分析與決策建議','完成決策矩陣',90],
  [8,'研究','問卷與需求調查設計','完成 10 題問卷',90],
  [9,'資料','Sheets 公式與資料清理','完成自動計算表',120],
  [10,'資料','數據分析與 HRD 洞察','完成 3 點數據洞察',90],
  [11,'自動化','Forms × Sheets 工作流','完成流程草圖',120],
  [12,'自動化','Apps Script 入門','完成 1 個簡單自動化',120],
  [13,'自動化','建立 AI 工作流程 SOP','完成 1 份 AI SOP',90],
  [14,'資料','AI 輔助月報與視覺化','完成一頁月報',120],
  [15,'視覺','AI 圖像與教材視覺','完成 2 張教材圖',90],
  [16,'視覺','AI 簡報架構與設計','完成 5 頁簡報',120],
  [17,'整合','NotebookLM 知識整理','建立 1 個知識庫',90],
  [18,'整合','多工具 AI 工作流','完成一條跨工具流程',120],
  [19,'整合','AI 工作效益量化','完成效益比較表',90],
  [20,'成果','作品集與能力總結','完成個人 AI 作品集',120]
].map(([day_no,phase,title,deliverable,default_minutes])=>({day_no,phase,title,deliverable,default_minutes}));

function businessDate(start, day){
  const d = new Date(`${start}T12:00:00`);
  let n = 1;
  while(n < day){
    d.setDate(d.getDate()+1);
    if(d.getDay()!==0 && d.getDay()!==6) n++;
  }
  return d.toISOString().slice(0,10);
}

function loadContext(){
  const params = new URLSearchParams(location.search);
  const dayNo = Math.max(1, Math.min(20, Number(params.get('day')) || 1));
  const email = sessionStorage.getItem('ai-learning-active-email') || '';
  const name = sessionStorage.getItem('ai-learning-active-name') || '';
  const prefix = CFG.STORAGE_PREFIX || 'ai-learning-v3:';
  let store = null;

  if(email){
    try{ store = JSON.parse(localStorage.getItem(prefix + email.toLowerCase()) || 'null'); }catch(e){ store = null; }
  }

  if(!store){
    const keys=[];
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(key && key.startsWith(prefix)) keys.push(key);
    }
    if(keys.length===1){
      try{ store = JSON.parse(localStorage.getItem(keys[0]) || 'null'); }catch(e){ store=null; }
    }
  }

  return {dayNo,email,name,store};
}

function render(){
  const {dayNo,email,name,store} = loadContext();
  const meta = DAY_META.find(x=>x.day_no===dayNo);
  const record = store?.records?.[dayNo] || {};
  const checks = store?.checklist?.[dayNo] || {};
  const startDate = store?.startDate || new Date().toISOString().slice(0,10);
  const status = record.status || 'not_started';

  $('personInfo').textContent = [name,email].filter(Boolean).join(' · ') || '目前瀏覽器的個人學習紀錄';
  $('dayLabel').textContent = `DAY ${String(dayNo).padStart(2,'0')} · ${meta.phase}`;
  $('resultTitle').textContent = meta.title;
  $('resultDeliverable').textContent = `成果目標：${meta.deliverable}`;

  const statusText = status==='completed' ? '已完成' : status==='in_progress' ? '進行中' : '尚未開始';
  $('resultStatus').innerHTML = `<span class="status-pill ${status==='completed'?'completed':status==='in_progress'?'progress':''}">${statusText}</span>`;
  $('resultDate').textContent = record.schedule_date || businessDate(startDate,dayNo);
  $('plannedMinutes').textContent = `${Number(record.planned_minutes || meta.default_minutes)} 分`;
  $('actualMinutes').textContent = `${Number(record.actual_minutes || 0)} 分`;

  const answer = String(record.result_note || '').trim();
  $('answerBox').textContent = answer || '尚未留下成果紀錄。';
  $('answerBox').classList.toggle('empty', !answer);

  const labels = [
    '閱讀今日學習重點',
    '完成至少一次實際操作',
    '留下成果或學習紀錄',
    `完成今日成果：${meta.deliverable}`
  ];
  $('checkList').innerHTML = labels.map((text,i)=>{
    const item = checks[i+1];
    const done = !!item?.checked;
    return `<li class="${done?'done':'not-done'}">${done?'✓':'○'} ${text}</li>`;
  }).join('');
}

render();
