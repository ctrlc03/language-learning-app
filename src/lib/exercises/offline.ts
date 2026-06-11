/**
 * Offline exercise generator — builds exercises from static vocabulary data
 * without any API calls. Exercises are generated deterministically from the
 * vocabulary pool.
 */

import { nanoid } from 'nanoid';
import { chineseVocabulary, chineseLessons } from '@/data/chinese/vocabulary';
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
import { pinyinSegments, toPinyin } from '@/lib/language/pinyin';

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

function filterByDifficulty(
  items: VocabularyItem[],
  language: Language,
  difficulty: DifficultyLevel
): VocabularyItem[] {
  if (difficulty === 'beginner') {
    if (language === 'chinese') {
      return items.filter(v =>
        v.level === 'HSK 1' || v.level === 'Pinyin & Adjectives' ||
        v.level === 'Time & Daily Schedule' || v.level === 'Family & Occupations'
      );
    }
    return items.filter(v =>
      v.level === 'JLPT N5' || v.level === 'Irodori Starter'
    );
  }
  if (difficulty === 'intermediate') {
    if (language === 'chinese') {
      // Include all lesson-based and HSK 1-2 levels
      return items.filter(v =>
        v.level === 'HSK 1' || v.level === 'HSK 2' ||
        (v.level && !v.level.startsWith('HSK 3') && !v.level.startsWith('HSK 4') &&
         !v.level.startsWith('HSK 5') && !v.level.startsWith('HSK 6'))
      );
    }
    return items.filter(v =>
      v.level === 'JLPT N5' || v.level === 'JLPT N4' ||
      v.level === 'Irodori Starter' || v.level === 'Irodori Elementary 1'
    );
  }
  // advanced: all items
  return items;
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

/**
 * Generate an offline exercise from static vocabulary data.
 */
export function getOfflineExercise(
  language: Language,
  difficulty: DifficultyLevel,
  type: ExerciseType,
  seen: string[] = [],
  lessonFilter?: string
): Exercise | null {
  const allVocab = getVocabulary(language);
  let vocab = filterByDifficulty(allVocab, language, difficulty);

  // If a specific lesson is selected, filter vocab to that lesson only
  if (lessonFilter) {
    let lessonVocab: VocabularyItem[];
    // Japanese Irodori lesson filter: "Irodori Starter|3" format
    if (lessonFilter.includes('|')) {
      const [level, lessonNum] = lessonFilter.split('|');
      const num = parseInt(lessonNum, 10);
      lessonVocab = irodoriVocabulary.filter(v => v.level === level && v.lesson === num);
    } else {
      lessonVocab = allVocab.filter(v => v.level === lessonFilter);
    }
    if (lessonVocab.length >= 4) {
      vocab = lessonVocab;
    }
  }

  if (vocab.length < 4) return null;

  const seed = Date.now() + seen.length * 7919;
  const rng = seededRandom(seed);

  // Filter out recently seen items
  const seenSet = new Set(seen);
  const available = vocab.filter(v => !seenSet.has(v.id));
  const pool = available.length >= 4 ? available : vocab;

  switch (type) {
    case 'multiple-choice':
      return generateMultipleChoice(pool, allVocab, language, difficulty, rng);
    case 'sentence-mc':
      return generateSentenceMC(pool, allVocab, language, difficulty, rng, lessonFilter);
    case 'fill-in-blank':
      return generateFillInBlank(pool, language, difficulty, rng);
    case 'sentence-construction':
      return generateSentenceConstruction(pool, language, difficulty, rng);
    case 'character-recognition':
      return generateCharacterRecognition(pool, allVocab, language, difficulty, rng);
    case 'grammar-drill':
      return generateGrammarDrill(pool, language, difficulty, rng);
    case 'dialogue-reading':
      return generateDialogueReading(language, difficulty, rng, seenSet, lessonFilter);
    case 'dialogue-comprehension':
      return generateDialogueComprehension(language, difficulty, rng, seenSet, lessonFilter);
    default:
      return null;
  }
}

function generateMultipleChoice(
  pool: VocabularyItem[],
  allVocab: VocabularyItem[],
  language: Language,
  difficulty: DifficultyLevel,
  rng: () => number
): Exercise {
  const target = pickRandom(pool, rng);

  // Pick 3 distractors from the same level or nearby
  const distractors = allVocab
    .filter(v => v.id !== target.id && v.meaning !== target.meaning)
    .sort(() => rng() - 0.5)
    .slice(0, 3);

  const correctIndex = Math.floor(rng() * 4);
  const options = [...distractors.map(d => d.meaning)];
  options.splice(correctIndex, 0, target.meaning);

  let explanation = `${target.word} (${target.reading}) — ${target.meaning}`;
  if (target.exampleSentence) {
    explanation += `\n\nExample: ${target.exampleSentence}`;
    const readingLine = target.examplePinyin ??
      (language === 'chinese' ? toPinyin(target.exampleSentence) : '');
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

const japaneseSentenceBank: JpSentence[] = japaneseDialogues.flatMap(d =>
  d.lines
    .filter(l => l.furigana.some(s => s.r) && l.text.length >= 4)
    .map((l, i) => ({
      id: `${d.id}-L${i}`,
      text: l.text,
      furigana: l.furigana,
      translation: l.translation,
      level: d.level,
      lesson: d.lesson,
    }))
);

function generateJapaneseSentenceMC(
  difficulty: DifficultyLevel,
  rng: () => number,
  lessonFilter?: string
): Exercise | null {
  if (japaneseSentenceBank.length < 4) return null;

  // Scope the target to the chapter when it has sentences; distractors are
  // always drawn from the full bank so there are enough options.
  let targetPool = japaneseSentenceBank;
  if (lessonFilter && lessonFilter.includes('|')) {
    const [level, lessonNum] = lessonFilter.split('|');
    const num = parseInt(lessonNum, 10);
    const scoped = japaneseSentenceBank.filter(s => s.level === level && s.lesson === num);
    if (scoped.length > 0) targetPool = scoped;
  }

  const target = pickRandom(targetPool, rng);
  const distractors = japaneseSentenceBank
    .filter(s => s.id !== target.id && s.translation !== target.translation)
    .sort(() => rng() - 0.5)
    .slice(0, 3);
  if (distractors.length < 3) return null;

  const correctIndex = Math.floor(rng() * 4);
  const direction: 'toMeaning' | 'toSentence' = rng() < 0.5 ? 'toMeaning' : 'toSentence';

  let data: SentenceMcData;
  let question: string;
  let instruction: string;

  if (direction === 'toMeaning') {
    const options = distractors.map(d => d.translation);
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
    const options = distractors.map(d => d.text);
    options.splice(correctIndex, 0, target.text);
    const optionFurigana: (FuriSegment[] | null)[] = distractors.map(d => d.furigana);
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
  pool: VocabularyItem[],
  allVocab: VocabularyItem[],
  language: Language,
  difficulty: DifficultyLevel,
  rng: () => number,
  lessonFilter?: string
): Exercise {
  // Japanese draws from the Irodori dialogue sentence bank — real sentences
  // with furigana + translation, so they stay sentence-level (not single words)
  // and render with readings even when scoped to a chapter.
  if (language === 'japanese') {
    const ex = generateJapaneseSentenceMC(difficulty, rng, lessonFilter);
    if (ex) return ex;
    // else fall through to the vocab-based path below
  }

  // Find items with both example sentence and translation
  const withSentences = pool.filter(v => v.exampleSentence && v.exampleTranslation);

  if (withSentences.length < 4) {
    // Not enough sentence data, fall back to word-level MC
    return generateMultipleChoice(pool, allVocab, language, difficulty, rng);
  }

  const target = pickRandom(withSentences, rng);

  // Pick 3 distractors — other items with distinct sentences and translations
  const distractors = withSentences
    .filter(v =>
      v.id !== target.id &&
      v.exampleTranslation !== target.exampleTranslation &&
      v.exampleSentence !== target.exampleSentence
    )
    .sort(() => rng() - 0.5)
    .slice(0, 3);

  if (distractors.length < 3) {
    return generateMultipleChoice(pool, allVocab, language, difficulty, rng);
  }

  const correctIndex = Math.floor(rng() * 4);
  // Half the time, flip the direction: give the English meaning and let the
  // learner pick the matching full sentence (options are whole sentences).
  const direction: 'toMeaning' | 'toSentence' = rng() < 0.5 ? 'toMeaning' : 'toSentence';

  // Per-character pinyin ruby so beginners can read every sentence, not just
  // the target word. (Rendered like Japanese furigana.) Only for Chinese —
  // this path can also serve as a Japanese fallback, where pinyin is wrong.
  const annotate = (text: string): FuriSegment[] | undefined =>
    language === 'chinese' ? pinyinSegments(text) : undefined;

  const readingLine = language === 'chinese'
    ? (target.examplePinyin ?? toPinyin(target.exampleSentence!))
    : '';
  const explanation =
    `${target.exampleSentence}\n` +
    (readingLine ? `${readingLine}\n` : '') +
    `${target.word} (${target.reading}) — ${target.meaning}`;

  let data: SentenceMcData;
  let question: string;
  let instruction: string;

  if (direction === 'toMeaning') {
    const options = distractors.map(d => d.exampleTranslation!);
    options.splice(correctIndex, 0, target.exampleTranslation!);
    data = {
      type: 'sentence-mc',
      direction,
      sentence: target.exampleSentence!,
      sentenceFurigana: annotate(target.exampleSentence!),
      translation: target.exampleTranslation!,
      options,
      correctIndex,
      explanation,
    };
    question = 'What does this sentence mean?';
    instruction = '';
  } else {
    const options = distractors.map(d => d.exampleSentence!);
    options.splice(correctIndex, 0, target.exampleSentence!);
    const optionFurigana: (FuriSegment[] | null)[] = options.map(o => annotate(o) ?? null);
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
  }

  return {
    id: target.id + '_smc_' + nanoid(6),
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
  pool: VocabularyItem[],
  language: Language,
  difficulty: DifficultyLevel,
  rng: () => number
): Exercise {
  // Find items with example sentences
  const withSentences = pool.filter(v => v.exampleSentence);
  const target = withSentences.length > 0
    ? pickRandom(withSentences, rng)
    : pickRandom(pool, rng);

  if (target.exampleSentence) {
    // Replace the target word in the sentence with a blank
    const sentence = target.exampleSentence.replace(target.word, '___');

    // If the word wasn't found in the sentence (different form), create a simpler fill-in
    if (!sentence.includes('___')) {
      return createSimpleFillInBlank(target, pool, language, difficulty, rng);
    }

    // Build distractor options from vocab pool (keep items for readings)
    const distractorItems = pool
      .filter(v => v.id !== target.id && v.word !== target.word)
      .sort(() => rng() - 0.5)
      .slice(0, 3);

    const correctIndex = Math.floor(rng() * 4);
    const options = distractorItems.map(v => v.word);
    options.splice(correctIndex, 0, target.word);
    const optionReadings: (string | null)[] = distractorItems.map(v => v.reading || null);
    optionReadings.splice(correctIndex, 0, target.reading || null);

    const data: FillInBlankData = {
      type: 'fill-in-blank',
      sentence,
      // Reading line for the blanked sentence so beginners can read the
      // context, not just the missing word (___ passes through unchanged).
      sentencePinyin: language === 'chinese' ? toPinyin(sentence) : undefined,
      translation: target.exampleTranslation,
      answer: target.word,
      acceptableAnswers: [target.word],
      hint: target.reading,
      options: options.slice(0, 4),
      optionReadings: optionReadings.slice(0, 4),
      correctIndex,
    };

    return {
      id: target.id + '_fb_' + nanoid(6),
      type: 'fill-in-blank',
      language,
      difficulty,
      question: `Choose the word that completes the sentence.`,
      instruction: `Meaning: ${target.meaning} (${target.reading})`,
      data,
      createdAt: Date.now(),
    };
  }

  return createSimpleFillInBlank(target, pool, language, difficulty, rng);
}

function createSimpleFillInBlank(
  target: VocabularyItem,
  pool: VocabularyItem[],
  language: Language,
  difficulty: DifficultyLevel,
  rng: () => number
): Exercise {
  // Build distractor options (keep items for readings)
  const distractorItems = pool
    .filter(v => v.id !== target.id && v.word !== target.word)
    .sort(() => rng() - 0.5)
    .slice(0, 3);

  const correctIndex = Math.floor(rng() * 4);
  const options = distractorItems.map(v => v.word);
  options.splice(correctIndex, 0, target.word);
  const optionReadings: (string | null)[] = distractorItems.map(v => v.reading || null);
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
    type: 'fill-in-blank',
    language,
    difficulty,
    question: `Choose the ${language === 'chinese' ? 'Chinese character(s)' : 'Japanese word'} for this meaning.`,
    instruction: `Meaning: ${target.meaning}`,
    data,
    createdAt: Date.now(),
  };
}

function generateSentenceConstruction(
  pool: VocabularyItem[],
  language: Language,
  difficulty: DifficultyLevel,
  rng: () => number
): Exercise {
  // Find items with example sentences
  const withSentences = pool.filter(v => v.exampleSentence && v.exampleTranslation);
  if (withSentences.length === 0) {
    // Fallback to multiple choice
    return generateMultipleChoice(pool, getVocabulary(language), language, difficulty, rng);
  }

  const target = pickRandom(withSentences, rng);
  const sentence = target.exampleSentence!;

  // Split sentence into words/segments
  let words: string[];
  if (language === 'chinese') {
    // Chinese: dictionary-based segmentation along real word boundaries
    words = splitChineseSentence(sentence);
  } else {
    // Japanese: split by particles and word boundaries
    words = splitJapaneseSentence(sentence);
  }

  if (words.length < 3) {
    // Too short, try another approach
    return generateMultipleChoice(pool, getVocabulary(language), language, difficulty, rng);
  }

  const correctOrder = words.join('');
  const shuffledWords = shuffle(words, rng);

  // Prevent the shuffled order from being the same as correct
  if (shuffledWords.join('') === correctOrder && words.length > 2) {
    [shuffledWords[0], shuffledWords[shuffledWords.length - 1]] =
      [shuffledWords[shuffledWords.length - 1], shuffledWords[0]];
  }

  const data: SentenceConstructionData = {
    type: 'sentence-construction',
    words: shuffledWords,
    // Pinyin per tile so beginners can read the pieces they're arranging
    wordReadings: language === 'chinese'
      ? shuffledWords.map(w => toPinyin(w) || null)
      : undefined,
    correctOrder,
    correctPinyin: language === 'chinese'
      ? (target.examplePinyin ?? toPinyin(correctOrder))
      : undefined,
    translation: target.exampleTranslation || target.meaning,
  };

  return {
    id: target.id + '_sc_' + nanoid(6),
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
  chineseVocabulary.map(v => v.word).filter(w => w.length >= 2)
);
const maxChineseWordLength = Math.max(2, ...[...chineseWordSet].map(w => w.length));

function splitChineseSentence(sentence: string): string[] {
  // Remove punctuation, then segment by greedy longest match against the
  // vocabulary dictionary; unknown characters become single-char segments.
  const clean = sentence.replace(/[，。！？、；：""''（）《》【】\s]/g, '');
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
  const parts = clean.split(/(は|が|を|に|で|と|も|の|へ|から|まで|より|ます|です|ました|ません)/)
    .filter(s => s.length > 0);

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

  return merged.filter(s => s.length > 0);
}

function generateCharacterRecognition(
  pool: VocabularyItem[],
  allVocab: VocabularyItem[],
  language: Language,
  difficulty: DifficultyLevel,
  rng: () => number
): Exercise {
  const target = pickRandom(pool, rng);

  // Pick 3 distractors
  const distractors = allVocab
    .filter(v => v.id !== target.id && v.meaning !== target.meaning)
    .sort(() => rng() - 0.5)
    .slice(0, 3);

  const correctIndex = Math.floor(rng() * 4);
  const options = [...distractors.map(d => d.meaning)];
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
  pool: VocabularyItem[],
  language: Language,
  difficulty: DifficultyLevel,
  rng: () => number
): Exercise {
  // For Japanese, use Irodori grammar patterns if available
  if (language === 'japanese' && irodoriGrammar.length > 0) {
    return generateGrammarDrillFromPatterns(irodoriGrammar, language, difficulty, rng);
  }

  // For Chinese or when no patterns available, generate from vocab
  return generateGrammarDrillFromVocab(pool, language, difficulty, rng);
}

/**
 * Key grammar particles and endings that make good fill-in-the-blank targets.
 * Ordered roughly by specificity (longer/more specific first) so matching
 * prefers the most meaningful blank.
 */
const GRAMMAR_BLANK_TARGETS = [
  // Verb endings & auxiliaries (longer first)
  'てください', 'てくれる', 'てもいい', 'ています', 'ている',
  'ましょう', 'ませんか', 'ません', 'ました', 'ますか', 'ます',
  'ないです', 'ことができ',
  // Copula & adjective endings
  'じゃないです', 'じゃない', 'くないです', 'くない',
  'でした', 'です',
  // Particles (longer compound particles first)
  'から', 'まで', 'より', 'だけ', 'ので', 'のに', 'けど',
  'が', 'を', 'に', 'で', 'と', 'も', 'は', 'へ', 'の',
  // Common grammar words
  'たい', 'たく',
];

/**
 * Distractor pools grouped by category so we can generate plausible wrong
 * answers for each blank type.
 */
const PARTICLE_DISTRACTORS: Record<string, string[]> = {
  'が': ['を', 'に', 'は', 'で', 'と'],
  'を': ['が', 'に', 'は', 'で', 'と'],
  'に': ['で', 'へ', 'を', 'が', 'と'],
  'で': ['に', 'を', 'が', 'へ', 'は'],
  'と': ['も', 'が', 'に', 'を', 'は'],
  'も': ['は', 'が', 'を', 'に', 'で'],
  'は': ['が', 'を', 'も', 'に', 'で'],
  'へ': ['に', 'で', 'を', 'が', 'は'],
  'の': ['が', 'を', 'に', 'は', 'で'],
  'から': ['まで', 'より', 'に', 'で', 'を'],
  'まで': ['から', 'に', 'で', 'を', 'より'],
  'より': ['から', 'まで', 'に', 'で', 'は'],
  'だけ': ['も', 'しか', 'は', 'が', 'を'],
  'ので': ['のに', 'けど', 'から', 'が', 'は'],
  'のに': ['ので', 'けど', 'から', 'が', 'は'],
  'けど': ['ので', 'のに', 'から', 'が', 'は'],
  'です': ['ます', 'でした', 'ません', 'だ', 'じゃない'],
  'ます': ['です', 'ました', 'ません', 'る', 'ない'],
  'ました': ['ます', 'ません', 'です', 'でした', 'ない'],
  'ません': ['ます', 'ました', 'ないです', 'です', 'ない'],
  'ませんか': ['ましょう', 'ません', 'ますか', 'ます', 'ました'],
  'ましょう': ['ませんか', 'ます', 'ました', 'ません', 'ますか'],
  'ますか': ['ます', 'ました', 'ません', 'ませんか', 'ましょう'],
  'てください': ['てもいい', 'ています', 'てくれる', 'ます', 'ません'],
  'てくれる': ['てください', 'ています', 'てもいい', 'ます', 'ない'],
  'てもいい': ['てください', 'ています', 'てくれる', 'ません', 'ない'],
  'ています': ['てください', 'てもいい', 'ます', 'ません', 'ました'],
  'ている': ['てある', 'てくる', 'ていく', 'ます', 'ない'],
  'ないです': ['ません', 'ます', 'です', 'ました', 'ない'],
  'じゃないです': ['です', 'でした', 'じゃない', 'ないです', 'くないです'],
  'じゃない': ['じゃないです', 'です', 'くない', 'ない', 'でした'],
  'くないです': ['です', 'くない', 'じゃないです', 'ないです', 'いです'],
  'くない': ['くないです', 'じゃない', 'ない', 'い', 'です'],
  'たい': ['ます', 'ない', 'た', 'ている', 'てください'],
  'たく': ['ます', 'ない', 'た', 'ている', 'てください'],
};

function generateGrammarDrillFromPatterns(
  patterns: GrammarPattern[],
  language: Language,
  difficulty: DifficultyLevel,
  rng: () => number
): Exercise {
  // Filter patterns with examples — pick the first non-multiline example line
  const withExamples = patterns.filter(p => p.example && p.example.length > 0);
  if (withExamples.length === 0) {
    return generateGrammarDrillFromVocab(
      getVocabulary(language),
      language,
      difficulty,
      rng
    );
  }

  // Shuffle patterns and try each until we produce a good exercise
  const shuffled = shuffle(withExamples, rng);

  for (const pattern of shuffled) {
    // Many Irodori examples have multiple lines separated by \r\n — pick one at random
    const exampleLines = pattern.example
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('Ａ：') && !l.startsWith('Ｂ：'));

    // If the example has A:/B: dialogue format, include those lines too (stripped of label)
    const dialogueLines = pattern.example
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.startsWith('Ａ：') || l.startsWith('Ｂ：'))
      .map(l => l.slice(2));

    const allLines = [...exampleLines, ...dialogueLines].filter(l => l.length >= 3);
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
        .filter(s => s.length >= 1 && s.length <= 6 && !/^[A-Z]$/.test(s) && !/^N\d?$/.test(s) && !/^V/.test(s) && !/^S$/.test(s));

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
  return generateGrammarDrillFromVocab(getVocabulary(language), language, difficulty, rng);
}

function generateGrammarDrillFromVocab(
  pool: VocabularyItem[],
  language: Language,
  difficulty: DifficultyLevel,
  rng: () => number
): Exercise {
  // Chinese grammar patterns
  const chineseGrammarPatterns = [
    { pattern: '太...了', template: (w: VocabularyItem) => `太${w.word}了`, blank: (w: VocabularyItem) => `太___了`, answer: (w: VocabularyItem) => w.word, pinyin: (w: VocabularyItem) => `tài ___ le`, translation: (w: VocabularyItem) => `too ${w.meaning}`, filter: (v: VocabularyItem) => v.partOfSpeech === 'adjective' },
    { pattern: '很 + adj', template: (w: VocabularyItem) => `很${w.word}`, blank: (w: VocabularyItem) => `很___`, answer: (w: VocabularyItem) => w.word, pinyin: (w: VocabularyItem) => `hěn ___`, translation: (w: VocabularyItem) => `very ${w.meaning}`, filter: (v: VocabularyItem) => v.partOfSpeech === 'adjective' },
    { pattern: '不 + verb/adj', template: (w: VocabularyItem) => `不${w.word}`, blank: (w: VocabularyItem) => `___${w.word}`, answer: (_w: VocabularyItem) => '不', pinyin: (w: VocabularyItem) => `___ ${w.reading}`, translation: (w: VocabularyItem) => `not ${w.meaning}`, filter: (v: VocabularyItem) => v.partOfSpeech === 'verb' || v.partOfSpeech === 'adjective' },
    { pattern: '没有 + noun', template: (w: VocabularyItem) => `没有${w.word}`, blank: (w: VocabularyItem) => `___${w.word}`, answer: (_w: VocabularyItem) => '没有', pinyin: (w: VocabularyItem) => `___ ${w.reading}`, translation: (w: VocabularyItem) => `don't have ${w.meaning}`, filter: (v: VocabularyItem) => v.partOfSpeech === 'noun' },
  ];

  const japaneseGrammarPatterns = [
    // --- Original patterns ---
    { pattern: 'N + です', template: (w: VocabularyItem) => `${w.word}です`, blank: (w: VocabularyItem) => `${w.word}___`, answer: (_w: VocabularyItem) => 'です', pinyin: (_w: VocabularyItem) => '', translation: (_w: VocabularyItem) => '', filter: (v: VocabularyItem) => v.partOfSpeech === 'noun' },
    { pattern: 'V + ます', template: (w: VocabularyItem) => `${w.reading}ます`, blank: (w: VocabularyItem) => `${w.reading}___`, answer: (_w: VocabularyItem) => 'ます', pinyin: (_w: VocabularyItem) => '', translation: (_w: VocabularyItem) => '', filter: (v: VocabularyItem) => v.partOfSpeech === 'verb' },
    { pattern: 'N + が好きです', template: (w: VocabularyItem) => `${w.word}が好きです`, blank: (w: VocabularyItem) => `${w.word}___好きです`, answer: (_w: VocabularyItem) => 'が', pinyin: (_w: VocabularyItem) => '', translation: (_w: VocabularyItem) => '', filter: (v: VocabularyItem) => v.partOfSpeech === 'noun' },
    { pattern: 'N + を + V', template: (w: VocabularyItem) => `${w.word}を食べます`, blank: (w: VocabularyItem) => `${w.word}___食べます`, answer: (_w: VocabularyItem) => 'を', pinyin: (_w: VocabularyItem) => '', translation: (_w: VocabularyItem) => '', filter: (v: VocabularyItem) => v.partOfSpeech === 'noun' },
    // --- New patterns ---
    { pattern: 'N + から (from)', template: (w: VocabularyItem) => `${w.word}から来ました`, blank: (w: VocabularyItem) => `${w.word}___来ました`, answer: (_w: VocabularyItem) => 'から', pinyin: (_w: VocabularyItem) => '', translation: (w: VocabularyItem) => `came from ${w.meaning}`, filter: (v: VocabularyItem) => v.partOfSpeech === 'noun' },
    { pattern: 'N + まで (until)', template: (w: VocabularyItem) => `${w.word}まで行きます`, blank: (w: VocabularyItem) => `${w.word}___行きます`, answer: (_w: VocabularyItem) => 'まで', pinyin: (_w: VocabularyItem) => '', translation: (w: VocabularyItem) => `go until/to ${w.meaning}`, filter: (v: VocabularyItem) => v.partOfSpeech === 'noun' },
    { pattern: 'V + たい (want to)', template: (w: VocabularyItem) => `${w.reading}たいです`, blank: (w: VocabularyItem) => `${w.reading}___です`, answer: (_w: VocabularyItem) => 'たい', pinyin: (_w: VocabularyItem) => '', translation: (w: VocabularyItem) => `want to ${w.meaning}`, filter: (v: VocabularyItem) => v.partOfSpeech === 'verb' },
    { pattern: 'V + ている (progressive)', template: (w: VocabularyItem) => `${w.reading}ています`, blank: (w: VocabularyItem) => `${w.reading}___います`, answer: (_w: VocabularyItem) => 'て', pinyin: (_w: VocabularyItem) => '', translation: (w: VocabularyItem) => `is ${w.meaning}ing`, filter: (v: VocabularyItem) => v.partOfSpeech === 'verb' },
    { pattern: 'V + てください (please do)', template: (w: VocabularyItem) => `${w.reading}てください`, blank: (w: VocabularyItem) => `${w.reading}___ください`, answer: (_w: VocabularyItem) => 'て', pinyin: (_w: VocabularyItem) => '', translation: (w: VocabularyItem) => `please ${w.meaning}`, filter: (v: VocabularyItem) => v.partOfSpeech === 'verb' },
    { pattern: 'N + より (than)', template: (w: VocabularyItem) => `${w.word}より大きいです`, blank: (w: VocabularyItem) => `${w.word}___大きいです`, answer: (_w: VocabularyItem) => 'より', pinyin: (_w: VocabularyItem) => '', translation: (w: VocabularyItem) => `bigger than ${w.meaning}`, filter: (v: VocabularyItem) => v.partOfSpeech === 'noun' },
    { pattern: 'N + じゃないです (neg. copula)', template: (w: VocabularyItem) => `${w.word}じゃないです`, blank: (w: VocabularyItem) => `${w.word}___`, answer: (_w: VocabularyItem) => 'じゃないです', pinyin: (_w: VocabularyItem) => '', translation: (w: VocabularyItem) => `is not ${w.meaning}`, filter: (v: VocabularyItem) => v.partOfSpeech === 'noun' },
    { pattern: 'V + ましょう (let\'s)', template: (w: VocabularyItem) => `${w.reading}ましょう`, blank: (w: VocabularyItem) => `${w.reading}___`, answer: (_w: VocabularyItem) => 'ましょう', pinyin: (_w: VocabularyItem) => '', translation: (w: VocabularyItem) => `let's ${w.meaning}`, filter: (v: VocabularyItem) => v.partOfSpeech === 'verb' },
    { pattern: 'N + だけ (only)', template: (w: VocabularyItem) => `${w.word}だけです`, blank: (w: VocabularyItem) => `${w.word}___です`, answer: (_w: VocabularyItem) => 'だけ', pinyin: (_w: VocabularyItem) => '', translation: (w: VocabularyItem) => `only ${w.meaning}`, filter: (v: VocabularyItem) => v.partOfSpeech === 'noun' },
    { pattern: 'V + ことができます (can do)', template: (w: VocabularyItem) => `${w.reading}ことができます`, blank: (w: VocabularyItem) => `${w.reading}___ができます`, answer: (_w: VocabularyItem) => 'こと', pinyin: (_w: VocabularyItem) => '', translation: (w: VocabularyItem) => `can ${w.meaning}`, filter: (v: VocabularyItem) => v.partOfSpeech === 'verb' },
    { pattern: 'N + に行きます (go to)', template: (w: VocabularyItem) => `${w.word}に行きます`, blank: (w: VocabularyItem) => `${w.word}___行きます`, answer: (_w: VocabularyItem) => 'に', pinyin: (_w: VocabularyItem) => '', translation: (w: VocabularyItem) => `go to ${w.meaning}`, filter: (v: VocabularyItem) => v.partOfSpeech === 'noun' },
    { pattern: 'N + で + V (location)', template: (w: VocabularyItem) => `${w.word}で食べます`, blank: (w: VocabularyItem) => `${w.word}___食べます`, answer: (_w: VocabularyItem) => 'で', pinyin: (_w: VocabularyItem) => '', translation: (w: VocabularyItem) => `eat at ${w.meaning}`, filter: (v: VocabularyItem) => v.partOfSpeech === 'noun' },
    { pattern: 'N + がほしいです (want N)', template: (w: VocabularyItem) => `${w.word}がほしいです`, blank: (w: VocabularyItem) => `${w.word}___ほしいです`, answer: (_w: VocabularyItem) => 'が', pinyin: (_w: VocabularyItem) => '', translation: (w: VocabularyItem) => `want ${w.meaning}`, filter: (v: VocabularyItem) => v.partOfSpeech === 'noun' },
  ];

  // Plausible wrong answers for Chinese function-word blanks (不/没有 patterns)
  const CHINESE_FUNCTION_DISTRACTORS: Record<string, string[]> = {
    '不': ['没', '没有', '很', '太', '也'],
    '没有': ['不', '很', '也', '都', '太'],
  };

  const grammarPatterns = language === 'chinese' ? chineseGrammarPatterns : japaneseGrammarPatterns;

  // Try each pattern until one works
  const shuffledPatterns = shuffle(grammarPatterns, rng);
  for (const gp of shuffledPatterns) {
    const matching = pool.filter(gp.filter);
    if (matching.length === 0) continue;

    const word = pickRandom(matching, rng);
    const sentence = gp.blank(word);
    const answer = gp.answer(word);

    // Build distractor options for multiple choice
    // For particle/grammar answers, use the category-aware distractor pool
    const functionWordPool = PARTICLE_DISTRACTORS[answer] ?? CHINESE_FUNCTION_DISTRACTORS[answer];
    let uniqueDistractors: string[] = [];
    if (answer !== word.word && functionWordPool) {
      uniqueDistractors = shuffle(functionWordPool, rng).slice(0, 3);
    } else {
      // For word-based answers, use other vocab words
      const otherWords = pool
        .filter(v => v.id !== word.id && v.word !== answer && gp.filter(v))
        .sort(() => rng() - 0.5)
        .slice(0, 3)
        .map(v => answer === word.word ? v.word : v.word.slice(0, answer.length) || v.word);
      uniqueDistractors = [...new Set(otherWords.filter(d => d !== answer))].slice(0, 3);
    }

    let options: string[] | undefined;
    let correctIndex: number | undefined;
    if (uniqueDistractors.length >= 2) {
      correctIndex = Math.floor(rng() * (uniqueDistractors.length + 1));
      options = [...uniqueDistractors];
      options.splice(correctIndex, 0, answer);
    }

    const data: GrammarDrillData = {
      type: 'grammar-drill',
      grammarPoint: gp.pattern,
      sentence,
      answer,
      acceptableAnswers: language === 'chinese'
        ? [answer, ...(answer === word.word ? [word.reading, word.meaning] : [])]
        : [answer],
      explanation: `Full expression: ${gp.template(word)} — Pattern: ${gp.pattern}`,
      options,
      // Pinyin under each option so beginners can read the choices
      optionReadings: options && language === 'chinese'
        ? options.map(o => toPinyin(o) || null)
        : undefined,
      correctIndex,
      ...(gp.pinyin(word) ? {
        pinyin: gp.pinyin(word),
        translation: gp.translation(word),
      } : {}),
    };

    const answerHint = language === 'chinese'
      ? `Meaning: "${gp.translation(word) || word.meaning}"`
      : `Grammar point: ${gp.pattern}`;

    return {
      id: word.id + '_gd_' + nanoid(6),
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
  return generateMultipleChoice(pool, getVocabulary(language), language, difficulty, rng);
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
  dialogue: (typeof chineseDialogues)[number]
): DialogueSource['questions'] {
  const allLines = chineseDialogues.flatMap(d => d.lines);
  return dialogue.lines
    .filter(l => l.text.replace(/[，。！？、\s]/g, '').length >= 4)
    .map((line, idx) => {
      const sameDialogue = dialogue.lines.filter(
        l => l !== line && l.translation !== line.translation
      );
      const others = allLines.filter(
        l => l !== line && l.translation !== line.translation &&
          !sameDialogue.includes(l)
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
    return chineseDialogues.map(d => ({
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
  return japaneseDialogues.map(d => ({
    id: d.id,
    title: d.title,
    titleNative: d.titleJapanese,
    setting: d.setting,
    level: d.level,
    lesson: d.lesson,
    lines: d.lines.map(l => ({
      speaker: l.speaker,
      text: l.text,
      // Reading is derived from the furigana segments (reading where annotated,
      // plain kana otherwise) — used only for the non-ruby fallback / TTS.
      pinyin: l.furigana.map(s => s.r ?? s.t).join(''),
      translation: l.translation,
      furigana: l.furigana,
    })),
    questions: d.questions,
  }));
}

// Filter dialogues to a chapter when a lesson filter is active. Japanese
// filters use the "<level>|<lesson>" format (e.g. "Irodori Starter|1");
// Chinese filters carry the lesson title. When no dialogue matches the
// chapter, returns an empty list so the caller can bail.
function filterDialoguesByChapter(dialogues: DialogueSource[], lessonFilter?: string): DialogueSource[] {
  if (!lessonFilter) return dialogues;
  if (lessonFilter.includes('|')) {
    const [level, lessonNum] = lessonFilter.split('|');
    const num = parseInt(lessonNum, 10);
    return dialogues.filter(d => d.level === level && d.lesson === num);
  }
  // Chinese: map the lesson title to its lesson number
  const lesson = chineseLessons.find(l => l.title === lessonFilter);
  if (!lesson) return dialogues;
  return dialogues.filter(d => d.lesson === lesson.lesson);
}

function generateDialogueReading(
  language: Language,
  difficulty: DifficultyLevel,
  rng: () => number,
  seenSet: Set<string>,
  lessonFilter?: string
): Exercise | null {
  const dialogues = filterDialoguesByChapter(getDialogues(language), lessonFilter);
  if (dialogues.length === 0) return null;

  const available = dialogues.filter(d => !seenSet.has(d.id));
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
  lessonFilter?: string
): Exercise | null {
  // Only dialogues that ship with comprehension questions qualify.
  const dialogues = filterDialoguesByChapter(getDialogues(language), lessonFilter)
    .filter(d => d.questions.length > 0);
  if (dialogues.length === 0) return null;

  // Exercise IDs carry a `_dc_<nanoid>` suffix, so dedup on the dialogue prefix.
  const seenIds = [...seenSet];
  const available = dialogues.filter(d => !seenIds.some(s => s.startsWith(d.id)));
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
    type: 'dialogue-comprehension',
    language,
    difficulty,
    question: `${dialogue.title} (${dialogue.titleNative})`,
    instruction: 'Read the conversation, then answer the question.',
    data,
    createdAt: Date.now(),
  };
}
