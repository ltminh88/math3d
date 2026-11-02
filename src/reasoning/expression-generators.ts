// Numeric expressions (KNTT T1 B38, B42): × and : before + and −, brackets first. Tier 1 asks the
// part to do first, tier 2 offers the left-to-right / ignore-brackets trap as a choice, tier 3
// adds a third operation. Every partial result stays within 0..100.
import { pick, type Rng, randInt } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import {
  expressionChoiceStep,
  numberChoiceStep,
  numberStep,
  pickNoun,
  reasoningItem,
  ref,
} from './reasoning-distractors';
import { MAX_NUMBER } from './reasoning-ranges';
import type { Misconception, ReasoningGenerator, ReasoningStep } from './reasoning-types';

interface Expr {
  text: string;
  value: number;
  /** The part done first and its value. */
  part: { text: string; value: number };
  /** Value when the rule is broken (left to right / brackets ignored). */
  trap: number;
}

const ASK_VALUE = ref('askValue');

function exprSteps(rng: Rng, tier: SkillTier, e: Expr, trapKind: Misconception): ReasoningStep[] {
  if (tier === 1)
    return [
      numberStep(ref('askPart', { text: e.part.text }), e.part.value),
      numberStep(ASK_VALUE, e.value),
    ];
  if (tier === 2)
    return [
      numberChoiceStep(rng, ASK_VALUE, e.value, [{ value: e.trap, misconception: trapKind }]),
    ];
  return [numberStep(ASK_VALUE, e.value)];
}

const product = (rng: Rng, max: number): [number, number] => {
  const b = randInt(rng, 2, 9);
  return [b, randInt(rng, 2, Math.max(2, Math.min(9, Math.floor(max / b))))];
};

/** a + b × c, a − b × c, b × c − a, a + b × c − d (tier 3). */
function orderExpr(rng: Rng, tier: SkillTier): Expr {
  const [b, c] = product(rng, 60);
  const bc = b * c;
  const part = { text: `${b} × ${c}`, value: bc };
  if (tier === 3) {
    const a = randInt(rng, 1, MAX_NUMBER - bc);
    const d = randInt(rng, 1, a + bc);
    return { text: `${a} + ${b} × ${c} − ${d}`, value: a + bc - d, part, trap: (a + b) * c - d };
  }
  const form = randInt(rng, 0, 2);
  if (form === 0) {
    const a = randInt(rng, 1, MAX_NUMBER - bc);
    return { text: `${a} + ${b} × ${c}`, value: a + bc, part, trap: (a + b) * c };
  }
  if (form === 1) {
    const a = randInt(rng, bc, MAX_NUMBER);
    return { text: `${a} − ${b} × ${c}`, value: a - bc, part, trap: (a - b) * c };
  }
  const a = randInt(rng, 1, bc);
  return { text: `${b} × ${c} − ${a}`, value: bc - a, part, trap: b * (c - a) };
}

/** (a + b) × c, (a + b) : c, a − (b + c); tier 3: (a + b) × c − d. */
function bracketExpr(rng: Rng, tier: SkillTier): Expr {
  const form = tier === 3 ? 3 : randInt(rng, 0, 2);
  if (form === 1) {
    const c = randInt(rng, 2, 9);
    const sum = c * randInt(rng, 2, Math.floor(MAX_NUMBER / c));
    const a = randInt(rng, 1, sum - 1);
    const text = `(${a} + ${sum - a}) : ${c}`;
    const trap = (sum - a) % c === 0 ? a + (sum - a) / c : -1;
    return { text, value: sum / c, part: { text: `${a} + ${sum - a}`, value: sum }, trap };
  }
  if (form === 2) {
    const a = randInt(rng, 10, MAX_NUMBER);
    const b = randInt(rng, 1, a - 1);
    const c = randInt(rng, 1, a - b);
    const part = { text: `${b} + ${c}`, value: b + c };
    return { text: `${a} − (${b} + ${c})`, value: a - b - c, part, trap: a - b + c };
  }
  const c = randInt(rng, 2, 9);
  const sum = randInt(rng, 2, Math.floor(MAX_NUMBER / c));
  const a = randInt(rng, 1, Math.max(1, sum - 1));
  const b = sum - a;
  const part = { text: `${a} + ${b}`, value: sum };
  if (form === 3) {
    const d = randInt(rng, 1, sum * c);
    const text = `(${a} + ${b}) × ${c} − ${d}`;
    return { text, value: sum * c - d, part, trap: a + b * c - d };
  }
  return { text: `(${a} + ${b}) × ${c}`, value: sum * c, part, trap: a + b * c };
}

export const exprOrder: ReasoningGenerator = (rng, tier) => {
  const e = orderExpr(rng, tier);
  const steps = exprSteps(rng, tier, e, 'left-to-right');
  return reasoningItem('expr-order', tier, ref('exprValue', { text: e.text }), steps, [
    e.part.value,
    e.value,
  ]);
};

export const exprBrackets: ReasoningGenerator = (rng, tier) => {
  const e = bracketExpr(rng, tier);
  const steps = exprSteps(rng, tier, e, 'ignore-brackets');
  return reasoningItem('expr-brackets', tier, ref('exprValue', { text: e.text }), steps, [
    e.part.value,
    e.value,
  ]);
};

/** A story told as one expression: n bags of p, e eaten (n × p − e); tier 3 shares (a + b) : n. */
export const exprFromStory: ReasoningGenerator = (rng, tier) => {
  const pickExpr = ref('pickExpr');
  if (tier === 3) {
    const n = pick(rng, [2, 3, 4, 5]);
    const total = n * randInt(rng, 3, Math.floor(MAX_NUMBER / n));
    const a = randInt(rng, 1, total - 1);
    const b = total - a;
    const item = pickNoun(rng);
    const story = ref('exprStoryShare', { a, b, n, item });
    const steps = [
      expressionChoiceStep(rng, pickExpr, `(${a} + ${b}) : ${n}`, [
        { value: `${a} + ${b} : ${n}`, misconception: 'ignore-brackets' },
        { value: `(${a} + ${b}) × ${n}`, misconception: 'wrong-inverse' },
        { value: `${a} + ${b} − ${n}`, misconception: 'minus-instead-of-divide' },
      ]),
      numberStep(ref('askEach', { item }), total / n),
    ];
    return reasoningItem('expr-from-story', tier, story, steps, [total, total / n]);
  }
  const [n, p] = product(rng, 90);
  const e = randInt(rng, 1, n * p - 1);
  const item = pickNoun(rng);
  const story = ref('exprStoryEat', { n, p, e, item });
  const left = numberStep(ref('askLeftOver', { item }), n * p - e);
  const steps =
    tier === 1
      ? [numberStep(ref('askPart', { text: `${n} × ${p}` }), n * p), left]
      : [
          expressionChoiceStep(rng, pickExpr, `${n} × ${p} − ${e}`, [
            { value: `${n} + ${p} − ${e}`, misconception: 'add-instead-of-times' },
            { value: `${n} × ${p} + ${e}`, misconception: 'wrong-step' },
            { value: `${n} × ${p}`, misconception: 'one-step-only' },
          ]),
          left,
        ];
  return reasoningItem('expr-from-story', tier, story, steps, [n * p, n * p - e]);
};
