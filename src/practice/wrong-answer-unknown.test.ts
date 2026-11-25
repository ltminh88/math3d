// R35 lane 1 — group 1 (unknowns): each trap value from the generator maps to its
// explanation; anything else falls back to the per-type sentence; right answers → null.
import { describe, expect, test } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { StepAnswer } from '../reasoning/reasoning-step-answers';
import type { PromptRef, ReasoningItem, ReasoningStep } from '../reasoning/reasoning-types';
import { itemForSkill } from './item-for-skill';
import { explainWrongAnswer } from './wrong-answer-explanation';
import { twa } from './wrong-answer-strings';

const item = (
  skillId: string,
  tier: SkillTier,
  story: PromptRef,
  steps: ReasoningStep[],
  work: number[],
): ReasoningItem => ({ skillId, tier, story, steps, work });
const num = (key: string, answer: number, params?: PromptRef['params']): ReasoningStep => ({
  kind: 'number',
  prompt: params ? { key, params } : { key },
  answer,
});
const explain = (it: ReasoningItem, stepIndex: number, answer: StepAnswer, missNumber = 1) =>
  explainWrongAnswer({
    skillId: it.skillId,
    tier: it.tier,
    item: it,
    stepIndex,
    answer,
    missNumber,
  });

describe('explainWrongAnswer — group 1 unknown', () => {
  test('add T2: wrong inverse, given total, given addend, fallback, right → null', () => {
    const it = item(
      'unknown-add-sub',
      2,
      { key: 'unknownEq', params: { text: '? + 3 = 10' } },
      [num('askUnknown', 7)],
      [7],
    );
    expect(explain(it, 0, 13)).toEqual({ key: 'unknownWrongInverseAdd', params: { s: 10, a: 3 } });
    expect(explain(it, 0, 10)).toEqual({ key: 'unknownGivenNumberAdd', params: { s: 10, a: 3 } });
    expect(explain(it, 0, 3)).toEqual({ key: 'unknownGivenAddend', params: { s: 10, a: 3 } });
    expect(explain(it, 0, 5)).toEqual({ key: 'unknown1Fallback' });
    expect(explain(it, 0, 7)).toBeNull();
  });

  test('add T1 choice: trap option, near-miss, right option, unknown id', () => {
    const it = item(
      'unknown-add-sub',
      1,
      { key: 'unknownEq', params: { text: '? + 3 = 10' } },
      [
        {
          kind: 'choice',
          prompt: { key: 'askUnknown' },
          options: [
            { id: 'o0', label: { key: 'num', params: { n: 7 } }, correct: true },
            {
              id: 'o1',
              label: { key: 'num', params: { n: 13 } },
              correct: false,
              misconception: 'wrong-inverse',
            },
            {
              id: 'o2',
              label: { key: 'num', params: { n: 8 } },
              correct: false,
              misconception: 'near-miss',
            },
          ],
        },
      ],
      [7],
    );
    expect(explain(it, 0, 'o1')).toEqual({
      key: 'unknownWrongInverseAdd',
      params: { s: 10, a: 3 },
    });
    expect(explain(it, 0, 'o2')).toEqual({ key: 'unknown1Fallback' });
    expect(explain(it, 0, 'o0')).toBeNull();
    expect(explain(it, 0, 'o9')).toBeNull();
  });

  test('subMinuend and subFirst forms', () => {
    const minuend = item(
      'unknown-add-sub',
      2,
      { key: 'unknownEq', params: { text: '12 − ? = 5' } },
      [num('askUnknown', 7)],
      [7],
    );
    expect(explain(minuend, 0, 17)).toEqual({
      key: 'unknownWrongInverseAdd',
      params: { s: 12, a: 5 },
    });
    expect(explain(minuend, 0, 12)).toEqual({
      key: 'unknownGivenMinuend',
      params: { s: 12, a: 5 },
    });
    const first = item(
      'unknown-add-sub',
      2,
      { key: 'unknownEq', params: { text: '? − 3 = 7' } },
      [num('askUnknown', 10)],
      [10],
    );
    expect(explain(first, 0, 7)).toEqual({
      key: 'unknownSubFirstRightSide',
      params: { s: 10, a: 3 },
    });
    expect(explain(first, 0, 4)).toEqual({
      key: 'unknownSubFirstDoubleSub',
      params: { s: 10, a: 3 },
    });
    expect(explain(first, 0, 3)).toEqual({ key: 'unknownSubFirstGivenA', params: { a: 3, b: 7 } });
    expect(explain(first, 0, 9)).toEqual({ key: 'unknown1Fallback' });
  });

  test('mul / divBoxes / divShare forms', () => {
    const mul = item(
      'unknown-mul-div',
      2,
      { key: 'unknownEq', params: { text: '? × 4 = 20' } },
      [num('askUnknown', 5)],
      [5],
    );
    expect(explain(mul, 0, 16)).toEqual({ key: 'unknownWrongInverseMul', params: { p: 20, n: 4 } });
    expect(explain(mul, 0, 20)).toEqual({ key: 'unknownGivenNumberMul', params: { p: 20, n: 4 } });
    expect(explain(mul, 0, 4)).toEqual({ key: 'unknownGivenFactor', params: { p: 20, n: 4 } });
    const boxes = item(
      'unknown-mul-div',
      2,
      { key: 'unknownEq', params: { text: '20 : ? = 5' } },
      [num('askUnknown', 4)],
      [4],
    );
    expect(explain(boxes, 0, 15)).toEqual({
      key: 'unknownWrongInverseDivBoxes',
      params: { p: 20, q: 5 },
    });
    expect(explain(boxes, 0, 5)).toEqual({
      key: 'unknownGivenNumberDivBoxes',
      params: { p: 20, q: 5 },
    });
    expect(explain(boxes, 0, 20)).toEqual({ key: 'unknownGivenDividend', params: { p: 20, q: 5 } });
    const share = item(
      'unknown-mul-div',
      2,
      { key: 'unknownEq', params: { text: '? : 4 = 5' } },
      [num('askUnknown', 20)],
      [20],
    );
    expect(explain(share, 0, 1)).toEqual({
      key: 'unknownWrongInverseDivShareSub',
      params: { n: 4, q: 5 },
    });
    expect(explain(share, 0, 5)).toEqual({
      key: 'unknownGivenNumberDivShare',
      params: { n: 4, q: 5 },
    });
    expect(explain(share, 0, 4)).toEqual({
      key: 'unknownGivenDivisorShare',
      params: { n: 4, q: 5 },
    });
    const shareAdd = item(
      'unknown-mul-div',
      2,
      { key: 'unknownEq', params: { text: '? : 6 = 4' } },
      [num('askUnknown', 24)],
      [24],
    );
    expect(explain(shareAdd, 0, 10)).toEqual({
      key: 'unknownWrongInverseDivShareAdd',
      params: { n: 6, q: 4 },
    });
  });

  test('tier 3 sub3: wrong operation on the right side, then forgetting the step', () => {
    const it = item(
      'unknown-add-sub',
      3,
      { key: 'unknownEq', params: { text: '? − 2 = 5 × 4' } },
      [num('askPart', 20, { text: '5 × 4' }), num('askUnknown', 22)],
      [20, 22],
    );
    expect(explain(it, 0, 9)).toEqual({ key: 'unknownPartAddInstead', params: { b: 5, c: 4 } });
    expect(explain(it, 0, 1)).toEqual({ key: 'unknownPartSubInstead', params: { b: 5, c: 4 } });
    expect(explain(it, 0, 10)).toEqual({ key: 'unknownPartUsedA', params: { a: 2, b: 5, c: 4 } });
    expect(explain(it, 1, 20)).toEqual({ key: 'unknownForgotStep', params: { b: 5, c: 4, a: 2 } });
    expect(explain(it, 1, 18)).toEqual({ key: 'unknownForgotStepSub', params: { a: 2 } });
    expect(explain(it, 1, 21)).toEqual({ key: 'unknown1Fallback' });
  });

  test('tier 3 mul3: wrong operation on the right side, then forgetting to divide', () => {
    const it = item(
      'unknown-mul-div',
      3,
      { key: 'unknownEq', params: { text: '? × 3 = 2 + 10' } },
      [num('askPart', 12, { text: '2 + 10' }), num('askUnknown', 4)],
      [12, 4],
    );
    expect(explain(it, 0, 20)).toEqual({ key: 'unknownPartMulInstead', params: { a: 2, b: 10 } });
    expect(explain(it, 0, 2)).toEqual({ key: 'unknownPartOneAddend', params: { a: 2, b: 10 } });
    expect(explain(it, 0, 10)).toEqual({ key: 'unknownPartOneAddend', params: { a: 10, b: 2 } });
    expect(explain(it, 1, 12)).toEqual({
      key: 'unknownForgotDivide',
      params: { a: 2, b: 10, n: 3, p: 12 },
    });
    expect(explain(it, 1, 9)).toEqual({ key: 'unknownWrongInverseMul', params: { p: 12, n: 3 } });
  });

  test('word-problem forms use story params, not the equation text', () => {
    const add = item(
      'unknown-add-sub-wp',
      2,
      {
        key: 'unknownWpAddFirst',
        params: { who1: 'Mai', who2: 'Nam', a: 3, s: 10, item: 'i:marble' },
      },
      [num('askUnknown', 7)],
      [7],
    );
    expect(explain(add, 0, 13)).toEqual({ key: 'unknownWrongInverseAdd', params: { s: 10, a: 3 } });
    const subFirst = item(
      'unknown-add-sub-wp',
      2,
      {
        key: 'unknownWpSubFirst',
        params: { who1: 'Mai', who2: 'Nam', a: 3, b: 7, item: 'i:marble' },
      },
      [num('askUnknown', 10)],
      [10],
    );
    expect(explain(subFirst, 0, 7)).toEqual({
      key: 'unknownSubFirstRightSide',
      params: { s: 10, a: 3 },
    });
    const mulSum = item(
      'unknown-mul-div-wp',
      3,
      {
        key: 'unknownWpMulSum',
        params: { who1: 'Mai', who2: 'Nam', a: 2, b: 10, n: 3, item: 'i:marble' },
      },
      [num('askPart', 12, { text: '2 + 10' }), num('askUnknown', 4)],
      [12, 4],
    );
    expect(explain(mulSum, 1, 12)).toEqual({
      key: 'unknownForgotDivide',
      params: { a: 2, b: 10, n: 3, p: 12 },
    });
  });

  test('second miss explains the same way (Q1 pending) and other skills → null', () => {
    const it = item(
      'unknown-add-sub',
      2,
      { key: 'unknownEq', params: { text: '? + 3 = 10' } },
      [num('askUnknown', 7)],
      [7],
    );
    expect(explain(it, 0, 13, 2)).toEqual({
      key: 'unknownWrongInverseAdd',
      params: { s: 10, a: 3 },
    });
    const other = item(
      'pattern-add',
      1,
      { key: 'patternNext', params: { terms: '1, 2, 3, 4, ?' } },
      [num('askTerm', 5, { pos: 5 })],
      [1, 2, 3, 4, 5],
    );
    expect(explain(other, 0, 6)).toBeNull();
  });

  test('generated items never crash the selector and every key renders', () => {
    for (const id of [
      'unknown-add-sub',
      'unknown-mul-div',
      'unknown-add-sub-wp',
      'unknown-mul-div-wp',
    ]) {
      for (const tier of [1, 2, 3] as const) {
        for (let seed = 1; seed <= 10; seed++) {
          const it = itemForSkill(id, mulberry32(seed), tier);
          it.steps.forEach((step, s) => {
            const wrong: StepAnswer =
              step.kind === 'number'
                ? step.answer + 1
                : step.kind === 'choice'
                  ? (step.options.find((o) => !o.correct)?.id ?? 'o0')
                  : step.kind === 'verdict'
                    ? !step.answer
                    : [];
            const result = explain(it, s, wrong);
            if (result) expect(twa(result.key, result.params)).not.toContain('wrongAnswer.');
          });
        }
      }
    }
  });
});
