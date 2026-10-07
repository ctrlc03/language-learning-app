/**
 * Shipped flashcard decks, built from the lesson and Irodori data: one deck per
 * Chinese lesson and one per Irodori level. They are listed beside the
 * learner's own decks, copied into storage on first click, and kept in step
 * with the data afterwards (`syncPrebuiltDecks`).
 */

import { nanoid } from 'nanoid';
import { chineseLessons } from '@/data/chinese/vocabulary';
import { irodoriVocabulary, irodoriLevels } from '@/data/japanese/irodori-vocab';
import { createInitialSRSData } from '@/lib/srs/sm2';
import { CARD_DIRECTIONS, canCloze, directionOf } from '@/lib/flashcards/direction';
import { StorageKeys, StoragePrefixes } from '@/lib/storage/interface';
import type { CardDirection, Flashcard, FlashcardDeck, Language, StorageAdapter } from '@/types';

interface WordSeed {
  word: string;
  reading: string;
  meaning: string;
  topic?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
}

export interface PrebuiltDeckDef {
  id: string;
  name: string;
  language: Language;
  description: string;
  /** Cards the deck holds (up to four per word), not words. */
  cardCount: number;
  prebuilt: true;
}

interface ShippedDeck {
  def: PrebuiltDeckDef;
  words: WordSeed[];
}

/** Every direction a word is drilled in, except cloze where its example can't carry one. */
function wantsCard(word: WordSeed, direction: CardDirection): boolean {
  return direction !== 'cloze' || canCloze(word.word, word.exampleSentence);
}

function buildShipped(language: Language): ShippedDeck[] {
  const sources: { id: string; name: string; description: string; words: WordSeed[] }[] =
    language === 'chinese'
      ? chineseLessons.map((lesson) => ({
          id: `prebuilt-zh-lesson-${lesson.lesson}`,
          name: `Lesson ${lesson.lesson}: ${lesson.title}`,
          description: `${lesson.vocabulary.length} words from ${lesson.titleChinese}`,
          words: lesson.vocabulary,
        }))
      : irodoriLevels.map((level) => {
          const words = irodoriVocabulary.filter((v) => v.level === level);
          return {
            id: `prebuilt-ja-${level.toLowerCase().replace(/\s+/g, '-')}`,
            name: level,
            description: `${words.length} words from ${level}`,
            words,
          };
        });

  return sources
    .filter(({ words }) => words.length > 0)
    .map(({ words, ...rest }) => ({
      def: {
        ...rest,
        language,
        cardCount: words.reduce(
          (n, w) => n + CARD_DIRECTIONS.filter((d) => wantsCard(w, d)).length,
          0,
        ),
        prebuilt: true as const,
      },
      words,
    }));
}

// The shipped data never changes at runtime, so each language is built once.
const shippedCache: Partial<Record<Language, ShippedDeck[]>> = {};

function shippedDecks(language: Language): ShippedDeck[] {
  return (shippedCache[language] ??= buildShipped(language));
}

export function getPrebuiltDecks(language: Language): PrebuiltDeckDef[] {
  return shippedDecks(language).map((s) => s.def);
}

/**
 * The shipped deck a stored deck is a copy of: by `prebuiltId`, or for decks
 * stored before that field existed, by name.
 */
function shippedFor(deck: FlashcardDeck): ShippedDeck | undefined {
  return shippedDecks(deck.language).find((s) =>
    deck.prebuiltId ? s.def.id === deck.prebuiltId : s.def.name === deck.name,
  );
}

/** Id of the shipped deck a stored deck was copied from, if it is one. */
export function shippedDeckId(deck: FlashcardDeck): string | undefined {
  return shippedFor(deck)?.def.id;
}

/** What a card takes from its word — the same in every direction. */
type CardContent = Pick<
  Flashcard,
  'back' | 'reading' | 'exampleSentence' | 'exampleTranslation' | 'tags'
>;

function cardContent(word: WordSeed): CardContent {
  return {
    back: word.meaning,
    reading: word.reading,
    exampleSentence: word.exampleSentence,
    exampleTranslation: word.exampleTranslation,
    tags: [word.topic || 'general'],
  };
}

/**
 * One card per word per recall direction, ordered direction-major (all 'read'
 * cards, then 'listen', 'produce', 'cloze'). `skip` leaves out cards that
 * already exist.
 */
function buildCards(
  deckId: string,
  words: WordSeed[],
  now: number,
  skip?: (word: WordSeed, direction: CardDirection) => boolean,
): Flashcard[] {
  const cards: Flashcard[] = [];
  for (const direction of CARD_DIRECTIONS) {
    for (const word of words) {
      if (!wantsCard(word, direction) || skip?.(word, direction)) continue;
      cards.push({
        id: nanoid(),
        deckId,
        front: word.word,
        direction,
        ...cardContent(word),
        srs: createInitialSRSData(),
        createdAt: now,
        updatedAt: now,
      });
    }
  }
  return cards;
}

/**
 * Instantiate a pre-built deck — creates the FlashcardDeck and a Flashcard for
 * every word and direction, ready to store. The daily new-card limit, not the
 * deck size, paces how fast a learner meets them.
 */
export function instantiatePrebuiltDeck(
  prebuiltId: string,
): { deck: FlashcardDeck; cards: Flashcard[] } | null {
  const shipped = [...shippedDecks('chinese'), ...shippedDecks('japanese')].find(
    (s) => s.def.id === prebuiltId,
  );
  if (!shipped) return null;

  const { def, words } = shipped;
  const now = Date.now();
  const deckId = nanoid();
  const cards = buildCards(deckId, words, now);
  const deck: FlashcardDeck = {
    id: deckId,
    name: def.name,
    language: def.language,
    description: def.description,
    cardCount: cards.length,
    prebuiltId: def.id,
    createdAt: now,
    updatedAt: now,
  };

  return { deck, cards };
}

// ---------------------------------------------------------------------------
// Keeping stored copies in step with the shipped data
// ---------------------------------------------------------------------------

export interface DeckSyncPlan {
  /** Decks whose record changed: prebuiltId, name, description, cardCount. */
  decks: FlashcardDeck[];
  /** Cards to add, and existing cards whose content changed. */
  cards: Flashcard[];
  /** Ids of degenerate cloze cards to delete. */
  removed: string[];
}

function isCurrent(card: Flashcard, content: CardContent): boolean {
  return (
    card.back === content.back &&
    card.reading === content.reading &&
    card.exampleSentence === content.exampleSentence &&
    card.exampleTranslation === content.exampleTranslation &&
    card.tags.length === content.tags.length &&
    card.tags.every((tag, i) => tag === content.tags[i])
  );
}

/**
 * Work out what it takes to bring stored copies of shipped decks in step with
 * the current data, without touching any card's `srs`:
 *  - add cards for (word, direction) pairs the deck lacks (words an older
 *    build left out, rows added since);
 *  - refresh the content of cards that exist (readings, meanings, examples,
 *    tags), matched by (front, direction) — unique within a deck;
 *  - delete cloze cards that can't work (see `canCloze`);
 *  - record `prebuiltId` and a `cardCount` that matches the cards held.
 * Every other deck just gets its `cardCount` recounted. Pure and idempotent: a
 * deck already in step produces an empty plan.
 */
export function planPrebuiltSync(
  decks: FlashcardDeck[],
  cards: Flashcard[],
  now: number,
): DeckSyncPlan {
  const cardsByDeck = new Map<string, Flashcard[]>();
  for (const card of cards) {
    const held = cardsByDeck.get(card.deckId);
    if (held) held.push(card);
    else cardsByDeck.set(card.deckId, [card]);
  }

  const plan: DeckSyncPlan = { decks: [], cards: [], removed: [] };
  for (const deck of decks) {
    const held = cardsByDeck.get(deck.id) ?? [];
    const shipped = shippedFor(deck);
    let cardCount = held.length;

    if (shipped) {
      const words = new Map(shipped.words.map((w) => [w.word, w]));
      const have = new Set<string>();
      for (const card of held) {
        const direction = directionOf(card);
        const word = words.get(card.front);
        // Current data decides for a word it still teaches; a card whose word
        // has left the data is judged on its own example.
        if (direction === 'cloze' && !canCloze(card.front, (word ?? card).exampleSentence)) {
          plan.removed.push(card.id);
          cardCount--;
          continue;
        }
        have.add(`${direction}|${card.front}`);
        if (word) {
          const content = cardContent(word);
          if (!isCurrent(card, content)) plan.cards.push({ ...card, ...content, updatedAt: now });
        }
      }

      const added = buildCards(deck.id, shipped.words, now, (word, direction) =>
        have.has(`${direction}|${word.word}`),
      );
      for (const card of added) plan.cards.push(card);
      cardCount += added.length;
    }

    const next: FlashcardDeck = shipped
      ? {
          ...deck,
          name: shipped.def.name,
          description: shipped.def.description,
          prebuiltId: shipped.def.id,
          cardCount,
        }
      : { ...deck, cardCount };
    if (
      next.name !== deck.name ||
      next.description !== deck.description ||
      next.prebuiltId !== deck.prebuiltId ||
      next.cardCount !== deck.cardCount
    ) {
      plan.decks.push({ ...next, updatedAt: now });
    }
  }

  return plan;
}

/**
 * Store a new deck with all its cards in one write. `cardCount` is taken from
 * the cards, so it can't drift from what is stored.
 */
export async function saveDeck(
  storage: StorageAdapter,
  deck: FlashcardDeck,
  cards: Flashcard[],
): Promise<FlashcardDeck> {
  const stored = { ...deck, cardCount: cards.length };
  const records: Record<string, unknown> = { [StorageKeys.deck(stored.id)]: stored };
  for (const card of cards) records[StorageKeys.card(card.id)] = card;
  await storage.setMany(records);
  return stored;
}

async function syncOnce(storage: StorageAdapter): Promise<boolean> {
  const [decks, cards] = await Promise.all([
    storage.getAll<FlashcardDeck>(StoragePrefixes.decks),
    storage.getAll<Flashcard>(StoragePrefixes.cards),
  ]);
  const plan = planPrebuiltSync(decks, cards, Date.now());
  if (plan.decks.length + plan.cards.length + plan.removed.length === 0) return false;

  const records: Record<string, unknown> = {};
  for (const card of plan.cards) records[StorageKeys.card(card.id)] = card;
  for (const deck of plan.decks) records[StorageKeys.deck(deck.id)] = deck;
  await storage.setMany(records);
  await Promise.all(plan.removed.map((id) => storage.delete(StorageKeys.card(id))));
  return true;
}

// Syncs queue behind one another: two overlapping runs (React strict mode, a
// quick return to the page) would both see the same cards missing and add
// them twice.
let lastSync: Promise<unknown> = Promise.resolve();

/**
 * Bring every stored shipped deck in step with the current data (see
 * `planPrebuiltSync`). Reads all decks and cards, writes only what changed, and
 * resolves true if it wrote anything.
 */
export function syncPrebuiltDecks(storage: StorageAdapter): Promise<boolean> {
  const run = lastSync.then(() => syncOnce(storage));
  lastSync = run.catch(() => undefined);
  return run;
}
