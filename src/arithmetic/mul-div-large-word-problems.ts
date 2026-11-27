// Word problems (phase 11): 4-5 digit mul/div, money change, compare results, chain
// operators. Big-number contexts only (kho / thư viện / trường) — never one child's
// marbles or sweets. Money amounts are prices in đồng, not counts. The chain T3
// form (a + b × c) is the left-to-right trap: multiply first.
import { pick, type Rng, randInt } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { optionsFrom, pickName } from '../reasoning/reasoning-distractors';
import type { ReasoningGenerator } from '../reasoning/reasoning-types';
import { arithmeticItem, numberStep, ref } from './arithmetic-distractors';
import { RANGE_10000, RANGE_100000 } from './arithmetic-ranges';
import { countMulCarries, countSubBorrows } from './carry-count';
import { BIG_THEN_SUB, BIG_TIMES } from './mul-div-word-problems';
import { pickMulPair } from './mul-generators';

/** One step: one warehouse / library / school has a, another has b times as many. */
function mulTimesLarge(rng: Rng, tier: SkillTier) {
  const cap = tier === 1 ? RANGE_10000 : RANGE_100000;
  const [a, b] = pickMulPair(rng, cap, tier);
  const ctx = pick(rng, BIG_TIMES);
  return arithmeticItem('mul-div-large-wp', tier, ref(ctx.story, { a, b }), [
    numberStep(ref(ctx.ask), a * b),
  ]);
}

/** Two steps: a warehouse / library / school buys n boxes with the same count, then
 *  uses c up. Step 1 asks how much was bought in all (a single purchase). */
function mulThenSubLarge(rng: Rng, tier: SkillTier, wantZero: boolean) {
  const ctx = pick(rng, BIG_THEN_SUB);
  const cap = tier === 1 ? RANGE_10000 : RANGE_100000;
  for (let t = 0; t < 500; t++) {
    const per = tier === 1 ? randInt(rng, 1001, 4999) : randInt(rng, 10001, 49999);
    const n = randInt(rng, 2, 9);
    const total = per * n;
    if (total >= cap) continue;
    const c = randInt(rng, 10, total);
    const carries = countMulCarries(per, n) + countSubBorrows(total, c);
    if (wantZero && carries !== 0) continue;
    if (!wantZero && carries < 1) continue;
    return arithmeticItem(
      'mul-div-large-wp',
      tier,
      ref(ctx.story, { per, n, c }),
      [
        numberStep(ref(ctx.askFirst), total),
        numberStep(ref('askFinalLeftBig', { item: ctx.item }), total - c),
      ],
      [total],
    );
  }
  const per = tier === 1 ? (wantZero ? 1112 : 1005) : wantZero ? 11112 : 10005;
  const n = 2;
  const c = wantZero ? (tier === 1 ? 111 : 1111) : 30;
  const total = per * n;
  return arithmeticItem(
    'mul-div-large-wp',
    tier,
    ref(ctx.story, { per, n, c }),
    [
      numberStep(ref(ctx.askFirst), total),
      numberStep(ref('askFinalLeftBig', { item: ctx.item }), total - c),
    ],
    [total],
  );
}

/** Two steps: buy n of the same school item, pay a round amount, get the change.
 *  Step 1 asks how much was spent in all; step 2 asks for the change. */
function moneyChange(rng: Rng) {
  const name = pickName(rng);
  const item = pick(rng, ['i:notebook', 'i:pen', 'i:cake', 'i:book'] as const);
  for (let t = 0; t < 500; t++) {
    const per = randInt(rng, 2, 20) * 1000;
    const n = randInt(rng, 2, 9);
    const total = per * n;
    if (total >= RANGE_100000) continue;
    const paid = total < 50000 ? 50000 : 100000;
    return arithmeticItem(
      'mul-div-large-wp',
      3,
      ref('wpMoneyChange', { name, item, paid, n, per }),
      [numberStep(ref('askSpent'), total), numberStep(ref('askChange'), paid - total)],
      [total],
    );
  }
  return arithmeticItem(
    'mul-div-large-wp',
    3,
    ref('wpMoneyChange', { name, item: 'i:notebook', paid: 50000, n: 2, per: 3000 }),
    [numberStep(ref('askSpent'), 6000), numberStep(ref('askChange'), 44000)],
    [6000],
  );
}

/** One step: three multiplications are shown; pick the biggest (or smallest)
 *  result. The options are exactly the three results — no near miss. */
function compareLarge(rng: Rng) {
  const exprs: string[] = [];
  const results: number[] = [];
  while (exprs.length < 3) {
    const [a, b] = pickMulPair(rng, RANGE_100000, 3);
    const result = a * b;
    if (results.includes(result)) continue;
    exprs.push(`${a} × ${b}`);
    results.push(result);
  }
  const askMax = rng() < 0.5;
  const want = askMax ? Math.max(...results) : Math.min(...results);
  const others = results.filter((r) => r !== want);
  const options = optionsFrom(
    rng,
    want,
    others.map((value) => ({ value, misconception: 'near-miss' as const })),
    (n: number) => ref('num', { n }),
    3,
  );
  // The loop above fills exactly three expressions.
  const [expr1, expr2, expr3] = exprs as [string, string, string];
  return arithmeticItem('mul-div-large-wp', 3, ref('wpCompareLarge', { expr1, expr2, expr3 }), [
    { kind: 'choice', prompt: ref(askMax ? 'askMaxResult' : 'askMinResult'), options },
  ]);
}

/** Large mul WP: T1 one step, T2 one step or two steps with no carry, T3 two steps
 *  with a carry, money change, or compare results. */
const mulDivLargeWp: ReasoningGenerator = (rng, tier) => {
  if (tier === 3) {
    const r = rng();
    if (r < 1 / 3) return moneyChange(rng);
    if (r < 2 / 3) return compareLarge(rng);
    return mulThenSubLarge(rng, tier, false);
  }
  const twoStepAt = tier === 1 ? false : tier === 2 ? rng() < 0.5 : rng() < 0.7;
  return twoStepAt ? mulThenSubLarge(rng, tier, tier === 2) : mulTimesLarge(rng, tier);
};

/** A chain of operators: T1 a × b + c (4-digit a, final ≤ 10 000), T2 a × b − c
 *  (5-digit a, final ≥ 0), T3 a + b × c (multiply first — the left-to-right trap). */
const mulChainOperators: ReasoningGenerator = (rng, tier) => {
  if (tier === 1) {
    for (let t = 0; t < 500; t++) {
      const [a, b] = pickMulPair(rng, RANGE_10000, tier);
      const c = randInt(rng, 1, 9) * 100;
      const final = a * b + c;
      if (final > RANGE_10000) continue;
      return arithmeticItem(
        'mul-chain-operators',
        tier,
        ref('chainCalc', { expr: `${a} × ${b} + ${c}` }),
        [numberStep(ref('askResult'), final)],
      );
    }
    return arithmeticItem(
      'mul-chain-operators',
      tier,
      ref('chainCalc', { expr: '1002 × 2 + 100' }),
      [numberStep(ref('askResult'), 2104)],
    );
  }
  if (tier === 2) {
    for (let t = 0; t < 500; t++) {
      const [a, b] = pickMulPair(rng, RANGE_100000, tier);
      const c = randInt(rng, 1, 9) * 1000;
      const final = a * b - c;
      if (final < 0) continue;
      return arithmeticItem(
        'mul-chain-operators',
        tier,
        ref('chainCalc', { expr: `${a} × ${b} − ${c}` }),
        [numberStep(ref('askResult'), final)],
      );
    }
    return arithmeticItem(
      'mul-chain-operators',
      tier,
      ref('chainCalc', { expr: '10005 × 2 − 1000' }),
      [numberStep(ref('askResult'), 19010)],
    );
  }
  for (let t = 0; t < 500; t++) {
    const [b, c] = pickMulPair(rng, RANGE_100000, 2);
    const a = randInt(rng, 1, 9) * 1000;
    const final = a + b * c;
    if (final >= RANGE_100000) continue;
    return arithmeticItem(
      'mul-chain-operators',
      tier,
      ref('chainCalc', { expr: `${a} + ${b} × ${c}` }),
      [numberStep(ref('askResult'), final)],
    );
  }
  return arithmeticItem(
    'mul-chain-operators',
    tier,
    ref('chainCalc', { expr: '1000 + 10005 × 2' }),
    [numberStep(ref('askResult'), 21010)],
  );
};

export const LARGE_WP_GENERATORS: Record<string, ReasoningGenerator> = {
  'mul-div-large-wp': mulDivLargeWp,
  'mul-chain-operators': mulChainOperators,
};
