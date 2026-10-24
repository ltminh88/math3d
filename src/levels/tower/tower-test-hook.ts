// Test builds only (`vite build --mode test`): `window.__tower` lets e2e specs read the running
// floor (format, what the step expects, choices) and the climb. Installed from the scene behind
// `import.meta.env.MODE === 'test'`, removed when the level exits.
import type { TowerClimbCamera } from './tower-climb-camera';
import type { TowerFloorView } from './tower-floor-view';
import type { TowerFormat } from './tower-question-formats';
import type { TowerRoundFlow } from './tower-round-flow';

export interface TowerTestHook {
  state(): {
    floor: number;
    total: number;
    done: boolean;
    format: TowerFormat | null;
    factKey: string | null;
    step: 'number' | 'choice' | 'verdict' | null;
    expected: number | boolean | null;
    choices: number[];
    hintRung: number;
    litFloors: number;
    cameraFloor: number;
  };
  formats(): TowerFormat[];
  factKeys(): string[];
}

declare global {
  interface Window {
    __tower?: TowerTestHook;
  }
}

export function installTowerTestHook(
  flow: TowerRoundFlow,
  floors: TowerFloorView,
  climb: TowerClimbCamera,
): () => void {
  window.__tower = {
    state: () => {
      const step = flow.step;
      return {
        floor: flow.index,
        total: flow.questions.length,
        done: flow.done,
        format: flow.question?.format ?? null,
        factKey: flow.question?.factKey ?? null,
        step: flow.roundComplete ? null : (step?.kind ?? null),
        expected: flow.roundComplete ? null : (step?.answer ?? null),
        choices: step?.kind === 'choice' ? [...step.choices] : [],
        hintRung: flow.hint.rung,
        litFloors: floors.litFloors,
        cameraFloor: climb.floor,
      };
    },
    formats: () => flow.questions.map((q) => q.format),
    factKeys: () => flow.questions.map((q) => q.factKey),
  };
  return () => {
    delete window.__tower;
  };
}
