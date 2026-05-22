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
 * Membangun peta kanji inti dan turunannya.
 * Kanji inti = entri dengan 1 karakter kanji.
 * Turunan = semua entri lain yang mengandung karakter kanji inti tersebut.
 */
function buildCoreKanjiMap() {
  CORE_KANJI_MAP = {};

  const coreEntries = KANJI_DATA.filter(card => card[1].length === 1);

  coreEntries.forEach(core => {
    const char = core[1];
    const derivativeIds = [];

    KANJI_DATA.forEach(card => {
      if (card[0] !== core[0] && card[1].includes(char)) {
        derivativeIds.push(card[0]);
      }
    });

    CORE_KANJI_MAP[char] = {
      core: core,
      derivativeIds: derivativeIds
    };
  });
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
