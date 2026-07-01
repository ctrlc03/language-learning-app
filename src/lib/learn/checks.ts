// Derives understanding-check exercises for a single grammar rule, fully
// offline, straight from the rule's worked examples. No API, no model — the
// checks are deterministic transforms of data we already ship in grammar.ts.
//
// Two kinds are always safe to generate because they need no word segmentation:
//   - sentence-mc `toSentence`  (given the meaning, pick the correct sentence)
//   - sentence-mc `toMeaning`   (given the sentence, pick the correct meaning)
// A third — `sentence-construction` — is emitted only when we can segment an
// example into word tiles using its pinyin AND reconstruct the original string
// exactly. If alignment is even slightly off, we drop it rather than ship a
// broken tile puzzle.

import { nanoid } from 'nanoid';
import { chineseGrammarRules, type GrammarRule } from '@/data/chinese/grammar';
import type { Exercise } from '@/types';

type Example = GrammarRule['examples'][number];

// Strip sentence-final / internal punctuation so a reconstructed tile string can
// be compared against the source char-for-char.
const PUNCT = /[，。！？、：；“”‘’…—·（）,.!?:;"'()]/g;
function stripPunct(s: string): string {
  return s.replace(PUNCT, '');
}

// Count syllables in one pinyin word ≈ number of maximal vowel runs. Each Mandarin
// syllable carries exactly one vowel nucleus, so counting vowel groups recovers
// the hanzi count for that word. Erhua (final 儿) is handled by the caller.
const VOWELS =
  'aeiouüvàáâãäāăạảấầẩẫậắằẳẵặèéêëēĕẹẻếềểễệìíîïĩīĭịỉòóôõöōŏọỏốồổỗộớờởỡợùúûüũūŭụủǔǘǜǚǖñ`ǎěǐǒǔ';
function syllableCount(pinyinWord: string): number {
  const w = pinyinWord.toLowerCase();
  let count = 0;
  let inVowel = false;
  for (const ch of w) {
    const isVowel = VOWELS.includes(ch);
    if (isVowel && !inVowel) count++;
    inVowel = isVowel;
  }
  return count;
}

// Attempt to split `chinese` into words guided by the space-delimited `pinyin`.
// Returns aligned {words, readings} or null when it cannot reproduce the source
// exactly (e.g. erhua / counts drift / stray characters).
export function segmentByPinyin(
  chinese: string,
  pinyin: string,
): { words: string[]; readings: string[] } | null {
  const chars = Array.from(stripPunct(chinese));
  const pinyinWords = stripPunct(pinyin).trim().split(/\s+/).filter(Boolean);
  if (chars.length === 0 || pinyinWords.length === 0) return null;

  const words: string[] = [];
  const readings: string[] = [];
  let idx = 0;
  for (const pw of pinyinWords) {
    let n = syllableCount(pw);
    // Erhua: a pinyin word ending in 'r' pulls an extra 儿 the vowel-count
    // missed. We only bump when a 儿 actually sits at that position, and the
    // full-reconstruction check below rejects any wrong guess — so this is safe
    // even for standalone 二/儿 syllables.
    if (pw.toLowerCase().endsWith('r') && chars[idx + n] === '儿') n += 1;
    if (n < 1) return null;
    const slice = chars.slice(idx, idx + n);
    if (slice.length !== n) return null;
    words.push(slice.join(''));
    readings.push(pw);
    idx += n;
  }
  // Every source character must be consumed for the tiles to be trustworthy.
  if (idx !== chars.length) return null;
  if (words.join('') !== chars.join('')) return null;
  return { words, readings };
}

// Pull `count` distinct wrong options from a pool, excluding `correct`.
function pickDistractors(pool: string[], correct: string, count: number): string[] {
  const seen = new Set([correct]);
  const out: string[] = [];
  for (const item of [...pool].sort(() => Math.random() - 0.5)) {
    if (seen.has(item)) continue;
    seen.add(item);
    out.push(item);
    if (out.length === count) break;
  }
  return out;
}

// Shuffle options and report where the correct one landed.
function withCorrectIndex(
  correct: string,
  distractors: string[],
): { options: string[]; correctIndex: number } {
  const options = [correct, ...distractors].sort(() => Math.random() - 0.5);
  return { options, correctIndex: options.indexOf(correct) };
}

function baseExercise(question: string, instruction: string): Omit<Exercise, 'type' | 'data'> {
  return {
    id: nanoid(),
    language: 'chinese',
    difficulty: 'beginner',
    question,
    instruction,
    createdAt: Date.now(),
  };
}

// Build the ordered list of checks for one rule. `count` caps how many are returned.
export function buildChecksForRule(rule: GrammarRule, count = 4): Exercise[] {
  // Distractor pools come from OTHER rules so wrong answers are plausible but
  // genuinely incorrect for this pattern.
  const others = chineseGrammarRules.filter((r) => r.id !== rule.id);
  const otherExamples = others.flatMap((r) => r.examples);
  const meaningPool = otherExamples.map((e) => e.english);
  const sentencePool = otherExamples.map((e) => e.chinese);

  const checks: Exercise[] = [];
  const examples = rule.examples;

  // 1) toSentence — the core "do you recognise the correct construction?" check.
  if (examples[0]) {
    const ex = examples[0];
    const { options, correctIndex } = withCorrectIndex(
      ex.chinese,
      pickDistractors(sentencePool, ex.chinese, 3),
    );
    checks.push({
      ...baseExercise('Which sentence means:', `"${ex.english}"`),
      type: 'sentence-mc',
      data: {
        type: 'sentence-mc',
        direction: 'toSentence',
        sentence: ex.chinese,
        sentencePinyin: ex.pinyin,
        translation: ex.english,
        options,
        correctIndex,
        explanation: rule.explanation,
      },
    });
  }

  // 2) sentence-construction for any example we can segment safely.
  for (const ex of examples) {
    if (checks.length >= count) break;
    const seg = segmentByPinyin(ex.chinese, ex.pinyin);
    if (!seg || seg.words.length < 3) continue; // <3 tiles isn't much of a puzzle
    checks.push({
      ...baseExercise('Build the sentence', `Arrange the tiles to say: "${ex.english}"`),
      type: 'sentence-construction',
      data: {
        type: 'sentence-construction',
        words: seg.words,
        wordReadings: seg.readings,
        correctOrder: seg.words.join(''),
        correctPinyin: ex.pinyin,
        translation: ex.english,
      },
    });
  }

  // 3) toMeaning — comprehension check on a later example, to round things out.
  const meaningEx: Example | undefined = examples[1] ?? examples[0];
  if (meaningEx && checks.length < count) {
    const { options, correctIndex } = withCorrectIndex(
      meaningEx.english,
      pickDistractors(meaningPool, meaningEx.english, 3),
    );
    checks.push({
      ...baseExercise(meaningEx.chinese, 'What does this sentence mean?'),
      type: 'sentence-mc',
      data: {
        type: 'sentence-mc',
        direction: 'toMeaning',
        sentence: meaningEx.chinese,
        sentencePinyin: meaningEx.pinyin,
        translation: meaningEx.english,
        options,
        correctIndex,
        explanation: rule.explanation,
      },
    });
  }

  return checks.slice(0, count);
}
