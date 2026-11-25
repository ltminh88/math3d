// Test builds only (`vite build --mode test`): `window.__numberfort` lets e2e specs read the
// running round (skill, what the current step expects) and the hint rung. Installed from the
// scene behind `import.meta.env.MODE === 'test'`, removed when the level exits.
import { playableSteps } from '../../reasoning/reasoning-step-answers';
import type { ReasoningStep } from '../../reasoning/reasoning-types';
import type { NumberfortRoundController } from './numberfort-round-controller';

/** What the current step expects, in the terms a spec taps: a number, a button index, ids. */
export type NumberfortExpected =
  | { kind: 'number'; answer: number }
  | { kind: 'choice'; index: number }
  | { kind: 'multi'; ids: string[]; all: string[] }
  | { kind: 'verdict'; answer: boolean }
  | { kind: 'set-clock'; h: number; m: number };

export interface NumberfortTestHook {
  state(): {
    round: number;
    total: number;
    done: boolean;
    skillId: string | null;
    stepIndex: number;
    expected: NumberfortExpected | null;
    hintRung: number;
  };
  skills(): string[];
}

declare global {
  interface Window {
    __numberfort?: NumberfortTestHook;
  }
}

function expectedOf(step: ReasoningStep | undefined): NumberfortExpected | null {
  if (!step) return null;
  if (step.kind === 'number') return { kind: 'number', answer: step.answer };
  if (step.kind === 'verdict') return { kind: 'verdict', answer: step.answer };
  if (step.kind === 'choice')
    return { kind: 'choice', index: step.options.findIndex((o) => o.correct) };
  if (step.kind === 'set-clock') return { kind: 'set-clock', h: step.h, m: step.m };
  return {
    kind: 'multi',
    ids: step.options.filter((o) => o.correct).map((o) => o.id),
    all: step.options.map((o) => o.id),
  };
}

export function installNumberfortTestHook(controller: NumberfortRoundController): () => void {
  window.__numberfort = {
    state: () => {
      const plan = controller.plan;
      const flow = controller.roundFlow;
      const step = plan ? playableSteps(plan.item)[controller.currentStep()] : undefined;
      return {
        round: controller.round,
        total: controller.total,
        done: controller.done,
        skillId: plan?.skillId ?? null,
        stepIndex: controller.currentStep(),
        expected: flow?.done ? null : expectedOf(step),
        hintRung: flow?.hint.rung ?? 0,
      };
    },
    skills: () => controller.plans.map((r) => r.skillId),
  };
  return () => {
    delete window.__numberfort;
  };
}
