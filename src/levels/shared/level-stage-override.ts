// One-shot stage override: the map panel asks to replay one completed stage, and the next
// level run takes it instead of `nextStage`. Pure state, no imports — both the gate side
// (level-gates.ts) and the run side (level-host-ports.ts) share it without a cycle.
let requested: number | undefined;

/** Asks the next run to play `stage` (1-based). */
export function requestStage(stage: number): void {
  requested = stage;
}

/**
 * Takes the pending override when it names a real stage of this level, then clears it — a
 * replay never leaks into the run after it. Anything else falls back to `nextStage`.
 */
export function takeRequestedStage(stages: number): number | undefined {
  const stage = requested;
  requested = undefined;
  return stage !== undefined && Number.isInteger(stage) && stage >= 1 && stage <= stages
    ? stage
    : undefined;
}
