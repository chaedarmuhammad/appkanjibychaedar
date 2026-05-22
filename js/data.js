/**
 * data.js — Kanji Data Loader
 * Memuat data kanji dari file JSON dan mengkonversi ke format array.
 * Format internal: [id, kanji, kana, arti, kategori]
 *
 * Data disimpan di data/kanji.json dalam format objek untuk kemudahan edit.
 * Di sini dikonversi ke format array untuk kompatibilitas dengan logic yang ada.
 */

let KANJI_DATA = [];

/**
 * CORE_KANJI_MAP — Peta kanji inti beserta turunannya.
 * Key: karakter kanji inti (1 karakter)
 * Value: { core: [id, kanji, kana, arti, kategori], derivatives: [...ids] }
 *
 * Turunan ditentukan berdasarkan "character containment":
 * semua entri yang mengandung karakter kanji inti di dalamnya.
 */
let CORE_KANJI_MAP = {};

/**
 * Load data kanji dari JSON file.
 * Dipanggil sebelum init() untuk memastikan data tersedia.
 */
async function loadKanjiData() {
  let jsonData = null;

  // Method 1: Fetch API (works with web server)
  try {
    const response = await fetch('data/kanji.json');
    if (response.ok) {
      jsonData = await response.json();
    }
  } catch (error) {
    console.warn('[Data] Fetch gagal:', error.message);
  }

  // Method 2: XMLHttpRequest fallback (works with file:// protocol)
  if (!jsonData) {
    try {
      jsonData = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'data/kanji.json', true);
        xhr.responseType = 'json';
        xhr.onload = function () {
          if (xhr.status === 200 || xhr.status === 0) { // status 0 = file://
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
    // Set data kosong agar app tidak crash
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

  // Identifikasi semua kanji inti (1 karakter)
  const coreEntries = KANJI_DATA.filter(card => card[1].length === 1);

  coreEntries.forEach(core => {
    const char = core[1]; // karakter kanji
    const derivativeIds = [];

    // Cari semua entri yang mengandung karakter ini (selain dirinya sendiri)
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
      ids.add(group.core[0]); // ID kanji inti
      group.derivativeIds.forEach(id => ids.add(id)); // ID turunan
    }
  });
  return ids;
}
