window.AI_LMS_CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbzFHp4ZOqhtmZZgvqYRtLfdHgsA6vHyt_HmSCqUXs2QqK0rIVzV8xpN1Z1pPgTTLul_/exec',
  GOOGLE_CLIENT_ID: '731637287753-diajenfrr7p0bs43isijf1t40u7a07m6.apps.googleusercontent.com',
  SITE_ORIGIN: 'https://edufmsc.github.io',

  // GAS 重新作為正式資料來源；localStorage 僅保留為目前瀏覽器快取與舊資料相容層。
  BACKEND_MODE: 'gas',
  STORAGE_PREFIX: 'ai-learning-v3:',

  // 舊的 Google Form 紀錄方式先保留但停用，避免與 GAS/Sheet 重複寫入。
  SHEET_LOG: {
    enabled: false,
    formAction: '',
    fields: {
      email: '',
      name: '',
      event: '',
      day: '',
      minutes: '',
      note: ''
    }
  }
};
