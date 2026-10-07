'use client';

import { useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSpeechInit } from '@/hooks/use-speech';
import { useProgress } from '@/hooks/use-progress';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HanziPad, isCleanAttempt, type AttemptResult } from '@/components/writing/hanzi-pad';
import { HanziDecomp } from '@/components/writing/hanzi-decomp';
import { PlayButton } from '@/components/tones/tone-pieces';
import { getWritingChars, type WritingChar } from '@/lib/writing/chars';
import { makeRng, toneColor } from '@/lib/tones/utils';
import { useMastery } from '@/hooks/use-mastery';
import { pickWeight, weightedSample } from '@/lib/mastery';

const SESSION_SIZE = 40;

/** The character's reading as taught in its source word, coloured by tone. */
function Pinyin({ entry, className }: { entry: WritingChar; className?: string }) {
  return (
    <div className={className} style={{ color: toneColor(entry.tone) }}>
      {entry.pinyin}
    </div>
  );
}

export default function WritingPage() {
  const { language } = useLanguage();
  const { recordActivity } = useProgress();
  const { map: mastery, record } = useMastery('writing');
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(0);
  const [chars, setChars] = useState<WritingChar[]>([]);
  const [attempt, setAttempt] = useState<AttemptResult | null>(null);
  const [missing, setMissing] = useState(false);

  useSpeechInit();

  const poolSize = useMemo(() => getWritingChars(1, 100000).length, []);
  const charIndex = useMemo(() => new Map(chars.map((c, i) => [c.char, i])), [chars]);
  const current = chars[index];

  const goTo = (i: number) => {
    setIndex(i);
    setAttempt(null);
    setMissing(false);
  };

  const startSession = () => {
    const seed = Date.now();
    const pool = getWritingChars(seed, 100000);
    // Bias toward characters you've drawn with mistakes (or never drawn).
    const session = weightedSample(
      pool,
      (c) => pickWeight(mastery[c.char]),
      SESSION_SIZE,
      makeRng(seed),
    );
    setChars(session);
    goTo(0);
    setDone(0);
    setStarted(true);
  };

  if (language !== 'chinese') {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center space-y-3">
        <h1>Writing</h1>
        <p className="text-muted-foreground">
          Character writing practice is for Chinese. Switch the language to Chinese to use it.
        </p>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="page-top">
          <div>
            <div className="greet">笔顺 · learn the strokes</div>
            <h1>
              Writing<span className="cjk"> · 书写</span>
            </h1>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              You&rsquo;ll see the meaning and pinyin, then draw the character from memory. Hint and
              Trace are there when you need them, but only unaided attempts count towards mastery.
              Characters are drawn from your vocabulary.
            </p>
            <Button size="lg" onClick={startSession}>
              Start · {Math.min(SESSION_SIZE, poolSize)} characters
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAttemptEnd = (result: AttemptResult) => {
    setAttempt(result);
    setDone((n) => n + 1);
    if (result.traced) {
      // Copying isn't recall: it counts as practice but never as an answer.
      recordActivity({ exercises: 1 });
      return;
    }
    const clean = isCleanAttempt(result);
    recordActivity({ exercises: 1, correctAnswers: clean ? 1 : 0, totalAnswers: 1 });
    record(current.char, clean, { label: current.char, sublabel: current.pinyin });
  };

  const next = () => {
    if (index < chars.length - 1) goTo(index + 1);
    else setStarted(false);
  };

  const maskedWord = [...current.word].map((c) => (c === current.char ? '＿' : c)).join('');

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setStarted(false)}>
          &larr; Back
        </Button>
        <div className="flex items-center gap-2">
          {done > 0 && <span className="text-xs text-muted-foreground">{done} practised</span>}
          <Badge variant="outline">
            {index + 1} / {chars.length}
          </Badge>
        </div>
      </div>

      <HanziPad
        key={`pad-${current.char}`}
        char={current.char}
        onAttemptEnd={handleAttemptEnd}
        onMissingData={() => setMissing(true)}
      />

      {attempt ? (
        <div className="text-center space-y-1">
          <div className="text-6xl cjk leading-none">{current.char}</div>
          <Pinyin entry={current} className="text-xl" />
          <div className="text-sm text-muted-foreground">
            <span className="cjk">{current.word}</span> · {current.meaning}
          </div>
          <div className="text-xs text-muted-foreground">
            {attempt.traced
              ? 'Traced — not counted towards mastery.'
              : attempt.gaveUp
                ? 'Answer shown — marked as a miss.'
                : isCleanAttempt(attempt)
                  ? 'Clean — drawn from memory.'
                  : attempt.hinted
                    ? 'Hinted — not counted as clean.'
                    : `${attempt.totalMistakes} wrong ${attempt.totalMistakes === 1 ? 'stroke' : 'strokes'}.`}
          </div>
          <div className="pt-2">
            <PlayButton text={current.char} label="Hear it" size="sm" />
          </div>
        </div>
      ) : (
        <div className="text-center space-y-1">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Write the missing character
          </div>
          <div className="text-3xl cjk leading-none">{maskedWord}</div>
          <Pinyin entry={current} className="text-xl" />
          <div className="text-sm text-muted-foreground">{current.meaning}</div>
          <div className="pt-2">
            <PlayButton text={current.char} label="Hear it" size="sm" />
          </div>
        </div>
      )}

      {attempt && (
        <HanziDecomp
          key={`decomp-${current.char}`}
          char={current.char}
          inStudySet={(c) => charIndex.has(c)}
          onPickSibling={(c) => {
            const i = charIndex.get(c);
            if (i !== undefined) goTo(i);
          }}
        />
      )}

      <div className="text-center">
        <Button variant={attempt || missing ? 'primary' : 'outline'} onClick={next}>
          {!attempt && index < chars.length - 1
            ? 'Skip'
            : index < chars.length - 1
              ? 'Next character'
              : 'Finish'}
        </Button>
      </div>
    </div>
  );
}
