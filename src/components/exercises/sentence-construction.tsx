'use client';

import { useState } from 'react';
import type { SentenceConstructionData } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SentenceConstructionProps {
  data: SentenceConstructionData;
  onSubmit: (answer: string, isCorrect: boolean) => void;
  disabled: boolean;
}

// A word tile paired with its (optional) pinyin reading so the two stay
// aligned through shuffles and moves.
interface Tile {
  word: string;
  reading: string | null;
}

function buildTiles(data: SentenceConstructionData): Tile[] {
  return data.words.map((word, i) => ({
    word,
    reading: data.wordReadings?.[i] ?? null,
  }));
}

function shuffled(tiles: Tile[]): Tile[] {
  return [...tiles].sort(() => Math.random() - 0.5);
}

export function SentenceConstruction({ data, onSubmit, disabled }: SentenceConstructionProps) {
  const [selected, setSelected] = useState<Tile[]>([]);
  const [available, setAvailable] = useState<Tile[]>(() => shuffled(buildTiles(data)));

  const handleSelect = (tile: Tile, index: number) => {
    if (disabled) return;
    setSelected(prev => [...prev, tile]);
    setAvailable(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeselect = (tile: Tile, index: number) => {
    if (disabled) return;
    setAvailable(prev => [...prev, tile]);
    setSelected(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const answer = selected.map(t => t.word).join('');
    const isCorrect = answer === data.correctOrder;
    onSubmit(answer, isCorrect);
  };

  const handleClear = () => {
    setAvailable(shuffled(buildTiles(data)));
    setSelected([]);
  };

  const tileLabel = (tile: Tile) => (
    <span className="inline-flex flex-col items-center leading-tight">
      <span>{tile.word}</span>
      {tile.reading && (
        <span className="text-[10px] text-muted-foreground font-normal">{tile.reading}</span>
      )}
    </span>
  );

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Translation: <span className="text-foreground/80">{data.translation}</span>
      </p>

      {/* Drop area */}
      <div className="min-h-[52px] px-4 py-3 rounded-xl border-2 border-dashed border-border/60 flex flex-wrap gap-2 items-center">
        {selected.length === 0 && (
          <span className="text-muted-foreground/50 text-xs">Tap words below to build the sentence...</span>
        )}
        {selected.map((tile, i) => (
          <button
            key={`s-${i}`}
            onClick={() => handleDeselect(tile, i)}
            disabled={disabled}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              disabled
                ? 'bg-muted text-muted-foreground'
                : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 active:scale-[0.98]'
            )}
          >
            {tileLabel(tile)}
          </button>
        ))}
      </div>

      {/* Word bank */}
      <div className="flex flex-wrap gap-2">
        {available.map((tile, i) => (
          <button
            key={`a-${i}`}
            onClick={() => handleSelect(tile, i)}
            disabled={disabled}
            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-border bg-background hover:border-primary/40 hover:bg-primary/[0.03] transition-all active:scale-[0.98] disabled:opacity-40"
          >
            {tileLabel(tile)}
          </button>
        ))}
      </div>

      {!disabled && (
        <div className="flex gap-2 pt-1">
          <Button onClick={handleSubmit} disabled={selected.length === 0}>
            Check
          </Button>
          <Button variant="ghost" onClick={handleClear} disabled={selected.length === 0}>
            Clear
          </Button>
        </div>
      )}

      {disabled && (
        <div className="text-xs text-muted-foreground pt-1 space-y-0.5">
          <p>
            Correct: <span className="font-medium text-foreground">{data.correctOrder}</span>
          </p>
          {data.correctPinyin && <p className="tracking-wide">{data.correctPinyin}</p>}
        </div>
      )}
    </div>
  );
}
