'use client';

import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSRS } from '@/hooks/use-srs';
import { DeckBrowser } from '@/components/flashcards/deck-browser';
import { ReviewSession } from '@/components/flashcards/review-session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { createInitialSRSData } from '@/lib/srs/sm2';
import {
  getPrebuiltDecks,
  instantiatePrebuiltDeck,
  type PrebuiltDeckDef,
} from '@/lib/flashcards/prebuilt-decks';
import type { FlashcardDeck, Flashcard, SRSGrade } from '@/types';

type View = 'decks' | 'review' | 'create-deck' | 'generate';

export default function FlashcardsPage() {
  const { language, difficulty } = useLanguage();
  const [selectedDeckId, setSelectedDeckId] = useState<string | undefined>();
  const { decks, queue, currentCard, startReview, gradeCard, createDeck, addCard, loadDecks } = useSRS(selectedDeckId);
  const [view, setView] = useState<View>('decks');
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genTopic, setGenTopic] = useState('');
  const [creatingPrebuilt, setCreatingPrebuilt] = useState(false);

  const languageDecks = decks.filter(d => d.language === language);
  const prebuiltDecks = getPrebuiltDecks(language);

  // Check which prebuilt decks have already been instantiated
  const existingDeckNames = new Set(languageDecks.map(d => d.name));
  const availablePrebuilt = prebuiltDecks.filter(
    p => !existingDeckNames.has(p.name)
  );

  const handleCreateDeck = async () => {
    if (!newDeckName.trim()) return;
    const deck: FlashcardDeck = {
      id: nanoid(),
      name: newDeckName.trim(),
      language,
      description: newDeckDesc.trim(),
      cardCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await createDeck(deck);
    setNewDeckName('');
    setNewDeckDesc('');
    setView('decks');
  };

  const handleSelectDeck = async (deckId: string) => {
    setSelectedDeckId(deckId);
    await startReview(deckId);
    setView('review');
  };

  const handleSelectPrebuilt = async (prebuilt: PrebuiltDeckDef) => {
    setCreatingPrebuilt(true);
    try {
      const result = instantiatePrebuiltDeck(prebuilt.id);
      if (!result) return;

      await createDeck(result.deck);
      for (const card of result.cards) {
        await addCard(card);
      }
      await loadDecks();

      // Start review immediately
      setSelectedDeckId(result.deck.id);
      await startReview(result.deck.id);
      setView('review');
    } finally {
      setCreatingPrebuilt(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedDeckId) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          difficulty,
          topic: genTopic || undefined,
          count: 10,
        }),
      });
      const data = await res.json();
      if (data.cards) {
        for (const cardData of data.cards) {
          const card: Flashcard = {
            id: nanoid(),
            deckId: selectedDeckId,
            front: cardData.front,
            back: cardData.back,
            reading: cardData.reading,
            exampleSentence: cardData.exampleSentence,
            exampleTranslation: cardData.exampleTranslation,
            tags: [],
            srs: createInitialSRSData(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          await addCard(card);
        }
      }
      setGenTopic('');
      setView('review');
      await startReview(selectedDeckId);
    } catch (error) {
      console.error('Failed to generate cards:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleGrade = async (grade: SRSGrade) => {
    await gradeCard(grade);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {view === 'decks' && (
        <DeckBrowser
          decks={languageDecks}
          prebuiltDecks={availablePrebuilt}
          onSelectDeck={handleSelectDeck}
          onSelectPrebuilt={handleSelectPrebuilt}
          onCreateDeck={() => setView('create-deck')}
          creatingPrebuilt={creatingPrebuilt}
        />
      )}

      {view === 'create-deck' && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Deck</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Deck Name</label>
              <Input
                value={newDeckName}
                onChange={e => setNewDeckName(e.target.value)}
                placeholder="e.g., HSK 1 Vocabulary"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={newDeckDesc}
                onChange={e => setNewDeckDesc(e.target.value)}
                placeholder="Optional description"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateDeck} disabled={!newDeckName.trim()}>
                Create Deck
              </Button>
              <Button variant="ghost" onClick={() => setView('decks')}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {view === 'review' && queue && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => { setView('decks'); setSelectedDeckId(undefined); }}>
              &larr; Back to Decks
            </Button>
            <Button variant="outline" size="sm" onClick={() => setView('generate')}>
              + Generate Cards
            </Button>
          </div>
          <ReviewSession
            queue={queue}
            currentCard={currentCard}
            onGrade={handleGrade}
            onFinish={() => { setView('decks'); setSelectedDeckId(undefined); }}
          />
        </div>
      )}

      {view === 'generate' && (
        <Card>
          <CardHeader>
            <CardTitle>Generate Flashcards with AI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Topic (optional)</label>
              <Input
                value={genTopic}
                onChange={e => setGenTopic(e.target.value)}
                placeholder="e.g., food, travel, numbers"
                className="mt-1"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              AI will generate 10 flashcards for your {difficulty} {language === 'chinese' ? 'Chinese' : 'Japanese'} level.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleGenerate} disabled={generating}>
                {generating ? 'Generating...' : 'Generate 10 Cards'}
              </Button>
              <Button variant="ghost" onClick={() => setView('review')}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
