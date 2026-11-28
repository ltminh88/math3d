// Weak-skill score (boost, Phase 4A): how much a skill needs practice, from its stat.
//   weakScore = (1 − accuracy of `recent`) + 0.2 × (distinct bugs seen ≥ 2 times).
// A bug is "labelled" only at ≥ 2 of the last 5 (`bugs` keeps the last 5, oldest
// first). The score ranges 0–1.4; "Học tiếp" treats ≥ 0.4 as weak (focus-review.ts).
// Pure, node-only.
import type { Misconception } from '../reasoning/reasoning-types';
import type { FactStat } from './learning-types';

/** How many first tries `recent` records (leitner-box.ts: recentKept). */
export const RECENT_KEPT = 10;
/** A bug counts as labelled at this many sightings in the last 5. */
export const LABELLED_BUG_MIN = 2;
/** One labelled bug adds this much to the weak score. */
export const BUG_WEIGHT = 0.2;

const popcount = (n: number): number => {
  let c = 0;
  for (let v = n >>> 0; v > 0; v >>>= 1) c += v & 1;
  return c;
};

/**
 * Accuracy of the last first tries. `recent` shifts once per question, so the
 * recorded tries are min(attempts, 10) — attempts counts retries too, so a skill
 * with retries reads slightly weaker than it is, a safe direction for a
 * practice-more signal. Without `recent` (e.g. a seeded stat) the overall
 * correct/attempts ratio is used; an unattempted skill reads as fully accurate.
 */
export function recentAccuracy(stat: Pick<FactStat, 'attempts' | 'correct' | 'recent'>): number {
  if (stat.recent !== undefined) {
    const n = Math.min(Math.max(stat.attempts, 1), RECENT_KEPT);
    return Math.min(popcount(stat.recent), n) / n;
  }
  return stat.attempts > 0 ? stat.correct / stat.attempts : 1;
}

/**
 * The skill's labelled bugs: distinct bugs seen at least LABELLED_BUG_MIN times in
 * the last 5, in first-appearance order (deterministic).
 */
export function labelledBugs(stat: Pick<FactStat, 'bugs'>): Misconception[] {
  const counts = new Map<Misconception, number>();
  for (const bug of stat.bugs ?? []) counts.set(bug, (counts.get(bug) ?? 0) + 1);
  return [...counts.entries()].filter(([, n]) => n >= LABELLED_BUG_MIN).map(([bug]) => bug);
}

/** Weak score of one skill stat: 0 (strong) to 1.4 (inaccurate with two labelled bugs). */
export function weakScore(
  stat: Pick<FactStat, 'attempts' | 'correct' | 'recent' | 'bugs'>,
): number {
  return 1 - recentAccuracy(stat) + BUG_WEIGHT * labelledBugs(stat).length;
}
