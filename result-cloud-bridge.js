'use strict';

(function () {
  function start() {
    const BRIDGE = window.AI_LMS_BRIDGE;
    const button = document.getElementById('saveSupplementBtn');
    const message = document.getElementById('supplementMessage');
    if (!BRIDGE || !button) return;

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

    button.addEventListener('click', async () => {
      // result.js 會先完成 localStorage 寫入，本監聽器再把同一份結果同步到雲端。
      await Promise.resolve();

      try {
        if (!BRIDGE.hasSession()) {
          if (message) message.textContent += '；本機已保存，雲端登入已逾期，回主頁重新登入後會再同步。';
          return;
        }

        const day = Number(context?.dayNo || 0);
        const store = context?.store;
        const record = store?.records?.[day];
        if (!day || !record) return;

        if (message) message.textContent = '本機已儲存，正在同步雲端…';
        await BRIDGE.call('saveRecord', recordPayload(day, record));

        const items = store?.checklist?.[day] || {};
        for (const [itemNo, item] of Object.entries(items)) {
          await BRIDGE.call('saveChecklist', {
            day_no: day,
            item_no: Number(itemNo),
            item_text: item?.item_text || '',
            checked: !!item?.checked,
            supplemented_at: item?.supplemented_at || ''
          });
        }

        if (message) message.textContent = `已儲存補登／修改並同步雲端，補登日期：${record.supplement_date || ''}`;
      } catch (error) {
        if (message) message.textContent = '本機已儲存，但雲端同步失敗：' + error.message;
      }
    });
  }

  if (window.AI_LMS_BRIDGE) {
    start();
    return;
  }

  const script = document.createElement('script');
  script.src = 'gas-bridge-client.js?v=32';
  script.onload = start;
  script.onerror = () => console.warn('Unable to load GAS bridge client on result page');
  document.head.appendChild(script);
})();
