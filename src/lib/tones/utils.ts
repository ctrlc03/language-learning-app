/**
 * Tone helpers: read the tones of a Chinese word, colour syllables by tone, and build
 * tone-identification / tone-pair drills from the vocabulary pool so every prompt is a real
 * hanzi the TTS engine can pronounce.
 *
 * Tones come from the lesson reading in the vocabulary (one syllable per character) and only fall
 * back to pinyin-pro for words the lessons don't cover or write in a joined form (地名 style
 * "Běijīng", "shūfu"): pinyin-pro alone reads 了 as liǎo where the course teaches le.
 */

import { pinyin } from '@/lib/language/pinyin';
import { chineseVocabulary } from '@/data/chinese/vocabulary';
import { TONES, type ToneNumber } from './data';

const HAN_RE = /\p{Script=Han}/u;
const ALL_HAN_RE = /^\p{Script=Han}+$/u;

const TONE_MARKS: Record<string, ToneNumber> = {
  '\u0304': 1, // macron
  '\u0301': 2, // acute
  '\u030c': 3, // caron
  '\u0300': 4, // grave
};

/** Tone number (1–4, or 5 for neutral) for a single toned pinyin syllable ("hǎo", "ma"). */
function toneFromMarked(syllable: string): ToneNumber {
  for (const ch of syllable.normalize('NFD')) {
    const tone = TONE_MARKS[ch];
    if (tone) return tone;
  }
  return 5;
}

export interface ToneSyllable {
  text: string; // syllable with tone marks, e.g. "hǎo"
  tone: ToneNumber; // as written in the reading: sandhi already applied for lesson 一/不 ("yì qǐ")
}

/** A syllable of a word, with the character it reads and its tone before any sandhi. */
interface Syllable extends ToneSyllable {
  char: string | undefined;
  citation: ToneNumber;
}

/** 一 is yī and 不 is bù before sandhi, however the reading writes them ("yì qǐ", "bú kè qi"). */
const CITATION_TONE: Record<string, ToneNumber> = { 一: 1, 不: 4 };

function toSyllable(text: string, char: string | undefined): Syllable {
  const tone = toneFromMarked(text);
  return { text, tone, char, citation: (char && CITATION_TONE[char]) || tone };
}

/**
 * Syllables of a lesson reading, or null when it can't be aligned with the hanzi: the syllable
 * count must equal the character count (erhua "zhèr", joined "Běijīng" and "shūfu" don't).
 */
function lessonSyllables(word: string, reading: string): Syllable[] | null {
  if (!ALL_HAN_RE.test(word)) return null;
  const chars = [...word];
  const tokens = reading.split(/[\s'’-]+/).filter(Boolean);
  const isSyllable = (s: string) =>
    /^[a-z]+$/i.test(s.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
  if (tokens.length !== chars.length || !tokens.every(isSyllable)) return null;
  return tokens.map((text, i) => toSyllable(text, chars[i]));
}

/** pinyin-pro's reading, with its own 一/不 sandhi ("yí dìng") as the written form. */
function pinyinProSyllables(word: string): Syllable[] {
  const chars = [...word];
  const marked = pinyin(word, { type: 'array' }) as string[];
  const aligned = marked.length === chars.length;
  return marked.map((text, i) => toSyllable(text, aligned ? chars[i] : undefined));
}

/** Every distinct reading the lessons give each word, in vocabulary order. */
const LESSON_READINGS = new Map<string, string[]>();
for (const v of chineseVocabulary) {
  const readings = LESSON_READINGS.get(v.word);
  if (!readings) LESSON_READINGS.set(v.word, [v.reading]);
  else if (!readings.includes(v.reading)) readings.push(v.reading);
}

/** Syllables of a word: the (first usable) lesson reading, else pinyin-pro. */
function readWord(word: string): Syllable[] {
  for (const reading of LESSON_READINGS.get(word) ?? []) {
    const syllables = lessonSyllables(word, reading);
    if (syllables) return syllables;
  }
  return pinyinProSyllables(word);
}

/** Per-syllable tone breakdown for a Chinese word. */
export function getTones(word: string): ToneSyllable[] {
  if (!HAN_RE.test(word)) return [];
  return readWord(word).map(({ text, tone }) => ({ text, tone }));
}

/**
 * The tones actually spoken: 3-3 becomes 2-3; 一 is yí before a 4th tone and yì before 1–3; 不 is
 * bú before a 4th tone. A 一/不 the lesson already writes with its sandhi tone keeps that tone.
 */
function spokenTones(syllables: Syllable[]): ToneNumber[] {
  return syllables.map((s, i) => {
    if (s.tone !== s.citation) return s.tone;
    const next = syllables[i + 1]?.citation;
    if (next === undefined) return s.tone;
    if (s.char === '一' && next !== 5) return next === 4 ? 2 : 4;
    if (s.char === '不' && next === 4) return 2;
    if (s.citation === 3 && next === 3) return 2;
    return s.tone;
  });
}

/** Hex colour for a tone, for inline styling of pinyin. */
export function toneColor(tone: ToneNumber): string {
  return TONES[tone].color;
}

// ---- Seeded RNG so drills are stable within a session but vary across them ----

export function makeRng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---- Drill builders ----

/**
 * Syllables of a vocabulary item for a drill, or null when the drill can't label its audio
 * reliably: a word the lessons read two ways (只 zhī/zhǐ) could be voiced either way, and a
 * pinyin-pro reading of an erhua word ("zhè ér" for 这儿) is not what is said.
 */
function drillSyllables(word: string, reading: string): Syllable[] | null {
  if ((LESSON_READINGS.get(word)?.length ?? 0) > 1) return null;
  const lesson = lessonSyllables(word, reading);
  if (lesson) return lesson;
  return word.includes('儿') ? null : pinyinProSyllables(word);
}

export interface ToneIdItem {
  hanzi: string;
  pinyin: string;
  meaning: string;
  tone: ToneNumber;
}

/** Single-character words with a clear 1–4 tone, for "which tone did you hear?". */
export function getToneIdItems(seed: number, limit = 40): ToneIdItem[] {
  const rng = makeRng(seed);
  const seen = new Set<string>();
  const items: ToneIdItem[] = [];

  for (const v of chineseVocabulary) {
    if ([...v.word].length !== 1) continue; // single hanzi only
    if (seen.has(v.word)) continue;
    const syllables = drillSyllables(v.word, v.reading);
    if (syllables?.length !== 1) continue;
    const { text, tone } = syllables[0];
    if (tone === 5) continue; // neutral is hard to hear in isolation
    seen.add(v.word);
    items.push({ hanzi: v.word, pinyin: text, meaning: v.meaning, tone });
  }

  return shuffle(items, rng).slice(0, limit);
}

type TonePair = [ToneNumber, ToneNumber];

export interface TonePairItem {
  hanzi: string;
  pinyin: string;
  meaning: string;
  /** Tones as written (citation tones: 你好 is 3-3, 一起 is 1-3). */
  pair: TonePair;
  /** What is actually said when that differs from `pair` (你好 → 2-3, 一起 → 4-3); also correct. */
  spoken?: TonePair;
  options: TonePair[]; // includes the correct pair, and the spoken pattern when there is one
}

const pairKey = (p: TonePair) => `${p[0]}-${p[1]}`;

/** Two-character words, for "which tone pair did you hear?". */
export function getTonePairItems(seed: number, limit = 40): TonePairItem[] {
  const rng = makeRng(seed);
  const seen = new Set<string>();
  const base: Omit<TonePairItem, 'options'>[] = [];

  for (const v of chineseVocabulary) {
    if ([...v.word].length !== 2) continue;
    if (seen.has(v.word)) continue;
    const syllables = drillSyllables(v.word, v.reading);
    if (syllables?.length !== 2) continue;
    seen.add(v.word);
    const pair: TonePair = [syllables[0].citation, syllables[1].citation];
    const said = spokenTones(syllables) as TonePair;
    base.push({
      hanzi: v.word,
      pinyin: syllables.map((s) => s.text).join(''),
      meaning: v.meaning,
      pair,
      ...(pairKey(said) !== pairKey(pair) && { spoken: said }),
    });
  }

  // Every written pattern with the pattern it is said as. A written 3-3 sounds like 2-3, so 3-3
  // would also be a right answer to a word that really is 2-3: never offer it as a distractor.
  const allPairs = new Map<string, TonePair>();
  const soundsLike = new Map<string, Set<string>>();
  for (const b of base) {
    allPairs.set(pairKey(b.pair), b.pair);
    if (!b.spoken) continue;
    const sounds = soundsLike.get(pairKey(b.pair)) ?? new Set<string>();
    sounds.add(pairKey(b.spoken));
    soundsLike.set(pairKey(b.pair), sounds);
  }

  return shuffle(base, rng)
    .slice(0, limit)
    .map((b) => {
      const correct = b.spoken ? [b.pair, b.spoken] : [b.pair];
      const heard = new Set(correct.map(pairKey));
      const distractors = shuffle(
        [...allPairs.values()].filter((p) => {
          const key = pairKey(p);
          return !heard.has(key) && ![...(soundsLike.get(key) ?? [])].some((s) => heard.has(s));
        }),
        rng,
      ).slice(0, 4 - correct.length);
      return { ...b, options: shuffle([...correct, ...distractors], rng) };
    });
}
