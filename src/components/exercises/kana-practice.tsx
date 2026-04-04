'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  hiragana,
  katakana,
  kanaGroupLabels,
  type KanaChar,
  type KanaSet,
} from '@/data/japanese/kana';

type KanaType = 'hiragana' | 'katakana';
type PracticeMode = 'chart' | 'recognize' | 'type';

interface KanaPracticeProps {
  onBack: () => void;
}

// Simple seeded shuffle
function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// --- Chart View ---

function KanaChart({ set }: { set: KanaSet }) {
  const grouped = useMemo(() => {
    const map = new Map<string, KanaChar[]>();
    for (const ch of set.characters) {
      const arr = map.get(ch.group) || [];
      arr.push(ch);
      map.set(ch.group, arr);
    }
    return map;
  }, [set]);

  return (
    <div className="space-y-5">
      {Array.from(grouped.entries()).map(([group, chars]) => (
        <div key={group}>
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">
            {kanaGroupLabels[group] ?? group}
          </h3>
          <div className="grid grid-cols-5 gap-1.5">
            {chars.map(ch => (
              <div
                key={ch.kana}
                className="flex flex-col items-center p-2 rounded-lg border border-border/50 bg-card"
              >
                <span className="text-xl font-bold">{ch.kana}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">{ch.romaji}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Recognition Quiz ---

function RecognizeQuiz({
  set,
  groups,
}: {
  set: KanaSet;
  groups: Set<string>;
}) {
  const pool = useMemo(
    () => set.characters.filter(c => groups.has(c.group)),
    [set, groups],
  );
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const queue = useMemo(() => shuffle(pool, 42 + score.total), [pool, score.total]);
  const current = queue[idx % queue.length];

  const options = useMemo(() => {
    // pick 3 distractors with different romaji
    const others = pool.filter(c => c.romaji !== current.romaji);
    const picked = shuffle(others, idx * 7 + 13).slice(0, 3);
    const all = [...picked.map(p => p.romaji), current.romaji];
    return shuffle(all, idx * 3 + 7);
  }, [current, pool, idx]);

  const correctIdx = options.indexOf(current.romaji);

  const handleSelect = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    setScore(prev => ({
      correct: prev.correct + (i === correctIdx ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleNext = () => {
    setSelected(null);
    setIdx(prev => prev + 1);
  };

  return (
    <div className="space-y-5">
      {score.total > 0 && (
        <div className="flex justify-end">
          <Badge variant={score.correct / score.total >= 0.7 ? 'success' : 'warning'}>
            {score.correct}/{score.total} correct
          </Badge>
        </div>
      )}

      <div className="text-center py-6">
        <p className="text-6xl md:text-7xl font-bold">{current.kana}</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {options.map((opt, i) => (
          <button
            key={`${idx}-${i}`}
            onClick={() => handleSelect(i)}
            disabled={selected !== null}
            className={cn(
              'px-4 py-3.5 rounded-xl border text-center text-sm font-medium transition-all',
              selected === null
                ? 'border-border hover:border-primary/40 hover:bg-primary/[0.03] active:scale-[0.98]'
                : i === correctIdx
                  ? 'border-success/50 bg-success/10 text-success'
                  : selected === i
                    ? 'border-destructive/50 bg-destructive/10 text-destructive'
                    : 'border-border/50 opacity-40',
            )}
          >
            {opt}
          </button>
        ))}
      </div>

      {selected !== null && (
        <div className="space-y-3">
          <p className="text-xs text-center text-muted-foreground">
            <span className="font-medium text-foreground">{current.kana}</span>
            {' = '}
            {current.romaji}
          </p>
          <div className="flex justify-center">
            <Button size="sm" onClick={handleNext}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Type Quiz ---

function TypeQuiz({
  set,
  groups,
}: {
  set: KanaSet;
  groups: Set<string>;
}) {
  const pool = useMemo(
    () => set.characters.filter(c => groups.has(c.group)),
    [set, groups],
  );
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const queue = useMemo(() => shuffle(pool, 99 + score.total), [pool, score.total]);
  const current = queue[idx % queue.length];

  const handleCheck = () => {
    const answer = input.trim().toLowerCase();
    const isCorrect = answer === current.romaji;
    setResult(isCorrect ? 'correct' : 'wrong');
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleNext = () => {
    setResult(null);
    setInput('');
    setIdx(prev => prev + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (result !== null) handleNext();
      else if (input.trim()) handleCheck();
    }
  };

  return (
    <div className="space-y-5">
      {score.total > 0 && (
        <div className="flex justify-end">
          <Badge variant={score.correct / score.total >= 0.7 ? 'success' : 'warning'}>
            {score.correct}/{score.total} correct
          </Badge>
        </div>
      )}

      <div className="text-center py-6">
        <p className="text-6xl md:text-7xl font-bold">{current.kana}</p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={result !== null}
          placeholder="Type the romaji..."
          autoFocus
          className={cn(
            'flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none transition-all',
            result === 'correct'
              ? 'border-success/50 bg-success/10'
              : result === 'wrong'
                ? 'border-destructive/50 bg-destructive/10'
                : 'border-border focus:border-primary/40',
          )}
        />
        {result === null ? (
          <Button size="sm" onClick={handleCheck} disabled={!input.trim()}>
            Check
          </Button>
        ) : (
          <Button size="sm" onClick={handleNext}>
            Next
          </Button>
        )}
      </div>

      {result !== null && (
        <p className="text-xs text-center text-muted-foreground">
          <span className="font-medium text-foreground">{current.kana}</span>
          {' = '}
          <span className={result === 'correct' ? 'text-success' : 'text-destructive'}>
            {current.romaji}
          </span>
        </p>
      )}
    </div>
  );
}

// --- Group Picker ---

const BASE_GROUPS = ['vowels', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w'];
const DAKUTEN_GROUPS = ['g', 'z', 'd', 'b', 'p'];
const COMBO_GROUPS = [
  'k-combo', 's-combo', 't-combo', 'n-combo', 'h-combo', 'm-combo', 'r-combo',
  'g-combo', 'j-combo', 'b-combo', 'p-combo',
];

const GROUP_SECTIONS = [
  { label: 'Basic (gojūon)', groups: BASE_GROUPS },
  { label: 'Dakuten / Handakuten', groups: DAKUTEN_GROUPS },
  { label: 'Combinations (yōon)', groups: COMBO_GROUPS },
];

// --- Main Component ---

export function KanaPractice({ onBack }: KanaPracticeProps) {
  const [kanaType, setKanaType] = useState<KanaType>('hiragana');
  const [mode, setMode] = useState<PracticeMode>('chart');
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(
    () => new Set(BASE_GROUPS),
  );

  const set = kanaType === 'hiragana' ? hiragana : katakana;

  const toggleGroup = (g: string) => {
    setSelectedGroups(prev => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  };

  const selectSection = (groups: string[]) => {
    setSelectedGroups(prev => {
      const next = new Set(prev);
      const allSelected = groups.every(g => next.has(g));
      for (const g of groups) {
        if (allSelected) next.delete(g);
        else next.add(g);
      }
      return next;
    });
  };

  const selectAll = useCallback(() => {
    const all = [...BASE_GROUPS, ...DAKUTEN_GROUPS, ...COMBO_GROUPS];
    setSelectedGroups(prev => {
      if (prev.size === all.length) return new Set(BASE_GROUPS);
      return new Set(all);
    });
  }, []);

  const activeCount = set.characters.filter(c => selectedGroups.has(c.group)).length;

  return (
    <div className="p-5 md:p-8 max-w-xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          &larr; Back
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Kana Practice</h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Learn hiragana & katakana
          </p>
        </div>
      </div>

      {/* Kana type toggle */}
      <div className="flex gap-2">
        {(['hiragana', 'katakana'] as const).map(t => (
          <button
            key={t}
            onClick={() => setKanaType(t)}
            className={cn(
              'flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all',
              kanaType === t
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border hover:border-primary/30',
            )}
          >
            {t === 'hiragana' ? 'ひらがな Hiragana' : 'カタカナ Katakana'}
          </button>
        ))}
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        {([
          { key: 'chart' as const, label: 'Chart' },
          { key: 'recognize' as const, label: 'Recognize' },
          { key: 'type' as const, label: 'Type' },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={cn(
              'flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all',
              mode === key
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border hover:border-primary/30',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Group selection (for quiz modes) */}
      {mode !== 'chart' && (
        <Card className="p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground">
              Practice groups ({activeCount} characters)
            </p>
            <button
              onClick={selectAll}
              className="text-[10px] text-primary hover:underline"
            >
              {selectedGroups.size === BASE_GROUPS.length + DAKUTEN_GROUPS.length + COMBO_GROUPS.length
                ? 'Basic only'
                : 'Select all'}
            </button>
          </div>
          {GROUP_SECTIONS.map(section => (
            <div key={section.label} className="space-y-1.5">
              <button
                onClick={() => selectSection(section.groups)}
                className="text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {section.label}
              </button>
              <div className="flex flex-wrap gap-1">
                {section.groups.map(g => (
                  <button
                    key={g}
                    onClick={() => toggleGroup(g)}
                    className={cn(
                      'px-2 py-0.5 rounded text-[10px] border transition-all',
                      selectedGroups.has(g)
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-border/50 text-muted-foreground hover:border-primary/30',
                    )}
                  >
                    {(kanaGroupLabels[g] ?? g).split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Content */}
      {mode === 'chart' && <KanaChart set={set} />}
      {mode === 'recognize' && activeCount >= 4 && (
        <RecognizeQuiz key={`${kanaType}-rec-${Array.from(selectedGroups).join()}`} set={set} groups={selectedGroups} />
      )}
      {mode === 'type' && activeCount >= 1 && (
        <TypeQuiz key={`${kanaType}-type-${Array.from(selectedGroups).join()}`} set={set} groups={selectedGroups} />
      )}
      {mode !== 'chart' && activeCount < (mode === 'recognize' ? 4 : 1) && (
        <p className="text-sm text-center text-muted-foreground py-8">
          Select at least {mode === 'recognize' ? '4' : '1'} characters to practice.
        </p>
      )}
    </div>
  );
}
