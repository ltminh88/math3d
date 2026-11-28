// Garden add/sub slots (boost, Phase 3A): one add/sub round per garden run.
// The pool is the six B2 add/sub formats — `add-sub-match` is NOT in it (its
// home is the lesson run; the garden test hook cannot solve match steps).
// Weakest-first among the focus ids the child has attempted (box ascending,
// ties in listed order); a fresh profile gets the fallback `add-sub-bug-choice`.
// Stage 1 caps the build tier at 1, so the ladder stays at T0 (no regroup) —
// inside the spec's T0–T1-only cap for the entry stage; from stage 2 the tier
// follows the skill's Leitner box like every other garden round. The splice
// replaces the last non-bag round, so stage 3 keeps both bag skills (brackets
// + stories) in every run; the run stays six rounds with exactly one add/sub
// round and no two rounds of the same kind in a row.
import { type FactKey, skillKey } from '../../learning/fact-key';
import type { FactStat } from '../../learning/learning-types';
import type { Rng } from '../../learning/seeded-rng';
import { type SkillTier, skillTierOf } from '../../learning/skill-tiers';
import { itemForSkill } from '../../practice/item-for-skill';
import type { GardenRound } from './garden-round-plan';

export const GARDEN_ADD_SUB_SKILLS: readonly string[] = [
  'add-sub-bug-choice',
  'add-sub-true-false',
  'add-sub-compare-estimate',
  'add-sub-number-line',
  'add-sub-bar-model-wp',
  'add-sub-column',
];

export const GARDEN_ADD_SUB_FALLBACK = 'add-sub-bug-choice';

/**
 * The focus add/sub id the child has attempted with the lowest Leitner box
 * (ties in listed order); the fallback when none was attempted.
 */
export function pickGardenAddSubSkill(
  stats: Readonly<Record<FactKey, FactStat | undefined>>,
): string {
  let best: string | undefined;
  let bestBox = Number.POSITIVE_INFINITY;
  for (const id of GARDEN_ADD_SUB_SKILLS) {
    const stat = stats[skillKey(id)];
    if (!stat || stat.attempts <= 0) continue;
    if (stat.box < bestBox) {
      best = id;
      bestBox = stat.box;
    }
  }
  return best ?? GARDEN_ADD_SUB_FALLBACK;
}

/** The add/sub round for a run: kind `addsub`, tier from the box (stage 1 capped at 1). */
export function buildGardenAddSubRound(
  stats: Readonly<Record<FactKey, FactStat | undefined>>,
  rng: Rng,
  stage: number,
): GardenRound {
  const skillId = pickGardenAddSubSkill(stats);
  const factKey = skillKey(skillId);
  const tier: SkillTier = stage === 1 ? 1 : skillTierOf(stats[factKey]);
  return { kind: 'addsub', skillId, factKey, item: itemForSkill(skillId, rng, tier) };
}

/**
 * Splice one add/sub round into a planned run: replace the last non-bag
 * round, keeping six rounds and the bag rounds untouched. The replaced round
 * is never a bag round, and the add/sub round takes the place of a round of a
 * different kind on either side (the planner never repeats a kind in a row),
 * so the no-repeat rule survives the splice.
 */
export function withGardenAddSubRound(
  rounds: readonly GardenRound[],
  stats: Readonly<Record<FactKey, FactStat | undefined>>,
  rng: Rng,
  stage: number,
): GardenRound[] {
  const out = [...rounds];
  let at = -1;
  for (let i = out.length - 1; i >= 0; i--) {
    if (out[i]?.kind !== 'bag') {
      at = i;
      break;
    }
  }
  if (at < 0) return out;
  out[at] = buildGardenAddSubRound(stats, rng, stage);
  return out;
}
