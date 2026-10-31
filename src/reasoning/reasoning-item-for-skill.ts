// One entry point for levels and the bridge quiz: a reasoning skill id + rng + tier -> item.
// Geometry and measurement skills get their generators in phase 02 (src/geometry, src/measurement).
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { exprBrackets, exprFromStory, exprOrder } from './expression-generators';
import { chooseAllCorrect, tfExplain } from './logic-statement-generators';
import type { ReasoningGenerator, ReasoningItem } from './reasoning-types';
import { divRemCeil, divRemFloor } from './remainder-generators';
import {
  patternAdd,
  patternSkipCount,
  patternSub,
  unknownAddSub,
  unknownMulDiv,
} from './unknown-and-pattern-generators';
import {
  wpDifferenceCompare,
  wpDivideThenAdd,
  wpMoreLessThenTotal,
  wpTimesCompare,
  wpTimesThenAdd,
  wpUnitThenTimes,
} from './word-problem-generators';

const GENERATORS: Readonly<Record<string, ReasoningGenerator>> = {
  'wp-times-then-add': wpTimesThenAdd,
  'wp-divide-then-add': wpDivideThenAdd,
  'wp-more-less-then-total': wpMoreLessThenTotal,
  'wp-unit-then-times': wpUnitThenTimes,
  'wp-times-compare': wpTimesCompare,
  'div-rem-floor': divRemFloor,
  'div-rem-ceil': divRemCeil,
  'unknown-add-sub': unknownAddSub,
  'unknown-mul-div': unknownMulDiv,
  'pattern-add': patternAdd,
  'pattern-sub': patternSub,
  'pattern-skip-count': patternSkipCount,
  'expr-order': exprOrder,
  'expr-brackets': exprBrackets,
  'expr-from-story': exprFromStory,
  'choose-all-correct': chooseAllCorrect,
  'tf-explain': tfExplain,
  'wp-difference-compare': wpDifferenceCompare,
};

/** The reasoning skills (catalog order) that have a generator. */
export const REASONING_SKILLS: readonly string[] = Object.keys(GENERATORS);

export const isReasoningSkill = (id: string): boolean => id in GENERATORS;

/** Pure and deterministic for a seeded `rng`; throws for skills without a reasoning generator. */
export function reasoningItemForSkill(id: string, rng: Rng, tier: SkillTier): ReasoningItem {
  const generate = GENERATORS[id];
  if (!generate) throw new Error(`reasoning: no generator for skill "${id}"`);
  return generate(rng, tier);
}
