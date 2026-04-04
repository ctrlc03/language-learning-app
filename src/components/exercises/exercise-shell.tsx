'use client';

import { useState, useEffect } from 'react';
import type { Exercise, ExerciseResult } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SpeakButton } from '@/components/shared/speak-button';
import { MultipleChoice } from './multiple-choice';
import { FillInBlank } from './fill-in-blank';
import { TranslationExercise } from './translation';
import { SentenceConstruction } from './sentence-construction';
import { CharacterRecognition } from './character-recognition';
import { GrammarDrill } from './grammar-drill';
import { DialogueReading } from './dialogue-reading';
import { cn } from '@/lib/utils';

interface ExerciseShellProps {
  exercise: Exercise;
  onComplete: (result: ExerciseResult) => void;
  onNext: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  'multiple-choice': 'Multiple Choice',
  'fill-in-blank': 'Fill in the Blank',
  'translation': 'Translation',
  'sentence-construction': 'Sentence Building',
  'character-recognition': 'Character Recognition',
  'grammar-drill': 'Grammar Drill',
  'dialogue-reading': 'Dialogue Reading',
};

export function ExerciseShell({ exercise, onComplete, onNext }: ExerciseShellProps) {
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    setResult(null);
    setEvaluating(false);
  }, [exercise.id]);

  const handleSubmit = async (answer: string, isCorrect?: boolean) => {
    setEvaluating(true);

    let correct = isCorrect;
    let feedback = '';

    if (correct === undefined) {
      try {
        const res = await fetch('/api/exercises/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: exercise.language,
            difficulty: exercise.difficulty,
            exercise: { question: exercise.question, instruction: exercise.instruction, data: exercise.data },
            userAnswer: answer,
          }),
        });
        const evaluation = await res.json();
        correct = evaluation.correct;
        feedback = evaluation.feedback;
      } catch {
        correct = false;
        feedback = 'Could not evaluate. Please try again.';
      }
    }

    const exerciseResult: ExerciseResult = {
      exerciseId: exercise.id,
      exerciseType: exercise.type,
      correct: correct ?? false,
      userAnswer: answer,
      feedback,
      completedAt: Date.now(),
    };

    setResult(exerciseResult);
    setEvaluating(false);
    onComplete(exerciseResult);
  };

  const renderExercise = () => {
    if (!exercise.data?.type) {
      return <p className="text-destructive text-sm">Invalid exercise data. Please try again.</p>;
    }
    switch (exercise.data.type) {
      case 'multiple-choice':
        return <MultipleChoice data={exercise.data} onSubmit={handleSubmit} disabled={!!result} />;
      case 'fill-in-blank':
        return <FillInBlank data={exercise.data} onSubmit={handleSubmit} disabled={!!result} />;
      case 'translation':
        return <TranslationExercise data={exercise.data} onSubmit={handleSubmit} disabled={!!result} />;
      case 'sentence-construction':
        return <SentenceConstruction data={exercise.data} onSubmit={handleSubmit} disabled={!!result} />;
      case 'character-recognition':
        return <CharacterRecognition data={exercise.data} onSubmit={handleSubmit} disabled={!!result} />;
      case 'grammar-drill':
        return <GrammarDrill data={exercise.data} onSubmit={handleSubmit} disabled={!!result} />;
      case 'dialogue-reading':
        return <DialogueReading data={exercise.data} onSubmit={handleSubmit} disabled={!!result} />;
      default:
        return <p className="text-sm">Unknown exercise type</p>;
    }
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-[11px]">
            {TYPE_LABELS[exercise.type] ?? exercise.type}
          </Badge>
          <SpeakButton text={exercise.question} />
        </div>

        {/* Question */}
        <div className="space-y-1.5">
          <p className="text-lg font-semibold leading-snug">{exercise.question}</p>
          <p className="text-xs text-muted-foreground">{exercise.instruction}</p>
        </div>

        {/* Exercise body */}
        <div key={exercise.id}>
          {renderExercise()}
        </div>

        {/* Evaluating spinner */}
        {evaluating && (
          <div className="flex items-center gap-2 py-2">
            <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
            <p className="text-xs text-muted-foreground">Evaluating...</p>
          </div>
        )}

        {/* Result feedback */}
        {result && (
          <div className={cn(
            'px-4 py-3 rounded-lg text-sm',
            result.correct
              ? 'bg-success/10 text-success'
              : 'bg-destructive/10 text-destructive'
          )}>
            <p className="font-semibold text-[13px]">
              {result.correct ? 'Correct!' : 'Not quite right'}
            </p>
            {result.feedback && (
              <p className="mt-1 text-xs text-foreground/70 whitespace-pre-line">{result.feedback}</p>
            )}
          </div>
        )}

        {/* Next button */}
        {result && (
          <Button onClick={onNext} className="w-full" size="lg">
            Next Exercise
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
