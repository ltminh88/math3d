// Recent-item store (anti-repeat Phase 2): the bounded per-skill list of
// fingerprints of shown items, kept device-only on `FactStat.seen` (newest last).
import type { FactStat } from './learning-types';

/** Fingerprints kept per skill (oldest first, newest last). */
export const RECENT_ITEMS_KEPT = 24;

/** Pure: returns a new stat with `fp` recorded newest-last, de-duplicated, capped. */
export function rememberSeen(stat: FactStat, fp: number): FactStat {
  const seen = [...(stat.seen ?? []).filter((x) => x !== fp), fp].slice(-RECENT_ITEMS_KEPT);
  return { ...stat, seen };
}
