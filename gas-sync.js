'use strict';

(function () {
  if (typeof CFG === 'undefined' || !CFG.API_URL) return;

  const SESSION_STORAGE_KEY = 'ai-learning-gas-session-v31';
  const CLOUD_CHECKPOINT_MS = 30000;
  let cloudSession = sessionStorage.getItem(SESSION_STORAGE_KEY) || '';
  let cloudConnected = false;
  let checkpointId = null;

  function isTrue(value) {
    return value === true || String(value).toUpperCase() === 'TRUE';
  }

  function parseStamp(value) {
    if (!value) return 0;
    const raw = String(value).trim();
    let time = Date.parse(raw);
    if (!Number.isNaN(time)) return time;
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(raw)) {
      time = Date.parse(raw.replace(' ', 'T') + '+08:00');
    }
    return Number.isNaN(time) ? 0 : time;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function randomSessionKey() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(v => v.toString(16).padStart(2, '0')).join('');
  }

  function jsonp(action, payload = {}, options = {}) {
    return new Promise((resolve, reject) => {
      const callback = 'learningAiGas_' + Date.now() + '_' + Math.random().toString(36).slice(2);
      const script = document.createElement('script');
      const params = new URLSearchParams({
        action,
        callback,
        _: String(Date.now())
      });

      if (payload && Object.keys(payload).length) {
        params.set('payload', JSON.stringify(payload));
      }

      const session = options.session === undefined ? cloudSession : options.session;
      if (session) params.set('session', session);

      let finished = false;
      const timeout = setTimeout(() => finish(new Error(`GAS ${action} 連線逾時`)), 15000);

      function finish(error, value) {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        try { delete window[callback]; } catch (_) {}
        script.remove();
        error ? reject(error) : resolve(value);
      }

      window[callback] = response => finish(null, response);
      script.onerror = () => finish(new Error(`無法載入 GAS ${action}`));
      script.src = CFG.API_URL + '?' + params.toString();
      document.head.appendChild(script);
    });
  }

  async function api(action, payload = {}, options = {}) {
    const response = await jsonp(action, payload, options);
    if (!response?.ok) throw new Error(response?.error || `GAS ${action} 操作失敗`);
    return response.data;
  }

  function postLoginCredential(credential, sessionKey) {
    const frame = document.createElement('iframe');
    frame.name = 'learningAiLogin_' + Date.now();
    frame.style.display = 'none';

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = CFG.API_URL;
    form.target = frame.name;
    form.style.display = 'none';

    [
      ['action', 'establishSession'],
      ['credential', credential],
      ['session_key', sessionKey]
    ].forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(frame);
    document.body.appendChild(form);
    form.submit();
    form.remove();
    setTimeout(() => frame.remove(), 15000);
  }

  async function establishCloudSession(credential) {
    const key = randomSessionKey();
    cloudSession = key;
    postLoginCredential(credential, key);

    const deadline = Date.now() + 12000;
    let lastError = null;

    while (Date.now() < deadline) {
      await sleep(450);
      try {
        const response = await jsonp('sessionStatus', {}, { session: key });
        if (response?.ok && response?.data?.ready) {
          sessionStorage.setItem(SESSION_STORAGE_KEY, key);
          return response.data;
        }
        if (response?.error) lastError = new Error(response.error);
      } catch (error) {
        lastError = error;
      }
    }

    cloudSession = '';
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    throw lastError || new Error('Google 帳號已登入，但 GAS Session 建立逾時');
  }

  function remoteToStore(remote) {
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
        actual_seconds: Number(record.actual_seconds || 0),
        actual_minutes: Number(record.actual_minutes || 0),
        focus_remaining_seconds: Number(record.focus_remaining_seconds || 0)
      };
    });

    store.checklist = {};
    (remote?.checklist || []).forEach(item => {
      const day = Number(item.day_no);
      const no = Number(item.item_no);
      if (!day || !no) return;
      store.checklist[day] ||= {};
      store.checklist[day][no] = {
        checked: isTrue(item.checked),
        item_text: item.item_text || '',
        checked_at: item.checked_at || '',
        supplemented_at: item.supplemented_at || '',
        updated_at: item.updated_at || ''
      };
    });

    store.checkins = [...new Set((remote?.checkins || []).map(item => item.checkin_date).filter(Boolean))].sort();
    store.portfolio = Array.isArray(remote?.portfolio) ? remote.portfolio : [];
    store.report = remote?.report || null;
    return store;
  }

  function mergeRecord(localRecord, cloudRecord) {
    if (!localRecord) return cloudRecord;
    if (!cloudRecord) return localRecord;

    const localTime = parseStamp(localRecord.updated_at);
    const cloudTime = parseStamp(cloudRecord.updated_at);
    const newer = localTime > cloudTime ? localRecord : cloudRecord;

    return {
      ...newer,
      status: localRecord.status === 'completed' || cloudRecord.status === 'completed' ? 'completed' : newer.status,
      actual_seconds: Math.max(Number(localRecord.actual_seconds || 0), Number(cloudRecord.actual_seconds || 0)),
      actual_minutes: Math.max(Number(localRecord.actual_minutes || 0), Number(cloudRecord.actual_minutes || 0))
    };
  }

  function portfolioKey(item) {
    return [Number(item?.day_no || 0), String(item?.title || ''), String(item?.result_link || '')].join('|');
  }

  function mergeStores(localStore, cloudStore) {
    const merged = blankStore();
    merged.startDate = cloudStore.startDate || localStore.startDate || merged.startDate;
    merged.records = {};

    const recordDays = new Set([
      ...Object.keys(localStore.records || {}),
      ...Object.keys(cloudStore.records || {})
    ]);

    recordDays.forEach(day => {
      const record = mergeRecord(localStore.records?.[day], cloudStore.records?.[day]);
      if (record) merged.records[day] = record;
    });

    merged.checklist = JSON.parse(JSON.stringify(localStore.checklist || {}));
    Object.entries(cloudStore.checklist || {}).forEach(([day, items]) => {
      merged.checklist[day] ||= {};
      Object.entries(items || {}).forEach(([no, item]) => {
        if (!merged.checklist[day][no]) merged.checklist[day][no] = item;
        else if (parseStamp(item.updated_at) >= parseStamp(merged.checklist[day][no].updated_at)) {
          merged.checklist[day][no] = item;
        }
      });
    });

    merged.checkins = [...new Set([
      ...(localStore.checkins || []),
      ...(cloudStore.checkins || [])
    ])].sort();

    const portfolio = [];
    const seen = new Set();
    [...(cloudStore.portfolio || []), ...(localStore.portfolio || [])].forEach(item => {
      const key = portfolioKey(item);
      if (!item || seen.has(key)) return;
      seen.add(key);
      portfolio.push(item);
    });
    merged.portfolio = portfolio;
    merged.report = cloudStore.report || localStore.report || null;
    return merged;
  }

  function recordPayload(day, record) {
    return {
      day_no: Number(day),
      planned_minutes: Number(record?.planned_minutes || 90),
      actual_seconds: Number(record?.actual_seconds || (Number(record?.actual_minutes || 0) * 60)),
      actual_minutes: Number(record?.actual_minutes || 0),
      focus_remaining_seconds: Number(record?.focus_remaining_seconds || 0),
      status: record?.status || 'in_progress',
      result_note: record?.result_note || '',
      supplement_date: record?.supplement_date || '',
      completed_at: record?.completed_at || ''
    };
  }

  async function pushLocalDifferences(localStore, remote) {
    const cloudStore = remoteToStore(remote);

    for (const [day, localRecord] of Object.entries(localStore.records || {})) {
      const cloudRecord = cloudStore.records?.[day];
      const localTime = parseStamp(localRecord.updated_at);
      const cloudTime = parseStamp(cloudRecord?.updated_at);
      if (!cloudRecord || localTime > cloudTime || Number(localRecord.actual_seconds || 0) > Number(cloudRecord.actual_seconds || 0)) {
        await api('saveRecord', recordPayload(day, localRecord));
      }
    }

    const remoteChecks = new Set((remote?.checklist || []).map(item => `${item.day_no}:${item.item_no}`));
    for (const [day, items] of Object.entries(localStore.checklist || {})) {
      for (const [no, item] of Object.entries(items || {})) {
        const key = `${day}:${no}`;
        if (remoteChecks.has(key)) continue;
        await api('saveChecklist', {
          day_no: Number(day),
          item_no: Number(no),
          item_text: item?.item_text || '',
          checked: !!item?.checked,
          supplemented_at: item?.supplemented_at || ''
        });
      }
    }

    const remotePortfolioKeys = new Set((remote?.portfolio || []).map(portfolioKey));
    for (const item of localStore.portfolio || []) {
      if (!item?.title || remotePortfolioKeys.has(portfolioKey(item))) continue;
      await api('savePortfolio', {
        portfolio_id: item.portfolio_id || item.id || '',
        day_no: Number(item.day_no || 20),
        title: item.title,
        tools: item.tools || '',
        result: item.result || '',
        result_link: item.result_link || ''
      });
    }

    // Historical check-ins and start date are small enough to migrate through syncStore.
    if ((localStore.checkins || []).length || localStore.startDate) {
      await api('syncStore', {
        store: {
          startDate: localStore.startDate || '',
          records: {},
          checklist: {},
          checkins: localStore.checkins || [],
          portfolio: [],
          report: null
        }
      });
    }
  }

  function applyRemote(remote, localBefore) {
    const cloudStore = remoteToStore(remote);
    const merged = mergeStores(localBefore || loadStore(), cloudStore);
    data = { store: merged };
    saveStore();
    hydrate();
    renderAll();
    cloudConnected = true;
    document.documentElement.dataset.aiLmsBackend = 'gas';
    return merged;
  }

  async function refreshCloud() {
    if (!cloudSession || !profile) return null;
    const localBefore = loadStore();
    const remote = await api('bootstrap');
    applyRemote(remote, localBefore);
    return remote;
  }

  const localHandleCredential = handleCredential;
  handleCredential = async function (response) {
    const credential = response?.credential || '';
    if (!credential) return localHandleCredential(response);

    try {
      const decoded = decodeCredential(credential);
      profile = {
        email: decoded.email || '',
        name: decoded.name || decoded.email || '學習者',
        picture: decoded.picture || ''
      };

      $('configWarning').classList.add('hidden');
      $('loginMessage').textContent = 'Google 帳號登入成功，正在連線學習資料庫…';

      const health = await api('health', {}, { session: '' });
      const version = String(health?.api_version || '');
      if (CFG.API_VERSION && version !== String(CFG.API_VERSION)) {
        throw new Error(`GAS 版本為 ${version || '未知'}，前端需要 ${CFG.API_VERSION}`);
      }

      $('loginMessage').textContent = '正在驗證 Google 帳號…';
      await establishCloudSession(credential);

      $('loginMessage').textContent = '正在載入個人學習紀錄…';
      const localBefore = loadStore();
      let remote = await api('bootstrap');

      await pushLocalDifferences(localBefore, remote);
      remote = await api('bootstrap');
      applyRemote(remote, localBefore);

      $('loginScreen').classList.add('hidden');
      $('appShell').classList.remove('hidden');
      $('loginMessage').textContent = '登入完成。';
    } catch (error) {
      cloudConnected = false;
      cloudSession = '';
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      document.documentElement.dataset.aiLmsBackend = 'error';
      $('loginMessage').textContent = '登入失敗：' + error.message;
      $('configWarning').classList.remove('hidden');
      $('configWarning').innerHTML = '<strong>Google 帳號已選取，但學習資料庫連線失敗。</strong><br>' + esc(error.message);
    }
  };

  const localSaveRecord = saveRecord;
  saveRecord = function (status = 'in_progress') {
    const day = Number(data?.currentPlan?.day_no || 0);
    localSaveRecord(status);
    if (!cloudSession || !day) return;

    const record = data?.store?.records?.[day];
    if (!record) return;

    const message = $('saveMessage');
    if (message) message.textContent = '已儲存在瀏覽器，正在同步學習紀錄…';

    api('saveRecord', recordPayload(day, record))
      .then(() => {
        cloudConnected = true;
        if (message) message.textContent = status === 'completed'
          ? 'DAY 已完成，並已同步到個人 Google 學習紀錄。'
          : '今日進度已同步到個人 Google 學習紀錄。';
      })
      .catch(error => {
        cloudConnected = false;
        if (message) message.textContent = '瀏覽器已儲存，但雲端同步失敗：' + error.message;
      });
  };

  $('checklist').addEventListener('change', event => {
    const box = event.target.closest('[data-check]');
    if (!box || !cloudSession || !data?.currentPlan) return;

    const day = Number(data.currentPlan.day_no);
    const no = Number(box.dataset.check);
    api('saveChecklist', {
      day_no: day,
      item_no: no,
      item_text: data.currentPlan.checklist[no - 1] || '',
      checked: box.checked
    }).catch(error => console.warn('Checklist cloud sync failed:', error));
  });

  const localCheckin = $('checkinBtn').onclick;
  $('checkinBtn').onclick = function () {
    const day = Number(data?.currentPlan?.day_no || 1);
    if (typeof localCheckin === 'function') localCheckin.call(this);
    if (!cloudSession) return;
    api('checkin', { day_no: day }).catch(error => console.warn('Check-in cloud sync failed:', error));
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
    if (!cloudSession || !payload.title) return;

    api('savePortfolio', payload).catch(error => console.warn('Portfolio cloud sync failed:', error));
  };

  const localReport = $('generateReportBtn').onclick;
  $('generateReportBtn').onclick = function () {
    if (typeof localReport === 'function') localReport.call(this);
    if (!cloudSession) return;

    api('generateReport')
      .then(report => {
        data.store.report = report;
        saveStore();
        hydrate();
        renderReport(report);
      })
      .catch(error => console.warn('Report cloud sync failed:', error));
  };

  const localLogout = $('logoutBtn').onclick;
  $('logoutBtn').onclick = function () {
    const session = cloudSession;
    cloudSession = '';
    cloudConnected = false;
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    if (session) {
      jsonp('logout', {}, { session }).catch(() => {});
    }
    if (typeof localLogout === 'function') localLogout.call(this);
  };

  function checkpointCurrentTimer() {
    if (!cloudConnected || !cloudSession || !data?.currentPlan || !timer?.running) return;
    const day = Number(data.currentPlan.day_no);
    const record = data.store.records?.[day];
    if (!record) return;
    api('saveRecord', recordPayload(day, record)).catch(error => console.warn('Timer checkpoint failed:', error));
  }

  checkpointId = setInterval(checkpointCurrentTimer, CLOUD_CHECKPOINT_MS);

  window.addEventListener('pageshow', () => {
    if (!cloudSession || !profile || !data) return;
    refreshCloud().catch(error => console.warn('Cloud refresh skipped:', error));
  });

  window.addEventListener('pagehide', () => {
    if (checkpointId) clearInterval(checkpointId);
  });

  window.AI_LMS_CLOUD = {
    api,
    refresh: refreshCloud,
    isConnected: () => cloudConnected,
    getSession: () => cloudSession
  };
})();
