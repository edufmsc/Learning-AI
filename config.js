window.AI_LMS_CONFIG = {
  // 尚未建立新的 Apps Script Web App；完成部署後將新的 /exec 網址填入這裡。
  API_URL: '',
  GOOGLE_CLIENT_ID: '731637287753-diajenfrr7p0bs43isijf1t40u7a07m6.apps.googleusercontent.com',
  SITE_ORIGIN: 'https://edufmsc.github.io',

  // GAS 正式上線後作為中央資料來源；localStorage 目前保留為瀏覽器快取與既有資料相容層。
  BACKEND_MODE: 'gas',
  STORAGE_PREFIX: 'ai-learning-v3:',

  // 舊的 Google Form 紀錄方式停用，避免未來與 GAS / Google Sheet 重複寫入。
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
