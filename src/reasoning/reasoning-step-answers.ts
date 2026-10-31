// Answer checking for reasoning steps, shared by the step kit and level code (pure).
import type { ReasoningItem, ReasoningStep } from './reasoning-types';

/** number step: a number; choice: an option id; multi: the chosen option ids; verdict: true/false. */
export type StepAnswer = number | string | readonly string[] | boolean;

/** The steps as played: a false verdict that carries a fix is followed by a number step for it. */
export function playableSteps(item: ReasoningItem): ReasoningStep[] {
  return item.steps.flatMap((step): ReasoningStep[] =>
    step.kind === 'verdict' && step.fix
      ? [step, { kind: 'number', prompt: step.fix.prompt, answer: step.fix.answer }]
      : [step],
  );
}

export function isStepAnswerCorrect(step: ReasoningStep, answer: StepAnswer): boolean {
  switch (step.kind) {
    case 'number':
      return answer === step.answer;
    case 'choice':
      return step.options.some((o) => o.correct && o.id === answer);
    case 'multi': {
      if (!Array.isArray(answer)) return false;
      const chosen = new Set(answer as readonly string[]);
      return step.options.every((o) => o.correct === chosen.has(o.id));
    }
    case 'verdict':
      return answer === step.answer;
  }
}

/** Multi-select toggle: adds the id, or removes it when already chosen. */
export function toggleSelection(selected: readonly string[], id: string): string[] {
  return selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
}
