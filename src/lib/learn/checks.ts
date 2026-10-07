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
//
// The first two checks of a rule (all a daily session takes) are built from
// different examples, so one sentence never shows up as both quiz and puzzle.

import { nanoid } from 'nanoid';
import { chineseGrammarRules, type GrammarRule } from '@/data/chinese/grammar';
import { alternativeOrders, segmentByPinyin } from '@/lib/exercises/tiles';
import type { Exercise } from '@/types';

type Example = GrammarRule['examples'][number];

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

// `exampleKey` names the rule example a check is built from (sourceId), so a
// caller can tell which sentences it has already shown.
function baseExercise(
  exampleKey: string,
  question: string,
  instruction: string,
): Omit<Exercise, 'type' | 'data'> {
  return {
    id: nanoid(),
    sourceId: exampleKey,
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

  // Examples that cut cleanly into at least three word tiles — fewer isn't much of a puzzle.
  const tileable = examples.flatMap((example, index) => {
    const seg = segmentByPinyin(example.chinese, example.pinyin);
    return seg && seg.words.length >= 3 ? [{ example, index, seg }] : [];
  });

  // The quiz takes the first example, unless the puzzle can only be built from
  // that one: the quiz and the puzzle (the first two checks, which is all a daily
  // session takes) must never show the same sentence.
  const puzzleOnlyFromFirst = tileable.length > 0 && tileable.every((t) => t.index === 0);
  const quizIndex = puzzleOnlyFromFirst && examples.length > 1 ? 1 : 0;
  const used = new Set([quizIndex]);

  // 1) toSentence — the core "do you recognise the correct construction?" check.
  const quiz = examples[quizIndex];
  if (quiz) {
    const { options, correctIndex } = withCorrectIndex(
      quiz.chinese,
      pickDistractors(sentencePool, quiz.chinese, 3),
    );
    checks.push({
      ...baseExercise(`${rule.id}:${quizIndex}`, 'Which sentence means:', `"${quiz.english}"`),
      type: 'sentence-mc',
      data: {
        type: 'sentence-mc',
        direction: 'toSentence',
        sentence: quiz.chinese,
        sentencePinyin: quiz.pinyin,
        translation: quiz.english,
        options,
        correctIndex,
        explanation: rule.explanation,
      },
    });
  }

  // 2) sentence-construction for any other example we can segment safely.
  for (const { example, index, seg } of tileable) {
    if (checks.length >= count) break;
    if (index === quizIndex) continue;
    used.add(index);
    const alternatives = alternativeOrders(seg.words);
    checks.push({
      ...baseExercise(
        `${rule.id}:${index}`,
        'Build the sentence',
        'Tap the words in order; tap a placed word to take it back.',
      ),
      type: 'sentence-construction',
      data: {
        type: 'sentence-construction',
        words: seg.words,
        wordReadings: seg.readings,
        correctOrder: seg.words.join(''),
        acceptableOrders: alternatives.length > 0 ? alternatives : undefined,
        correctPinyin: example.pinyin,
        translation: example.english,
      },
    });
  }

  // 3) toMeaning — comprehension check on an example not used yet, to round things out.
  const freeIndex = examples.findIndex((_, i) => !used.has(i));
  const meaningIndex = freeIndex === -1 ? Math.min(1, examples.length - 1) : freeIndex;
  const meaningEx: Example | undefined = examples[meaningIndex];
  if (meaningEx && checks.length < count) {
    const { options, correctIndex } = withCorrectIndex(
      meaningEx.english,
      pickDistractors(meaningPool, meaningEx.english, 3),
    );
    checks.push({
      ...baseExercise(
        `${rule.id}:${meaningIndex}`,
        meaningEx.chinese,
        'What does this sentence mean?',
      ),
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
