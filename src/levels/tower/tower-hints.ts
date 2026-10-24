// Tower hint rungs: 1 encourage, 2 the related fact (division for a product, multiplication for
// a division), 3 split strategy for big products or skip counting, 4 the next step revealed.
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
  | 'hint4';

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

export function hintSpec(rung: HintRung, step: TowerStep): HintSpec {
  const eq = trueEquation(step);
  if (rung <= 1) return { key: 'hint1', vars: {} };
  if (rung >= 4) return { key: 'hint4', vars: { x: eq.x, op: eq.op, y: eq.y, z: eq.z } };
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

/** Renders `rung` for `step` into the hint area and returns the text (for the announcement). */
export function renderHint(
  area: HTMLElement,
  ts: TowerStrings,
  rung: HintRung,
  step: TowerStep,
): string {
  const spec = hintSpec(rung, step);
  const text =
    spec.key === 'hint4'
      ? ts('hint4', { equation: equationText(ts, trueEquation(step)) })
      : ts(spec.key, spec.vars);
  const p = document.createElement('p');
  p.textContent = text;
  area.replaceChildren(p);
  area.hidden = false;
  area.dataset.rung = String(rung);
  return text;
}
