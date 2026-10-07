/**
 * Tap-to-gloss: what to tell the learner about one token of a line. A course
 * word gets its course entry; anything else is glossed character by character,
 * with course words that contain the character, and falls back to pinyin only.
 */

import { wordPinyin } from '@/lib/language/pinyin';
import { lookupWord } from '@/lib/language/segment';
import { getCourseVocabulary } from '@/data/chinese/vocabulary';
import type { VocabularyItem } from '@/types';

export interface CharGloss {
  char: string;
  reading: string;
  /** The character on its own, when the course teaches it as a word. */
  meaning?: string;
  /** Course words containing the character (reached by the current lesson), a few at most. */
  relatedWords: VocabularyItem[];
}

export interface WordGloss {
  word: string;
  reading: string;
  /** The pinyin the word has in this line, when it differs from the course reading. */
  readingHere?: string;
  meaning?: string;
  /** The course's entry, when the word is a course word. */
  entry?: VocabularyItem;
  /** First lesson that teaches the word. */
  lesson?: number;
  /** The word is on the HSK 1 core list, so it counts as known whatever lesson teaches it. */
  core: boolean;
  /** The first lesson that teaches the word comes after the learner's current lesson. */
  laterLesson: boolean;
  /** Not a course word: glossed per character. */
  chars: CharGloss[];
}

const MAX_RELATED = 3;

const relatedCache = new Map<number, Map<string, VocabularyItem[]>>();

/** Course words of two or more characters containing `char`, shortest first. */
function relatedWords(char: string, lesson: number): VocabularyItem[] {
  let index = relatedCache.get(lesson);
  if (!index) {
    index = new Map();
    for (const v of getCourseVocabulary(lesson)) {
      if ([...v.word].length < 2) continue;
      for (const ch of new Set(v.word)) {
        const list = index.get(ch) ?? [];
        list.push(v);
        index.set(ch, list);
      }
    }
    for (const list of index.values()) list.sort((a, b) => a.word.length - b.word.length);
    relatedCache.set(lesson, index);
  }
  return (index.get(char) ?? []).slice(0, MAX_RELATED);
}

function squash(reading: string): string {
  return reading.replace(/[\s']/g, '').toLowerCase();
}

/**
 * @param word the token text
 * @param currentLesson the learner's lesson (scopes "taught yet" and related words)
 * @param contextReading the token's pinyin read in the context of its line, if known
 */
export function glossWord(word: string, currentLesson: number, contextReading = ''): WordGloss {
  const entry = lookupWord(word);
  if (entry) {
    const reading = entry.reading || contextReading || wordPinyin(word);
    const lesson = entry.lessons?.length ? Math.min(...entry.lessons) : undefined;
    const isCore = entry.level === 'HSK 1';
    return {
      word,
      reading,
      readingHere:
        contextReading && squash(contextReading) !== squash(reading) ? contextReading : undefined,
      meaning: entry.meaning,
      entry,
      lesson,
      core: isCore,
      laterLesson: lesson !== undefined && lesson > currentLesson,
      chars: [],
    };
  }

  const chars = [...word].map((char): CharGloss => {
    const single = lookupWord(char);
    return {
      char,
      reading: single?.reading || wordPinyin(char),
      meaning: single?.meaning,
      relatedWords: relatedWords(char, currentLesson),
    };
  });
  const reading = wordPinyin(word);
  return {
    word,
    reading,
    readingHere:
      contextReading && squash(contextReading) !== squash(reading) ? contextReading : undefined,
    core: false,
    laterLesson: false,
    chars,
  };
}
