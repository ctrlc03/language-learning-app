'use client';

import { useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrentLesson } from '@/hooks/use-current-lesson';
import { useMastery } from '@/hooks/use-mastery';
import { useProgress } from '@/hooks/use-progress';
import { useSpeechInit } from '@/hooks/use-speech';
import {
  buildSpeakingPools,
  itemMeta,
  RUN_SIZE,
  sampleRun,
  type SpeakingItem,
  type SpeakingPart,
} from '@/lib/speaking/items';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnswerCard } from '@/components/speaking/answer-card';
import { RepeatCard } from '@/components/speaking/repeat-card';
import { TalkCard } from '@/components/speaking/talk-card';
import { useCaptureSupport } from '@/components/speaking/speaking-ui';

type View = 'select' | 'run' | 'summary';

interface RunResult {
  item: SpeakingItem;
  correct: boolean;
}

const PARTS: {
  part: SpeakingPart;
  zh: string;
  en: string;
  desc: string;
  unit: string;
}[] = [
  {
    part: 'repeat',
    zh: '听后重复',
    en: 'Listen and repeat',
    desc: 'Hear a short sentence, then say it back.',
    unit: 'sentences',
  },
  {
    part: 'answer',
    zh: '听后回答',
    en: 'Listen and answer',
    desc: 'Hear a question, then answer in one short sentence.',
    unit: 'questions',
  },
  {
    part: 'talk',
    zh: '回答问题',
    en: 'Answer questions',
    desc: 'Talk about a prompt for up to 90 seconds.',
    unit: 'prompts',
  },
];

function captureNote(support: { recognition: boolean; recording: boolean }): string {
  if (support.recognition) {
    return 'Speech recognition is available: the app checks what you say, and you can always overrule it.';
  }
  if (support.recording) {
    return "This browser can record you but can't recognise speech. You'll play your recording back beside the model and rate yourself.";
  }
  return 'No microphone is available here. You can still practise: say each answer aloud, then compare with the model and rate yourself.';
}

export default function SpeakingPage() {
  const { language } = useLanguage();
  const [lesson] = useCurrentLesson();
  const { recordActivity } = useProgress();
  const { map: mastery, record } = useMastery('speaking');
  const support = useCaptureSupport();
  const [view, setView] = useState<View>('select');
  const [part, setPart] = useState<SpeakingPart>('repeat');
  const [items, setItems] = useState<SpeakingItem[]>([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<RunResult[]>([]);

  useSpeechInit();

  const pools = useMemo(() => buildSpeakingPools(lesson), [lesson]);

  if (language !== 'chinese') {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center space-y-3">
        <h1>Speaking</h1>
        <p className="text-muted-foreground">
          Speaking practice follows the Mandarin HSKK exam. Switch the language to Chinese to use
          it.
        </p>
      </div>
    );
  }

  const start = (p: SpeakingPart) => {
    setPart(p);
    setItems(sampleRun(p, pools, mastery));
    setIndex(0);
    setResults([]);
    setView('run');
  };

  const handleDone = (correct: boolean) => {
    const item = items[index];
    record(item.id, correct, itemMeta(item));
    recordActivity({ exercises: 1, totalAnswers: 1, correctAnswers: correct ? 1 : 0 });
    setResults((r) => [...r, { item, correct }]);
    if (index < items.length - 1) setIndex((i) => i + 1);
    else setView('summary');
  };

  if (view === 'select') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="page-top">
          <div>
            <div className="greet">HSKK 初级 · practise speaking aloud</div>
            <h1>
              Speaking<span className="cjk"> · 口语</span>
            </h1>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{captureNote(support)}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PARTS.map((p) => {
            const available = pools[p.part].length;
            return (
              <button
                key={p.part}
                type="button"
                disabled={available === 0}
                onClick={() => start(p.part)}
                className="flex h-full flex-col gap-1 border border-border bg-card p-6 text-left transition-all hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50 disabled:hover:border-border disabled:hover:bg-card"
              >
                <span className="cjk text-lg font-semibold">{p.zh}</span>
                <span className="font-medium">{p.en}</span>
                <span className="text-sm text-muted-foreground">{p.desc}</span>
                <span className="mt-3 text-xs text-muted-foreground">
                  {available > 0
                    ? `${available} ${p.unit} up to lesson ${lesson} · ${Math.min(RUN_SIZE[p.part], available)} per round`
                    : `No ${p.unit} yet up to lesson ${lesson}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (view === 'summary') {
    const right = results.filter((r) => r.correct).length;
    const info = PARTS.find((p) => p.part === part);
    return (
      <div className="p-5 md:p-8 max-w-2xl mx-auto space-y-6">
        <div className="page-top">
          <div>
            <div className="greet">
              <span className="cjk">{info?.zh}</span> · {info?.en}
            </div>
            <h1>
              {right} of {results.length}
              <span className="cjk"> · 完成</span>
            </h1>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {results.map(({ item, correct }) => {
                const meta = itemMeta(item);
                return (
                  <li key={item.id} className="flex items-center justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <p className="cjk truncate">{meta.label}</p>
                      {meta.sublabel && (
                        <p className="truncate text-xs text-muted-foreground">{meta.sublabel}</p>
                      )}
                    </div>
                    <Badge variant={correct ? 'success' : 'destructive'}>
                      {correct ? 'Good' : 'Practise'}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" variant="primary" onClick={() => start(part)}>
            <span>Another round</span>
          </Button>
          <Button type="button" variant="outline" onClick={() => setView('select')}>
            <span>All parts</span>
          </Button>
        </div>
      </div>
    );
  }

  const item = items[index];
  const isLast = index === items.length - 1;
  const answered = results.length;
  const right = results.filter((r) => r.correct).length;

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="sm" onClick={() => setView('select')}>
          <span>&larr; Back</span>
        </Button>
        <div className="flex items-center gap-2">
          {answered > 0 && (
            <span className="text-xs text-muted-foreground">
              {right}/{answered}
            </span>
          )}
          <Badge variant="outline">
            {index + 1} / {items.length}
          </Badge>
        </div>
      </div>

      {item?.part === 'repeat' && (
        <RepeatCard key={item.id} item={item} isLast={isLast} onDone={handleDone} />
      )}
      {item?.part === 'answer' && (
        <AnswerCard key={item.id} item={item} isLast={isLast} onDone={handleDone} />
      )}
      {item?.part === 'talk' && (
        <TalkCard key={item.id} item={item} isLast={isLast} onDone={handleDone} />
      )}
    </div>
  );
}
