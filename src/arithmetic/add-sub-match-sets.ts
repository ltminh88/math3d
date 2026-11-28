// add-sub-match sets (boost, Phase 3A): building the four ladder pairs behind
// a match item. A set is good when one pair's bug value equals another pair's
// correct value (the collision); sampling finds one most of the time,
// construction builds one deliberately, and the fixed fallback always has one.
import { pick, type Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { bugsFor } from './add-sub-bug-catalogue';
import { ladderOfSkillTier, pickLadderPair } from './add-sub-pair-pickers';
import { countAddCarries, countSubBorrows, hasBorrowAcrossZero } from './carry-count';

export const ADD_SUB_MATCH_CAP = 1000;

type Op = '+' | '−';

export interface MatchPair {
  a: number;
  b: number;
  op: Op;
  correct: number;
}

/** Fixed sets per tier, used only when sampling never finds a collision. */
export const ADD_SUB_MATCH_FALLBACK: Record<SkillTier, readonly MatchPair[]> = {
  // Tier 1 (no regroup): 123 + 45 misaligns to 573, the correct value of 500 + 73.
  1: [
    { a: 123, b: 45, op: '+', correct: 168 },
    { a: 500, b: 73, op: '+', correct: 573 },
    { a: 234, b: 123, op: '+', correct: 357 },
    { a: 345, b: 234, op: '+', correct: 579 },
  ],
  // Tier 2 (one regroup): 456 + 271 forgets its carry to 627, the value of 547 + 80.
  2: [
    { a: 456, b: 271, op: '+', correct: 727 },
    { a: 547, b: 80, op: '+', correct: 627 },
    { a: 186, b: 172, op: '+', correct: 358 },
    { a: 428, b: 157, op: '+', correct: 585 },
  ],
  // Tier 3 (two regroups): 456 + 378 forgets its carries to 724, the value of 547 + 177.
  3: [
    { a: 456, b: 378, op: '+', correct: 834 },
    { a: 547, b: 177, op: '+', correct: 724 },
    { a: 385, b: 247, op: '+', correct: 632 },
    { a: 678, b: 234, op: '+', correct: 912 },
  ],
};

/** The sweep oracle's tier rule, in generator terms. */
const ladderMatchesTier = (a: number, b: number, op: Op, tier: SkillTier): boolean => {
  if (op === '+') {
    const c = countAddCarries(a, b);
    return tier === 1 ? c === 0 : tier === 2 ? c === 1 : c >= 2;
  }
  const borrows = countSubBorrows(a, b);
  return tier === 1
    ? borrows === 0
    : tier === 2
      ? borrows === 1
      : borrows >= 2 || hasBorrowAcrossZero(a, b);
};

const samplePair = (rng: Rng, tier: SkillTier): MatchPair => {
  const op = pick(rng, ['+', '−'] as const);
  const ladder = ladderOfSkillTier(rng, tier);
  const [a, b] = pickLadderPair(rng, op, ladder, ADD_SUB_MATCH_CAP);
  return { a, b, op, correct: op === '+' ? a + b : a - b };
};

/** Four distinct ladder pairs with distinct correct values. */
export const sampleSet = (rng: Rng, tier: SkillTier): MatchPair[] | undefined => {
  const pairs: MatchPair[] = [];
  const used = new Set<number>();
  for (let t = 0; t < 200 && pairs.length < 4; t++) {
    const p = samplePair(rng, tier);
    if (used.has(p.correct)) continue;
    if (pairs.some((q) => q.a === p.a && q.b === p.b && q.op === p.op)) continue;
    pairs.push(p);
    used.add(p.correct);
  }
  return pairs.length === 4 ? pairs : undefined;
};

/**
 * Build a pair whose correct value is `value` and which follows the tier
 * ladder: a subtraction (value + x) − x, or an addition (value − x) + x.
 * Rejection-samples x; a tier-1 subtraction of 100 never borrows, so this
 * always finds a pair for tier 1, and quickly for tiers 2/3.
 */
const buildPairForValue = (rng: Rng, tier: SkillTier, value: number): MatchPair | undefined => {
  for (let t = 0; t < 500; t++) {
    const x = 10 + Math.floor(rng() * 190);
    const form = pick(rng, ['+', '−'] as const);
    if (form === '−') {
      const a = value + x;
      if (a > ADD_SUB_MATCH_CAP) continue;
      if (!ladderMatchesTier(a, x, '−', tier)) continue;
      return { a, b: x, op: '−', correct: value };
    }
    const a = value - x;
    if (a < 10) continue;
    if (!ladderMatchesTier(a, x, '+', tier)) continue;
    return { a, b: x, op: '+', correct: value };
  }
  return undefined;
};

/**
 * A set with a collision, built deliberately: pick a pair, take one of its
 * bug values, build the target pair for that value, fill the rest normally.
 */
export const constructSet = (rng: Rng, tier: SkillTier): MatchPair[] | undefined => {
  for (let t = 0; t < 60; t++) {
    const culprit = samplePair(rng, tier);
    for (const f of bugsFor(culprit.a, culprit.b, culprit.op)) {
      if (f.value === culprit.correct || f.value > ADD_SUB_MATCH_CAP) continue;
      const target = buildPairForValue(rng, tier, f.value);
      if (!target) continue;
      const rest = sampleSet(rng, tier);
      const used = new Set([culprit.correct, target.correct]);
      const others = (rest ?? []).filter(
        (p) =>
          !used.has(p.correct) &&
          !(p.a === culprit.a && p.b === culprit.b && p.op === culprit.op) &&
          !(p.a === target.a && p.b === target.b && p.op === target.op),
      );
      if (others.length < 2) continue;
      return [culprit, target, others[0] as MatchPair, others[1] as MatchPair];
    }
  }
  return undefined;
};
