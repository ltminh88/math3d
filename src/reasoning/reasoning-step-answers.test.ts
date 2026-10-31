import { describe, expect, it } from 'vitest';
import { isStepAnswerCorrect, playableSteps, toggleSelection } from './reasoning-step-answers';
import type { ReasoningItem, ReasoningStep } from './reasoning-types';

const opt = (id: string, correct: boolean) => ({
  id,
  label: { key: 'num', params: { n: id.length } },
  correct,
  ...(correct ? {} : { misconception: 'near-miss' as const }),
});
const p = { key: 'askValue' };

describe('reasoning step answers', () => {
  it('checks number, choice, multi and verdict answers', () => {
    const num: ReasoningStep = { kind: 'number', prompt: p, answer: 12 };
    expect(isStepAnswerCorrect(num, 12)).toBe(true);
    expect(isStepAnswerCorrect(num, 21)).toBe(false);
    expect(isStepAnswerCorrect(num, '12')).toBe(false);

    const choice: ReasoningStep = {
      kind: 'choice',
      prompt: p,
      options: [opt('a', true), opt('b', false)],
    };
    expect(isStepAnswerCorrect(choice, 'a')).toBe(true);
    expect(isStepAnswerCorrect(choice, 'b')).toBe(false);

    const multi: ReasoningStep = {
      kind: 'multi',
      prompt: p,
      options: [opt('a', true), opt('b', false), opt('c', true)],
    };
    expect(isStepAnswerCorrect(multi, ['c', 'a'])).toBe(true);
    expect(isStepAnswerCorrect(multi, ['a'])).toBe(false);
    expect(isStepAnswerCorrect(multi, ['a', 'b', 'c'])).toBe(false);

    const verdict: ReasoningStep = { kind: 'verdict', prompt: p, statement: p, answer: false };
    expect(isStepAnswerCorrect(verdict, false)).toBe(true);
    expect(isStepAnswerCorrect(verdict, true)).toBe(false);
  });

  it('plays a false verdict with a fix as verdict, then a number step', () => {
    const fix = { prompt: { key: 'fixRem' }, answer: 1 };
    const item: ReasoningItem = {
      skillId: 'tf-explain',
      tier: 1,
      story: p,
      steps: [{ kind: 'verdict', prompt: p, statement: p, answer: false, fix }],
      work: [],
    };
    const steps = playableSteps(item);
    expect(steps.map((s) => s.kind)).toEqual(['verdict', 'number']);
    expect(steps[1]).toEqual({ kind: 'number', prompt: fix.prompt, answer: 1 });
  });

  it('toggles a multi selection', () => {
    expect(toggleSelection([], 'a')).toEqual(['a']);
    expect(toggleSelection(['a', 'b'], 'a')).toEqual(['b']);
  });
});
