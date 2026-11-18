// One-shot stage override, scoped to one level: the map panel asks to replay one completed
// stage, and the next run of THAT level takes it instead of `nextStage`. Pure state, no
// imports — both the gate side (level-gates.ts) and the run side (level-host-ports.ts) share
// it without a cycle.
interface RequestedStage {
  readonly levelId: string;
  readonly stage: number;
}

let requested: RequestedStage | undefined;

/** Asks the next run of `levelId` to play `stage` (1-based). Replaces any pending request. */
export function requestStage(levelId: string, stage: number): void {
  requested = { levelId, stage };
}

/** Drops a pending request (the map closed without playing). */
export function clearRequestedStage(): void {
  requested = undefined;
}

/**
 * Takes the pending override for `levelId` — and only for `levelId`. A request for another
 * level is dropped, not kept: entering a different level clears it. A request outside the
 * level's stages is dropped too. Anything else falls back to `nextStage`.
 */
export function takeRequestedStage(levelId: string, stages: number): number | undefined {
  const pending = requested;
  requested = undefined;
  if (pending?.levelId !== levelId) return undefined;
  return Number.isInteger(pending.stage) && pending.stage >= 1 && pending.stage <= stages
    ? pending.stage
    : undefined;
}
