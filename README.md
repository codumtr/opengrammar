# ✍️ OpenGrammar - Akıllı Türkçe & İngilizce İmla ve AI Asistanı

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-purple.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Made with Love by CODUM.TR](https://img.shields.io/badge/Developer-CODUM.TR-blue.svg)](https://github.com/codumtr)

> **Grammarly'nin pahalı aboneliklerine ve gizlilik ihlallerine son.**  
> %100 yerel çalışan (Offline-First), Türkçe odaklı, gizlilik dostu ve isteğe bağlı ücretsiz Gemini AI destekli açık kaynak yazım asistanı.

---

## ⚡ Neden Grammarly'den Daha İyi?

| Özellik | Grammarly | **OpenGrammar** |
| :--- | :---: | :---: |
| **Fiyat** | Aylık \$12 - \$30 💸 | **%100 Ücretsiz & Açık Kaynak** 🎁 |
| **Türkçe Dil Desteği** | Çok Zayıf / Yok ❌ | **Gelişmiş Türkçe İmla & Dilbilgisi Motoru** 🇹🇷 |
| **Gizlilik & Veri Güvenliği** | Yazdığınız her şey sunucularına gider ⚠️ | **%100 İstemci Tarafı (Verileriniz Asla Cihazınızdan Çıkmaz)** 🔒 |
| **Soru Eki & Bağlaç Kontrolü** | Yok ❌ | **Var (mi/mı ayrımı, de/da, ki denetimi)** ✅ |
| **Yapay Zeka (AI) Tonu** | Pahalı Premium üyelik ister 💳 | **Kendi Ücretsiz Google Gemini API Anahtarınızla Sınırsız** 🤖 |

---

## 🌟 Öne Çıkan Özellikler

1. **🇹🇷 Gelişmiş Türkçe İmla Kuralları:**
   - Sık yapılan 100+ kelime hatasını anında yakalar (`yalnış` ➔ `yanlış`, `herşey` ➔ `her şey`, `süpriz` ➔ `sürpriz` vb.).
   - Soru eki `"mi / mı / mu / mü"` ayrımı (`gelirmisin` ➔ `gelir misin`).
   - Bağlaç ve ek uyarıları.
2. **🇬🇧 İngilizce Yazım Denetimi:**
   - Yaygın İngilizce kelime karışıklıklarını ve imla hatalarını tespit eder.
3. **🎯 Canlı Sayfa Asistan Rozeti:**
   - Gmail, LinkedIn, Twitter/X, WhatsApp Web, Notion ve tüm web formlarında sağ altta zarif bir rozet olarak belirir.
   - Hata tespit ettiğinde tek tıkla düzeltme önerisi kartı açılır.
4. **💼 Yapay Zeka Destekli Ton Ayarlayıcı:**
   - "Resmi ve Kurumsal Yap" (İş e-postaları için ideal).
   - "Kibar ve Samimi Yap".
   - "Özetle & Kısalt".
5. **📖 Özel Sözlük:**
   - Kendi şirket veya terim kelimelerinizi ekleyin, asla hata olarak işaretlenmesin.

---

## 📂 Proje Mimarisi

```text
opengrammar/
├── manifest.json              # Chrome Manifest V3 konfigürasyonu
├── engine/
│   └── engine.js              # %100 çevrimdışı çalışan imla, sözlük ve kural motoru
├── content/
│   ├── content.js             # Sayfa içi metin kutularına bağlanan canlı asistan
│   └── content.css            # Modern mor/fuşya açılır kart ve rozet stilleri
├── background/
│   └── service-worker.js      # Yapay zeka dönüşümleri ve arka plan servisi
├── popup/
│   ├── popup.html             # Hızlı metin denetleme penceresi
│   ├── popup.css              # Koyu/neon arayüz
│   └── popup.js               # Canlı denetleme ve düzeltme denetleyicisi
├── options/
│   ├── options.html           # Gemini API anahtarı ve özel sözlük yönetim paneli
│   ├── options.css            # Gelişmiş ayarlar stilleri
│   └── options.js             # Ayarlar kaydedici
├── icons/                     # 16, 32, 48, 128 px ikonlar
├── LICENSE                    # MIT Lisansı (CODUM.TR)
└── README.md                  # Proje dokümantasyonu
```

---

## 🛠️ Kurulum ve Test (Tarayıcınıza Yükleyin)

1. Bu projeyi indirin veya klonlayın.
2. Google Chrome'da `chrome://extensions/` sayfasına gidin.
3. Sağ üst köşedeki **"Geliştirici modu" (Developer mode)** anahtarını açın.
4. Sol üstteki **"Paketlenmemiş öge yükle" (Load unpacked)** butonuna tıklayın.
5. Bu projenin klasörünü (`opengrammar`) seçin.
6. 🎉 **OpenGrammar hazır!** Herhangi bir web sitesinde yazı yazarken sağ altta beliren rozeti deneyebilirsiniz.

---

## 📄 Lisans

Bu proje **MIT Lisansı** altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına göz atabilirsiniz.
Geliştirici: **[CODUM.TR](https://github.com/codumtr)**
