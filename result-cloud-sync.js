'use strict';

(function () {
  const CFG_LOCAL = window.AI_LMS_CONFIG || {};
  const TOKEN_KEY = 'ai-learning-google-credential';
  const credential = sessionStorage.getItem(TOKEN_KEY) || '';
  if (!CFG_LOCAL.API_URL || !credential) return;

  function isTrue(value) {
    return value === true || String(value).toUpperCase() === 'TRUE';
  }

  function parseStamp(value) {
    if (!value) return 0;
    const raw = String(value).trim();
    let parsed = Date.parse(raw);
    if (!Number.isNaN(parsed)) return parsed;
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(raw)) parsed = Date.parse(raw.replace(' ', 'T') + '+08:00');
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  function chooseRecord(localRecord, cloudRecord) {
    if (!localRecord) return cloudRecord;
    if (!cloudRecord) return localRecord;
    const localTime = parseStamp(localRecord.updated_at);
    const cloudTime = parseStamp(cloudRecord.updated_at);
    if (localTime && cloudTime) return localTime > cloudTime ? localRecord : cloudRecord;
    return cloudRecord;
  }

  function jsonp(action, payload = {}) {
    return new Promise((resolve, reject) => {
      const cb = 'aiLmsResultGas_' + Date.now() + '_' + Math.random().toString(36).slice(2);
      const script = document.createElement('script');
      const params = new URLSearchParams({action,callback:cb,credential,payload:JSON.stringify(payload || {}),_:String(Date.now())});
      let finished = false;
      const timeout = setTimeout(() => finish(new Error('GAS API 連線逾時')), 15000);
      function finish(error, value) {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        delete window[cb];
        script.remove();
        error ? reject(error) : resolve(value);
      }
      window[cb] = response => finish(null, response);
      script.onerror = () => finish(new Error('無法連線 Google Apps Script Web App'));
      script.src = CFG_LOCAL.API_URL + '?' + params.toString();
      document.head.appendChild(script);
    });
  }

  async function api(action, payload = {}) {
    const response = await jsonp(action, payload);
    if (!response?.ok) throw new Error(response?.error || 'GAS API 操作失敗');
    return response.data;
  }

  async function loadCloudDay() {
    try {
      const remote = await api('bootstrap');
      context = loadContext();
      if (!context.storageKey) return;
      ensureStore();
      const day = Number(context.dayNo);
      const cloudRecord = (remote.records || []).find(item => Number(item.day_no) === day);
      const localRecord = context.store.records?.[day];
      const picked = chooseRecord(localRecord, cloudRecord);
      if (picked) {
        context.store.records[day] = {...picked,day_no:day,planned_minutes:Number(picked.planned_minutes || 0),actual_minutes:Number(picked.actual_minutes || 0)};
      }
      const allChecks = Array.isArray(remote.checklist) && remote.checklist.length ? remote.checklist : (Number(remote.currentPlan?.day_no) === day ? (remote.currentChecklist || []) : []);
      const dayChecks = allChecks.filter(item => Number(item.day_no || day) === day);
      if (dayChecks.length) {
        context.store.checklist[day] ||= {};
        dayChecks.forEach(item => {
          const no = Number(item.item_no);
          if (!no) return;
          context.store.checklist[day][no] = {checked:isTrue(item.checked),item_text:item.item_text || '',checked_at:item.checked_at || '',updated_at:item.updated_at || ''};
        });
      }
      if (remote.user?.start_date) context.store.startDate = remote.user.start_date;
      localStorage.setItem(context.storageKey, JSON.stringify(context.store));
      render();
    } catch (error) {
      const message = document.getElementById('supplementMessage');
      if (message) message.textContent = '目前顯示本機紀錄；GAS 讀取失敗：' + error.message;
    }
  }

  async function syncSupplement() {
    try {
      context = loadContext();
      ensureStore();
      const day = Number(context.dayNo);
      const record = context.store.records?.[day] || {};
      await api('saveRecord', {
        day_no: day,
        planned_minutes: Number(record.planned_minutes || 90),
        actual_minutes: Number(record.actual_minutes || 0),
        status: record.status || 'in_progress',
        result_note: record.result_note || ''
      });
      const checks = context.store.checklist?.[day] || {};
      for (const [no, item] of Object.entries(checks)) {
        await api('saveChecklist', {day_no:day,item_no:Number(no),item_text:item.item_text || '',checked:!!item.checked});
      }
      const message = document.getElementById('supplementMessage');
      if (message) message.textContent = '已儲存補登／修改，並同步至 Google Sheet。';
    } catch (error) {
      const message = document.getElementById('supplementMessage');
      if (message) message.textContent = '本機已儲存，但 Google Sheet 同步失敗：' + error.message;
    }
  }

  const saveButton = document.getElementById('saveSupplementBtn');
  if (saveButton) saveButton.addEventListener('click', () => setTimeout(syncSupplement, 0));
  loadCloudDay();
})();
