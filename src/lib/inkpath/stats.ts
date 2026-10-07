// 墨 INKPATH — figures for Today and Journal, computed from the decks, cards, conversations and mastery maps in storage.
import type { Conversation, Flashcard, FlashcardDeck, Language, StorageAdapter } from '@/types';
import { StoragePrefixes } from '@/lib/storage/interface';
import { shippedDeckId } from '@/lib/flashcards/prebuilt-decks';
import type { MasteryMap } from '@/lib/mastery';
import { isLearning, isNew } from '@/lib/srs/sm2';
import type { InkLesson } from './content';

export interface DeckData {
  decks: FlashcardDeck[];
  cards: Flashcard[];
}

/** A measured share (0–1) and what it was measured over, e.g. `{ value: 0.4, n: 120, unit: 'cards' }`. */
export interface Metric {
  value: number;
  n: number;
  unit: string;
}

/** Every deck and card in storage. */
export async function loadDeckData(storage: StorageAdapter): Promise<DeckData> {
  const [decks, cards] = await Promise.all([
    storage.getAll<FlashcardDeck>(StoragePrefixes.decks),
    storage.getAll<Flashcard>(StoragePrefixes.cards),
  ]);
  return { decks, cards };
}

/** One language's decks and their cards (cards whose deck is gone are left out). */
export function forLanguage({ decks, cards }: DeckData, language: Language): DeckData {
  const own = decks.filter((d) => d.language === language);
  const ids = new Set(own.map((d) => d.id));
  return { decks: own, cards: cards.filter((c) => ids.has(c.deckId)) };
}

/** Distinct words behind the cards: each word has up to four (read, listen, produce, cloze). */
export function countWords(cards: Flashcard[]): number {
  return new Set(cards.map((c) => `${c.front}|${c.reading}`)).size;
}

/** Decks with at least one card that has been reviewed. */
export function countStudiedDecks({ decks, cards }: DeckData): number {
  const studied = new Set(cards.filter((c) => !isNew(c.srs)).map((c) => c.deckId));
  return decks.filter((d) => studied.has(d.id)).length;
}

/**
 * Share of a lesson's words that have at least one reviewed card (not New) in the lesson's deck;
 * 0 when the lesson has no deck yet.
 */
export function lessonProgress(lesson: InkLesson, { decks, cards }: DeckData): number {
  const deckIds = new Set(
    decks.filter((d) => shippedDeckId(d) === lesson.prebuiltId).map((d) => d.id),
  );
  if (deckIds.size === 0 || lesson.words.length === 0) return 0;
  const reviewed = new Set<string>();
  for (const card of cards) {
    if (deckIds.has(card.deckId) && !isNew(card.srs)) reviewed.add(card.front);
  }
  return lesson.words.filter((word) => reviewed.has(word)).length / lesson.words.length;
}

/** Share of cards that have graduated to the Review state: neither New nor still being learned. */
export function reviewShare(cards: Flashcard[]): Metric | null {
  if (cards.length === 0) return null;
  const graduated = cards.filter((c) => !isNew(c.srs) && !isLearning(c.srs)).length;
  return { value: graduated / cards.length, n: cards.length, unit: 'cards' };
}

/** Correct answers over answers given, across every item in a drill's mastery map. */
export function masteryAccuracy(map: MasteryMap): Metric | null {
  let seen = 0;
  let correct = 0;
  for (const entry of Object.values(map)) {
    seen += entry.seen;
    correct += entry.correct;
  }
  return seen === 0 ? null : { value: correct / seen, n: seen, unit: 'answers' };
}

/** Conversations the learner took part in: at least one message of their own. */
export function countConversations(conversations: Conversation[]): number {
  return conversations.filter((c) => c.messages.some((m) => m.role === 'user')).length;
}
