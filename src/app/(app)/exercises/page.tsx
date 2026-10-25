'use client';

import { useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProgress } from '@/hooks/use-progress';
import { useMistakeLog } from '@/hooks/use-mistakes';
import { useCurrentLesson } from '@/hooks/use-current-lesson';
import { ExerciseShell } from '@/components/exercises/exercise-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TopicReview } from '@/components/exercises/topic-review';
import { DialogueBrowser } from '@/components/exercises/dialogue-browser';
import { KanaPractice } from '@/components/exercises/kana-practice';
import { GrammarReference } from '@/components/exercises/grammar-reference';
import { getOfflineExercise } from '@/lib/exercises/offline';
import {
  isAiExerciseType,
  MAX_SEEN_IDS,
  requestAiExercise,
  type AiExerciseType,
} from '@/lib/exercises/ai';
import { getLanguageName, getLanguageNativeName } from '@/lib/language/utils';
import lessonsData from '@/data/chinese/lessons.json';
import {
  irodoriLevels,
  irodoriLessonIndex,
  irodoriLessonTitles,
} from '@/data/japanese/irodori-vocab';
import { cn } from '@/lib/utils';
import type { Exercise, ExerciseResult, ExerciseSource, ExerciseType, Language } from '@/types';

const EXERCISE_TYPES: {
  type: ExerciseType;
  label: string;
  description: string;
  langs?: Language[];
}[] = [
  {
    type: 'multiple-choice',
    label: 'Multiple Choice',
    description: 'Choose the correct answer',
  },
  {
    type: 'sentence-mc',
    label: 'Sentence Quiz',
    description: 'Match full sentences to meaning',
  },
  {
    type: 'dialogue-comprehension',
    label: 'Dialogue Quiz',
    description: 'Read a conversation, answer questions',
  },
  {
    type: 'fill-in-blank',
    label: 'Fill in the Blank',
    description: 'Complete the sentence',
  },
  {
    type: 'typed-recall',
    label: 'Typed Recall',
    description: 'Type the word for a meaning',
    langs: ['chinese'],
  },
  {
    type: 'translation',
    label: 'Translation',
    description: 'Translate between languages',
  },
  {
    type: 'sentence-construction',
    label: 'Sentence Building',
    description: 'Arrange words in order',
  },
  {
    type: 'character-recognition',
    label: 'Character Recognition',
    description: 'Identify character meanings',
  },
  {
    type: 'grammar-drill',
    label: 'Grammar Drill',
    description: 'Practice grammar patterns',
  },
  {
    type: 'dialogue-reading',
    label: 'Dialogue Reading',
    description: 'Read through full conversations',
  },
];

// Quiz types eligible for the mixed drill (dialogue-reading is untimed study
// material and translation needs typing, so they're left out of the mix).
const MIXED_POOL: ExerciseType[] = [
  'multiple-choice',
  'sentence-mc',
  'fill-in-blank',
  'sentence-construction',
  'character-recognition',
  'grammar-drill',
  'dialogue-comprehension',
  'typed-recall',
];

interface Supplied {
  exercise: Exercise;
  /** Written by the AI, rather than built from the book. */
  ai: boolean;
  /** Why the AI's exercise was replaced by the book's. */
  notice: string | null;
}

/** The next exercise, requested while the current one is being answered. */
interface Queued {
  /** The settings it was requested under; once they change it is stale. */
  key: string;
  type: ExerciseType;
  settled: boolean;
  promise: Promise<Supplied>;
}

function randomType(types: ExerciseType[]): ExerciseType {
  return types[Math.floor(Math.random() * types.length)];
}

export default function ExercisesPage() {
  const { language, difficulty, settings, updateSettings } = useLanguage();
  const [currentLesson] = useCurrentLesson();
  const { recordActivity } = useProgress();
  const { recordExercise } = useMistakeLog();
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [aiWritten, setAiWritten] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [mixedMode, setMixedMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [previousQuestions, setPreviousQuestions] = useState<string[]>([]);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showTopicReview, setShowTopicReview] = useState(false);
  const [showDialogues, setShowDialogues] = useState(false);
  const [showLessonPicker, setShowLessonPicker] = useState(false);
  const [showKanaPractice, setShowKanaPractice] = useState(false);
  const [showGrammar, setShowGrammar] = useState(false);
  const [lessonFilter, setLessonFilter] = useState<string | undefined>(undefined);
  const queued = useRef<Queued | null>(null);

  const availableExerciseTypes = EXERCISE_TYPES.filter(
    (t) => !t.langs || t.langs.includes(language),
  );
  const mixedPool = MIXED_POOL.filter((type) =>
    availableExerciseTypes.some((t) => t.type === type),
  );

  const chapterLabel = lessonFilter
    ? lessonFilter.includes('|')
      ? (irodoriLessonTitles[lessonFilter]?.title ?? lessonFilter)
      : lessonFilter
    : 'All chapters';

  // Chinese questions are written by the AI from the course unless the learner picks the book's.
  const source: ExerciseSource = settings.exerciseSource ?? 'ai';
  const aiSource = language === 'chinese' && source === 'ai';
  // The chosen chapter as a lesson number (Chinese chapter keys are lesson titles).
  const chapter =
    language === 'chinese' && lessonFilter
      ? lessonsData.lessons.find((l) => l.title === lessonFilter)?.lesson
      : undefined;
  const scopeKey = [language, difficulty, currentLesson, lessonFilter ?? '', source].join('|');

  /** Whether the AI writes this type: translation always (the book has none), the rest by the setting. */
  const usesAi = (type: ExerciseType): type is AiExerciseType =>
    isAiExerciseType(type) && (type === 'translation' || aiSource);

  // An exercise of `type`: the AI's when it writes this type, else the book's.
  // When the AI can't deliver, the book's stands in, with a note saying why.
  const supply = async (
    type: ExerciseType,
    seen: string[],
    recent: string[],
  ): Promise<Supplied> => {
    const book = () =>
      getOfflineExercise({ language, difficulty, type, seen, lessonFilter, currentLesson });
    if (usesAi(type)) {
      try {
        const exercise = await requestAiExercise(
          language === 'chinese'
            ? {
                language,
                difficulty,
                exerciseType: type,
                lesson: currentLesson,
                chapter,
                seen: seen.slice(-MAX_SEEN_IDS),
              }
            : { language, difficulty, exerciseType: 'translation', previousQuestions: recent },
        );
        return { exercise, ai: true, notice: null };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'The AI could not write an exercise.';
        const exercise = type === 'translation' ? null : book();
        if (!exercise) throw new Error(message);
        return { exercise, ai: false, notice: `${message} This one is from the book.` };
      }
    }
    const exercise = book();
    if (!exercise) {
      throw new Error(
        lessonFilter
          ? 'No exercises of this type are available for the selected chapter. Try another type or pick a different chapter.'
          : 'Not enough vocabulary data for this exercise type.',
      );
    }
    return { exercise, ai: false, notice: null };
  };

  const present = (supplied: Supplied, mixed: boolean) => {
    const { exercise } = supplied;
    const seen = [...seenIds, exercise.sourceId ?? exercise.id];
    const recent = [...previousQuestions, exercise.question].slice(-10);
    setCurrentExercise(exercise);
    setAiWritten(supplied.ai);
    setNotice(supplied.notice);
    setSeenIds(seen);
    setPreviousQuestions(recent);

    // Have the next exercise ready by the time this one is answered.
    const nextType = mixed ? randomType(mixedPool) : exercise.type;
    const next: Queued = {
      key: scopeKey,
      type: nextType,
      settled: false,
      promise: supply(nextType, seen, recent),
    };
    const settle = () => {
      next.settled = true;
    };
    next.promise.then(settle, settle);
    queued.current = next;
  };

  /**
   * Show an exercise of `type`, or of a random type for the mixed drill
   * (`null`): the one queued while the last was answered when it still fits,
   * otherwise a fresh one. Mixed drill types that can't produce an exercise for
   * the current scope are skipped.
   */
  const run = async (type: ExerciseType | null) => {
    const mixed = type === null;
    const ready = queued.current;
    queued.current = null;
    const usable = ready && ready.key === scopeKey && (mixed || ready.type === type) ? ready : null;

    setError(null);
    setMixedMode(mixed);
    if (usable ? !usable.settled : mixed ? aiSource : usesAi(type)) setLoading(true);
    try {
      const supplied = usable && (await usable.promise.catch(() => null));
      if (supplied) {
        present(supplied, mixed);
        return;
      }
      const types = mixed ? [...mixedPool].sort(() => Math.random() - 0.5) : [type];
      let failure: unknown = null;
      for (const candidate of types) {
        try {
          present(await supply(candidate, seenIds, previousQuestions), mixed);
          return;
        } catch (err) {
          failure = err;
        }
      }
      throw mixed
        ? new Error('No exercises are available for the selected chapter. Try a different chapter.')
        : failure;
    } catch (err) {
      console.error('Failed to get an exercise:', err);
      setCurrentExercise(null);
      setError(
        err instanceof Error ? err.message : 'Failed to generate exercise. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = (result: ExerciseResult) => {
    setSessionCount((prev) => prev + 1);
    if (result.correct) setCorrectCount((prev) => prev + 1);
    recordActivity({
      exercises: 1,
      correctAnswers: result.correct ? 1 : 0,
      totalAnswers: 1,
    });
    if (currentExercise) {
      recordExercise(currentExercise, result.correct, 'practice', result.userAnswer);
    }
  };

  const handleNext = () => {
    if (!currentExercise) return;
    void run(mixedMode ? null : currentExercise.type);
  };

  if (showTopicReview) {
    return <TopicReview language={language} onBack={() => setShowTopicReview(false)} />;
  }

  if (showDialogues) {
    return <DialogueBrowser language={language} onBack={() => setShowDialogues(false)} />;
  }

  if (showKanaPractice) {
    return <KanaPractice onBack={() => setShowKanaPractice(false)} />;
  }

  if (showGrammar) {
    return <GrammarReference onBack={() => setShowGrammar(false)} />;
  }

  if (showLessonPicker) {
    // Selecting a chapter scopes every exercise type to it; the user then picks
    // which exercise to run from the main grid.
    const startLesson = (filterKey: string) => {
      setLessonFilter(filterKey);
      setShowLessonPicker(false);
      setSessionCount(0);
      setCorrectCount(0);
      setSeenIds([]);
    };

    return (
      <div className="p-5 md:p-8 max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setShowLessonPicker(false)}>
            &larr; Back
          </Button>
          <div>
            <div className="greet" style={{ marginBottom: 4 }}>
              {language === 'japanese' ? '課を選ぶ' : '选课'} · choose a lesson
            </div>
            <h1 style={{ fontSize: 30 }}>
              Lessons<span className="cjk"> · {language === 'japanese' ? '課' : '课'}</span>
            </h1>
          </div>
        </div>
        <div className="space-y-2">
          {language === 'chinese'
            ? lessonsData.lessons.map((lesson) => (
                <button
                  key={lesson.lesson}
                  onClick={() => startLesson(lesson.title)}
                  className="w-full text-left"
                >
                  <Card className="p-3.5 hover:border-primary/40 hover:bg-primary/[0.03] transition-all">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate">
                          {lesson.title}
                          <span className="text-muted-foreground font-normal ml-1.5">
                            {lesson.titleChinese}
                          </span>
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {lesson.vocabulary.length} words
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        L{lesson.lesson}
                      </Badge>
                    </div>
                  </Card>
                </button>
              ))
            : irodoriLevels.map((level) => {
                const levelLessons = irodoriLessonIndex.filter((l) => l.level === level);
                const levelLabel = level.replace('Irodori ', '');
                return (
                  <div key={level} className="space-y-2">
                    <h2 className="text-sm font-semibold text-muted-foreground pt-2">{level}</h2>
                    {levelLessons.map(({ lesson, count }) => {
                      const key = `${level}|${lesson}`;
                      const meta = irodoriLessonTitles[key];
                      return (
                        <button
                          key={key}
                          onClick={() => startLesson(key)}
                          className="w-full text-left"
                        >
                          <Card className="p-3.5 hover:border-primary/40 hover:bg-primary/[0.03] transition-all">
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="font-semibold text-sm truncate">
                                  {meta?.title || `Lesson ${lesson}`}
                                  {meta?.topic && (
                                    <span className="text-muted-foreground font-normal ml-1.5">
                                      {meta.topic}
                                    </span>
                                  )}
                                </h3>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  {count} words
                                </p>
                              </div>
                              <Badge variant="outline" className="text-[10px] shrink-0">
                                {levelLabel} L{lesson}
                              </Badge>
                            </div>
                          </Card>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
        </div>
      </div>
    );
  }

  if (currentExercise && !loading) {
    return (
      <div className="p-5 md:p-8 max-w-xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setCurrentExercise(null)}>
            &larr; Back
          </Button>
          <div className="flex items-center gap-2">
            {aiWritten && language === 'chinese' && (
              <span
                className="text-[10px] tracking-[0.15em] px-2 py-1 border border-primary/40 text-primary"
                title="Written by the AI from your lessons"
              >
                AI
              </span>
            )}
            {lessonFilter && (
              <span className="text-[10px] tracking-[0.15em] px-2 py-1 border border-border text-muted-foreground">
                {lessonFilter.includes('|')
                  ? (irodoriLessonTitles[lessonFilter]?.title ?? lessonFilter)
                  : lessonFilter}
              </span>
            )}
            {sessionCount > 0 && (
              <span
                className="text-[10px] tracking-[0.15em] px-2 py-1 border font-display font-bold"
                style={{
                  borderColor:
                    correctCount / sessionCount >= 0.7 ? 'var(--neon-lime)' : 'var(--neon-amber)',
                  color:
                    correctCount / sessionCount >= 0.7 ? 'var(--neon-lime)' : 'var(--neon-amber)',
                }}
              >
                {correctCount}/{sessionCount}
              </span>
            )}
          </div>
        </div>
        {notice && <p className="text-[11px] text-muted-foreground leading-relaxed">{notice}</p>}
        <Panel>
          <div className="p-1">
            <ExerciseShell
              exercise={currentExercise}
              onComplete={handleComplete}
              onNext={handleNext}
            />
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 max-w-xl mx-auto space-y-6">
      {/* Page header */}
      <div className="page-top">
        <div>
          <div className="greet">
            {language === 'japanese' ? '手を動かす' : '动手练'} · practice
          </div>
          <h1>
            Practice<span className="cjk"> · {language === 'japanese' ? '練習' : '练习'}</span>
          </h1>
        </div>
        <div className="date">
          {getLanguageNativeName(language)}
          <b>{getLanguageName(language)}</b>
          drills &amp; quizzes
        </div>
      </div>

      {error && (
        <Panel glow="amber">
          <div className="p-5 text-center space-y-3">
            <p className="text-destructive font-medium text-sm tracking-[0.1em]">
              Something went wrong
            </p>
            <p className="text-xs text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={() => setError(null)}>
              DISMISS
            </Button>
          </div>
        </Panel>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-xs mt-3 tracking-[0.2em]" style={{ color: 'var(--ink-soft)' }}>
            {aiSource ? 'Writing an exercise from your lessons…' : 'Preparing your exercise…'}
          </p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Study modes */}
          <Panel tag="STUDY·MODES" meta="SELECT">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <StudyModeButton
                label="Study & Review"
                desc="Vocabulary, sentences & dialogues"
                badge="STUDY"
                onClick={() => setShowTopicReview(true)}
              />
              <StudyModeButton
                label="Dialogues"
                desc="Full conversations by topic"
                badge="STUDY"
                onClick={() => setShowDialogues(true)}
              />
              <StudyModeButton
                label="Pick a Chapter"
                desc="Scope all exercises to one lesson"
                badge="QUIZ"
                onClick={() => setShowLessonPicker(true)}
              />
              {language === 'chinese' && (
                <StudyModeButton
                  label="Grammar Patterns"
                  desc="Rules & example sentences"
                  badge="REF"
                  onClick={() => setShowGrammar(true)}
                />
              )}
              {language === 'japanese' && (
                <StudyModeButton
                  label="Kana Practice"
                  desc="Hiragana & katakana drill"
                  badge="STUDY"
                  onClick={() => setShowKanaPractice(true)}
                />
              )}
            </div>
          </Panel>

          {/* Exercise types */}
          <Panel tag="EXERCISE·TYPES" meta={`${availableExerciseTypes.length} AVAIL`}>
            {/* Chapter scope — applies to every exercise type below */}
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border/50">
              <div className="text-[10px] tracking-[0.15em] text-muted-foreground min-w-0 truncate">
                CHAPTER: <span className="text-primary">{chapterLabel}</span>
              </div>
              <div className="flex gap-1.5 shrink-0">
                {lessonFilter && (
                  <button
                    onClick={() => setLessonFilter(undefined)}
                    className="text-[9px] tracking-[0.15em] px-1.5 py-0.5 border border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    ✕ ALL
                  </button>
                )}
                <button
                  onClick={() => setShowLessonPicker(true)}
                  className="text-[9px] tracking-[0.15em] px-1.5 py-0.5 border border-primary/40 text-primary hover:bg-primary/[0.06] transition-colors"
                >
                  CHANGE
                </button>
              </div>
            </div>
            {/* Question source — Chinese questions come from the AI or the book */}
            {language === 'chinese' && (
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border/50">
                <div className="text-[10px] tracking-[0.15em] text-muted-foreground min-w-0">
                  QUESTIONS:{' '}
                  <span className="text-primary">
                    {aiSource ? 'AI, from your lessons' : 'From the book'}
                  </span>
                </div>
                <div className="flex gap-1.5 shrink-0" role="group" aria-label="Question source">
                  {(['ai', 'book'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={source === option}
                      onClick={() => updateSettings({ exerciseSource: option })}
                      className={cn(
                        'text-[9px] tracking-[0.15em] px-1.5 py-0.5 border transition-colors',
                        source === option
                          ? 'border-primary/40 text-primary bg-primary/[0.06]'
                          : 'border-border text-muted-foreground hover:border-primary/40 hover:text-primary',
                      )}
                    >
                      <span>{option === 'ai' ? 'AI' : 'BOOK'}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Mixed drill — random mix of all quiz types */}
            <button
              onClick={() => void run(null)}
              className="w-full text-left px-4 py-3.5 border-b border-border/50 transition-colors hover:bg-primary/[0.06] active:scale-[0.99] bg-primary/[0.03]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <h3 className="font-medium text-xs tracking-[0.05em] uppercase text-primary">
                    ▶ Mixed Drill
                  </h3>
                  <p className="text-[10px] text-muted-foreground tracking-[0.03em]">
                    Continuous session — a random exercise type every round
                  </p>
                </div>
                <span className="text-[9px] tracking-[0.15em] px-1.5 py-0.5 border border-primary/40 text-primary shrink-0 mt-0.5">
                  MIX
                </span>
              </div>
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {availableExerciseTypes.map(({ type, label, description }) => (
                <button
                  key={type}
                  onClick={() => void run(type)}
                  className="text-left px-4 py-3.5 border-b border-r border-border/50 [&:nth-child(2n)]:border-r-0 last:border-b-0 [&:nth-last-child(2):nth-child(odd)]:border-b-0 transition-colors hover:bg-primary/[0.06] active:scale-[0.98]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <h3 className="font-medium text-xs tracking-[0.05em] uppercase">{label}</h3>
                      <p className="text-[10px] text-muted-foreground tracking-[0.03em]">
                        {description}
                      </p>
                    </div>
                    <span className="text-[9px] tracking-[0.15em] px-1.5 py-0.5 border border-border text-muted-foreground shrink-0 mt-0.5">
                      {usesAi(type) ? 'AI' : 'INSTANT'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </Panel>
        </>
      )}

      {sessionCount > 0 && !currentExercise && (
        <Panel tag="SESSION·STATS">
          <div className="p-5 text-center space-y-1">
            <p className="font-display text-lg font-bold" style={{ color: 'var(--neon-cyan)' }}>
              {correctCount}/{sessionCount}
            </p>
            <p className="text-[10px] text-muted-foreground tracking-[0.15em]">
              {Math.round((correctCount / sessionCount) * 100)}% ACCURACY
            </p>
          </div>
        </Panel>
      )}
    </div>
  );
}

function StudyModeButton({
  label,
  desc,
  badge,
  onClick,
}: {
  label: string;
  desc: string;
  badge: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left px-4 py-3.5 border-b border-r border-border/50 [&:nth-child(2n)]:border-r-0 last:border-b-0 transition-colors hover:bg-primary/[0.06] active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <h3 className="font-medium text-xs tracking-[0.05em] uppercase">{label}</h3>
          <p className="text-[10px] text-muted-foreground tracking-[0.03em]">{desc}</p>
        </div>
        <span className="text-[9px] tracking-[0.15em] px-1.5 py-0.5 border border-dashed border-border text-muted-foreground shrink-0 mt-0.5">
          {badge}
        </span>
      </div>
    </button>
  );
}
