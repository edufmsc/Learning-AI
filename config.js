window.AI_LMS_CONFIG = {
  // Google 帳號登入用的公開 OAuth Client ID；使用者不需要輸入 API Key。
  GOOGLE_CLIENT_ID: '731637287753-diajenfrr7p0bs43isijf1t40u7a07m6.apps.googleusercontent.com',
  SITE_ORIGIN: 'https://edufmsc.github.io',
  STORAGE_PREFIX: 'ai-learning-v3:',

  // Learning-AI Google Apps Script Web App。
  // v3.3 改用隱藏 form POST + iframe 回應，再以 postMessage 把結果回傳 GitHub Pages。
  API_URL: 'https://script.google.com/macros/s/AKfycbwr0paULP5Mh0SKU9TTE8Q2iFC247ku8lrtwD54_BNyyOpXqxSUKhgF8-jK3KSsgYqy/exec',
  BRIDGE_URL: 'https://script.google.com/macros/s/AKfycbwr0paULP5Mh0SKU9TTE8Q2iFC247ku8lrtwD54_BNyyOpXqxSUKhgF8-jK3KSsgYqy/exec',
  API_VERSION: '3.3',
  BACKEND_MODE: 'gas-bridge-post'
};
