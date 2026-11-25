// R35 lane 1 — group 3 (midpoint): the same wrong number means a different mistake
// per tier, so the matcher branches on the story key (midPart / midSum / midHalf).
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
const explain = (it: ReasoningItem, stepIndex: number, answer: StepAnswer) =>
  explainWrongAnswer({
    skillId: it.skillId,
    tier: it.tier,
    item: it,
    stepIndex,
    answer,
    missNumber: 1,
  });

describe('explainWrongAnswer — group 3 midpoint', () => {
  test('tier 1 midPart: whole, AM instead, added, halved, fallback', () => {
    const it = item(
      'geo-midpoint-length',
      1,
      { key: 'midPart', params: { len: 12, am: 4 } },
      [num('askMB', 8)],
      [8],
    );
    expect(explain(it, 0, 12)).toEqual({ key: 'mid1Whole', params: { len: 12, am: 4 } });
    expect(explain(it, 0, 4)).toEqual({ key: 'mid1AmInstead', params: { am: 4 } });
    expect(explain(it, 0, 16)).toEqual({ key: 'mid1AddInstead', params: { len: 12, am: 4 } });
    expect(explain(it, 0, 6)).toEqual({ key: 'mid1HalfInstead', params: { len: 12, am: 4 } });
    expect(explain(it, 0, 7)).toEqual({ key: 'midFallback' });
    expect(explain(it, 0, 8)).toBeNull();
  });

  test('tier 1 midPart: halving is right when am == len/2 — no blame (R38 Q3)', () => {
    const it = item(
      'geo-midpoint-length',
      1,
      { key: 'midPart', params: { len: 12, am: 6 } },
      [num('askMB', 6)],
      [6],
    );
    expect(explain(it, 0, 6)).toBeNull();
  });

  test('tier 2 midSum: one part instead of the whole, near-miss → fallback', () => {
    const it = item(
      'geo-midpoint-length',
      2,
      { key: 'midSum', params: { am: 4, mb: 8 } },
      [
        {
          kind: 'choice',
          prompt: { key: 'askAB' },
          options: [
            { id: 'o0', label: { key: 'q_cm', params: { n: 12 } }, correct: true },
            {
              id: 'o1',
              label: { key: 'q_cm', params: { n: 4 } },
              correct: false,
              misconception: 'one-step-only',
            },
            {
              id: 'o2',
              label: { key: 'q_cm', params: { n: 8 } },
              correct: false,
              misconception: 'one-step-only',
            },
            {
              id: 'o3',
              label: { key: 'q_cm', params: { n: 13 } },
              correct: false,
              misconception: 'near-miss',
            },
          ],
        },
      ],
      [12],
    );
    expect(explain(it, 0, 'o1')).toEqual({ key: 'mid2OnePart' });
    expect(explain(it, 0, 'o2')).toEqual({ key: 'mid2OnePart' });
    expect(explain(it, 0, 'o3')).toEqual({ key: 'midFallback' });
    expect(explain(it, 0, 'o0')).toBeNull();
  });

  test('tier 3 midHalf: whole and quarter, same number as tier 1 means another mistake', () => {
    const it = item(
      'geo-midpoint-length',
      3,
      { key: 'midHalf', params: { len: 12 } },
      [num('askAM', 6)],
      [6],
    );
    expect(explain(it, 0, 12)).toEqual({ key: 'mid3Whole', params: { len: 12 } });
    expect(explain(it, 0, 3)).toEqual({ key: 'mid3Quarter', params: { len: 12 } });
    expect(explain(it, 0, 5)).toEqual({ key: 'midFallback' });
  });

  test('geo-midpoint (the sibling skill) → null', () => {
    const it = item(
      'geo-midpoint',
      1,
      { key: 'midFind', params: { len: 12 } },
      [num('askAM', 6)],
      [6],
    );
    expect(explain(it, 0, 12)).toBeNull();
  });

  test('generated items never crash the selector and every key renders', () => {
    for (const tier of [1, 2, 3] as const) {
      for (let seed = 1; seed <= 10; seed++) {
        const it = itemForSkill('geo-midpoint-length', mulberry32(seed), tier);
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
  });
});
