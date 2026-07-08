'use client';

import { useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSpeechInit } from '@/hooks/use-speech';
import { useProgress } from '@/hooks/use-progress';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HanziPad } from '@/components/writing/hanzi-pad';
import { HanziDecomp } from '@/components/writing/hanzi-decomp';
import { ColoredPinyin, PlayButton } from '@/components/tones/tone-pieces';
import { getWritingChars, type WritingChar } from '@/lib/writing/chars';
import { makeRng } from '@/lib/tones/utils';
import { useMastery } from '@/hooks/use-mastery';
import { pickWeight, weightedSample } from '@/lib/mastery';

const SESSION_SIZE = 40;

export default function WritingPage() {
  const { language } = useLanguage();
  const { recordActivity } = useProgress();
  const { map: mastery, record } = useMastery('writing');
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(0);
  const [chars, setChars] = useState<WritingChar[]>([]);

  useSpeechInit();

  const poolSize = useMemo(() => getWritingChars(1, 100000).length, []);
  const charIndex = useMemo(() => new Map(chars.map((c, i) => [c.char, i])), [chars]);
  const current = chars[index];

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
    setIndex(0);
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
              Watch the correct stroke order, then draw each character from memory. Characters are
              drawn from your vocabulary.
            </p>
            <Button size="lg" onClick={startSession}>
              Start · {Math.min(SESSION_SIZE, poolSize)} characters
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleQuizComplete = ({ totalMistakes }: { totalMistakes: number }) => {
    setDone((n) => n + 1);
    const clean = totalMistakes === 0;
    recordActivity({ exercises: 1, correctAnswers: clean ? 1 : 0, totalAnswers: 1 });
    record(current.char, clean, { label: current.char, sublabel: current.pinyin });
  };

  const next = () => {
    if (index < chars.length - 1) setIndex((i) => i + 1);
    else setStarted(false);
  };

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

      <HanziPad key={current.char} char={current.char} onQuizComplete={handleQuizComplete} />

      <div className="text-center space-y-1">
        <ColoredPinyin word={current.char} className="text-xl" />
        <div className="text-sm text-muted-foreground">{current.meaning}</div>
        <div className="text-xs text-muted-foreground">
          in <span className="cjk">{current.word}</span>
        </div>
        <div className="pt-2">
          <PlayButton text={current.char} label="Hear it" size="sm" />
        </div>
      </div>

      <HanziDecomp
        key={current.char}
        char={current.char}
        inStudySet={(c) => charIndex.has(c)}
        onPickSibling={(c) => {
          const i = charIndex.get(c);
          if (i !== undefined) setIndex(i);
        }}
      />

      <div className="text-center">
        <Button variant="outline" onClick={next}>
          {index < chars.length - 1 ? 'Next character' : 'Finish'}
        </Button>
      </div>
    </div>
  );
}
