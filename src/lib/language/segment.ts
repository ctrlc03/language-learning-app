/**
 * Chinese word segmentation against the course vocabulary: greedy longest
 * match over the known multi-character words, with unknown characters as
 * single-character segments. Sentence tiles cut along these words, and the
 * reader uses them for tap-to-gloss.
 */

import { chineseVocabulary } from '@/data/chinese/vocabulary';
import { normalizeOrder } from '@/lib/exercises/tiles';
import type { VocabularyItem } from '@/types';

const HAN = /\p{Script=Han}/u;

const wordsByText = new Map<string, VocabularyItem>();
for (const v of chineseVocabulary) {
  if (!wordsByText.has(v.word)) wordsByText.set(v.word, v);
}

const multiCharWords = new Set([...wordsByText.keys()].filter((w) => w.length >= 2));
const maxWordLength = Math.max(2, ...[...multiCharWords].map((w) => w.length));

/**
 * Cut punctuation-free Chinese text into known words, longest match first.
 * Characters that start no known word become single-character segments.
 */
export function segmentChinese(clean: string): string[] {
  const segments: string[] = [];
  let i = 0;
  while (i < clean.length) {
    let matched = '';
    for (let len = Math.min(maxWordLength, clean.length - i); len >= 2; len--) {
      const candidate = clean.slice(i, i + len);
      if (multiCharWords.has(candidate)) {
        matched = candidate;
        break;
      }
    }
    const piece = matched || clean[i];
    segments.push(piece);
    i += piece.length;
  }
  return segments;
}

/** Word tiles for a sentence with no pinyin to cut along: its words, stray single characters merged. */
export function splitChineseSentence(sentence: string): string[] {
  const segments = segmentChinese(normalizeOrder(sentence));

  // Merge stray single characters into the previous segment so tiles stay
  // meaningful, but keep the total count manageable.
  if (segments.length > 7) {
    const merged: string[] = [];
    for (const seg of segments) {
      const prev = merged[merged.length - 1];
      if (seg.length === 1 && prev && prev.length === 1) {
        merged[merged.length - 1] = prev + seg;
      } else {
        merged.push(seg);
      }
    }
    return merged;
  }

  return segments;
}

export interface TextToken {
  text: string;
  /** Chinese characters (a word or a single unknown character), as opposed to punctuation, digits or Latin. */
  han: boolean;
}

/**
 * Cut running text into tokens: each run of Chinese characters is segmented
 * into words; everything between (punctuation, spaces, digits, Latin) is kept
 * as-is so the tokens join back into the original text.
 */
export function tokenizeChinese(text: string): TextToken[] {
  const tokens: TextToken[] = [];
  for (const run of text.match(/\p{Script=Han}+|[^\p{Script=Han}]+/gu) ?? []) {
    if (HAN.test(run)) {
      for (const word of segmentChinese(run)) tokens.push({ text: word, han: true });
    } else {
      tokens.push({ text: run, han: false });
    }
  }
  return tokens;
}

/** The course's entry for a word, if it teaches one. */
export function lookupWord(word: string): VocabularyItem | undefined {
  return wordsByText.get(word);
}
