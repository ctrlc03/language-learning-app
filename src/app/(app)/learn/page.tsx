'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SpeakButton } from '@/components/shared/speak-button';
import { ExerciseShell } from '@/components/exercises/exercise-shell';
import { chineseGrammarRules, type GrammarRule } from '@/data/chinese/grammar';
import { buildChecksForRule } from '@/lib/learn/checks';
import { cn } from '@/lib/utils';
import type { Exercise, ExerciseResult } from '@/types';

// A guided study unit = one grammar rule: read the concept + examples ("teach"),
// then work through a few auto-derived checks ("test"), then a short recap.
type Phase = 'teach' | 'check' | 'done';

export default function LearnPage() {
  const [rule, setRule] = useState<GrammarRule | null>(null);

  if (!rule) {
    return <RulePicker onPick={setRule} />;
  }
  return <StudySession rule={rule} onExit={() => setRule(null)} />;
}

function RulePicker({ onPick }: { onPick: (rule: GrammarRule) => void }) {
  return (
    <div className="p-5 md:p-8 max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Learn</h1>
        <p className="text-muted-foreground text-xs mt-0.5">
          Study a pattern, then check you&apos;ve got it — {chineseGrammarRules.length} patterns
        </p>
      </div>
      <div className="space-y-2">
        {chineseGrammarRules.map((rule) => (
          <button key={rule.id} onClick={() => onPick(rule)} className="w-full text-left">
            <Card className="p-3.5 transition-all hover:border-primary/30 hover:bg-primary/[0.02]">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">
                    {rule.title}
                    <span className="text-muted-foreground font-normal ml-1.5">
                      {rule.titleChinese}
                    </span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-mono truncate">
                    {rule.pattern}
                  </p>
                </div>
                <span className="text-muted-foreground text-xs shrink-0">→</span>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}

function StudySession({ rule, onExit }: { rule: GrammarRule; onExit: () => void }) {
  // Checks are derived once per session so tile shuffles / distractors stay stable.
  const checks = useMemo<Exercise[]>(() => buildChecksForRule(rule), [rule]);
  const [phase, setPhase] = useState<Phase>('teach');
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);

  const handleComplete = useCallback((result: ExerciseResult) => {
    if (result.correct) setCorrect((c) => c + 1);
  }, []);

  const handleNext = useCallback(() => {
    setIndex((i) => {
      const next = i + 1;
      if (next >= checks.length) {
        setPhase('done');
        return i;
      }
      return next;
    });
  }, [checks.length]);

  if (phase === 'teach') {
    return (
      <TeachCard
        rule={rule}
        onExit={onExit}
        onStart={() => setPhase('check')}
        hasChecks={checks.length > 0}
      />
    );
  }

  if (phase === 'done') {
    return (
      <div className="p-5 md:p-8 max-w-xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-3xl">{correct === checks.length ? '🎉' : '👍'}</p>
            <div>
              <h2 className="text-lg font-bold">{rule.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {correct} / {checks.length} correct
              </p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{rule.explanation}</p>
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIndex(0);
                  setCorrect(0);
                  setPhase('teach');
                }}
              >
                Review again
              </Button>
              <Button className="flex-1" onClick={onExit}>
                Pick another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // phase === 'check'
  const exercise = checks[index];
  return (
    <div className="p-5 md:p-8 max-w-xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setPhase('teach')}>
          &larr; Concept
        </Button>
        <Badge variant="outline" className="text-[11px]">
          Check {index + 1} / {checks.length}
        </Badge>
      </div>
      <ExerciseShell
        key={exercise.id}
        exercise={exercise}
        onComplete={handleComplete}
        onNext={handleNext}
      />
    </div>
  );
}

function TeachCard({
  rule,
  onExit,
  onStart,
  hasChecks,
}: {
  rule: GrammarRule;
  onExit: () => void;
  onStart: () => void;
  hasChecks: boolean;
}) {
  return (
    <div className="p-5 md:p-8 max-w-xl mx-auto space-y-5">
      <Button variant="ghost" size="sm" onClick={onExit}>
        &larr; All patterns
      </Button>

      <div>
        <h1 className="text-xl font-bold tracking-tight">
          {rule.title}
          <span className="text-muted-foreground font-normal text-base ml-2">
            {rule.titleChinese}
          </span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1 font-mono">{rule.pattern}</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{rule.explanation}</p>
          <div className="space-y-2">
            {rule.examples.map((ex, i) => (
              <div key={i} className="bg-muted/50 rounded-lg px-3 py-2 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{ex.chinese}</p>
                  <SpeakButton text={ex.chinese} size="sm" />
                </div>
                <p className="text-xs text-muted-foreground">{ex.pinyin}</p>
                <p className="text-xs">{ex.english}</p>
                {ex.note && (
                  <Badge variant="outline" className="text-[9px] mt-1">
                    {ex.note}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button
        className={cn('w-full', !hasChecks && 'opacity-50')}
        size="lg"
        onClick={onStart}
        disabled={!hasChecks}
      >
        {hasChecks ? 'Check my understanding →' : 'No checks available'}
      </Button>
    </div>
  );
}
