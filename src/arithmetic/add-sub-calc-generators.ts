// Calc generators (boost, Phase 1A — split from add-sub-generators.ts, no behaviour
// change): mental round numbers, plain add/sub, and the two-operation chain.
import { pick, randInt } from '../learning/seeded-rng';
import type { ReasoningGenerator } from '../reasoning/reasoning-types';
import { pickAddPair, pickChainTriple, pickSubPair } from './add-sub-pair-pickers';
import { arithmeticItem, numberStep, ref } from './arithmetic-distractors';
import { RANGE_1000, RANGE_10000, RANGE_100000 } from './arithmetic-ranges';

/** Round hundreds (T1), round tens (T2), or a three-term chain of round numbers (T3). */
export const mentalRound: ReasoningGenerator = (rng, tier) => {
  if (tier === 1) {
    const op = pick(rng, ['+', '−'] as const);
    const aH = randInt(rng, 1, 9);
    const bH = op === '+' ? randInt(rng, 1, 10 - aH) : randInt(rng, 1, aH);
    const a = aH * 100;
    const b = bH * 100;
    const answer = op === '+' ? a + b : a - b;
    return arithmeticItem(
      'add-sub-mental-round',
      tier,
      ref('mentalCalc', { expr: `${a} ${op} ${b}` }),
      [numberStep(ref('askResult'), answer)],
    );
  }
  if (tier === 2) {
    const op = pick(rng, ['+', '−'] as const);
    let aT = randInt(rng, 11, op === '+' ? 89 : 99);
    while (aT % 10 === 0) aT = randInt(rng, 11, op === '+' ? 89 : 99);
    let bT = op === '+' ? randInt(rng, 11, 100 - aT) : randInt(rng, 11, aT);
    while (bT % 10 === 0 || bT < 11)
      bT = op === '+' ? randInt(rng, 11, 100 - aT) : randInt(rng, 11, aT);
    const a = aT * 10;
    const b = bT * 10;
    const answer = op === '+' ? a + b : a - b;
    if (rng() < 0.5) {
      // Missing number (Phase 8): one addend / the subtrahend is hidden, the
      // total is given — the child finds it by working backwards.
      const missing = op === '+' ? b : answer;
      const expr = op === '+' ? `${a} + ? = ${answer}` : `${a} − ? = ${b}`;
      return arithmeticItem('add-sub-mental-round', tier, ref('mentalMissing', { expr }), [
        numberStep(ref('askMissingNumber'), missing),
      ]);
    }
    return arithmeticItem(
      'add-sub-mental-round',
      tier,
      ref('mentalCalc', { expr: `${a} ${op} ${b}` }),
      [numberStep(ref('askResult'), answer)],
    );
  }
  for (let t = 0; t < 500; t++) {
    const op1 = pick(rng, ['+', '−'] as const);
    const op2 = pick(rng, ['+', '−'] as const);
    const a = randInt(rng, 1, 19) * 50;
    const b = randInt(rng, 1, 19) * 50;
    const first = op1 === '+' ? a + b : a - b;
    if (first < 0 || first > RANGE_1000) continue;
    if (rng() < 0.5) {
      // Missing number (Phase 8): the last term is hidden, the final total is
      // given — the child finds it from the first two terms and the total.
      const missing = randInt(rng, 1, 19) * 50;
      const total = op2 === '+' ? first + missing : first - missing;
      if (total < 0 || total > RANGE_1000) continue;
      return arithmeticItem(
        'add-sub-mental-round',
        tier,
        ref('mentalMissing', { expr: `${a} ${op1} ${b} ${op2} ? = ${total}` }),
        [numberStep(ref('askMissingNumber'), missing)],
      );
    }
    const c = randInt(rng, 1, 19) * 50;
    const final = op2 === '+' ? first + c : first - c;
    if (final < 0 || final > RANGE_1000) continue;
    return arithmeticItem(
      'add-sub-mental-round',
      tier,
      ref('mentalCalc', { expr: `${a} ${op1} ${b} ${op2} ${c}` }),
      [numberStep(ref('askResult'), final)],
    );
  }
  return arithmeticItem(
    'add-sub-mental-round',
    tier,
    ref('mentalCalc', { expr: '300 + 200 + 100' }),
    [numberStep(ref('askResult'), 600)],
  );
};

/** One plain add or sub in range, result only (number pad). */
const plain =
  (skillId: string, maxSum: number, op: 'add' | 'sub' | 'both'): ReasoningGenerator =>
  (rng, tier) => {
    const isAdd = op === 'add' || (op === 'both' && rng() < 0.5);
    const [a, b] = isAdd ? pickAddPair(rng, maxSum, tier) : pickSubPair(rng, maxSum, tier);
    const answer = isAdd ? a + b : a - b;
    return arithmeticItem(skillId, tier, ref(isAdd ? 'addCalc' : 'subCalc', { a, b }), [
      numberStep(ref(isAdd ? 'askSum' : 'askDiff'), answer),
    ]);
  };

/** A two-operation chain: first the partial result, then the final one. */
export const addSubChain: ReasoningGenerator = (rng, tier) => {
  const { a, b, c, op1, op2 } = pickChainTriple(rng, tier);
  const first = op1 === '+' ? a + b : a - b;
  const final = op2 === '+' ? first + c : first - c;
  return arithmeticItem(
    'add-sub-1000-chain',
    tier,
    ref('chainCalc', { expr: `${a} ${op1} ${b} ${op2} ${c}`, a, b, c, op1, op2 }),
    [
      numberStep(ref('askFirst', { expr: `${a} ${op1} ${b}` }), first),
      numberStep(ref('askResult'), final),
    ],
    [first],
  );
};

export const ADD_SUB_CALC_GENERATORS: Record<string, ReasoningGenerator> = {
  'add-sub-mental-round': mentalRound,
  'add-sub-1000': plain('add-sub-1000', RANGE_1000, 'both'),
  'add-sub-1000-chain': addSubChain,
  'add-4digit': plain('add-4digit', RANGE_10000, 'add'),
  'sub-4digit': plain('sub-4digit', RANGE_10000, 'sub'),
  'add-5digit': plain('add-5digit', RANGE_100000, 'add'),
  'sub-5digit': plain('sub-5digit', RANGE_100000, 'sub'),
};
