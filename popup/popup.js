// OpenGrammar - Popup Controller
document.addEventListener('DOMContentLoaded', () => {
  const testInput = document.getElementById('testInput');
  const charCount = document.getElementById('charCount');
  const editorStatus = document.getElementById('editorStatus');
  const suggestionsBox = document.getElementById('suggestionsBox');
  const btnFixAll = document.getElementById('btnFixAll');
  const btnFormal = document.getElementById('btnFormal');
  const btnClear = document.getElementById('btnClear');

  let currentIssues = [];

  // Metin yazıldığında gerçek zamanlı denetle
  testInput.addEventListener('input', () => {
    analyze();
  });

  function analyze() {
    const text = testInput.value;
    charCount.textContent = `${text.length} karakter`;

    if (!window.OpenGrammarEngine) return;
    currentIssues = window.OpenGrammarEngine.analyzeText(text);

    if (currentIssues.length > 0) {
      editorStatus.textContent = `⚠️ ${currentIssues.length} Hata`;
      editorStatus.className = 'status-issues';
    } else {
      editorStatus.textContent = '✨ Temiz';
      editorStatus.className = 'status-clean';
    }

    renderSuggestions();
  }

  function renderSuggestions() {
    suggestionsBox.innerHTML = '';
    if (currentIssues.length === 0) return;

    currentIssues.forEach((issue, idx) => {
      const card = document.createElement('div');
      card.className = 'suggestion-card';
      card.innerHTML = `
        <div class="suggestion-words">
          <span class="orig-word">${escapeHtml(issue.original)}</span>
          <span>➔</span>
          <span class="sugg-word">${escapeHtml(issue.suggestion)}</span>
        </div>
        <button class="btn-apply-single" data-index="${idx}">Düzelt</button>
      `;

      card.querySelector('.btn-apply-single').addEventListener('click', () => {
        applySingleFix(issue);
      });

      suggestionsBox.appendChild(card);
    });
  }

  function applySingleFix(issue) {
    let val = testInput.value;
    const before = val.substring(0, issue.start);
    const after = val.substring(issue.end);
    testInput.value = before + issue.suggestion + after;
    analyze();
  }

  // Tüm hataları düzelt
  btnFixAll.addEventListener('click', () => {
    if (currentIssues.length === 0) return;
    // Sıralamayı tersten uygula ki indeksler kaymasın
    const sorted = [...currentIssues].sort((a, b) => b.start - a.start);
    let val = testInput.value;
    sorted.forEach(issue => {
      val = val.substring(0, issue.start) + issue.suggestion + val.substring(issue.end);
    });
    testInput.value = val;
    analyze();
  });

  // Temizle
  btnClear.addEventListener('click', () => {
    testInput.value = '';
    analyze();
  });

  // Resmi Yap (AI)
  btnFormal.addEventListener('click', () => {
    const text = testInput.value.trim();
    if (!text) return;

    btnFormal.textContent = '⏳ Yazılıyor...';
    btnFormal.disabled = true;

    chrome.runtime.sendMessage({
      action: 'aiTransform',
      text: text,
      mode: 'formal'
    }, (res) => {
      btnFormal.textContent = '💼 Resmi Yap';
      btnFormal.disabled = false;

      if (res && res.transformedText) {
        testInput.value = res.transformedText;
        analyze();
      } else if (res && res.error) {
        alert(res.error);
      }
    });
  });

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
