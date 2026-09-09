'use strict';

(function () {
  const CFG = window.AI_LMS_CONFIG || {};
  if (!CFG.BRIDGE_URL) return;

  const SESSION_KEY = 'ai-learning-gas-session-v34';
  const REQUEST_TIMEOUT_MS = 30000;
  const READY_TIMEOUT_MS = 15000;
  const BRIDGE_SOURCE = 'learning-ai-gas-bridge';
  const PARENT_SOURCE = 'learning-ai-parent';
  const pending = new Map();

  let cloudSession = sessionStorage.getItem(SESSION_KEY) || '';
  let iframe = null;
  let bridgeWindow = null;
  let readyPromise = null;
  let readyResolve = null;
  let readyReject = null;
  let iframeLoaded = false;

  function randomId(prefix = 'req') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return prefix + '-' + Array.from(bytes).map(v => v.toString(16).padStart(2, '0')).join('');
  }

  function isTrustedBridgeOrigin(origin) {
    if (origin === 'null') return true;
    try {
      const url = new URL(origin);
      if (url.protocol !== 'https:') return false;
      return url.hostname === 'script.google.com' ||
        url.hostname === 'script.googleusercontent.com' ||
        url.hostname.endsWith('.script.googleusercontent.com');
    } catch (_) {
      return false;
    }
  }

  function ensureBridge() {
    if (readyPromise) return readyPromise;

    iframeLoaded = false;
    bridgeWindow = null;

    readyPromise = new Promise((resolve, reject) => {
      readyResolve = resolve;
      readyReject = reject;

      iframe = document.createElement('iframe');
      iframe.id = 'learningAiGasBridgeFrame';
      iframe.title = 'Learning-AI secure data bridge';
      iframe.setAttribute('aria-hidden', 'true');
      iframe.tabIndex = -1;
      iframe.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;border:0;left:-9999px;top:-9999px;';

      const url = new URL(CFG.BRIDGE_URL);
      url.searchParams.set('bridge', '1');
      url.searchParams.set('v', '34');
      url.searchParams.set('_', String(Date.now()));
      iframe.src = url.toString();

      iframe.onload = () => {
        iframeLoaded = true;
        console.info('GAS Bridge iframe 已載入，等待 ready 訊息。');
      };

      iframe.onerror = () => {
        readyPromise = null;
        readyReject?.(new Error('無法載入 GAS Bridge iframe'));
      };

      document.body.appendChild(iframe);

      setTimeout(() => {
        if (!bridgeWindow) {
          readyPromise = null;
          const detail = iframeLoaded
            ? 'GAS Bridge iframe 已載入，但未收到 ready 訊息（請確認目前部署版本的 doGet(?bridge=1) 有回傳 Bridge 程式）'
            : 'GAS Bridge iframe 未完成載入（請確認 Web App 部署權限與 /exec?bridge=1 是否可開啟）';
          readyReject?.(new Error(detail));
        }
      }, READY_TIMEOUT_MS);
    });

    return readyPromise;
  }

  window.addEventListener('message', event => {
    const message = event.data || {};
    if (message.source !== BRIDGE_SOURCE) return;
    if (!isTrustedBridgeOrigin(event.origin)) {
      console.warn('忽略未知來源的 GAS Bridge 訊息：', event.origin);
      return;
    }

    if (message.type === 'ready') {
      bridgeWindow = event.source;
      console.info('GAS Bridge ready：', event.origin, message.api_version || '');
      readyResolve?.({ api_version: message.api_version || '' });
      return;
    }

    if (message.type !== 'response' || !message.requestId) return;

    const job = pending.get(message.requestId);
    if (!job) return;

    pending.delete(message.requestId);
    clearTimeout(job.timeout);

    if (message.ok) job.resolve(message.data);
    else job.reject(new Error(message.error || 'GAS Bridge 操作失敗'));
  });

  async function call(action, payload = {}, options = {}) {
    await ensureBridge();
    if (!bridgeWindow) throw new Error('GAS Bridge 尚未完成初始化');

    const requestId = randomId();
    const session = options.session === undefined ? cloudSession : options.session;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error(`GAS Bridge ${action} 逾時（iframe 已連線，但未收到 action 回應）`));
      }, REQUEST_TIMEOUT_MS);

      pending.set(requestId, { resolve, reject, timeout, action });

      try {
        bridgeWindow.postMessage({
          source: PARENT_SOURCE,
          type: 'request',
          requestId,
          action,
          payload: payload || {},
          session: session || ''
        }, '*');
      } catch (error) {
        pending.delete(requestId);
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  async function ready() {
    await ensureBridge();
    return call('health', {}, { session: '' });
  }

  function createSessionKey() {
    return randomId('session').replace(/-/g, '');
  }

  async function login(credential) {
    const sessionKey = createSessionKey();
    const result = await call('establishSession', {
      credential,
      session_key: sessionKey
    }, { session: '' });

    cloudSession = sessionKey;
    sessionStorage.setItem(SESSION_KEY, sessionKey);
    return result;
  }

  function clearSession() {
    cloudSession = '';
    sessionStorage.removeItem(SESSION_KEY);
  }

  window.AI_LMS_BRIDGE = {
    ready,
    call,
    login,
    clearSession,
    getSession: () => cloudSession,
    hasSession: () => !!cloudSession,
    transport: 'persistent-iframe-v34.1'
  };
})();
