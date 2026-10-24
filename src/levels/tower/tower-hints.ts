// Tower hint rungs: 1 encourage, 2 the related fact (division for a product, multiplication for
// a division), 3 split strategy for big products or skip counting, 4 a strategy from a known
// fact (× 1, 2, 5 or 10) with the result left as "?". The result itself is only shown by the
// three-miss path, which records the floor as not correct (learning-core ladder, rung 5).
// `hintSpec` is pure (tested); `renderHint` writes it into the recovered hint area.
import type { HintRung } from '../../learning/hint-ladder';
import type { TowerEquation, TowerStep } from './tower-question-formats';
import type { TowerStrings } from './tower-strings';

type HintKey =
  | 'hint1'
  | 'hint2Div'
  | 'hint2Mul'
  | 'hint2DivOf'
  | 'hint3Split'
  | 'hint3Count'
  | 'hint3CountTo'
  | 'hint4MulUp'
  | 'hint4MulDown'
  | 'hint4DivUp'
  | 'hint4DivDown';

export interface HintSpec {
  key: HintKey;
  vars: Record<string, string | number>;
}

/** The step's true equation (a claim is checked against the real result). */
function trueEquation(step: TowerStep): TowerEquation {
  const { x, op, y } = step.eq;
  return { ...step.eq, z: op === 'mul' ? x * y : x / y };
}

const countBy = (step: number, terms: number): number[] =>
  Array.from({ length: terms }, (_, i) => step * (i + 1));

/** Easy multipliers a rung-4 strategy starts from. */
const ANCHORS = [1, 2, 5, 10] as const;

/** The anchor nearest to `unknown` whose fact `base × k` does not show `answer`. */
function anchorFor(unknown: number, base: number, answer: number): number {
  let best: number = ANCHORS[2];
  let distance = Number.POSITIVE_INFINITY;
  for (const k of ANCHORS) {
    if (k === unknown || k === answer || base * k === answer) continue;
    if (Math.abs(k - unknown) < distance) [best, distance] = [k, Math.abs(k - unknown)];
  }
  return best;
}

/** Rung 4: from a known fact of the same table to the asked one, the result left as "?". */
function strategy(eq: TowerEquation): HintSpec {
  if (eq.op === 'mul' && eq.blank !== 'x') {
    const [a, b] = eq.x <= eq.y ? [eq.x, eq.y] : [eq.y, eq.x];
    const k = anchorFor(a, b, eq.z);
    const vars = { b, a, k, anchor: b * k, n: Math.abs(a - k) };
    return { key: k < a ? 'hint4MulUp' : 'hint4MulDown', vars };
  }
  // Unknown factor: p : d = ? or ? × d = p.
  const [p, d, unknown] = eq.op === 'div' ? [eq.x, eq.y, eq.z] : [eq.z, eq.y, eq.x];
  const k = anchorFor(unknown, d, unknown);
  return { key: k < unknown ? 'hint4DivUp' : 'hint4DivDown', vars: { d, k, anchor: d * k, p } };
}

export function hintSpec(rung: HintRung, step: TowerStep): HintSpec {
  const eq = trueEquation(step);
  if (rung <= 1) return { key: 'hint1', vars: {} };
  if (rung >= 4) return strategy(eq);
  // Factor unknown: p : d = ? or ? × d = p.
  if (eq.op === 'div' || eq.blank === 'x') {
    const p = eq.op === 'div' ? eq.x : eq.z;
    const d = eq.y;
    if (rung === 2) {
      return eq.op === 'div'
        ? { key: 'hint2Mul', vars: { d, p } }
        : { key: 'hint2DivOf', vars: { d, p } };
    }
    return { key: 'hint3CountTo', vars: { step: d, p, sequence: countBy(d, p / d).join(', ') } };
  }
  if (rung === 2) return { key: 'hint2Div', vars: { x: eq.x, y: eq.y } };
  const small = Math.min(eq.x, eq.y);
  const big = Math.max(eq.x, eq.y);
  if (small <= 5) {
    return {
      key: 'hint3Count',
      vars: { step: big, sequence: [...countBy(big, small - 1), '?'].join(', ') },
    };
  }
  const rest = big - 5;
  return {
    key: 'hint3Split',
    vars: { a: small, b: big, rest, five: small * 5, more: small * rest },
  };
}

/** "8 × 7 = 56" with the language's signs. */
export function equationText(ts: TowerStrings, eq: TowerEquation, z: number = eq.z): string {
  return `${eq.x} ${ts(eq.op === 'mul' ? 'mulSign' : 'divSign')} ${eq.y} = ${z}`;
}

/** The equation in words for screen readers: "mấy nhân 7 bằng 56". */
export function spokenEquation(ts: TowerStrings, eq: TowerEquation): string {
  const blank = ts('speakBlank');
  return ts(eq.op === 'mul' ? 'speakMul' : 'speakDiv', {
    x: eq.blank === 'x' ? blank : eq.x,
    y: eq.y,
    z: eq.blank === 'z' ? blank : eq.z,
  });
}

/** Renders `rung` for `step` into the hint area and returns the text (for the announcement). */
export function renderHint(
  area: HTMLElement,
  ts: TowerStrings,
  rung: HintRung,
  step: TowerStep,
): string {
  const spec = hintSpec(rung, step);
  const text = ts(spec.key, spec.vars);
  const p = document.createElement('p');
  p.textContent = text;
  area.replaceChildren(p);
  area.hidden = false;
  area.dataset.rung = String(rung);
  return text;
}
