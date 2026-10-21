// OpenGrammar - Options Controller
document.addEventListener('DOMContentLoaded', async () => {
  // Sekme geçişleri
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      navBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const pane = document.getElementById(`pane-${target}`);
      if (pane) pane.classList.add('active');
    });
  });

  // Elemanlar
  const chkSpelling = document.getElementById('chkSpelling');
  const chkGrammar = document.getElementById('chkGrammar');
  const chkPunc = document.getElementById('chkPunc');

  const geminiApiKey = document.getElementById('geminiApiKey');
  const btnSaveApiKey = document.getElementById('btnSaveApiKey');

  const dictInput = document.getElementById('dictInput');
  const btnAddWord = document.getElementById('btnAddWord');
  const wordList = document.getElementById('wordList');

  // Mevcut ayarları çek
  const { settings = {}, customWords = [] } = await chrome.storage.local.get(['settings', 'customWords']);

  chkSpelling.checked = settings.checkSpelling !== false;
  chkGrammar.checked = settings.checkGrammar !== false;
  chkPunc.checked = settings.checkPunctuation !== false;
  if (settings.geminiApiKey) geminiApiKey.value = settings.geminiApiKey;

  renderCustomWords(customWords);

  // Ayarları kaydet
  const saveGeneral = async () => {
    const current = (await chrome.storage.local.get('settings')).settings || {};
    current.checkSpelling = chkSpelling.checked;
    current.checkGrammar = chkGrammar.checked;
    current.checkPunctuation = chkPunc.checked;
    await chrome.storage.local.set({ settings: current });
  };

  chkSpelling.addEventListener('change', saveGeneral);
  chkGrammar.addEventListener('change', saveGeneral);
  chkPunc.addEventListener('change', saveGeneral);

  // API Key Kaydet
  btnSaveApiKey.addEventListener('click', async () => {
    const key = geminiApiKey.value.trim();
    const current = (await chrome.storage.local.get('settings')).settings || {};
    current.geminiApiKey = key;
    await chrome.storage.local.set({ settings: current });
    alert('Google Gemini API anahtarı başarıyla kaydedildi!');
  });

  // Özel Sözlük Ekleme
  btnAddWord.addEventListener('click', async () => {
    const word = dictInput.value.trim();
    if (!word) return;

    const data = await chrome.storage.local.get('customWords');
    const words = data.customWords || [];

    if (!words.includes(word)) {
      words.push(word);
      await chrome.storage.local.set({ customWords: words });
      dictInput.value = '';
      renderCustomWords(words);
    }
  });

  async function removeWord(word) {
    const data = await chrome.storage.local.get('customWords');
    let words = data.customWords || [];
    words = words.filter(w => w !== word);
    await chrome.storage.local.set({ customWords: words });
    renderCustomWords(words);
  }

  function renderCustomWords(words) {
    wordList.innerHTML = '';
    if (!words || words.length === 0) {
      wordList.innerHTML = '<li style="color: #64748b; font-size: 13px; padding: 6px 0;">Henüz özel bir kelime eklenmedi.</li>';
      return;
    }

    words.forEach(word => {
      const li = document.createElement('li');
      li.className = 'word-item';
      li.innerHTML = `
        <span>${escapeHtml(word)}</span>
        <button class="btn-del">Sil</button>
      `;
      li.querySelector('.btn-del').addEventListener('click', () => removeWord(word));
      wordList.appendChild(li);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
