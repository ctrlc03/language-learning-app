'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSpeechInit } from '@/hooks/use-speech';
import { useProgress } from '@/hooks/use-progress';
import { useMastery } from '@/hooks/use-mastery';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ColoredPinyin, PlayButton } from '@/components/tones/tone-pieces';
import { speak } from '@/lib/tts/speech';
import { makeRng, shuffle } from '@/lib/tones/utils';
import { numberToChinese, moneyToChinese } from '@/lib/chinese-num';
import { cn } from '@/lib/utils';

type Mode = 'select' | 'number' | 'money' | 'date';
const SESSION_SIZE = 15;

interface NumberQ {
  kind: 'number' | 'money';
  hanzi: string;
  answer: number; // numeric value to type
  display: string; // expected value shown on reveal (e.g. "¥12.5")
}
interface DateQ {
  kind: 'date';
  hanzi: string;
  options: string[];
  correctIndex: number;
}
type Question = NumberQ | DateQ;

function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function buildNumberQ(rng: () => number): NumberQ {
  const roll = rng();
  const n =
    roll < 0.55
      ? randInt(rng, 1, 99)
      : roll < 0.85
        ? randInt(rng, 100, 999)
        : randInt(rng, 1000, 99999);
  return { kind: 'number', hanzi: numberToChinese(n), answer: n, display: String(n) };
}

function buildMoneyQ(rng: () => number): NumberQ {
  const yuan = randInt(rng, 1, 199);
  const jiao = randInt(rng, 0, 9);
  const value = Math.round((yuan + jiao / 10) * 10) / 10;
  return { kind: 'money', hanzi: moneyToChinese(yuan, jiao), answer: value, display: `¥${value}` };
}

function buildDateQ(rng: () => number): DateQ {
  const month = randInt(rng, 1, 12);
  const day = randInt(rng, 1, 28);
  const label = (m: number, d: number) => `${m}/${d}`;
  const distractors = new Set<string>();
  while (distractors.size < 3) {
    const m = randInt(rng, 1, 12);
    const d = randInt(rng, 1, 28);
    const l = label(m, d);
    if (l !== label(month, day)) distractors.add(l);
  }
  const options = shuffle([label(month, day), ...distractors], rng);
  return {
    kind: 'date',
    hanzi: `${numberToChinese(month)}月${numberToChinese(day)}号`,
    options,
    correctIndex: options.indexOf(label(month, day)),
  };
}

function buildSession(mode: Exclude<Mode, 'select'>): Question[] {
  const rng = makeRng(Date.now());
  const make = mode === 'number' ? buildNumberQ : mode === 'money' ? buildMoneyQ : buildDateQ;
  return Array.from({ length: SESSION_SIZE }, () => make(rng));
}

export default function NumbersPage() {
  const { language, speechRate } = useLanguage();
  const { recordActivity } = useProgress();
  const { record } = useMastery('numbers');
  const [mode, setMode] = useState<Mode>('select');
  const [session, setSession] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<null | boolean>(null);
  const [correct, setCorrect] = useState(0);

  useSpeechInit();

  const q = session[index];

  // Numbers are great listening practice — play on each question.
  useEffect(() => {
    if (mode !== 'select' && q) speak(q.hanzi, 'chinese', speechRate).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, mode]);

  const GROUP: Record<string, string> = { number: 'Numbers', money: 'Money', date: 'Dates' };

  const start = (m: Exclude<Mode, 'select'>) => {
    setSession(buildSession(m));
    setIndex(0);
    setInput('');
    setPicked(null);
    setResult(null);
    setCorrect(0);
    setMode(m);
  };

  const finish = (ok: boolean) => {
    setResult(ok);
    if (ok) setCorrect((n) => n + 1);
    recordActivity({ exercises: 1, correctAnswers: ok ? 1 : 0, totalAnswers: 1 });
    record(mode, ok, { label: GROUP[mode] ?? mode, group: GROUP[mode] });
  };

  const submitTyped = () => {
    if (result !== null || !input.trim() || q.kind === 'date') return;
    finish(Math.abs(parseFloat(input) - q.answer) < 0.001);
  };

  const pickOption = (i: number) => {
    if (result !== null || q.kind !== 'date') return;
    setPicked(i);
    finish(i === q.correctIndex);
  };

  const next = () => {
    setInput('');
    setPicked(null);
    setResult(null);
    if (index < session.length - 1) setIndex((i) => i + 1);
    else setMode('select');
  };

  if (language !== 'chinese') {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center space-y-3">
        <h1>Numbers</h1>
        <p className="text-muted-foreground">
          The numbers drill is for Chinese. Switch the language to Chinese to use it.
        </p>
      </div>
    );
  }

  if (mode === 'select') {
    const cards: { m: Exclude<Mode, 'select'>; title: string; desc: string }[] = [
      { m: 'number', title: 'Numbers', desc: 'Hear/read a number, type the digits' },
      { m: 'money', title: 'Money', desc: '块 and 毛 — type the amount' },
      { m: 'date', title: 'Dates', desc: 'Read a date, pick the right one' },
    ];
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="page-top">
          <div>
            <div className="greet">数字 · numbers, money & dates</div>
            <h1>
              Numbers<span className="cjk"> · 数字</span>
            </h1>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {cards.map((c) => (
            <button key={c.m} onClick={() => start(c.m)} className="text-left">
              <Card className="p-6 hover:border-primary/50 hover:bg-primary/5 transition-all h-full">
                <h3 className="font-semibold">{c.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
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
          <span className="text-xs text-muted-foreground">
            {correct}/{index + (result !== null ? 1 : 0)}
          </span>
          <Badge variant="outline">
            {index + 1} / {session.length}
          </Badge>
        </div>
      </div>

      <div className="text-center space-y-2">
        <div className="text-4xl cjk font-bold">{q.hanzi}</div>
        <ColoredPinyin word={q.hanzi} className="text-base" />
        <div className="pt-1">
          <PlayButton text={q.hanzi} label="Replay" size="sm" />
        </div>
      </div>

      {q.kind === 'date' ? (
        <div className="grid grid-cols-2 gap-2">
          {q.options.map((opt, i) => {
            const revealed = result !== null;
            const isAnswer = i === q.correctIndex;
            const isPicked = i === picked;
            return (
              <button
                key={opt}
                onClick={() => pickOption(i)}
                disabled={revealed}
                className={cn(
                  'rounded-xl border-2 p-4 text-lg font-medium transition-all',
                  !revealed && 'border-border hover:bg-primary/5',
                  revealed && isAnswer && 'border-success bg-success/10',
                  revealed && isPicked && !isAnswer && 'border-destructive bg-destructive/10',
                  revealed && !isAnswer && !isPicked && 'opacity-40',
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          <input
            autoFocus
            inputMode="decimal"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              if (result === null) submitTyped();
              else next();
            }}
            disabled={result !== null}
            placeholder={q.kind === 'money' ? 'amount, e.g. 12.5' : 'type the number'}
            className={cn(
              'w-full text-center text-xl rounded-xl border-2 p-3 bg-transparent outline-none',
              result === null && 'border-border focus:border-primary/50',
              result === true && 'border-success bg-success/10',
              result === false && 'border-destructive bg-destructive/10',
            )}
          />
          {result === null && (
            <Button className="w-full" onClick={submitTyped} disabled={!input.trim()}>
              Check
            </Button>
          )}
        </div>
      )}

      {result !== null && (
        <Card>
          <CardContent className="p-4 text-center space-y-1">
            <div className={cn('font-medium', result ? 'text-success' : 'text-destructive')}>
              {result
                ? 'Correct'
                : `Answer: ${q.kind === 'date' ? q.options[q.correctIndex] : q.display}`}
            </div>
          </CardContent>
        </Card>
      )}

      {result !== null && (
        <div className="text-center">
          <Button variant="outline" onClick={next}>
            {index < session.length - 1 ? 'Next' : 'Finish'}
          </Button>
        </div>
      )}
    </div>
  );
}
