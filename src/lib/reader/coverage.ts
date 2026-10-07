/**
 * Known-word coverage: how much of a Chinese text is made of words the course
 * has taught by a given lesson. Shared by the reading library (offline) and the
 * story route (which rejects stories that stray from the allowed vocabulary).
 */

import { getCourseVocabulary } from '@/data/chinese/vocabulary';
import { tokenizeChinese, type TextToken } from '@/lib/language/segment';

/** Numerals are always allowed: any run of these is a number, not a new word. */
const NUMERAL_CHARS = new Set([...'零〇一二三四五六七八九十百千万两']);

const knownSets = new Map<number, ReadonlySet<string>>();

/** Words the course has reached by `lesson` (including the HSK 1 core list). */
export function knownWordSet(lesson: number): ReadonlySet<string> {
  let set = knownSets.get(lesson);
  if (!set) {
    set = new Set(getCourseVocabulary(lesson).map((v) => v.word));
    knownSets.set(lesson, set);
  }
  return set;
}

/** A Han token is known when the course has reached it, or when it is only numerals. */
export function isKnownToken(token: string, known: ReadonlySet<string>): boolean {
  return known.has(token) || [...token].every((ch) => NUMERAL_CHARS.has(ch));
}

export interface Coverage {
  /** Han tokens the course has reached. */
  known: number;
  /** All Han tokens. */
  total: number;
  /** Whole percent, rounded down so 100 only ever means every token is known. */
  percent: number;
}

export function coverageOf(lines: readonly string[], lesson: number): Coverage {
  const known = knownWordSet(lesson);
  let knownCount = 0;
  let total = 0;
  for (const line of lines) {
    for (const token of tokenizeChinese(line)) {
      if (!token.han) continue;
      total++;
      if (isKnownToken(token.text, known)) knownCount++;
    }
  }
  return {
    known: knownCount,
    total,
    percent: total === 0 ? 100 : Math.floor((knownCount / total) * 100),
  };
}

export interface UnknownReport {
  /** Han tokens across every line. */
  total: number;
  /** Han tokens the course has not reached by the lesson. */
  unknown: number;
  /** The unknown words, adjacent unknown tokens joined back into one word; no duplicates. */
  words: string[];
}

export function findUnknown(lines: readonly string[], lesson: number): UnknownReport {
  const known = knownWordSet(lesson);
  const words = new Set<string>();
  let total = 0;
  let unknown = 0;
  for (const line of lines) {
    let run = '';
    const flush = () => {
      if (run) words.add(run);
      run = '';
    };
    for (const token of tokenizeChinese(line)) {
      if (!token.han) {
        flush();
        continue;
      }
      total++;
      if (isKnownToken(token.text, known)) {
        flush();
      } else {
        unknown++;
        run += token.text;
      }
    }
    flush();
  }
  return { total, unknown, words: [...words] };
}

/** Tokens of a line, each flagged when it is a Han token the course has not reached. */
export interface MarkedToken extends TextToken {
  unknown: boolean;
}

export function markTokens(text: string, lesson: number): MarkedToken[] {
  const known = knownWordSet(lesson);
  return tokenizeChinese(text).map((t) => ({
    ...t,
    unknown: t.han && !isKnownToken(t.text, known),
  }));
}
