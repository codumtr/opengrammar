// OpenGrammar - Content Script
(() => {
  'use strict';

  let currentElement = null;
  let activeIssues = [];
  let badgeEl = null;
  let cardEl = null;
  let isScanning = false;

  // Badge oluştur
  function createBadge() {
    if (badgeEl) return badgeEl;

    badgeEl = document.createElement('div');
    badgeEl.className = 'opengrammar-badge is-clean';
    badgeEl.title = 'OpenGrammar İmla Denetimi';
    badgeEl.innerHTML = `
      <svg class="opengrammar-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
      </svg>
    `;

    badgeEl.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleCard();
    });

    document.body.appendChild(badgeEl);
    hideBadge();
    return badgeEl;
  }

  // Kartı aç/kapat
  function toggleCard() {
    if (cardEl && cardEl.style.display !== 'none') {
      hideCard();
    } else {
      showCard();
    }
  }

  function showCard() {
    if (!cardEl) {
      cardEl = document.createElement('div');
      cardEl.className = 'opengrammar-card';
      document.body.appendChild(cardEl);
    }

    renderCardContent();
    positionCard();
    cardEl.style.display = 'flex';
  }

  function hideCard() {
    if (cardEl) {
      cardEl.style.display = 'none';
    }
  }

  function positionCard() {
    if (!badgeEl || !cardEl) return;
    const badgeRect = badgeEl.getBoundingClientRect();
    const top = window.scrollY + badgeRect.bottom + 8;
    let left = window.scrollX + badgeRect.right - 320;
    if (left < 10) left = 10;

    cardEl.style.top = `${top}px`;
    cardEl.style.left = `${left}px`;
  }

  function renderCardContent() {
    if (!cardEl) return;

    let bodyHtml = '';
    if (activeIssues.length === 0) {
      bodyHtml = `
        <div class="opengrammar-empty">
          ✨ Tebrikler! Hiçbir yazım veya imla hatası bulunamadı.
        </div>
      `;
    } else {
      bodyHtml = activeIssues.map((issue, idx) => `
        <div class="opengrammar-issue-item" data-index="${idx}">
          <div class="opengrammar-issue-words">
            <span class="opengrammar-original">${escapeHtml(issue.original)}</span>
            <span class="opengrammar-arrow">➔</span>
            <span class="opengrammar-suggestion">${escapeHtml(issue.suggestion)}</span>
          </div>
          <div class="opengrammar-issue-reason">${escapeHtml(issue.reason)}</div>
          <div class="opengrammar-issue-actions">
            <button class="opengrammar-btn-apply" data-index="${idx}">Düzelt</button>
            <button class="opengrammar-btn-dismiss" data-index="${idx}">Yoksay</button>
          </div>
        </div>
      `).join('');
    }

    cardEl.innerHTML = `
      <div class="opengrammar-card-header">
        <div class="opengrammar-card-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
          OpenGrammar (${activeIssues.length} Öneri)
        </div>
        <button class="opengrammar-card-close" id="ogCardCloseBtn">✕</button>
      </div>
      <div class="opengrammar-card-body">
        ${bodyHtml}
      </div>
      <div class="opengrammar-card-ai">
        <span class="opengrammar-ai-pill" data-ai="formal">💼 Resmi Yap</span>
        <span class="opengrammar-ai-pill" data-ai="friendly">😊 Kibar Yap</span>
        <span class="opengrammar-ai-pill" data-ai="summarize">✂️ Özetle</span>
      </div>
    `;

    // Kapat butonu
    cardEl.querySelector('#ogCardCloseBtn').addEventListener('click', hideCard);

    // Düzelt butonları
    cardEl.querySelectorAll('.opengrammar-btn-apply').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.dataset.index, 10);
        applyFix(activeIssues[idx]);
      });
    });

    // Yoksay butonları
    cardEl.querySelectorAll('.opengrammar-btn-dismiss').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.dataset.index, 10);
        activeIssues.splice(idx, 1);
        updateBadgeUI();
        renderCardContent();
      });
    });

    // Yapay Zeka Butonları
    cardEl.querySelectorAll('.opengrammar-ai-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const mode = pill.dataset.ai;
        handleAiTransform(mode);
      });
    });
  }

  // Düzeltmeyi metin kutusuna uygula
  function applyFix(issue) {
    if (!currentElement || !issue) return;

    if (currentElement.isContentEditable) {
      let html = currentElement.innerHTML;
      html = html.replace(issue.original, issue.suggestion);
      currentElement.innerHTML = html;
    } else {
      let val = currentElement.value;
      const before = val.substring(0, issue.start);
      const after = val.substring(issue.end);
      currentElement.value = before + issue.suggestion + after;
    }

    // Modern web uygulamaları için change/input eventlerini tetikle
    currentElement.dispatchEvent(new Event('input', { bubbles: true }));
    currentElement.dispatchEvent(new Event('change', { bubbles: true }));

    // Tekrar analiz et
    analyzeCurrentInput();
  }

  // AI Dönüşümü
  function handleAiTransform(mode) {
    const text = getElementText(currentElement);
    if (!text || text.trim().length === 0) return;

    chrome.runtime.sendMessage({
      action: 'aiTransform',
      text: text,
      mode: mode
    }, (res) => {
      if (res && res.transformedText) {
        setElementText(currentElement, res.transformedText);
        analyzeCurrentInput();
      } else if (res && res.error) {
        alert(res.error);
      }
    });
  }

  function getElementText(el) {
    if (!el) return '';
    if (el.isContentEditable) return el.innerText;
    return el.value || '';
  }

  function setElementText(el, text) {
    if (!el) return;
    if (el.isContentEditable) {
      el.innerText = text;
    } else {
      el.value = text;
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Pozisyonlandırma
  function positionBadge(el) {
    if (!badgeEl) createBadge();
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      hideBadge();
      return;
    }

    const top = window.scrollY + rect.bottom - 36;
    const left = window.scrollX + rect.right - 36;

    badgeEl.style.top = `${top}px`;
    badgeEl.style.left = `${left}px`;
    badgeEl.style.display = 'flex';
  }

  function hideBadge() {
    if (badgeEl) badgeEl.style.display = 'none';
    hideCard();
  }

  function updateBadgeUI() {
    if (!badgeEl) return;
    const count = activeIssues.length;

    if (count > 0) {
      badgeEl.className = 'opengrammar-badge has-issues';
      badgeEl.innerHTML = `<span class="opengrammar-badge-count">${count}</span>`;
    } else {
      badgeEl.className = 'opengrammar-badge is-clean';
      badgeEl.innerHTML = `
        <svg class="opengrammar-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
    }
  }

  // Girişi analiz et
  function analyzeCurrentInput() {
    if (!currentElement || !window.OpenGrammarEngine) return;
    const text = getElementText(currentElement);
    activeIssues = window.OpenGrammarEngine.analyzeText(text);
    updateBadgeUI();
    if (cardEl && cardEl.style.display !== 'none') {
      renderCardContent();
    }
  }

  // Odaklanılan giriş elemanlarını dinle
  document.addEventListener('focusin', (e) => {
    const target = e.target;
    const isTextarea = target.tagName === 'TEXTAREA';
    const isTextInput = target.tagName === 'INPUT' && (target.type === 'text' || target.type === 'search' || !target.type);
    const isContentEditable = target.isContentEditable;

    if (isTextarea || isTextInput || isContentEditable) {
      currentElement = target;
      positionBadge(target);
      analyzeCurrentInput();
    }
  });

  // Yazmayı dinle (Input eventi)
  document.addEventListener('input', (e) => {
    if (e.target === currentElement) {
      positionBadge(currentElement);
      analyzeCurrentInput();
    }
  });

  // Pencere boyutu değiştiğinde rozeti yeniden hizala
  window.addEventListener('resize', () => {
    if (currentElement) positionBadge(currentElement);
  });
})();
