import { describe, expect, it } from 'vitest';
import { hintSpec } from './tower-hints';
import type { TowerStep } from './tower-question-formats';

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

  it('rung 4 reveals the next step; a claim is checked against the true product', () => {
    expect(hintSpec(4, missing)).toEqual({
      key: 'hint4',
      vars: { x: 8, op: 'mul', y: 7, z: 56 },
    });
    const claim: TowerStep = {
      kind: 'verdict',
      eq: { x: 6, op: 'mul', y: 7, z: 48, blank: null },
      answer: false,
    };
    expect(hintSpec(4, claim).vars).toEqual({ x: 6, op: 'mul', y: 7, z: 42 });
  });
});
