/**
 * Pinyin helpers for Chinese exercise content. Wraps pinyin-pro so any
 * Chinese sentence — including distractor options and base-vocab examples
 * that ship without hand-written pinyin — can be annotated for beginners.
 */

import { convert, customPinyin, pinyin } from 'pinyin-pro';
import { chineseVocabulary } from '@/data/chinese/vocabulary';
import type { FuriSegment } from '@/types';

const HAN_RE = /\p{Script=Han}/u;
const ALL_HAN_RE = /^\p{Script=Han}+$/u;

// pinyin-pro annotates sentences, and words the lessons don't list. Its readings
// must agree with the vocab cards, so the course's own multi-character readings
// override its defaults (朋友 péng you, not péng yǒu; 肚子 dù zi, not dù zǐ), plus
// words the app shows outside the lessons that it misreads (谁 shuí, 裤子 kù zǐ).
// Single characters stay contextual (还 hái/huán), except 得 and 只: outside a
// word of its own pinyin-pro always reads them dé and zhī, so readCharacters
// reads those from the sentence. Erhua readings (哪儿 nǎr) can't map one
// syllable per character, so pinyin-pro keeps those.
// pinyin-pro is configured only here; other modules import `pinyin` from this file.
const courseReadings: Record<string, string> = { 谁: 'shéi', 裤子: 'kù zi' };
// Each course word's reading when shown on its own; null when the course reads
// it more than one way (只 zhī/zhǐ, 得 de/děi).
const standaloneReadings = new Map<string, string | null>();
// Every part of speech the course gives each word: the context 得 is read by.
const wordKinds = new Map<string, Set<string>>();
let longestWord = 1;
for (const v of chineseVocabulary) {
  if (!ALL_HAN_RE.test(v.word)) continue;
  const syllables = v.reading.trim().toLowerCase().split(/\s+/);
  const reading = syllables.join(' ');
  const known = standaloneReadings.get(v.word);
  standaloneReadings.set(v.word, known === undefined || known === reading ? reading : null);
  const chars = [...v.word];
  if (chars.length >= 2 && syllables.length === chars.length) courseReadings[v.word] ??= reading;
  const kinds = wordKinds.get(v.word) ?? new Set<string>();
  if (v.partOfSpeech) kinds.add(v.partOfSpeech);
  wordKinds.set(v.word, kinds);
  longestWord = Math.max(longestWord, chars.length);
}
customPinyin(courseReadings);

export { pinyin };

/** Whether the course teaches the word more than one way (只 zhī/zhǐ, 得 de/děi). */
export function hasSeveralReadings(word: string): boolean {
  return standaloneReadings.get(word) === null;
}

/** A character's reading; with non-Chinese runs kept together, such a run. */
export interface CharReading {
  origin: string;
  /** Tone-marked pinyin; empty for anything but a Chinese character. */
  pinyin: string;
  /** The tone, 1–4, or 0 for the neutral tone. */
  num: number;
  isZh: boolean;
}

const VERBAL = ['verb', 'adjective'];
const FUNCTION_WORDS = [
  'pronoun',
  'adverb',
  'conjunction',
  'modal verb',
  'preposition',
  'particle',
];
// What opens a degree complement after 得: 跑得很快, 说得不好, 唱得怎么样.
const DEGREE = [
  '很',
  '太',
  '真',
  '挺',
  '不',
  '更',
  '最',
  '非常',
  '特别',
  '比较',
  '这么',
  '那么',
  '怎么样',
];
// What the measure word 只 follows: 一只猫, 两只, 那只狗, 3只.
const COUNTED = /[一二两三四五六七八九十百千万几这那哪每半多0-9０-９]$/u;
const CONTEXT_TONES: Record<string, number> = { de: 0, dé: 2, děi: 3, zhǐ: 3 };

/** The longest course word `chars` ends with (`atEnd`) or starts with; '' when none. */
function courseWordAt(chars: string[], atEnd: boolean): string {
  for (let n = Math.min(longestWord, chars.length); n > 0; n--) {
    const word = (atEnd ? chars.slice(chars.length - n) : chars.slice(0, n)).join('');
    if (wordKinds.has(word)) return word;
  }
  return '';
}

/**
 * 得 on its own, which pinyin-pro always reads dé. After a verb or adjective it
 * links a complement, de (跑得很快); "get" before 到 or 了 stays dé (得到, 得了);
 * otherwise it is děi, "have to", before a verb (我得走了). `before` and `after`
 * are the characters of its clause on each side; a blank just before it
 * (___得很快) stands for a word that isn't known yet.
 */
function readDe(before: string[], after: string[], blankBefore: boolean): string {
  const prev = wordKinds.get(courseWordAt(before, true));
  if (prev && VERBAL.some((k) => prev.has(k))) return 'de';
  if (after[0] === '到' || after[0] === '了') return 'dé';
  if (before.length === 0 && !blankBefore) return 'děi';
  if (prev && FUNCTION_WORDS.some((k) => prev.has(k))) return 'děi';
  // After a noun, a character the course has no word for, or a blank, what follows decides.
  const rest = after.join('');
  if (DEGREE.some((d) => rest.startsWith(d))) return 'de';
  const next = wordKinds.get(courseWordAt(after, false));
  if (next?.has('verb')) return 'děi';
  if (next?.has('adjective')) return 'de';
  return prev ? 'děi' : 'de';
}

/**
 * pinyin-pro's reading of each character of `text`, with 得 and 只 read from the
 * sentence: outside a word of its own pinyin-pro reads them dé and zhī (我得走了,
 * 他跑得很快, 我只想睡觉). `nonZh: 'consecutive'` keeps other text in runs.
 */
export function readCharacters(
  text: string,
  nonZh: 'spaced' | 'consecutive' = 'spaced',
): CharReading[] {
  const chars: CharReading[] = pinyin(text, { type: 'all', nonZh });
  return chars.map((c, i) => {
    let reading = c.pinyin;
    if (c.origin === '得' && reading === 'dé') {
      let start = i;
      while (start > 0 && chars[start - 1].isZh) start--;
      let end = i + 1;
      while (end < chars.length && chars[end].isZh) end++;
      reading = readDe(
        chars.slice(start, i).map((x) => x.origin),
        chars.slice(i + 1, end).map((x) => x.origin),
        start > 0 && /[_＿]/.test(chars[start - 1].origin),
      );
    } else if (c.origin === '只' && reading === 'zhī') {
      // The measure word after a number or 这/那; otherwise "only".
      if (!COUNTED.test((chars[i - 1]?.origin ?? '').trimEnd())) reading = 'zhǐ';
    }
    return reading === c.pinyin ? c : { ...c, pinyin: reading, num: CONTEXT_TONES[reading] };
  });
}

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
  return readCharacters(text, 'consecutive')
    .map((c) => (c.isZh ? c.pinyin : c.origin))
    .join(' ');
}

/**
 * Numbered pinyin to tone marks: "ni3 hao3" → "nǐ hǎo", "Bei3 jing1" → "Běi jīng".
 * 5 (or no digit) is the neutral tone, v is ü, and an erhua r joins the syllable
 * before it ("zhe4 r5" → "zhèr").
 */
export function numberedToMarked(numbered: string): string {
  const out: string[] = [];
  for (const syllable of numbered.trim().split(/\s+/)) {
    const match = syllable.match(/^([a-zü]+?)([0-5]?)$/i);
    const letters = match ? match[1] : syllable;
    const tone = match ? match[2] : '';
    if (letters.toLowerCase() === 'r' && out.length > 0) out[out.length - 1] += letters;
    else if (tone >= '1' && tone <= '4') out.push(convert(letters + tone));
    else out.push(letters.replace(/v/g, 'ü').replace(/V/g, 'Ü'));
  }
  return out.join(' ');
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
  const chars = readCharacters(pieces.join(''));
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

  const tokens = readCharacters(text, 'consecutive');
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
