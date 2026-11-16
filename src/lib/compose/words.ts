/**
 * Word by word: Chinese the learner wrote, cut into words, each with its pinyin
 * as read in the sentence and its meaning. A course word means what its card
 * says; any other word takes the keyboard dictionary's gloss for that reading.
 */

import { chineseVocabulary } from '@/data/chinese/vocabulary';
import { numberedToMarked, piecesPinyin } from '@/lib/language/pinyin';
import { tokenizeChinese } from '@/lib/language/segment';
import type { DictionaryWord, KeyboardDictionary } from '@/lib/language/pinyin-keyboard';
import type { TextToken } from '@/lib/language/segment';
import type { VocabularyItem } from '@/types';

export interface WrittenWord extends TextToken {
  /** Tone-marked pinyin as read in its sentence; '' for anything but Chinese. */
  pinyin: string;
  /** '' when neither the course nor the dictionary knows the word. */
  meaning: string;
}

const HAN = /\p{Script=Han}/u;
/** Cost of each word in a split, so fewer, longer words win. */
const WORD_COST = 25;
/** Cost of a character the dictionary doesn't have. */
const UNKNOWN_COST = 250;

const courseEntries = new Map<string, VocabularyItem[]>();
for (const v of chineseVocabulary) {
  const list = courseEntries.get(v.word);
  if (list) list.push(v);
  else courseEntries.set(v.word, [v]);
}

function squash(reading: string): string {
  return reading.normalize('NFC').replace(/[\s']/g, '').toLowerCase();
}

/** The likeliest split of a run of Chinese characters into the dictionary's words. */
function splitRun(run: string, dictionary: KeyboardDictionary): string[] {
  const chars = [...run];
  const n = chars.length;
  const best = Array.from({ length: n + 1 }, () => ({ cost: Infinity, from: 0 }));
  best[0].cost = 0;
  for (let to = 1; to <= n; to++) {
    for (let from = Math.max(0, to - dictionary.longest); from < to; from++) {
      const piece = chars.slice(from, to).join('');
      const known = dictionary.texts.get(piece)?.[0].cost;
      const pieceCost = known ?? (to - from === 1 ? UNKNOWN_COST : null);
      if (pieceCost === null) continue;
      const cost = best[from].cost + pieceCost + WORD_COST;
      if (cost < best[to].cost) best[to] = { cost, from };
    }
  }
  const words: string[] = [];
  for (let at = n; at > 0; at = best[at].from) {
    words.unshift(chars.slice(best[at].from, at).join(''));
  }
  return words;
}

/** The course's card for a word: when the course reads it more than one way (得 de/děi), the one read as `reading`. */
function courseEntry(word: string, reading: string): VocabularyItem | undefined {
  const entries = courseEntries.get(word);
  return entries?.find((v) => squash(v.reading) === reading) ?? entries?.[0];
}

/** The dictionary's word under `reading`, else under its commonest reading. */
function dictionaryEntry(
  word: string,
  reading: string,
  dictionary: KeyboardDictionary | null,
): DictionaryWord | undefined {
  const entries = dictionary?.texts.get(word);
  return entries?.find((w) => squash(numberedToMarked(w.reading)) === reading) ?? entries?.[0];
}

/**
 * `text` cut into words, each with its pinyin and meaning; anything that isn't
 * Chinese stays as written. Until the dictionary loads only course words are known.
 */
export function describeWords(text: string, dictionary: KeyboardDictionary | null): WrittenWord[] {
  const tokens: TextToken[] = dictionary
    ? (text.match(/\p{Script=Han}+|[^\p{Script=Han}]+/gu) ?? []).flatMap((run): TextToken[] =>
        HAN.test(run)
          ? splitRun(run, dictionary).map((word) => ({ text: word, han: true }))
          : [{ text: run, han: false }],
      )
    : tokenizeChinese(text);
  const readings = piecesPinyin(tokens.map((t) => t.text));

  return tokens.map((token, i) => {
    if (!token.han) return { ...token, pinyin: '', meaning: '' };
    const pinyin = readings[i];
    const here = squash(pinyin);
    const meaning =
      courseEntry(token.text, here)?.meaning ??
      dictionaryEntry(token.text, here, dictionary)?.gloss ??
      '';
    return { ...token, pinyin, meaning };
  });
}
