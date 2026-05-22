/**
 * state.js — State Management
 * Menyimpan seluruh state aplikasi di satu tempat terpusat.
 */

const state = {
  selectedIds: new Set(),      // ID kanji yang dipilih
  activeCategories: new Set(), // Kategori yang aktif dipilih oleh user
  mode: 'k2a',                // Mode kuis: k2a | a2k | mix
  deck: [],                   // Deck kartu aktif
  currentIndex: 0,            // Index kartu saat ini
  isFlipped: false,           // Apakah kartu sudah dibalik
  knownCount: 0,              // Jumlah benar
  unknownCount: 0,            // Jumlah salah
  unknownCards: [],            // Kartu yang salah (untuk retry)
  currentCardMode: 'k2a',     // Mode kartu saat ini (untuk mode mix)
  srsEnabled: true             // SRS aktif/tidak
};
