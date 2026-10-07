/**
 * Grades a typed Chinese answer against its key. Shared by everything that asks
 * the learner to produce Chinese: typed recall, the lesson self-checks and the
 * speaking transcripts.
 *
 * - Characters are compared on the characters alone: punctuation, spaces and
 *   full/half width are ignored, and numbers may be written in digits (100 = 一百).
 * - Pinyin must have the answer's letters (spacing is free; ü may be typed u
 *   or v). Tones are checked whenever any are typed, as marks (nǐ) or numbers
 *   (ni3, ma5): a neutral-tone syllable takes any tone, 一 and 不 take their
 *   citation and sandhi tones, and pinyin typed without tones is graded on the
 *   letters alone.
 */

import { hasHan, normalizePinyin, pinyin, toPinyin } from '@/lib/language/pinyin';
import { parsePinyin } from '@/lib/language/pinyin-syllables';

export interface AnswerKey {
  /** Accepted answers in characters, the model answer first. */
  answers: string[];
  /** The source's own pinyin for answers[0]: erhua is written its way (diǎnr). */
  pinyin?: string;
}

export type AnswerVerdict = 'correct' | 'tones' | 'wrong';

export interface DiffPiece {
  text: string;
  /** same: in both; missing: in the answer only; extra: typed but not in the answer. */
  kind: 'same' | 'missing' | 'extra';
}

export interface SyllableMark {
  /** The syllable as the answer writes it: hǎo. */
  text: string;
  /** Whether the typed tone fits (always true when no tones were typed). */
  ok: boolean;
}

export interface AnswerGrade {
  verdict: AnswerVerdict;
  /** How the input was read. */
  mode: 'hanzi' | 'pinyin';
  /** The accepted answer the input matched, or came closest to. */
  answer: string;
  /** Pinyin of `answer`, for display. */
  answerPinyin: string;
  /** Pinyin typed without any tones: only the letters were checked. */
  tonesUnchecked: boolean;
  /** Pinyin whose letters match: each syllable of the answer, flagged where the tone is off. */
  syllables?: SyllableMark[];
  /** Wrong characters: the closest answer aligned with what was typed. */
  diff?: DiffPiece[];
}

/** The characters that carry an answer: Han, digits and Latin, lowercased, width-folded. */
export function answerCore(text: string): string {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{Script=Han}0-9a-z]/gu, '');
}

const NUMERAL_DIGIT: Record<string, number> = {
  零: 0,
  〇: 0,
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
};
const NUMERAL_UNIT: Record<string, number> = { 十: 10, 百: 100, 千: 1000, 万: 10000 };

/** Value of a numeral with units: 一百零五 = 105, 十二 = 12, 三万五千 = 35000. */
function numeralValue(run: string): number {
  let total = 0;
  let section = 0;
  let digit = 0;
  for (const ch of run) {
    const unit = NUMERAL_UNIT[ch];
    if (unit === undefined) {
      digit = NUMERAL_DIGIT[ch];
    } else if (unit === 10000) {
      total += (section + digit) * unit;
      section = 0;
      digit = 0;
    } else {
      section += (digit || 1) * unit;
      digit = 0;
    }
  }
  return total + section + digit;
}

// Both sides are rewritten the same way, so 一起 → 1起 is harmless. 两 is left
// alone: 二个 for 两个 is a real mistake, not another way of writing it.
function digitsForNumerals(core: string): string {
  return core.replace(/[零〇一二三四五六七八九十百千万]+/g, (run) =>
    /[十百千万]/.test(run)
      ? String(numeralValue(run))
      : [...run].map((ch) => NUMERAL_DIGIT[ch]).join(''),
  );
}

/** Character-level alignment of `typed` against `expected` (longest common subsequence). */
export function diffChars(expected: string, typed: string): DiffPiece[] {
  const a = [...expected];
  const b = [...typed];
  const lcs = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const out: DiffPiece[] = [];
  const push = (text: string, kind: DiffPiece['kind']) => {
    const last = out[out.length - 1];
    if (last?.kind === kind) last.text += text;
    else out.push({ text, kind });
  };
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      push(a[i++], 'same');
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      push(a[i++], 'missing');
    } else {
      push(b[j++], 'extra');
    }
  }
  while (i < a.length) push(a[i++], 'missing');
  while (j < b.length) push(b[j++], 'extra');
  return out;
}

// ---- pinyin ----

const TONE_MARKS: Record<string, number> = { '\u0304': 1, '\u0301': 2, '\u030C': 3, '\u0300': 4 };

/** 一 and 不 change tone with what follows; either the written or the citation tone counts. */
const EITHER_TONE: Record<string, number[]> = { 一: [1, 2, 4], 不: [2, 4] };

interface TypedPinyin {
  /** Letters with ü / v folded to u, as normalizePinyin does. */
  letters: string;
  /** Tone typed on each letter: a mark on its vowel, a number after its syllable; 0 = none. */
  tones: number[];
  toned: boolean;
}

/** Letters and tones of typed pinyin, or null when the input isn't pinyin. */
function readTyped(input: string): TypedPinyin | null {
  let letters = '';
  const tones: number[] = [];
  let toned = false;
  let inSyllable = false;
  for (const c of input.normalize('NFD')) {
    const lower = c.toLowerCase();
    if (lower >= 'a' && lower <= 'z') {
      letters += lower === 'v' ? 'u' : lower;
      tones.push(0);
      inSyllable = true;
    } else if (c in TONE_MARKS || (inSyllable && c >= '0' && c <= '5')) {
      const tone = TONE_MARKS[c] ?? (c === '0' || c === '5' ? 5 : Number(c));
      tones[tones.length - 1] ||= tone;
      toned = true;
      // A tone number closes its syllable; a mark sits inside it.
      inSyllable = c in TONE_MARKS;
    } else if (/[\p{L}\p{N}]/u.test(c)) {
      return null;
    } else if (!/\p{M}/u.test(c) && !(c === ':' && letters.endsWith('u'))) {
      inSyllable = false;
    }
  }
  return letters ? { letters, tones, toned } : null;
}

interface FormSyllable {
  text: string;
  /** Letter span in the form's `letters`. */
  from: number;
  to: number;
  /** Tones that count as right; null = any (neutral tone). */
  tones: Set<number> | null;
}

/** One way of writing an answer in pinyin. */
interface PinyinForm {
  answer: string;
  letters: string;
  syllables: FormSyllable[];
}

interface FormPart {
  text: string;
  tone: number;
  /** The character the syllable reads, when known. */
  char?: string;
}

function buildForm(answer: string, parts: FormPart[]): PinyinForm {
  let letters = '';
  const syllables = parts.map((part) => {
    const from = letters.length;
    letters += normalizePinyin(part.text);
    const either = part.char ? EITHER_TONE[part.char] : undefined;
    return {
      text: part.text,
      from,
      to: letters.length,
      tones: part.tone === 0 ? null : new Set(either ?? [part.tone]),
    };
  });
  return { answer, letters, syllables };
}

/**
 * pinyin-pro's reading, one syllable per character. A 儿 after another character
 * is an erhua suffix when spelled out (yì diǎn er), so it takes any tone.
 */
function machineForm(answer: string): PinyinForm {
  const parts = pinyin(answer, { type: 'all' })
    .filter((c) => c.isZh && c.pinyin)
    .map((c, i) => ({
      text: c.pinyin,
      tone: c.origin === '儿' && i > 0 ? 0 : c.num,
      char: c.origin,
    }));
  return buildForm(answer, parts);
}

/**
 * The character each written syllable reads, or all undefined when they don't
 * line up. An erhua syllable (diǎnr) reads its character and the 儿 after it.
 */
function alignChars(answer: string, syllables: { letters: string }[]): (string | undefined)[] {
  const chars = [...answer].filter((c) => hasHan(c));
  const out: string[] = [];
  let at = 0;
  for (const s of syllables) {
    out.push(chars[at++]);
    if (s.letters.endsWith('r') && s.letters !== 'er' && chars[at] === '儿') at++;
  }
  return at === chars.length ? out : syllables.map(() => undefined);
}

/** The source's pinyin, with each syllable's character where they line up. */
function writtenForm(answer: string, written: string): PinyinForm | null {
  const syllables = parsePinyin(written);
  if (!syllables) return null;
  const chars = alignChars(answer, syllables);
  return buildForm(
    answer,
    syllables.map((s, i) => ({ text: s.text, tone: s.tone, char: chars[i] })),
  );
}

/** Every pinyin form of the key; forms that split the same way pool their accepted tones. */
function pinyinForms(answers: string[], written?: string): PinyinForm[] {
  const forms = new Map<string, PinyinForm>();
  const candidates = [
    written ? writtenForm(answers[0], written) : null,
    ...answers.map(machineForm),
  ];
  for (const form of candidates) {
    if (!form || !form.letters) continue;
    const shape = `${form.letters}|${form.syllables.map((s) => s.to).join(',')}`;
    const same = forms.get(shape);
    if (!same) {
      forms.set(shape, form);
      continue;
    }
    same.syllables.forEach((s, i) => {
      const other = form.syllables[i].tones;
      if (s.tones === null || other === null) s.tones = null;
      else for (const t of other) s.tones.add(t);
    });
  }
  return [...forms.values()];
}

function markTones(form: PinyinForm, typed: TypedPinyin): SyllableMark[] {
  return form.syllables.map((s) => {
    if (!typed.toned) return { text: s.text, ok: true };
    const given = typed.tones.slice(s.from, s.to).filter((t) => t > 0);
    // Once tones are being typed, an unmarked syllable reads as neutral.
    const tone = given.length === 0 ? 5 : given.length === 1 ? given[0] : -1;
    return { text: s.text, ok: tone !== -1 && (s.tones === null || s.tones.has(tone)) };
  });
}

function pinyinOf(answer: string, key: AnswerKey): string {
  return answer === key.answers[0] && key.pinyin ? key.pinyin : toPinyin(answer);
}

/**
 * Grade `input` against `key`. Characters are read as characters, anything else
 * as pinyin. Returns null when there is nothing to grade (blank or punctuation).
 */
export function gradeAnswer(input: string, key: AnswerKey): AnswerGrade | null {
  const answers = key.answers.filter((a) => answerCore(a));
  const typedCore = answerCore(input);
  if (answers.length === 0 || !typedCore) return null;

  const typed = hasHan(input) ? null : readTyped(input);
  if (!typed) {
    const typedNumbers = digitsForNumerals(typedCore);
    const exact = answers.find((a) => digitsForNumerals(answerCore(a)) === typedNumbers);
    if (exact) {
      return {
        verdict: 'correct',
        mode: 'hanzi',
        answer: exact,
        answerPinyin: pinyinOf(exact, key),
        tonesUnchecked: false,
      };
    }
    // Show the miss against the answer it shares the most characters with.
    let best = { answer: answers[0], diff: diffChars(answerCore(answers[0]), typedCore) };
    const shared = (diff: DiffPiece[]) =>
      diff.reduce((n, p) => n + (p.kind === 'same' ? [...p.text].length : 0), 0);
    for (const answer of answers.slice(1)) {
      const diff = diffChars(answerCore(answer), typedCore);
      if (shared(diff) > shared(best.diff)) best = { answer, diff };
    }
    return {
      verdict: 'wrong',
      mode: 'hanzi',
      answer: best.answer,
      answerPinyin: pinyinOf(best.answer, key),
      tonesUnchecked: false,
      diff: best.diff,
    };
  }

  let best: { form: PinyinForm; marks: SyllableMark[]; errors: number } | null = null;
  for (const form of pinyinForms(answers, key.pinyin)) {
    if (form.letters !== typed.letters) continue;
    const marks = markTones(form, typed);
    const errors = marks.filter((m) => !m.ok).length;
    if (!best || errors < best.errors) best = { form, marks, errors };
  }
  if (!best) {
    return {
      verdict: 'wrong',
      mode: 'pinyin',
      answer: answers[0],
      answerPinyin: pinyinOf(answers[0], key),
      tonesUnchecked: !typed.toned,
    };
  }
  return {
    verdict: best.errors > 0 ? 'tones' : 'correct',
    mode: 'pinyin',
    answer: best.form.answer,
    answerPinyin: pinyinOf(best.form.answer, key),
    tonesUnchecked: !typed.toned,
    syllables: best.marks,
  };
}
