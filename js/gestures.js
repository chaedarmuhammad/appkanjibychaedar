/**
 * gestures.js — Touch/Swipe Handlers
 * Mengelola gesture sentuh untuk navigasi flashcard di perangkat mobile.
 */

/** Handler keyboard shortcuts saat kuis */
function handleKeyboard(event) {
  const quizScreen = document.getElementById('screen-quiz');
  if (!quizScreen.classList.contains('active')) return;
  if (event.target.tagName === 'INPUT') return;

  if (event.code === 'Space') {
    event.preventDefault();
    flipCard();
  } else if (event.key === '1' && state.isFlipped) {
    rateCard(false);
  } else if (event.key === '2' && state.isFlipped) {
    rateCard(true);
  } else if (event.code === 'ArrowLeft') {
    event.preventDefault();
    goToPrevCard();
  } else if (event.code === 'ArrowRight') {
    event.preventDefault();
    goToNextCard();
  }
}

/** Inisialisasi swipe gestures untuk mobile */
function initSwipeGestures() {
  const wrapEl = document.getElementById('card-wrap');
  let startX = 0;
  let startY = 0; // FIX: tambahkan variabel startY yang sebelumnya tidak ada
  let isDragging = false;

  wrapEl.addEventListener('touchstart', (event) => {
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY; // FIX: simpan posisi Y awal
    isDragging = true;
  }, { passive: true });

  wrapEl.addEventListener('touchmove', (event) => {
    if (!isDragging || !state.isFlipped) return;

    const deltaX = event.touches[0].clientX - startX;
    const deltaY = event.touches[0].clientY - startY; // FIX: gunakan startY bukan startX

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      const cardEl = document.getElementById('flashcard');
      const translateX = deltaX * CONFIG.SWIPE.DRAG_FACTOR;
      const rotation = deltaX * CONFIG.SWIPE.ROTATE_FACTOR;
      const opacity = Math.max(0.5, 1 - Math.abs(deltaX) / CONFIG.SWIPE.FADE_DISTANCE);

      cardEl.style.transform = `translateX(${translateX}px) rotate(${rotation}deg)`;
      cardEl.style.opacity = opacity;
    }
  }, { passive: true });

  wrapEl.addEventListener('touchend', (event) => {
    if (!isDragging) return;
    isDragging = false;

    const endX = event.changedTouches[0].clientX;
    const deltaX = endX - startX;
    const cardEl = document.getElementById('flashcard');

    // Reset transform
    cardEl.style.transform = '';
    cardEl.style.opacity = '';

    if (!state.isFlipped) {
      // Tap kecil = flip
      if (Math.abs(deltaX) < 20) flipCard();
      return;
    }

    // Swipe direction
    if (deltaX > CONFIG.SWIPE.THRESHOLD) {
      rateCard(true);  // Swipe kanan = tahu
    } else if (deltaX < -CONFIG.SWIPE.THRESHOLD) {
      rateCard(false); // Swipe kiri = belum tahu
    }
  }, { passive: true });
}
