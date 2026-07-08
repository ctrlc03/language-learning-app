'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSpeechInit } from '@/hooks/use-speech';
import { useProgress } from '@/hooks/use-progress';
import { useMastery } from '@/hooks/use-mastery';
import { pickWeight, weightedSample, type MasteryMap } from '@/lib/mastery';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ColoredPinyin, PlayButton } from '@/components/tones/tone-pieces';
import { makeRng } from '@/lib/tones/utils';
import { normalizePinyin } from '@/lib/language/pinyin';
import { chineseVocabulary } from '@/data/chinese/vocabulary';
import type { VocabularyItem } from '@/types';
import { cn } from '@/lib/utils';

const SESSION_SIZE = 20;
const POOL = chineseVocabulary.filter((v) => v.reading && /\p{Script=Han}/u.test(v.word));

function buildSession(mastery: MasteryMap): VocabularyItem[] {
  return weightedSample(
    POOL,
    (v) => pickWeight(mastery[v.word]),
    SESSION_SIZE,
    makeRng(Date.now()),
  );
}

export default function TypingPage() {
  const { language } = useLanguage();
  const { recordActivity } = useProgress();
  const { map: mastery, record } = useMastery('typing');
  const [started, setStarted] = useState(false);
  const [session, setSession] = useState<VocabularyItem[]>([]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<null | boolean>(null);
  const [correct, setCorrect] = useState(0);

  useSpeechInit();

  const word = session[index];

  const start = () => {
    setSession(buildSession(mastery));
    setIndex(0);
    setInput('');
    setResult(null);
    setCorrect(0);
    setStarted(true);
  };

  const submit = () => {
    if (result !== null || !input.trim()) return;
    const ok = normalizePinyin(input) === normalizePinyin(word.reading);
    setResult(ok);
    if (ok) setCorrect((n) => n + 1);
    recordActivity({ exercises: 1, correctAnswers: ok ? 1 : 0, totalAnswers: 1 });
    record(word.word, ok, { label: word.word, sublabel: word.reading });
  };

  const next = () => {
    setInput('');
    setResult(null);
    if (index < session.length - 1) setIndex((i) => i + 1);
    else setStarted(false);
  };

  if (language !== 'chinese') {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center space-y-3">
        <h1>Pinyin Typing</h1>
        <p className="text-muted-foreground">
          Pinyin typing practice is for Chinese. Switch the language to Chinese to use it.
        </p>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="page-top">
          <div>
            <div className="greet">拼音 · type the reading</div>
            <h1>
              Pinyin Typing<span className="cjk"> · 打字</span>
            </h1>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              See a word, type its pinyin — the core skill behind typing Chinese. Tones and the ü/v
              distinction are ignored, so <b>nv</b>, <b>nu</b> and <b>nü</b> all work.
            </p>
            <Button size="lg" onClick={start}>
              Start · {Math.min(SESSION_SIZE, POOL.length)} words
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setStarted(false)}>
          &larr; Back
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {correct}/{index + (result !== null ? 1 : 0)}
          </span>
          <Badge variant="outline">
            {index + 1} / {session.length}
          </Badge>
        </div>
      </div>

      <div className="text-center space-y-2">
        <div className="text-6xl cjk font-bold">{word.word}</div>
        <div className="text-sm text-muted-foreground">{word.meaning}</div>
      </div>

      <div className="space-y-3">
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            if (result === null) submit();
            else next();
          }}
          disabled={result !== null}
          placeholder="type the pinyin…"
          className={cn(
            'w-full text-center text-xl rounded-xl border-2 p-3 bg-transparent outline-none',
            result === null && 'border-border focus:border-primary/50',
            result === true && 'border-success bg-success/10',
            result === false && 'border-destructive bg-destructive/10',
          )}
        />

        {result === null ? (
          <Button className="w-full" onClick={submit} disabled={!input.trim()}>
            Check
          </Button>
        ) : (
          <Card>
            <CardContent className="p-4 flex flex-col items-center gap-1 text-center">
              <div className={cn('font-medium', result ? 'text-success' : 'text-destructive')}>
                {result ? 'Correct' : 'Not quite'}
              </div>
              <ColoredPinyin word={word.word} className="text-xl" />
              <div className="text-sm text-muted-foreground">{word.meaning}</div>
              <div className="pt-1">
                <PlayButton text={word.word} label="Hear it" size="sm" />
              </div>
            </CardContent>
          </Card>
        )}

        {result !== null && (
          <Button variant="outline" className="w-full" onClick={next}>
            {index < session.length - 1 ? 'Next' : 'Finish'}
          </Button>
        )}
      </div>
    </div>
  );
}
