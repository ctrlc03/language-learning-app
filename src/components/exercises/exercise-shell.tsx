'use client';

import { useState, useEffect } from 'react';
import type { Exercise, ExerciseResult, Language } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SpeakButton } from '@/components/shared/speak-button';
import { MultipleChoice } from './multiple-choice';
import { SentenceMC } from './sentence-mc';
import { FillInBlank } from './fill-in-blank';
import { TranslationExercise } from './translation';
import { SentenceConstruction } from './sentence-construction';
import { CharacterRecognition } from './character-recognition';
import { GrammarDrill } from './grammar-drill';
import { DialogueReading } from './dialogue-reading';
import { DialogueComprehension } from './dialogue-comprehension';
import { speak, stopSpeaking } from '@/lib/tts/speech';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface ExerciseShellProps {
  exercise: Exercise;
  onComplete: (result: ExerciseResult) => void;
  onNext: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  'multiple-choice': 'Multiple Choice',
  'sentence-mc': 'Sentence Quiz',
  'fill-in-blank': 'Fill in the Blank',
  translation: 'Translation',
  'sentence-construction': 'Sentence Building',
  'character-recognition': 'Character Recognition',
  'grammar-drill': 'Grammar Drill',
  'dialogue-reading': 'Dialogue Reading',
  'dialogue-comprehension': 'Dialogue Quiz',
};

// The target-language text to pronounce once an exercise is answered, so the
// learner ties sound to characters on every rep. Null = nothing to speak.
function getAnswerSpeech(exercise: Exercise): string | null {
  const data = exercise.data;
  switch (data.type) {
    case 'sentence-mc':
      return data.sentence;
    case 'fill-in-blank':
    case 'grammar-drill':
      return data.sentence.includes('___') ? data.sentence.replace('___', data.answer) : null;
    case 'sentence-construction':
      return data.correctOrder;
    case 'character-recognition':
      return data.character;
    default:
      return null;
  }
}

// The target-language text worth speaking from the header, or null. Only the
// translation prompt qualifies: its sourceText is target-language when
// translating out of Chinese/Japanese. The other types either keep their
// prompt in English (spoken with a Chinese voice it would be gibberish), or
// already carry their own speaker beside the target text, or would have the
// speech give the answer away.
function getPromptSpeech(exercise: Exercise): { text: string; language: Language } | null {
  const data = exercise.data;
  if (data.type === 'translation' && data.sourceLanguage !== 'english') {
    return { text: data.sourceText, language: data.sourceLanguage };
  }
  return null;
}

export function ExerciseShell({ exercise, onComplete, onNext }: ExerciseShellProps) {
  const { speechRate } = useLanguage();
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evalFailure, setEvalFailure] = useState<{ message: string; answer: string } | null>(null);

  useEffect(() => {
    setResult(null);
    setEvaluating(false);
    setEvalFailure(null);
    // Cut off any still-playing pronunciation from the previous exercise
    stopSpeaking();
  }, [exercise.id]);

  const handleSubmit = async (answer: string, isCorrect?: boolean) => {
    setEvaluating(true);
    setEvalFailure(null);

    let correct = isCorrect;
    let feedback = '';

    if (correct === undefined) {
      // A failed evaluation says nothing about the answer: surface the error
      // and let the learner retry instead of recording a wrong answer.
      const fail = (message: string) => {
        setEvalFailure({ message, answer });
        setEvaluating(false);
      };
      try {
        const res = await fetch('/api/exercises/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: exercise.language,
            difficulty: exercise.difficulty,
            exercise: {
              question: exercise.question,
              instruction: exercise.instruction,
              data: exercise.data,
            },
            userAnswer: answer,
          }),
        });
        const evaluation = await res.json().catch(() => null);
        if (!res.ok) {
          fail(
            typeof evaluation?.error === 'string' && evaluation.error
              ? evaluation.error
              : 'Could not evaluate your answer. Please try again.',
          );
          return;
        }
        if (typeof evaluation?.correct !== 'boolean') {
          fail('The evaluation came back unreadable. Please try again.');
          return;
        }
        correct = evaluation.correct;
        feedback = typeof evaluation.feedback === 'string' ? evaluation.feedback : '';
      } catch {
        fail('Could not reach the server. Check your connection and try again.');
        return;
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

    // Pronounce the correct sentence/word after answering
    const speech = getAnswerSpeech(exercise);
    if (speech) {
      speak(speech, exercise.language, speechRate).catch(() => {
        /* TTS unavailable */
      });
    }
  };

  const renderExercise = () => {
    if (!exercise.data?.type) {
      return <p className="text-destructive text-sm">Invalid exercise data. Please try again.</p>;
    }
    switch (exercise.data.type) {
      case 'multiple-choice':
        return <MultipleChoice data={exercise.data} onSubmit={handleSubmit} disabled={!!result} />;
      case 'sentence-mc':
        return <SentenceMC data={exercise.data} onSubmit={handleSubmit} disabled={!!result} />;
      case 'fill-in-blank':
        return <FillInBlank data={exercise.data} onSubmit={handleSubmit} disabled={!!result} />;
      case 'translation':
        return (
          <TranslationExercise data={exercise.data} onSubmit={handleSubmit} disabled={!!result} />
        );
      case 'sentence-construction':
        return (
          <SentenceConstruction data={exercise.data} onSubmit={handleSubmit} disabled={!!result} />
        );
      case 'character-recognition':
        return (
          <CharacterRecognition data={exercise.data} onSubmit={handleSubmit} disabled={!!result} />
        );
      case 'grammar-drill':
        return <GrammarDrill data={exercise.data} onSubmit={handleSubmit} disabled={!!result} />;
      case 'dialogue-reading':
        return <DialogueReading data={exercise.data} onSubmit={handleSubmit} disabled={!!result} />;
      case 'dialogue-comprehension':
        return (
          <DialogueComprehension data={exercise.data} onSubmit={handleSubmit} disabled={!!result} />
        );
      default:
        return <p className="text-sm">Unknown exercise type</p>;
    }
  };

  const promptSpeech = getPromptSpeech(exercise);

  return (
    <Card>
      <CardContent className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-[11px]">
            {TYPE_LABELS[exercise.type] ?? exercise.type}
          </Badge>
          {promptSpeech && (
            <SpeakButton text={promptSpeech.text} language={promptSpeech.language} />
          )}
        </div>

        {/* Question */}
        <div className="space-y-1.5">
          <p className="text-lg font-semibold leading-snug">{exercise.question}</p>
          <p className="text-xs text-muted-foreground whitespace-pre-line">
            {exercise.instruction}
          </p>
        </div>

        {/* Exercise body */}
        <div key={exercise.id}>{renderExercise()}</div>

        {/* Evaluating spinner */}
        {evaluating && (
          <div className="flex items-center gap-2 py-2">
            <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
            <p className="text-xs text-muted-foreground">Evaluating...</p>
          </div>
        )}

        {/* Evaluation failure: not a wrong answer, so offer a retry */}
        {evalFailure && !evaluating && (
          <div className="px-4 py-3 rounded-lg text-sm bg-destructive/10 text-destructive space-y-2">
            <p className="text-[13px]">{evalFailure.message}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleSubmit(evalFailure.answer)}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Result feedback */}
        {result && (
          <div
            className={cn(
              'px-4 py-3 rounded-lg text-sm',
              result.correct ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive',
            )}
          >
            <p className="font-semibold text-[13px]">
              {result.correct ? 'Correct!' : 'Not quite right'}
            </p>
            {result.feedback && (
              <p className="mt-1 text-xs text-foreground/70 whitespace-pre-line">
                {result.feedback}
              </p>
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
