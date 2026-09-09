'use strict';

(function () {
  const CFG = window.AI_LMS_CONFIG || {};
  if (!CFG.BRIDGE_URL) return;

  const SESSION_KEY = 'ai-learning-gas-session-v32';
  const REQUEST_TIMEOUT_MS = 20000;
  const BRIDGE_SOURCE = 'learning-ai-gas-bridge';
  const PARENT_SOURCE = 'learning-ai-parent';
  const pending = new Map();
  let bridgeFrame = null;
  let bridgeReady = false;
  let bridgeReadyResolve;
  let bridgeReadyReject;
  let cloudSession = sessionStorage.getItem(SESSION_KEY) || '';

  const readyPromise = new Promise((resolve, reject) => {
    bridgeReadyResolve = resolve;
    bridgeReadyReject = reject;
  });

  function randomId(prefix = 'req') {
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    return prefix + '-' + Array.from(bytes).map(v => v.toString(16).padStart(2, '0')).join('');
  }

  function ensureFrame() {
    if (bridgeFrame) return bridgeFrame;

    bridgeFrame = document.createElement('iframe');
    bridgeFrame.id = 'learningAiGasBridge';
    bridgeFrame.title = 'Learning-AI secure data bridge';
    bridgeFrame.setAttribute('aria-hidden', 'true');
    bridgeFrame.tabIndex = -1;
    bridgeFrame.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;border:0;left:-9999px;top:-9999px;';

    const url = new URL(CFG.BRIDGE_URL);
    url.searchParams.set('bridge', '1');
    url.searchParams.set('parentOrigin', location.origin);
    url.searchParams.set('_', String(Date.now()));
    bridgeFrame.src = url.toString();

    bridgeFrame.addEventListener('error', () => {
      if (!bridgeReady) bridgeReadyReject?.(new Error('無法載入 GAS Bridge iframe'));
    });

    document.body.appendChild(bridgeFrame);
    return bridgeFrame;
  }

  function isBridgeMessage(event) {
    return !!bridgeFrame && event.source === bridgeFrame.contentWindow && event.data?.source === BRIDGE_SOURCE;
  }

  window.addEventListener('message', event => {
    if (!isBridgeMessage(event)) return;

    const message = event.data || {};

    if (message.type === 'ready') {
      bridgeReady = true;
      bridgeReadyResolve?.(message);
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

  async function waitUntilReady() {
    ensureFrame();

    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('GAS Bridge 啟動逾時')), REQUEST_TIMEOUT_MS);
    });

    return Promise.race([readyPromise, timeout]);
  }

  async function call(action, payload = {}, options = {}) {
    await waitUntilReady();

    const requestId = randomId();
    const request = {
      source: PARENT_SOURCE,
      type: 'request',
      requestId,
      action,
      payload,
      session: options.session === undefined ? cloudSession : options.session
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error(`GAS Bridge ${action} 逾時`));
      }, REQUEST_TIMEOUT_MS);

      pending.set(requestId, { resolve, reject, timeout });
      bridgeFrame.contentWindow.postMessage(request, '*');
    });
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

  ensureFrame();

  window.AI_LMS_BRIDGE = {
    ready: waitUntilReady,
    call,
    login,
    clearSession,
    getSession: () => cloudSession,
    hasSession: () => !!cloudSession,
    getFrame: () => bridgeFrame
  };
})();
