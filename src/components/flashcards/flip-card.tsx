'use client';

import { useState } from 'react';
import type { Flashcard } from '@/types';
import { SpeakButton } from '@/components/shared/speak-button';
import { CJKText } from '@/components/shared/cjk-text';
import { cn } from '@/lib/utils';

interface FlipCardProps {
  card: Flashcard;
  flipped: boolean;
  onFlip: () => void;
}

export function FlipCard({ card, flipped, onFlip }: FlipCardProps) {
  return (
    <div className="perspective-1000 w-full max-w-md mx-auto" style={{ perspective: '1000px' }}>
      <div
        role="button"
        tabIndex={0}
        onClick={onFlip}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onFlip(); } }}
        className={cn(
          'relative w-full h-64 transition-transform duration-500 cursor-pointer',
          'transform-style-preserve-3d',
          flipped && '[transform:rotateY(180deg)]'
        )}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl border border-border bg-card shadow-lg flex flex-col items-center justify-center p-6 backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <CJKText text={card.front} reading={card.reading} className="text-3xl font-bold" />
          <p className="text-sm text-muted-foreground mt-2">{card.reading}</p>
          <div className="absolute bottom-4 right-4" onClick={e => e.stopPropagation()}>
            <SpeakButton text={card.front} />
          </div>
          <p className="absolute bottom-4 left-4 text-xs text-muted-foreground">Tap to flip</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl border border-border bg-card shadow-lg flex flex-col items-center justify-center p-6 [transform:rotateY(180deg)] backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="text-2xl font-bold">{card.back}</p>
          {card.exampleSentence && (
            <div className="mt-4 text-center">
              <p className="text-sm text-foreground">{card.exampleSentence}</p>
              {card.exampleTranslation && (
                <p className="text-xs text-muted-foreground mt-1">{card.exampleTranslation}</p>
              )}
            </div>
          )}
          {card.notes && (
            <p className="text-xs text-muted-foreground mt-2 italic">{card.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}
