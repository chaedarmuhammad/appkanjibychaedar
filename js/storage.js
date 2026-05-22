/**
 * storage.js — localStorage Helpers
 * Abstraksi baca/tulis localStorage dengan error handling aman.
 */

/**
 * Baca data dari localStorage dengan fallback aman.
 * @param {string} key - Kunci localStorage
 * @param {*} fallback - Nilai default jika gagal
 * @returns {*} Data yang diparsing atau fallback
 */
function storageGet(key, fallback = {}) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (error) {
    console.warn(`[Storage] Gagal membaca "${key}":`, error);
    return fallback;
  }
}

/**
 * Simpan data ke localStorage.
 * @param {string} key - Kunci localStorage
 * @param {*} data - Data yang akan disimpan
 */
function storageSet(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn(`[Storage] Gagal menyimpan "${key}":`, error);
  }
}
