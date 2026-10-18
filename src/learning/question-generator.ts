import type { DistractorContext } from './distractor-classes';
import { pickDistractors, placeAnswer } from './distractor-picker';
import { expressionChoice } from './expression-choice';
import { type FactKey, parseFactKey } from './fact-key';
import type { Question, QuestionType } from './question-types';
import type { Rng } from './seeded-rng';

export interface GenerateOptions {
  /** Leitner box of the fact: boxes 1-2 are concrete, 3+ symbolic. Default 1. */
  box?: number;
  /** Force a representation family (levels choose their own). */
  type?: QuestionType;
  /** Child's recent wrong answers for this fact. */
  errorBank?: readonly number[];
}

export const CONCRETE_MAX_BOX = 2;

interface Triple {
  /** The two factors in canonical (a <= b for mul) order; for division a = divisor, b = quotient. */
  a: number;
  b: number;
  product: number;
  isDivision: boolean;
}

function toTriple(key: FactKey): Triple {
  const parsed = parseFactKey(key);
  if (!parsed) throw new Error(`generateQuestion: invalid fact key "${key}"`);
  if (parsed.op === 'mul')
    return { a: parsed.min, b: parsed.max, product: parsed.min * parsed.max, isDivision: false };
  return {
    a: parsed.divisor,
    b: parsed.dividend / parsed.divisor,
    product: parsed.dividend,
    isDivision: true,
  };
}

const swapOrder = (rng: Rng, a: number, b: number): [number, number] =>
  rng() < 0.5 ? [a, b] : [b, a];

function choicesFor(ctx: DistractorContext, rng: Rng) {
  return placeAnswer(ctx.answer, pickDistractors(ctx, rng), rng);
}

function defaultType(triple: Triple, box: number): QuestionType {
  if (box <= CONCRETE_MAX_BOX) return triple.isDivision ? 'share' : 'equal-groups';
  return 'numeric';
}

export function generateQuestion(
  factKey: FactKey,
  rng: Rng,
  options: GenerateOptions = {},
): Question {
  const triple = toTriple(factKey);
  const type = options.type ?? defaultType(triple, options.box ?? 1);
  const errorBank = options.errorBank ?? [];
  const mulCtx: DistractorContext = {
    factKey,
    a: triple.a,
    b: triple.b,
    answer: triple.product,
    errorBank,
  };
  const requireMul = (): void => {
    if (triple.isDivision)
      throw new Error(`generateQuestion: "${type}" needs a multiplication fact, got ${factKey}`);
  };

  switch (type) {
    case 'equal-groups': {
      requireMul();
      const [groupSize, groupCount] = swapOrder(rng, triple.a, triple.b);
      return {
        type,
        factKey,
        representation: 'concrete',
        answer: triple.product,
        groupSize,
        groupCount,
        expression: `${groupSize} x ${groupCount}`,
        ...choicesFor(mulCtx, rng),
      };
    }
    case 'array': {
      requireMul();
      const [rows, cols] = swapOrder(rng, triple.a, triple.b);
      return {
        type,
        factKey,
        representation: 'concrete',
        answer: triple.product,
        rows,
        cols,
        ...choicesFor(mulCtx, rng),
      };
    }
    case 'expression-choice': {
      requireMul();
      const [groupSize, groupCount] = swapOrder(rng, triple.a, triple.b);
      return expressionChoice(factKey, groupSize, groupCount, rng);
    }
    case 'numeric': {
      if (triple.isDivision) {
        const ctx: DistractorContext = {
          ...mulCtx,
          answer: triple.b,
          a: triple.a,
          b: triple.b,
          dividend: triple.product,
        };
        return {
          type,
          factKey,
          representation: 'symbolic',
          answer: triple.b,
          expression: `${triple.product} : ${triple.a}`,
          ...choicesFor(ctx, rng),
        };
      }
      const [x, y] = swapOrder(rng, triple.a, triple.b);
      return {
        type,
        factKey,
        representation: 'symbolic',
        answer: triple.product,
        expression: `${x} x ${y}`,
        ...choicesFor(mulCtx, rng),
      };
    }
    case 'share': {
      // Sharing `product` among `a` groups gives `b` each (mul facts use either factor as the group count).
      const [groups, each] = triple.isDivision
        ? [triple.a, triple.b]
        : swapOrder(rng, triple.a, triple.b);
      const ctx: DistractorContext = {
        factKey,
        a: groups,
        b: each,
        answer: each,
        dividend: triple.product,
        errorBank,
      };
      return {
        type,
        factKey,
        representation: 'concrete',
        answer: each,
        total: triple.product,
        groups,
        ...choicesFor(ctx, rng),
      };
    }
    case 'fact-family': {
      const [x, y] = swapOrder(rng, triple.a, triple.b);
      const hidden = rng() < 0.5 ? 'product' : 'factor';
      const ctx: DistractorContext =
        hidden === 'product'
          ? { ...mulCtx, a: x, b: y }
          : { factKey, a: x, b: y, answer: y, dividend: triple.product, errorBank };
      return {
        type,
        factKey,
        representation: 'symbolic',
        answer: ctx.answer,
        factors: [x, y],
        product: triple.product,
        hidden,
        ...choicesFor(ctx, rng),
      };
    }
  }
}
