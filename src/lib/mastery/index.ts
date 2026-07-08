/**
 * Lightweight per-item mastery tracking for the stateless drills (tones,
 * writing, classifiers). Records how often each item is seen/correct so weak
 * items can be resurfaced (weighted sampling) and surfaced on a weak-spot
 * dashboard. Deliberately simpler than the flashcard FSRS state — these drills
 * want "show me what I keep getting wrong", not precise interval scheduling.
 */

export type MasteryDomain = 'tones' | 'writing' | 'classifiers';

export interface MasteryEntry {
  seen: number;
  correct: number;
  streak: number; // consecutive correct
  lastSeen: number;
  label: string; // display text (char / word / pattern)
  sublabel?: string;
  group?: string; // aggregation bucket for the dashboard (e.g. tone number)
}

export type MasteryMap = Record<string, MasteryEntry>;

export interface MasteryMeta {
  label: string;
  sublabel?: string;
  group?: string;
}

export function accuracy(e: MasteryEntry): number {
  return e.seen ? e.correct / e.seen : 0;
}

/**
 * Selection weight — higher = more likely to be drilled. Unseen items get a
 * medium-high weight (introduce them), low-accuracy items get the highest,
 * and consecutively-correct items decay toward a small floor.
 */
export function pickWeight(e?: MasteryEntry): number {
  if (!e || e.seen === 0) return 2.5;
  const acc = e.correct / e.seen;
  const w = 0.5 + (1 - acc) * 4; // 0.5 (perfect) .. 4.5 (always wrong)
  const mastery = Math.min(e.streak, 5) * 0.35; // decay once you're getting it right
  return Math.max(0.25, w - mastery);
}

/** Weighted sampling without replacement. */
export function weightedSample<T>(
  pool: T[],
  weightOf: (t: T) => number,
  n: number,
  rng: () => number,
): T[] {
  const items = [...pool];
  const out: T[] = [];
  const count = Math.min(n, items.length);
  for (let k = 0; k < count; k++) {
    const weights = items.map(weightOf);
    const total = weights.reduce((a, b) => a + b, 0);
    let r = rng() * total;
    let idx = 0;
    for (; idx < items.length - 1; idx++) {
      r -= weights[idx];
      if (r <= 0) break;
    }
    out.push(items[idx]);
    items.splice(idx, 1);
  }
  return out;
}

/** Return a new map with one result folded in. */
export function applyResult(
  map: MasteryMap,
  id: string,
  correct: boolean,
  meta: MasteryMeta,
  now: number,
): MasteryMap {
  const prev = map[id];
  const entry: MasteryEntry = prev
    ? { ...prev }
    : { seen: 0, correct: 0, streak: 0, lastSeen: 0, label: meta.label };
  entry.seen += 1;
  if (correct) {
    entry.correct += 1;
    entry.streak += 1;
  } else {
    entry.streak = 0;
  }
  entry.lastSeen = now;
  entry.label = meta.label;
  entry.sublabel = meta.sublabel;
  entry.group = meta.group;
  return { ...map, [id]: entry };
}

export interface WeakItem extends MasteryEntry {
  id: string;
  acc: number;
}

/** Weakest seen items, worst accuracy first (ties: most-seen first). */
export function weakest(map: MasteryMap, limit = 8): WeakItem[] {
  return Object.entries(map)
    .map(([id, e]) => ({ id, ...e, acc: accuracy(e) }))
    .filter((e) => e.seen > 0)
    .sort((a, b) => a.acc - b.acc || b.seen - a.seen)
    .slice(0, limit);
}

export interface GroupStat {
  group: string;
  seen: number;
  correct: number;
  acc: number;
}

/** Aggregate accuracy by group bucket, worst first. */
export function byGroup(map: MasteryMap): GroupStat[] {
  const agg: Record<string, { seen: number; correct: number }> = {};
  for (const e of Object.values(map)) {
    if (!e.group || !e.seen) continue;
    const g = (agg[e.group] ??= { seen: 0, correct: 0 });
    g.seen += e.seen;
    g.correct += e.correct;
  }
  return Object.entries(agg)
    .map(([group, v]) => ({ group, ...v, acc: v.correct / v.seen }))
    .sort((a, b) => a.acc - b.acc);
}
