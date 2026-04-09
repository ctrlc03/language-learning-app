/**
 * Offline exercise generator — builds exercises from static vocabulary data
 * without any API calls. Exercises are generated deterministically from the
 * vocabulary pool.
 */

import { nanoid } from 'nanoid';
import { chineseVocabulary } from '@/data/chinese/vocabulary';
import { japaneseVocabulary } from '@/data/japanese/vocabulary';
import { irodoriVocabulary } from '@/data/japanese/irodori-vocab';
import { irodoriGrammar } from '@/data/japanese/irodori-grammar';
import { chineseDialogues } from '@/data/chinese/dialogues';
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
} from '@/types';
import type { GrammarPattern } from '@/data/japanese/irodori-grammar';

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
      return generateSentenceMC(pool, allVocab, language, difficulty, rng);
    case 'fill-in-blank':
      return generateFillInBlank(pool, language, difficulty, rng);
    case 'sentence-construction':
      return generateSentenceConstruction(pool, language, difficulty, rng);
    case 'character-recognition':
      return generateCharacterRecognition(pool, allVocab, language, difficulty, rng);
    case 'grammar-drill':
      return generateGrammarDrill(pool, language, difficulty, rng);
    case 'dialogue-reading':
      return generateDialogueReading(language, difficulty, rng, seenSet);
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
    // Build pinyin line from known words found in the example sentence
    const sentenceReadings: string[] = [];
    for (const v of allVocab) {
      if (v.word.length > 1 && target.exampleSentence.includes(v.word)) {
        sentenceReadings.push(`${v.word} = ${v.reading}`);
        if (sentenceReadings.length >= 5) break;
      }
    }
    if (sentenceReadings.length > 0) {
      explanation += `\nPinyin: ${sentenceReadings.join(', ')}`;
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

function generateSentenceMC(
  pool: VocabularyItem[],
  allVocab: VocabularyItem[],
  language: Language,
  difficulty: DifficultyLevel,
  rng: () => number
): Exercise {
  // Find items with both example sentence and translation
  const withSentences = pool.filter(v => v.exampleSentence && v.exampleTranslation);

  if (withSentences.length < 4) {
    // Not enough sentence data, fall back to word-level MC
    return generateMultipleChoice(pool, allVocab, language, difficulty, rng);
  }

  const target = pickRandom(withSentences, rng);

  // Pick 3 distractors — other sentences' translations
  const distractors = withSentences
    .filter(v => v.id !== target.id && v.exampleTranslation !== target.exampleTranslation)
    .sort(() => rng() - 0.5)
    .slice(0, 3);

  if (distractors.length < 3) {
    return generateMultipleChoice(pool, allVocab, language, difficulty, rng);
  }

  const correctIndex = Math.floor(rng() * 4);
  const options = [...distractors.map(d => d.exampleTranslation!)];
  options.splice(correctIndex, 0, target.exampleTranslation!);

  // Build explanation with reading hints
  let explanation = `${target.exampleSentence}`;
  if (target.reading) {
    explanation += `\n${target.word} (${target.reading}) — ${target.meaning}`;
  }
  // Add reading hints for words found in the sentence
  const sentenceReadings: string[] = [];
  for (const v of allVocab) {
    if (v.id !== target.id && v.word.length > 1 && target.exampleSentence!.includes(v.word)) {
      sentenceReadings.push(`${v.word} = ${v.reading} (${v.meaning})`);
      if (sentenceReadings.length >= 4) break;
    }
  }
  if (sentenceReadings.length > 0) {
    explanation += `\n${sentenceReadings.join(', ')}`;
  }

  const data: MultipleChoiceData = {
    type: 'multiple-choice',
    options: options.slice(0, 4),
    correctIndex,
    explanation,
  };

  // Build a reading line for the full sentence by matching known vocabulary words
  // Sort by word length descending so longer words match first (e.g. 北京烤鸭 before 北京)
  const sortedVocab = [...allVocab].sort((a, b) => b.word.length - a.word.length);
  const sentence = target.exampleSentence!;
  const readingParts: { pos: number; word: string; reading: string }[] = [];
  const matched = new Set<number>(); // track character positions already covered

  for (const v of sortedVocab) {
    if (v.word.length < 1 || !v.reading) continue;
    let searchFrom = 0;
    while (true) {
      const idx = sentence.indexOf(v.word, searchFrom);
      if (idx === -1) break;
      // Check no overlap with already matched positions
      let overlap = false;
      for (let c = idx; c < idx + v.word.length; c++) {
        if (matched.has(c)) { overlap = true; break; }
      }
      if (!overlap) {
        readingParts.push({ pos: idx, word: v.word, reading: v.reading });
        for (let c = idx; c < idx + v.word.length; c++) matched.add(c);
      }
      searchFrom = idx + v.word.length;
    }
  }

  // Sort by position and build reading string
  readingParts.sort((a, b) => a.pos - b.pos);
  const readingLine = readingParts.map(p => p.reading).join(' ');

  // Use |||READING||| delimiter so the shell can render characters and pinyin on separate lines
  const instruction = readingLine
    ? `|||READING|||${readingLine}|||END|||What does this sentence mean?`
    : 'What does this sentence mean?';

  return {
    id: target.id + '_smc_' + nanoid(6),
    type: 'sentence-mc',
    language,
    difficulty,
    question: target.exampleSentence!,
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

    // Build distractor options from vocab pool
    const distractors = pool
      .filter(v => v.id !== target.id && v.word !== target.word)
      .sort(() => rng() - 0.5)
      .slice(0, 3)
      .map(v => v.word);

    const correctIndex = Math.floor(rng() * 4);
    const options = [...distractors];
    options.splice(correctIndex, 0, target.word);

    const data: FillInBlankData = {
      type: 'fill-in-blank',
      sentence,
      answer: target.word,
      acceptableAnswers: [target.word],
      hint: target.reading,
      options: options.slice(0, 4),
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
  // Build distractor options
  const distractors = pool
    .filter(v => v.id !== target.id && v.word !== target.word)
    .sort(() => rng() - 0.5)
    .slice(0, 3)
    .map(v => v.word);

  const correctIndex = Math.floor(rng() * 4);
  const options = [...distractors];
  options.splice(correctIndex, 0, target.word);

  const data: FillInBlankData = {
    type: 'fill-in-blank',
    sentence: `The word meaning "${target.meaning}" is ___.`,
    answer: target.word,
    acceptableAnswers: [target.word, target.reading],
    hint: target.reading,
    options: options.slice(0, 4),
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
    // Chinese: split by characters or common word boundaries
    // Simple approach: split into 2-3 character segments
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
    correctOrder,
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

function splitChineseSentence(sentence: string): string[] {
  // Remove punctuation, then split into meaningful segments
  const clean = sentence.replace(/[，。！？、；：""''（）《》【】\s]/g, '');
  const segments: string[] = [];

  // Split into 1-3 character segments
  let i = 0;
  while (i < clean.length) {
    // Try to match common 2-3 char words
    if (i + 2 <= clean.length && Math.random() > 0.3) {
      const len = i + 3 <= clean.length && Math.random() > 0.5 ? 3 : 2;
      segments.push(clean.slice(i, i + len));
      i += len;
    } else {
      segments.push(clean[i]);
      i++;
    }
  }

  // Merge tiny segments if too many
  if (segments.length > 6) {
    const merged: string[] = [];
    for (let j = 0; j < segments.length; j += 2) {
      if (j + 1 < segments.length) {
        merged.push(segments[j] + segments[j + 1]);
      } else {
        merged.push(segments[j]);
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
    let uniqueDistractors: string[] = [];
    if (answer !== word.word && PARTICLE_DISTRACTORS[answer]) {
      uniqueDistractors = shuffle(PARTICLE_DISTRACTORS[answer], rng).slice(0, 3);
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

function generateDialogueReading(
  language: Language,
  difficulty: DifficultyLevel,
  rng: () => number,
  seenSet: Set<string>
): Exercise | null {
  // Currently only Chinese has dialogue data
  if (language !== 'chinese') return null;

  const available = chineseDialogues.filter(d => !seenSet.has(d.id));
  const pool = available.length > 0 ? available : chineseDialogues;

  if (pool.length === 0) return null;

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
    question: `${dialogue.title} (${dialogue.titleChinese})`,
    instruction: 'Read through the dialogue. Tap lines to reveal them one by one.',
    data,
    createdAt: Date.now(),
  };
}
