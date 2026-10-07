/**
 * 错题本, the mistake notebook. Every exercise or self-check question the learner
 * misses is kept, keyed by what it was built from, until they answer it right
 * MASTERED_STREAK times in a row (anywhere in the app: a later Practice item
 * built from the same word counts). A new miss reopens it.
 *
 * One record per item (`langbot:mistake:<id>`) with a numeric `updatedAt`, so a
 * backup merges record by record. A mastered record is kept with `masteredAt`
 * rather than deleted, so importing an older backup can't bring it back.
 */

import type { Exercise, Language, StorageAdapter } from '@/types';
import type { SelfCheckItem } from '@/lib/selfcheck/parse';
import { StorageKeys, StoragePrefixes } from '@/lib/storage/interface';

/** Where the miss happened. */
export type MistakeSource = 'practice' | 'session' | 'learn' | 'lesson' | 'reader';

export const SOURCE_LABELS: Record<MistakeSource, string> = {
  practice: 'Practice',
  session: 'Session',
  learn: 'Learn',
  lesson: 'Lesson',
  reader: 'Reader',
};

export type MistakeSubject =
  /** A snapshot of the exercise, replayed as-is on retry. */
  | { kind: 'exercise'; exercise: Exercise }
  /** A lesson self-check question, looked up by id on retry. */
  | { kind: 'selfcheck'; itemId: string };

export interface Mistake {
  id: string;
  language: Language;
  subject: MistakeSubject;
  source: MistakeSource;
  /** What was asked, in short: the word, sentence or question. */
  prompt: string;
  /** The right answer. */
  answer: string;
  answerPinyin?: string;
  /** Why, when the source explains it. */
  note?: string;
  /** What the learner answered the last time they missed it. */
  lastAnswer?: string;
  misses: number;
  /** Right answers in a row since the last miss. */
  streak: number;
  createdAt: number;
  updatedAt: number;
  lastSeen: number;
  /** Set once answered right MASTERED_STREAK times in a row; cleared by a new miss. */
  masteredAt?: number;
}

export const MASTERED_STREAK = 2;

type MistakeText = Pick<Mistake, 'prompt' | 'answer' | 'answerPinyin' | 'note'>;

export function exerciseMistakeId(exercise: Exercise): string {
  return `ex:${exercise.type}:${exercise.sourceId ?? exercise.id}`;
}

/** The self-check id (`sc:<lesson>:<index>`) is already stable and prefixed. */
export function selfCheckMistakeId(item: SelfCheckItem): string {
  return item.id;
}

/** Prompt and answer of an exercise, for the notebook. */
export function describeExercise(exercise: Exercise): MistakeText {
  const data = exercise.data;
  switch (data.type) {
    case 'multiple-choice':
      return {
        prompt: exercise.question,
        answer: data.options[data.correctIndex],
        note: data.explanation || undefined,
      };
    case 'sentence-mc':
      return {
        prompt: data.sentence,
        answer: data.translation,
        answerPinyin: data.sentencePinyin,
        note: data.explanation,
      };
    case 'fill-in-blank':
      return {
        prompt: data.sentence,
        answer: data.answer,
        answerPinyin:
          data.correctIndex !== undefined
            ? (data.optionReadings?.[data.correctIndex] ?? undefined)
            : undefined,
        note: data.translation,
      };
    case 'grammar-drill':
      return {
        prompt: data.sentence,
        answer: data.answer,
        answerPinyin:
          data.correctIndex !== undefined
            ? (data.optionReadings?.[data.correctIndex] ?? undefined)
            : undefined,
        note: data.explanation || data.translation,
      };
    case 'sentence-construction':
      return {
        prompt: data.translation,
        answer: data.correctOrder,
        answerPinyin: data.correctPinyin,
      };
    case 'character-recognition':
      return { prompt: data.character, answer: data.meaning, answerPinyin: data.reading };
    case 'dialogue-comprehension':
      return {
        prompt: data.question,
        answer: data.options[data.correctIndex],
        note: data.explanation ?? data.title,
      };
    case 'translation':
      return { prompt: data.sourceText, answer: data.sampleAnswer };
    case 'dialogue-reading':
      return { prompt: data.title, answer: data.setting };
    case 'typed-recall':
      return {
        prompt: data.prompt,
        answer: data.answers[0],
        answerPinyin: data.answerPinyin,
        note: data.note,
      };
  }
}

/** Prompt and answer of a self-check question, for the notebook. */
export function describeSelfCheck(item: SelfCheckItem): MistakeText {
  const prompt = item.sentence ? `${item.prompt} ${item.sentence}` : (item.cue ?? item.prompt);
  return {
    prompt,
    answer: item.answer ?? item.note ?? '',
    answerPinyin: item.answerPinyin,
    note: item.answer ? item.note : undefined,
  };
}

interface Draft extends MistakeText {
  language: Language;
  subject: MistakeSubject;
  source: MistakeSource;
}

async function recordResult(
  storage: StorageAdapter,
  id: string,
  correct: boolean,
  draft: () => Draft,
  userAnswer: string | undefined,
  now: number,
): Promise<void> {
  const key = StorageKeys.mistake(id);
  const prev = await storage.get<Mistake>(key);
  if (correct) {
    // A right answer only matters to an open mistake.
    if (!prev || prev.masteredAt) return;
    const streak = prev.streak + 1;
    await storage.set<Mistake>(key, {
      ...prev,
      streak,
      lastSeen: now,
      updatedAt: now,
      ...(streak >= MASTERED_STREAK ? { masteredAt: now } : {}),
    });
    return;
  }
  const record: Mistake = {
    ...draft(),
    id,
    lastAnswer: userAnswer || undefined,
    misses: (prev?.misses ?? 0) + 1,
    streak: 0,
    createdAt: prev?.createdAt ?? now,
    updatedAt: now,
    lastSeen: now,
  };
  await storage.set<Mistake>(key, record);
}

export function recordExerciseResult(
  storage: StorageAdapter,
  exercise: Exercise,
  correct: boolean,
  source: MistakeSource,
  userAnswer?: string,
  now = Date.now(),
): Promise<void> {
  // Reading a dialogue is never wrong; there is nothing to retry.
  if (exercise.type === 'dialogue-reading') return Promise.resolve();
  return recordResult(
    storage,
    exerciseMistakeId(exercise),
    correct,
    () => ({
      ...describeExercise(exercise),
      language: exercise.language,
      subject: { kind: 'exercise', exercise },
      source,
    }),
    userAnswer,
    now,
  );
}

export function recordSelfCheckResult(
  storage: StorageAdapter,
  item: SelfCheckItem,
  correct: boolean,
  source: MistakeSource,
  userAnswer?: string,
  now = Date.now(),
): Promise<void> {
  return recordResult(
    storage,
    selfCheckMistakeId(item),
    correct,
    () => ({
      ...describeSelfCheck(item),
      language: 'chinese',
      subject: { kind: 'selfcheck', itemId: item.id },
      source,
    }),
    userAnswer,
    now,
  );
}

/** Every record for a language, open and mastered. */
export async function loadMistakes(
  storage: StorageAdapter,
  language: Language,
): Promise<Mistake[]> {
  const all = await storage.getAll<Mistake>(StoragePrefixes.mistakes);
  return all.filter((m) => m.language === language);
}

/** Take a mistake out of the notebook without retrying it (kept as mastered, see above). */
export async function dismissMistake(storage: StorageAdapter, mistake: Mistake, now = Date.now()) {
  await storage.set<Mistake>(StorageKeys.mistake(mistake.id), {
    ...mistake,
    masteredAt: now,
    updatedAt: now,
  });
}

export function isOpen(mistake: Mistake): boolean {
  return mistake.masteredAt === undefined;
}

/** Open mistakes in retry order: most missed first, then the longest unseen. */
export function retryOrder(mistakes: Mistake[]): Mistake[] {
  return mistakes.filter(isOpen).sort((a, b) => b.misses - a.misses || a.lastSeen - b.lastSeen);
}
