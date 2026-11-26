// Test builds only (`vite build --mode test`): `window.__island` lets e2e specs read the
// running run (stage, whether the run resolved and what it returned). Installed from the
// scene behind `import.meta.env.MODE === 'test'`, removed when the level exits.
import type { EnglishRunResult } from '../../ui/english/english-run';

export interface IslandTestHook {
  state(): {
    stage: number;
    total: number;
    done: boolean;
    roundsPlayed: number;
    correctCount: number;
    stars: number;
  };
}

declare global {
  interface Window {
    __island?: IslandTestHook;
  }
}

export function installIslandTestHook(
  read: () => {
    stage: number;
    total: number;
    done: boolean;
    result: EnglishRunResult | null;
    stars: number;
  },
): () => void {
  window.__island = {
    state: () => {
      const s = read();
      return {
        stage: s.stage,
        total: s.total,
        done: s.done,
        roundsPlayed: s.result?.roundsPlayed ?? 0,
        correctCount: s.result?.correctCount ?? 0,
        stars: s.stars,
      };
    },
  };
  return () => {
    delete window.__island;
  };
}
