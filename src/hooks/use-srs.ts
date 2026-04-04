'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Flashcard, FlashcardDeck, SRSGrade } from '@/types';
import { useStorage } from '@/contexts/StorageContext';
import { StorageKeys, StoragePrefixes } from '@/lib/storage/interface';
import { calculateNextReview } from '@/lib/srs/sm2';
import { buildReviewQueue, getNextCard, removeCardFromQueue, type ReviewQueue } from '@/lib/srs/scheduler';

export function useSRS(deckId?: string) {
  const storage = useStorage();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [queue, setQueue] = useState<ReviewQueue | null>(null);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDecks = useCallback(async () => {
    const allDecks = await storage.getAll<FlashcardDeck>(StoragePrefixes.decks);
    setDecks(allDecks);
    return allDecks;
  }, [storage]);

  const loadCards = useCallback(
    async (did?: string) => {
      const targetDeck = did ?? deckId;
      if (!targetDeck) return [];

      const allCards = await storage.query<Flashcard>(
        StoragePrefixes.cards,
        (c) => c.deckId === targetDeck
      );
      setCards(allCards);
      return allCards;
    },
    [storage, deckId]
  );

  const startReview = useCallback(
    async (did?: string) => {
      const targetDeck = did ?? deckId;
      if (!targetDeck) return;

      const deckCards = await loadCards(targetDeck);
      const reviewQueue = buildReviewQueue(deckCards);
      setQueue(reviewQueue);
      setCurrentCard(getNextCard(reviewQueue));
    },
    [deckId, loadCards]
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
      setCards(prev =>
        prev.map(c => (c.id === updatedCard.id ? updatedCard : c))
      );
    },
    [currentCard, queue, storage]
  );

  const addCard = useCallback(
    async (card: Flashcard) => {
      await storage.set(StorageKeys.card(card.id), card);

      // Update deck card count
      const deck = await storage.get<FlashcardDeck>(StorageKeys.deck(card.deckId));
      if (deck) {
        deck.cardCount += 1;
        deck.updatedAt = Date.now();
        await storage.set(StorageKeys.deck(deck.id), deck);
      }

      setCards(prev => [...prev, card]);
    },
    [storage]
  );

  const createDeck = useCallback(
    async (deck: FlashcardDeck) => {
      await storage.set(StorageKeys.deck(deck.id), deck);
      setDecks(prev => [...prev, deck]);
      return deck;
    },
    [storage]
  );

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
    addCard,
    createDeck,
  };
}
