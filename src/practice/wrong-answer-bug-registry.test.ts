// Bug explainer registry (boost, Phase 0): the router checks the chosen option's
// bug first, then falls back to today's per-skill routing. With no bug (or no
// explainer registered for it) the output is byte-equal to before.
import { describe, expect, it } from 'vitest';
import type { StepAnswer } from '../reasoning/reasoning-step-answers';
import type { ReasoningStep } from '../reasoning/reasoning-types';
import type { PracticeItem } from './practice-scene';
import { explainWrongAnswer, registerBugExplainer } from './wrong-answer-explanation';

const choice = (
  misconception: 'carry-not-added' | 'unit-direction' | 'wrong-sign',
): ReasoningStep => ({
  kind: 'choice',
  prompt: { key: 'addPick' },
  options: [
    { id: 'w', label: { key: 'n', params: { n: 65 } }, correct: false, misconception },
    { id: 'r', label: { key: 'n', params: { n: 75 } }, correct: true },
  ],
});

const explain = (it: PracticeItem, answer: StepAnswer) =>
  explainWrongAnswer({
    skillId: it.skillId,
    tier: it.tier,
    item: it,
    stepIndex: 0,
    answer,
    missNumber: 1,
  });

describe('bug explainer registry', () => {
  it('falls back to today’s routing when no explainer is registered for the bug', () => {
    const it: PracticeItem = {
      skillId: 'add-sub-1000',
      tier: 2,
      story: { key: 'addCalc', params: { a: 47, b: 28 } },
      // 'wrong-sign' has no explainer (Phase 1A registered the add/sub bugs,
      // so 'carry-not-added' no longer works as the unregistered example).
      steps: [choice('wrong-sign')],
      work: [],
    };
    // A choice step on add-sub-1000 has no number diagnosis: carry's fallback.
    expect(explain(it, 'w')).toEqual({ key: 'carryFallbackPlain' });
  });

  it('a registered explainer wins over the per-skill routing', () => {
    registerBugExplainer('unit-direction', () => ({ key: 'carryFallbackPlain' }));
    const it: PracticeItem = {
      skillId: 'mul-2x3',
      tier: 1,
      story: { key: 'mulCalc', params: { a: 2, b: 3 } },
      steps: [choice('unit-direction')],
      work: [],
    };
    // No per-skill matcher covers mul-2x3, so without the registry this is null.
    expect(explain(it, 'w')).toEqual({ key: 'carryFallbackPlain' });
  });
});
