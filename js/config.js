/**
 * config.js — Konstanta & Konfigurasi Aplikasi
 * Berisi semua konfigurasi global dan definisi kategori tematik.
 */

const CONFIG = {
  STORAGE_KEYS: {
    SRS: 'kanji_srs_data',
    SETTINGS: 'kanji_settings'
  },
  SWIPE: {
    THRESHOLD: 80,        // Minimum px untuk dianggap swipe
    DRAG_FACTOR: 0.4,     // Faktor translasi saat drag
    ROTATE_FACTOR: 0.02,  // Faktor rotasi saat drag
    FADE_DISTANCE: 400    // Jarak px untuk fade opacity
  },
  SRS: {
    MAX_INTERVAL: 30,     // Interval maksimum hari
    MASTERY_RATIO: 0.8,   // Rasio benar untuk level "Mahir"
    MASTERY_MIN: 3,       // Minimum attempt untuk level "Mahir"
    MEDIUM_RATIO: 0.5     // Rasio benar untuk level "Sedang"
  },
  TOAST_DURATION: 2500,   // Durasi toast (ms)
  SEARCH_LIMIT: 30        // Maks hasil pencarian
};

/** Kategori tematik untuk filter kanji */
const CATEGORIES = [
  { label: 'Alam', key: 'alam' },
  { label: 'Cuaca', key: 'cuaca' },
  { label: 'Waktu', key: 'waktu' },
  { label: 'Angka', key: 'angka' },
  { label: 'Tubuh', key: 'tubuh' },
  { label: 'Posisi', key: 'posisi' },
  { label: 'Orang', key: 'orang' },
  { label: 'Keluarga', key: 'keluarga' },
  { label: 'Kata Sifat', key: 'kata sifat' },
  { label: 'Warna', key: 'warna' },
  { label: 'Ekspresi', key: 'ekspresi' },
  { label: 'Kata Kerja', key: 'kata kerja' },
  { label: 'Makanan & Minuman', key: 'makanan & minuman' },
  { label: 'Kesehatan', key: 'kesehatan' },
  { label: 'Komunikasi', key: 'komunikasi' },
  { label: 'Pekerjaan', key: 'pekerjaan' },
  { label: 'Ekonomi', key: 'ekonomi' },
  { label: 'Benda', key: 'benda' },
  { label: 'Tempat', key: 'tempat' },
  { label: 'Pendidikan', key: 'pendidikan' },
  { label: 'Transportasi', key: 'transportasi' }
];
