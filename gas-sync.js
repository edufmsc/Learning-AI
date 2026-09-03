'use strict';

(function () {
  if (typeof CFG === 'undefined' || !CFG.API_URL) return;

  const TOKEN_KEY = 'ai-learning-google-credential';
  const CLOUD_CHECKPOINT_MS = 60000;
  let cloudCredential = sessionStorage.getItem(TOKEN_KEY) || '';
  let cloudConnected = false;
  let checkpointId = null;

  function parseStamp(value) {
    if (!value) return 0;
    const raw = String(value).trim();
    let parsed = Date.parse(raw);
    if (!Number.isNaN(parsed)) return parsed;
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(raw)) parsed = Date.parse(raw.replace(' ', 'T') + '+08:00');
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  function isTrue(value) {
    return value === true || String(value).toUpperCase() === 'TRUE';
  }

  function jsonp(action, payload = {}) {
    return new Promise((resolve, reject) => {
      if (!CFG.API_URL) return reject(new Error('尚未設定 GAS API_URL'));
      if (action !== 'health' && !cloudCredential) return reject(new Error('Google 登入憑證不存在，請重新登入'));

      const cb = 'aiLmsGas_' + Date.now() + '_' + Math.random().toString(36).slice(2);
      const script = document.createElement('script');
      const params = new URLSearchParams({
        action,
        callback: cb,
        credential: cloudCredential,
        payload: JSON.stringify(payload || {}),
        _: String(Date.now())
      });
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
      script.src = CFG.API_URL + '?' + params.toString();
      document.head.appendChild(script);
    });
  }

  async function gasApi(action, payload = {}) {
    const response = await jsonp(action, payload);
    if (!response?.ok) throw new Error(response?.error || 'GAS API 操作失敗');
    return response.data;
  }

  function cloudStoreFromBootstrap(remote) {
    const store = blankStore();
    store.startDate = remote?.user?.start_date || store.startDate;
    store.records = {};
    (remote?.records || []).forEach(record => {
      const day = Number(record.day_no);
      if (!day) return;
      store.records[day] = {
        ...record,
        day_no: day,
        planned_minutes: Number(record.planned_minutes || 0),
        actual_minutes: Number(record.actual_minutes || 0)
      };
    });

    store.checklist = {};
    const allChecks = Array.isArray(remote?.checklist) && remote.checklist.length ? remote.checklist : (remote?.currentChecklist || []);
    allChecks.forEach(item => {
      const day = Number(item.day_no || remote?.currentPlan?.day_no);
      const no = Number(item.item_no);
      if (!day || !no) return;
      store.checklist[day] ||= {};
      store.checklist[day][no] = {
        checked: isTrue(item.checked),
        item_text: item.item_text || '',
        checked_at: item.checked_at || '',
        updated_at: item.updated_at || ''
      };
    });

    const cloudCheckins = Array.isArray(remote?.checkins) ? remote.checkins : [];
    store.checkins = cloudCheckins.map(item => item.checkin_date).filter(Boolean);
    if (!store.checkins.length && remote?.todayCheckin?.checkin_date) store.checkins = [remote.todayCheckin.checkin_date];

    store.portfolio = Array.isArray(remote?.portfolio) ? remote.portfolio : [];
    store.report = remote?.report || null;
    return store;
  }

  function chooseRecord(localRecord, cloudRecord) {
    if (!localRecord) return cloudRecord;
    if (!cloudRecord) return localRecord;
    const localTime = parseStamp(localRecord.updated_at);
    const cloudTime = parseStamp(cloudRecord.updated_at);
    if (localTime && cloudTime) return localTime > cloudTime ? localRecord : cloudRecord;
    return cloudRecord;
  }

  function portfolioKey(item) {
    return [item?.title || '', item?.result_link || '', item?.created_at || ''].join('|');
  }

  function mergeStores(localStore, cloudStore) {
    const merged = blankStore();
    merged.startDate = cloudStore.startDate || localStore.startDate || merged.startDate;

    const recordDays = new Set([...Object.keys(localStore.records || {}), ...Object.keys(cloudStore.records || {})]);
    merged.records = {};
    recordDays.forEach(day => {
      const picked = chooseRecord(localStore.records?.[day], cloudStore.records?.[day]);
      if (picked) merged.records[day] = picked;
    });

    merged.checklist = JSON.parse(JSON.stringify(localStore.checklist || {}));
    Object.entries(cloudStore.checklist || {}).forEach(([day, items]) => {
      merged.checklist[day] ||= {};
      Object.entries(items || {}).forEach(([no, item]) => { merged.checklist[day][no] = item; });
    });

    merged.checkins = [...new Set([...(localStore.checkins || []), ...(cloudStore.checkins || [])])].sort();

    const portfolio = [];
    const seen = new Set();
    [...(cloudStore.portfolio || []), ...(localStore.portfolio || [])].forEach(item => {
      const key = portfolioKey(item);
      if (seen.has(key)) return;
      seen.add(key);
      portfolio.push(item);
    });
    merged.portfolio = portfolio;
    merged.report = cloudStore.report || localStore.report || null;
    return merged;
  }

  function applyBootstrap(remote, localBefore) {
    const cloudStore = cloudStoreFromBootstrap(remote);
    const merged = mergeStores(localBefore || loadStore(), cloudStore);
    data = { store: merged };
    saveStore();
    hydrate();
    renderAll();
    cloudConnected = true;
    document.documentElement.dataset.aiLmsBackend = 'gas';
    return { cloudStore, merged };
  }

  function recordNeedsSync(localRecord, cloudRecord) {
    if (!localRecord) return false;
    if (!cloudRecord) return true;
    const localTime = parseStamp(localRecord.updated_at);
    const cloudTime = parseStamp(cloudRecord.updated_at);
    return !!localTime && (!cloudTime || localTime > cloudTime);
  }

  async function migrateLocalGaps(localBefore, remote, cloudStore) {
    try {
      const cloudRecords = cloudStore.records || {};
      for (const [day, record] of Object.entries(localBefore.records || {})) {
        if (!recordNeedsSync(record, cloudRecords[day])) continue;
        await gasApi('saveRecord', {
          day_no: Number(day),
          planned_minutes: Number(record.planned_minutes || 90),
          actual_minutes: Number(record.actual_minutes || 0),
          status: record.status || 'in_progress',
          result_note: record.result_note || ''
        });
      }

      const remotePortfolioKeys = new Set((remote?.portfolio || []).map(portfolioKey));
      for (const item of localBefore.portfolio || []) {
        if (remotePortfolioKeys.has(portfolioKey(item)) || !item?.title) continue;
        await gasApi('savePortfolio', {
          day_no: Number(item.day_no || 20),
          title: item.title,
          tools: item.tools || '',
          result: item.result || '',
          result_link: item.result_link || ''
        });
      }

      if (String(remote?.api_version || '').startsWith('2.1')) {
        const cloudDates = new Set((remote?.checkins || []).map(item => item.checkin_date));
        const missingDates = (localBefore.checkins || []).filter(date => date && !cloudDates.has(date));
        if (missingDates.length) await gasApi('importCheckins', { dates: missingDates });

        const cloudCheckKeys = new Set((remote?.checklist || []).map(item => `${item.day_no}:${item.item_no}`));
        const missingChecks = [];
        Object.entries(localBefore.checklist || {}).forEach(([day, items]) => {
          Object.entries(items || {}).forEach(([no, item]) => {
            const key = `${day}:${no}`;
            if (!cloudCheckKeys.has(key)) missingChecks.push({ day_no: Number(day), item_no: Number(no), checked: !!item.checked });
          });
        });
        if (missingChecks.length) await gasApi('importChecklist', { items: missingChecks });
      }
    } catch (error) {
      console.warn('Legacy local data migration skipped:', error);
    }
  }

  async function refreshCloud() {
    if (!cloudCredential) return null;
    const localBefore = loadStore();
    const remote = await gasApi('bootstrap');
    applyBootstrap(remote, localBefore);
    return remote;
  }

  const originalHandleCredential = handleCredential;
  handleCredential = async function (response) {
    cloudCredential = response?.credential || '';
    if (!cloudCredential) return originalHandleCredential(response);
    sessionStorage.setItem(TOKEN_KEY, cloudCredential);

    try {
      const decoded = decodeCredential(cloudCredential);
      profile = { email: decoded.email || '', name: decoded.name || decoded.email || '學習者', picture: decoded.picture || '' };
      $('loginMessage').textContent = '登入成功，正在連線 Google Apps Script…';
      const localBefore = loadStore();
      const remote = await gasApi('bootstrap');
      const applied = applyBootstrap(remote, localBefore);
      $('loginScreen').classList.add('hidden');
      $('appShell').classList.remove('hidden');
      migrateLocalGaps(localBefore, remote, applied.cloudStore);
    } catch (error) {
      cloudConnected = false;
      document.documentElement.dataset.aiLmsBackend = 'error';
      $('loginMessage').textContent = 'GAS 連線失敗：' + error.message;
      $('configWarning').classList.remove('hidden');
      $('configWarning').innerHTML = '<strong>目前尚未連上 Google Apps Script。</strong><br>請確認 GAS 已用最新 Code.gs 重新部署為 Web App，並使用 /exec 網址。';
    }
  };

  const localSaveRecord = saveRecord;
  saveRecord = function (status = 'in_progress') {
    const day = Number(data?.currentPlan?.day_no || 0);
    localSaveRecord(status);
    if (!cloudCredential || !day) return;

    const record = data.store.records?.[day] || {};
    const message = $('saveMessage');
    if (message) message.textContent = '本機已儲存，正在同步 Google Sheet…';

    gasApi('saveRecord', {
      day_no: day,
      planned_minutes: Number(record.planned_minutes || 90),
      actual_minutes: Number(record.actual_minutes || 0),
      status: record.status || status,
      result_note: record.result_note || ''
    }).then(() => {
      cloudConnected = true;
      if (message) message.textContent = status === 'completed' ? 'DAY 已完成，並同步到 Google Sheet。' : '今日進度與累積學習時間已同步到 Google Sheet。';
    }).catch(error => {
      cloudConnected = false;
      if (message) message.textContent = '本機已儲存，但 Google Sheet 同步失敗：' + error.message;
    });
  };

  $('checklist').addEventListener('change', event => {
    const box = event.target.closest('[data-check]');
    if (!box || !cloudCredential || !data?.currentPlan) return;
    const day = Number(data.currentPlan.day_no);
    const itemNo = Number(box.dataset.check);
    gasApi('saveChecklist', {
      day_no: day,
      item_no: itemNo,
      item_text: data.currentPlan.checklist[itemNo - 1] || '',
      checked: box.checked
    }).catch(error => {
      const message = $('saveMessage');
      if (message) message.textContent = 'Checklist 已保存在本機，但雲端同步失敗：' + error.message;
    });
  });

  const localCheckin = $('checkinBtn').onclick;
  $('checkinBtn').onclick = function () {
    const day = Number(data?.currentPlan?.day_no || 1);
    if (typeof localCheckin === 'function') localCheckin.call(this);
    if (!cloudCredential) return;
    gasApi('checkin', { day_no: day }).catch(error => {
      const message = $('saveMessage');
      if (message) message.textContent = '今日已在本機打卡，但雲端同步失敗：' + error.message;
    });
  };

  const localPortfolio = $('addPortfolioBtn').onclick;
  $('addPortfolioBtn').onclick = function () {
    const payload = {
      day_no: Number(data?.currentPlan?.day_no || 20),
      title: $('portfolioTitle').value.trim(),
      tools: $('portfolioTools').value.trim(),
      result: $('portfolioResult').value.trim(),
      result_link: $('portfolioLink').value.trim()
    };
    if (typeof localPortfolio === 'function') localPortfolio.call(this);
    if (!cloudCredential || !payload.title) return;
    gasApi('savePortfolio', payload).catch(error => alert('作品已保存在本機，但 Google Sheet 同步失敗：' + error.message));
  };

  const localReport = $('generateReportBtn').onclick;
  $('generateReportBtn').onclick = function () {
    if (typeof localReport === 'function') localReport.call(this);
    if (!cloudCredential) return;
    gasApi('generateReport').then(report => {
      data.store.report = report;
      saveStore();
      hydrate();
      renderReport(report);
    }).catch(error => alert('能力報告雲端同步失敗：' + error.message));
  };

  const localLogout = $('logoutBtn').onclick;
  $('logoutBtn').onclick = function () {
    cloudCredential = '';
    cloudConnected = false;
    sessionStorage.removeItem(TOKEN_KEY);
    if (typeof localLogout === 'function') localLogout.call(this);
  };

  function syncCurrentRecordQuietly() {
    if (!cloudConnected || !cloudCredential || !data?.currentPlan || !timer?.running) return;
    const day = Number(data.currentPlan.day_no);
    const record = data.store.records?.[day];
    if (!record) return;
    gasApi('saveRecord', {
      day_no: day,
      planned_minutes: Number(record.planned_minutes || 90),
      actual_minutes: Number(record.actual_minutes || 0),
      status: record.status || 'in_progress',
      result_note: record.result_note || ''
    }).catch(error => console.warn('Background GAS checkpoint failed:', error));
  }

  checkpointId = setInterval(syncCurrentRecordQuietly, CLOUD_CHECKPOINT_MS);

  window.addEventListener('pageshow', () => {
    if (!cloudCredential || !profile || !data) return;
    refreshCloud().catch(error => console.warn('GAS refresh skipped:', error));
  });

  window.addEventListener('pagehide', () => { if (checkpointId) clearInterval(checkpointId); });

  window.AI_LMS_GAS = { api: gasApi, refresh: refreshCloud, isConnected: () => cloudConnected };
})();
