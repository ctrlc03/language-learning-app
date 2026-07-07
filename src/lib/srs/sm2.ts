/**
 * Spaced-repetition scheduling — backed by FSRS (ts-fsrs), replacing the old
 * SM-2 algorithm. FSRS reaches the same retention with markedly fewer reviews.
 *
 * The public API (createInitialSRSData / calculateNextReview / isDue / isNew /
 * isLearning) is unchanged so callers and the scheduler need no edits. SRSData
 * carries the FSRS memory state; legacy SM-2 cards (no `stability`) are migrated
 * on their next review while preserving their existing due date.
 */

import {
  fsrs,
  generatorParameters,
  createEmptyCard,
  Rating,
  State,
  type Card,
  type Grade,
} from 'ts-fsrs';
import type { SRSData, SRSGrade } from '@/types';

const DEFAULT_EASE_FACTOR = 2.5;

// Fuzz spreads intervals slightly so cards learned together don't clump on the
// same future day.
const scheduler = fsrs(generatorParameters({ enable_fuzz: true }));

export function createInitialSRSData(): SRSData {
  return {
    easeFactor: DEFAULT_EASE_FACTOR,
    interval: 0,
    repetitions: 0,
    nextReviewDate: Date.now(),
    state: State.New,
  };
}

// Map the app's 1–5 grade onto FSRS's 4-point rating scale.
function toRating(grade: SRSGrade): Grade {
  switch (grade) {
    case 1:
    case 2:
      return Rating.Again;
    case 3:
      return Rating.Hard;
    case 4:
      return Rating.Good;
    default:
      return Rating.Easy;
  }
}

// Approximate an FSRS difficulty (1–10) from a legacy SM-2 ease factor so
// migrated cards keep a sensible starting difficulty. Higher ease → easier.
function difficultyFromEase(ease: number): number {
  return Math.min(10, Math.max(1, 11.5 - ease * 2.6));
}

/** Build an FSRS Card from stored SRS state, migrating legacy SM-2 data. */
function toFsrsCard(srs: SRSData): Card {
  // Fresh card, or a legacy card that has never been reviewed → empty card.
  if (srs.state === undefined && srs.repetitions === 0 && !srs.lastReviewDate) {
    return createEmptyCard(new Date(srs.nextReviewDate || Date.now()));
  }

  // Already FSRS-scheduled → reconstruct directly.
  if (srs.stability !== undefined && srs.difficulty !== undefined && srs.state !== undefined) {
    return {
      due: new Date(srs.nextReviewDate),
      stability: srs.stability,
      difficulty: srs.difficulty,
      elapsed_days: srs.elapsedDays ?? 0,
      scheduled_days: srs.scheduledDays ?? srs.interval,
      reps: srs.repetitions,
      lapses: srs.lapses ?? 0,
      learning_steps: srs.learningSteps ?? 0,
      state: srs.state as State,
      last_review: srs.lastReviewDate ? new Date(srs.lastReviewDate) : undefined,
    };
  }

  // Legacy SM-2 card with review history → approximate an FSRS card that keeps
  // its current due date and rough memory strength.
  return {
    due: new Date(srs.nextReviewDate),
    stability: Math.max(srs.interval, 0.5),
    difficulty: difficultyFromEase(srs.easeFactor),
    elapsed_days: 0,
    scheduled_days: srs.interval,
    reps: srs.repetitions,
    lapses: 0,
    learning_steps: 0,
    state: srs.repetitions > 0 ? State.Review : State.New,
    last_review: srs.lastReviewDate ? new Date(srs.lastReviewDate) : undefined,
  };
}

/** Flatten an FSRS Card back into stored SRS state. */
function fromFsrsCard(card: Card, grade: SRSGrade): SRSData {
  return {
    easeFactor: DEFAULT_EASE_FACTOR,
    interval: card.scheduled_days,
    repetitions: card.reps,
    nextReviewDate: card.due.getTime(),
    lastReviewDate: card.last_review?.getTime() ?? Date.now(),
    grade,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    learningSteps: card.learning_steps,
    lapses: card.lapses,
    state: card.state,
  };
}

export function calculateNextReview(srs: SRSData, grade: SRSGrade): SRSData {
  const card = toFsrsCard(srs);
  const { card: next } = scheduler.next(card, new Date(), toRating(grade));
  return fromFsrsCard(next, grade);
}

export function isDue(srs: SRSData): boolean {
  return Date.now() >= srs.nextReviewDate;
}

export function isNew(srs: SRSData): boolean {
  if (srs.state !== undefined) return srs.state === State.New;
  return srs.repetitions === 0 && !srs.lastReviewDate;
}

export function isLearning(srs: SRSData): boolean {
  if (srs.state !== undefined) {
    return srs.state === State.Learning || srs.state === State.Relearning;
  }
  return srs.repetitions > 0 && srs.interval <= 1;
}
