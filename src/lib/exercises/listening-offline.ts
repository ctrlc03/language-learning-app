/**
 * Offline listening-exercise generator — builds dictation and listen-and-choose
 * items from the static vocabulary pool (example sentences + words), so the
 * listening drill is no longer limited to a handful of hand-written prompts.
 * No API calls; deterministic for a given seed.
 *
 * Chinese draws on everything the course has taught up to the learner's current lesson;
 * Japanese keeps its difficulty levels.
 */

import { getCourseVocabulary } from '@/data/chinese/vocabulary';
import { japaneseVocabulary } from '@/data/japanese/vocabulary';
import type { Language, DifficultyLevel, VocabularyItem } from '@/types';

export interface DictationItem {
  text: string;
  hint: string;
  reading?: string;
  translation?: string;
}

export interface ListenChooseItem {
  text: string;
  question: string;
  options: string[];
  correctIndex: number;
}

function seededRandom(seed: number): () => number {
  let s = seed || 1;
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

function poolFor(
  language: Language,
  difficulty: DifficultyLevel,
  currentLesson: number,
): VocabularyItem[] {
  if (language === 'chinese') return getCourseVocabulary(currentLesson);
  // Mirrors the difficulty filtering used by the written-exercise generator.
  if (difficulty === 'beginner') {
    return japaneseVocabulary.filter((v) => v.level === 'JLPT N5' || v.level === 'Irodori Starter');
  }
  if (difficulty === 'intermediate') {
    return japaneseVocabulary.filter(
      (v) =>
        v.level === 'JLPT N5' ||
        v.level === 'JLPT N4' ||
        v.level === 'Irodori Starter' ||
        v.level === 'Irodori Elementary 1',
    );
  }
  return japaneseVocabulary;
}

/**
 * Whether a typed dictation answer matches the prompt. Width, case, spaces and punctuation
 * (full- or half-width) are ignored: 你好。 equals 你好, and "Hello, World" equals "hello world".
 */
export function dictationMatches(answer: string, expected: string): boolean {
  const normalise = (s: string) =>
    s
      .normalize('NFKC')
      .replace(/[\p{P}\p{Z}\s]/gu, '')
      .toLowerCase();
  return normalise(answer) === normalise(expected);
}

const MAX_ITEMS = 40;

/** Dictation prompts: listen and type the word/sentence. */
export function getDictationItems(
  language: Language,
  difficulty: DifficultyLevel,
  seed: number,
  currentLesson: number,
): DictationItem[] {
  const vocab = poolFor(language, difficulty, currentLesson);
  const rng = seededRandom(seed);

  const sentenceItems: DictationItem[] = vocab
    .filter((v) => v.exampleSentence && v.exampleSentence.trim().length >= 2)
    .map((v) => ({
      text: v.exampleSentence!.trim(),
      hint: v.exampleTranslation || v.meaning,
      reading: v.examplePinyin || v.reading,
      translation: v.exampleTranslation,
    }));

  const wordItems: DictationItem[] = vocab
    .filter((v) => v.word && v.word.length >= 1 && v.word.length <= 4)
    .map((v) => ({ text: v.word, hint: v.meaning, reading: v.reading, translation: v.meaning }));

  // Beginners get short words first; higher levels lead with sentences.
  const ordered =
    difficulty === 'beginner' ? [...wordItems, ...sentenceItems] : [...sentenceItems, ...wordItems];

  const seen = new Set<string>();
  const deduped = ordered.filter((i) => (seen.has(i.text) ? false : (seen.add(i.text), true)));
  return shuffle(deduped, rng).slice(0, MAX_ITEMS);
}

/** Listen-and-choose: hear a sentence/word, pick the English meaning. */
export function getListenChooseItems(
  language: Language,
  difficulty: DifficultyLevel,
  seed: number,
  currentLesson: number,
): ListenChooseItem[] {
  const vocab = poolFor(language, difficulty, currentLesson);
  const rng = seededRandom(seed);

  const sentencePool = vocab.filter((v) => v.exampleSentence && v.exampleTranslation);
  const wordPool = vocab.filter((v) => v.meaning);

  const items: ListenChooseItem[] = [];

  const build = (
    pool: VocabularyItem[],
    getText: (v: VocabularyItem) => string,
    getAnswer: (v: VocabularyItem) => string,
    distractorOf: (v: VocabularyItem) => string,
    question: string,
  ) => {
    const answers = Array.from(new Set(pool.map(getAnswer)));
    if (answers.length < 4) return;
    for (const v of pool) {
      const answer = getAnswer(v);
      const distractors = shuffle(
        answers.filter((a) => a !== answer),
        rng,
      ).slice(0, 3);
      if (distractors.length < 3) continue;
      const correctIndex = Math.floor(rng() * 4);
      const options = [...distractors];
      options.splice(correctIndex, 0, answer);
      items.push({ text: getText(v), question, options, correctIndex });
    }
  };

  build(
    sentencePool,
    (v) => v.exampleSentence!,
    (v) => v.exampleTranslation!,
    (v) => v.exampleTranslation!,
    'What does this sentence mean?',
  );
  // Word-level items broaden the pool, especially for beginners.
  build(
    wordPool,
    (v) => v.word,
    (v) => v.meaning,
    (v) => v.meaning,
    'What does this word mean?',
  );

  return shuffle(items, rng).slice(0, MAX_ITEMS);
}
