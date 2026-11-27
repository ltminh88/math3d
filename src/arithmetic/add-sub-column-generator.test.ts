// Column-calc generator (boost, Phase 2A): the child fills the result
// right→left one digit at a time, with a "Có nhớ 1 không?" / "Có phải vay 1
// không?" verdict after every column but the last. RED-first: the generator
// does not exist yet.
import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { PracticeItem } from '../practice/practice-scene';
import type { ReasoningStep } from '../reasoning/reasoning-types';
import { bugsFor } from './add-sub-bug-catalogue';
import {
  ADD_SUB_COLUMN_GENERATORS,
  bugForDigit,
  buildColumnSteps,
  columnsOf,
} from './add-sub-column-generator';
import { findError } from './add-sub-error-generators';
import {
  oracleAddCarries,
  oracleBorrowAcrossZero,
  oracleSubBorrows,
} from './arithmetic-test-oracles';
import { sweepArithmeticItem } from './arithmetic-test-sweep';

const generate = (tier: SkillTier, seed: number): PracticeItem => {
  const gen = ADD_SUB_COLUMN_GENERATORS['add-sub-column'];
  if (!gen) throw new Error('no generator for add-sub-column');
  return gen(mulberry32(seed), tier) as PracticeItem;
};

const params = (item: PracticeItem) => item.story.params as Record<string, number | string>;

const numStep = (step: ReasoningStep | undefined) => {
  expect(step?.kind).toBe('number');
  return step as ReasoningStep & { kind: 'number' };
};

const verdictStep = (step: ReasoningStep | undefined) => {
  expect(step?.kind).toBe('verdict');
  return step as ReasoningStep & { kind: 'verdict' };
};

/** The tier's ladder rule, re-derived from the operands (oracle-local). */
const ladderMatchesTier = (a: number, b: number, op: '+' | '−', tier: SkillTier): boolean => {
  if (op === '+') {
    const c = oracleAddCarries(a, b);
    return tier === 1 ? c === 0 : tier === 2 ? c === 1 : c >= 2;
  }
  const borrows = oracleSubBorrows(a, b);
  if (tier === 1) return borrows === 0;
  if (tier === 2) return borrows === 1;
  return borrows >= 2 || oracleBorrowAcrossZero(a, b);
};

describe('column-calc sweep', () => {
  it('sweeps clean at every tier', () => {
    for (const tier of [1, 2, 3] as const) {
      for (let seed = 0; seed < 40; seed++) {
        sweepArithmeticItem(generate(tier, seed), 'add-sub-column', tier, seed);
      }
    }
  });

  it('is deterministic for a seed, and stays within three columns', () => {
    for (let seed = 0; seed < 40; seed++) {
      const a = generate(3, seed);
      const b = generate(3, seed);
      expect(a).toEqual(b);
      const p = params(a);
      const top = p.a as number;
      const bottom = p.b as number;
      expect(top).toBeLessThanOrEqual(999);
      expect(bottom).toBeLessThanOrEqual(999);
      expect(a.steps.length).toBeLessThanOrEqual(5);
      expect(a.scene?.kind).toBe('column-calc');
    }
  });

  it('follows the tier ladder (T0–T4 regroup pattern)', () => {
    for (const tier of [1, 2, 3] as const) {
      for (let seed = 0; seed < 40; seed++) {
        const item = generate(tier, seed);
        const p = params(item);
        expect(ladderMatchesTier(p.a as number, p.b as number, p.op as '+' | '−', tier)).toBe(true);
      }
    }
  });
});

describe('columnsOf fixtures', () => {
  it('385 + 247: digits 2, 3, 6 with two carries', () => {
    const cols = columnsOf(385, 247, '+');
    expect(cols.map((c) => c.digit)).toEqual([2, 3, 6]);
    expect(cols.map((c) => c.carryOut)).toEqual([true, true, false]);
    expect(cols[0]?.sumText).toBe('5 + 7');
    expect(cols[0]?.sumValue).toBe(12);
    expect(cols[1]?.sumText).toBe('8 + 4 + 1');
    expect(cols[1]?.sumValue).toBe(13);
  });

  it('403 − 158: digits 5, 4, 2 with two borrows', () => {
    const cols = columnsOf(403, 158, '−');
    expect(cols.map((c) => c.digit)).toEqual([5, 4, 2]);
    expect(cols.map((c) => c.carryOut)).toEqual([true, true, false]);
    expect(cols[0]?.sumText).toBe('13 − 8');
    expect(cols[0]?.sumValue).toBe(5);
    expect(cols[1]?.sumText).toBe('10 − 1 − 5');
    expect(cols[1]?.sumValue).toBe(4);
    expect(cols[2]?.sumText).toBe('4 − 1 − 1');
    expect(cols[2]?.sumValue).toBe(2);
  });

  it('123 + 234: no regroup, digits 7, 5, 3', () => {
    const cols = columnsOf(123, 234, '+');
    expect(cols.map((c) => c.digit)).toEqual([7, 5, 3]);
    expect(cols.map((c) => c.carryOut)).toEqual([false, false, false]);
  });
});

describe('column item steps', () => {
  it('385 + 247 plays digit, verdict, digit, verdict, digit', () => {
    const steps = buildColumnSteps(385, 247, '+');
    expect(steps).toHaveLength(5);
    expect(numStep(steps[0]).answer).toBe(2);
    expect(numStep(steps[0]).prompt.key).toBe('columnDigitOnes');
    const v0 = verdictStep(steps[1]);
    expect(v0.answer).toBe(true);
    expect(v0.prompt.key).toBe('askCarry');
    expect(v0.statement.params).toEqual({ text: '5 + 7', value: 12 });
    expect(numStep(steps[2]).answer).toBe(3);
    expect(numStep(steps[2]).prompt.key).toBe('columnDigitTens');
    const v1 = verdictStep(steps[3]);
    expect(v1.answer).toBe(true);
    expect(v1.statement.params).toEqual({ text: '8 + 4 + 1', value: 13 });
    expect(numStep(steps[4]).answer).toBe(6);
    expect(numStep(steps[4]).prompt.key).toBe('columnDigitHundreds');
  });

  it('403 − 158 plays digit, borrow verdict, digit, borrow verdict, digit', () => {
    const steps = buildColumnSteps(403, 158, '−');
    expect(steps).toHaveLength(5);
    expect(numStep(steps[0]).answer).toBe(5);
    const v0 = verdictStep(steps[1]);
    expect(v0.answer).toBe(true);
    expect(v0.prompt.key).toBe('askBorrow');
    expect(v0.statement.params).toEqual({ text: '13 − 8', value: 5 });
    expect(numStep(steps[2]).answer).toBe(4);
    const v1 = verdictStep(steps[3]);
    expect(v1.answer).toBe(true);
    expect(v1.statement.params).toEqual({ text: '10 − 1 − 5', value: 4 });
    expect(numStep(steps[4]).answer).toBe(2);
  });

  it('123 + 234: false verdicts carry a fix asking the column sum', () => {
    const steps = buildColumnSteps(123, 234, '+');
    expect(steps).toHaveLength(5);
    const v0 = verdictStep(steps[1]);
    expect(v0.answer).toBe(false);
    expect(v0.fix).toEqual({ prompt: { key: 'askCorrect' }, answer: 7 });
    const v1 = verdictStep(steps[3]);
    expect(v1.answer).toBe(false);
    expect(v1.fix).toEqual({ prompt: { key: 'askCorrect' }, answer: 5 });
  });

  it('verdict steps carry the column equation and a fix when false', () => {
    const item = generate(1, 0);
    const verdicts = item.steps.filter((s) => s.kind === 'verdict');
    for (const step of verdicts) {
      const v = verdictStep(step);
      expect(v.statement.key).toBe('stmtEq');
      if (!v.answer) expect(v.fix).toBeDefined();
    }
  });

  it('digit steps ask one column each, units first', () => {
    const item = generate(2, 1);
    const digits = item.steps.filter((s) => s.kind === 'number');
    expect(digits.length).toBeGreaterThanOrEqual(2);
    expect(digits.length).toBeLessThanOrEqual(3);
    const first = numStep(digits[0]);
    expect(first.prompt.key).toBe('columnDigitOnes');
  });

  it('scene starts empty, focused on the units column', () => {
    const item = generate(2, 1);
    const scene = item.scene as unknown as Record<string, unknown>;
    expect(scene.kind).toBe('column-calc');
    expect(scene.filled).toEqual([]);
    expect(scene.carries).toEqual([]);
    expect(scene.focusCol).toBe(0);
    expect(scene.top).toBe(params(item).a);
    expect(scene.bottom).toBe(params(item).b);
  });
});

describe('bugForDigit', () => {
  it('tags the tens digit of the forgot-carry value 522 for 385 + 247', () => {
    expect(bugForDigit(385, 247, '+', 1, 2)).toBe('forgot-carry');
    // The units digit 2 is the correct digit: no bug owns it.
    expect(bugForDigit(385, 247, '+', 0, 2)).toBeUndefined();
    // No bug produces a 9 in any column of 385 + 247.
    expect(bugForDigit(385, 247, '+', 0, 9)).toBeUndefined();
  });

  it('tags 403 − 158 with the first bug whose digit matches (catalogue order)', () => {
    // 355 comes from smaller-from-larger, borrow-no-decrement and
    // zero-borrow-skip; the first in catalogue order wins, as in bugsFor.
    expect(bugForDigit(403, 158, '−', 1, 5)).toBe('smaller-from-larger');
    expect(bugForDigit(403, 158, '−', 2, 3)).toBe('smaller-from-larger');
    expect(bugForDigit(403, 158, '−', 0, 5)).toBeUndefined();
  });

  it('agrees with bugsFor on every bug value digit', () => {
    for (const [a, b, op] of [
      [385, 247, '+'],
      [403, 158, '−'],
      [500, 236, '−'],
      [186, 172, '+'],
    ] as const) {
      for (const hit of bugsFor(a, b, op)) {
        const correct = op === '+' ? a + b : a - b;
        const digits = String(hit.value).split('').map(Number).reverse();
        for (let col = 0; col < digits.length; col++) {
          // A bug value's digit can coincide with the correct digit in a
          // column the bug does not touch — only differing digits tag a bug.
          const correctDigit = Math.floor(correct / 10 ** col) % 10;
          if (digits[col] === correctDigit) continue;
          const tagged = bugForDigit(a, b, op, col, digits[col] as number);
          expect(tagged).toBeDefined();
        }
      }
    }
  });
});

describe('find-error shows the buggy row in the column scene from T2', () => {
  it('T1 stays scene-free', () => {
    for (let seed = 0; seed < 20; seed++) {
      expect((findError(mulberry32(seed), 1) as PracticeItem).scene).toBeUndefined();
    }
  });

  it('T2/T3 carry a column-calc scene with the shown row', () => {
    for (const tier of [2, 3] as const) {
      for (let seed = 0; seed < 20; seed++) {
        const item = findError(mulberry32(seed), tier) as PracticeItem;
        const scene = item.scene as unknown as Record<string, unknown> | undefined;
        expect(scene?.kind).toBe('column-calc');
        expect(scene?.focusCol).toBe(0);
        expect(scene?.filled).toEqual([]);
        const p = item.story.params as Record<string, number | string>;
        expect(scene?.top).toBe(p.a);
        expect(scene?.bottom).toBe(p.b);
        // The buggy row is the shown value, least-significant-first.
        const buggy = scene?.buggy as readonly number[] | undefined;
        expect(buggy).toBeDefined();
        const shown = p.shown as number;
        const digits = String(shown).split('').map(Number).reverse();
        expect(buggy).toEqual(digits);
      }
    }
  });
});
