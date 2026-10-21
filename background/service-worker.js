// OpenGrammar - Background Service Worker

chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get(['settings', 'stats']);
  
  if (!data.settings) {
    await chrome.storage.local.set({
      settings: {
        geminiApiKey: '',
        language: 'auto',
        checkGrammar: true,
        checkSpelling: true,
        checkPunctuation: true
      }
    });
  }

  if (!data.stats) {
    await chrome.storage.local.set({
      stats: {
        correctionsCount: 0,
        wordsChecked: 0
      }
    });
  }

  console.log('[OpenGrammar] Servis çalışanı başlatıldı.');
});

// İletişim dinleyicisi
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'aiTransform') {
    handleAiTransform(request.text, request.mode).then(sendResponse);
    return true; // Asenkron yanıt için
  }
});

async function handleAiTransform(text, mode) {
  const { settings = {} } = await chrome.storage.local.get('settings');
  const apiKey = settings.geminiApiKey;

  if (!apiKey) {
    return {
      error: 'Yapay Zeka (AI) dönüşümleri için lütfen uzantı Ayarlar sayfasından ücretsiz Google Gemini API anahtarınızı girin.'
    };
  }

  let prompt = '';
  if (mode === 'formal') {
    prompt = `Aşağıdaki metni anlamını koruyarak daha profesyonel, resmi ve kurumsal bir dille yeniden yaz. Sadece düzeltilmiş metni döndür:\n\n"${text}"`;
  } else if (mode === 'friendly') {
    prompt = `Aşağıdaki metni anlamını koruyarak daha samimi, kibar ve sıcak bir dille yeniden yaz. Sadece düzeltilmiş metni döndür:\n\n"${text}"`;
  } else if (mode === 'summarize') {
    prompt = `Aşağıdaki metni ana fikrini koruyarak kısa ve öz şekilde özetle. Sadece özet metni döndür:\n\n"${text}"`;
  } else {
    prompt = `Aşağıdaki metindeki tüm yazım, dilbilgisi ve noktalama hatalarını düzelt. Sadece düzeltilmiş metni döndür:\n\n"${text}"`;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.3
        }
      })
    });

    const data = await response.json();
    if (data.error) {
      return { error: 'Gemini API Hatası: ' + data.error.message };
    }

    const transformed = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return { transformedText: transformed || text };
  } catch (err) {
    return { error: 'Bağlantı hatası: ' + err.message };
  }
}
