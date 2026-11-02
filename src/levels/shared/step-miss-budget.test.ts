import { describe, expect, it } from 'vitest';
import { StepMissBudget } from './step-miss-budget';

describe('StepMissBudget', () => {
  it('gives every step three tries; a clean round is correct, first try, no hint', () => {
    const budget = new StepMissBudget();
    expect([budget.miss(), budget.miss()]).toEqual([false, false]);
    budget.nextStep();
    expect(budget.hint.wrongAttempts).toBe(0);
    expect([budget.miss(), budget.miss(), budget.miss()]).toEqual([false, false, true]);
    expect(budget.result()).toEqual({ correct: false, firstTry: false, usedHint: true });
    budget.reset();
    expect(budget.result()).toEqual({ correct: true, firstTry: true, usedHint: false });
  });

  it('remembers misses and hints of earlier steps for the round', () => {
    const budget = new StepMissBudget();
    budget.takeHint(3);
    budget.miss();
    budget.nextStep();
    expect(budget.hint.rung).toBe(0);
    expect(budget.result()).toEqual({ correct: true, firstTry: false, usedHint: true });
  });

  it('keeps the taught rung across steps when asked (also after a shown step), capped', () => {
    const budget = new StepMissBudget(true);
    expect([budget.takeHint(3), budget.takeHint(3)]).toEqual([1, 2]);
    budget.miss();
    budget.miss();
    budget.miss();
    expect(budget.hint.rung).toBe(5);
    budget.nextStep();
    expect(budget.hint.rung).toBe(2);
    expect([budget.takeHint(3), budget.takeHint(3)]).toEqual([3, 3]);
  });
});
