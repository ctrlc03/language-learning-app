'use client';

import type { FlashcardDeck } from '@/types';
import type { PrebuiltDeckDef } from '@/lib/flashcards/prebuilt-decks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface DeckBrowserProps {
  decks: FlashcardDeck[];
  prebuiltDecks?: PrebuiltDeckDef[];
  onSelectDeck: (deckId: string) => void;
  onSelectPrebuilt?: (deck: PrebuiltDeckDef) => void;
  onCreateDeck: () => void;
  creatingPrebuilt?: boolean;
}

export function DeckBrowser({
  decks,
  prebuiltDecks = [],
  onSelectDeck,
  onSelectPrebuilt,
  onCreateDeck,
  creatingPrebuilt = false,
}: DeckBrowserProps) {
  const hasDecks = decks.length > 0;
  const hasPrebuilt = prebuiltDecks.length > 0;

  if (!hasDecks && !hasPrebuilt) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="text-4xl">📚</div>
        <h2 className="text-xl font-bold">No decks yet</h2>
        <p className="text-muted-foreground">
          Create your first flashcard deck to start reviewing vocabulary!
        </p>
        <Button onClick={onCreateDeck}>Create Deck</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pre-built decks section */}
      {hasPrebuilt && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Pre-built Decks</h2>
          <p className="text-sm text-muted-foreground">
            Ready-made decks from your course materials. Click to add and start reviewing.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {prebuiltDecks.map(deck => (
              <button
                key={deck.id}
                onClick={() => onSelectPrebuilt?.(deck)}
                disabled={creatingPrebuilt}
                className="text-left disabled:opacity-50"
              >
                <Card className="p-4 hover:border-primary/50 hover:shadow-md transition-all border-dashed">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{deck.name}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{deck.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline">{deck.cardCount} cards</Badge>
                      <Badge variant="default" className="text-[10px]">Pre-built</Badge>
                    </div>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* User decks section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {hasPrebuilt ? 'Your Decks' : 'Your Decks'}
          </h2>
          <Button onClick={onCreateDeck} size="sm">
            + New Deck
          </Button>
        </div>

        {!hasDecks && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No custom decks yet. Create one or try a pre-built deck above.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {decks.map(deck => (
            <button key={deck.id} onClick={() => onSelectDeck(deck.id)} className="text-left">
              <Card className="p-4 hover:border-primary/50 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{deck.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{deck.description}</p>
                  </div>
                  <Badge variant="outline">{deck.cardCount} cards</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Updated {formatDate(deck.updatedAt)}
                </p>
              </Card>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
