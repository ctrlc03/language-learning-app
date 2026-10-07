'use client';

import { useEffect, useState } from 'react';
import { useSpeechCapture } from '@/hooks/use-speech-capture';
import type { TalkItem } from '@/lib/speaking/items';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { stopSpeaking } from '@/lib/tts/speech';
import { SpeakButton } from '@/components/shared/speak-button';
import {
  CaptureProblem,
  Countdown,
  MicControl,
  Recording,
  SelfRate,
  Sentence,
  SkipRecording,
  Transcript,
} from '@/components/speaking/speaking-ui';

/** The longest an answer to a Part 3 prompt runs. */
export const TALK_SECONDS = 90;

/** Part 3 · 回答问题: talk about a prompt for up to 90 seconds. */
export function TalkCard({
  item,
  isLast,
  onDone,
}: {
  item: TalkItem;
  isLast: boolean;
  /** The learner moved on; `correct` is their own rating. */
  onDone: (correct: boolean) => void;
}) {
  const capture = useSpeechCapture({ continuous: true, maxMs: TALK_SECONDS * 1000 });
  const { result, state, supported } = capture;
  // Without a microphone the learner just times themselves.
  const [timing, setTiming] = useState(false);
  const [finished, setFinished] = useState(false);
  const [rating, setRating] = useState<boolean | null>(null);

  const revealed = state === 'done' || finished;
  const running = state === 'listening' || timing;
  // Once a start has failed (blocked or missing microphone) fall back to the self-timer.
  const micOk = supported.any && !(state === 'idle' && capture.problem);

  // The self-timer ends the answer by itself when the time is up.
  useEffect(() => {
    if (!timing) return;
    const id = window.setTimeout(() => {
      setTiming(false);
      setFinished(true);
    }, TALK_SECONDS * 1000);
    return () => window.clearTimeout(id);
  }, [timing]);

  useEffect(() => () => stopSpeaking(), []);

  const skip = () => {
    capture.reset();
    setTiming(false);
    setFinished(true);
  };

  const tryAgain = () => {
    capture.reset();
    setTiming(false);
    setFinished(false);
    setRating(null);
  };

  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Part 3 · <span className="cjk">回答问题</span> · Answer questions
          </p>
          <p className="mt-1 text-sm">Talk about this for up to {TALK_SECONDS} seconds.</p>
        </div>

        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="cjk text-2xl">{item.prompt}</p>
            <p className="text-sm text-muted-foreground">{item.english}</p>
          </div>
          <SpeakButton text={item.prompt} />
        </div>

        {item.starters.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              You could start with
            </p>
            <ul className="flex flex-wrap gap-2">
              {item.starters.map((s) => (
                <li key={s} className="cjk border border-border bg-muted/40 px-2 py-1 text-sm">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!revealed && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-start gap-3">
              {micOk ? (
                <>
                  <MicControl
                    state={state}
                    interim={capture.interim}
                    onStart={() => void capture.start()}
                    onStop={capture.stop}
                    idleLabel={`Speak (${TALK_SECONDS} s)`}
                  />
                  <SkipRecording onSkip={skip} />
                </>
              ) : timing ? (
                <Button type="button" variant="destructive" size="lg" onClick={skip}>
                  <span>I&apos;m done</span>
                </Button>
              ) : (
                <Button type="button" variant="primary" size="lg" onClick={() => setTiming(true)}>
                  <span>Start the timer ({TALK_SECONDS} s)</span>
                </Button>
              )}
              {running && (
                <div className="flex h-12 items-center">
                  <Countdown seconds={TALK_SECONDS} />
                </div>
              )}
            </div>
            {!micOk && (
              <p className="text-sm text-muted-foreground">
                {supported.any
                  ? "The microphone isn't working right now. "
                  : 'No microphone is available here. '}
                Talk aloud while the timer runs, then compare with the sample.
              </p>
            )}
          </div>
        )}
        <CaptureProblem problem={capture.problem} />

        {revealed && (
          <div className="space-y-4">
            {result && supported.recognition && <Transcript text={result.transcript} />}
            <Recording url={result?.audioUrl ?? null} modelText={item.sample} />
            <Sentence
              label="Sample answer"
              text={item.sample}
              pinyin={item.samplePinyin}
              english={item.sampleEnglish}
            />
            <p className="text-xs text-muted-foreground">
              Yours can be different. Check that you stayed on the topic and spoke in full
              sentences.
            </p>
            <SelfRate
              value={rating}
              onChange={setRating}
              question="How did it go?"
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
