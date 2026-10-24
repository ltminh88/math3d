// Pure question formats of the tower (mixed × and : over tables 2-9). One floor = one question:
// choice "a × b = ?", number pad "p : d = ?", missing factor "? × 7 = 56", fact family, and the
// "đố vui" true/false claim, which is fixed on the pad when false (still one recorded question).
import { pickDistractors, placeAnswer } from '../../learning/distractor-picker';
import { type FactKey, parseFactKey } from '../../learning/fact-key';
import { pick, type Rng } from '../../learning/seeded-rng';

export type TowerFormat = 'choice' | 'pad' | 'missing' | 'family' | 'truefalse';
export type TowerOp = 'mul' | 'div';

/** Rotation order; a floor takes the next format that fits its fact and differs from the last. */
export const FORMAT_ROTATION: readonly TowerFormat[] = [
  'choice',
  'pad',
  'missing',
  'family',
  'truefalse',
];
const FORMATS_FOR: Record<TowerOp, readonly TowerFormat[]> = {
  mul: ['choice', 'missing', 'family', 'truefalse'],
  div: ['pad', 'missing', 'family', 'truefalse'],
};
/** Share of true/false claims that are true (most are false and must be fixed). */
const TRUE_CLAIM_SHARE = 1 / 3;

/** a × b = p; for a division p : b = a. */
export interface FactTriple {
  readonly op: TowerOp;
  readonly a: number;
  readonly b: number;
  readonly p: number;
}

/** `x op y = z`; `blank` is the number the child gives (null: a claim to judge). */
export interface TowerEquation {
  readonly x: number;
  readonly op: TowerOp;
  readonly y: number;
  readonly z: number;
  readonly blank: 'x' | 'z' | null;
}

export type TowerStep =
  | { readonly kind: 'number'; readonly eq: TowerEquation; readonly answer: number }
  | {
      readonly kind: 'choice';
      readonly eq: TowerEquation;
      readonly answer: number;
      readonly choices: readonly number[];
    }
  | { readonly kind: 'verdict'; readonly eq: TowerEquation; readonly answer: boolean };

export interface TowerQuestion {
  readonly format: TowerFormat;
  readonly factKey: FactKey;
  readonly triple: FactTriple;
  readonly steps: readonly TowerStep[];
}

export function factTriple(key: FactKey): FactTriple {
  const parsed = parseFactKey(key);
  if (!parsed) throw new Error(`tower: not a fact key: ${key}`);
  if (parsed.op === 'mul') {
    return { op: 'mul', a: parsed.min, b: parsed.max, p: parsed.min * parsed.max };
  }
  const { dividend, divisor } = parsed;
  return { op: 'div', a: dividend / divisor, b: divisor, p: dividend };
}

/** Formats per floor: rotation order, fitting the fact's operation, never twice in a row. */
export function assignFormats(facts: readonly FactKey[]): TowerFormat[] {
  const out: TowerFormat[] = [];
  let cursor = 0;
  for (const key of facts) {
    const fits = FORMATS_FOR[factTriple(key).op];
    for (let i = 0; i < FORMAT_ROTATION.length; i++) {
      const at = (cursor + i) % FORMAT_ROTATION.length;
      const format = FORMAT_ROTATION[at] as TowerFormat;
      if (fits.includes(format) && format !== out[out.length - 1]) {
        out.push(format);
        cursor = at + 1;
        break;
      }
    }
  }
  return out;
}

/** A wrong but believable result: one step off in either table (or a quotient off by one). */
export function plausibleWrong(t: FactTriple, rng: Rng): number {
  const candidates =
    t.op === 'mul' ? [t.p + t.a, t.p - t.a, t.p + t.b, t.p - t.b] : [t.a + 1, t.a - 1];
  const result = t.op === 'mul' ? t.p : t.a;
  return pick(
    rng,
    candidates.filter((n) => n > 0 && n !== result),
  );
}

/** The fact's own equation with the result blank: a × b = ? or p : b = ?. */
function ownEquation(t: FactTriple, rng: Rng): TowerEquation {
  if (t.op === 'div') return { x: t.p, op: 'div', y: t.b, z: t.a, blank: 'z' };
  const swap = rng() < 0.5;
  return { x: swap ? t.b : t.a, op: 'mul', y: swap ? t.a : t.b, z: t.p, blank: 'z' };
}

function familySteps(t: FactTriple): TowerStep[] {
  const all: TowerEquation[] = [
    { x: t.a, op: 'mul', y: t.b, z: t.p, blank: 'z' },
    { x: t.b, op: 'mul', y: t.a, z: t.p, blank: 'z' },
    { x: t.p, op: 'div', y: t.a, z: t.b, blank: 'z' },
    { x: t.p, op: 'div', y: t.b, z: t.a, blank: 'z' },
  ];
  return all
    .filter((eq, i) => all.findIndex((o) => o.op === eq.op && o.x === eq.x && o.y === eq.y) === i)
    .map((eq) => ({ kind: 'number', eq, answer: eq.z }));
}

/** Builds the floor's steps; `errorBank` (the child's past wrong answers) feeds the distractors. */
export function buildQuestion(
  factKey: FactKey,
  format: TowerFormat,
  rng: Rng,
  errorBank: readonly number[],
): TowerQuestion {
  const t = factTriple(factKey);
  const make = (steps: TowerStep[]): TowerQuestion => ({ format, factKey, triple: t, steps });
  if (format === 'family') return make(familySteps(t));
  if (format === 'missing') {
    const hideA = t.op === 'div' || rng() < 0.5;
    const [hidden, shown] = hideA ? [t.a, t.b] : [t.b, t.a];
    const eq: TowerEquation = { x: hidden, op: 'mul', y: shown, z: t.p, blank: 'x' };
    return make([{ kind: 'number', eq, answer: hidden }]);
  }
  const eq = ownEquation(t, rng);
  if (format === 'truefalse') {
    const isTrue = rng() < TRUE_CLAIM_SHARE;
    const claim: TowerEquation = { ...eq, z: isTrue ? eq.z : plausibleWrong(t, rng), blank: null };
    const verdict: TowerStep = { kind: 'verdict', eq: claim, answer: isTrue };
    return make(isTrue ? [verdict] : [verdict, { kind: 'number', eq, answer: eq.z }]);
  }
  if (format === 'pad') return make([{ kind: 'number', eq, answer: eq.z }]);
  const distractors = pickDistractors(
    { factKey, a: eq.x, b: eq.y, answer: eq.z, errorBank },
    rng,
    2,
  );
  const { choices } = placeAnswer(eq.z, distractors, rng);
  return make([{ kind: 'choice', eq, answer: eq.z, choices }]);
}
