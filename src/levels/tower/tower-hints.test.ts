import { describe, expect, it } from 'vitest';
import { defineStrings } from '../../i18n/i18n';
import { mulberry32 } from '../../learning/seeded-rng';
import { hintSpec, spokenEquation } from './tower-hints';
import { buildQuestion, type TowerFormat, type TowerStep } from './tower-question-formats';
import { towerFactPool } from './tower-round-flow';
import { towerStrings } from './tower-strings';

const product = (x: number, y: number): TowerStep => ({
  kind: 'number',
  eq: { x, op: 'mul', y, z: x * y, blank: 'z' },
  answer: x * y,
});
const quotient: TowerStep = {
  kind: 'number',
  eq: { x: 56, op: 'div', y: 7, z: 8, blank: 'z' },
  answer: 8,
};
const missing: TowerStep = {
  kind: 'number',
  eq: { x: 8, op: 'mul', y: 7, z: 56, blank: 'x' },
  answer: 8,
};

describe('tower hint ladder', () => {
  it('rung 1 encourages', () => {
    expect(hintSpec(1, product(7, 8)).key).toBe('hint1');
  });

  it('rung 2 gives the related fact: division for a product, multiplication for a division', () => {
    expect(hintSpec(2, product(7, 8))).toEqual({ key: 'hint2Div', vars: { x: 7, y: 8 } });
    expect(hintSpec(2, quotient)).toEqual({ key: 'hint2Mul', vars: { d: 7, p: 56 } });
    expect(hintSpec(2, missing)).toEqual({ key: 'hint2DivOf', vars: { d: 7, p: 56 } });
  });

  it('rung 3 splits a big product and skip counts small ones without the answer', () => {
    expect(hintSpec(3, product(7, 8))).toEqual({
      key: 'hint3Split',
      vars: { a: 7, b: 8, rest: 3, five: 35, more: 21 },
    });
    expect(hintSpec(3, product(3, 4))).toEqual({
      key: 'hint3Count',
      vars: { step: 4, sequence: '4, 8, ?' },
    });
    expect(hintSpec(3, quotient)).toEqual({
      key: 'hint3CountTo',
      vars: { step: 7, p: 56, sequence: '7, 14, 21, 28, 35, 42, 49, 56' },
    });
  });

  it('rung 4 is a strategy from a known fact, never the result', () => {
    // 7 × 8 = ?: from 8 × 5 = 40, two more 8s.
    expect(hintSpec(4, product(7, 8))).toEqual({
      key: 'hint4MulUp',
      vars: { b: 8, a: 7, k: 5, anchor: 40, n: 2 },
    });
    // 56 : 7 = ?: from 7 × 10 = 70, count back by 7 to 56.
    expect(hintSpec(4, quotient)).toEqual({
      key: 'hint4DivDown',
      vars: { d: 7, k: 10, anchor: 70, p: 56 },
    });
    expect(hintSpec(4, missing).key).toBe('hint4DivDown');
  });

  it('rung 4 anchors on ×2 or ×5, ×10 only for an 8 or 9, ×1 only for a 2 (QA m-5)', () => {
    expect(hintSpec(4, product(6, 6))).toEqual({
      key: 'hint4MulUp',
      vars: { b: 6, a: 6, k: 5, anchor: 30, n: 1 },
    });
    // 3 × 6 = ?: from 3 × 5 = 15, one more 3 (the smaller table to add on).
    expect(hintSpec(4, product(3, 6))).toEqual({
      key: 'hint4MulUp',
      vars: { b: 3, a: 6, k: 5, anchor: 15, n: 1 },
    });
    // 9 × 7 = ?: 7 × 10 = 70, take one 7 away.
    expect(hintSpec(4, product(9, 7))).toEqual({
      key: 'hint4MulDown',
      vars: { b: 7, a: 9, k: 10, anchor: 70, n: 1 },
    });
    const formats: TowerFormat[] = ['choice', 'pad', 'missing', 'family', 'truefalse'];
    for (const key of towerFactPool()) {
      for (const format of formats) {
        const q = buildQuestion(key, format, mulberry32(4), []);
        for (const step of q.steps) {
          const { vars } = hintSpec(4, step);
          const unknown = 'a' in vars ? vars.a : Number(vars.p) / Number(vars.d);
          if (vars.k === 10) expect(unknown).toBeGreaterThanOrEqual(8);
          if (vars.k === 1) expect(unknown).toBe(2);
        }
      }
    }
  });

  it('rung 4 never shows the answer, on any step of any floor', () => {
    const formats: TowerFormat[] = ['choice', 'pad', 'missing', 'family', 'truefalse'];
    for (const key of towerFactPool()) {
      for (const format of formats) {
        for (const seed of [1, 2, 3]) {
          const q = buildQuestion(key, format, mulberry32(seed), []);
          for (const step of q.steps) {
            const spec = hintSpec(4, step);
            expect(spec.key).toMatch(/^hint4(Mul|Div)(Up|Down)$/);
            const { x, op, y, z, blank } = step.eq;
            const answer = blank === 'x' ? x : op === 'mul' ? x * y : x / y;
            // Numbers the question already shows (a square's divisor is its quotient too).
            const shown = blank === 'x' ? [y, z] : [x, y];
            const extra = Object.values(spec.vars).filter((v) => !shown.includes(v as number));
            expect(extra).not.toContain(answer);
          }
        }
      }
    }
  });
});

describe('tower spoken equation (screen readers)', () => {
  const ts = towerStrings(defineStrings);
  it('reads the floor equation with words, the blank as "mấy"', () => {
    expect(spokenEquation(ts, missing.eq)).toBe('mấy nhân 7 bằng 56');
    expect(spokenEquation(ts, quotient.eq)).toBe('56 chia 7 bằng mấy');
    expect(spokenEquation(ts, { x: 6, op: 'mul', y: 7, z: 48, blank: null })).toBe(
      '6 nhân 7 bằng 48',
    );
  });
});
