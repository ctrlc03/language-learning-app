/**
 * Pinyin helpers for Chinese exercise content. Wraps pinyin-pro so any
 * Chinese sentence — including distractor options and base-vocab examples
 * that ship without hand-written pinyin — can be annotated for beginners.
 */

import { customPinyin, pinyin } from 'pinyin-pro';
import { chineseVocabulary } from '@/data/chinese/vocabulary';
import type { FuriSegment } from '@/types';

const HAN_RE = /\p{Script=Han}/u;
const ALL_HAN_RE = /^\p{Script=Han}+$/u;

// pinyin-pro annotates sentences, and words the lessons don't list. Its readings
// must agree with the vocab cards, so the course's own multi-character readings
// override its defaults (朋友 péng you, not péng yǒu; 肚子 dù zi, not dù zǐ), plus
// words the app shows outside the lessons that it misreads (谁 shuí, 裤子 kù zǐ).
// Single characters stay contextual (还 hái/huán, 得 de/děi). Erhua readings
// (哪儿 nǎr) can't map one syllable per character, so pinyin-pro keeps those.
// pinyin-pro is configured only here; other modules import `pinyin` from this file.
const courseReadings: Record<string, string> = { 谁: 'shéi', 裤子: 'kù zi' };
// Each course word's reading when shown on its own; null when the course reads
// it more than one way (只 zhī/zhǐ, 得 de/děi).
const standaloneReadings = new Map<string, string | null>();
for (const v of chineseVocabulary) {
  if (!ALL_HAN_RE.test(v.word)) continue;
  const syllables = v.reading.trim().toLowerCase().split(/\s+/);
  const reading = syllables.join(' ');
  const known = standaloneReadings.get(v.word);
  standaloneReadings.set(v.word, known === undefined || known === reading ? reading : null);
  const chars = [...v.word];
  if (chars.length >= 2 && syllables.length === chars.length) courseReadings[v.word] ??= reading;
}
customPinyin(courseReadings);

export { pinyin };

/**
 * Normalise pinyin for lenient comparison in the typing drill: drop tone marks,
 * spaces and punctuation, and fold ü / v / u: all to plain "u" so learners can
 * type "nv", "nu" or "nü" interchangeably. (Trades away the rare lu/lü contrast
 * for a much more forgiving input experience.)
 */
export function normalizePinyin(input: string): string {
  return input
    .normalize('NFD')
    .replace(/̈/g, '') // diaeresis: ü → u
    .replace(/[̀-ͯ]/g, '') // tone marks
    .toLowerCase()
    .replace(/u:/g, 'u')
    .replace(/v/g, 'u')
    .replace(/[^a-z]/g, '');
}

/** Whether the text contains at least one Chinese character. */
export function hasHan(text: string): boolean {
  return HAN_RE.test(text);
}

/**
 * Full pinyin line for a sentence (tone marks, space-separated), passing
 * non-Chinese runs (blanks like ___, punctuation, Latin) through unchanged.
 */
export function toPinyin(text: string): string {
  if (!hasHan(text)) return '';
  return pinyin(text, { toneType: 'symbol', nonZh: 'consecutive' });
}

/**
 * Pinyin for a word shown on its own, such as an answer option. Without a
 * sentence around it pinyin-pro takes a character's commonest reading (了 liǎo),
 * so a course word is read the way the course teaches it, unless the course
 * reads it more than one way.
 */
export function wordPinyin(word: string): string {
  return standaloneReadings.get(word) ?? toPinyin(word);
}

/** Pinyin for each piece of a sentence cut into `pieces`, read in the context of the whole sentence. */
export function piecesPinyin(pieces: string[]): string[] {
  // One entry per character, punctuation included, so pieces map onto it by length.
  const chars = pinyin(pieces.join(''), { type: 'all' });
  let at = 0;
  return pieces.map((piece) => {
    const n = [...piece].length;
    const syllables = chars.slice(at, at + n).filter((c) => c.isZh);
    at += n;
    return syllables.map((c) => c.pinyin).join(' ');
  });
}

/**
 * Per-character ruby segments for a sentence: Chinese characters carry their
 * pinyin reading (rendered above via <ruby>, same as Japanese furigana);
 * everything else renders as plain text.
 */
export function pinyinSegments(text: string): FuriSegment[] {
  if (!hasHan(text)) return [{ t: text }];

  const tokens = pinyin(text, { type: 'all', nonZh: 'consecutive' });
  const segments: FuriSegment[] = [];

  for (const token of tokens) {
    if (token.isZh && token.pinyin) {
      segments.push({ t: token.origin, r: token.pinyin });
    } else if (segments.length > 0 && !segments[segments.length - 1].r) {
      // Merge consecutive plain runs
      segments[segments.length - 1].t += token.origin;
    } else {
      segments.push({ t: token.origin });
    }
  }

  return segments;
}
