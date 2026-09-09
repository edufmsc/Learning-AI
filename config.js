window.AI_LMS_CONFIG = {
  // Google 帳號登入用的公開 OAuth Client ID；使用者不需要輸入 API Key。
  GOOGLE_CLIENT_ID: '731637287753-diajenfrr7p0bs43isijf1t40u7a07m6.apps.googleusercontent.com',
  SITE_ORIGIN: 'https://edufmsc.github.io',
  STORAGE_PREFIX: 'ai-learning-v3:',

  // Learning-AI Google Apps Script Web App。
  // v3.2 起不再用 JSONP 當主要資料傳輸，而是載入隱藏的 GAS HTML Bridge iframe，
  // 再透過 postMessage + google.script.run 與 Code.gs 溝通。
  API_URL: 'https://script.google.com/macros/s/AKfycbyZbBRQOMnqn31Jx-BQBgczHoYNzmwkWUz0H7FloZYW4Sd-lIjq3RkHjmSn_ms6QANE/exec',
  BRIDGE_URL: 'https://script.google.com/macros/s/AKfycbyZbBRQOMnqn31Jx-BQBgczHoYNzmwkWUz0H7FloZYW4Sd-lIjq3RkHjmSn_ms6QANE/exec',
  API_VERSION: '3.2',
  BACKEND_MODE: 'gas-bridge'
};
