// Stage status inside one level (phase 01, pure). A stage is open once the previous stage
// has at least 1 star; stage 1 is always open once the level gate is open (gate openness
// itself lives in level-progression.ts). `stageStars` is sparse: a missing entry is 0.
export type StageStatus = 'locked' | 'open' | 'completed';

export interface StageProgress {
  /** Number of stages the level has (LevelDefinition.stages). */
  readonly stages: number;
  /** Best stars per stage; index 0 is stage 1. Missing entries count as 0. */
  readonly stageStars: readonly number[];
}

const starsOf = (progress: StageProgress, stage: number): number =>
  progress.stageStars[stage - 1] ?? 0;

/** 'locked' | 'open' | 'completed' for one stage (1-based). Out of range is 'locked'. */
export function stageStatus(progress: StageProgress, stage: number): StageStatus {
  if (!Number.isInteger(stage) || stage < 1 || stage > progress.stages) return 'locked';
  if (starsOf(progress, stage) >= 1) return 'completed';
  if (stage === 1) return 'open';
  return starsOf(progress, stage - 1) >= 1 ? 'open' : 'locked';
}

/** First stage with no star — the one the gate offers next. All done: replay the last. */
export function nextStage(progress: StageProgress): number {
  for (let stage = 1; stage <= progress.stages; stage++) {
    if (starsOf(progress, stage) < 1) return stage;
  }
  return progress.stages;
}

/** How many stages have at least 1 star. */
export function stagesCompleted(progress: StageProgress): number {
  let done = 0;
  for (let stage = 1; stage <= progress.stages; stage++) {
    if (starsOf(progress, stage) >= 1) done++;
  }
  return done;
}
