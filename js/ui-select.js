/**
 * ui-select.js — UI Select Screen
 * Mengelola tampilan dan interaksi layar pemilihan kanji.
 */

/** Pindah ke screen tertentu */
function showScreen(screenName) {
  document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
  document.getElementById('screen-' + screenName).classList.add('active');
}

/** Update tampilan jumlah kanji terpilih */
function updateSelectionCount() {
  const countEl = document.getElementById('sel-count');
  countEl.innerHTML = 'Dipilih: <strong>' + state.selectedIds.size + '</strong> kanji';
}

/** Update status visual chip kategori */
function updateCategoryChips() {
  const chips = document.querySelectorAll('#cat-chips .chip');
  CATEGORIES.forEach((category, index) => {
    const isActive = state.activeCategories.has(category.key);
    chips[index].classList.toggle('on', isActive);
    chips[index].setAttribute('aria-checked', isActive ? 'true' : 'false');
  });
}

/** Terapkan rentang nomor sebagai seleksi */
function applyRange() {
  const fromEl = document.getElementById('range-from');
  const toEl = document.getElementById('range-to');
  const errorEl = document.getElementById('range-error');

  // Cek data tersedia
  if (!KANJI_DATA || KANJI_DATA.length === 0) {
    errorEl.textContent = 'Data kanji belum dimuat!';
    errorEl.classList.add('visible');
    return;
  }

  let fromNum = parseInt(fromEl.value);
  let toNum = parseInt(toEl.value);

  // Fallback jika NaN
  if (isNaN(fromNum) || fromNum < 1) { fromNum = 1; fromEl.value = 1; }
  if (isNaN(toNum) || toNum < 1) { toNum = KANJI_DATA.length; toEl.value = KANJI_DATA.length; }

  // Reset error
  errorEl.classList.remove('visible');
  errorEl.textContent = '';

  // Validasi batas
  if (fromNum < 1) { fromNum = 1; fromEl.value = 1; }
  if (toNum > KANJI_DATA.length) { toNum = KANJI_DATA.length; toEl.value = KANJI_DATA.length; }

  if (fromNum > toNum) {
    errorEl.textContent = 'Nomor awal tidak boleh lebih besar dari nomor akhir!';
    errorEl.classList.add('visible');
    return;
  }

  if (fromNum > KANJI_DATA.length || toNum < 1) {
    errorEl.textContent = 'Nomor harus antara 1 dan ' + KANJI_DATA.length + '!';
    errorEl.classList.add('visible');
    return;
  }

  // Clear active categories & core kanji (rentang = mode filter berbeda)
  state.activeCategories.clear();
  clearCoreKanjiSelection();

  // Update seleksi
  state.selectedIds.clear();
  KANJI_DATA.forEach(card => {
    if (card[0] >= fromNum && card[0] <= toNum) {
      state.selectedIds.add(card[0]);
    }
  });

  updateCategoryChips();
  updateSelectionCount();
}

/** Toggle semua kanji dalam satu kategori */
function toggleCategory(category, chipEl) {
  if (state.activeCategories.has(category.key)) {
    state.activeCategories.delete(category.key);
  } else {
    state.activeCategories.add(category.key);
  }

  // Clear core kanji selection (kategori = mode filter berbeda)
  clearCoreKanjiSelection();

  // Rebuild seleksi berdasarkan kategori aktif
  state.selectedIds.clear();
  KANJI_DATA.forEach(card => {
    if (state.activeCategories.has(card[4])) {
      state.selectedIds.add(card[0]);
    }
  });

  updateCategoryChips();
  updateSelectionCount();
}

/** Pilih semua kanji */
function selectAll() {
  KANJI_DATA.forEach(card => state.selectedIds.add(card[0]));
  CATEGORIES.forEach(cat => state.activeCategories.add(cat.key));
  clearCoreKanjiSelection();
  updateCategoryChips();
  updateSelectionCount();
}

/** Hapus semua seleksi */
function clearAll() {
  state.selectedIds.clear();
  state.activeCategories.clear();
  clearCoreKanjiSelection();
  updateCategoryChips();
  updateSelectionCount();
}

/** Set mode kuis */
function setMode(newMode) {
  state.mode = newMode;
  ['k2a', 'a2k', 'mix'].forEach(modeKey => {
    const btn = document.getElementById('mode-' + modeKey);
    btn.classList.toggle('on', modeKey === newMode);
    btn.setAttribute('aria-checked', modeKey === newMode ? 'true' : 'false');
  });
}

/** Lakukan pencarian kanji */
function performSearch() {
  const query = document.getElementById('search-input').value.toLowerCase().trim();
  const resultsEl = document.getElementById('search-results');
  resultsEl.replaceChildren();

  if (!query) return;

  const hits = KANJI_DATA.filter(card =>
    card[1].includes(query) || card[2].includes(query) || card[3].toLowerCase().includes(query)
  ).slice(0, CONFIG.SEARCH_LIMIT);

  hits.forEach(card => {
    const itemEl = createElement('div', 'search-item' + (state.selectedIds.has(card[0]) ? ' selected-item' : ''));
    itemEl.setAttribute('role', 'option');
    itemEl.setAttribute('tabindex', '0');
    itemEl.setAttribute('aria-selected', state.selectedIds.has(card[0]) ? 'true' : 'false');

    itemEl.appendChild(createElement('span', 'si-num', String(card[0])));
    itemEl.appendChild(createElement('span', 'si-kanji', card[1]));
    itemEl.appendChild(createElement('span', 'si-kana', card[2]));
    itemEl.appendChild(createElement('span', 'si-meaning', card[3]));

    const checkEl = createElement('span', 'si-check', state.selectedIds.has(card[0]) ? '\u2713' : '');
    itemEl.appendChild(checkEl);

    const toggleHandler = () => toggleSingleCard(card[0], itemEl);
    itemEl.addEventListener('click', toggleHandler);
    itemEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleHandler();
      }
    });

    resultsEl.appendChild(itemEl);
  });
}

/** Toggle satu kartu dari hasil pencarian */
function toggleSingleCard(kanjiId, itemEl) {
  if (state.selectedIds.has(kanjiId)) {
    state.selectedIds.delete(kanjiId);
    itemEl.classList.remove('selected-item');
    itemEl.setAttribute('aria-selected', 'false');
    itemEl.querySelector('.si-check').textContent = '';
  } else {
    state.selectedIds.add(kanjiId);
    itemEl.classList.add('selected-item');
    itemEl.setAttribute('aria-selected', 'true');
    itemEl.querySelector('.si-check').textContent = '\u2713';
  }
  updateCategoryChips();
  updateSelectionCount();
}

/* ──────────────────────────────────────────────
   CORE KANJI (KANJI INTI) SELECTION
   ────────────────────────────────────────────── */

/** Build grid of core kanji buttons */
function buildCoreKanjiGrid() {
  const gridEl = document.getElementById('core-kanji-grid');
  if (!gridEl) return;
  gridEl.replaceChildren();

  if (!CORE_KANJI_MAP || Object.keys(CORE_KANJI_MAP).length === 0) {
    gridEl.innerHTML = '<p style="color:#999;font-size:13px;">Tidak ada kanji inti tersedia.</p>';
    return;
  }

  const coreChars = Object.keys(CORE_KANJI_MAP);
  coreChars.forEach(char => {
    const group = CORE_KANJI_MAP[char];
    const count = group.derivativeIds.length + 1; // core + derivatives

    const btn = createElement('button', 'core-kanji-btn', char);
    btn.setAttribute('role', 'checkbox');
    btn.setAttribute('aria-checked', 'false');
    btn.setAttribute('aria-label', char + ' (' + group.core[3] + ') — ' + count + ' kanji');
    btn.setAttribute('title', group.core[3] + ' — ' + count + ' kanji total');
    btn.dataset.char = char;

    btn.addEventListener('click', () => toggleCoreKanji(char));
    gridEl.appendChild(btn);
  });
}

/** Toggle satu kanji inti (pilih/hapus beserta turunannya) */
function toggleCoreKanji(char) {
  if (state.activeCoreKanji.has(char)) {
    state.activeCoreKanji.delete(char);
  } else {
    state.activeCoreKanji.add(char);
  }

  // Rebuild seleksi berdasarkan kanji inti yang aktif
  rebuildSelectionFromCoreKanji();
  updateCoreKanjiGrid();
  updateCoreKanjiInfo();
  updateSelectionCount();
}

/** Rebuild selected IDs berdasarkan kanji inti yang dipilih */
function rebuildSelectionFromCoreKanji() {
  // Bersihkan kategori (core kanji = mode filter terpisah)
  state.activeCategories.clear();
  updateCategoryChips();

  // Rebuild selected IDs
  state.selectedIds.clear();
  const ids = getIdsByCoreKanji(Array.from(state.activeCoreKanji));
  ids.forEach(id => state.selectedIds.add(id));
}

/** Update tampilan visual grid kanji inti */
function updateCoreKanjiGrid() {
  const buttons = document.querySelectorAll('#core-kanji-grid .core-kanji-btn');
  buttons.forEach(btn => {
    const char = btn.dataset.char;
    const isActive = state.activeCoreKanji.has(char);
    btn.classList.toggle('on', isActive);
    btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
  });
}

/** Update info text (menunjukkan kanji yang dipilih dan jumlah total) */
function updateCoreKanjiInfo() {
  const infoEl = document.getElementById('core-info');
  if (!infoEl) return;

  if (state.activeCoreKanji.size === 0) {
    infoEl.textContent = '';
    return;
  }

  const selectedChars = Array.from(state.activeCoreKanji);
  const totalIds = getIdsByCoreKanji(selectedChars);

  // Tampilkan detail per kanji inti
  const details = selectedChars.map(char => {
    const group = CORE_KANJI_MAP[char];
    return char + '(' + (group.derivativeIds.length + 1) + ')';
  }).join(' ');

  infoEl.innerHTML = '<strong>' + selectedChars.join('、') + '</strong> dipilih — total <strong>' + totalIds.size + '</strong> kanji akan di-test<br><span class="core-detail">' + details + '</span>';
}

/** Clear core kanji selection (dipanggil saat filter lain dipakai) */
function clearCoreKanjiSelection() {
  state.activeCoreKanji.clear();
  updateCoreKanjiGrid();
  updateCoreKanjiInfo();
}
