// Test builds only: `window.__reasoningRound` tells e2e specs which reasoning round is on screen
// and what each playable step expects, so a spec can solve it by taps or keys. Installed by the
// panel behind `import.meta.env.MODE === 'test'`, removed with it.
import { playableSteps } from '../../reasoning/reasoning-step-answers';
import { renderPrompt } from '../../reasoning/reasoning-strings';
import type { ReasoningRoundFlow } from './reasoning-round-flow';
import type { ReasoningRoundPlan } from './reasoning-round-slot';

export type ReasoningPlannedStep =
  | { kind: 'number'; answer: number }
  | { kind: 'choice'; label: string }
  | { kind: 'multi'; ids: string[] }
  | { kind: 'verdict'; answer: boolean };

export interface ReasoningRoundTestHook {
  skillId: string;
  tier: number;
  factKey: string;
  steps: ReasoningPlannedStep[];
  done(): boolean;
  hintRung(): number;
}

declare global {
  interface Window {
    __reasoningRound?: ReasoningRoundTestHook;
  }
}

export function installReasoningTestHook(
  plan: ReasoningRoundPlan,
  flow: ReasoningRoundFlow,
): () => void {
  const steps = playableSteps(plan.item).map((step): ReasoningPlannedStep => {
    if (step.kind === 'number') return { kind: 'number', answer: step.answer };
    if (step.kind === 'verdict') return { kind: 'verdict', answer: step.answer };
    const right = step.options.filter((o) => o.correct);
    if (step.kind === 'multi') return { kind: 'multi', ids: right.map((o) => o.id) };
    return { kind: 'choice', label: right.map((o) => renderPrompt(o.label)).join(', ') };
  });
  window.__reasoningRound = {
    skillId: plan.skillId,
    tier: plan.tier,
    factKey: plan.factKey,
    steps,
    done: () => flow.done,
    hintRung: () => flow.hint.rung,
  };
  return () => {
    delete window.__reasoningRound;
  };
}
