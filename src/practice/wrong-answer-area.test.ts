// R35 lane 2 — group 4 (area by counting cells): the numbers live only in the scene,
// so the tests build items with a cells scene; the matcher must never name a count
// that IS the step's answer.
import { describe, expect, test } from 'vitest';
import type { GeoScene, Point } from '../geometry/geo-scene-types';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { StepAnswer } from '../reasoning/reasoning-step-answers';
import type { Misconception, PromptRef, ReasoningStep } from '../reasoning/reasoning-types';
import { itemForSkill } from './item-for-skill';
import type { PracticeItem } from './practice-scene';
import { explainWrongAnswer } from './wrong-answer-explanation';
import { twa } from './wrong-answer-strings';

const cells = (n: number): Point[] =>
  Array.from({ length: n }, (_, i): Point => [i % 6, Math.floor(i / 6)]);

const cellsScene = (a: number, b?: number): GeoScene => ({
  kind: 'cells',
  groups:
    b === undefined
      ? [{ label: 'A', cells: cells(a) }]
      : [
          { label: 'A', cells: cells(a) },
          { label: 'B', cells: cells(b) },
        ],
  minUnitPx: 28,
});

const areaItem = (
  skillId: string,
  tier: SkillTier,
  story: PromptRef,
  steps: ReasoningStep[],
  a: number,
  b?: number,
  work: number[] = [],
): PracticeItem => ({ skillId, tier, story, steps, work, scene: cellsScene(a, b) });

const num = (key: string, answer: number, params?: PromptRef['params']): ReasoningStep => ({
  kind: 'number',
  prompt: params ? { key, params } : { key },
  answer,
});
const qty = (id: string, n: number, correct: boolean, misconception?: Misconception) => ({
  id,
  label: { key: 'q_cm2', params: { n } },
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

describe('explainWrongAnswer — group 4 area', () => {
  test('count tier 1: one square missed / one too many / fallback', () => {
    const it = areaItem('meas-area-count', 1, { key: 'areaCount' }, [num('askArea', 8)], 8);
    expect(explain(it, 0, 7)).toEqual({ key: 'areaMissOne' });
    expect(explain(it, 0, 9)).toEqual({ key: 'areaExtraOne' });
    expect(explain(it, 0, 5)).toEqual({ key: 'areaFallback' });
    expect(explain(it, 0, 8)).toBeNull();
  });

  test('count tier 2: wrong unit on the unit step', () => {
    const it = areaItem(
      'meas-area-count',
      2,
      { key: 'areaUnit' },
      [
        num('askCellCount', 8),
        {
          kind: 'choice',
          prompt: { key: 'pickUnit' },
          options: [
            { id: 'o0', label: { key: 'u_cm2' }, correct: true },
            { id: 'o1', label: { key: 'u_cm' }, correct: false, misconception: 'wrong-unit' },
            { id: 'o2', label: { key: 'u_mm' }, correct: false, misconception: 'wrong-unit' },
          ],
        },
      ],
      8,
    );
    expect(explain(it, 0, 7)).toEqual({ key: 'areaMissOne' });
    expect(explain(it, 1, 'o1')).toEqual({ key: 'areaWrongUnit' });
    expect(explain(it, 1, 'o2')).toEqual({ key: 'areaWrongUnit' });
    expect(explain(it, 1, 'o0')).toBeNull();
  });

  test('count tier 3: difference step — added, forgot to subtract, took B’s area', () => {
    const it = areaItem(
      'meas-area-count',
      3,
      { key: 'areaDiff' },
      [
        num('askAreaOf', 10, { l: 'A' }),
        num('askAreaOf', 6, { l: 'B' }),
        {
          kind: 'choice',
          prompt: { key: 'askAreaMore' },
          options: [
            qty('o0', 4, true),
            qty('o1', 16, false, 'wrong-step'),
            qty('o2', 10, false, 'one-step-only'),
            qty('o3', 6, false, 'near-miss'),
          ],
        },
      ],
      10,
      6,
      [10, 6, 4],
    );
    expect(explain(it, 2, 'o1')).toEqual({ key: 'areaAddInstead' });
    expect(explain(it, 2, 'o2')).toEqual({ key: 'areaForgotSub', params: { a: 10, b: 6 } });
    expect(explain(it, 2, 'o3')).toEqual({ key: 'areaDiffIsB' });
    expect(explain(it, 2, 'o0')).toBeNull();
    expect(explain(it, 0, 9)).toEqual({ key: 'areaMissOne' });
    expect(explain(it, 0, 11)).toEqual({ key: 'areaExtraOne' });
    expect(explain(it, 1, 5)).toEqual({ key: 'areaMissOne' });
    expect(explain(it, 1, 7)).toEqual({ key: 'areaExtraOne' });
    expect(explain(it, 1, 3)).toEqual({ key: 'areaFallback' });
  });

  test('equal tier 1: thought bigger when equal, thought equal / reversed when unequal', () => {
    const bigger = (correct: 'A' | 'B' | 'same'): ReasoningStep => ({
      kind: 'choice',
      prompt: { key: 'askBigger' },
      options: [
        {
          id: 'o0',
          label: { key: 'letter', params: { l: 'A' } },
          correct: correct === 'A',
          ...(correct === 'A' ? {} : { misconception: 'wrong-step' as const }),
        },
        {
          id: 'o1',
          label: { key: 'letter', params: { l: 'B' } },
          correct: correct === 'B',
          ...(correct === 'B' ? {} : { misconception: 'wrong-step' as const }),
        },
        {
          id: 'o2',
          label: { key: 'sameArea' },
          correct: correct === 'same',
          ...(correct === 'same' ? {} : { misconception: 'near-miss' as const }),
        },
      ],
    });
    const equal = areaItem('meas-area-equal', 1, { key: 'areaBigger' }, [bigger('same')], 8, 8);
    expect(explain(equal, 0, 'o0')).toEqual({ key: 'areaEqualThoughtBigger' });
    expect(explain(equal, 0, 'o1')).toEqual({ key: 'areaEqualThoughtBigger' });
    expect(explain(equal, 0, 'o2')).toBeNull();
    const unequal = areaItem('meas-area-equal', 1, { key: 'areaBigger' }, [bigger('A')], 10, 6);
    expect(explain(unequal, 0, 'o2')).toEqual({ key: 'areaEqualThoughtSame' });
    expect(explain(unequal, 0, 'o1')).toEqual({ key: 'areaEqualReversed' });
    expect(explain(unequal, 0, 'o0')).toBeNull();
  });

  test('equal tier 2: forgot to subtract, added, off by one', () => {
    const it = areaItem(
      'meas-area-equal',
      2,
      { key: 'areaBiggerDiff' },
      [num('askAreaMore', 4)],
      10,
      6,
    );
    expect(explain(it, 0, 10)).toEqual({ key: 'areaForgotSub', params: { a: 10, b: 6 } });
    expect(explain(it, 0, 16)).toEqual({ key: 'areaAddInstead' });
    expect(explain(it, 0, 3)).toEqual({ key: 'areaMissOne' });
    expect(explain(it, 0, 5)).toEqual({ key: 'areaExtraOne' });
    expect(explain(it, 0, 7)).toEqual({ key: 'areaFallback' });
    expect(explain(it, 0, 4)).toBeNull();
  });

  test('equal tier 3: verdict step, then the count', () => {
    const it = areaItem(
      'meas-area-equal',
      3,
      { key: 'areaEqual' },
      [
        {
          kind: 'choice',
          prompt: { key: 'askBigger' },
          options: [
            {
              id: 'o0',
              label: { key: 'letter', params: { l: 'A' } },
              correct: false,
              misconception: 'wrong-step',
            },
            {
              id: 'o1',
              label: { key: 'letter', params: { l: 'B' } },
              correct: false,
              misconception: 'wrong-step',
            },
            { id: 'o2', label: { key: 'sameArea' }, correct: true },
          ],
        },
        num('askArea', 8),
      ],
      8,
      8,
      [8],
    );
    expect(explain(it, 0, 'o0')).toEqual({ key: 'areaEqualThoughtBigger' });
    expect(explain(it, 1, 7)).toEqual({ key: 'areaMissOne' });
    expect(explain(it, 1, 9)).toEqual({ key: 'areaExtraOne' });
    expect(explain(it, 1, 8)).toBeNull();
  });

  test('generated items never crash the selector and every key renders', () => {
    for (const skillId of ['meas-area-count', 'meas-area-equal']) {
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
