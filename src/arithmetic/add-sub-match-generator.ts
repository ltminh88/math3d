// add-sub-match generator (boost, Phase 3A): four ladder pairs as a `match`
// step. The left side shows the calculations, the right side their results
// (shuffled). One right value is ALSO the bug value of another pair in the
// set — the decoy: pairing that pair with it records the bug. Every right
// value is a correct value of exactly one left, so the item is always
// solvable; the decoy only tempts, it never blocks. The tag lives on the
// right option (the 2B length-match pattern): a wrong pairing with that
// option records the bug, a correct pairing records nothing.
import { shuffle } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type {
  ReasoningGenerator,
  ReasoningItem,
  ReasoningStep,
} from '../reasoning/reasoning-types';
import { type AddSubBug, bugsFor } from './add-sub-bug-catalogue';
import {
  ADD_SUB_MATCH_FALLBACK,
  constructSet,
  type MatchPair,
  sampleSet,
} from './add-sub-match-sets';
import { ref } from './arithmetic-distractors';

interface Collision {
  culprit: number;
  target: number;
  bug: AddSubBug;
}

/** The first pair whose bug value equals another pair's correct value. */
const findCollision = (pairs: readonly MatchPair[]): Collision | undefined => {
  for (let i = 0; i < pairs.length; i++) {
    const culprit = pairs[i] as MatchPair;
    for (let j = 0; j < pairs.length; j++) {
      if (i === j) continue;
      const target = pairs[j] as MatchPair;
      for (const f of bugsFor(culprit.a, culprit.b, culprit.op)) {
        if (f.value === target.correct) return { culprit: i, target: j, bug: f.bug };
      }
    }
  }
  return undefined;
};

const buildItemFrom = (
  pairs: readonly MatchPair[],
  collision: Collision,
  rightValues: readonly number[],
  tier: SkillTier,
): ReasoningItem => {
  const rightIndexOf = (value: number): number => rightValues.indexOf(value);
  const left = pairs.map((p) => ref('expr', { text: `${p.a} ${p.op} ${p.b}` }));
  const right = rightValues.map((value) => {
    const target = pairs[collision.target] as MatchPair;
    return value === target.correct
      ? { label: ref('num', { n: value }), misconception: collision.bug }
      : { label: ref('num', { n: value }) };
  });
  const step: ReasoningStep = {
    kind: 'match',
    prompt: ref('matchAddSubPrompt'),
    left,
    right,
    pairs: pairs.map((p) => rightIndexOf(p.correct)),
  };
  return {
    skillId: 'add-sub-match',
    tier,
    story: ref('matchAddSub'),
    steps: [step],
    work: pairs.map((p) => p.correct),
  };
};

/** Four ladder pairs as a match step, one right value a decoy bug value. */
export const matchAddSub: ReasoningGenerator = (rng, tier) => {
  for (let t = 0; t < 60; t++) {
    const set = sampleSet(rng, tier);
    if (!set) continue;
    const collision = findCollision(set);
    if (!collision) continue;
    const rightValues = shuffle(
      rng,
      set.map((p) => p.correct),
    );
    return buildItemFrom(set, collision, rightValues, tier);
  }
  const constructed = constructSet(rng, tier);
  if (constructed) {
    const collision = findCollision(constructed);
    if (collision) {
      const rightValues = shuffle(
        rng,
        constructed.map((p) => p.correct),
      );
      return buildItemFrom(constructed, collision, rightValues, tier);
    }
  }
  const fallback = ADD_SUB_MATCH_FALLBACK[tier];
  const collision = findCollision(fallback);
  if (!collision) throw new Error(`add-sub-match: fallback for tier ${tier} has no collision`);
  const rightValues = shuffle(
    rng,
    fallback.map((p) => p.correct),
  );
  return buildItemFrom(fallback, collision, rightValues, tier);
};

export const ADD_SUB_MATCH_GENERATORS: Record<string, ReasoningGenerator> = {
  'add-sub-match': matchAddSub,
};
