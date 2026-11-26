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
});
