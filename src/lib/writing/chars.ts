/**
 * Build a study list of individual Chinese characters (with per-character
 * pinyin + tone) from the vocabulary pool, for stroke-order practice.
 */

import { chineseVocabulary } from '@/data/chinese/vocabulary';
import { getTones, makeRng, shuffle } from '@/lib/tones/utils';
import type { ToneNumber } from '@/lib/tones/data';

const HAN_RE = /\p{Script=Han}/u;

export interface WritingChar {
  char: string;
  pinyin: string; // single-syllable, tone-marked
  tone: ToneNumber;
  word: string; // source word this character appears in
  meaning: string; // meaning of the source word
}

/**
 * One entry per unique Han character, keeping the first word it appears in for
 * context. Per-character pinyin comes from splitting the word's reading via
 * pinyin-pro (one syllable per hanzi).
 */
export function getWritingChars(seed: number, limit = 60): WritingChar[] {
  const rng = makeRng(seed);
  const seen = new Set<string>();
  const chars: WritingChar[] = [];

  for (const v of chineseVocabulary) {
    const letters = [...v.word];
    const tones = getTones(v.word);
    if (tones.length !== letters.length) continue; // skip if alignment is off
    letters.forEach((char, i) => {
      if (!HAN_RE.test(char) || seen.has(char)) return;
      seen.add(char);
      chars.push({
        char,
        pinyin: tones[i].text,
        tone: tones[i].tone,
        word: v.word,
        meaning: v.meaning,
      });
    });
  }

  return shuffle(chars, rng).slice(0, limit);
}
