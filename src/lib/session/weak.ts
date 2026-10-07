/**
 * The weak-spot session: the mistake notebook first, then the grammar patterns
 * and tones the learner keeps missing. Like the daily session it is built once
 * from storage and the mastery maps, and works fully offline.
 */

import type { Exercise, Language, StorageAdapter } from '@/types';
import { chineseGrammarRules, type GrammarRule } from '@/data/chinese/grammar';
import { buildChecksForRule } from '@/lib/learn/checks';
import { getSelfCheckItem, type SelfCheckItem } from '@/lib/selfcheck/parse';
import {
  exerciseMistakeId,
  loadMistakes,
  retryOrder,
  type Mistake,
  type MistakeSource,
} from '@/lib/mistakes';
import { accuracy, type MasteryMap } from '@/lib/mastery';
import { getToneIdItems, makeRng, shuffle, type ToneIdItem } from '@/lib/tones/utils';

export type DrillItem =
  | {
      kind: 'exercise';
      id: string;
      label: string;
      exercise: Exercise;
      /** Where a miss is filed: a retry keeps its mistake's source. */
      source: MistakeSource;
      /** Retries a notebook mistake (rather than drilling a weak pattern). */
      retry: boolean;
      ruleId?: string;
    }
  | {
      kind: 'selfcheck';
      id: string;
      label: string;
      item: SelfCheckItem;
      source: MistakeSource;
      retry: boolean;
    }
  | { kind: 'tone'; id: string; item: ToneIdItem };

export interface WeakSessionPlan {
  /** Notebook retries first, then weak grammar checks, then weak tones. */
  items: DrillItem[];
  /** The weak grammar patterns drilled. */
  rules: GrammarRule[];
}

export interface WeakSessionOptions {
  language: Language;
  /** Mastery map for the 'grammar' domain: patterns missed most come up. */
  grammarMastery: MasteryMap;
  /** Mastery map for the 'tones' domain: syllables misheard most come up. */
  toneMastery: MasteryMap;
  /** Overridable for tests; defaults to Date.now(). */
  seed?: number;
}

const MAX_RETRIES = 10;
const MAX_RULES = 2;
const CHECKS_PER_RULE = 2;
const MAX_TONES = 4;
/** A seen item answered right less often than this is a weak spot. */
const WEAK_BELOW = 0.8;

/** Seen ids of a mastery map whose accuracy is weak, worst first (ties: most seen first). */
function weakIds(map: MasteryMap, keep: (id: string) => boolean): string[] {
  return Object.entries(map)
    .filter(([id, e]) => keep(id) && e.seen > 0 && accuracy(e) < WEAK_BELOW)
    .sort(([, a], [, b]) => accuracy(a) - accuracy(b) || b.seen - a.seen)
    .map(([id]) => id);
}

/** Open mistakes as drill items, in retry order; self-check items no longer shipped are skipped. */
function retryItems(mistakes: Mistake[]): DrillItem[] {
  const items: DrillItem[] = [];
  for (const m of retryOrder(mistakes)) {
    if (items.length >= MAX_RETRIES) break;
    if (m.subject.kind === 'exercise') {
      items.push({
        kind: 'exercise',
        id: `retry:${m.id}`,
        label: 'Mistake',
        exercise: m.subject.exercise,
        source: m.source,
        retry: true,
      });
      continue;
    }
    const item = getSelfCheckItem(m.subject.itemId);
    if (item) {
      items.push({
        kind: 'selfcheck',
        id: `retry:${m.id}`,
        label: 'Mistake',
        item,
        source: m.source,
        retry: true,
      });
    }
  }
  return items;
}

export async function buildWeakSession(
  storage: StorageAdapter,
  opts: WeakSessionOptions,
): Promise<WeakSessionPlan> {
  const { language, grammarMastery, toneMastery, seed = Date.now() } = opts;
  const rng = makeRng(seed);

  const retries = retryItems(await loadMistakes(storage, language));
  if (language !== 'chinese') return { items: retries, rules: [] };

  // Grammar: checks from the weakest patterns, skipping any already being retried.
  const retrying = new Set(
    retries.flatMap((i) => (i.kind === 'exercise' ? [exerciseMistakeId(i.exercise)] : [])),
  );
  const ruleById = new Map(chineseGrammarRules.map((r) => [r.id, r]));
  const rules: GrammarRule[] = [];
  const grammarItems: DrillItem[] = [];
  for (const id of weakIds(grammarMastery, (id) => ruleById.has(id))) {
    if (rules.length >= MAX_RULES) break;
    const rule = ruleById.get(id)!;
    const checks = shuffle(buildChecksForRule(rule), rng)
      .filter((exercise) => !retrying.has(exerciseMistakeId(exercise)))
      .slice(0, CHECKS_PER_RULE);
    if (checks.length === 0) continue;
    rules.push(rule);
    for (const exercise of checks) {
      grammarItems.push({
        kind: 'exercise',
        id: `grammar:${exercise.id}`,
        label: rule.title,
        exercise,
        source: 'session',
        retry: false,
        ruleId: rule.id,
      });
    }
  }

  // Tones: the single syllables misheard most ("id:<hanzi>" in the tones domain).
  const toneByHanzi = new Map(getToneIdItems(seed, Infinity).map((i) => [i.hanzi, i]));
  const toneItems: DrillItem[] = weakIds(toneMastery, (id) => id.startsWith('id:'))
    .flatMap((id) => {
      const item = toneByHanzi.get(id.slice('id:'.length));
      return item ? [{ kind: 'tone' as const, id: `tone:${item.hanzi}`, item }] : [];
    })
    .slice(0, MAX_TONES);

  return { items: [...retries, ...grammarItems, ...toneItems], rules };
}
