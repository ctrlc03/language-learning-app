/**
 * Offline exercise generator — builds exercises from static vocabulary data
 * without any API calls. Exercises are generated deterministically from the
 * vocabulary pool.
 */

import { nanoid } from 'nanoid';
import {
  chineseVocabulary,
  chineseLessons,
  getCourseVocabulary,
  getLessonVocabulary,
} from '@/data/chinese/vocabulary';
import { japaneseVocabulary } from '@/data/japanese/vocabulary';
import { irodoriVocabulary } from '@/data/japanese/irodori-vocab';
import { irodoriGrammar } from '@/data/japanese/irodori-grammar';
import { chineseDialogues } from '@/data/chinese/dialogues';
import { japaneseDialogues } from '@/data/japanese/dialogues';
import type {
  Exercise,
  ExerciseType,
  Language,
  DifficultyLevel,
  VocabularyItem,
  MultipleChoiceData,
  FillInBlankData,
  SentenceConstructionData,
  CharacterRecognitionData,
  GrammarDrillData,
  DialogueReadingData,
  DialogueComprehensionExerciseData,
  DialogueLine,
  SentenceMcData,
  FuriSegment,
} from '@/types';
import type { GrammarPattern } from '@/data/japanese/irodori-grammar';
import {
  normalizePinyin,
  piecesPinyin,
  pinyinSegments,
  toPinyin,
  wordPinyin,
} from '@/lib/language/pinyin';
import {
  alternativeOrders,
  isAcceptedOrder,
  normalizeOrder,
  segmentByPinyin,
} from '@/lib/exercises/tiles';

// Seeded random for reproducibility within a session
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pickN<T>(arr: T[], n: number, rng: () => number): T[] {
  const shuffled = shuffle(arr, rng);
  return shuffled.slice(0, n);
}

function getVocabulary(language: Language): VocabularyItem[] {
  return language === 'chinese' ? chineseVocabulary : japaneseVocabulary;
}

// Japanese has no lesson tracking, so its pool follows the difficulty setting.
function filterJapaneseByDifficulty(
  items: VocabularyItem[],
  difficulty: DifficultyLevel,
): VocabularyItem[] {
  if (difficulty === 'beginner') {
    return items.filter((v) => v.level === 'JLPT N5' || v.level === 'Irodori Starter');
  }
  if (difficulty === 'intermediate') {
    return items.filter(
      (v) =>
        v.level === 'JLPT N5' ||
        v.level === 'JLPT N4' ||
        v.level === 'Irodori Starter' ||
        v.level === 'Irodori Elementary 1',
    );
  }
  return items;
}

// Chinese practice covers the course so far, whatever the difficulty setting:
// every lesson up to the learner's current one plus the HSK 1 core.
function scopeVocabulary(
  language: Language,
  difficulty: DifficultyLevel,
  currentLesson: number,
): VocabularyItem[] {
  return language === 'chinese'
    ? getCourseVocabulary(currentLesson)
    : filterJapaneseByDifficulty(japaneseVocabulary, difficulty);
}

/** The Chinese lesson a chapter key (a lesson title) names. */
function chapterLesson(lessonFilter: string): number | undefined {
  return chineseLessons.find((l) => l.title === lessonFilter)?.lesson;
}

// Words of the chosen chapter; empty when the key names no chapter of this language.
function chapterVocabulary(language: Language, lessonFilter: string): VocabularyItem[] {
  if (language === 'chinese') {
    const lesson = chapterLesson(lessonFilter);
    return lesson === undefined ? [] : getLessonVocabulary(lesson);
  }
  // Japanese chapter keys are "<Irodori level>|<lesson>", e.g. "Irodori Starter|3".
  if (!lessonFilter.includes('|')) return [];
  const [level, lessonNum] = lessonFilter.split('|');
  const num = parseInt(lessonNum, 10);
  return irodoriVocabulary.filter((v) => v.level === level && v.lesson === num);
}

// Offline exercise types (excludes 'translation' which needs API)
export const OFFLINE_EXERCISE_TYPES: ExerciseType[] = [
  'multiple-choice',
  'sentence-mc',
  'fill-in-blank',
  'sentence-construction',
  'character-recognition',
  'grammar-drill',
  'dialogue-reading',
  'dialogue-comprehension',
];

export function isOfflineExerciseType(type: ExerciseType): boolean {
  return OFFLINE_EXERCISE_TYPES.includes(type);
}

export interface OfflineExerciseRequest {
  language: Language;
  difficulty: DifficultyLevel;
  type: ExerciseType;
  /** Source ids (`Exercise.sourceId`) already shown; unseen items are preferred. */
  seen?: string[];
  /** Chapter key: a Chinese lesson title, or "<Irodori level>|<lesson>" for Japanese. */
  lessonFilter?: string;
  /** Chinese lesson the learner is on; Chinese practice draws from lessons up to it. */
  currentLesson: number;
  /** Favour words from the current lesson and the two before it (ignored in a chapter). */
  focusRecent?: boolean;
}

// What a generator works from. `pool` is everything in scope (distractors and
// sentence banks draw on it); `targets` are the candidates for the exercise's
// subject: unseen items first, narrowed to recent lessons on request.
interface Scope {
  pool: VocabularyItem[];
  targets: VocabularyItem[];
  seen: Set<string>;
}

/**
 * Generate an offline exercise from static vocabulary data.
 */
export function getOfflineExercise(req: OfflineExerciseRequest): Exercise | null {
  const { language, difficulty, type, seen = [], lessonFilter, currentLesson } = req;
  const allVocab = getVocabulary(language);
  let pool = scopeVocabulary(language, difficulty, currentLesson);

  // A chosen chapter replaces the course pool, when it has enough words to quiz on.
  if (lessonFilter) {
    const chapter = chapterVocabulary(language, lessonFilter);
    if (chapter.length >= 4) pool = chapter;
  }

  if (pool.length < 4) return null;

  const seed = Date.now() + seen.length * 7919;
  const rng = seededRandom(seed);

  const seenSet = new Set(seen);
  const fresh = pool.filter((v) => !seenSet.has(v.id));
  let targets = fresh.length > 0 ? fresh : pool;

  if (req.focusRecent && language === 'chinese' && !lessonFilter) {
    const inWindow = (v: VocabularyItem) =>
      v.lessons?.some((n) => n > currentLesson - 3 && n <= currentLesson) ?? false;
    const recentFresh = targets.filter(inWindow);
    if (recentFresh.length > 0 && pool.filter(inWindow).length >= 4) targets = recentFresh;
  }

  const scope: Scope = { pool, targets, seen: seenSet };

  switch (type) {
    case 'multiple-choice':
      return generateMultipleChoice(scope, allVocab, language, difficulty, rng);
    case 'sentence-mc':
      return generateSentenceMC(scope, allVocab, language, difficulty, rng, lessonFilter);
    case 'fill-in-blank':
      return generateFillInBlank(scope, language, difficulty, rng);
    case 'sentence-construction':
      return generateSentenceConstruction(scope, language, difficulty, rng);
    case 'character-recognition':
      return generateCharacterRecognition(scope, allVocab, language, difficulty, rng);
    case 'grammar-drill':
      return generateGrammarDrill(scope, language, difficulty, rng);
    case 'dialogue-reading':
      return generateDialogueReading(
        language,
        difficulty,
        rng,
        seenSet,
        lessonFilter,
        currentLesson,
      );
    case 'dialogue-comprehension':
      return generateDialogueComprehension(
        language,
        difficulty,
        rng,
        seenSet,
        lessonFilter,
        currentLesson,
      );
    default:
      return null;
  }
}

function generateMultipleChoice(
  { targets }: Scope,
  allVocab: VocabularyItem[],
  language: Language,
  difficulty: DifficultyLevel,
  rng: () => number,
): Exercise {
  const target = pickRandom(targets, rng);

  // Pick 3 distractors from the same level or nearby
  const distractors = allVocab
    .filter((v) => v.id !== target.id && v.meaning !== target.meaning)
    .sort(() => rng() - 0.5)
    .slice(0, 3);

  const correctIndex = Math.floor(rng() * 4);
  const options = [...distractors.map((d) => d.meaning)];
  options.splice(correctIndex, 0, target.meaning);

  let explanation = `${target.word} (${target.reading}) — ${target.meaning}`;
  if (target.exampleSentence) {
    explanation += `\n\nExample: ${target.exampleSentence}`;
    const readingLine =
      target.examplePinyin ?? (language === 'chinese' ? toPinyin(target.exampleSentence) : '');
    if (readingLine) {
      explanation += `\n${readingLine}`;
    }
    if (target.exampleTranslation) {
      explanation += `\n${target.exampleTranslation}`;
    }
  }

  const data: MultipleChoiceData = {
    type: 'multiple-choice',
    options: options.slice(0, 4),
    correctIndex,
    explanation,
  };

  return {
    id: target.id + '_mc_' + nanoid(6),
    sourceId: target.id,
    type: 'multiple-choice',
    language,
    difficulty,
    question: `What does "${target.word}" (${target.reading}) mean?`,
    instruction: 'Choose the correct meaning.',
    data,
    createdAt: Date.now(),
  };
}

// Japanese sentence bank for sentence-mc: every dialogue line containing kanji
// (so furigana is meaningful), with its translation and chapter, drawn from the
// real Irodori dialogues.
interface JpSentence {
  id: string;
  text: string;
  furigana: FuriSegment[];
  translation: string;
  level: string;
  lesson: number;
}

const japaneseSentenceBank: JpSentence[] = japaneseDialogues.flatMap((d) =>
  d.lines
    .filter((l) => l.furigana.some((s) => s.r) && l.text.length >= 4)
    .map((l, i) => ({
      id: `${d.id}-L${i}`,
      text: l.text,
      furigana: l.furigana,
      translation: l.translation,
      level: d.level,
      lesson: d.lesson,
    })),
);

function generateJapaneseSentenceMC(
  difficulty: DifficultyLevel,
  rng: () => number,
  seen: Set<string>,
  lessonFilter?: string,
): Exercise | null {
  if (japaneseSentenceBank.length < 4) return null;

  // Scope the target to the chapter when it has sentences; distractors are
  // always drawn from the full bank so there are enough options.
  let targetPool = japaneseSentenceBank;
  if (lessonFilter && lessonFilter.includes('|')) {
    const [level, lessonNum] = lessonFilter.split('|');
    const num = parseInt(lessonNum, 10);
    const scoped = japaneseSentenceBank.filter((s) => s.level === level && s.lesson === num);
    if (scoped.length > 0) targetPool = scoped;
  }

  const unseen = targetPool.filter((s) => !seen.has(s.id));
  const target = pickRandom(unseen.length > 0 ? unseen : targetPool, rng);
  const distractors = japaneseSentenceBank
    .filter((s) => s.id !== target.id && s.translation !== target.translation)
    .sort(() => rng() - 0.5)
    .slice(0, 3);
  if (distractors.length < 3) return null;

  const correctIndex = Math.floor(rng() * 4);
  const direction: 'toMeaning' | 'toSentence' = rng() < 0.5 ? 'toMeaning' : 'toSentence';

  let data: SentenceMcData;
  let question: string;
  let instruction: string;

  if (direction === 'toMeaning') {
    const options = distractors.map((d) => d.translation);
    options.splice(correctIndex, 0, target.translation);
    data = {
      type: 'sentence-mc',
      direction,
      sentence: target.text,
      sentenceFurigana: target.furigana,
      translation: target.translation,
      options,
      correctIndex,
    };
    question = 'What does this sentence mean?';
    instruction = '';
  } else {
    const options = distractors.map((d) => d.text);
    options.splice(correctIndex, 0, target.text);
    const optionFurigana: (FuriSegment[] | null)[] = distractors.map((d) => d.furigana);
    optionFurigana.splice(correctIndex, 0, target.furigana);
    data = {
      type: 'sentence-mc',
      direction,
      sentence: target.text,
      sentenceFurigana: target.furigana,
      translation: target.translation,
      options,
      optionFurigana,
      correctIndex,
    };
    question = `“${target.translation}”`;
    instruction = 'Which Japanese sentence means this?';
  }

  return {
    id: target.id + '_jsmc_' + nanoid(6),
    sourceId: target.id,
    type: 'sentence-mc',
    language: 'japanese',
    difficulty,
    question,
    instruction,
    data,
    createdAt: Date.now(),
  };
}

function generateSentenceMC(
  scope: Scope,
  allVocab: VocabularyItem[],
  language: Language,
  difficulty: DifficultyLevel,
  rng: () => number,
  lessonFilter?: string,
): Exercise {
  // Japanese draws from the Irodori dialogue sentence bank — real sentences
  // with furigana + translation, so they stay sentence-level (not single words)
  // and render with readings even when scoped to a chapter.
  if (language === 'japanese') {
    const ex = generateJapaneseSentenceMC(difficulty, rng, scope.seen, lessonFilter);
    if (ex) return ex;
    // else fall through to the vocab-based path below
  }

  // Find items with both example sentence and translation
  const hasSentence = (v: VocabularyItem) => Boolean(v.exampleSentence && v.exampleTranslation);
  const withSentences = scope.pool.filter(hasSentence);
  const candidates = scope.targets.filter(hasSentence);

  if (withSentences.length < 4 || candidates.length === 0) {
    // Not enough sentence data, fall back to word-level MC
    return generateMultipleChoice(scope, allVocab, language, difficulty, rng);
  }

  const target = pickRandom(candidates, rng);

  // Pick 3 distractors — other items with distinct sentences and translations
  const distractors = withSentences
    .filter(
      (v) =>
        v.id !== target.id &&
        v.exampleTranslation !== target.exampleTranslation &&
        v.exampleSentence !== target.exampleSentence,
    )
    .sort(() => rng() - 0.5)
    .slice(0, 3);

  if (distractors.length < 3) {
    return generateMultipleChoice(scope, allVocab, language, difficulty, rng);
  }

  const correctIndex = Math.floor(rng() * 4);
  // Pick a direction. Chinese gets a third mode, 'pinyinToMeaning', which shows
  // only the romanized reading and asks for the English meaning. Japanese keeps
  // the two character-based directions (pinyin is meaningless there).
  const directions =
    language === 'chinese'
      ? (['toMeaning', 'toSentence', 'pinyinToMeaning'] as const)
      : (['toMeaning', 'toSentence'] as const);
  const direction = directions[Math.floor(rng() * directions.length)];

  // Per-character pinyin ruby so beginners can read every sentence, not just
  // the target word. (Rendered like Japanese furigana.) Only for Chinese —
  // this path can also serve as a Japanese fallback, where pinyin is wrong.
  const annotate = (text: string): FuriSegment[] | undefined =>
    language === 'chinese' ? pinyinSegments(text) : undefined;

  const readingLine =
    language === 'chinese' ? (target.examplePinyin ?? toPinyin(target.exampleSentence!)) : '';
  const explanation =
    `${target.exampleSentence}\n` +
    (readingLine ? `${readingLine}\n` : '') +
    `${target.word} (${target.reading}) — ${target.meaning}`;

  let data: SentenceMcData;
  let question: string;
  let instruction: string;

  if (direction === 'toSentence') {
    const options = distractors.map((d) => d.exampleSentence!);
    options.splice(correctIndex, 0, target.exampleSentence!);
    const optionFurigana: (FuriSegment[] | null)[] = options.map((o) => annotate(o) ?? null);
    data = {
      type: 'sentence-mc',
      direction,
      sentence: target.exampleSentence!,
      sentenceFurigana: annotate(target.exampleSentence!),
      translation: target.exampleTranslation!,
      options,
      optionFurigana,
      correctIndex,
      explanation,
    };
    question = `“${target.exampleTranslation}”`;
    instruction = 'Which sentence means this?';
  } else {
    // toMeaning + pinyinToMeaning: options are translations. pinyinToMeaning
    // shows only the romanized reading as the stimulus.
    const options = distractors.map((d) => d.exampleTranslation!);
    options.splice(correctIndex, 0, target.exampleTranslation!);
    data = {
      type: 'sentence-mc',
      direction,
      sentence: target.exampleSentence!,
      sentenceFurigana: annotate(target.exampleSentence!),
      sentencePinyin: direction === 'pinyinToMeaning' ? readingLine || undefined : undefined,
      translation: target.exampleTranslation!,
      options,
      correctIndex,
      explanation,
    };
    question = 'What does this sentence mean?';
    instruction =
      direction === 'pinyinToMeaning' ? 'Read the pinyin, then choose the English meaning.' : '';
  }

  return {
    id: target.id + '_smc_' + nanoid(6),
    sourceId: target.id,
    type: 'sentence-mc',
    language,
    difficulty,
    question,
    instruction,
    data,
    createdAt: Date.now(),
  };
}

function generateFillInBlank(
  scope: Scope,
  language: Language,
  difficulty: DifficultyLevel,
  rng: () => number,
): Exercise {
  const { pool, targets } = scope;
  // Find items with example sentences
  const withSentences = targets.filter((v) => v.exampleSentence);
  const target = pickRandom(withSentences.length > 0 ? withSentences : targets, rng);

  if (target.exampleSentence) {
    // Chinese blanks the word only where it stands as a word: 天 is left alone
    // inside 今天 and 天气, and a word that only occurs inside longer words
    // falls back to the definition prompt below.
    const blanked =
      language === 'chinese'
        ? blankChineseWord(target)
        : { sentence: target.exampleSentence.replace(target.word, '___'), pinyin: undefined };

    // If the word wasn't found in the sentence (different form), create a simpler fill-in
    if (!blanked || !blanked.sentence.includes('___')) {
      return createSimpleFillInBlank(target, pool, language, difficulty, rng);
    }

    // Build distractor options from vocab pool (keep items for readings)
    const distractorItems = pool
      .filter((v) => v.id !== target.id && v.word !== target.word)
      .sort(() => rng() - 0.5)
      .slice(0, 3);

    const correctIndex = Math.floor(rng() * 4);
    const options = distractorItems.map((v) => v.word);
    options.splice(correctIndex, 0, target.word);
    const optionReadings: (string | null)[] = distractorItems.map((v) => v.reading || null);
    optionReadings.splice(correctIndex, 0, target.reading || null);

    const data: FillInBlankData = {
      type: 'fill-in-blank',
      sentence: blanked.sentence,
      // Reading line for the blanked sentence so beginners can read the
      // context, not just the missing word; it keeps the blank.
      sentencePinyin: blanked.pinyin,
      translation: target.exampleTranslation,
      answer: target.word,
      acceptableAnswers: [target.word],
      hint: target.reading,
      options: options.slice(0, 4),
      // Shown once the learner has answered; before that they would give the answer away.
      optionReadings: optionReadings.slice(0, 4),
      correctIndex,
    };

    return {
      id: target.id + '_fb_' + nanoid(6),
      sourceId: target.id,
      type: 'fill-in-blank',
      language,
      difficulty,
      question: `Choose the word that completes the sentence.`,
      instruction: `Meaning: ${target.meaning}`,
      data,
      createdAt: Date.now(),
    };
  }

  return createSimpleFillInBlank(target, pool, language, difficulty, rng);
}

// The example sentence with every whole-word occurrence of the target replaced
// by a blank, plus its pinyin line with the same blanks. Null when the word only
// occurs inside longer words (or not at all).
function blankChineseWord(target: VocabularyItem): { sentence: string; pinyin?: string } | null {
  const text = target.exampleSentence ?? '';
  const word = normalizeOrder(target.word);
  if (!word) return null;

  // Word boundaries: the course pinyin where it lines up, else the dictionary cut.
  const seg = target.examplePinyin ? segmentByPinyin(text, target.examplePinyin) : null;
  const tiles = seg ? seg.words : segmentChinese(normalizeOrder(text));

  // Runs of consecutive tiles that spell the whole word; runStart maps each tile of a run to its first tile.
  const runStart = new Map<number, number>();
  let i = 0;
  while (i < tiles.length) {
    let end = i;
    let joined = '';
    while (end < tiles.length && joined.length < word.length) joined += tiles[end++];
    if (joined === word) {
      for (let t = i; t < end; t++) runStart.set(t, i);
      i = end;
    } else {
      i++;
    }
  }
  if (runStart.size === 0) return null;

  const tileOfChar = tiles.flatMap((tile, index) => Array.from(tile, () => index));
  let sentence = '';
  let k = 0;
  let lastRun = -1;
  for (const ch of Array.from(text)) {
    if (normalizeOrder(ch) === '') {
      sentence += ch;
      continue;
    }
    const run = runStart.get(tileOfChar[k++]);
    if (run === undefined) {
      sentence += ch;
      lastRun = -1;
    } else if (run !== lastRun) {
      sentence += '___';
      lastRun = run;
    }
  }
  if (k !== tileOfChar.length || normalizeOrder(sentence.replace(/___/g, '')) === '') return null;

  if (!seg) return { sentence, pinyin: toPinyin(sentence) || undefined };

  const parts: string[] = [];
  lastRun = -1;
  tiles.forEach((_, t) => {
    const run = runStart.get(t);
    if (run === undefined) {
      parts.push(seg.readings[t]);
      lastRun = -1;
    } else if (run !== lastRun) {
      parts.push('___');
      lastRun = run;
    }
  });
  return { sentence, pinyin: parts.join(' ') };
}

function createSimpleFillInBlank(
  target: VocabularyItem,
  pool: VocabularyItem[],
  language: Language,
  difficulty: DifficultyLevel,
  rng: () => number,
): Exercise {
  // Build distractor options (keep items for readings)
  const distractorItems = pool
    .filter((v) => v.id !== target.id && v.word !== target.word)
    .sort(() => rng() - 0.5)
    .slice(0, 3);

  const correctIndex = Math.floor(rng() * 4);
  const options = distractorItems.map((v) => v.word);
  options.splice(correctIndex, 0, target.word);
  const optionReadings: (string | null)[] = distractorItems.map((v) => v.reading || null);
  optionReadings.splice(correctIndex, 0, target.reading || null);

  const data: FillInBlankData = {
    type: 'fill-in-blank',
    sentence: `The word meaning "${target.meaning}" is ___.`,
    answer: target.word,
    acceptableAnswers: [target.word, target.reading],
    hint: target.reading,
    options: options.slice(0, 4),
    optionReadings: optionReadings.slice(0, 4),
    correctIndex,
  };

  return {
    id: target.id + '_fb_' + nanoid(6),
    sourceId: target.id,
    type: 'fill-in-blank',
    language,
    difficulty,
    question: `Choose the ${language === 'chinese' ? 'Chinese character(s)' : 'Japanese word'} for this meaning.`,
    instruction: `Meaning: ${target.meaning}`,
    data,
    createdAt: Date.now(),
  };
}

// Most tiles a pinyin-cut sentence may have; past that the dictionary cut (which
// merges stray single characters) keeps the puzzle manageable.
const MAX_TILES = 9;

function generateSentenceConstruction(
  scope: Scope,
  language: Language,
  difficulty: DifficultyLevel,
  rng: () => number,
): Exercise {
  // Find items with example sentences
  const withSentences = scope.targets.filter((v) => v.exampleSentence && v.exampleTranslation);
  if (withSentences.length === 0) {
    // Fallback to multiple choice
    return generateMultipleChoice(scope, getVocabulary(language), language, difficulty, rng);
  }

  const target = pickRandom(withSentences, rng);
  const sentence = target.exampleSentence!;

  // Split sentence into words/segments
  let words: string[];
  let readings: string[] | null = null;
  if (language === 'chinese') {
    // Cut along the course pinyin where it lines up (those are the words the
    // learner was taught, with their course readings); otherwise along
    // dictionary word boundaries.
    const seg = target.examplePinyin ? segmentByPinyin(sentence, target.examplePinyin) : null;
    if (seg && seg.words.length >= 3 && seg.words.length <= MAX_TILES) {
      words = seg.words;
      readings = seg.readings;
    } else {
      words = splitChineseSentence(sentence);
    }
  } else {
    // Japanese: split by particles and word boundaries
    words = splitJapaneseSentence(sentence);
  }

  if (words.length < 3) {
    // Too short, try another approach
    return generateMultipleChoice(scope, getVocabulary(language), language, difficulty, rng);
  }

  const correctOrder = words.join('');
  // A time word may also follow the subject: 昨天我… ≡ 我昨天…
  const acceptableOrders = language === 'chinese' ? alternativeOrders(words) : [];
  const accepted = { correctOrder, acceptableOrders };

  // Shuffle tile positions (readings stay attached) and never hand over a
  // sentence that is already right.
  let order = shuffle(
    words.map((_, i) => i),
    rng,
  );
  for (let attempt = 0; attempt < 8; attempt++) {
    if (!isAcceptedOrder(order.map((i) => words[i]).join(''), accepted)) break;
    order = shuffle(order, rng);
  }

  // Pinyin per tile so beginners can read the pieces they're arranging; lower
  // case, so no tile gives away where the sentence starts. Tiles not cut along
  // the course pinyin are read in the sentence's context (了 le, not liǎo).
  const tileReadings = language === 'chinese' ? (readings ?? piecesPinyin(words)) : null;

  const data: SentenceConstructionData = {
    type: 'sentence-construction',
    words: order.map((i) => words[i]),
    wordReadings: tileReadings ? order.map((i) => tileReadings[i] || null) : undefined,
    correctOrder,
    acceptableOrders: acceptableOrders.length > 0 ? acceptableOrders : undefined,
    correctPinyin:
      language === 'chinese' ? (target.examplePinyin ?? toPinyin(correctOrder)) : undefined,
    translation: target.exampleTranslation || target.meaning,
  };

  return {
    id: target.id + '_sc_' + nanoid(6),
    sourceId: target.id,
    type: 'sentence-construction',
    language,
    difficulty,
    question: `Arrange the words to form a sentence.`,
    instruction: `Translation: ${target.exampleTranslation || target.meaning}`,
    data,
    createdAt: Date.now(),
  };
}

// Dictionary of known Chinese words (from the vocabulary data) used to split
// sentences along real word boundaries instead of arbitrary character chunks.
const chineseWordSet: Set<string> = new Set(
  chineseVocabulary.map((v) => v.word).filter((w) => w.length >= 2),
);
const maxChineseWordLength = Math.max(2, ...[...chineseWordSet].map((w) => w.length));

// Greedy longest-match cut of punctuation-free text along dictionary words;
// unknown characters become single-char segments.
function segmentChinese(clean: string): string[] {
  const segments: string[] = [];

  let i = 0;
  while (i < clean.length) {
    let matched = '';
    const maxLen = Math.min(maxChineseWordLength, clean.length - i);
    for (let len = maxLen; len >= 2; len--) {
      const candidate = clean.slice(i, i + len);
      if (chineseWordSet.has(candidate)) {
        matched = candidate;
        break;
      }
    }
    if (matched) {
      segments.push(matched);
      i += matched.length;
    } else {
      segments.push(clean[i]);
      i++;
    }
  }

  return segments;
}

function splitChineseSentence(sentence: string): string[] {
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

function splitJapaneseSentence(sentence: string): string[] {
  // Split on particles and common boundaries
  const clean = sentence.replace(/[。！？、]/g, '');
  // Split on common particles while keeping them
  const parts = clean
    .split(/(は|が|を|に|で|と|も|の|へ|から|まで|より|ます|です|ました|ません)/)
    .filter((s) => s.length > 0);

  if (parts.length < 3) {
    // Simple split by every 2-3 chars
    const segments: string[] = [];
    for (let i = 0; i < clean.length; i += 3) {
      segments.push(clean.slice(i, Math.min(i + 3, clean.length)));
    }
    return segments;
  }

  // Combine particles with preceding word
  const merged: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (['は', 'が', 'を', 'に', 'で', 'と', 'も', 'の', 'へ'].includes(parts[i])) {
      if (merged.length > 0) {
        merged[merged.length - 1] += parts[i];
      } else {
        merged.push(parts[i]);
      }
    } else {
      merged.push(parts[i]);
    }
  }

  return merged.filter((s) => s.length > 0);
}

function generateCharacterRecognition(
  { targets }: Scope,
  allVocab: VocabularyItem[],
  language: Language,
  difficulty: DifficultyLevel,
  rng: () => number,
): Exercise {
  const target = pickRandom(targets, rng);

  // Pick 3 distractors
  const distractors = allVocab
    .filter((v) => v.id !== target.id && v.meaning !== target.meaning)
    .sort(() => rng() - 0.5)
    .slice(0, 3);

  const correctIndex = Math.floor(rng() * 4);
  const options = [...distractors.map((d) => d.meaning)];
  options.splice(correctIndex, 0, target.meaning);

  const data: CharacterRecognitionData = {
    type: 'character-recognition',
    character: target.word,
    options: options.slice(0, 4),
    correctIndex,
    reading: target.reading,
    meaning: target.meaning,
  };

  return {
    id: target.id + '_cr_' + nanoid(6),
    sourceId: target.id,
    type: 'character-recognition',
    language,
    difficulty,
    question: `What does this character mean?`,
    instruction: 'Select the correct meaning for the character shown.',
    data,
    createdAt: Date.now(),
  };
}

function generateGrammarDrill(
  scope: Scope,
  language: Language,
  difficulty: DifficultyLevel,
  rng: () => number,
): Exercise {
  // For Japanese, use Irodori grammar patterns if available
  if (language === 'japanese' && irodoriGrammar.length > 0) {
    return generateGrammarDrillFromPatterns(irodoriGrammar, scope, language, difficulty, rng);
  }

  // For Chinese or when no patterns available, generate from vocab
  return generateGrammarDrillFromVocab(scope, language, difficulty, rng);
}

/**
 * Key grammar particles and endings that make good fill-in-the-blank targets.
 * Ordered roughly by specificity (longer/more specific first) so matching
 * prefers the most meaningful blank.
 */
const GRAMMAR_BLANK_TARGETS = [
  // Verb endings & auxiliaries (longer first)
  'てください',
  'てくれる',
  'てもいい',
  'ています',
  'ている',
  'ましょう',
  'ませんか',
  'ません',
  'ました',
  'ますか',
  'ます',
  'ないです',
  'ことができ',
  // Copula & adjective endings
  'じゃないです',
  'じゃない',
  'くないです',
  'くない',
  'でした',
  'です',
  // Particles (longer compound particles first)
  'から',
  'まで',
  'より',
  'だけ',
  'ので',
  'のに',
  'けど',
  'が',
  'を',
  'に',
  'で',
  'と',
  'も',
  'は',
  'へ',
  'の',
  // Common grammar words
  'たい',
  'たく',
];

/**
 * Distractor pools grouped by category so we can generate plausible wrong
 * answers for each blank type.
 */
const PARTICLE_DISTRACTORS: Record<string, string[]> = {
  が: ['を', 'に', 'は', 'で', 'と'],
  を: ['が', 'に', 'は', 'で', 'と'],
  に: ['で', 'へ', 'を', 'が', 'と'],
  で: ['に', 'を', 'が', 'へ', 'は'],
  と: ['も', 'が', 'に', 'を', 'は'],
  も: ['は', 'が', 'を', 'に', 'で'],
  は: ['が', 'を', 'も', 'に', 'で'],
  へ: ['に', 'で', 'を', 'が', 'は'],
  の: ['が', 'を', 'に', 'は', 'で'],
  から: ['まで', 'より', 'に', 'で', 'を'],
  まで: ['から', 'に', 'で', 'を', 'より'],
  より: ['から', 'まで', 'に', 'で', 'は'],
  だけ: ['も', 'しか', 'は', 'が', 'を'],
  ので: ['のに', 'けど', 'から', 'が', 'は'],
  のに: ['ので', 'けど', 'から', 'が', 'は'],
  けど: ['ので', 'のに', 'から', 'が', 'は'],
  です: ['ます', 'でした', 'ません', 'だ', 'じゃない'],
  ます: ['です', 'ました', 'ません', 'る', 'ない'],
  ました: ['ます', 'ません', 'です', 'でした', 'ない'],
  ません: ['ます', 'ました', 'ないです', 'です', 'ない'],
  ませんか: ['ましょう', 'ません', 'ますか', 'ます', 'ました'],
  ましょう: ['ませんか', 'ます', 'ました', 'ません', 'ますか'],
  ますか: ['ます', 'ました', 'ません', 'ませんか', 'ましょう'],
  てください: ['てもいい', 'ています', 'てくれる', 'ます', 'ません'],
  てくれる: ['てください', 'ています', 'てもいい', 'ます', 'ない'],
  てもいい: ['てください', 'ています', 'てくれる', 'ません', 'ない'],
  ています: ['てください', 'てもいい', 'ます', 'ません', 'ました'],
  ている: ['てある', 'てくる', 'ていく', 'ます', 'ない'],
  ないです: ['ません', 'ます', 'です', 'ました', 'ない'],
  じゃないです: ['です', 'でした', 'じゃない', 'ないです', 'くないです'],
  じゃない: ['じゃないです', 'です', 'くない', 'ない', 'でした'],
  くないです: ['です', 'くない', 'じゃないです', 'ないです', 'いです'],
  くない: ['くないです', 'じゃない', 'ない', 'い', 'です'],
  たい: ['ます', 'ない', 'た', 'ている', 'てください'],
  たく: ['ます', 'ない', 'た', 'ている', 'てください'],
};

const grammarPatternId = (p: GrammarPattern) => `${p.level}|${p.lesson}|${p.pattern}`;

function generateGrammarDrillFromPatterns(
  patterns: GrammarPattern[],
  scope: Scope,
  language: Language,
  difficulty: DifficultyLevel,
  rng: () => number,
): Exercise {
  // Filter patterns with examples — pick the first non-multiline example line
  const withExamples = patterns.filter((p) => p.example && p.example.length > 0);
  if (withExamples.length === 0) {
    return generateGrammarDrillFromVocab(scope, language, difficulty, rng);
  }

  // Shuffle patterns and try each until we produce a good exercise
  // (stable sort: patterns not shown yet come first, each group in shuffled order)
  const shuffled = shuffle(withExamples, rng).sort(
    (a, b) =>
      Number(scope.seen.has(grammarPatternId(a))) - Number(scope.seen.has(grammarPatternId(b))),
  );

  for (const pattern of shuffled) {
    // Many Irodori examples have multiple lines separated by \r\n — pick one at random
    const exampleLines = pattern.example
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('Ａ：') && !l.startsWith('Ｂ：'));

    // If the example has A:/B: dialogue format, include those lines too (stripped of label)
    const dialogueLines = pattern.example
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.startsWith('Ａ：') || l.startsWith('Ｂ：'))
      .map((l) => l.slice(2));

    const allLines = [...exampleLines, ...dialogueLines].filter((l) => l.length >= 3);
    if (allLines.length === 0) continue;

    const example = pickRandom(allLines, rng);

    // Try to find the best grammar element to blank out
    let blankTarget = '';
    let sentence = '';

    // Strategy 1: Match known grammar targets that appear in the example
    for (const target of GRAMMAR_BLANK_TARGETS) {
      if (example.includes(target)) {
        blankTarget = target;
        // Replace only the first occurrence
        sentence = example.replace(target, '___');
        break;
      }
    }

    // Strategy 2: Extract key parts from the pattern description itself
    if (!blankTarget) {
      const patternParts = pattern.pattern
        .split(/[（）【】\s\r\n\/＜＞]/g)
        .filter(
          (s) =>
            s.length >= 1 &&
            s.length <= 6 &&
            !/^[A-Z]$/.test(s) &&
            !/^N\d?$/.test(s) &&
            !/^V/.test(s) &&
            !/^S$/.test(s),
        );

      for (const part of patternParts) {
        if (example.includes(part) && part.length >= 1) {
          blankTarget = part;
          sentence = example.replace(part, '___');
          break;
        }
      }
    }

    if (!blankTarget || !sentence.includes('___')) continue;
    // Avoid exercises where the sentence is just "___" or nearly empty
    if (sentence.replace(/___/g, '').replace(/[。、！？\s]/g, '').length < 2) continue;

    // Build multiple-choice options using category-aware distractors
    const distractorPool = PARTICLE_DISTRACTORS[blankTarget];
    let options: string[] | undefined;
    let correctIndex: number | undefined;

    if (distractorPool && distractorPool.length >= 3) {
      const distractors = shuffle(distractorPool, rng).slice(0, 3);
      correctIndex = Math.floor(rng() * 4);
      options = [...distractors];
      options.splice(correctIndex, 0, blankTarget);
    }

    // Build explanation with the full pattern and example
    let explanation = `Pattern: ${pattern.pattern}\nExample: ${example}`;
    if (pattern.exampleTranslation) {
      explanation += `\nTranslation: ${pattern.exampleTranslation}`;
    }
    if (pattern.meaning && pattern.meaning !== pattern.pattern) {
      explanation += `\nMeaning: ${pattern.meaning}`;
    }

    const data: GrammarDrillData = {
      type: 'grammar-drill',
      grammarPoint: pattern.pattern,
      sentence,
      answer: blankTarget,
      acceptableAnswers: [blankTarget],
      explanation,
      options,
      correctIndex,
    };

    return {
      id: 'gram_' + nanoid(8),
      sourceId: grammarPatternId(pattern),
      type: 'grammar-drill',
      language,
      difficulty,
      question: `Fill in the blank using the correct grammar.`,
      instruction: `Grammar point: ${pattern.pattern}`,
      data,
      createdAt: Date.now(),
    };
  }

  // All patterns failed — fall back to vocab-based grammar drill
  return generateGrammarDrillFromVocab(scope, language, difficulty, rng);
}

// The Chinese drills are filled from hand-picked words. Part of speech alone is
// too loose in the vocabulary data (永, 每 and 相 are tagged adjectives; 秒 is a
// noun), so a frame like 太___了 or 没有___ only takes words that make a natural
// sentence in it.
const GRADABLE_ADJECTIVES =
  '大 小 好 饿 渴 忙 累 好看 好听 好吃 好喝 好玩 漂亮 帅 多 少 远 近 长 短 高 矮 低 胖 瘦 厚 便宜 贵 热 冷 新 慢 辣 甜 酸 咸 苦 难 棒 舒服 疼 晚 早 聪明 可爱 快乐 高兴 暖和 凉快 难过 满意 方便 有名 勇敢 奇怪 幸运'.split(
    ' ',
  );
// Verbs and adjectives that follow 不 as they stand (不去, 不对), besides the gradable adjectives.
const NEGATABLE_WORDS =
  '去 来 吃 喝 看 听 说 写 读 学习 买 卖 做 住 坐 走 玩 睡觉 喜欢 想 爱 懂 知道 认识 是 回 开 唱 吃饭 说话 起床 上班 上课 看书 跑步 打算 同意 担心 觉得 明白 对'.split(
    ' ',
  );
// Concrete nouns that 没有 takes and that no adverb (很, 也, 都) can precede on its own.
const CONCRETE_NOUNS =
  '手机 钱 面包 西瓜 苹果 书 时间 朋友 哥哥 姐姐 弟弟 妹妹 车 电脑 米饭 咖啡 茶 问题 电视 房子 衣服 桌子 椅子 牛奶 鸡蛋 面条 水果 蔬菜 鱼 汽车 自行车 照片 地图 药 孩子 男朋友 女朋友 水 肉 狗 猫'.split(
    ' ',
  );

const isGradableAdjective = (v: VocabularyItem) =>
  v.partOfSpeech === 'adjective' && GRADABLE_ADJECTIVES.includes(v.word);

// "to eat; to have a meal" → "eat": the first sense, without the infinitive marker.
function briefMeaning(w: VocabularyItem): string {
  return w.meaning.split(/[;,(]/)[0].trim().replace(/^to /, '');
}

interface DrillTemplate {
  pattern: string;
  template: (w: VocabularyItem) => string;
  blank: (w: VocabularyItem) => string;
  answer: (w: VocabularyItem) => string;
  pinyin: (w: VocabularyItem) => string;
  translation: (w: VocabularyItem) => string;
  filter: (v: VocabularyItem) => boolean;
  /**
   * Chinese: choices that are wrong in the blank for every word `filter` admits.
   * Absent when the answer is the word itself: any other word of its kind fits
   * just as well, so the learner types it instead of choosing.
   */
  distractors?: string[];
  /** Chinese: other typed answers that are also right in the blank. */
  alsoAccept?: string[];
}

function generateGrammarDrillFromVocab(
  scope: Scope,
  language: Language,
  difficulty: DifficultyLevel,
  rng: () => number,
): Exercise {
  // Chinese grammar patterns
  const chineseGrammarPatterns: DrillTemplate[] = [
    {
      pattern: '太...了',
      template: (w) => `太${w.word}了`,
      blank: () => `太___了`,
      answer: (w) => w.word,
      pinyin: () => `tài ___ le`,
      translation: (w) => `too ${briefMeaning(w)}`,
      filter: isGradableAdjective,
    },
    {
      pattern: '很 + adj',
      template: (w) => `很${w.word}`,
      blank: () => `很___`,
      answer: (w) => w.word,
      pinyin: () => `hěn ___`,
      translation: (w) => `very ${briefMeaning(w)}`,
      filter: isGradableAdjective,
    },
    {
      pattern: '不 + verb/adj',
      template: (w) => `不${w.word}`,
      blank: (w) => `___${w.word}`,
      answer: () => '不',
      pinyin: (w) => `___ ${w.reading}`,
      translation: (w) => `not ${briefMeaning(w)}`,
      filter: (v) =>
        isGradableAdjective(v) ||
        (NEGATABLE_WORDS.includes(v.word) &&
          (v.partOfSpeech === 'verb' || v.partOfSpeech === 'adjective')),
      // Particles that only follow a word can never open one: wrong before any verb or adjective.
      distractors: ['吗', '吧', '了', '的', '呢'],
    },
    {
      pattern: '没有 + noun',
      template: (w) => `没有${w.word}`,
      blank: (w) => `___${w.word}`,
      answer: () => '没有',
      pinyin: (w) => `___ ${w.reading}`,
      translation: (w) => `don't have ${briefMeaning(w)}`,
      filter: (v) => v.partOfSpeech === 'noun' && CONCRETE_NOUNS.includes(v.word),
      distractors: ['不', '也', '都'],
      alsoAccept: ['没'],
    },
  ];

  const japaneseGrammarPatterns: DrillTemplate[] = [
    // --- Original patterns ---
    {
      pattern: 'N + です',
      template: (w: VocabularyItem) => `${w.word}です`,
      blank: (w: VocabularyItem) => `${w.word}___`,
      answer: (_w: VocabularyItem) => 'です',
      pinyin: (_w: VocabularyItem) => '',
      translation: (_w: VocabularyItem) => '',
      filter: (v: VocabularyItem) => v.partOfSpeech === 'noun',
    },
    {
      pattern: 'V + ます',
      template: (w: VocabularyItem) => `${w.reading}ます`,
      blank: (w: VocabularyItem) => `${w.reading}___`,
      answer: (_w: VocabularyItem) => 'ます',
      pinyin: (_w: VocabularyItem) => '',
      translation: (_w: VocabularyItem) => '',
      filter: (v: VocabularyItem) => v.partOfSpeech === 'verb',
    },
    {
      pattern: 'N + が好きです',
      template: (w: VocabularyItem) => `${w.word}が好きです`,
      blank: (w: VocabularyItem) => `${w.word}___好きです`,
      answer: (_w: VocabularyItem) => 'が',
      pinyin: (_w: VocabularyItem) => '',
      translation: (_w: VocabularyItem) => '',
      filter: (v: VocabularyItem) => v.partOfSpeech === 'noun',
    },
    {
      pattern: 'N + を + V',
      template: (w: VocabularyItem) => `${w.word}を食べます`,
      blank: (w: VocabularyItem) => `${w.word}___食べます`,
      answer: (_w: VocabularyItem) => 'を',
      pinyin: (_w: VocabularyItem) => '',
      translation: (_w: VocabularyItem) => '',
      filter: (v: VocabularyItem) => v.partOfSpeech === 'noun',
    },
    // --- New patterns ---
    {
      pattern: 'N + から (from)',
      template: (w: VocabularyItem) => `${w.word}から来ました`,
      blank: (w: VocabularyItem) => `${w.word}___来ました`,
      answer: (_w: VocabularyItem) => 'から',
      pinyin: (_w: VocabularyItem) => '',
      translation: (w: VocabularyItem) => `came from ${w.meaning}`,
      filter: (v: VocabularyItem) => v.partOfSpeech === 'noun',
    },
    {
      pattern: 'N + まで (until)',
      template: (w: VocabularyItem) => `${w.word}まで行きます`,
      blank: (w: VocabularyItem) => `${w.word}___行きます`,
      answer: (_w: VocabularyItem) => 'まで',
      pinyin: (_w: VocabularyItem) => '',
      translation: (w: VocabularyItem) => `go until/to ${w.meaning}`,
      filter: (v: VocabularyItem) => v.partOfSpeech === 'noun',
    },
    {
      pattern: 'V + たい (want to)',
      template: (w: VocabularyItem) => `${w.reading}たいです`,
      blank: (w: VocabularyItem) => `${w.reading}___です`,
      answer: (_w: VocabularyItem) => 'たい',
      pinyin: (_w: VocabularyItem) => '',
      translation: (w: VocabularyItem) => `want to ${w.meaning}`,
      filter: (v: VocabularyItem) => v.partOfSpeech === 'verb',
    },
    {
      pattern: 'V + ている (progressive)',
      template: (w: VocabularyItem) => `${w.reading}ています`,
      blank: (w: VocabularyItem) => `${w.reading}___います`,
      answer: (_w: VocabularyItem) => 'て',
      pinyin: (_w: VocabularyItem) => '',
      translation: (w: VocabularyItem) => `is ${w.meaning}ing`,
      filter: (v: VocabularyItem) => v.partOfSpeech === 'verb',
    },
    {
      pattern: 'V + てください (please do)',
      template: (w: VocabularyItem) => `${w.reading}てください`,
      blank: (w: VocabularyItem) => `${w.reading}___ください`,
      answer: (_w: VocabularyItem) => 'て',
      pinyin: (_w: VocabularyItem) => '',
      translation: (w: VocabularyItem) => `please ${w.meaning}`,
      filter: (v: VocabularyItem) => v.partOfSpeech === 'verb',
    },
    {
      pattern: 'N + より (than)',
      template: (w: VocabularyItem) => `${w.word}より大きいです`,
      blank: (w: VocabularyItem) => `${w.word}___大きいです`,
      answer: (_w: VocabularyItem) => 'より',
      pinyin: (_w: VocabularyItem) => '',
      translation: (w: VocabularyItem) => `bigger than ${w.meaning}`,
      filter: (v: VocabularyItem) => v.partOfSpeech === 'noun',
    },
    {
      pattern: 'N + じゃないです (neg. copula)',
      template: (w: VocabularyItem) => `${w.word}じゃないです`,
      blank: (w: VocabularyItem) => `${w.word}___`,
      answer: (_w: VocabularyItem) => 'じゃないです',
      pinyin: (_w: VocabularyItem) => '',
      translation: (w: VocabularyItem) => `is not ${w.meaning}`,
      filter: (v: VocabularyItem) => v.partOfSpeech === 'noun',
    },
    {
      pattern: "V + ましょう (let's)",
      template: (w: VocabularyItem) => `${w.reading}ましょう`,
      blank: (w: VocabularyItem) => `${w.reading}___`,
      answer: (_w: VocabularyItem) => 'ましょう',
      pinyin: (_w: VocabularyItem) => '',
      translation: (w: VocabularyItem) => `let's ${w.meaning}`,
      filter: (v: VocabularyItem) => v.partOfSpeech === 'verb',
    },
    {
      pattern: 'N + だけ (only)',
      template: (w: VocabularyItem) => `${w.word}だけです`,
      blank: (w: VocabularyItem) => `${w.word}___です`,
      answer: (_w: VocabularyItem) => 'だけ',
      pinyin: (_w: VocabularyItem) => '',
      translation: (w: VocabularyItem) => `only ${w.meaning}`,
      filter: (v: VocabularyItem) => v.partOfSpeech === 'noun',
    },
    {
      pattern: 'V + ことができます (can do)',
      template: (w: VocabularyItem) => `${w.reading}ことができます`,
      blank: (w: VocabularyItem) => `${w.reading}___ができます`,
      answer: (_w: VocabularyItem) => 'こと',
      pinyin: (_w: VocabularyItem) => '',
      translation: (w: VocabularyItem) => `can ${w.meaning}`,
      filter: (v: VocabularyItem) => v.partOfSpeech === 'verb',
    },
    {
      pattern: 'N + に行きます (go to)',
      template: (w: VocabularyItem) => `${w.word}に行きます`,
      blank: (w: VocabularyItem) => `${w.word}___行きます`,
      answer: (_w: VocabularyItem) => 'に',
      pinyin: (_w: VocabularyItem) => '',
      translation: (w: VocabularyItem) => `go to ${w.meaning}`,
      filter: (v: VocabularyItem) => v.partOfSpeech === 'noun',
    },
    {
      pattern: 'N + で + V (location)',
      template: (w: VocabularyItem) => `${w.word}で食べます`,
      blank: (w: VocabularyItem) => `${w.word}___食べます`,
      answer: (_w: VocabularyItem) => 'で',
      pinyin: (_w: VocabularyItem) => '',
      translation: (w: VocabularyItem) => `eat at ${w.meaning}`,
      filter: (v: VocabularyItem) => v.partOfSpeech === 'noun',
    },
    {
      pattern: 'N + がほしいです (want N)',
      template: (w: VocabularyItem) => `${w.word}がほしいです`,
      blank: (w: VocabularyItem) => `${w.word}___ほしいです`,
      answer: (_w: VocabularyItem) => 'が',
      pinyin: (_w: VocabularyItem) => '',
      translation: (w: VocabularyItem) => `want ${w.meaning}`,
      filter: (v: VocabularyItem) => v.partOfSpeech === 'noun',
    },
  ];

  const grammarPatterns = language === 'chinese' ? chineseGrammarPatterns : japaneseGrammarPatterns;

  // Try each pattern until one works
  const shuffledPatterns = shuffle(grammarPatterns, rng);
  for (const gp of shuffledPatterns) {
    // A frame with no fresh word is skipped (the fallback quiz takes a fresh one)
    // rather than repeating a word already shown.
    const matching = scope.targets.filter(gp.filter);
    if (matching.length === 0) continue;

    const word = pickRandom(matching, rng);
    const sentence = gp.blank(word);
    const answer = gp.answer(word);

    // Build distractor options for multiple choice
    let uniqueDistractors: string[] = [];
    const particlePool = PARTICLE_DISTRACTORS[answer];
    if (gp.distractors) {
      uniqueDistractors = shuffle(gp.distractors, rng).slice(0, 3);
    } else if (language === 'japanese') {
      if (particlePool) {
        // For particle/grammar answers, use the category-aware distractor pool
        uniqueDistractors = shuffle(particlePool, rng).slice(0, 3);
      } else {
        // For word-based answers, use other vocab words
        const otherWords = scope.pool
          .filter((v) => v.id !== word.id && v.word !== answer && gp.filter(v))
          .sort(() => rng() - 0.5)
          .slice(0, 3)
          .map((v) => v.word.slice(0, answer.length) || v.word);
        uniqueDistractors = [...new Set(otherWords.filter((d) => d !== answer))].slice(0, 3);
      }
    }

    let options: string[] | undefined;
    let correctIndex: number | undefined;
    if (uniqueDistractors.length >= 2) {
      correctIndex = Math.floor(rng() * (uniqueDistractors.length + 1));
      options = [...uniqueDistractors];
      options.splice(correctIndex, 0, answer);
    }

    // Typed answers: the blank's word itself may be given as characters, pinyin
    // (with or without tone marks) or its English meaning.
    const typedWordAnswers =
      answer === word.word
        ? [word.reading, normalizePinyin(word.reading), word.meaning, briefMeaning(word)]
        : [];

    const data: GrammarDrillData = {
      type: 'grammar-drill',
      grammarPoint: gp.pattern,
      sentence,
      answer,
      acceptableAnswers:
        language === 'chinese'
          ? [...new Set([answer, ...(gp.alsoAccept ?? []), ...typedWordAnswers])]
          : [answer],
      explanation: `Full expression: ${gp.template(word)} — Pattern: ${gp.pattern}`,
      options,
      // Pinyin under each option so beginners can read the choices
      optionReadings:
        options && language === 'chinese' ? options.map((o) => wordPinyin(o) || null) : undefined,
      correctIndex,
      ...(gp.pinyin(word)
        ? {
            pinyin: gp.pinyin(word),
            translation: gp.translation(word),
          }
        : {}),
    };

    const answerHint =
      language === 'chinese'
        ? `Meaning: "${gp.translation(word) || word.meaning}"`
        : `Grammar point: ${gp.pattern}`;

    return {
      id: word.id + '_gd_' + nanoid(6),
      sourceId: word.id,
      type: 'grammar-drill',
      language,
      difficulty,
      question: `Fill in the blank using the correct grammar.`,
      instruction: answerHint,
      data,
      createdAt: Date.now(),
    };
  }

  // Final fallback: generate a multiple choice instead
  return generateMultipleChoice(scope, getVocabulary(language), language, difficulty, rng);
}

// A language-neutral view of a dialogue used by the dialogue generators below.
interface DialogueSource {
  id: string;
  title: string;
  titleNative: string;
  setting: string;
  level?: string;
  lesson?: number;
  lines: DialogueLine[];
  questions: { question: string; options: string[]; correctIndex: number; explanation?: string }[];
}

// Chinese dialogues ship without hand-written questions, so synthesize
// line-meaning questions: "What does A mean by 「…」?" with the other lines'
// translations as distractors. Distractors are drawn from the same dialogue
// first (most plausible), then topped up from other dialogues.
function buildChineseDialogueQuestions(
  dialogue: (typeof chineseDialogues)[number],
): DialogueSource['questions'] {
  const allLines = chineseDialogues.flatMap((d) => d.lines);
  return dialogue.lines
    .filter((l) => l.text.replace(/[，。！？、\s]/g, '').length >= 4)
    .map((line, idx) => {
      const sameDialogue = dialogue.lines.filter(
        (l) => l !== line && l.translation !== line.translation,
      );
      const others = allLines.filter(
        (l) => l !== line && l.translation !== line.translation && !sameDialogue.includes(l),
      );
      // Deterministic but varied: rotate the pools by line index
      const pool = [...sameDialogue, ...others];
      const distractors: string[] = [];
      for (let i = 0; i < pool.length && distractors.length < 3; i++) {
        const t = pool[(i + idx) % pool.length].translation;
        if (t !== line.translation && !distractors.includes(t)) distractors.push(t);
      }
      if (distractors.length < 3) return null;

      const correctIndex = idx % 4;
      const options = [...distractors];
      options.splice(correctIndex, 0, line.translation);
      return {
        question: `What does ${line.speaker} mean by “${line.text}”?`,
        options,
        correctIndex,
        explanation: `${line.text}\n${line.pinyin}\n${line.translation}`,
      };
    })
    .filter((q): q is NonNullable<typeof q> => q !== null);
}

function getDialogues(language: Language): DialogueSource[] {
  if (language === 'chinese') {
    return chineseDialogues.map((d) => ({
      id: d.id,
      title: d.title,
      titleNative: d.titleChinese,
      setting: d.setting,
      lesson: d.lesson,
      lines: d.lines,
      questions: buildChineseDialogueQuestions(d),
    }));
  }
  // Japanese: map the line `reading` onto DialogueLine.pinyin (for the reading
  // toggle / TTS fallback) and carry furigana segments for per-kanji ruby.
  return japaneseDialogues.map((d) => ({
    id: d.id,
    title: d.title,
    titleNative: d.titleJapanese,
    setting: d.setting,
    level: d.level,
    lesson: d.lesson,
    lines: d.lines.map((l) => ({
      speaker: l.speaker,
      text: l.text,
      // Reading is derived from the furigana segments (reading where annotated,
      // plain kana otherwise) — used only for the non-ruby fallback / TTS.
      pinyin: l.furigana.map((s) => s.r ?? s.t).join(''),
      translation: l.translation,
      furigana: l.furigana,
    })),
    questions: d.questions,
  }));
}

// Dialogues in scope. With a chapter key: that chapter's dialogues (Japanese
// keys are "<level>|<lesson>", e.g. "Irodori Starter|1"; Chinese keys are lesson
// titles), which may be none, so the caller can bail. Without one, Chinese
// dialogues are limited to the lessons the learner has reached.
function scopeDialogues(
  dialogues: DialogueSource[],
  language: Language,
  lessonFilter: string | undefined,
  currentLesson: number,
): DialogueSource[] {
  if (lessonFilter?.includes('|')) {
    const [level, lessonNum] = lessonFilter.split('|');
    const num = parseInt(lessonNum, 10);
    return dialogues.filter((d) => d.level === level && d.lesson === num);
  }
  if (language !== 'chinese') return dialogues;
  const chapter = lessonFilter ? chapterLesson(lessonFilter) : undefined;
  if (chapter !== undefined) return dialogues.filter((d) => d.lesson === chapter);
  return dialogues.filter((d) => d.lesson === undefined || d.lesson <= currentLesson);
}

function generateDialogueReading(
  language: Language,
  difficulty: DifficultyLevel,
  rng: () => number,
  seenSet: Set<string>,
  lessonFilter: string | undefined,
  currentLesson: number,
): Exercise | null {
  const dialogues = scopeDialogues(getDialogues(language), language, lessonFilter, currentLesson);
  if (dialogues.length === 0) return null;

  const available = dialogues.filter((d) => !seenSet.has(d.id));
  const pool = available.length > 0 ? available : dialogues;

  const dialogue = pickRandom(pool, rng);

  const data: DialogueReadingData = {
    type: 'dialogue-reading',
    title: dialogue.title,
    setting: dialogue.setting,
    lines: dialogue.lines,
  };

  return {
    id: dialogue.id,
    sourceId: dialogue.id,
    type: 'dialogue-reading',
    language,
    difficulty,
    question: `${dialogue.title} (${dialogue.titleNative})`,
    instruction: 'Read through the dialogue. Tap lines to reveal them one by one.',
    data,
    createdAt: Date.now(),
  };
}

function generateDialogueComprehension(
  language: Language,
  difficulty: DifficultyLevel,
  rng: () => number,
  seenSet: Set<string>,
  lessonFilter: string | undefined,
  currentLesson: number,
): Exercise | null {
  // Only dialogues that ship with comprehension questions qualify.
  const dialogues = scopeDialogues(
    getDialogues(language),
    language,
    lessonFilter,
    currentLesson,
  ).filter((d) => d.questions.length > 0);
  if (dialogues.length === 0) return null;

  const available = dialogues.filter((d) => !seenSet.has(d.id));
  const pool = available.length > 0 ? available : dialogues;

  const dialogue = pickRandom(pool, rng);
  const q = pickRandom(dialogue.questions, rng);

  const data: DialogueComprehensionExerciseData = {
    type: 'dialogue-comprehension',
    title: dialogue.title,
    setting: dialogue.setting,
    lines: dialogue.lines,
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
  };

  return {
    // Include a question marker so repeats of the same dialogue stay distinct.
    id: dialogue.id + '_dc_' + nanoid(6),
    sourceId: dialogue.id,
    type: 'dialogue-comprehension',
    language,
    difficulty,
    question: `${dialogue.title} (${dialogue.titleNative})`,
    instruction: 'Read the conversation, then answer the question.',
    data,
    createdAt: Date.now(),
  };
}
