'use strict';

(function () {
  // Runs after app.js and reuses the current user/store state.
  // Learning time is cumulative per DAY. Switching tabs keeps counting;
  // closing/reloading/leaving the learning page saves and stops the session.

  const CHECKPOINT_MS = 5000;
  let lastCheckpointAt = 0;

  function hasSession() {
    return typeof data !== 'undefined' && data && data.store && data.currentPlan;
  }

  function currentDayNo() {
    return hasSession() ? Number(data.currentPlan.day_no) : 0;
  }

  function ensureRecord() {
    if (!hasSession()) return null;
    const day = currentDayNo();
    const plan = data.currentPlan;
    const old = data.store.records[day] || {};
    const planned = Number(old.planned_minutes || document.getElementById('customMinutes')?.value || plan.default_minutes || 90);
    const oldSeconds = Number.isFinite(Number(old.actual_seconds))
      ? Math.max(0, Math.floor(Number(old.actual_seconds)))
      : Math.max(0, Math.floor((Number(old.actual_minutes) || 0) * 60));

    const record = {
      ...old,
      day_no: day,
      planned_minutes: planned,
      actual_seconds: oldSeconds,
      actual_minutes: Math.floor(oldSeconds / 60),
      status: old.status || 'in_progress',
      updated_at: old.updated_at || new Date().toISOString()
    };
    data.store.records[day] = record;
    return record;
  }

  function totalAccumulatedSeconds() {
    if (!hasSession()) return 0;
    return Object.values(data.store.records || {}).reduce((sum, record) => {
      if (Number.isFinite(Number(record?.actual_seconds))) {
        return sum + Math.max(0, Number(record.actual_seconds));
      }
      return sum + Math.max(0, (Number(record?.actual_minutes) || 0) * 60);
    }, 0);
  }

  function updateDashboardTotal() {
    const el = document.getElementById('statMinutes');
    if (!el || !hasSession()) return;
    el.textContent = `${Math.floor(totalAccumulatedSeconds() / 60)} 分`;
  }

  function ensureAccumulatedLabel() {
    const display = document.getElementById('timerDisplay');
    if (!display || document.getElementById('timerAccumulated')) return;
    const label = document.createElement('div');
    label.id = 'timerAccumulated';
    label.style.margin = '-4px 0 12px';
    label.style.textAlign = 'center';
    label.style.color = '#6d8293';
    label.style.fontSize = '.78rem';
    label.style.fontWeight = '700';
    label.textContent = '本 DAY 已累積 0 分';
    display.insertAdjacentElement('afterend', label);
  }

  function updateAccumulatedLabel(seconds) {
    ensureAccumulatedLabel();
    const el = document.getElementById('timerAccumulated');
    if (!el) return;
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.floor(Math.max(0, seconds) % 60);
    el.textContent = secs > 0
      ? `本 DAY 已累積 ${mins} 分 ${String(secs).padStart(2, '0')} 秒`
      : `本 DAY 已累積 ${mins} 分`;
  }

  function sessionSecondsNow() {
    const record = ensureRecord();
    if (!record) return 0;
    const base = Number(timer.baseAccumulatedSeconds ?? record.actual_seconds ?? 0);
    if (!timer.running || !timer.sessionStartedAt) return Math.max(0, base);
    return Math.max(0, base + Math.floor((Date.now() - timer.sessionStartedAt) / 1000));
  }

  function plannedSeconds() {
    return Math.max(600, (Number(timer.minutes) || 90) * 60);
  }

  function writeElapsed(seconds, updateTimestamp = true) {
    const record = ensureRecord();
    if (!record) return;
    const safeSeconds = Math.max(0, Math.floor(seconds));
    record.actual_seconds = safeSeconds;
    record.actual_minutes = Math.floor(safeSeconds / 60);
    record.planned_minutes = Number(timer.minutes) || record.planned_minutes || 90;
    if (!record.status || record.status === 'not_started') record.status = 'in_progress';
    if (updateTimestamp) record.updated_at = new Date().toISOString();
    saveStore();
    updateDashboardTotal();
    updateAccumulatedLabel(safeSeconds);
  }

  function refreshClockFromNow() {
    if (!timer.running) return;
    const elapsed = sessionSecondsNow();
    timer.remaining = Math.max(0, plannedSeconds() - elapsed);
    syncTimer();
    updateAccumulatedLabel(elapsed);

    const now = Date.now();
    if (now - lastCheckpointAt >= CHECKPOINT_MS) {
      writeElapsed(elapsed);
      lastCheckpointAt = now;
    }

    if (timer.remaining <= 0) {
      pauseAndPersist('完成本次計時');
    }
  }

  function stopIntervalOnly() {
    if (timer.id) clearInterval(timer.id);
    timer.id = null;
  }

  function pauseAndPersist(reason) {
    if (!hasSession()) return;
    const elapsed = sessionSecondsNow();
    writeElapsed(elapsed);
    stopIntervalOnly();
    timer.running = false;
    timer.sessionStartedAt = null;
    timer.baseAccumulatedSeconds = elapsed;
    timer.remaining = Math.max(0, plannedSeconds() - elapsed);
    syncTimer();
    const message = document.getElementById('saveMessage');
    if (message && reason && reason !== '頁面關閉') {
      message.textContent = `${reason}，學習時間已自動保存。`;
    }
  }

  function restoreCurrentDayTimer() {
    if (!hasSession()) return;
    stopIntervalOnly();
    const record = ensureRecord();
    const plan = data.currentPlan;
    const planned = Number(record?.planned_minutes || plan?.default_minutes || 90);
    const elapsed = Number(record?.actual_seconds || 0);

    timer.minutes = planned;
    timer.baseAccumulatedSeconds = elapsed;
    timer.sessionStartedAt = null;
    timer.running = false;
    timer.remaining = Math.max(0, planned * 60 - elapsed);

    const input = document.getElementById('customMinutes');
    if (input) input.value = planned;
    syncTimer();
    updateAccumulatedLabel(elapsed);
    updateDashboardTotal();
  }

  syncTimer = function () {
    const display = document.getElementById('timerDisplay');
    const toggle = document.getElementById('timerToggle');
    if (display) display.textContent = formatTime(Math.max(0, Math.floor(timer.remaining || 0)));
    if (toggle) toggle.textContent = timer.running ? '暫停' : '開始';
  };

  const originalRenderToday = renderToday;
  renderToday = function () {
    if (timer.running) pauseAndPersist('');
    originalRenderToday();
    restoreCurrentDayTimer();
  };

  saveRecord = function (status = 'in_progress') {
    if (!hasSession()) return;
    if (timer.running) pauseAndPersist('');

    const p = data.currentPlan;
    const day = Number(p.day_no);
    const existing = ensureRecord() || {};
    const planned = Math.max(10, Math.min(360, Number(document.getElementById('customMinutes')?.value) || Number(existing.planned_minutes) || p.default_minutes));
    const seconds = Number.isFinite(Number(existing.actual_seconds))
      ? Math.max(0, Math.floor(Number(existing.actual_seconds)))
      : Math.max(0, Math.floor((Number(existing.actual_minutes) || 0) * 60));

    data.store.records[day] = {
      ...existing,
      day_no: day,
      planned_minutes: planned,
      actual_seconds: seconds,
      actual_minutes: Math.floor(seconds / 60),
      status,
      result_note: document.getElementById('resultNote')?.value.trim() || '',
      updated_at: new Date().toISOString(),
      completed_at: status === 'completed' ? new Date().toISOString() : (existing.completed_at || '')
    };

    saveStore();
    logSheet(status === 'completed' ? 'complete_day' : 'save_progress', day, Math.floor(seconds / 60), data.store.records[day].result_note);
    const msg = document.getElementById('saveMessage');
    if (msg) msg.textContent = status === 'completed'
      ? 'DAY 已完成；累積學習時間已一併保存。'
      : '今日進度與累積學習時間已儲存。';
    renderAll();
  };

  function applyPlannedMinutes(minutes) {
    if (!hasSession()) return;
    if (timer.running) pauseAndPersist('');
    const m = Math.max(10, Math.min(360, Number(minutes) || 90));
    const record = ensureRecord();
    const elapsed = Number(record?.actual_seconds || 0);
    timer.minutes = m;
    timer.baseAccumulatedSeconds = elapsed;
    timer.remaining = Math.max(0, m * 60 - elapsed);
    record.planned_minutes = m;
    record.updated_at = new Date().toISOString();
    saveStore();
    const input = document.getElementById('customMinutes');
    if (input) input.value = m;
    syncTimer();
    updateAccumulatedLabel(elapsed);
  }

  function bindPersistentTimerControls() {
    const toggle = document.getElementById('timerToggle');
    const reset = document.getElementById('timerReset');
    const apply = document.getElementById('applyMinutes');

    document.querySelectorAll('[data-minutes]').forEach(button => {
      button.onclick = () => {
        if (timer.running) return;
        document.querySelectorAll('[data-minutes]').forEach(x => x.classList.toggle('active', x === button));
        applyPlannedMinutes(Number(button.dataset.minutes));
      };
    });

    if (apply) {
      apply.onclick = () => applyPlannedMinutes(document.getElementById('customMinutes')?.value);
    }

    if (toggle) {
      toggle.onclick = () => {
        if (!hasSession()) return;
        if (timer.running) {
          pauseAndPersist('已暫停');
          return;
        }

        const record = ensureRecord();
        const elapsed = Number(record?.actual_seconds || 0);
        if (elapsed >= plannedSeconds()) {
          timer.remaining = 0;
          syncTimer();
          const msg = document.getElementById('saveMessage');
          if (msg) msg.textContent = '本次設定時間已完成；如需繼續學習，可先調整今日時間。';
          return;
        }

        timer.baseAccumulatedSeconds = elapsed;
        timer.sessionStartedAt = Date.now();
        timer.running = true;
        lastCheckpointAt = Date.now();
        stopIntervalOnly();
        timer.id = setInterval(refreshClockFromNow, 500);
        refreshClockFromNow();
      };
    }

    if (reset) {
      reset.onclick = () => {
        if (timer.running) pauseAndPersist('');
        restoreCurrentDayTimer();
        const msg = document.getElementById('saveMessage');
        if (msg) msg.textContent = '計時器已回到目前累積進度；已學時間不會被清除。';
      };
    }
  }

  // IMPORTANT: changing browser tabs does NOT pause the timer.
  // Date.now() keeps the real elapsed time, so using ChatGPT/NotebookLM/Sheets
  // in another tab is still counted as part of the learning session.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && timer.running) {
      refreshClockFromNow();
    }
  });

  // Closing, reloading, or navigating away from the learning page ends this session.
  // The elapsed time is saved, and the learner presses Start again next time.
  window.addEventListener('pagehide', () => {
    if (timer.running) pauseAndPersist('頁面關閉');
  });
  window.addEventListener('beforeunload', () => {
    if (timer.running) pauseAndPersist('頁面關閉');
  });

  window.addEventListener('pageshow', () => {
    if (!profile || !data) return;
    try {
      data.store = loadStore();
      hydrate();
      renderAll();
    } catch (e) {
      console.warn('Unable to restore timer data', e);
    }
  });

  function init() {
    ensureAccumulatedLabel();
    bindPersistentTimerControls();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
