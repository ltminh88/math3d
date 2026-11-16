// Compare word problems (KNTT T1 B39): "gấp mấy lần" and "hơn bao nhiêu" between two
// quantities. The trap is the other operation (difference vs quotient). Contexts —
// baskets, crates, classes, gardens — live in word-problem-contexts.ts (phase 02).
import { pick, type Rng, randInt } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { numberChoiceStep, numberStep, reasoningItem, ref } from './reasoning-distractors';
import { MAX_NUMBER, TIER_RANGES } from './reasoning-ranges';
import type { ReasoningGenerator, ReasoningStep } from './reasoning-types';
import {
  type CompareContext,
  WP_DIFFERENCE_COMPARE,
  WP_TIMES_COMPARE,
} from './word-problem-contexts';

function comparePair(rng: Rng, tier: SkillTier): { big: number; small: number; n: number } {
  const n = pick(rng, [...TIER_RANGES[tier].factors, ...(tier > 1 ? [10] : [])]);
  const small = randInt(
    rng,
    2,
    Math.max(2, Math.floor(Math.min(TIER_RANGES[tier].maxBase, MAX_NUMBER) / n)),
  );
  return { big: small * n, small, n };
}

function compare(
  skillId: string,
  rng: Rng,
  tier: SkillTier,
  contexts: readonly CompareContext[],
  finalAsk: 'times' | 'more',
): ReturnType<ReasoningGenerator> {
  const { big, small, n } = comparePair(rng, tier);
  const ctx = pick(rng, contexts);
  const item = pick(rng, ctx.nouns);
  const story = ref(ctx.key, { big, small, item });
  const askTimes = ref(ctx.askTimes, { item });
  const askMore = ref(ctx.askMore, { item });
  const [ask, other, answer, otherAnswer] =
    finalAsk === 'times'
      ? [askTimes, askMore, n, big - small]
      : [askMore, askTimes, big - small, n];
  const trap = [
    {
      value: otherAnswer,
      misconception:
        finalAsk === 'times'
          ? ('difference-not-quotient' as const)
          : ('quotient-not-difference' as const),
    },
  ];
  const steps: ReasoningStep[] =
    tier === 1
      ? [numberChoiceStep(rng, ask, answer, trap)]
      : tier === 2
        ? [numberStep(ask, answer)]
        : [numberStep(other, otherAnswer), numberStep(ask, answer)];
  return reasoningItem(skillId, tier, story, steps, [answer]);
}

/** "big gấp mấy lần small?" (B39); the trap is the difference. */
export const wpTimesCompare: ReasoningGenerator = (rng, tier) =>
  compare('wp-times-compare', rng, tier, WP_TIMES_COMPARE, 'times');

/** "big hơn small bao nhiêu?" (B39); the trap is the quotient. */
export const wpDifferenceCompare: ReasoningGenerator = (rng, tier) =>
  compare('wp-difference-compare', rng, tier, WP_DIFFERENCE_COMPARE, 'more');
