// Length ladder tier (boost, Phase 0): a finer ladder than the Leitner box, fed by
// the recent first tries. `recent` is a bitmask of the last 10 first tries, bit 0
// = most recent (1 = correct). Unrecorded high bits read as 0, so the −1 leans
// easy after any recorded wrong; the +1 needs 8 real correct bits.
import type { FactStat } from './learning-types';
import { LEITNER } from './leitner-box';
import type { SkillTier } from './skill-tiers';

/** Ladder tier 0..5 for a stat: box − 1, +1 on a hot streak at box 5, −1 after 3 wrong first tries. */
export function ladderTierOf(stat: Pick<FactStat, 'box' | 'recent'>): number {
  const base = stat.box - LEITNER.minBox;
  const recent = stat.recent;
  if (recent === undefined) return base;
  const mask = (1 << LEITNER.recentKept) - 1;
  const bits = recent & mask;
  let tier = base;
  if (stat.box === LEITNER.maxBox && countBits(bits) >= 8) tier += 1;
  if ((bits & 0b111) === 0) tier -= 1;
  return Math.max(0, Math.min(5, tier));
}

/** Ladder tier back to the 3 skill tiers the old generators take. */
export function ladderToSkillTier(ladder: number): SkillTier {
  if (ladder >= 4) return 3;
  return ladder >= 2 ? 2 : 1;
}

function countBits(n: number): number {
  let count = 0;
  while (n > 0) {
    count += n & 1;
    n >>= 1;
  }
  return count;
}
