// Test builds only (`vite build --mode test`): `window.__market` lets e2e specs read the running
// round (skill, what the current step expects) and the hint rung. Installed from the scene
// behind `import.meta.env.MODE === 'test'`, removed when the level exits.
import { playableSteps } from '../../reasoning/reasoning-step-answers';
import type { ReasoningStep } from '../../reasoning/reasoning-types';
import type { MarketRoundController } from './market-round-controller';

/** What the current step expects, in the terms a spec taps: a number, a button index, ids. */
export type MarketExpected =
  | { kind: 'number'; answer: number }
  | { kind: 'choice'; index: number }
  | { kind: 'multi'; ids: string[]; all: string[] }
  | { kind: 'verdict'; answer: boolean }
  | { kind: 'set-clock'; h: number; m: number };

export interface MarketTestHook {
  state(): {
    round: number;
    total: number;
    done: boolean;
    skillId: string | null;
    stepIndex: number;
    expected: MarketExpected | null;
    hintRung: number;
  };
  skills(): string[];
}

declare global {
  interface Window {
    __market?: MarketTestHook;
  }
}

function expectedOf(step: ReasoningStep | undefined): MarketExpected | null {
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

export function installMarketTestHook(controller: MarketRoundController): () => void {
  window.__market = {
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
    delete window.__market;
  };
}
