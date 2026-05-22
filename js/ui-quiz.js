/**
 * ui-quiz.js — UI Quiz Screen
 * Mengelola tampilan dan interaksi layar kuis flashcard.
 */

/** Mulai kuis dengan kartu yang dipilih */
function startQuiz() {
  if (!state.selectedIds.size) {
    showToast('Pilih minimal 1 kanji!');
    return;
  }

  let cards = KANJI_DATA.filter(card => state.selectedIds.has(card[0]));
  state.deck = state.srsEnabled ? sortBySRS(cards) : shuffleArray(cards);
  state.currentIndex = 0;
  state.knownCount = 0;
  state.unknownCount = 0;
  state.unknownCards = [];

  showScreen('quiz');
  renderCard();
}

/** Acak ulang dan restart kuis */
function shuffleAndRestart() {
  state.deck = shuffleArray([...state.deck]);
  state.currentIndex = 0;
  state.knownCount = 0;
  state.unknownCount = 0;
  state.unknownCards = [];
  renderCard();
}

/** Render kartu saat ini */
function renderCard() {
  state.isFlipped = false;
  const card = state.deck[state.currentIndex];

  // Tentukan mode kartu (untuk mode 'mix', acak antara k2a dan a2k)
  state.currentCardMode = state.mode === 'mix'
    ? (Math.random() > 0.5 ? 'k2a' : 'a2k')
    : state.mode;

  // Update badge & nomor
  document.getElementById('card-badge').textContent =
    state.currentCardMode === 'k2a' ? 'Kanji \u2192 Arti' : 'Arti \u2192 Kanji';
  document.getElementById('card-no').textContent = '#' + card[0];

  // Update konten utama
  const mainEl = document.getElementById('card-main');
  const subEl = document.getElementById('card-sub');

  if (state.currentCardMode === 'k2a') {
    mainEl.textContent = card[1];
    mainEl.className = 'card-main';
  } else {
    mainEl.textContent = card[3];
    mainEl.className = 'card-main latin';
  }
  subEl.textContent = '';

  // SRS badge
  const srsBadgeEl = document.getElementById('srs-badge');
  if (state.srsEnabled) {
    srsBadgeEl.textContent = getSRSLevel(card[0]);
    srsBadgeEl.style.display = 'inline-block';
  } else {
    srsBadgeEl.style.display = 'none';
  }

  // Reset UI kartu
  document.getElementById('card-answer').className = 'card-answer';
  document.getElementById('flip-hint').style.display = 'block';
  document.getElementById('rating-row').classList.remove('visible');
  document.getElementById('swipe-hint').style.opacity = '1';

  updateProgress();
}

/** Balik kartu untuk melihat jawaban */
function flipCard() {
  if (state.isFlipped) return;
  state.isFlipped = true;

  const card = state.deck[state.currentIndex];
  const answerEl = document.getElementById('answer-content');
  answerEl.replaceChildren();

  if (state.currentCardMode === 'k2a') {
    answerEl.appendChild(createElement('div', 'answer-main', card[3]));
    answerEl.appendChild(createElement('div', 'answer-kana', card[2]));
  } else {
    answerEl.appendChild(createElement('div', 'answer-kanji', card[1]));
    answerEl.appendChild(createElement('div', 'answer-kana', card[2]));
  }

  document.getElementById('card-answer').className = 'card-answer visible';
  document.getElementById('flip-hint').style.display = 'none';
  document.getElementById('rating-row').classList.add('visible');
  document.getElementById('swipe-hint').style.opacity = '1';
}

/** Beri rating pada kartu (tahu / belum tahu) */
function rateCard(isKnown) {
  const card = state.deck[state.currentIndex];

  if (isKnown) {
    state.knownCount++;
  } else {
    state.unknownCount++;
    state.unknownCards.push(card);
  }

  // Update SRS
  updateSRSScore(card[0], isKnown);

  // Update UI statistik
  document.getElementById('stat-know').textContent = state.knownCount;
  document.getElementById('stat-unknown').textContent = state.unknownCount;

  // Lanjut ke kartu berikutnya atau selesai
  state.currentIndex++;
  if (state.currentIndex >= state.deck.length) {
    showResult();
  } else {
    renderCard();
  }
}

/** Update progress bar dan counter */
function updateProgress() {
  const percentage = Math.round(state.currentIndex / state.deck.length * 100);
  document.getElementById('progress-fill').style.width = percentage + '%';
  document.getElementById('progress-track').setAttribute('aria-valuenow', percentage);
  document.getElementById('quiz-counter').innerHTML =
    '<strong>' + (state.currentIndex + 1) + '</strong> / ' + state.deck.length;
  document.getElementById('stat-left').textContent = state.deck.length - state.currentIndex;
}
