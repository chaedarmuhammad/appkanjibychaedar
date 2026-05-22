/**
 * app.js — Initialization & Event Wiring
 * Entry point aplikasi. Mengelola inisialisasi dan pemasangan event listener.
 */

/* ──────────────────────────────────────────────
   UTILITY FUNCTIONS
   ────────────────────────────────────────────── */

/** Acak array menggunakan Fisher-Yates shuffle */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Tampilkan toast notification */
function showToast(message) {
  const toastEl = document.getElementById('toast');
  toastEl.textContent = message;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), CONFIG.TOAST_DURATION);
}

/** Buat elemen DOM dengan class dan text */
function createElement(tag, className, textContent) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (textContent) el.textContent = textContent;
  return el;
}


/* ──────────────────────────────────────────────
   SRS & DATA MANAGEMENT
   ────────────────────────────────────────────── */

/** Toggle SRS on/off */
function toggleSRS() {
  state.srsEnabled = !state.srsEnabled;
  saveSettings();
  updateSRSButton();
  showToast(state.srsEnabled ? 'SRS diaktifkan' : 'SRS dinonaktifkan');
}

/** Update tampilan tombol SRS */
function updateSRSButton() {
  document.getElementById('srs-toggle-btn').textContent =
    'SRS: ' + (state.srsEnabled ? 'Aktif' : 'Nonaktif');
}

/** Simpan settings ke localStorage */
function saveSettings() {
  storageSet(CONFIG.STORAGE_KEYS.SETTINGS, { srsEnabled: state.srsEnabled });
}

/** Muat settings dari localStorage */
function loadSettings() {
  const settings = storageGet(CONFIG.STORAGE_KEYS.SETTINGS, { srsEnabled: true });
  state.srsEnabled = settings.srsEnabled !== undefined ? settings.srsEnabled : true;
}

/** Export progress ke file JSON */
function exportProgress() {
  const data = {
    version: 1,
    exportDate: new Date().toISOString(),
    srs: loadSRSData(),
    settings: { srsEnabled: state.srsEnabled }
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const linkEl = document.createElement('a');
  linkEl.href = url;
  linkEl.download = 'kanji-progress-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(linkEl);
  linkEl.click();
  document.body.removeChild(linkEl);
  URL.revokeObjectURL(url);
  showToast('Progress berhasil di-export!');
}

/** Import progress dari file JSON */
function importProgress(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);

      if (data.srs) {
        saveSRSData(data.srs);
      }
      if (data.settings) {
        state.srsEnabled = data.settings.srsEnabled !== undefined ? data.settings.srsEnabled : true;
        saveSettings();
        updateSRSButton();
      }

      showToast('Progress berhasil di-import!');
    } catch (error) {
      console.warn('[Import] File tidak valid:', error);
      showToast('File tidak valid!');
    }
  };

  reader.readAsText(file);
  event.target.value = '';
}

/** Reset semua progress SRS */
function resetProgress() {
  if (confirm('Hapus semua data progress? Ini tidak bisa dibatalkan.')) {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.SRS);
    showToast('Progress direset!');
  }
}


/* ──────────────────────────────────────────────
   INITIALIZATION
   ────────────────────────────────────────────── */

function init() {
  // Muat settings tersimpan
  loadSettings();
  updateSRSButton();

  // ── Event Listeners (dipasang selalu, meskipun data kosong) ──

  // Tab navigation
  initTabs();

  // Select screen
  document.getElementById('btn-apply-range').addEventListener('click', applyRange);
  document.getElementById('search-input').addEventListener('input', performSearch);
  document.getElementById('btn-start-quiz').addEventListener('click', startQuiz);
  document.getElementById('btn-select-all').addEventListener('click', selectAll);
  document.getElementById('btn-clear-all').addEventListener('click', clearAll);

  // Mode buttons
  document.querySelectorAll('.mode-btn[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  });

  // SRS & Data
  document.getElementById('srs-toggle-btn').addEventListener('click', toggleSRS);
  document.getElementById('btn-export').addEventListener('click', exportProgress);
  document.getElementById('btn-import-trigger').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });
  document.getElementById('import-file').addEventListener('change', importProgress);
  document.getElementById('btn-reset').addEventListener('click', resetProgress);

  // Quiz screen
  document.getElementById('btn-back-quiz').addEventListener('click', backToSelect);
  document.getElementById('btn-shuffle').addEventListener('click', shuffleAndRestart);
  document.getElementById('flashcard').addEventListener('click', flipCard);
  document.getElementById('btn-rate-unknown').addEventListener('click', () => rateCard(false));
  document.getElementById('btn-rate-know').addEventListener('click', () => rateCard(true));

  // Result screen
  document.getElementById('btn-retry-unknown').addEventListener('click', retryUnknown);
  document.getElementById('btn-retry-all').addEventListener('click', retryAll);
  document.getElementById('btn-back-result').addEventListener('click', backToSelect);

  // Global keyboard
  document.addEventListener('keydown', handleKeyboard);

  // Swipe gestures (mobile)
  initSwipeGestures();

  // Cek apakah data tersedia
  if (!KANJI_DATA || KANJI_DATA.length === 0) {
    document.getElementById('header-total').textContent = '0';
    console.warn('[Init] Data kanji kosong, tampilan mungkin tidak lengkap.');
    showToast('Data kanji tidak tersedia. Pastikan dibuka via web server (bukan file://).');
    return;
  }

  // ── Build UI berdasarkan data ──

  // Update header total
  document.getElementById('header-total').textContent = KANJI_DATA.length;

  // Build chip kategori
  const chipsContainer = document.getElementById('cat-chips');
  chipsContainer.replaceChildren(); // Clear dulu untuk hindari duplikat
  CATEGORIES.forEach(category => {
    const chipBtn = createElement('button', 'chip', category.label);
    chipBtn.setAttribute('role', 'checkbox');
    chipBtn.setAttribute('aria-checked', 'false');
    chipBtn.addEventListener('click', () => toggleCategory(category, chipBtn));
    chipsContainer.appendChild(chipBtn);
  });

  // Build core kanji grid
  buildCoreKanjiGrid();

  // Set max & default range input berdasarkan data
  const rangeFrom = document.getElementById('range-from');
  const rangeTo = document.getElementById('range-to');
  rangeFrom.max = KANJI_DATA.length;
  rangeTo.max = KANJI_DATA.length;

  // Pastikan value default valid
  if (!rangeFrom.value || parseInt(rangeFrom.value) < 1) rangeFrom.value = 1;
  if (!rangeTo.value || parseInt(rangeTo.value) < 1 || parseInt(rangeTo.value) > KANJI_DATA.length) {
    rangeTo.value = Math.min(100, KANJI_DATA.length);
  }

  // Terapkan rentang default
  applyRange();
}

// ── Start the app ──
loadKanjiData().then(() => init());
