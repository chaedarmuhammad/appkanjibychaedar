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
 * Load data kanji dari JSON file.
 * Dipanggil sebelum init() untuk memastikan data tersedia.
 */
async function loadKanjiData() {
  try {
    const response = await fetch('data/kanji.json');
    if (!response.ok) throw new Error('HTTP ' + response.status);

    const jsonData = await response.json();

    // Konversi dari format objek ke format array [id, kanji, kana, arti, kategori]
    KANJI_DATA = jsonData.map(item => [
      item.id,
      item.kanji,
      item.kana,
      item.arti,
      item.kategori
    ]);

    console.log(`[Data] ${KANJI_DATA.length} kanji berhasil dimuat.`);
  } catch (error) {
    console.error('[Data] Gagal memuat data kanji:', error);
    showToast('Gagal memuat data kanji!');
  }
}
