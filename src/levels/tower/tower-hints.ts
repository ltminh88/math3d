// Tower hint rungs: 1 encourage, 2 the related fact (division for a product, multiplication for
// a division), 3 split strategy for big products or skip counting, 4 a strategy from a known
// fact (× 2 or 5; × 10 only near 10) with the result left as "?". The result itself is only shown
// by the three-miss path, which records the floor as not correct (learning-core ladder, rung 5).
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

/**
 * Known facts a rung-4 strategy starts from (QA m-5: the ×10 trick only helps near 10): ×2 and
 * ×5 always, ×10 for an 8 or a 9, ×1 only to double (an unknown 2).
 */
function anchorsFor(unknown: number): number[] {
  return [unknown === 2 ? 1 : 0, 2, 5, unknown >= 8 ? 10 : 0].filter((k) => k > 0);
}

/** Nearest usable anchor `base × k` to `base × unknown` that does not show `answer`. */
function anchorFor(unknown: number, base: number, answer: number): number | undefined {
  const usable = anchorsFor(unknown).filter(
    (k) => k !== unknown && k !== answer && base * k !== answer,
  );
  return usable.sort((p, q) => Math.abs(p - unknown) - Math.abs(q - unknown))[0];
}

/** Rung 4: from a known fact to the asked one, the result left as "?". */
function strategy(eq: TowerEquation): HintSpec {
  if (eq.op === 'mul' && eq.blank !== 'x') {
    // Either factor may be the unknown multiplier (the commuted fact is often easier): fewest
    // extra steps wins, then adding rather than taking away, then the smaller table.
    const options = [
      [eq.x, eq.y],
      [eq.y, eq.x],
    ].flatMap(([a = 0, b = 0]) => {
      const k = anchorFor(a, b, eq.z);
      return k === undefined ? [] : [{ a, b, k, n: Math.abs(a - k), up: k < a }];
    });
    options.sort((p, q) => p.n - q.n || Number(q.up) - Number(p.up) || p.b - q.b);
    const best = options[0] ?? { a: eq.x, b: eq.y, k: 5, n: Math.abs(eq.x - 5), up: eq.x > 5 };
    const vars = { b: best.b, a: best.a, k: best.k, anchor: best.b * best.k, n: best.n };
    return { key: best.up ? 'hint4MulUp' : 'hint4MulDown', vars };
  }
  // Unknown factor: p : d = ? or ? × d = p.
  const [p, d, unknown] = eq.op === 'div' ? [eq.x, eq.y, eq.z] : [eq.z, eq.y, eq.x];
  const k = anchorFor(unknown, d, unknown) ?? 5;
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
