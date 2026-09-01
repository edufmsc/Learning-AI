window.AI_LMS_CONFIG = {
  GOOGLE_CLIENT_ID: '731637287753-diajenfrr7p0bs43isijf1t40u7a07m6.apps.googleusercontent.com',
  SITE_ORIGIN: 'https://edufmsc.github.io',

  // 簡化模式：不再依賴 GAS Web App。
  // 個人進度先依 Google Email 儲存在目前瀏覽器 localStorage。
  STORAGE_PREFIX: 'ai-learning-v3:',

  // 第二階段如要把每次操作同步記錄到 Google Sheet，
  // 建立一份 Google Form 並把 formResponse 與 entry 欄位填在這裡即可。
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
