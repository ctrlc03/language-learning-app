'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSpeechInit } from '@/hooks/use-speech';
import { useProgress } from '@/hooks/use-progress';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ColoredPinyin, PlayButton } from '@/components/tones/tone-pieces';
import { makeRng, shuffle } from '@/lib/tones/utils';
import { useMastery } from '@/hooks/use-mastery';
import { pickWeight, weightedSample, type MasteryMap } from '@/lib/mastery';
import { MEASURE_WORDS, MW_ITEMS, type MwItem } from '@/lib/measure-words/data';
import { cn } from '@/lib/utils';

const CLASSIFIER_KEYS = Object.keys(MEASURE_WORDS);
const QUESTIONS_PER_SESSION = 20;

interface Question extends MwItem {
  options: string[]; // classifier keys, includes the correct one
}

// Bias toward nouns whose classifier you keep getting wrong.
function buildQuestions(seed: number, mastery: MasteryMap): Question[] {
  const rng = makeRng(seed);
  const chosen = weightedSample(
    MW_ITEMS,
    (item) => pickWeight(mastery[item.noun.hanzi]),
    QUESTIONS_PER_SESSION,
    rng,
  );
  return chosen.map((item) => {
    const distractors = shuffle(
      CLASSIFIER_KEYS.filter((k) => k !== item.classifier),
      rng,
    ).slice(0, 3);
    return { ...item, options: shuffle([item.classifier, ...distractors], rng) };
  });
}

export default function MeasureWordsPage() {
  const { language } = useLanguage();
  const { recordActivity } = useProgress();
  const { map: mastery, record } = useMastery('classifiers');
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);

  useSpeechInit();

  const q = questions[index];

  if (language !== 'chinese') {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center space-y-3">
        <h1>Measure Words</h1>
        <p className="text-muted-foreground">
          Measure words are Mandarin-specific. Switch the language to Chinese to use this drill.
        </p>
      </div>
    );
  }

  const start = () => {
    setQuestions(buildQuestions(Date.now(), mastery));
    setIndex(0);
    setPicked(null);
    setCorrect(0);
    setStarted(true);
  };

  const pick = (key: string) => {
    if (picked !== null) return;
    setPicked(key);
    const isCorrect = key === q.classifier;
    if (isCorrect) setCorrect((n) => n + 1);
    recordActivity({ exercises: 1, correctAnswers: isCorrect ? 1 : 0, totalAnswers: 1 });
    record(q.noun.hanzi, isCorrect, {
      label: q.noun.hanzi,
      sublabel: q.noun.meaning,
      group: MEASURE_WORDS[q.classifier].hanzi,
    });
  };

  const next = () => {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      setPicked(null);
    } else {
      setStarted(false);
    }
  };

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="page-top">
          <div>
            <div className="greet">量词 · pair nouns with the right classifier</div>
            <h1>
              Measure Words<span className="cjk"> · 量词</span>
            </h1>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-3">
              Chinese needs a classifier between a number and a noun — 一 <b>张</b> 桌子 (a table).
              Common ones:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
              {CLASSIFIER_KEYS.map((k) => {
                const mw = MEASURE_WORDS[k];
                return (
                  <div key={k} className="flex items-baseline gap-2 text-sm">
                    <span className="cjk font-semibold">{mw.hanzi}</span>
                    <span className="text-muted-foreground">{mw.pinyin}</span>
                    <span className="text-xs text-muted-foreground truncate">{mw.gloss}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button size="lg" onClick={start}>
            Start · {Math.min(QUESTIONS_PER_SESSION, MW_ITEMS.length)} questions
          </Button>
        </div>
      </div>
    );
  }

  const phrase = `一${q.classifier}${q.noun.hanzi}`;

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setStarted(false)}>
          &larr; Back
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {correct}/{index + (picked ? 1 : 0)}
          </span>
          <Badge variant="outline">
            {index + 1} / {questions.length}
          </Badge>
        </div>
      </div>

      <div className="text-center space-y-1">
        <div className="text-5xl cjk font-bold">{q.noun.hanzi}</div>
        <ColoredPinyin word={q.noun.hanzi} className="text-lg" />
        <div className="text-sm text-muted-foreground">{q.noun.meaning}</div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Which measure word counts this noun?
      </p>

      <div className="grid grid-cols-2 gap-2">
        {q.options.map((key) => {
          const mw = MEASURE_WORDS[key];
          const revealed = picked !== null;
          const isAnswer = key === q.classifier;
          const isPicked = key === picked;
          return (
            <button
              key={key}
              onClick={() => pick(key)}
              disabled={revealed}
              className={cn(
                'flex flex-col items-center rounded-xl border-2 p-4 transition-all',
                !revealed && 'border-border hover:bg-primary/5',
                revealed && isAnswer && 'border-success bg-success/10',
                revealed && isPicked && !isAnswer && 'border-destructive bg-destructive/10',
                revealed && !isAnswer && !isPicked && 'opacity-40',
              )}
            >
              <span className="text-3xl cjk font-semibold leading-none">{mw.hanzi}</span>
              <span className="mt-1 text-sm text-muted-foreground">{mw.pinyin}</span>
              {revealed && <span className="text-xs text-muted-foreground mt-1">{mw.gloss}</span>}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <Card>
          <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
            <div className="text-2xl cjk font-bold">{phrase}</div>
            <ColoredPinyin word={phrase} />
            <div className="text-sm text-muted-foreground">
              a {q.noun.meaning} ({MEASURE_WORDS[q.classifier].pinyin})
            </div>
            <PlayButton text={phrase} label="Hear it" size="sm" />
          </CardContent>
        </Card>
      )}

      <div className="text-center">
        <Button variant="outline" onClick={next} disabled={picked === null}>
          {index < questions.length - 1 ? 'Next' : 'Finish'}
        </Button>
      </div>
    </div>
  );
}
