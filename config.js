window.AI_LMS_CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbxw_y2k-xySerrbVqnEYg4HaChf1p4JfvkIZh4xH1IzmWoSSxVQnhMEtHvXE1DZUk3R/exec',
  GOOGLE_CLIENT_ID: '731637287753-diajenfrr7p0bs43isijf1t40u7a07m6.apps.googleusercontent.com',
  SITE_ORIGIN: 'https://edufmsc.github.io',

  // GAS 作為中央資料來源；localStorage 保留為瀏覽器快取與既有資料相容層。
  BACKEND_MODE: 'gas',
  STORAGE_PREFIX: 'ai-learning-v3:',

  // 舊的 Google Form 紀錄方式停用，避免與 GAS / Google Sheet 重複寫入。
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
