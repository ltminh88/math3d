// Add/sub bug explainers (boost, Phase 1A): the registry routes a wrong pick's
// bug to its one-sentence explanation; a bug with no explainer falls back to
// today's per-skill routing. No explainer ever states the answer (the hint
// ladder may lead to it from rung 2, the explanation itself never does).
import { describe, expect, it } from 'vitest';
import { type AddSubBug, type AddSubOp, bugValue } from '../arithmetic/add-sub-bug-catalogue';
import type { StepAnswer } from '../reasoning/reasoning-step-answers';
import type { Misconception, ReasoningStep } from '../reasoning/reasoning-types';
import type { PracticeItem } from './practice-scene';
import { explainWrongAnswer } from './wrong-answer-explanation';
import { twa } from './wrong-answer-strings';

const choice = (misconception: Misconception, wrong: number, right: number): ReasoningStep => ({
  kind: 'choice',
  prompt: { key: 'askChooseResult' },
  options: [
    { id: 'w', label: { key: 'num', params: { n: wrong } }, correct: false, misconception },
    { id: 'r', label: { key: 'num', params: { n: right } }, correct: true },
  ],
});

const explain = (skillId: string, bug: Misconception, wrong: number, right: number) =>
  explainWrongAnswer({
    skillId,
    tier: 2,
    item: {
      skillId,
      tier: 2,
      story: { key: 'addCalc', params: { a: 385, b: 247 } },
      steps: [choice(bug, wrong, right)],
      work: [],
    } as PracticeItem,
    stepIndex: 0,
    answer: 'w' as StepAnswer,
    missNumber: 1,
  });

describe('wrong-answer-add-sub-bug', () => {
  it.each([
    ['forgot-carry', 'bugForgotCarry'],
    ['carry-not-added', 'bugCarryNotAdded'],
    ['smaller-from-larger', 'bugSmallerFromLarger'],
    ['borrow-no-decrement', 'bugBorrowNoDecrement'],
    ['zero-borrow-skip', 'bugZeroBorrowSkip'],
    ['zero-minus-n-zero', 'bugZeroMinusNZero'],
    ['misaligned-columns', 'bugMisalignedColumns'],
    ['second-regroup-dropped', 'bugSecondRegroupDropped'],
  ] as const)('bug %s explains as %s', (bug, key) => {
    expect(explain('add-sub-bug-choice', bug, 522, 632)).toEqual({ key });
  });

  it('a bug with no explainer falls back (null for an unknown skill)', () => {
    expect(explain('add-sub-bug-choice', 'wrong-sign', 100, 200)).toBeNull();
  });

  it('every explainer key renders (no missing-key fallback)', () => {
    for (const bug of [
      'forgot-carry',
      'carry-not-added',
      'smaller-from-larger',
      'borrow-no-decrement',
      'zero-borrow-skip',
      'zero-minus-n-zero',
      'misaligned-columns',
      'second-regroup-dropped',
    ] as const) {
      const out = explain('add-sub-bug-choice', bug, 522, 632);
      expect(out).not.toBeNull();
      if (out) expect(twa(out.key, out.params)).not.toContain('wrongAnswer.');
    }
  });

  it('no explainer states the answer, for any bug', () => {
    const cases: readonly [AddSubBug, number, number, AddSubOp][] = [
      ['forgot-carry', 256, 178, '+'],
      ['carry-not-added', 385, 247, '+'],
      ['smaller-from-larger', 52, 27, '−'],
      ['borrow-no-decrement', 63, 28, '−'],
      ['zero-borrow-skip', 403, 158, '−'],
      ['zero-minus-n-zero', 305, 127, '−'],
      ['misaligned-columns', 146, 29, '+'],
      ['second-regroup-dropped', 385, 247, '+'],
    ];
    for (const [bug, a, b, op] of cases) {
      const correct = op === '+' ? a + b : a - b;
      const wrong = bugValue(bug, a, b, op);
      expect(wrong).not.toBe(correct);
      const out = explain('add-sub-bug-choice', bug, wrong, correct);
      expect(out).not.toBeNull();
      if (!out) continue;
      const text = twa(out.key, out.params);
      expect(text).not.toContain(String(correct));
    }
  });
});
