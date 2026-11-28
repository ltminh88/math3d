// Fresh-item draw (anti-repeat Phase 2): draw from a skill's pool, re-rolling
// (bounded) while the candidate was seen recently. Pure. No call site uses it
// yet — Phase 3/4 wire it in. Callers pass `seen` already merged with the run's
// own shown fingerprints (oldest first, newest last, like `FactStat.seen`).
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { itemFingerprint } from './item-fingerprint';
import { itemForSkill } from './item-for-skill';
import type { PracticeItem } from './practice-scene';

/**
 * The first candidate whose fingerprint is not in `seen`. With empty `seen`
 * this is bit-identical to `itemForSkill` (same item, same next rng value).
 * If every try hits, returns the least-recently-seen candidate (smallest index
 * in `seen`); it never loops and never throws, even for a pool of one.
 */
export function drawFreshItem(
  id: string,
  rng: Rng,
  tier: SkillTier,
  seen: readonly number[],
  maxTries = 8,
): PracticeItem {
  const tries = Math.max(1, maxTries);
  let best: PracticeItem | undefined;
  let bestIndex = Infinity;
  for (let t = 0; t < tries; t++) {
    const item = itemForSkill(id, rng, tier);
    const index = seen.indexOf(itemFingerprint(item));
    if (index === -1) return item;
    if (index < bestIndex) {
      bestIndex = index;
      best = item;
    }
  }
  return best as PracticeItem;
}
