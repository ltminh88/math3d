// Column-calc generator (boost, Phase 2A): the child fills the result
// right→left one digit at a time, with a "Có nhớ 1 không?" / "Có phải vay 1
// không?" choice after every column but the last. RED-first: the generator
// does not exist yet.
import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { PracticeItem } from '../practice/practice-scene';
import type { ReasoningStep } from '../reasoning/reasoning-types';
import { ADD_SUB_COLUMN_GENERATORS, buildColumnSteps, columnsOf } from './add-sub-column-generator';
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

const choiceStep = (step: ReasoningStep | undefined) => {
  expect(step?.kind).toBe('choice');
  return step as ReasoningStep & { kind: 'choice' };
};

/** Evaluates a digit prompt's expression ("5 + 7", "13 − 1 − 8") left to right. */
const evalPromptText = (text: string): number => {
  const tokens = text.split(' ');
  let value = Number(tokens[0]);
  for (let i = 1; i + 1 < tokens.length; i += 2) {
    const rhs = Number(tokens[i + 1]);
    value = tokens[i] === '+' ? value + rhs : value - rhs;
  }
  return value;
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
    // R121: the digit prompt shows the calculation as the child performs it
    // AFTER the borrow is decided — the borrowed top ("13 − 8"), never the
    // raw column ("3 − 8" would ask for 5, a wrong calculation on screen).
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
  it('385 + 247 plays digit, carry choice, digit, carry choice, digit', () => {
    const steps = buildColumnSteps(385, 247, '+');
    expect(steps).toHaveLength(5);
    expect(numStep(steps[0]).answer).toBe(2);
    expect(numStep(steps[0]).prompt.key).toBe('columnDigitOnes');
    const c0 = choiceStep(steps[1]);
    expect(c0.prompt.key).toBe('askCarry');
    expect(c0.options.map((o) => o.label.key)).toEqual(['carryYes', 'carryNo']);
    expect(c0.options.map((o) => o.correct)).toEqual([true, false]);
    expect(numStep(steps[2]).answer).toBe(3);
    expect(numStep(steps[2]).prompt.key).toBe('columnDigitTens');
    const c1 = choiceStep(steps[3]);
    expect(c1.prompt.key).toBe('askCarry');
    expect(c1.options.map((o) => o.label.key)).toEqual(['carryYes', 'carryNo']);
    expect(c1.options.map((o) => o.correct)).toEqual([true, false]);
    expect(numStep(steps[4]).answer).toBe(6);
    expect(numStep(steps[4]).prompt.key).toBe('columnDigitHundreds');
  });

  it('403 − 158 plays borrow choice, digit, borrow choice, digit, digit (R121)', () => {
    // Subtraction asks the borrow BEFORE the digit: the child must decide
    // the borrow first ("3 không trừ được 8, vay 1 → 13 − 8 = 5"). The
    // borrow question names its column and shows the raw column.
    const steps = buildColumnSteps(403, 158, '−');
    expect(steps).toHaveLength(5);
    const c0 = choiceStep(steps[0]);
    expect(c0.prompt.key).toBe('askBorrowOnes');
    expect(c0.prompt.params).toEqual({ text: '3 − 8' });
    expect(c0.options.map((o) => o.label.key)).toEqual(['borrowYes', 'borrowNo']);
    expect(c0.options.map((o) => o.correct)).toEqual([true, false]);
    expect(numStep(steps[1]).answer).toBe(5);
    expect(numStep(steps[1]).prompt.key).toBe('columnDigitOnes');
    const c1 = choiceStep(steps[2]);
    expect(c1.prompt.key).toBe('askBorrowTens');
    expect(c1.prompt.params).toEqual({ text: '0 − 1 − 5' });
    expect(c1.options.map((o) => o.label.key)).toEqual(['borrowYes', 'borrowNo']);
    expect(c1.options.map((o) => o.correct)).toEqual([true, false]);
    expect(numStep(steps[3]).answer).toBe(4);
    expect(numStep(steps[4]).answer).toBe(2);
  });

  it('123 + 234: no-carry columns offer "Không nhớ" as the correct choice', () => {
    const steps = buildColumnSteps(123, 234, '+');
    expect(steps).toHaveLength(5);
    const c0 = choiceStep(steps[1]);
    expect(c0.options.map((o) => o.label.key)).toEqual(['carryYes', 'carryNo']);
    expect(c0.options.map((o) => o.correct)).toEqual([false, true]);
    const c1 = choiceStep(steps[3]);
    expect(c1.options.map((o) => o.correct)).toEqual([false, true]);
  });

  it('digit prompts show the column computation after the regroup is decided', () => {
    // 403 − 158: the borrow was asked first, so the units digit prompt shows
    // the borrowed calculation "13 − 8" (never the raw "3 − 8" — that asks
    // for 5, a wrong calculation); the tens prompt carries the borrow
    // ("10 − 1 − 5"). The borrow QUESTION shows the raw column instead.
    const sub = buildColumnSteps(403, 158, '−');
    expect(numStep(sub[1]).prompt.params).toEqual({ text: '13 − 8' });
    expect(numStep(sub[3]).prompt.params).toEqual({ text: '10 − 1 − 5' });
    expect(numStep(sub[4]).prompt.params).toEqual({ text: '4 − 1 − 1' });
    // 385 + 247: the tens prompt adds the carry ("8 + 4 + 1").
    const add = buildColumnSteps(385, 247, '+');
    expect(numStep(add[0]).prompt.params).toEqual({ text: '5 + 7' });
    expect(numStep(add[2]).prompt.params).toEqual({ text: '8 + 4 + 1' });
    expect(numStep(add[4]).prompt.params).toEqual({ text: '3 + 2 + 1' });
  });

  it('every digit prompt is a correct calculation whose units digit is the answer (R121)', () => {
    // Regression guard for the R121 bug: the R119.2 prompt "3 − 8" asked
    // for 5, but 3 − 8 = −5 — a wrong calculation on screen. The sweep
    // evaluates each digit prompt's expression (original digits plus
    // carry-in, borrowed top for subtraction) and requires a non-negative
    // value whose units digit is the step's answer. For subtraction the
    // value is the digit itself; for addition it is the column sum
    // ("9 + 1" asks for 0, the units digit of 10).
    for (const tier of [1, 2, 3] as const) {
      for (let seed = 0; seed < 40; seed++) {
        const item = generate(tier, seed);
        for (const step of item.steps) {
          if (step.kind !== 'number') continue;
          const text = step.prompt.params?.text;
          expect(typeof text, `t${tier} #${seed} digit prompt has text`).toBe('string');
          const value = evalPromptText(text as string);
          expect(
            value,
            `t${tier} #${seed} "${text}" is a correct calculation`,
          ).toBeGreaterThanOrEqual(0);
          expect(value % 10, `t${tier} #${seed} "${text}"`).toBe(step.answer);
        }
      }
    }
  });

  it('carry questions are choices, never verdicts, with the yes-option first', () => {
    for (const tier of [1, 2, 3] as const) {
      for (let seed = 0; seed < 40; seed++) {
        const item = generate(tier, seed);
        expect(item.steps.some((s) => s.kind === 'verdict')).toBe(false);
        for (const step of item.steps) {
          if (step.kind !== 'choice') continue;
          const c = choiceStep(step);
          expect(c.options).toHaveLength(2);
          expect(c.options.filter((o) => o.correct)).toHaveLength(1);
          expect(c.options[0]?.label.key).toMatch(/Yes$/);
        }
      }
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
