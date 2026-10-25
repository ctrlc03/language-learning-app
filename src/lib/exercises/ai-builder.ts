/**
 * The server side of AI-written Chinese exercises. The app picks what an
 * exercise practises (a course word, or a grammar rule the course has taught),
 * the model writes it through a tool whose input is checked here, and the
 * reply becomes the same kind of Exercise the book generator makes: options
 * shuffled, pinyin added by the app, and every Chinese word checked against the
 * course, so nothing goes past what the learner has studied.
 */

import type Anthropic from '@anthropic-ai/sdk';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { chineseGrammarRules, type GrammarRule } from '@/data/chinese/grammar';
import { getCourseVocabulary, getLessonVocabulary } from '@/data/chinese/vocabulary';
import type { AiExerciseType } from '@/lib/exercises/ai';
import { alternativeOrders, isAcceptedOrder, normalizeOrder } from '@/lib/exercises/tiles';
import { hasHan, piecesPinyin, pinyinSegments, toPinyin, wordPinyin } from '@/lib/language/pinyin';
import { lookupWord, splitChineseSentence } from '@/lib/language/segment';
import { findUnknown } from '@/lib/reader/coverage';
import type {
  DialogueComprehensionExerciseData,
  DifficultyLevel,
  Exercise,
  ExerciseData,
  FillInBlankData,
  GrammarDrillData,
  MultipleChoiceData,
  SentenceConstructionData,
  SentenceMcData,
  TranslationData,
  VocabularyItem,
} from '@/types';

/** The tool the model writes every exercise through. */
export const EXERCISE_TOOL = 'write_exercise';

// ── What an exercise practises ──

interface PlanBase {
  difficulty: DifficultyLevel;
  /** Words and grammar taught up to this lesson are allowed. */
  lesson: number;
}

interface WordPlan extends PlanBase {
  /** The course word the exercise practises. */
  word: VocabularyItem;
}

export type TranslationDirection = 'toEnglish' | 'toChinese';

export type ExercisePlan =
  | (WordPlan & { type: 'multiple-choice' })
  | (WordPlan & { type: 'fill-in-blank' })
  | (WordPlan & { type: 'sentence-construction' })
  | (WordPlan & { type: 'dialogue-comprehension' })
  | (WordPlan & { type: 'sentence-mc'; direction: SentenceMcData['direction'] })
  | (WordPlan & { type: 'translation'; direction: TranslationDirection })
  | (PlanBase & { type: 'grammar-drill'; rule: GrammarRule });

type PlanOf<T extends AiExerciseType> = Extract<ExercisePlan, { type: T }>;

export interface PlanRequest {
  type: AiExerciseType;
  difficulty: DifficultyLevel;
  /** The learner's lesson. */
  lesson: number;
  /** A chosen chapter: the exercise practises that lesson's words or grammar. */
  chapter?: number;
  /** Source ids already practised. */
  seen: readonly string[];
}

const HAN_ONLY = /^\p{Script=Han}+$/u;
const SENTENCE_DIRECTIONS = ['toMeaning', 'toSentence'] as const;
const TRANSLATION_DIRECTIONS = ['toEnglish', 'toChinese'] as const;

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}

/** One of `items`, preferring those not practised yet; null when there are none. */
function pickFresh<T>(
  items: readonly T[],
  id: (item: T) => string,
  seen: ReadonlySet<string>,
  random: () => number,
): T | null {
  const fresh = items.filter((item) => !seen.has(id(item)));
  const pool = fresh.length > 0 ? fresh : items;
  return pool.length > 0 ? pick(pool, random) : null;
}

/**
 * What the next exercise practises: a course word (one not practised yet when
 * there is one) or, for a grammar drill, a rule the course has taught. A chosen
 * chapter narrows the choice to that lesson and allows everything up to it.
 */
export function planExercise(req: PlanRequest, random: () => number): ExercisePlan | null {
  const { chapter } = req;
  const base: PlanBase = { difficulty: req.difficulty, lesson: Math.max(req.lesson, chapter ?? 0) };
  const seen = new Set(req.seen);

  if (req.type === 'grammar-drill') {
    const taught = chineseGrammarRules.filter((r) => r.lessons.some((n) => n <= base.lesson));
    const inChapter =
      chapter === undefined ? [] : taught.filter((r) => r.lessons.includes(chapter));
    const rule = pickFresh(inChapter.length > 0 ? inChapter : taught, (r) => r.id, seen, random);
    return rule && { ...base, type: 'grammar-drill', rule };
  }

  const scope =
    chapter === undefined ? getCourseVocabulary(req.lesson) : getLessonVocabulary(chapter);
  const word = pickFresh(
    scope.filter((v) => HAN_ONLY.test(v.word)),
    (v) => v.id,
    seen,
    random,
  );
  if (!word) return null;
  switch (req.type) {
    case 'sentence-mc':
      return { ...base, word, type: req.type, direction: pick(SENTENCE_DIRECTIONS, random) };
    case 'translation':
      return { ...base, word, type: req.type, direction: pick(TRANSLATION_DIRECTIONS, random) };
    default:
      return { ...base, word, type: req.type };
  }
}

// ── What the model fills in ──

const chinese = (what: string) =>
  z
    .string()
    .trim()
    .min(1)
    .describe(`${what}, in simplified Chinese characters with Chinese punctuation`);
const english = (what: string) => z.string().trim().min(1).describe(`${what}, in English`);
const choices = (count: number, what: string) =>
  z.array(z.string().trim().min(1)).length(count).describe(what);
const correctIndex = z
  .number()
  .int()
  .min(0)
  .max(3)
  .describe('Zero-based index of the right option');

const multipleChoiceInput = z.object({
  question: english('The question. Quote Chinese words in characters, without pinyin'),
  options: choices(4, 'Four options, one right: all in English, or all in Chinese'),
  correctIndex,
  explanation: english('One or two sentences on why the answer is right'),
});

const sentenceToMeaningInput = z.object({
  sentence: chinese('The sentence'),
  translation: english('Its natural translation'),
  wrongTranslations: choices(
    3,
    'Three English sentences close to the translation that do not mean the Chinese sentence',
  ),
});

const meaningToSentenceInput = z.object({
  sentence: chinese('The sentence'),
  translation: english('Its natural translation'),
  wrongSentences: choices(
    3,
    'Three Chinese sentences, also made of allowed words only, that do not mean the translation',
  ),
});

const fillInBlankInput = z.object({
  sentence: chinese('The sentence, with the practised word replaced by one blank written ___'),
  translation: english('The translation of the complete sentence'),
  wrongOptions: choices(3, 'Three other allowed words that do not fit the blank'),
});

const sentenceBuildingInput = z.object({
  sentence: chinese('The sentence'),
  translation: english('Its natural translation'),
  tiles: z
    .array(z.string().trim().min(1))
    .min(3)
    .max(9)
    .describe('The sentence cut into its words, in order, without punctuation'),
  otherOrders: z
    .array(z.array(z.string().trim().min(1)))
    .describe('Other orders of the same tiles that are just as correct; usually none'),
});

const grammarDrillInput = z.object({
  sentence: chinese(
    'The sentence, with the practised part of the pattern replaced by one blank written ___',
  ),
  answer: chinese('What goes in the blank'),
  wrongOptions: choices(3, 'Three wrong fillers a learner might confuse with the answer'),
  translation: english('The translation of the complete sentence'),
  explanation: english('One or two sentences on why the answer is right'),
});

const dialogueInput = z.object({
  title: english('A short title'),
  titleChinese: chinese('The same title'),
  setting: english('One sentence on where the conversation happens and who is talking'),
  lines: z
    .array(
      z.object({
        speaker: z.enum(['A', 'B']),
        text: chinese('What the speaker says'),
        translation: english('Its translation'),
      }),
    )
    .min(4)
    .max(8),
  question: english('A question about the conversation'),
  options: choices(4, 'Four answers in English, one right'),
  correctIndex,
  explanation: english('One or two sentences on where the conversation gives the answer'),
});

const translationInput = z.object({
  chinese: chinese('The sentence'),
  english: english('Its natural translation'),
});

function inputSchema(plan: ExercisePlan): z.ZodType {
  switch (plan.type) {
    case 'multiple-choice':
      return multipleChoiceInput;
    case 'sentence-mc':
      return plan.direction === 'toSentence' ? meaningToSentenceInput : sentenceToMeaningInput;
    case 'fill-in-blank':
      return fillInBlankInput;
    case 'sentence-construction':
      return sentenceBuildingInput;
    case 'grammar-drill':
      return grammarDrillInput;
    case 'dialogue-comprehension':
      return dialogueInput;
    case 'translation':
      return translationInput;
  }
}

/** The tool for this plan's exercise; the model is made to call it. */
export function exerciseTool(plan: ExercisePlan): Anthropic.Tool {
  const schema = z.toJSONSchema(inputSchema(plan)) as Record<string, unknown>;
  delete schema.$schema;
  return {
    name: EXERCISE_TOOL,
    description: 'Write the exercise the request describes.',
    input_schema: { ...schema, type: 'object' },
  };
}

// ── Checking the reply and building the exercise ──

/** Why a reply cannot become an exercise; the message goes back to the model. */
class ReplyProblem extends Error {}

function check(condition: unknown, problem: string): asserts condition {
  if (!condition) throw new ReplyProblem(problem);
}

function parse<S extends z.ZodType>(schema: S, input: unknown): z.infer<S> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ReplyProblem(
      `The tool input did not fit its fields: ${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}

const LATIN = /[A-Za-z]/;
/** Chinese text with no pinyin or English in it. */
const isChinese = (text: string) => hasHan(text) && !LATIN.test(text);
const isEnglish = (text: string) => !hasHan(text);
/** English compared loosely: case and punctuation aside. */
const looseEnglish = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

function allDistinct(items: readonly string[], key: (item: string) => string = (s) => s): boolean {
  return new Set(items.map(key)).size === items.length;
}

// 他, 她 and 它 all sound tā, so a learner hearing a sentence or reading its
// pinyin can't tell which one is meant.
const TA_PRONOUNS = /\b(?:he|she|it|him|her|his|hers|its|himself|herself|itself)\b/g;

/**
 * Options must differ in a way a learner can hear: English ones not only by
 * he/she/it, Chinese ones not only by same-sounding characters (他/她, 在/再).
 */
function checkHeardApart(options: readonly string[], chinese: boolean): void {
  const sound = chinese
    ? (text: string) => toPinyin(text).replace(/[^\p{L}]+/gu, '')
    : (text: string) => looseEnglish(text).replace(TA_PRONOUNS, 'tā');
  const heard = new Map<string, string>();
  for (const option of options) {
    const key = sound(option);
    const twin = heard.get(key);
    if (twin !== undefined) {
      throw new ReplyProblem(
        chinese
          ? `"${twin}" and "${option}" sound the same read aloud, so a learner can't tell them apart. Make each option differ by a word that sounds different, never only by a same-sounding character such as 他/她/它 or 在/再.`
          : `"${twin}" and "${option}" differ only by he, she or it. 他, 她 and 它 all sound tā, so a learner can't tell which is meant: make them differ in something else.`,
      );
    }
    heard.set(key, option);
  }
}

/** The practised word's separate meanings: "civil engineering, construction" gives both. */
const meaningsOf = (word: VocabularyItem) =>
  word.meaning.split(/[,;]/).map(looseEnglish).filter(Boolean);

/** A wrong option that only swaps in another meaning of the practised word is right too. */
function checkNoOtherMeaning(word: VocabularyItem, right: string, wrong: readonly string[]): void {
  const padded = ` ${looseEnglish(right)} `;
  const wrongs = wrong.map(looseEnglish);
  const meanings = meaningsOf(word);
  for (const used of meanings.filter((m) => padded.includes(` ${m} `))) {
    for (const other of meanings.filter((m) => m !== used)) {
      const twin = wrongs.indexOf(padded.replace(` ${used} `, ` ${other} `).trim());
      if (twin >= 0) {
        throw new ReplyProblem(
          `"${wrong[twin]}" is right too: ${word.word} means both "${used}" and "${other}". Make each wrong option differ in something else.`,
        );
      }
    }
  }
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** The answer placed among the wrong options at a random position. */
function withAnswer(
  answer: string,
  wrong: readonly string[],
  random: () => number,
): { options: string[]; correctIndex: number } {
  const options = shuffle([answer, ...wrong], random);
  return { options, correctIndex: options.indexOf(answer) };
}

/** A course word as the course reads it; anything else read in context by pinyin-pro. */
function readingOf(text: string): string {
  return lookupWord(text)?.reading || wordPinyin(text);
}

/** Chinese quoted in an English line gets its pinyin after it: 忙 → 忙 (máng). */
function withPinyin(text: string): string {
  return text.replace(
    /(\p{Script=Han}+)([”"」』]?)/gu,
    (_, han: string, close: string) => `${han}${close} (${readingOf(han)})`,
  );
}

const BLANK = '___';

/** A sentence with each run of underscores written as one blank, and how many blanks it has. */
function normalizeBlank(sentence: string): { text: string; blanks: number } {
  const text = sentence.replace(/[_＿]{2,}/g, BLANK);
  return { text, blanks: text.split(BLANK).length - 1 };
}

function wordLine(word: VocabularyItem): string {
  return `${word.word} (${word.reading}) — ${word.meaning}`;
}

function chineseSentence(text: string, word?: VocabularyItem): void {
  check(isChinese(text), `"${text}" must be Chinese characters only, with no pinyin or English.`);
  if (word) check(text.includes(word.word), `The sentence must use ${word.word}.`);
}

function englishText(text: string, what: string): void {
  check(isEnglish(text), `${what} must be in English.`);
}

interface Built {
  exercise: Exercise;
  /** The Chinese the learner sees, checked against the course. */
  chinese: string[];
}

function assemble(
  plan: ExercisePlan,
  question: string,
  instruction: string,
  data: ExerciseData,
): Exercise {
  const sourceId = plan.type === 'grammar-drill' ? plan.rule.id : plan.word.id;
  return {
    id: `${sourceId}_ai_${nanoid(6)}`,
    sourceId,
    type: plan.type,
    language: 'chinese',
    difficulty: plan.difficulty,
    question,
    instruction,
    data,
    createdAt: Date.now(),
  };
}

function buildMultipleChoice(
  plan: PlanOf<'multiple-choice'>,
  raw: unknown,
  random: () => number,
): Built {
  const input = parse(multipleChoiceInput, raw);
  const { word } = plan;
  const answer = input.options[input.correctIndex];
  const chineseCount = input.options.filter(hasHan).length;
  check(
    chineseCount === 0 || chineseCount === 4,
    'The options must be all English or all Chinese.',
  );
  const chineseOptions = chineseCount === 4;
  if (chineseOptions) input.options.forEach((o) => chineseSentence(o));
  check(
    allDistinct(input.options, chineseOptions ? normalizeOrder : looseEnglish),
    'The four options must all differ.',
  );
  checkHeardApart(input.options, chineseOptions);
  if (!chineseOptions) {
    checkNoOtherMeaning(
      word,
      answer,
      input.options.filter((_, i) => i !== input.correctIndex),
    );
  }
  check(
    input.question.includes(word.word) || answer.includes(word.word),
    `The question must practise ${word.word}: ask about it, or make it the answer.`,
  );
  const { options, correctIndex } = withAnswer(
    answer,
    input.options.filter((_, i) => i !== input.correctIndex),
    random,
  );
  const data: MultipleChoiceData = {
    type: 'multiple-choice',
    options,
    optionReadings: chineseOptions ? options.map(readingOf) : undefined,
    correctIndex,
    explanation: `${wordLine(word)}\n\n${input.explanation}`,
  };
  return {
    exercise: assemble(plan, withPinyin(input.question), '', data),
    chinese: [input.question, ...(chineseOptions ? input.options : [])],
  };
}

function buildSentenceMc(plan: PlanOf<'sentence-mc'>, raw: unknown, random: () => number): Built {
  const { word, direction } = plan;
  const explain = (sentence: string) => `${sentence}\n${toPinyin(sentence)}\n${wordLine(word)}`;

  if (direction === 'toSentence') {
    const input = parse(meaningToSentenceInput, raw);
    chineseSentence(input.sentence, word);
    englishText(input.translation, 'The translation');
    input.wrongSentences.forEach((s) => chineseSentence(s));
    check(
      allDistinct([input.sentence, ...input.wrongSentences], normalizeOrder),
      'The four sentences must all differ.',
    );
    checkHeardApart([input.sentence, ...input.wrongSentences], true);
    const { options, correctIndex } = withAnswer(input.sentence, input.wrongSentences, random);
    const data: SentenceMcData = {
      type: 'sentence-mc',
      direction,
      sentence: input.sentence,
      sentenceFurigana: pinyinSegments(input.sentence),
      translation: input.translation,
      options,
      optionFurigana: options.map(pinyinSegments),
      correctIndex,
      explanation: explain(input.sentence),
    };
    return {
      exercise: assemble(plan, `“${input.translation}”`, 'Which sentence means this?', data),
      chinese: [input.sentence, ...input.wrongSentences],
    };
  }

  const input = parse(sentenceToMeaningInput, raw);
  chineseSentence(input.sentence, word);
  [input.translation, ...input.wrongTranslations].forEach((t) =>
    englishText(t, 'Each translation'),
  );
  check(
    allDistinct([input.translation, ...input.wrongTranslations], looseEnglish),
    'The four translations must all differ.',
  );
  checkHeardApart([input.translation, ...input.wrongTranslations], false);
  checkNoOtherMeaning(word, input.translation, input.wrongTranslations);
  const { options, correctIndex } = withAnswer(input.translation, input.wrongTranslations, random);
  const data: SentenceMcData = {
    type: 'sentence-mc',
    direction,
    sentence: input.sentence,
    sentenceFurigana: pinyinSegments(input.sentence),
    translation: input.translation,
    options,
    correctIndex,
    explanation: explain(input.sentence),
  };
  return {
    exercise: assemble(plan, 'What does this sentence mean?', '', data),
    chinese: [input.sentence],
  };
}

function buildFillInBlank(
  plan: PlanOf<'fill-in-blank'>,
  raw: unknown,
  random: () => number,
): Built {
  const input = parse(fillInBlankInput, raw);
  const { word } = plan;
  const { text: sentence, blanks } = normalizeBlank(input.sentence);
  check(blanks === 1, 'The sentence must have exactly one blank, written ___.');
  check(hasHan(sentence.replace(BLANK, '')), 'The sentence needs more than the blank.');
  const complete = sentence.replace(BLANK, word.word);
  chineseSentence(complete);
  englishText(input.translation, 'The translation');
  check(
    input.wrongOptions.every((o) => HAN_ONLY.test(o)),
    'Each wrong option must be one Chinese word, with no punctuation.',
  );
  check(
    allDistinct([word.word, ...input.wrongOptions]),
    `The wrong options must differ from each other and from ${word.word}.`,
  );
  const { options, correctIndex } = withAnswer(word.word, input.wrongOptions, random);
  const data: FillInBlankData = {
    type: 'fill-in-blank',
    sentence,
    sentencePinyin: toPinyin(sentence),
    translation: input.translation,
    answer: word.word,
    acceptableAnswers: [word.word],
    hint: word.reading,
    options,
    optionReadings: options.map(readingOf),
    correctIndex,
  };
  return {
    exercise: assemble(
      plan,
      'Choose the word that completes the sentence.',
      `Meaning: ${word.meaning}`,
      data,
    ),
    chinese: [complete, ...input.wrongOptions],
  };
}

function buildSentenceConstruction(
  plan: PlanOf<'sentence-construction'>,
  raw: unknown,
  random: () => number,
): Built {
  const input = parse(sentenceBuildingInput, raw);
  chineseSentence(input.sentence, plan.word);
  englishText(input.translation, 'The translation');

  // The model's cut when it spells the sentence exactly; otherwise the course's dictionary cut.
  const given = input.tiles.map(normalizeOrder).filter(Boolean);
  const modelCut = given.join('') === normalizeOrder(input.sentence);
  const tiles = modelCut ? given : splitChineseSentence(input.sentence);
  check(
    tiles.length >= 3 && tiles.length <= 9,
    'The sentence must be 3 to 9 words long, cut into one tile per word.',
  );

  const correctOrder = tiles.join('');
  const sameTiles = (order: string[]) =>
    [...order].sort().join('|') === [...tiles].sort().join('|');
  const modelOrders = modelCut
    ? input.otherOrders
        .map((order) => order.map(normalizeOrder).filter(Boolean))
        .filter(sameTiles)
        .map((order) => order.join(''))
    : [];
  const acceptableOrders = [...new Set([...alternativeOrders(tiles), ...modelOrders])].filter(
    (order) => order !== correctOrder,
  );
  const accepted = { correctOrder, acceptableOrders };

  // Never hand over the tiles already in an accepted order.
  let order = shuffle(
    tiles.map((_, i) => i),
    random,
  );
  for (let attempt = 0; attempt < 8; attempt++) {
    if (!isAcceptedOrder(order.map((i) => tiles[i]).join(''), accepted)) break;
    order = shuffle(order, random);
  }

  const readings = piecesPinyin(tiles);
  const data: SentenceConstructionData = {
    type: 'sentence-construction',
    words: order.map((i) => tiles[i]),
    wordReadings: order.map((i) => readings[i] || null),
    correctOrder,
    acceptableOrders: acceptableOrders.length > 0 ? acceptableOrders : undefined,
    correctPinyin: toPinyin(input.sentence),
    translation: input.translation,
  };
  return {
    exercise: assemble(
      plan,
      'Arrange the words to form a sentence.',
      'Tap the words in order; tap a placed word to take it back.',
      data,
    ),
    chinese: [input.sentence],
  };
}

function buildGrammarDrill(
  plan: PlanOf<'grammar-drill'>,
  raw: unknown,
  random: () => number,
): Built {
  const input = parse(grammarDrillInput, raw);
  const { rule } = plan;
  const { text: sentence, blanks } = normalizeBlank(input.sentence);
  check(blanks === 1, 'The sentence must have exactly one blank, written ___.');
  check(hasHan(sentence.replace(BLANK, '')), 'The sentence needs more than the blank.');
  const answer = normalizeOrder(input.answer);
  const wrong = input.wrongOptions.map(normalizeOrder);
  check(
    [answer, ...wrong].every((o) => HAN_ONLY.test(o)),
    'The answer and each wrong option must be Chinese characters only, written together.',
  );
  check(allDistinct([answer, ...wrong]), 'The four options must all differ.');
  const complete = sentence.replace(BLANK, answer);
  chineseSentence(complete);
  englishText(input.translation, 'The translation');

  const { options, correctIndex } = withAnswer(answer, wrong, random);
  const data: GrammarDrillData = {
    type: 'grammar-drill',
    grammarPoint: rule.title,
    sentence,
    answer,
    acceptableAnswers: [answer],
    explanation: input.explanation,
    pinyin: toPinyin(sentence),
    translation: input.translation,
    options,
    optionReadings: options.map(readingOf),
    correctIndex,
  };
  return {
    exercise: assemble(
      plan,
      'Fill in the blank using the correct grammar.',
      `Grammar point: ${rule.pattern}`,
      data,
    ),
    chinese: [complete, ...wrong],
  };
}

function buildDialogue(
  plan: PlanOf<'dialogue-comprehension'>,
  raw: unknown,
  random: () => number,
): Built {
  const input = parse(dialogueInput, raw);
  input.lines.forEach((line) => {
    chineseSentence(line.text);
    englishText(line.translation, 'Each line translation');
  });
  check(
    input.lines.some((line) => line.text.includes(plan.word.word)),
    `The conversation must use ${plan.word.word}.`,
  );
  check(new Set(input.lines.map((l) => l.speaker)).size === 2, 'Both A and B must speak.');
  chineseSentence(input.titleChinese);
  check(allDistinct(input.options, looseEnglish), 'The four options must all differ.');
  checkHeardApart(input.options, false);

  const { options, correctIndex } = withAnswer(
    input.options[input.correctIndex],
    input.options.filter((_, i) => i !== input.correctIndex),
    random,
  );
  const data: DialogueComprehensionExerciseData = {
    type: 'dialogue-comprehension',
    title: input.title,
    setting: input.setting,
    lines: input.lines.map((line) => ({
      speaker: line.speaker,
      text: line.text,
      pinyin: toPinyin(line.text),
      translation: line.translation,
    })),
    question: input.question,
    options,
    correctIndex,
    explanation: input.explanation,
  };
  return {
    exercise: assemble(
      plan,
      `${input.title} (${input.titleChinese})`,
      'Read the conversation, then answer the question.',
      data,
    ),
    chinese: [
      input.titleChinese,
      ...input.lines.map((l) => l.text),
      input.question,
      ...input.options,
    ],
  };
}

function buildTranslation(plan: PlanOf<'translation'>, raw: unknown): Built {
  const input = parse(translationInput, raw);
  chineseSentence(input.chinese, plan.word);
  englishText(input.english, 'The translation');
  const pinyin = toPinyin(input.chinese);
  const toEnglish = plan.direction === 'toEnglish';
  const data: TranslationData = toEnglish
    ? {
        type: 'translation',
        sourceText: input.chinese,
        sourcePinyin: pinyin,
        sourceLanguage: 'chinese',
        targetLanguage: 'english',
        sampleAnswer: input.english,
      }
    : {
        type: 'translation',
        sourceText: input.english,
        sourceLanguage: 'english',
        targetLanguage: 'chinese',
        sampleAnswer: input.chinese,
        samplePinyin: pinyin,
      };
  return {
    exercise: assemble(
      plan,
      toEnglish ? 'Translate into English.' : 'Translate into Chinese.',
      toEnglish ? '' : 'Write it in Chinese characters.',
      data,
    ),
    chinese: [input.chinese],
  };
}

function buildByType(plan: ExercisePlan, raw: unknown, random: () => number): Built {
  switch (plan.type) {
    case 'multiple-choice':
      return buildMultipleChoice(plan, raw, random);
    case 'sentence-mc':
      return buildSentenceMc(plan, raw, random);
    case 'fill-in-blank':
      return buildFillInBlank(plan, raw, random);
    case 'sentence-construction':
      return buildSentenceConstruction(plan, raw, random);
    case 'grammar-drill':
      return buildGrammarDrill(plan, raw, random);
    case 'dialogue-comprehension':
      return buildDialogue(plan, raw, random);
    case 'translation':
      return buildTranslation(plan, raw);
  }
}

export type BuildResult = { exercise: Exercise } | { problem: string };

/**
 * The exercise the model's tool input describes, or why it can't be used: a
 * field that doesn't fit, or a Chinese word the course hasn't taught by the
 * plan's lesson.
 */
export function buildExercise(
  plan: ExercisePlan,
  input: unknown,
  random: () => number,
): BuildResult {
  let built: Built;
  try {
    built = buildByType(plan, input, random);
  } catch (error) {
    if (error instanceof ReplyProblem) return { problem: error.message };
    throw error;
  }
  const { words } = findUnknown(built.chinese, plan.lesson);
  if (words.length > 0) {
    return {
      problem: `It used words the course has not taught yet: ${words.join('、')}. Use only words from the allowed list.`,
    };
  }
  return { exercise: built.exercise };
}
