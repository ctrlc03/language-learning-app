'use client';

import { useState } from 'react';
import { useSpeechCapture } from '@/hooks/use-speech-capture';
import type { AnswerItem } from '@/lib/speaking/items';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CaptureProblem,
  ListenButton,
  MicControl,
  Recording,
  SelfRate,
  Sentence,
  SkipRecording,
  Transcript,
} from '@/components/speaking/speaking-ui';

/** Part 2 · 听后回答: hear a question, answer it aloud in one short sentence. */
export function AnswerCard({
  item,
  isLast,
  onDone,
}: {
  item: AnswerItem;
  isLast: boolean;
  /** The learner moved on; `correct` is their own rating. */
  onDone: (correct: boolean) => void;
}) {
  const capture = useSpeechCapture();
  const { result, state, supported } = capture;
  const [showText, setShowText] = useState(false);
  // Without a microphone: the learner answers aloud, then asks for the model answer.
  const [answered, setAnswered] = useState(false);
  const [rating, setRating] = useState<boolean | null>(null);

  const revealed = state === 'done' || answered;
  // Once a start has failed (blocked or missing microphone) fall back to answering aloud.
  const micOk = supported.any && !(state === 'idle' && capture.problem);
  const skip = () => {
    capture.reset();
    setAnswered(true);
  };

  const tryAgain = () => {
    capture.reset();
    setAnswered(false);
    setRating(null);
  };

  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Part 2 · <span className="cjk">听后回答</span> · Listen and answer
          </p>
          <p className="mt-1 text-sm">Listen to the question, then answer in one short sentence.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ListenButton text={item.question} label="Listen to the question" />
          {!revealed && (
            <Button type="button" variant="ghost" onClick={() => setShowText((v) => !v)}>
              <span>{showText ? 'Hide text' : 'Show text'}</span>
            </Button>
          )}
        </div>

        {showText && !revealed && (
          <Sentence label="Question" text={item.question} english={item.questionEnglish} />
        )}

        {!revealed && micOk && (
          <div className="flex flex-wrap items-start gap-3">
            <MicControl
              state={state}
              interim={capture.interim}
              onStart={() => void capture.start()}
              onStop={capture.stop}
              idleLabel="Answer"
            />
            <SkipRecording onSkip={skip} />
          </div>
        )}
        {!revealed && !micOk && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {supported.any
                ? "The microphone isn't working right now. Answer aloud, then compare with the model answer."
                : 'No microphone is available here. Answer aloud, then compare with the model answer.'}
            </p>
            <Button type="button" variant="primary" size="lg" onClick={() => setAnswered(true)}>
              <span>I&apos;ve answered — show the model answer</span>
            </Button>
          </div>
        )}
        <CaptureProblem problem={capture.problem} />

        {revealed && (
          <div className="space-y-4">
            {result && supported.recognition && <Transcript text={result.transcript} />}
            <Recording url={result?.audioUrl ?? null} modelText={item.answer} />

            <Sentence label="Question" text={item.question} english={item.questionEnglish} />
            <Sentence
              label="Model answer"
              text={item.answer}
              pinyin={item.answerPinyin}
              english={item.answerEnglish}
            />
            {item.hint && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Hint: </span>
                {item.hint}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Other answers can be right too. Check that yours fits the question.
            </p>

            <SelfRate
              value={rating}
              onChange={setRating}
              question="How did your answer go?"
              yes="I answered well"
            />
            {supported.any && (
              <Button type="button" variant="ghost" size="sm" onClick={tryAgain}>
                <span>Try again</span>
              </Button>
            )}
          </div>
        )}

        <div className="text-center">
          <Button
            type="button"
            variant="outline"
            disabled={!revealed || rating === null}
            onClick={() => onDone(rating === true)}
          >
            <span>{isLast ? 'Finish' : 'Next'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
