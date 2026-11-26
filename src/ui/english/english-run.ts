// English run entry point (Phase 0): the single UI entry the island level shell
// (1A) calls. Phase 1B fills it in — planner, generators, widgets, tally.
// This stub only resolves a finished run with 0 rounds, so the shell can wire
// against it before the engine lands.
import type { LevelLearning } from '../../levels/shared/level-types';

/** What the island level shell hands the run: its stage, DOM root and learning services. */
export interface EnglishRunPort {
  /** Stage of this run (1-based, 1–8). */
  readonly stage: number;
  /** Overlay root for the run's DOM; removed on exit. */
  readonly ui: HTMLElement;
  /** Leitner stats + recorder (answers land under `sk:en-*`). */
  readonly learning: LevelLearning;
}

export interface EnglishRunResult {
  /** All rounds played: the level counts as completed (stars, bonus). */
  readonly completed: boolean;
  /** Rounds played in this run (8 in a full run). */
  readonly roundsPlayed: number;
  readonly correctCount: number;
}

/** Stub (Phase 0): resolves a finished run with 0 rounds. 1B fills this in. */
export async function startEnglishRun(_port: EnglishRunPort): Promise<EnglishRunResult> {
  return { completed: false, roundsPlayed: 0, correctCount: 0 };
}
