// OpenGrammar - Yüksek Performanslı Yerel İmla & Dilbilgisi Motoru
// %100 İstemci Tarafında (Client-Side) Çalışır, Gizlilik Odaklıdır.

(() => {
  'use strict';

  // Türkçe En Sık Yapılan Yazım Yanlışları Sözlüğü
  const TR_SPELLING_DICTIONARY = {
    "yalnış": "yanlış",
    "yanlız": "yalnız",
    "herşey": "her şey",
    "birşey": "bir şey",
    "hiç bir": "hiçbir",
    "hergün": "her gün",
    "orjinal": "orijinal",
    "traş": "tıraş",
    "kiprik": "kirpik",
    "herkez": "herkes",
    "direk": "direkt", // 'doğrudan' anlamında
    "insiyatif": "inisiyatif",
    "süpriz": "sürpriz",
    "egzoz": "egzoz",
    "egsoz": "egzoz",
    "eksoz": "egzoz",
    "tabiki": "tabii ki",
    "laboratuar": "laboratuvar",
    "malesef": "maalesef",
    "şarz": "şarj",
    "menapoz": "menopoz",
    "antreman": "antrenman",
    "ahçı": "aşçı",
    "doküman": "doküman",
    "döküman": "doküman",
    "gardolap": "gardırop",
    "hafriyat": "hafriyat",
    "harfiyat": "hafriyat",
    "ünvan": "unvan",
    "klavuz": "kılavuz",
    "makina": "makine",
    "meyva": "meyve",
    "mütevazi": "mütevazı",
    "parlemento": "parlamento",
    "raslantı": "rastlantı",
    "silahşör": "silahşor",
    "şöför": "şoför",
    "tesbih": "tespih",
    "vejeteryan": "vejetaryen",
    "zerafet": "zarafet",
    "hastahane": "hastane",
    "pastahane": "pastane",
    "postahane": "postane",
    "eczahane": "eczane",
    "pekçok": "pek çok",
    "yada": "ya da",
    "farketmek": "fark etmek",
    "terkettim": "terk ettim",
    "terketmek": "terk etmek",
    "ayırttırmak": "ayırtmak",
    "ayırtetmek": "ayırt etmek",
    "saol": "sağ ol",
    "sağol": "sağ ol",
    "hoşçakal": "hoşça kal",
    "hoşgeldiniz": "hoş geldiniz",
    "hoşgeldin": "hoş geldin",
    "bir çok": "birçok",
    "birtakım": "bir takım", // bağlama göre
    "gitgide": "gitgide",
    "rastgele": "rastgele"
  };

  // İngilizce En Sık Yapılan Hatalar
  const EN_SPELLING_DICTIONARY = {
    "teh": "the",
    "alot": "a lot",
    "definately": "definitely",
    "defanitely": "definitely",
    "seperate": "separate",
    "untill": "until",
    "occured": "occurred",
    "recieve": "receive",
    "wich": "which",
    "adress": "address",
    "goverment": "government",
    "wierd": "weird",
    "accomodate": "accommodate",
    "truely": "truly",
    "noticable": "noticeable"
  };

  // Soru eki tespiti (gelirmisin -> gelir misin, yaptınmı -> yaptın mı)
  const TR_QUESTION_SUFFIXES = [
    { regex: /([a-zçğıöşüA-ZÇĞİÖŞÜ]+)(misin|misiniz|miyiz|miyim|mi|mısın|mısınız|mıyız|mıyım|mı|musun|musunuz|muyuz|muyum|mu|müsün|müsünüz|müyüz|müyüm|mü)$/i, group1: 1, group2: 2 }
  ];

  class GrammarEngine {
    constructor() {
      this.enabled = true;
    }

    /**
     * Verilen metindeki yazım, imla ve gramer hatalarını tespit eder
     */
    analyzeText(text) {
      if (!text || typeof text !== 'string') return [];
      const issues = [];

      // 1. Türkçe & İngilizce Sözlük Taraması
      this.checkDictionaryWords(text, issues);

      // 2. Türkçe Soru Eki "mi / mı / mu / mü" Kontrolü
      this.checkTurkishQuestionSuffix(text, issues);

      // 3. Noktalama İşaretleri Sonrası Boşluk Kontrolü
      this.checkPunctuationSpacing(text, issues);

      // 4. Çift Boşluk Kontrolü
      this.checkDoubleSpaces(text, issues);

      // 5. Cümle Başı Büyük Harf Kontrolü
      this.checkSentenceCapitalization(text, issues);

      return issues;
    }

    checkDictionaryWords(text, issues) {
      // Kelimeleri ve indekslerini regex ile bul
      const wordRegex = /[a-zA-ZçğıöşüÇĞİÖŞÜ0-9_'-]+/g;
      let match;

      while ((match = wordRegex.exec(text)) !== null) {
        const rawWord = match[0];
        const lowerWord = rawWord.toLowerCase();
        const start = match.index;
        const end = start + rawWord.length;

        // Türkçe sözlük kontrolü
        if (TR_SPELLING_DICTIONARY[lowerWord]) {
          let suggestion = TR_SPELLING_DICTIONARY[lowerWord];
          // Büyük/küçük harf uyumu
          if (rawWord[0] === rawWord[0].toUpperCase() && rawWord[0] !== rawWord[0].toLowerCase()) {
            suggestion = suggestion.charAt(0).toUpperCase() + suggestion.slice(1);
          }

          issues.push({
            id: `dict_tr_${start}`,
            type: 'spelling',
            original: rawWord,
            suggestion: suggestion,
            start: start,
            end: end,
            reason: `"${rawWord}" kelimesinin doğru yazılışı: "${suggestion}"`
          });
          continue;
        }

        // İngilizce sözlük kontrolü
        if (EN_SPELLING_DICTIONARY[lowerWord]) {
          let suggestion = EN_SPELLING_DICTIONARY[lowerWord];
          if (rawWord[0] === rawWord[0].toUpperCase()) {
            suggestion = suggestion.charAt(0).toUpperCase() + suggestion.slice(1);
          }

          issues.push({
            id: `dict_en_${start}`,
            type: 'spelling',
            original: rawWord,
            suggestion: suggestion,
            start: start,
            end: end,
            reason: `Spelling error: Did you mean "${suggestion}"?`
          });
        }
      }
    }

    checkTurkishQuestionSuffix(text, issues) {
      const wordRegex = /[a-zA-ZçğıöşüÇĞİÖŞÜ]+/g;
      let match;

      while ((match = wordRegex.exec(text)) !== null) {
        const word = match[0];
        const lower = word.toLowerCase();

        // Hariç tutulacak kök kelimeler (örn: cami, resmi, sami, demi, gemi vb.)
        const exceptions = ['cami', 'resmi', 'sami', 'gemi', 'azami', 'umumi', 'hakiki', 'hakkı', 'harbi'];
        if (exceptions.includes(lower)) continue;

        for (const item of TR_QUESTION_SUFFIXES) {
          const suffixMatch = lower.match(item.regex);
          if (suffixMatch && suffixMatch[1].length >= 3) {
            const root = word.substring(0, suffixMatch[1].length);
            const suffix = word.substring(suffixMatch[1].length);
            const suggestion = `${root} ${suffix}`;

            issues.push({
              id: `q_suffix_${match.index}`,
              type: 'grammar',
              original: word,
              suggestion: suggestion,
              start: match.index,
              end: match.index + word.length,
              reason: `Soru eki "${suffix}" sözcükten ayrı yazılmalıdır: "${suggestion}"`
            });
            break;
          }
        }
      }
    }

    checkPunctuationSpacing(text, issues) {
      // Virgül, nokta, noktalı virgül sonrası harf geliyorsa boşluk ekle (örn: "selam,nasılsın" -> "selam, nasılsın")
      // Sayısal değerler hariç (3.14 veya 10,5 gibi)
      const puncRegex = /([a-zA-ZçğıöşüÇĞİÖŞÜ])([,;:\?!])([a-zA-ZçğıöşüÇĞİÖŞÜ])/g;
      let match;

      while ((match = puncRegex.exec(text)) !== null) {
        const full = match[0];
        const charBefore = match[1];
        const mark = match[2];
        const charAfter = match[3];
        const suggestion = `${charBefore}${mark} ${charAfter}`;

        issues.push({
          id: `punc_${match.index}`,
          type: 'formatting',
          original: full,
          suggestion: suggestion,
          start: match.index,
          end: match.index + full.length,
          reason: `Noktalama işaretinden ("${mark}") sonra bir boşluk bırakılmalıdır.`
        });
      }
    }

    checkDoubleSpaces(text, issues) {
      const doubleSpaceRegex = /  +/g;
      let match;

      while ((match = doubleSpaceRegex.exec(text)) !== null) {
        issues.push({
          id: `space_${match.index}`,
          type: 'formatting',
          original: match[0],
          suggestion: ' ',
          start: match.index,
          end: match.index + match[0].length,
          reason: 'Gereksiz birden fazla boşluk tespit edildi.'
        });
      }
    }

    checkSentenceCapitalization(text, issues) {
      // Cümle başı (. ! ? sonrasındaki ilk harf)
      const sentenceRegex = /(^|[.!?]\s+)([a-zçğıöşü])/g;
      let match;

      while ((match = sentenceRegex.exec(text)) !== null) {
        const prefix = match[1];
        const lowerChar = match[2];
        const start = match.index + prefix.length;
        const upperChar = lowerChar.toUpperCase();

        issues.push({
          id: `cap_${start}`,
          type: 'capitalization',
          original: lowerChar,
          suggestion: upperChar,
          start: start,
          end: start + 1,
          reason: 'Cümleye büyük harfle başlanmalıdır.'
        });
      }
    }
  }

  // Global veya Modül olarak dışa aktar
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GrammarEngine;
  } else {
    window.OpenGrammarEngine = new GrammarEngine();
  }
})();
