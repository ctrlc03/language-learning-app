'use client';

import { useState } from 'react';
import type { Flashcard, SRSGrade } from '@/types';
import { FlipCard } from './flip-card';
import { GradeButtons } from './grade-buttons';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ReviewQueue } from '@/lib/srs/scheduler';

interface ReviewSessionProps {
  queue: ReviewQueue;
  currentCard: Flashcard | null;
  onGrade: (grade: SRSGrade) => void;
  onFinish: () => void;
}

export function ReviewSession({ queue, currentCard, onGrade, onFinish }: ReviewSessionProps) {
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  if (!currentCard) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="text-4xl">
          {reviewed > 0 ? '🎉' : '📚'}
        </div>
        <h2 className="text-xl font-bold">
          {reviewed > 0 ? 'Review Complete!' : 'No cards to review'}
        </h2>
        <p className="text-muted-foreground">
          {reviewed > 0
            ? `You reviewed ${reviewed} cards. Great work!`
            : 'All cards are up to date. Come back later!'
          }
        </p>
        <Button onClick={onFinish} variant="outline">
          Back to Decks
        </Button>
      </div>
    );
  }

  const handleGrade = (grade: SRSGrade) => {
    onGrade(grade);
    setFlipped(false);
    setReviewed(prev => prev + 1);
  };

  const remaining = queue.total;

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {reviewed} reviewed
        </span>
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{
              width: `${(reviewed / (reviewed + remaining)) * 100}%`,
            }}
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {remaining} left
        </span>
      </div>

      {/* Queue breakdown */}
      <div className="flex gap-2 justify-center text-xs">
        <span className="text-destructive">Learning: {queue.learning.length}</span>
        <span className="text-accent">Due: {queue.due.length}</span>
        <span className="text-primary">New: {queue.newCards.length}</span>
      </div>

      {/* Card */}
      <FlipCard card={currentCard} flipped={flipped} onFlip={() => setFlipped(!flipped)} />

      {/* Grade buttons (only when flipped) */}
      {flipped ? (
        <GradeButtons onGrade={handleGrade} />
      ) : (
        <div className="text-center">
          <Button variant="outline" onClick={() => setFlipped(true)}>
            Show Answer
          </Button>
        </div>
      )}
    </div>
  );
}
