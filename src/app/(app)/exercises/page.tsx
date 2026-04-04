'use client';

import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProgress } from '@/hooks/use-progress';
import { ExerciseShell } from '@/components/exercises/exercise-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TopicReview } from '@/components/exercises/topic-review';
import { DialogueBrowser } from '@/components/exercises/dialogue-browser';
import { KanaPractice } from '@/components/exercises/kana-practice';
import { getOfflineExercise, isOfflineExerciseType } from '@/lib/exercises/offline';
import lessonsData from '@/data/chinese/lessons.json';
import { irodoriLevels, irodoriLessonIndex, irodoriLessonTitles } from '@/data/japanese/irodori-vocab';
import type { Exercise, ExerciseType, ExerciseResult } from '@/types';

const EXERCISE_TYPES: { type: ExerciseType; label: string; description: string; offline: boolean }[] = [
  { type: 'multiple-choice', label: 'Multiple Choice', description: 'Choose the correct answer', offline: true },
  { type: 'fill-in-blank', label: 'Fill in the Blank', description: 'Complete the sentence', offline: true },
  { type: 'translation', label: 'Translation', description: 'Translate between languages', offline: false },
  { type: 'sentence-construction', label: 'Sentence Building', description: 'Arrange words in order', offline: true },
  { type: 'character-recognition', label: 'Character Recognition', description: 'Identify character meanings', offline: true },
  { type: 'grammar-drill', label: 'Grammar Drill', description: 'Practice grammar patterns', offline: true },
  { type: 'dialogue-reading', label: 'Dialogue Reading', description: 'Read through full conversations', offline: true },
];

export default function ExercisesPage() {
  const { language, difficulty } = useLanguage();
  const { recordActivity } = useProgress();
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
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
  const [lessonFilter, setLessonFilter] = useState<string | undefined>(undefined);

  const generateExercise = useCallback(async (type: ExerciseType, lesson?: string) => {
    setLoading(true);
    setError(null);

    try {
      if (isOfflineExerciseType(type)) {
        const exercise = getOfflineExercise(language, difficulty, type, seenIds, lesson ?? lessonFilter);
        if (!exercise) {
          throw new Error('Not enough vocabulary data for this exercise type.');
        }
        setCurrentExercise(exercise);
        setSeenIds(prev => [...prev, exercise.id].slice(-50));
        setPreviousQuestions(prev => [...prev, exercise.question].slice(-10));
      } else {
        const res = await fetch('/api/exercises/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language, difficulty, exerciseType: type, previousQuestions }),
        });
        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error || 'Failed to generate exercise');
        }

        if (!data.data || !data.data.type) {
          throw new Error('Invalid exercise data received');
        }

        const exercise: Exercise = {
          id: nanoid(),
          type,
          language,
          difficulty,
          question: data.question,
          instruction: data.instruction,
          data: data.data,
          createdAt: Date.now(),
        };

        setCurrentExercise(exercise);
        setPreviousQuestions(prev => [...prev, exercise.question].slice(-10));
      }
    } catch (err) {
      console.error('Failed to generate exercise:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate exercise. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [language, difficulty, previousQuestions, seenIds, lessonFilter]);

  const handleComplete = (result: ExerciseResult) => {
    setSessionCount(prev => prev + 1);
    if (result.correct) setCorrectCount(prev => prev + 1);
    recordActivity({
      exercises: 1,
      correctAnswers: result.correct ? 1 : 0,
      totalAnswers: 1,
    });
  };

  const handleNext = () => {
    if (currentExercise) {
      generateExercise(currentExercise.type);
    }
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

  if (showLessonPicker) {
    const startLesson = (filterKey: string) => {
      setLessonFilter(filterKey);
      setShowLessonPicker(false);
      setSessionCount(0);
      setCorrectCount(0);
      setSeenIds([]);
      generateExercise('multiple-choice', filterKey);
    };

    return (
      <div className="p-5 md:p-8 max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setShowLessonPicker(false)}>&larr; Back</Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Lesson Practice</h1>
            <p className="text-muted-foreground text-xs mt-0.5">Choose a lesson to practice with multiple choice</p>
          </div>
        </div>
        <div className="space-y-2">
          {language === 'chinese' ? (
            lessonsData.lessons.map(lesson => (
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
                        <span className="text-muted-foreground font-normal ml-1.5">{lesson.titleChinese}</span>
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{lesson.vocabulary.length} words</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">L{lesson.lesson}</Badge>
                  </div>
                </Card>
              </button>
            ))
          ) : (
            irodoriLevels.map(level => {
              const levelLessons = irodoriLessonIndex.filter(l => l.level === level);
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
                                  <span className="text-muted-foreground font-normal ml-1.5">{meta.topic}</span>
                                )}
                              </h3>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{count} words</p>
                            </div>
                            <Badge variant="outline" className="text-[10px] shrink-0">{levelLabel} L{lesson}</Badge>
                          </div>
                        </Card>
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  if (currentExercise && !loading) {
    return (
      <div className="p-5 md:p-8 max-w-xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => { setCurrentExercise(null); setLessonFilter(undefined); }}>
            &larr; Back
          </Button>
          {lessonFilter && (
            <Badge variant="outline" className="text-[10px]">
              {lessonFilter.includes('|')
                ? irodoriLessonTitles[lessonFilter]?.title ?? lessonFilter
                : lessonFilter}
            </Badge>
          )}
          {sessionCount > 0 && (
            <Badge variant={correctCount / sessionCount >= 0.7 ? 'success' : 'warning'}>
              {correctCount}/{sessionCount} correct
            </Badge>
          )}
        </div>
        <ExerciseShell
          exercise={currentExercise}
          onComplete={handleComplete}
          onNext={handleNext}
        />
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Exercises</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Practice your {language === 'chinese' ? 'Chinese' : 'Japanese'}
        </p>
      </div>

      {error && (
        <Card>
          <CardContent className="p-5 text-center space-y-3">
            <p className="text-destructive font-medium text-sm">Failed to generate exercise</p>
            <p className="text-xs text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-xs text-muted-foreground mt-3">Generating exercise...</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Study modes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setShowTopicReview(true)}
              className="text-left active:scale-[0.98] transition-all"
            >
              <Card className="p-4 hover:border-primary/40 hover:bg-primary/[0.03] transition-all border-dashed h-full">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm">Study & Review</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Review vocabulary, sentences & dialogues by topic
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5">
                    Study
                  </Badge>
                </div>
              </Card>
            </button>
            <button
              onClick={() => setShowDialogues(true)}
              className="text-left active:scale-[0.98] transition-all"
            >
              <Card className="p-4 hover:border-primary/40 hover:bg-primary/[0.03] transition-all border-dashed h-full">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm">Dialogues</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Read & listen to full conversations by topic
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5">
                    Study
                  </Badge>
                </div>
              </Card>
            </button>
            <button
              onClick={() => setShowLessonPicker(true)}
              className="text-left active:scale-[0.98] transition-all"
            >
              <Card className="p-4 hover:border-primary/40 hover:bg-primary/[0.03] transition-all border-dashed h-full">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm">Lesson Practice</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Multiple choice quizzes by lesson
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5">
                    Quiz
                  </Badge>
                </div>
              </Card>
            </button>
            {language === 'japanese' && (
              <button
                onClick={() => setShowKanaPractice(true)}
                className="text-left active:scale-[0.98] transition-all"
              >
                <Card className="p-4 hover:border-primary/40 hover:bg-primary/[0.03] transition-all border-dashed h-full">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm">Kana Practice</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Learn & quiz hiragana and katakana
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5">
                      Study
                    </Badge>
                  </div>
                </Card>
              </button>
            )}
          </div>

          {/* Exercise types */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXERCISE_TYPES.map(({ type, label, description, offline }) => (
              <button
                key={type}
                onClick={() => generateExercise(type)}
                className="text-left group active:scale-[0.98] transition-all"
              >
                <Card className="p-4 hover:border-primary/40 hover:bg-primary/[0.03] transition-all h-full">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm">{label}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5">
                      {offline ? 'Instant' : 'AI'}
                    </Badge>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        </>
      )}

      {sessionCount > 0 && !currentExercise && (
        <Card>
          <CardContent className="p-5 text-center space-y-1">
            <p className="font-semibold text-sm">Session Stats</p>
            <p className="text-xs text-muted-foreground">
              {correctCount} correct out of {sessionCount} ({Math.round((correctCount / sessionCount) * 100)}%)
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
