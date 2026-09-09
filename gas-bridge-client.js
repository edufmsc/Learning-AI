'use strict';

(function () {
  const CFG = window.AI_LMS_CONFIG || {};
  if (!CFG.BRIDGE_URL) return;

  const SESSION_KEY = 'ai-learning-gas-session-v33';
  const REQUEST_TIMEOUT_MS = 30000;
  const BRIDGE_SOURCE = 'learning-ai-gas-bridge';
  const pending = new Map();
  let cloudSession = sessionStorage.getItem(SESSION_KEY) || '';
  let healthPromise = null;

  function randomId(prefix = 'req') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return prefix + '-' + Array.from(bytes).map(v => v.toString(16).padStart(2, '0')).join('');
  }

  function isTrustedBridgeOrigin(origin) {
    // Apps Script HTML Service normally responds from script.google.com or
    // a generated script.googleusercontent.com origin. Some sandboxed HTML
    // responses can surface as the opaque "null" origin, so allow it only
    // after the random pending requestId has already matched.
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

  function cleanup(job) {
    if (!job) return;
    if (job.timeout) clearTimeout(job.timeout);
    try { job.form?.remove(); } catch (_) {}
    try { job.iframe?.remove(); } catch (_) {}
  }

  window.addEventListener('message', event => {
    const message = event.data || {};
    if (message.source !== BRIDGE_SOURCE || message.type !== 'response' || !message.requestId) return;

    const job = pending.get(message.requestId);
    if (!job) return;

    // requestId is a cryptographically random per-request nonce. Only after
    // matching that pending nonce do we evaluate the Apps Script response origin.
    if (!isTrustedBridgeOrigin(event.origin)) {
      console.warn('Ignored untrusted GAS Bridge response origin:', event.origin);
      return;
    }

    pending.delete(message.requestId);
    cleanup(job);

    if (message.ok) job.resolve(message.data);
    else job.reject(new Error(message.error || 'GAS Bridge 操作失敗'));
  });

  function addField(form, name, value) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value == null ? '' : String(value);
    form.appendChild(input);
  }

  function postRequest(action, payload = {}, options = {}) {
    const requestId = randomId();
    const frameName = 'learningAiGasBridge_' + requestId.replace(/[^A-Za-z0-9_]/g, '');

    return new Promise((resolve, reject) => {
      const iframe = document.createElement('iframe');
      iframe.name = frameName;
      iframe.title = 'Learning-AI secure data bridge';
      iframe.setAttribute('aria-hidden', 'true');
      iframe.tabIndex = -1;
      iframe.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;border:0;left:-9999px;top:-9999px;';

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = CFG.BRIDGE_URL;
      form.target = frameName;
      form.style.display = 'none';

      const session = options.session === undefined ? cloudSession : options.session;
      addField(form, 'bridge_post', '1');
      addField(form, 'request_id', requestId);
      addField(form, 'action', action);
      addField(form, 'session', session || '');
      addField(form, 'payload', JSON.stringify(payload || {}));

      const timeout = setTimeout(() => {
        pending.delete(requestId);
        cleanup({ iframe, form, timeout: null });
        reject(new Error(`GAS Bridge ${action} 逾時（POST 已送出，但未收到 GAS 回傳訊息）`));
      }, REQUEST_TIMEOUT_MS);

      pending.set(requestId, { resolve, reject, iframe, form, timeout, action });
      document.body.appendChild(iframe);
      document.body.appendChild(form);

      try {
        form.submit();
        setTimeout(() => {
          try { form.remove(); } catch (_) {}
        }, 100);
      } catch (error) {
        pending.delete(requestId);
        cleanup({ iframe, form, timeout });
        reject(error);
      }
    });
  }

  async function ready() {
    if (!healthPromise) {
      healthPromise = postRequest('health', {}, { session: '' })
        .catch(error => {
          healthPromise = null;
          throw error;
        });
    }
    return healthPromise;
  }

  async function call(action, payload = {}, options = {}) {
    if (action !== 'health') await ready();
    return postRequest(action, payload, options);
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
    transport: 'form-post-iframe-v33'
  };
})();
