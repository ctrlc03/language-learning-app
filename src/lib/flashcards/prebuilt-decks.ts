/**
 * Pre-built flashcard deck definitions from lesson/Irodori data.
 * These decks are shown alongside user-created decks and can be
 * instantiated into storage on first click.
 */

import { nanoid } from 'nanoid';
import { chineseLessons } from '@/data/chinese/vocabulary';
import { irodoriVocabulary, irodoriLevels } from '@/data/japanese/irodori-vocab';
import { createInitialSRSData } from '@/lib/srs/sm2';
import { CARD_DIRECTIONS } from '@/lib/flashcards/direction';
import type { CardDirection, FlashcardDeck, Flashcard, Language } from '@/types';

interface WordSeed {
  word: string;
  reading: string;
  meaning: string;
  topic?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
}

/**
 * Expand words into one card per recall direction. Ordered direction-major
 * (all 'read', then 'listen', then 'produce') so the first session — capped at
 * a handful of new cards — isn't dominated by sibling cards of the same word.
 */
function buildDirectionCards(deckId: string, words: WordSeed[], now: number): Flashcard[] {
  const cards: Flashcard[] = [];
  for (const direction of CARD_DIRECTIONS) {
    for (const v of words) {
      // Cloze needs an example sentence to blank the word out of.
      if (direction === 'cloze' && !v.exampleSentence) continue;
      cards.push({
        id: nanoid(),
        deckId,
        front: v.word,
        back: v.meaning,
        reading: v.reading,
        direction: direction as CardDirection,
        exampleSentence: v.exampleSentence,
        exampleTranslation: v.exampleTranslation,
        tags: [v.topic || 'general'],
        srs: createInitialSRSData(),
        createdAt: now,
        updatedAt: now,
      });
    }
  }
  return cards;
}

export interface PrebuiltDeckDef {
  id: string;
  name: string;
  language: Language;
  description: string;
  cardCount: number;
  prebuilt: true;
}

export function getPrebuiltDecks(language: Language): PrebuiltDeckDef[] {
  if (language === 'chinese') {
    return chineseLessons.map((lesson) => ({
      id: `prebuilt-zh-lesson-${lesson.lesson}`,
      name: `Lesson ${lesson.lesson}: ${lesson.title}`,
      language: 'chinese' as const,
      description: `${lesson.vocabulary.length} words from ${lesson.titleChinese}`,
      cardCount: lesson.vocabulary.length,
      prebuilt: true as const,
    }));
  }

  // Japanese: group by Irodori level
  return irodoriLevels.map((level) => {
    const words = irodoriVocabulary.filter((v) => v.level === level);
    return {
      id: `prebuilt-ja-${level.toLowerCase().replace(/\s+/g, '-')}`,
      name: level,
      language: 'japanese' as const,
      description: `${words.length} words from ${level}`,
      cardCount: words.length,
      prebuilt: true as const,
    };
  });
}

/**
 * Instantiate a pre-built deck — creates actual FlashcardDeck and Flashcard objects
 * that can be stored. Limits to first 50 cards per deck to keep things manageable.
 */
export function instantiatePrebuiltDeck(
  prebuiltId: string,
): { deck: FlashcardDeck; cards: Flashcard[] } | null {
  const now = Date.now();

  // Chinese lessons
  const zhMatch = prebuiltId.match(/^prebuilt-zh-lesson-(\d+)$/);
  if (zhMatch) {
    const lessonNum = parseInt(zhMatch[1], 10);
    const lesson = chineseLessons.find((l) => l.lesson === lessonNum);
    if (!lesson) return null;

    const deckId = nanoid();
    const cards = buildDirectionCards(deckId, lesson.vocabulary.slice(0, 50), now);
    const deck: FlashcardDeck = {
      id: deckId,
      name: `Lesson ${lesson.lesson}: ${lesson.title}`,
      language: 'chinese',
      description: `${lesson.vocabulary.length} words from ${lesson.titleChinese}`,
      cardCount: cards.length,
      createdAt: now,
      updatedAt: now,
    };

    return { deck, cards };
  }

  // Japanese Irodori levels
  const jaMatch = prebuiltId.match(/^prebuilt-ja-(.+)$/);
  if (jaMatch) {
    const levelSlug = jaMatch[1];
    const level = irodoriLevels.find((l) => l.toLowerCase().replace(/\s+/g, '-') === levelSlug);
    if (!level) return null;

    const words = irodoriVocabulary.filter((v) => v.level === level);
    if (words.length === 0) return null;

    const deckId = nanoid();
    const cards = buildDirectionCards(deckId, words.slice(0, 50), now);
    const deck: FlashcardDeck = {
      id: deckId,
      name: level,
      language: 'japanese',
      description: `${words.length} words from ${level}`,
      cardCount: cards.length,
      createdAt: now,
      updatedAt: now,
    };

    return { deck, cards };
  }

  return null;
}
