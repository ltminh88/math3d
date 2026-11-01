// Test builds only (`vite build --mode test`): `window.__garden` lets e2e specs read the running
// round (kind, skill, tier, what the current step expects) and the 3D replies. Installed from the
// scene behind `import.meta.env.MODE === 'test'`, removed when the level exits.
import type { PromptRenderer } from './garden-prompt-render';
import type { GardenViews } from './garden-round-controller';
import type { GardenRoundFlow } from './garden-round-flow';
import type { GardenKind } from './garden-round-plan';

export interface GardenTestState {
  round: number;
  total: number;
  done: boolean;
  kind: GardenKind | null;
  skillId: string | null;
  tier: number | null;
  stepIndex: number;
  steps: number;
  /** null once the round is answered. */
  step: 'number' | 'choice' | 'multi' | 'verdict' | null;
  /** Number steps: the number; choice steps: the rendered label of the right card. */
  expected: number | string | null;
  choices: string[];
  hintRung: number;
  bloomed: number;
  sprouted: number;
  balanceLevel: boolean;
}

export interface GardenTestHook {
  state(): GardenTestState;
  kinds(): string[];
  factKeys(): string[];
}

declare global {
  interface Window {
    __garden?: GardenTestHook;
  }
}

export function installGardenTestHook(
  flow: GardenRoundFlow,
  views: GardenViews,
  render: PromptRenderer,
): () => void {
  window.__garden = {
    state: () => {
      const round = flow.round;
      const step = flow.step;
      let expected: number | string | null = null;
      let choices: string[] = [];
      if (step?.kind === 'number') expected = step.answer;
      if (step?.kind === 'choice') {
        choices = step.options.map((o) => render(o.label));
        const right = step.options.find((o) => o.correct);
        expected = right ? render(right.label) : null;
      }
      return {
        round: flow.index,
        total: flow.rounds.length,
        done: flow.done,
        kind: round?.kind ?? null,
        skillId: round?.skillId ?? null,
        tier: round?.item.tier ?? null,
        stepIndex: flow.stepIndex,
        steps: flow.steps.length,
        step: step?.kind ?? null,
        expected,
        choices,
        hintRung: flow.hint.rung,
        bloomed: views.row.bloomed,
        sprouted: views.bags.sprouted,
        balanceLevel: views.balance.isLevel,
      };
    },
    kinds: () => flow.rounds.map((r) => r.kind),
    factKeys: () => flow.rounds.map((r) => r.factKey),
  };
  return () => {
    delete window.__garden;
  };
}
