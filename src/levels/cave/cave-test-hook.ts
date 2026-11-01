// Test builds only (`vite build --mode test`): `window.__cave` lets e2e specs read the running
// chamber (format, skill, what the current step expects) and the crystals/camera. Installed from
// the scene behind `import.meta.env.MODE === 'test'`, removed when the level exits.
import type { CaveChamberCamera } from './cave-chamber-camera';
import type { CaveFormat } from './cave-chamber-formats';
import type { CaveCrystalView } from './cave-crystal-view';
import type { CaveRoundFlow } from './cave-round-flow';

/** What the current step expects, in the terms a spec taps: a number, a button index, ids. */
export type CaveExpected =
  | { kind: 'number'; answer: number }
  | { kind: 'choice'; index: number }
  | { kind: 'multi'; ids: string[]; all: string[] }
  | { kind: 'verdict'; answer: boolean };

export interface CaveTestHook {
  state(): {
    chamber: number;
    total: number;
    done: boolean;
    format: CaveFormat | null;
    skillId: string | null;
    stepIndex: number;
    expected: CaveExpected | null;
    hintRung: number;
    litCrystals: number;
    cameraChamber: number;
  };
  formats(): CaveFormat[];
  skills(): string[];
}

declare global {
  interface Window {
    __cave?: CaveTestHook;
  }
}

function expectedOf(flow: CaveRoundFlow): CaveExpected | null {
  const step = flow.step;
  if (!step || flow.roundComplete) return null;
  if (step.kind === 'number') return { kind: 'number', answer: step.answer };
  if (step.kind === 'verdict') return { kind: 'verdict', answer: step.answer };
  if (step.kind === 'choice')
    return { kind: 'choice', index: step.options.findIndex((o) => o.correct) };
  return {
    kind: 'multi',
    ids: step.options.filter((o) => o.correct).map((o) => o.id),
    all: step.options.map((o) => o.id),
  };
}

export function installCaveTestHook(
  flow: CaveRoundFlow,
  crystals: CaveCrystalView,
  walk: CaveChamberCamera,
): () => void {
  window.__cave = {
    state: () => ({
      chamber: flow.index,
      total: flow.chambers.length,
      done: flow.done,
      format: flow.chamber?.format ?? null,
      skillId: flow.chamber?.skillId ?? null,
      stepIndex: flow.stepIndex,
      expected: expectedOf(flow),
      hintRung: flow.hint.rung,
      litCrystals: crystals.litCrystals,
      cameraChamber: walk.chamber,
    }),
    formats: () => flow.chambers.map((c) => c.format),
    skills: () => flow.chambers.map((c) => c.skillId),
  };
  return () => {
    delete window.__cave;
  };
}
