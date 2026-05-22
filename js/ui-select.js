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

  let fromNum = parseInt(fromEl.value) || 1;
  let toNum = parseInt(toEl.value) || KANJI_DATA.length;

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

  // Clear active categories (rentang = mode filter berbeda)
  state.activeCategories.clear();

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
  updateCategoryChips();
  updateSelectionCount();
}

/** Hapus semua seleksi */
function clearAll() {
  state.selectedIds.clear();
  state.activeCategories.clear();
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
