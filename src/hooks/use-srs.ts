'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Flashcard, FlashcardDeck, SRSGrade } from '@/types';
import { useStorage } from '@/contexts/StorageContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { StorageKeys, StoragePrefixes } from '@/lib/storage/interface';
import { calculateNextReview } from '@/lib/srs/sm2';
import { saveDeck, syncPrebuiltDecks } from '@/lib/flashcards/prebuilt-decks';
import {
  buildReviewQueue,
  getNextCard,
  newCardsLeftToday,
  removeCardFromQueue,
  type ReviewQueue,
} from '@/lib/srs/scheduler';

export function useSRS(deckId?: string) {
  const storage = useStorage();
  const { settings } = useLanguage();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [queue, setQueue] = useState<ReviewQueue | null>(null);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDecks = useCallback(async () => {
    const allDecks = await storage.getAll<FlashcardDeck>(StoragePrefixes.decks);
    // Keys are random ids, so storage order is arbitrary: list decks in the order they were added.
    allDecks.sort((a, b) => a.createdAt - b.createdAt);
    setDecks(allDecks);
    return allDecks;
  }, [storage]);

  const loadCards = useCallback(
    async (did?: string) => {
      const targetDeck = did ?? deckId;
      if (!targetDeck) return [];

      const allCards = await storage.query<Flashcard>(
        StoragePrefixes.cards,
        (c) => c.deckId === targetDeck,
      );
      setCards(allCards);
      return allCards;
    },
    [storage, deckId],
  );

  const startReview = useCallback(
    async (did?: string) => {
      const targetDeck = did ?? deckId;
      if (!targetDeck) return;

      const deckCards = await loadCards(targetDeck);
      const newLeft = await newCardsLeftToday(storage, settings.maxNewCardsPerDay);
      const reviewQueue = buildReviewQueue(deckCards, newLeft);
      setQueue(reviewQueue);
      setCurrentCard(getNextCard(reviewQueue));
    },
    [deckId, loadCards, storage, settings.maxNewCardsPerDay],
  );

  const gradeCard = useCallback(
    async (grade: SRSGrade) => {
      if (!currentCard || !queue) return;

      const updatedSRS = calculateNextReview(currentCard.srs, grade);
      const updatedCard: Flashcard = {
        ...currentCard,
        srs: updatedSRS,
        updatedAt: Date.now(),
      };

      await storage.set(StorageKeys.card(updatedCard.id), updatedCard);

      // If failed, add back to learning queue
      const newQueue = removeCardFromQueue(queue, currentCard.id);
      if (grade < 3) {
        newQueue.learning.push(updatedCard);
        newQueue.total += 1;
      }

      setQueue(newQueue);
      setCurrentCard(getNextCard(newQueue));

      // Update local cards state
      setCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
    },
    [currentCard, queue, storage],
  );

  // Reloads rather than appends, so a deck-list load already in flight can't drop the new deck.
  const createDeck = useCallback(
    async (deck: FlashcardDeck, deckCards: Flashcard[]) => {
      const stored = await saveDeck(storage, deck, deckCards);
      await loadDecks();
      return stored;
    },
    [storage, loadDecks],
  );

  // Bring stored copies of shipped decks in step with the current data, and
  // reload the list if that changed anything.
  const syncDecks = useCallback(async () => {
    if (await syncPrebuiltDecks(storage)) await loadDecks();
  }, [storage, loadDecks]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadDecks();
      if (deckId) await loadCards(deckId);
      setLoading(false);
    })();
  }, [deckId, loadDecks, loadCards]);

  return {
    cards,
    decks,
    queue,
    currentCard,
    loading,
    loadDecks,
    loadCards,
    startReview,
    gradeCard,
    createDeck,
    syncDecks,
  };
}
