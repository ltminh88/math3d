// Length bug explainers (boost, Phase 1B): the registry routes a wrong pick's
// bug to its ladder-picture explanation; a bug with no explainer falls back
// to today's per-skill routing (null for measurement skills).
import { describe, expect, it } from 'vitest';
import type { StepAnswer } from '../reasoning/reasoning-step-answers';
import type { Misconception, ReasoningStep } from '../reasoning/reasoning-types';
import type { PracticeItem } from './practice-scene';
import { explainWrongAnswer } from './wrong-answer-explanation';

const choice = (misconception: Misconception): ReasoningStep => ({
  kind: 'choice',
  prompt: { key: 'askNumber' },
  options: [
    {
      id: 'w',
      label: { key: 'lenQty', params: { n: 15, unit: 'cm' } },
      correct: false,
      misconception,
    },
    { id: 'r', label: { key: 'lenQty', params: { n: 105, unit: 'cm' } }, correct: true },
  ],
});

const explain = (skillId: string, bug: Misconception) =>
  explainWrongAnswer({
    skillId,
    tier: 2,
    item: {
      skillId,
      tier: 2,
      story: { key: 'lenMixedToSingle', params: { a: 1, ua: 'm', b: 5, ub: 'cm', to: 'cm' } },
      steps: [choice(bug)],
      work: [],
    } as PracticeItem,
    stepIndex: 0,
    answer: 'w' as StepAnswer,
    missNumber: 1,
  });

describe('wrong-answer-length', () => {
  it.each([
    ['unit-direction', 'lenDirection'],
    ['unit-factor', 'lenFactor'],
    ['dm-skipped', 'lenDmSkipped'],
    ['mixed-concat', 'lenMixedConcat'],
    ['mixed-drop-big', 'lenMixedDropBig'],
    ['ignore-unit', 'lenIgnoreUnit'],
  ] as const)('bug %s explains as %s', (bug, key) => {
    expect(explain('meas-len-mixed', bug)).toEqual({ key });
  });

  it('the legacy meas-mm-convert ignore-unit pick is explained the same way', () => {
    expect(explain('meas-mm-convert', 'ignore-unit')).toEqual({ key: 'lenIgnoreUnit' });
  });

  it('a bug with no explainer falls back (null for measurement skills)', () => {
    expect(explain('meas-ruler-read', 'read-end-not-length')).toBeNull();
  });

  it('a match step whose wrong pair is tagged explains through the registry', () => {
    const match: ReasoningStep = {
      kind: 'match',
      prompt: { key: 'lenMixedToSingle', params: { a: 1, ua: 'm', b: 5, ub: 'cm', to: 'cm' } },
      left: [{ key: 'lenQty', params: { n: 1, unit: 'm' } }],
      right: [
        { label: { key: 'lenQty', params: { n: 105, unit: 'cm' } } },
        { label: { key: 'lenQty', params: { n: 15, unit: 'cm' } }, misconception: 'mixed-concat' },
      ],
      pairs: [0],
    };
    const item = {
      skillId: 'meas-len-mixed',
      tier: 2,
      story: { key: 'lenMixedToSingle', params: { a: 1, ua: 'm', b: 5, ub: 'cm', to: 'cm' } },
      steps: [match],
      work: [],
    } as PracticeItem;
    // The child paired the left with the tagged (wrong) right option.
    expect(
      explainWrongAnswer({
        skillId: 'meas-len-mixed',
        tier: 2,
        item,
        stepIndex: 0,
        answer: [1],
        missNumber: 1,
      }),
    ).toEqual({ key: 'lenMixedConcat' });
    // The right pairing is never "explained".
    expect(
      explainWrongAnswer({
        skillId: 'meas-len-mixed',
        tier: 2,
        item,
        stepIndex: 0,
        answer: [0],
        missNumber: 1,
      }),
    ).toBeNull();
  });

  it('an order step never crashes the selector (no tile carries a bug)', () => {
    const order: ReasoningStep = {
      kind: 'order',
      prompt: { key: 'lenOrder' },
      tiles: [
        { key: 'lenQty', params: { n: 3, unit: 'cm' } },
        { key: 'lenQty', params: { n: 1, unit: 'm' } },
        { key: 'lenQty', params: { n: 5, unit: 'mm' } },
      ],
      answer: [2, 0, 1],
    };
    const item = {
      skillId: 'meas-len-order',
      tier: 1,
      story: { key: 'lenOrder' },
      steps: [order],
      work: [],
    } as PracticeItem;
    expect(
      explainWrongAnswer({
        skillId: 'meas-len-order',
        tier: 1,
        item,
        stepIndex: 0,
        answer: [0, 2, 1],
        missNumber: 1,
      }),
    ).toBeNull();
  });
});
