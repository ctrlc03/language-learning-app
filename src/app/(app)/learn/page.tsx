'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SpeakButton } from '@/components/shared/speak-button';
import { ExerciseShell } from '@/components/exercises/exercise-shell';
import { chineseGrammarRules, type GrammarRule } from '@/data/chinese/grammar';
import { getLessonsWithNotes, chineseLessons, type LessonEntry } from '@/data/chinese/vocabulary';
import { LessonNotes } from '@/components/learn/lesson-notes';
import { useMastery } from '@/hooks/use-mastery';
import { useProgress } from '@/hooks/use-progress';
import { useMistakeLog } from '@/hooks/use-mistakes';
import { buildChecksForRule } from '@/lib/learn/checks';
import { cn } from '@/lib/utils';
import type { Exercise, ExerciseResult } from '@/types';

// A guided study unit = one grammar rule: read the concept + examples ("teach"),
// then work through a few auto-derived checks ("test"), then a short recap.
type Phase = 'teach' | 'check' | 'done';
type Tab = 'patterns' | 'lessons';

// Lessons that actually have a pattern attached, newest first — the filter row.
function lessonsWithRules(): LessonEntry[] {
  const tagged = new Set(chineseGrammarRules.flatMap((r) => r.lessons));
  return chineseLessons.filter((l) => tagged.has(l.lesson)).sort((a, b) => b.lesson - a.lesson);
}

export default function LearnPage() {
  const [rule, setRule] = useState<GrammarRule | null>(null);
  const [lesson, setLesson] = useState<LessonEntry | null>(null);

  if (rule) return <StudySession rule={rule} onExit={() => setRule(null)} />;
  if (lesson) return <LessonNotes lesson={lesson} onExit={() => setLesson(null)} />;
  return <Picker onPickRule={setRule} onPickLesson={setLesson} />;
}

function Picker({
  onPickRule,
  onPickLesson,
}: {
  onPickRule: (rule: GrammarRule) => void;
  onPickLesson: (lesson: LessonEntry) => void;
}) {
  const [tab, setTab] = useState<Tab>('patterns');
  const [lessonFilter, setLessonFilter] = useState<number | null>(null);

  const lessonOptions = useMemo(() => lessonsWithRules(), []);
  const noteLessons = useMemo(() => getLessonsWithNotes(), []);
  const rules = useMemo(
    () =>
      lessonFilter === null
        ? chineseGrammarRules
        : chineseGrammarRules.filter((r) => r.lessons.includes(lessonFilter)),
    [lessonFilter],
  );

  return (
    <div className="p-5 md:p-8 max-w-xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Learn</h1>
        <p className="text-muted-foreground text-xs mt-0.5">
          {tab === 'patterns'
            ? `Study a pattern, then check you've got it — ${rules.length} patterns`
            : `Lesson write-ups — ${noteLessons.length} available`}
        </p>
      </div>

      <div className="flex gap-1.5">
        {(['patterns', 'lessons'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs capitalize transition-colors',
              tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'lessons' ? (
        <div className="space-y-2">
          {noteLessons.length === 0 && (
            <p className="text-xs text-muted-foreground">No lesson notes yet.</p>
          )}
          {noteLessons.map((lesson) => (
            <button
              key={lesson.lesson}
              onClick={() => onPickLesson(lesson)}
              className="w-full text-left"
            >
              <Card className="p-3.5 transition-all hover:border-primary/30 hover:bg-primary/[0.02]">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {lesson.titleChinese}
                      <span className="text-muted-foreground font-normal ml-1.5">
                        {lesson.title}
                      </span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      L{lesson.lesson} · {lesson.notes?.length ?? 0} sections ·{' '}
                      {lesson.vocabulary.length} words
                    </p>
                  </div>
                  <span className="text-muted-foreground text-xs shrink-0">→</span>
                </div>
              </Card>
            </button>
          ))}
        </div>
      ) : (
        <RuleList
          rules={rules}
          lessonOptions={lessonOptions}
          lessonFilter={lessonFilter}
          onFilter={setLessonFilter}
          onPick={onPickRule}
        />
      )}
    </div>
  );
}

function RuleList({
  rules,
  lessonOptions,
  lessonFilter,
  onFilter,
  onPick,
}: {
  rules: GrammarRule[];
  lessonOptions: LessonEntry[];
  lessonFilter: number | null;
  onFilter: (lesson: number | null) => void;
  onPick: (rule: GrammarRule) => void;
}) {
  return (
    <>
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        <FilterChip active={lessonFilter === null} onClick={() => onFilter(null)}>
          All
        </FilterChip>
        {lessonOptions.map((l) => (
          <FilterChip
            key={l.lesson}
            active={lessonFilter === l.lesson}
            onClick={() => onFilter(l.lesson)}
            title={l.title}
          >
            L{l.lesson}
          </FilterChip>
        ))}
      </div>
      <div className="space-y-2">
        {rules.map((rule) => (
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
    </>
  );
}

function FilterChip({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'shrink-0 px-2.5 py-1 rounded-full text-[11px] transition-colors',
        active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
      )}
    >
      {children}
    </button>
  );
}

function StudySession({ rule, onExit }: { rule: GrammarRule; onExit: () => void }) {
  // Checks are derived once per session so tile shuffles / distractors stay stable.
  const checks = useMemo<Exercise[]>(() => buildChecksForRule(rule), [rule]);
  const [phase, setPhase] = useState<Phase>('teach');
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);

  const { recordActivity } = useProgress();
  const { record: recordGrammar } = useMastery('grammar');
  const { recordExercise } = useMistakeLog();

  const handleComplete = useCallback(
    (result: ExerciseResult) => {
      if (result.correct) setCorrect((c) => c + 1);
      void recordActivity({
        exercises: 1,
        totalAnswers: 1,
        correctAnswers: result.correct ? 1 : 0,
      });
      recordGrammar(rule.id, result.correct, {
        label: rule.title,
        sublabel: rule.pattern,
        group: 'grammar',
      });
      const exercise = checks[index];
      if (exercise) recordExercise(exercise, result.correct, 'learn', result.userAnswer);
    },
    [recordActivity, recordGrammar, recordExercise, rule, checks, index],
  );

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
