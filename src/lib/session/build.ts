/**
 * Builds the mixed daily session.
 *
 * Every other mode in the app asks you to choose one activity and then stay in
 * it. This builds a single short queue that interleaves them — due flashcards,
 * a grammar pattern check, offline exercises, and weak tone items — because
 * interleaved practice retains better than blocked practice, and because it
 * removes the "which mode today?" decision that quietly kills streaks.
 *
 * Everything here is offline: cards come from storage, exercises and grammar
 * checks are generated from shipped data. No API call is needed to study.
 */

import type { Flashcard, FlashcardDeck, Language, DifficultyLevel, Exercise } from '@/types';
import type { StorageAdapter } from '@/types';
import { StoragePrefixes } from '@/lib/storage/interface';
import { buildReviewQueue } from '@/lib/srs/scheduler';
import { chineseGrammarRules, type GrammarRule } from '@/data/chinese/grammar';
import { buildChecksForRule } from '@/lib/learn/checks';
import { getOfflineExercise } from '@/lib/exercises/offline';
import { getToneIdItems, makeRng, type ToneIdItem } from '@/lib/tones/utils';
import { pickWeight, weightedSample, type MasteryMap } from '@/lib/mastery';

export type SessionItem =
  | { kind: 'card'; id: string; card: Flashcard }
  | { kind: 'exercise'; id: string; label: string; exercise: Exercise; ruleId?: string }
  | { kind: 'tone'; id: string; item: ToneIdItem };

export interface SessionPlan {
  items: SessionItem[];
  /** Rule the grammar checks came from, so the summary can link back to it. */
  rule: GrammarRule | null;
  cardCount: number;
}

export interface SessionOptions {
  language: Language;
  difficulty: DifficultyLevel;
  /** Mastery map for the 'grammar' domain — biases which pattern comes up. */
  grammarMastery: MasteryMap;
  /** Mastery map for the 'tones' domain — biases which syllables come up. */
  toneMastery: MasteryMap;
  /** Overridable for tests; defaults to Date.now(). */
  seed?: number;
  maxCards?: number;
}

const DEFAULT_MAX_CARDS = 12;
const GRAMMAR_CHECKS = 2;
const TONE_ITEMS = 3;

/** Due + learning + a few new cards, across every deck in the active language. */
export async function loadDueCards(
  storage: StorageAdapter,
  language: Language,
  max: number,
): Promise<Flashcard[]> {
  const decks = await storage.getAll<FlashcardDeck>(StoragePrefixes.decks);
  const deckIds = new Set(decks.filter((d) => d.language === language).map((d) => d.id));
  if (deckIds.size === 0) return [];

  const cards = await storage.query<Flashcard>(StoragePrefixes.cards, (c) => deckIds.has(c.deckId));
  // A quarter of the slots go to new cards at most — a daily session should be
  // mostly retrieval of things already seen.
  const queue = buildReviewQueue(cards, Math.max(1, Math.floor(max / 4)));
  return [...queue.learning, ...queue.due, ...queue.newCards].slice(0, max);
}

/** Pick the grammar pattern to drill: weakest / least-seen first. */
export function pickRule(mastery: MasteryMap, rng: () => number): GrammarRule | null {
  const withChecks = chineseGrammarRules.filter((r) => buildChecksForRule(r).length > 0);
  if (withChecks.length === 0) return null;
  return weightedSample(withChecks, (r) => pickWeight(mastery[r.id]), 1, rng)[0] ?? null;
}

/**
 * Round-robin the buckets so no two consecutive items are the same kind where
 * possible — cards are the biggest bucket, so they end up spread through.
 */
function interleave(buckets: SessionItem[][]): SessionItem[] {
  const out: SessionItem[] = [];
  const queues = buckets.filter((b) => b.length > 0).map((b) => [...b]);
  // Longest bucket first so it gets the most turns without clumping at the end.
  queues.sort((a, b) => b.length - a.length);
  while (queues.some((q) => q.length > 0)) {
    for (const q of queues) {
      const next = q.shift();
      if (next) out.push(next);
    }
  }
  return out;
}

export async function buildSession(
  storage: StorageAdapter,
  opts: SessionOptions,
): Promise<SessionPlan> {
  const {
    language,
    difficulty,
    grammarMastery,
    toneMastery,
    seed = Date.now(),
    maxCards = DEFAULT_MAX_CARDS,
  } = opts;
  const rng = makeRng(seed);

  const cards = await loadDueCards(storage, language, maxCards);
  const cardItems: SessionItem[] = cards.map((card) => ({
    kind: 'card',
    id: `card:${card.id}`,
    card,
  }));

  // Grammar: one pattern, a couple of checks derived from its own examples.
  const rule = language === 'chinese' ? pickRule(grammarMastery, rng) : null;
  const grammarItems: SessionItem[] = rule
    ? buildChecksForRule(rule)
        .slice(0, GRAMMAR_CHECKS)
        .map((exercise) => ({
          kind: 'exercise' as const,
          id: `grammar:${exercise.id}`,
          label: rule.title,
          exercise,
          ruleId: rule.id,
        }))
    : [];

  // Exercises: one reading-comprehension pass over a dialogue, plus recall drills.
  const exerciseItems: SessionItem[] = [];
  const seen: string[] = [];
  for (const [type, label] of [
    ['dialogue-comprehension', 'Dialogue'],
    ['fill-in-blank', 'Recall'],
    ['multiple-choice', 'Vocabulary'],
  ] as const) {
    const exercise = getOfflineExercise(language, difficulty, type, seen);
    if (!exercise) continue;
    seen.push(exercise.id);
    exerciseItems.push({ kind: 'exercise', id: `ex:${exercise.id}`, label, exercise });
  }

  // Tones: weakest-first, Chinese only.
  const toneItems: SessionItem[] =
    language === 'chinese'
      ? weightedSample(
          getToneIdItems(seed, 300),
          (i) => pickWeight(toneMastery[`id:${i.hanzi}`]),
          TONE_ITEMS,
          rng,
        ).map((item) => ({ kind: 'tone' as const, id: `tone:${item.hanzi}`, item }))
      : [];

  return {
    items: interleave([cardItems, grammarItems, exerciseItems, toneItems]),
    rule,
    cardCount: cardItems.length,
  };
}
