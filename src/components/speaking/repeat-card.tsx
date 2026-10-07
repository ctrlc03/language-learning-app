'use client';

import { useMemo, useState } from 'react';
import { useSpeechCapture } from '@/hooks/use-speech-capture';
import { answerCore, diffChars, gradeAnswer, type AnswerGrade } from '@/lib/language/answer';
import type { RepeatItem } from '@/lib/speaking/items';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CharDiff, verdictLabel } from '@/components/shared/answer-feedback';
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
import { cn } from '@/lib/utils';

interface Heard {
  /** The reading that came closest to the sentence. */
  text: string;
  grade: AnswerGrade;
}

/** Grade every reading recognition offered; the sentence counts as said if any is right. */
function checkRepeat(item: RepeatItem, readings: string[]): Heard | null {
  const key = { answers: [item.text], pinyin: item.pinyin };
  const graded: Heard[] = [];
  for (const text of new Set(readings)) {
    const grade = gradeAnswer(text, key);
    if (grade) graded.push({ text, grade });
  }
  const right = graded.find((h) => h.grade.verdict === 'correct');
  if (right) return right;
  const off = (h: Heard) =>
    (h.grade.diff ?? []).reduce((n, p) => n + (p.kind === 'same' ? 0 : [...p.text].length), 0);
  return graded.sort((a, b) => off(a) - off(b))[0] ?? null;
}

/** Part 1 · 听后重复: hear a sentence, then say it back. */
export function RepeatCard({
  item,
  isLast,
  onDone,
}: {
  item: RepeatItem;
  isLast: boolean;
  /** The learner moved on; `correct` is the final verdict for this sentence. */
  onDone: (correct: boolean) => void;
}) {
  const capture = useSpeechCapture();
  const { result, state, supported } = capture;
  const [showText, setShowText] = useState(false);
  // Without a microphone: the learner says it aloud, then asks for the text.
  const [compared, setCompared] = useState(false);
  const [rating, setRating] = useState<boolean | null>(null);

  const heard = useMemo(
    () => (result ? checkRepeat(item, [result.transcript, ...result.alternatives]) : null),
    [result, item],
  );
  const missing = useMemo(
    () =>
      heard && heard.grade.verdict !== 'correct'
        ? diffChars(answerCore(item.text), answerCore(heard.text))
        : null,
    [heard, item],
  );

  const revealed = state === 'done' || compared;
  // Once a start has failed (blocked or missing microphone) fall back to saying it aloud.
  const micOk = supported.any && !(state === 'idle' && capture.problem);
  const skip = () => {
    capture.reset();
    setCompared(true);
  };
  const auto = heard?.grade.verdict === 'correct';
  const outcome = auto ? true : rating;

  const tryAgain = () => {
    capture.reset();
    setCompared(false);
    setRating(null);
  };

  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Part 1 · <span className="cjk">听后重复</span> · Listen and repeat
          </p>
          <p className="mt-1 text-sm">Listen to the sentence, then say it aloud.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ListenButton text={item.text} />
          {!revealed && (
            <Button type="button" variant="ghost" onClick={() => setShowText((v) => !v)}>
              <span>{showText ? 'Hide text' : 'Show text'}</span>
            </Button>
          )}
        </div>

        {showText && !revealed && (
          <Sentence label="Sentence" text={item.text} pinyin={item.pinyin} />
        )}

        {!revealed && micOk && (
          <div className="flex flex-wrap items-start gap-3">
            <MicControl
              state={state}
              interim={capture.interim}
              onStart={() => void capture.start()}
              onStop={capture.stop}
            />
            <SkipRecording onSkip={skip} />
          </div>
        )}
        {!revealed && !micOk && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {supported.any
                ? "The microphone isn't working right now. Say it aloud, then compare with the text."
                : 'No microphone is available here. Say it aloud, then compare with the text.'}
            </p>
            <Button type="button" variant="primary" size="lg" onClick={() => setCompared(true)}>
              <span>I&apos;ve said it — show text</span>
            </Button>
          </div>
        )}
        <CaptureProblem problem={capture.problem} />

        {revealed && (
          <div className="space-y-4">
            {heard && (
              <div
                className={cn(
                  'space-y-1.5 border p-3 text-sm',
                  auto
                    ? 'border-success/30 bg-success/10'
                    : 'border-destructive/30 bg-destructive/10',
                )}
              >
                <p className={cn('font-semibold', auto ? 'text-success' : 'text-destructive')}>
                  {verdictLabel(heard.grade)}
                </p>
                {auto ? (
                  <p>
                    <span className="text-muted-foreground">I heard: </span>
                    <span className="cjk text-base">{heard.text}</span>
                  </p>
                ) : (
                  missing && (
                    <>
                      <p>
                        <span className="text-muted-foreground">I heard: </span>
                        <CharDiff diff={missing} className="text-base" />
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Underlined: not heard. Struck through: not in the sentence. Speech
                        recognition can miss words, so rate yourself below.
                      </p>
                    </>
                  )
                )}
              </div>
            )}
            {result && !heard && supported.recognition && <Transcript text="" />}

            <Sentence
              label="Sentence"
              text={item.text}
              pinyin={item.pinyin}
              english={item.english}
            />
            <Recording url={result?.audioUrl ?? null} modelText={item.text} />

            {!auto && (
              <SelfRate
                value={rating}
                onChange={setRating}
                question="Did you say it right?"
                yes="I said it right"
              />
            )}
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
            disabled={!revealed || outcome === null}
            onClick={() => onDone(outcome === true)}
          >
            <span>{isLast ? 'Finish' : 'Next'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
