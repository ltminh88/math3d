// KNTT B1 / B46 / B59 / B60: comparing and ordering numbers to 1 000 / 10 000 / 100 000,
// and expanding a 5-digit number into a sum of place values. Tiers raise the traps (same
// hundreds, equal prefixes, 3-digit vs 4-digit, a wrong-place term), never the size.
// Ordering is sequential choice steps (pick the 1st, then the 2nd, ... and type the last):
// the kit's multi-select is set-only, so it cannot test an order.
import { pick, type Rng, randInt, shuffle } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { PracticeItem } from '../practice/practice-scene';
import { numberStep, ref } from '../reasoning/reasoning-distractors';
import { evalExpr } from '../reasoning/reasoning-test-oracles';
import type { ChoiceOption, PromptRef, ReasoningStep } from '../reasoning/reasoning-types';
import {
  expandedChoiceStep,
  expandedSumText,
  numberChoiceStepRange,
  numberItem,
  signChoiceStep,
  wrongPlaceExpansion,
} from './numbers-distractors';
import { digitsOf, fromDigits, RANGE_1000, RANGE_10000, RANGE_100000 } from './numbers-ranges';
import { kindFor, pickNumber } from './place-value-generators';

/** A choice among the numbers still unpicked; the right one is `want`. */
function orderChoiceStep(
  rng: Rng,
  prompt: PromptRef,
  remaining: readonly number[],
  want: number,
): ReasoningStep {
  const options: ChoiceOption[] = remaining.map((v, i) => ({
    id: `o${i}`,
    label: ref('num', { n: v }),
    correct: v === want,
    ...(v === want ? {} : { misconception: 'near-miss' as const }),
  }));
  return { kind: 'choice', prompt, options: shuffle(rng, options) };
}

/** Order `numbers` by picking them one by one, then typing the last one. */
function orderItem(
  skillId: string,
  tier: SkillTier,
  rng: Rng,
  numbers: readonly number[],
  ascending: boolean,
): PracticeItem {
  const sorted = [...numbers].sort((x, y) => (ascending ? x - y : y - x));
  const remaining = [...numbers];
  const steps: ReasoningStep[] = [];
  const ordinals = ['i:first', 'i:second', 'i:third'] as const;
  const firstPos = ascending ? 'i:smallest' : 'i:largest';
  const lastPos = ascending ? 'i:largest' : 'i:smallest';
  for (let k = 0; k < numbers.length - 1; k++) {
    const want = sorted[k] as number;
    steps.push(
      orderChoiceStep(
        rng,
        ref('askOrder', { ord: ordinals[k] as string, pos: k === 0 ? firstPos : 'i:next' }),
        remaining,
        want,
      ),
    );
    remaining.splice(remaining.indexOf(want), 1);
  }
  steps.push(numberStep(ref('askLast', { pos: lastPos }), sorted.at(-1) as number));
  return numberItem(
    skillId,
    tier,
    ref(ascending ? 'orderAsc' : 'orderDesc', { list: numbers.join(', ') }),
    steps,
  );
}

/** "Which is the largest / smallest?" — one choice step among the numbers. */
function maxMinItem(
  skillId: string,
  tier: SkillTier,
  rng: Rng,
  numbers: readonly number[],
  range: number,
): PracticeItem {
  const askMax = rng() < 0.5;
  const want = askMax ? Math.max(...numbers) : Math.min(...numbers);
  const others = numbers
    .filter((v) => v !== want)
    .map((v) => ({ value: v, misconception: 'near-miss' as const }));
  return numberItem(skillId, tier, ref('maxMin', { list: numbers.join(', ') }), [
    numberChoiceStepRange(rng, ref(askMax ? 'askMax' : 'askMin'), want, others, range),
  ]);
}

/** `count` distinct numbers with `digits` digits, all inside the range. */
function distinctNumbers(rng: Rng, digits: 3 | 4 | 5, count: number): number[] {
  const out: number[] = [];
  while (out.length < count) {
    const n = pickNumber(rng, digits, 'plain');
    if (!out.includes(n)) out.push(n);
  }
  return out;
}

/** Four distinct permutations of the same three digits (T2 order trap). */
function sameDigitsFour(rng: Rng): number[] {
  const digits = shuffle(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
  const perms = new Set<number>();
  for (const [i, j, k] of [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
  ] as const)
    perms.add(fromDigits([digits[i] as number, digits[j] as number, digits[k] as number]));
  return [...perms];
}

/** Compare `a` and `b` with a '>' / '<' / '=' choice. */
const compareItem = (skillId: string, tier: SkillTier, rng: Rng, a: number, b: number) =>
  numberItem(skillId, tier, ref('compare', { a, b }), [
    signChoiceStep(rng, ref('askCompare'), a, b),
  ]);

/** Compare `a` with the expanded sum `expr` (evaluates to its own number). */
const compareExprItem = (skillId: string, tier: SkillTier, rng: Rng, a: number, expr: string) =>
  numberItem(skillId, tier, ref('compareExpr', { a, expr }), [
    signChoiceStep(rng, ref('askCompare'), a, evalExpr(expr)),
  ]);

/** Compare to 1 000: T1 different hundreds, T2 same hundreds, T3 against an expansion. */
export const numCompare1000 = (rng: Rng, tier: SkillTier): PracticeItem => {
  const skillId = 'num-compare-1000';
  if (tier === 1) {
    const a = pickNumber(rng, 3, 'plain');
    const bHundreds = pick(
      rng,
      [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((h) => h !== Math.floor(a / 100)),
    );
    return compareItem(skillId, 1, rng, a, bHundreds * 100 + randInt(rng, 0, 99));
  }
  if (tier === 2) {
    const h = randInt(rng, 1, 9);
    const a = h * 100 + randInt(rng, 0, 99);
    let b = h * 100 + randInt(rng, 0, 99);
    if (b === a) b = a === h * 100 ? a + 1 : a - 1;
    return compareItem(skillId, 2, rng, a, b);
  }
  const n = pickNumber(rng, 3, kindFor(3));
  // The equal case is rare on purpose: half the draws would sit on ~225 numbers.
  if (rng() < 0.2) return compareExprItem(skillId, 3, rng, n, expandedSumText(n));
  let m = pickNumber(rng, 3, 'plain');
  if (m === n) m = n === 999 ? n - 1 : n + 1;
  return compareExprItem(skillId, 3, rng, n, expandedSumText(m));
};

/** Compare to 10 000: T1 different thousands, T2 lower places, T3 3- vs 4-digit + prefixes. */
export const numCompare10000 = (rng: Rng, tier: SkillTier): PracticeItem => {
  const skillId = 'num-compare-10000';
  if (tier === 1) {
    const a = pickNumber(rng, 4, 'plain');
    const bThousands = pick(
      rng,
      [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((h) => h !== Math.floor(a / 1000)),
    );
    return compareItem(skillId, 1, rng, a, bThousands * 1000 + randInt(rng, 0, 999));
  }
  if (tier === 2) {
    const prefix = randInt(rng, 10, 99);
    const a = prefix * 100 + randInt(rng, 0, 99);
    let b = prefix * 100 + randInt(rng, 0, 99);
    if (b === a) b = a === prefix * 100 ? a + 1 : a - 1;
    return compareItem(skillId, 2, rng, a, b);
  }
  if (rng() < 0.5) {
    const a = pickNumber(rng, 3, 'plain');
    const b = pickNumber(rng, 4, 'plain');
    return compareItem(skillId, 3, rng, a, b);
  }
  const prefix = randInt(rng, 100, 999);
  const a = prefix * 10 + randInt(rng, 0, 9);
  let b = prefix * 10 + randInt(rng, 0, 9);
  if (b === a) b = a === prefix * 10 ? a + 1 : a - 1;
  return compareItem(skillId, 3, rng, a, b);
};

/** Compare to 100 000: T1 ten-thousands, T2 a lower place, T3 against an expansion. */
export const numCompare100000 = (rng: Rng, tier: SkillTier): PracticeItem => {
  const skillId = 'num-compare-100000';
  if (tier === 1) {
    const a = pickNumber(rng, 5, 'plain');
    const bTenThousands = pick(
      rng,
      [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((h) => h !== Math.floor(a / 10000)),
    );
    return compareItem(skillId, 1, rng, a, bTenThousands * 10000 + randInt(rng, 0, 9999));
  }
  if (tier === 2) {
    const first = randInt(rng, 1, 9);
    const a = first * 10000 + randInt(rng, 0, 9999);
    let b = first * 10000 + randInt(rng, 0, 9999);
    if (b === a) b = a === first * 10000 ? a + 1 : a - 1;
    return compareItem(skillId, 2, rng, a, b);
  }
  const n = pickNumber(rng, 5, kindFor(3));
  // The equal case is rare on purpose: half the draws would sit on a small pool.
  if (rng() < 0.2) return compareExprItem(skillId, 3, rng, n, expandedSumText(n));
  let m = pickNumber(rng, 5, 'plain');
  if (m === n) m = n === 99999 ? n - 1 : n + 1;
  return compareExprItem(skillId, 3, rng, n, expandedSumText(m));
};

/** Order to 1 000: T1 three numbers, T2 same digits permuted, T3 across a hundred. */
export const numOrder1000 = (rng: Rng, tier: SkillTier): PracticeItem => {
  const skillId = 'num-order-1000';
  const ascending = rng() < 0.5;
  if (tier === 1) {
    const numbers = distinctNumbers(rng, 3, 3);
    return rng() < 0.5
      ? orderItem(skillId, 1, rng, numbers, ascending)
      : maxMinItem(skillId, 1, rng, numbers, RANGE_1000);
  }
  if (tier === 2) return orderItem(skillId, 2, rng, sameDigitsFour(rng), ascending);
  // The crossing form has only 4 bases, so it stays rare; the bulk is a general order
  // and the equal-prefix largest/smallest.
  const roll = rng();
  if (roll < 0.2) {
    const base = pick(rng, [97, 98, 99, 997]);
    return orderItem(skillId, 3, rng, [base, base + 1, base + 2, base + 3], ascending);
  }
  if (roll < 0.6) return orderItem(skillId, 3, rng, distinctNumbers(rng, 3, 4), ascending);
  const h = randInt(rng, 1, 9);
  const t = randInt(rng, 0, 9);
  const ones = shuffle(rng, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4);
  return maxMinItem(
    skillId,
    3,
    rng,
    ones.map((o) => h * 100 + t * 10 + o),
    RANGE_1000,
  );
};

/** Order to 10 000: T1 three numbers, T2 four, T3 3- vs 4-digit + equal prefixes. */
export const numOrder10000 = (rng: Rng, tier: SkillTier): PracticeItem => {
  const skillId = 'num-order-10000';
  const ascending = rng() < 0.5;
  if (tier === 1) {
    const numbers = distinctNumbers(rng, 4, 3);
    return rng() < 0.5
      ? orderItem(skillId, 1, rng, numbers, ascending)
      : maxMinItem(skillId, 1, rng, numbers, RANGE_10000);
  }
  if (tier === 2) return orderItem(skillId, 2, rng, distinctNumbers(rng, 4, 4), ascending);
  // The crossing form has only 2 bases, so it stays rare; the bulk is a general order
  // and the equal-prefix largest/smallest.
  const roll = rng();
  if (roll < 0.2) {
    const base = pick(rng, [998, 999]);
    return orderItem(skillId, 3, rng, [base, base + 1, base + 2, base + 3], ascending);
  }
  if (roll < 0.6) return orderItem(skillId, 3, rng, distinctNumbers(rng, 4, 4), ascending);
  const prefix = randInt(rng, 100, 999);
  const ones = shuffle(rng, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4);
  return maxMinItem(
    skillId,
    3,
    rng,
    ones.map((o) => prefix * 10 + o),
    RANGE_10000,
  );
};

/** Order to 100 000: T1 three numbers, T2 four, T3 largest / smallest from five digits. */
export const numOrder100000 = (rng: Rng, tier: SkillTier): PracticeItem => {
  const skillId = 'num-order-100000';
  const ascending = rng() < 0.5;
  if (tier === 1) {
    const numbers = distinctNumbers(rng, 5, 3);
    return rng() < 0.5
      ? orderItem(skillId, 1, rng, numbers, ascending)
      : maxMinItem(skillId, 1, rng, numbers, RANGE_100000);
  }
  if (tier === 2) return orderItem(skillId, 2, rng, distinctNumbers(rng, 5, 4), ascending);
  const digits = shuffle(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 5);
  const desc = [...digits].sort((x, y) => y - x);
  const asc = [...digits].sort((x, y) => x - y);
  return numberItem(skillId, 3, ref('makeMaxMin', { digits: digits.join(' ') }), [
    numberStep(ref('askLargest'), fromDigits(desc)),
    numberStep(ref('askSmallest'), fromDigits(asc)),
  ]);
};

/** Expand a 5-digit number: T1 pick the sum, T2 fill a term, T3 judge a claim (Đ/S + fix). */
export const numExpand100000 = (rng: Rng, tier: SkillTier): PracticeItem => {
  const skillId = 'num-expand-100000';
  if (tier === 1) {
    const n = pickNumber(rng, 5, kindFor(1));
    return numberItem(skillId, 1, ref('expandSum', { n }), [
      expandedChoiceStep(rng, ref('askExpanded'), n, RANGE_100000),
    ]);
  }
  if (tier === 2) {
    // Exactly three non-zero terms; the middle one is hidden.
    const ds = [randInt(rng, 1, 9)];
    const zeroSpots = shuffle(rng, [1, 2, 3, 4]).slice(0, 2);
    for (let i = 1; i < 5; i++) ds.push(zeroSpots.includes(i) ? 0 : randInt(rng, 1, 9));
    const n = fromDigits(ds);
    const terms = digitsOf(n)
      .map((d, i) => (d === 0 ? 0 : d * 10 ** (4 - i)))
      .filter((t) => t !== 0);
    const [x, missing, y] = terms as [number, number, number];
    return numberItem(skillId, 2, ref('expandFill', { n, x, y }), [
      numberStep(ref('askFill'), missing as number),
    ]);
  }
  const n = pickNumber(rng, 5, kindFor(3));
  const truth = rng() < 0.5;
  const text = truth
    ? expandedSumText(n)
    : (wrongPlaceExpansion(n, RANGE_100000) ?? expandedSumText(n === 99999 ? n - 1 : n + 1));
  const claim = evalExpr(text) === n;
  const step: ReasoningStep = {
    kind: 'verdict',
    prompt: ref('isItTrue'),
    statement: ref('stmtEq', { text, value: n }),
    answer: claim,
    ...(claim ? {} : { fix: { prompt: ref('askSum'), answer: evalExpr(text) } }),
  };
  return numberItem(
    skillId,
    3,
    ref('expandVerdict', { n }),
    [step],
    undefined,
    claim ? [] : [evalExpr(text)],
  );
};
