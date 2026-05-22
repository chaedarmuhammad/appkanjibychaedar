/**
 * data.js — Kanji Data Loader
 * Memuat data kanji dan mengkonversi ke format array.
 * Format internal: [id, kanji, kana, arti, kategori]
 *
 * Data dimuat dari KANJI_RAW_DATA (embedded script) sebagai primary source.
 * Fallback ke fetch data/kanji.json jika embedded tidak tersedia.
 */

let KANJI_DATA = [];

/**
 * CORE_KANJI_MAP — Peta kanji inti beserta turunannya.
 * Key: karakter kanji inti (1 karakter)
 * Value: { core: [id, kanji, kana, arti, kategori], derivativeIds: [...ids] }
 */
let CORE_KANJI_MAP = {};

/**
 * Load data kanji.
 * Priority: embedded KANJI_RAW_DATA > fetch dari JSON file.
 */
async function loadKanjiData() {
  let jsonData = null;

  // Method 1: Embedded data (paling reliable, tidak perlu fetch)
  if (typeof KANJI_RAW_DATA !== 'undefined' && Array.isArray(KANJI_RAW_DATA) && KANJI_RAW_DATA.length > 0) {
    jsonData = KANJI_RAW_DATA;
    console.log('[Data] Menggunakan embedded data.');
  }

  // Method 2: Fetch API fallback
  if (!jsonData) {
    try {
      const response = await fetch('data/kanji.json');
      if (response.ok) {
        jsonData = await response.json();
        console.log('[Data] Menggunakan fetch data.');
      }
    } catch (error) {
      console.warn('[Data] Fetch gagal:', error.message);
    }
  }

  // Method 3: XMLHttpRequest fallback (file:// protocol)
  if (!jsonData) {
    try {
      jsonData = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'data/kanji.json', true);
        xhr.responseType = 'json';
        xhr.onload = function () {
          if (xhr.status === 200 || xhr.status === 0) {
            resolve(xhr.response);
          } else {
            reject(new Error('XHR status: ' + xhr.status));
          }
        };
        xhr.onerror = function () { reject(new Error('XHR error')); };
        xhr.send();
      });
    } catch (error) {
      console.warn('[Data] XHR fallback gagal:', error.message);
    }
  }

  if (!jsonData || !Array.isArray(jsonData) || jsonData.length === 0) {
    console.error('[Data] Gagal memuat data kanji!');
    KANJI_DATA = [];
    CORE_KANJI_MAP = {};
    return;
  }

  // Konversi dari format objek ke format array [id, kanji, kana, arti, kategori]
  KANJI_DATA = jsonData.map(item => [
    item.id,
    item.kanji,
    item.kana,
    item.arti,
    item.kategori
  ]);

  // Build core kanji map
  buildCoreKanjiMap();

  console.log('[Data] ' + KANJI_DATA.length + ' kanji berhasil dimuat.');
  console.log('[Data] ' + Object.keys(CORE_KANJI_MAP).length + ' kanji inti teridentifikasi.');
}

/**
 * Menghitung jumlah karakter kanji (CJK) dalam sebuah string.
 */
function countKanjiChars(text) {
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0x4E00 && code <= 0x9FFF) count++;
  }
  return count;
}

/**
 * Mengekstrak karakter kanji (CJK) dari sebuah string.
 */
function getKanjiChars(text) {
  const chars = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0x4E00 && code <= 0x9FFF) chars.push(text[i]);
  }
  return chars;
}

/**
 * Membangun peta kanji inti dan turunannya berdasarkan URUTAN DI FILE.
 * Kanji inti = entri pertama yang mengandung 1 karakter kanji unik.
 * Turunan = semua entri berikutnya (baik 1 kanji maupun 2+ kanji) yang berada
 *           di bawah kanji inti tersebut sampai kanji inti berikutnya muncul.
 *
 * Struktur file: [inti] [turunan...] [inti] [turunan...] ...
 */
function buildCoreKanjiMap() {
  CORE_KANJI_MAP = {};

  // Bangun grup berdasarkan posisi di file
  // Entry pertama dengan 1 kanji char yang BELUM pernah muncul = kanji inti baru
  // Entry setelahnya (sampai kanji inti berikutnya) = turunan
  const seenCoreChars = new Set();
  let currentChar = null;
  let currentCore = null;
  let currentDerivativeIds = [];

  KANJI_DATA.forEach(card => {
    const kanjiChars = getKanjiChars(card[1]);
    const kanjiCount = kanjiChars.length;

    if (kanjiCount === 1 && !seenCoreChars.has(kanjiChars[0])) {
      // Simpan grup sebelumnya
      if (currentChar !== null) {
        CORE_KANJI_MAP[currentChar] = {
          core: currentCore,
          derivativeIds: currentDerivativeIds
        };
      }

      // Mulai grup baru
      currentChar = kanjiChars[0];
      currentCore = card;
      currentDerivativeIds = [];
      seenCoreChars.add(currentChar);
    } else {
      // Entry ini adalah turunan dari kanji inti saat ini
      if (currentChar !== null) {
        currentDerivativeIds.push(card[0]);
      }
    }
  });

  // Simpan grup terakhir
  if (currentChar !== null) {
    CORE_KANJI_MAP[currentChar] = {
      core: currentCore,
      derivativeIds: currentDerivativeIds
    };
  }
}

/**
 * Dapatkan semua ID (core + turunan) untuk satu atau lebih kanji inti.
 * @param {string[]} coreChars - Array karakter kanji inti yang dipilih
 * @returns {Set<number>} - Set berisi semua ID yang terkait
 */
function getIdsByCoreKanji(coreChars) {
  const ids = new Set();
  coreChars.forEach(char => {
    const group = CORE_KANJI_MAP[char];
    if (group) {
      ids.add(group.core[0]);
      group.derivativeIds.forEach(id => ids.add(id));
    }
  });
  return ids;
}
