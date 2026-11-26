// Stage plan for the island (Phase 1A, pure): 8 stages of English letter blocks,
// 8 rounds per run. Stage names follow the plan's blocks (A–D, E–H, …, A–Z review);
// the run itself (skills, items) is Phase 1B's engine behind `startEnglishRun`.

/** Rounds per island run (8, as in the plan). */
export const ISLAND_ROUNDS = 8;

/** Stages inside the island (8, as in the plan). */
export const ISLAND_STAGES = 8;

/** The letter block each stage drills, in plan order. */
export const ISLAND_STAGE_NAMES: readonly string[] = [
  'A–D',
  'E–H',
  'I–L',
  'M–P',
  'Q–T',
  'U–X',
  'Y–Z',
  'A–Z',
] as const;

/** The stage's letter block (stage 1's block outside 1–8). */
export function islandStageName(stage: number): string {
  return ISLAND_STAGE_NAMES[stage - 1] ?? ISLAND_STAGE_NAMES[0] ?? 'A–D';
}
