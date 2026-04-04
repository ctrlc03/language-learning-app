import type { SRSData, SRSGrade } from '@/types';

const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;

export function createInitialSRSData(): SRSData {
  return {
    easeFactor: DEFAULT_EASE_FACTOR,
    interval: 0,
    repetitions: 0,
    nextReviewDate: Date.now(),
  };
}

export function calculateNextReview(srs: SRSData, grade: SRSGrade): SRSData {
  const now = Date.now();
  let { easeFactor, interval, repetitions } = srs;

  if (grade < 3) {
    // Failed: reset
    repetitions = 0;
    interval = 1;
  } else {
    // Passed
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor);

  const nextReviewDate = now + interval * 24 * 60 * 60 * 1000;

  return {
    easeFactor,
    interval,
    repetitions,
    nextReviewDate,
    lastReviewDate: now,
    grade,
  };
}

export function isDue(srs: SRSData): boolean {
  return Date.now() >= srs.nextReviewDate;
}

export function isNew(srs: SRSData): boolean {
  return srs.repetitions === 0 && !srs.lastReviewDate;
}

export function isLearning(srs: SRSData): boolean {
  return srs.repetitions > 0 && srs.interval <= 1;
}
