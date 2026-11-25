// R35 lane 2 — group 5 (fraction of a set): one part is count / n; the traps are
// answering the whole set or the number of parts. The sibling skills
// fraction-of-set-number / fraction-of-set-circle share the matcher (Q5 pending).
import { describe, expect, test } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { StepAnswer } from '../reasoning/reasoning-step-answers';
import type { Misconception, PromptRef, ReasoningStep } from '../reasoning/reasoning-types';
import { itemForSkill } from './item-for-skill';
import type { PracticeItem } from './practice-scene';
import { explainWrongAnswer } from './wrong-answer-explanation';
import { twa } from './wrong-answer-strings';

const fracItem = (
  skillId: string,
  tier: SkillTier,
  story: PromptRef,
  steps: ReasoningStep[],
  work: number[] = [],
): PracticeItem => ({ skillId, tier, story, steps, work });

const num = (key: string, answer: number, params?: PromptRef['params']): ReasoningStep => ({
  kind: 'number',
  prompt: params ? { key, params } : { key },
  answer,
});
const numOpt = (id: string, n: number, correct: boolean, misconception?: Misconception) => ({
  id,
  label: { key: 'num', params: { n } },
  correct,
  ...(misconception ? { misconception } : {}),
});
const explain = (it: PracticeItem, stepIndex: number, answer: StepAnswer) =>
  explainWrongAnswer({
    skillId: it.skillId,
    tier: it.tier,
    item: it,
    stepIndex,
    answer,
    missNumber: 1,
  });

describe('explainWrongAnswer — group 5 fraction of a set', () => {
  test('fraction-wp tier 1: whole set / number of parts / fallback', () => {
    const it = fracItem(
      'fraction-wp',
      1,
      { key: 'wpShare', params: { item: 'i:marble', count: 12, n: 3 } },
      [num('askWpGive', 4)],
    );
    expect(explain(it, 0, 12)).toEqual({ key: 'fracForgetDivide', params: { count: 12, n: 3 } });
    expect(explain(it, 0, 3)).toEqual({ key: 'fracWrongDenominator', params: { count: 12, n: 3 } });
    expect(explain(it, 0, 5)).toEqual({ key: 'fracFallback' });
    expect(explain(it, 0, 4)).toBeNull();
  });

  test('fraction-wp tier 2: the choice traps carry their tags', () => {
    const it = fracItem(
      'fraction-wp',
      2,
      { key: 'wpShare', params: { item: 'i:marble', count: 12, n: 3 } },
      [
        {
          kind: 'choice',
          prompt: { key: 'askWpGive' },
          options: [
            numOpt('o0', 4, true),
            numOpt('o1', 12, false, 'forget-divide'),
            numOpt('o2', 3, false, 'wrong-denominator'),
            numOpt('o3', 5, false, 'near-miss'),
          ],
        },
      ],
    );
    expect(explain(it, 0, 'o1')).toEqual({ key: 'fracForgetDivide', params: { count: 12, n: 3 } });
    expect(explain(it, 0, 'o2')).toEqual({
      key: 'fracWrongDenominator',
      params: { count: 12, n: 3 },
    });
    expect(explain(it, 0, 'o3')).toEqual({ key: 'fracFallback' });
    expect(explain(it, 0, 'o0')).toBeNull();
  });

  test('fraction-wp tier 3: second step — answered one part again / took the whole set', () => {
    const it = fracItem(
      'fraction-wp',
      3,
      { key: 'wpShare', params: { item: 'i:marble', count: 12, n: 3 } },
      [num('askWpGive', 4), num('askWpLeft', 8)],
      [4, 8],
    );
    expect(explain(it, 1, 4)).toEqual({ key: 'fracLeftOnePart', params: { count: 12 } });
    expect(explain(it, 1, 12)).toEqual({ key: 'fracLeftOnePart', params: { count: 12 } });
    expect(explain(it, 1, 7)).toEqual({ key: 'fracFallback' });
    expect(explain(it, 1, 8)).toBeNull();
  });

  test('fraction-of-set-number tier 3: second step asks for k parts', () => {
    const it = fracItem(
      'fraction-of-set-number',
      3,
      { key: 'setNumberStory', params: { item: 'i:apple', count: 12, n: 3 } },
      [num('askOnePart', 4), num('askKParts', 8, { k: 2, item: 'i:apple' })],
      [4, 8],
    );
    expect(explain(it, 1, 4)).toEqual({ key: 'fracKPartsOnePart', params: { k: 2 } });
    expect(explain(it, 1, 12)).toEqual({ key: 'fracKPartsWhole', params: { count: 12, k: 2 } });
    expect(explain(it, 1, 2)).toEqual({ key: 'fracKPartsK', params: { k: 2 } });
    expect(explain(it, 1, 7)).toEqual({ key: 'fracFallback' });
    expect(explain(it, 1, 8)).toBeNull();
  });

  test('sibling skills dispatch to the same matcher; other fraction skills → null', () => {
    const number = fracItem(
      'fraction-of-set-number',
      1,
      { key: 'setNumberStory', params: { item: 'i:apple', count: 12, n: 3 } },
      [num('askOnePart', 4)],
    );
    expect(explain(number, 0, 12)).toEqual({
      key: 'fracForgetDivide',
      params: { count: 12, n: 3 },
    });
    const circle = fracItem(
      'fraction-of-set-circle',
      2,
      { key: 'setCircleStory', params: { item: 'i:marble', count: 12, n: 3 } },
      [
        {
          kind: 'choice',
          prompt: { key: 'askMarked' },
          options: [numOpt('o0', 4, true), numOpt('o1', 3, false, 'wrong-denominator')],
        },
      ],
    );
    expect(explain(circle, 0, 'o1')).toEqual({
      key: 'fracWrongDenominator',
      params: { count: 12, n: 3 },
    });
    const read = fracItem('fraction-read', 1, { key: 'readWordStory' }, [num('askShaded', 3)]);
    expect(explain(read, 0, 4)).toBeNull();
  });

  test('generated items never crash the selector and every key renders', () => {
    for (const skillId of ['fraction-wp', 'fraction-of-set-number', 'fraction-of-set-circle']) {
      for (const tier of [1, 2, 3] as const) {
        for (let seed = 1; seed <= 10; seed++) {
          const it = itemForSkill(skillId, mulberry32(seed), tier);
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
