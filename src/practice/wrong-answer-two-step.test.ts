// R35 lane 1 — group 2 (two-step word problems): the step is told by its prompt key,
// the first-step result lives in work[0], and the tier-3 expression choice is told by
// its text (two wrong options share the tag 'wrong-step').
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
const exprChoice = (correct: string, wrong: readonly string[]): ReasoningStep => ({
  kind: 'choice',
  prompt: { key: 'pickExpr' },
  options: [
    { id: 'o0', label: { key: 'expr', params: { text: correct } }, correct: true },
    ...wrong.map((text, i) => ({
      id: `o${i + 1}`,
      label: { key: 'expr', params: { text } },
      correct: false as const,
      misconception: 'wrong-step' as const,
    })),
  ],
});
const explain = (it: ReasoningItem, stepIndex: number, answer: StepAnswer) =>
  explainWrongAnswer({
    skillId: it.skillId,
    tier: it.tier,
    item: it,
    stepIndex,
    answer,
    missNumber: 1,
  });
const story = (a: number, n: number): PromptRef => ({
  key: 'wp',
  params: { who1: 'Mai', who2: 'Nam', a, n, item: 'i:marble' },
});

describe('explainWrongAnswer — group 2 two-step', () => {
  test('times tier 1: first step, then the final step', () => {
    const it = item(
      'wp-times-then-sub',
      1,
      story(6, 4),
      [
        num('askOther', 24, { who: 'Nam', item: 'i:marble' }),
        num('askLeftOver', 18, { item: 'i:marble' }),
      ],
      [24, 18],
    );
    expect(explain(it, 0, 10)).toEqual({ key: 'wp2Step0AddInstead', params: { a: 6, n: 4 } });
    expect(explain(it, 0, 6)).toEqual({ key: 'wp2Step0ForgotTimes', params: { a: 6, n: 4 } });
    expect(explain(it, 0, 20)).toEqual({ key: 'wp2Step0GenericTimes', params: { a: 6, n: 4 } });
    expect(explain(it, 1, 24)).toEqual({ key: 'wp2ForgotStep2', params: { a: 6, n: 4 } });
    expect(explain(it, 1, 30)).toEqual({ key: 'wp2AddInsteadSub', params: { a: 6 } });
    expect(explain(it, 1, 0)).toEqual({ key: 'wp2SubFirst', params: { a: 6, n: 4 } });
    expect(explain(it, 1, 20)).toEqual({ key: 'wp2SubNInsteadA', params: { a: 6, n: 4 } });
    expect(explain(it, 1, 5)).toEqual({ key: 'wp2Fallback' });
  });

  test('times tier 2: the only step is the final one', () => {
    const it = item(
      'wp-times-then-sub',
      2,
      story(6, 4),
      [num('askLeftOver', 18, { item: 'i:marble' })],
      [24, 18],
    );
    expect(explain(it, 0, 24)).toEqual({ key: 'wp2ForgotStep2', params: { a: 6, n: 4 } });
    expect(explain(it, 0, 18)).toBeNull();
  });

  test('times tier 3: the expression choice is told by its text', () => {
    const it = item(
      'wp-times-then-sub',
      3,
      story(6, 4),
      [
        exprChoice('6 × 4 − 6', ['6 × 4', '6 × 4 + 6', '6 − 4']),
        num('askLeftOver', 18, { item: 'i:marble' }),
      ],
      [24, 18],
    );
    expect(explain(it, 0, 'o1')).toEqual({ key: 'wp2PickOneStep' });
    expect(explain(it, 0, 'o2')).toEqual({ key: 'wp2PickAddInstead', params: { a: 6 } });
    expect(explain(it, 0, 'o3')).toEqual({ key: 'wp2PickSubN', params: { a: 6, n: 4 } });
    expect(explain(it, 0, 'o0')).toBeNull();
  });

  test('divide tier 1: first step, then the final step', () => {
    const it = item(
      'wp-divide-then-sub',
      1,
      story(20, 4),
      [
        num('askOther', 5, { who: 'Nam', item: 'i:marble' }),
        num('askLeftOver', 15, { item: 'i:marble' }),
      ],
      [5, 15],
    );
    expect(explain(it, 0, 16)).toEqual({ key: 'wp2Step0SubInstead', params: { a: 20, n: 4 } });
    expect(explain(it, 0, 80)).toEqual({ key: 'wp2Step0MulInstead', params: { a: 20, n: 4 } });
    expect(explain(it, 0, 20)).toEqual({ key: 'wp2Step0ForgotDivide', params: { a: 20, n: 4 } });
    expect(explain(it, 0, 3)).toEqual({ key: 'wp2Step0GenericDivide', params: { a: 20, n: 4 } });
    expect(explain(it, 1, 5)).toEqual({ key: 'wp2ForgotStep2Divide', params: { a: 20 } });
    expect(explain(it, 1, 25)).toEqual({ key: 'wp2AddInsteadSubDivide', params: { a: 20 } });
    expect(explain(it, 1, 60)).toEqual({ key: 'wp2MulInsteadDivide', params: { a: 20, n: 4 } });
    expect(explain(it, 1, 7)).toEqual({ key: 'wp2Fallback' });
  });

  test('divide tier 3: the expression choice', () => {
    const it = item(
      'wp-divide-then-sub',
      3,
      story(20, 4),
      [
        exprChoice('20 − 20 : 4', ['20 : 4', '20 + 20 : 4', '20 × 4 − 20']),
        num('askLeftOver', 15, { item: 'i:marble' }),
      ],
      [5, 15],
    );
    expect(explain(it, 0, 'o1')).toEqual({ key: 'wp2PickOneStep' });
    expect(explain(it, 0, 'o2')).toEqual({ key: 'wp2PickAddInsteadDivide' });
    expect(explain(it, 0, 'o3')).toEqual({
      key: 'wp2PickMulInsteadDivide',
      params: { a: 20, n: 4 },
    });
  });

  test('other two-step skills → null', () => {
    const it = item(
      'wp-times-then-add',
      1,
      story(6, 4),
      [
        num('askOther', 24, { who: 'Nam', item: 'i:marble' }),
        num('askBoth', 30, { item: 'i:marble' }),
      ],
      [24, 30],
    );
    expect(explain(it, 1, 24)).toBeNull();
  });

  test('generated items never crash the selector and every key renders', () => {
    for (const id of ['wp-times-then-sub', 'wp-divide-then-sub']) {
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
