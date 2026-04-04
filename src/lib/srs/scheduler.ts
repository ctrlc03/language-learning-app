import type { Flashcard } from '@/types';
import { isDue, isNew, isLearning } from './sm2';

const MAX_NEW_CARDS_PER_SESSION = 20;

export interface ReviewQueue {
  learning: Flashcard[];
  due: Flashcard[];
  newCards: Flashcard[];
  total: number;
}

export function buildReviewQueue(
  cards: Flashcard[],
  maxNewCards: number = MAX_NEW_CARDS_PER_SESSION
): ReviewQueue {
  const learning: Flashcard[] = [];
  const due: Flashcard[] = [];
  const newCards: Flashcard[] = [];

  for (const card of cards) {
    if (isLearning(card.srs)) {
      learning.push(card);
    } else if (isDue(card.srs)) {
      due.push(card);
    } else if (isNew(card.srs)) {
      newCards.push(card);
    }
  }

  // Sort due cards by how overdue they are (most overdue first)
  due.sort((a, b) => a.srs.nextReviewDate - b.srs.nextReviewDate);

  // Limit new cards
  const limitedNew = newCards.slice(0, maxNewCards);

  return {
    learning,
    due,
    newCards: limitedNew,
    total: learning.length + due.length + limitedNew.length,
  };
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
    learning: queue.learning.filter(c => c.id !== cardId),
    due: queue.due.filter(c => c.id !== cardId),
    newCards: queue.newCards.filter(c => c.id !== cardId),
    total: queue.total - 1,
  };
}
