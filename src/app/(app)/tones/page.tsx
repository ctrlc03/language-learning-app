'use client';

import { useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSpeechInit } from '@/hooks/use-speech';
import { useProgress } from '@/hooks/use-progress';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToneIdentify } from '@/components/tones/tone-identify';
import { MinimalPair, type MinimalPairPrompt } from '@/components/tones/minimal-pair';
import { TonePair } from '@/components/tones/tone-pair';
import { getToneIdItems, getTonePairItems, makeRng, shuffle } from '@/lib/tones/utils';
import { MINIMAL_PAIRS, TONES, type ToneNumber } from '@/lib/tones/data';

type Mode = 'select' | 'identify' | 'minimal' | 'pair';

const TONE_ORDER: ToneNumber[] = [1, 2, 3, 4, 5];

function buildMinimalPrompts(seed: number, count = 30): MinimalPairPrompt[] {
  const rng = makeRng(seed);
  const prompts: MinimalPairPrompt[] = [];
  // Cycle through groups until we have enough, picking a random member each time.
  while (prompts.length < count) {
    for (const group of shuffle(MINIMAL_PAIRS, rng)) {
      const answer = group.members[Math.floor(rng() * group.members.length)];
      prompts.push({ group, answer });
      if (prompts.length >= count) break;
    }
  }
  return prompts;
}

export default function TonesPage() {
  const { language } = useLanguage();
  const { recordActivity } = useProgress();
  const [mode, setMode] = useState<Mode>('select');
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [seed] = useState(() => Date.now());

  useSpeechInit();

  const idItems = useMemo(() => getToneIdItems(seed), [seed]);
  const pairItems = useMemo(() => getTonePairItems(seed), [seed]);
  const minimalPrompts = useMemo(() => buildMinimalPrompts(seed), [seed]);

  const total =
    mode === 'identify'
      ? idItems.length
      : mode === 'pair'
        ? pairItems.length
        : minimalPrompts.length;

  const start = (m: Mode) => {
    setMode(m);
    setIndex(0);
    setCorrect(0);
    setAnswered(0);
  };

  const handleComplete = (isCorrect: boolean) => {
    setAnswered((n) => n + 1);
    if (isCorrect) setCorrect((n) => n + 1);
    recordActivity({ exercises: 1, correctAnswers: isCorrect ? 1 : 0, totalAnswers: 1 });
  };

  const next = () => {
    if (index < total - 1) setIndex((i) => i + 1);
    else setMode('select');
  };

  if (language !== 'chinese') {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center space-y-3">
        <h1>Tones</h1>
        <p className="text-muted-foreground">
          Tone training is Mandarin-specific. Switch the language to Chinese to use it.
        </p>
      </div>
    );
  }

  if (mode === 'select') {
    const cards: { m: Mode; title: string; desc: string; count: number }[] = [
      {
        m: 'identify',
        title: 'Tone ID',
        desc: 'Hear one syllable, name its tone',
        count: idItems.length,
      },
      {
        m: 'minimal',
        title: 'Minimal Pairs',
        desc: 'Same sound, tell the tones apart',
        count: minimalPrompts.length,
      },
      {
        m: 'pair',
        title: 'Tone Pairs',
        desc: 'Two syllables — spot the pattern',
        count: pairItems.length,
      },
    ];

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="page-top">
          <div>
            <div className="greet">四声 · train your ear for tones</div>
            <h1>
              Tones<span className="cjk"> · 声调</span>
            </h1>
          </div>
        </div>

        {/* Tone legend */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-5 gap-2 text-center">
              {TONE_ORDER.map((t) => (
                <div key={t} className="flex flex-col items-center">
                  <span className="text-2xl leading-none" style={{ color: TONES[t].color }}>
                    {TONES[t].mark}
                  </span>
                  <span className="text-xs mt-1 font-medium">
                    {t === 5 ? 'neutral' : `Tone ${t}`}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{TONES[t].contour}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {cards.map((c) => (
            <button key={c.m} onClick={() => start(c.m)} className="text-left">
              <Card className="p-6 hover:border-primary/50 hover:bg-primary/5 transition-all h-full">
                <h3 className="font-semibold">{c.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
                <p className="text-xs text-muted-foreground mt-2">{c.count} drills</p>
              </Card>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setMode('select')}>
          &larr; Back
        </Button>
        <div className="flex items-center gap-2">
          {answered > 0 && (
            <span className="text-xs text-muted-foreground">
              {correct}/{answered}
            </span>
          )}
          <Badge variant="outline">
            {index + 1} / {total}
          </Badge>
        </div>
      </div>

      {mode === 'identify' && (
        <ToneIdentify key={index} item={idItems[index]} onComplete={handleComplete} />
      )}
      {mode === 'minimal' && (
        <MinimalPair key={index} prompt={minimalPrompts[index]} onComplete={handleComplete} />
      )}
      {mode === 'pair' && (
        <TonePair key={index} item={pairItems[index]} onComplete={handleComplete} />
      )}

      <div className="text-center">
        <Button variant="outline" onClick={next}>
          {index < total - 1 ? 'Next' : 'Finish'}
        </Button>
      </div>
    </div>
  );
}
