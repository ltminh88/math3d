import { hardPartnerProducts } from './hard-pairs';

/** Facts reduced to two factors and the answer. Division: a = divisor, b = quotient, answer = quotient. */
export interface DistractorContext {
  factKey: string;
  a: number;
  b: number;
  answer: number;
  /** Set for division: the dividend. */
  dividend?: number;
  /** Child's recent wrong answers for this fact. */
  errorBank: readonly number[];
}

export type DistractorClass =
  | 'neighbour'
  | 'operation'
  | 'digit'
  | 'cross-table'
  | 'same-ones'
  | 'personal';

export type DistractorFn = (ctx: DistractorContext) => number[];

const MIN = 1;
const MAX = 100;

export const inRange = (n: number): boolean => Number.isInteger(n) && n >= MIN && n <= MAX;

/** One step off in either table: answer +- a, +- b (the "next/previous in the table" slip). */
const neighbour: DistractorFn = ({ a, b, answer }) => [
  answer + a,
  answer - a,
  answer + b,
  answer - b,
];

/** Right numbers, wrong operation. */
const operation: DistractorFn = ({ a, b, dividend }) => {
  const out = [a + b, Math.abs(a - b)];
  if (dividend !== undefined) out.push(dividend, dividend - a, dividend + a);
  return out;
};

/** Digit swap (42 -> 24) and off-by-ten. */
const digit: DistractorFn = ({ answer }) => {
  const out = [answer + 10, answer - 10];
  if (answer >= 10 && answer < 100) {
    const swapped = Number(`${answer % 10}${Math.floor(answer / 10)}`);
    if (swapped !== answer) out.push(swapped);
  }
  return out;
};

/** Confusable partner facts first, then the products of the adjacent tables. */
const crossTable: DistractorFn = ({ factKey, a, b }) => [
  ...hardPartnerProducts(factKey),
  (a + 1) * b,
  (a - 1) * b,
  a * (b + 1),
  a * (b - 1),
];

/** Other times-table products ending in the same digit as the answer. */
const sameOnes: DistractorFn = ({ answer }) => {
  const out: number[] = [];
  for (let x = 2; x <= 10; x++) {
    for (let y = x; y <= 10; y++) {
      const p = x * y;
      if (p !== answer && p % 10 === answer % 10) out.push(p);
    }
  }
  return [...new Set(out)];
};

const personal: DistractorFn = ({ errorBank }) => [...errorBank];

export const DISTRACTOR_CLASSES: Record<DistractorClass, DistractorFn> = {
  neighbour,
  operation,
  digit,
  'cross-table': crossTable,
  'same-ones': sameOnes,
  personal,
};

/** Valid, de-duplicated candidates of one class. */
export function classCandidates(cls: DistractorClass, ctx: DistractorContext): number[] {
  return [...new Set(DISTRACTOR_CLASSES[cls](ctx))].filter((n) => inRange(n) && n !== ctx.answer);
}
