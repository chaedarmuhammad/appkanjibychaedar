/**
 * ui-result.js — UI Result Screen
 * Mengelola tampilan dan interaksi layar hasil kuis.
 */

/** Tampilkan layar hasil */
function showResult() {
  document.getElementById('res-know').textContent = state.knownCount;
  document.getElementById('res-unknown').textContent = state.unknownCount;

  const percentage = state.deck.length > 0
    ? Math.round(state.knownCount / state.deck.length * 100)
    : 0;
  document.getElementById('result-sub').textContent =
    'Kamu tahu ' + state.knownCount + ' dari ' + state.deck.length + ' kanji (' + percentage + '%)';

  showScreen('result');
}

/** Ulangi hanya kartu yang belum tahu */
function retryUnknown() {
  if (!state.unknownCards.length) {
    showToast('Semua sudah tahu!');
    return;
  }
  state.deck = state.srsEnabled ? sortBySRS([...state.unknownCards]) : shuffleArray([...state.unknownCards]);
  state.currentIndex = 0;
  state.knownCount = 0;
  state.unknownCount = 0;
  state.unknownCards = [];
  showScreen('quiz');
  renderCard();
}

/** Ulangi semua kartu */
function retryAll() {
  state.deck = state.srsEnabled ? sortBySRS([...state.deck]) : shuffleArray([...state.deck]);
  state.currentIndex = 0;
  state.knownCount = 0;
  state.unknownCount = 0;
  state.unknownCards = [];
  showScreen('quiz');
  renderCard();
}

/** Kembali ke layar seleksi */
function backToSelect() {
  showScreen('select');
}
