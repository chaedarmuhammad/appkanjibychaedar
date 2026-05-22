/**
 * srs.js — Spaced Repetition System
 * Mengelola data SRS: skor, level, dan pengurutan berdasarkan prioritas.
 */

/** Ambil semua data SRS dari storage */
function loadSRSData() {
  return storageGet(CONFIG.STORAGE_KEYS.SRS, {});
}

/** Simpan semua data SRS ke storage */
function saveSRSData(data) {
  storageSet(CONFIG.STORAGE_KEYS.SRS, data);
}

/**
 * Ambil skor SRS untuk satu kanji.
 * @param {number} kanjiId - ID kanji
 * @returns {object} Skor SRS { correct, incorrect, lastSeen, interval }
 */
function getSRSScore(kanjiId) {
  const allData = loadSRSData();
  return allData[kanjiId] || { correct: 0, incorrect: 0, lastSeen: 0, interval: 1 };
}

/**
 * Update skor SRS setelah menjawab.
 * @param {number} kanjiId - ID kanji
 * @param {boolean} isKnown - Apakah jawaban benar
 */
function updateSRSScore(kanjiId, isKnown) {
  const allData = loadSRSData();

  if (!allData[kanjiId]) {
    allData[kanjiId] = { correct: 0, incorrect: 0, lastSeen: 0, interval: 1 };
  }

  allData[kanjiId].lastSeen = Date.now();

  if (isKnown) {
    allData[kanjiId].correct++;
    allData[kanjiId].interval = Math.min(
      allData[kanjiId].interval * 2,
      CONFIG.SRS.MAX_INTERVAL
    );
  } else {
    allData[kanjiId].incorrect++;
    allData[kanjiId].interval = 1;
  }

  saveSRSData(allData);
}

/**
 * Tentukan level SRS: Baru | Sulit | Sedang | Mahir
 * @param {number} kanjiId - ID kanji
 * @returns {string} Level SRS
 */
function getSRSLevel(kanjiId) {
  const score = getSRSScore(kanjiId);
  const totalAttempts = score.correct + score.incorrect;

  if (totalAttempts === 0) return 'Baru';

  const ratio = score.correct / totalAttempts;
  if (ratio >= CONFIG.SRS.MASTERY_RATIO && totalAttempts >= CONFIG.SRS.MASTERY_MIN) return 'Mahir';
  if (ratio >= CONFIG.SRS.MEDIUM_RATIO) return 'Sedang';
  return 'Sulit';
}

/**
 * Urutkan kartu berdasarkan prioritas SRS.
 * Prioritas: belum dilihat > sering salah > lama tidak dilihat
 * @param {Array} cards - Array kartu kanji
 * @returns {Array} Kartu yang sudah diurutkan
 */
function sortBySRS(cards) {
  if (!state.srsEnabled) return cards;

  const allData = loadSRSData();

  return [...cards].sort((a, b) => {
    const scoreA = allData[a[0]] || { correct: 0, incorrect: 0, interval: 1, lastSeen: 0 };
    const scoreB = allData[b[0]] || { correct: 0, incorrect: 0, interval: 1, lastSeen: 0 };

    const priorityA = (scoreA.correct + scoreA.incorrect === 0)
      ? -1000
      : (scoreA.incorrect - scoreA.correct) * 10 - scoreA.interval;
    const priorityB = (scoreB.correct + scoreB.incorrect === 0)
      ? -1000
      : (scoreB.incorrect - scoreB.correct) * 10 - scoreB.interval;

    return priorityA - priorityB;
  });
}
