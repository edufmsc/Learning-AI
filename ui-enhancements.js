'use strict';

(function () {
  const style = document.createElement('style');
  style.textContent = `
    .back-to-top {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 80;
      width: 58px;
      height: 58px;
      border: 0;
      border-radius: 999px;
      display: grid;
      place-items: center;
      background: #2e668c;
      color: #fff;
      font-weight: 900;
      font-size: .78rem;
      box-shadow: 0 12px 30px rgba(31,85,119,.28);
      opacity: 0;
      visibility: hidden;
      transform: translateY(10px);
      transition: opacity .2s ease, transform .2s ease, visibility .2s ease, background .2s ease;
      cursor: pointer;
    }
    .back-to-top.visible {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    .back-to-top:hover { background: #1f5577; }

    .course-materials { padding-top: 10px; }
    .course-materials .materials-heading { margin-bottom: 22px; }
    .course-materials .materials-heading h2 { margin: 4px 0 6px; font-size: clamp(1.7rem,3vw,2.45rem); }
    .course-materials .materials-grid {
      display: grid;
      grid-template-columns: repeat(3,minmax(0,1fr));
      gap: 18px;
    }
    .material-card {
      overflow: hidden;
      border: 1px solid #d6e5f0;
      border-radius: 18px;
      background: #fff;
      box-shadow: 0 10px 28px rgba(41,85,119,.07);
    }
    .material-media {
      position: relative;
      aspect-ratio: 16/9;
      display: grid;
      place-items: center;
      background: linear-gradient(145deg,#eaf4fb,#dcecf8);
      border-bottom: 1px solid #d6e5f0;
    }
    .material-media::before {
      content: '';
      position: absolute;
      inset: 16px;
      border: 1px dashed rgba(46,102,140,.28);
      border-radius: 13px;
    }
    .material-play {
      position: relative;
      z-index: 1;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: #fff;
      color: #2e668c;
      font-size: 1.3rem;
      box-shadow: 0 8px 22px rgba(41,85,119,.14);
    }
    .material-placeholder {
      position: absolute;
      bottom: 20px;
      z-index: 1;
      color: #6d8293;
      font-size: .76rem;
      font-weight: 800;
      letter-spacing: .04em;
    }
    .material-body { padding: 18px 19px 20px; }
    .material-no { color: #2e668c; font-size: .72rem; font-weight: 900; letter-spacing: .12em; }
    .material-body h3 { margin: 5px 0 7px; font-size: 1.08rem; }
    .material-body p { margin: 0; color: #6d8293; font-size: .88rem; }
    .material-ready {
      display: inline-flex;
      margin-top: 14px;
      padding: 5px 9px;
      border-radius: 999px;
      background: #edf6fd;
      color: #2e668c;
      font-size: .72rem;
      font-weight: 900;
    }

    @media (max-width: 900px) {
      .course-materials .materials-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 620px) {
      .course-materials .materials-grid { grid-template-columns: 1fr; }
      .back-to-top { right: 14px; bottom: 14px; width: 52px; height: 52px; }
    }
  `;
  document.head.appendChild(style);

  function addBackToTop() {
    if (document.querySelector('.back-to-top')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'back-to-top';
    button.setAttribute('aria-label', '回到頁面頂端');
    button.innerHTML = '↑<br>TOP';
    button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    document.body.appendChild(button);

    const toggle = () => button.classList.toggle('visible', window.scrollY > 360);
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
  }

  function addCourseMaterials() {
    const lessonGrid = document.querySelector('.lesson-grid');
    if (!lessonGrid || document.getElementById('courseMaterials')) return;

    const section = document.createElement('section');
    section.id = 'courseMaterials';
    section.className = 'section course-materials';
    section.innerHTML = `
      <div class="materials-heading">
        <p class="eyebrow">COURSE MATERIALS</p>
        <h2>今日課程教材</h2>
        <p id="materialsIntro" class="muted">配合今日主題安排的影片與延伸教材。</p>
      </div>
      <div class="materials-grid">
        <article class="material-card">
          <div class="material-media">
            <div class="material-play">▶</div>
            <span class="material-placeholder">影片教材預留</span>
          </div>
          <div class="material-body">
            <span class="material-no">01 · CONCEPT</span>
            <h3 id="materialTitle1">核心概念導讀</h3>
            <p>先建立今日主題的基本觀念與操作框架。</p>
            <span class="material-ready">待嵌入影片</span>
          </div>
        </article>
        <article class="material-card">
          <div class="material-media">
            <div class="material-play">▶</div>
            <span class="material-placeholder">影片教材預留</span>
          </div>
          <div class="material-body">
            <span class="material-no">02 · DEMO</span>
            <h3 id="materialTitle2">操作示範</h3>
            <p>透過實際操作影片，對照今天的學習步驟。</p>
            <span class="material-ready">待嵌入影片</span>
          </div>
        </article>
        <article class="material-card">
          <div class="material-media">
            <div class="material-play">▶</div>
            <span class="material-placeholder">影片教材預留</span>
          </div>
          <div class="material-body">
            <span class="material-no">03 · PRACTICE</span>
            <h3 id="materialTitle3">實作與延伸</h3>
            <p>完成今日任務後，可再使用延伸教材加強應用。</p>
            <span class="material-ready">待嵌入影片</span>
          </div>
        </article>
      </div>
    `;
    lessonGrid.insertAdjacentElement('afterend', section);

    const todayTitle = document.getElementById('todayTitle');
    const dayBadge = document.getElementById('dayBadge');
    const update = () => {
      const title = todayTitle?.textContent?.trim();
      const day = dayBadge?.textContent?.trim();
      if (!title || title === '載入中…') return;
      document.getElementById('materialsIntro').textContent = `${day || '今日'}｜${title}：依學習順序安排概念、示範與實作教材。`;
      document.getElementById('materialTitle1').textContent = `${title}｜核心概念`;
      document.getElementById('materialTitle2').textContent = `${title}｜操作示範`;
      document.getElementById('materialTitle3').textContent = `${title}｜實作延伸`;
    };
    update();
    if (todayTitle) new MutationObserver(update).observe(todayTitle, { childList: true, subtree: true, characterData: true });
    if (dayBadge) new MutationObserver(update).observe(dayBadge, { childList: true, subtree: true, characterData: true });
  }

  function init() {
    addBackToTop();
    addCourseMaterials();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
