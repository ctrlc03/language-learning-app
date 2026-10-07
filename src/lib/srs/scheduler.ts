import type { DailyActivity, Flashcard, StorageAdapter } from '@/types';
import { StorageKeys } from '@/lib/storage/interface';
import { getToday } from '@/lib/utils';
import { CARD_DIRECTIONS, directionOf } from '@/lib/flashcards/direction';
import { isDue, isNew, isLearning } from './sm2';

export interface ReviewQueue {
  learning: Flashcard[];
  due: Flashcard[];
  newCards: Flashcard[];
  total: number;
}

/**
 * Split cards into learning / due / new, admitting at most `maxNew` unseen
 * cards. New is tested first: a fresh card's due date is its creation time, so
 * testing `isDue` first filed every unseen card as an overdue review and the
 * new-card limit never applied. Unseen cards are admitted 'read' first, then
 * listen, produce and cloze, so a word is met before it is drilled.
 */
export function buildReviewQueue(cards: Flashcard[], maxNew: number): ReviewQueue {
  const learning: Flashcard[] = [];
  const due: Flashcard[] = [];
  const newCards: Flashcard[] = [];

  for (const card of cards) {
    if (isNew(card.srs)) {
      newCards.push(card);
    } else if (isLearning(card.srs)) {
      learning.push(card);
    } else if (isDue(card.srs)) {
      due.push(card);
    }
  }

  // Sort due cards by how overdue they are (most overdue first)
  due.sort((a, b) => a.srs.nextReviewDate - b.srs.nextReviewDate);

  // Stored order is arbitrary (random ids), so without this the daily limit
  // could hand out a produce or cloze card for a word never seen.
  const byDirection = (card: Flashcard) => CARD_DIRECTIONS.indexOf(directionOf(card));
  newCards.sort((a, b) => byDirection(a) - byDirection(b));

  const limitedNew = newCards.slice(0, Math.max(0, maxNew));

  return {
    learning,
    due,
    newCards: limitedNew,
    total: learning.length + due.length + limitedNew.length,
  };
}

/**
 * New cards still allowed today under the daily limit. Study and Session both
 * record `newCards` in today's activity, so they draw on one shared allowance.
 */
export async function newCardsLeftToday(
  storage: StorageAdapter,
  maxPerDay: number,
): Promise<number> {
  const today = await storage.get<DailyActivity>(StorageKeys.activity(getToday()));
  return Math.max(0, maxPerDay - (today?.newCards ?? 0));
}

export function getNextCard(queue: ReviewQueue): Flashcard | null {
  // Priority: learning > due > new
  if (queue.learning.length > 0) return queue.learning[0];
  if (queue.due.length > 0) return queue.due[0];
  if (queue.newCards.length > 0) return queue.newCards[0];
  return null;
}

export function removeCardFromQueue(queue: ReviewQueue, cardId: string): ReviewQueue {
  return {
    learning: queue.learning.filter((c) => c.id !== cardId),
    due: queue.due.filter((c) => c.id !== cardId),
    newCards: queue.newCards.filter((c) => c.id !== cardId),
    total: queue.total - 1,
  };
}
