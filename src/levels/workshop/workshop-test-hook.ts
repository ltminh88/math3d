// Test builds only (`vite build --mode test`): `window.__workshop` lets e2e specs read the running
// order (station, skill, the answers its remaining steps expect, hint rung, board progress) and
// the plan of the run. Installed from the scene behind `import.meta.env.MODE === 'test'`, removed
// when the level exits.
import { renderMeasurementPrompt } from '../../measurement/measurement-strings';
import { playableSteps } from '../../reasoning/reasoning-step-answers';
import type { WorkshopRoundController } from './workshop-round-controller';
import { rectOf } from './workshop-round-plan';

/** What a step expects; choices by their index in the card (keys 1-4) and label. */
export type WorkshopPlannedStep =
  | { kind: 'number'; answer: number }
  | { kind: 'choice'; index: number; label: string; wrongIndex: number }
  | { kind: 'multi'; indexes: number[] }
  | { kind: 'verdict'; answer: boolean };

export interface WorkshopTestHook {
  state(): {
    round: number;
    total: number;
    done: boolean;
    roundComplete: boolean;
    station: string | null;
    skillId: string | null;
    tier: number | null;
    tiling: boolean;
    stepIndex: number;
    steps: WorkshopPlannedStep[];
    hintRung: number;
    tilesPlaced: number;
    sidesWalked: number[];
  };
  plan(): { skillId: string; station: string; tier: number; rect: [number, number] | null }[];
}

declare global {
  interface Window {
    __workshop?: WorkshopTestHook;
  }
}

export function installWorkshopTestHook(c: WorkshopRoundController): () => void {
  const flow = c.flow;
  window.__workshop = {
    state: () => {
      const round = flow.round;
      const steps = round ? playableSteps(round.item) : [];
      return {
        round: flow.index,
        total: flow.rounds.length,
        done: flow.done,
        roundComplete: flow.roundComplete,
        station: round?.station ?? null,
        skillId: round?.skillId ?? null,
        tier: round?.tier ?? null,
        tiling: round?.tiling ?? false,
        stepIndex: flow.stepIndex,
        steps: steps.map((step): WorkshopPlannedStep => {
          if (step.kind === 'number') return { kind: 'number', answer: step.answer };
          if (step.kind === 'verdict') return { kind: 'verdict', answer: step.answer };
          const right = step.options.flatMap((o, i) => (o.correct ? [i] : []));
          if (step.kind === 'multi') return { kind: 'multi', indexes: right };
          const index = right[0] ?? 0;
          const option = step.options[index];
          return {
            kind: 'choice',
            index,
            label: option ? renderMeasurementPrompt(option.label) : '',
            wrongIndex: step.options.findIndex((o) => !o.correct),
          };
        }),
        hintRung: flow.hintRung,
        tilesPlaced: c.board?.tiles?.placed() ?? 0,
        sidesWalked: [...(c.board?.fence?.walk.walked ?? [])],
      };
    },
    plan: () =>
      flow.rounds.map((r) => ({
        skillId: r.skillId,
        station: r.station,
        tier: r.tier,
        rect: rectOf(r.item),
      })),
  };
  return () => {
    delete window.__workshop;
  };
}
