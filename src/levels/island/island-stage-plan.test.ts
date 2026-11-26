// Stage plan for the island (Phase 1A, pure): 8 stages of English letter blocks,
// 8 rounds per run. Stage names follow the plan's blocks (A–D, E–H, …, A–Z review);
// the run itself (skills, items) is Phase 1B's engine behind `startEnglishRun`.
import { describe, expect, it } from 'vitest';
import {
  ISLAND_ROUNDS,
  ISLAND_STAGE_NAMES,
  ISLAND_STAGES,
  islandStageName,
} from './island-stage-plan';

describe('island stage plan', () => {
  it('has 8 stages of 8 rounds', () => {
    expect(ISLAND_STAGES).toBe(8);
    expect(ISLAND_ROUNDS).toBe(8);
  });

  it('names every stage after its letter block', () => {
    expect(ISLAND_STAGE_NAMES).toEqual(['A–D', 'E–H', 'I–L', 'M–P', 'Q–T', 'U–X', 'Y–Z', 'A–Z']);
    for (let stage = 1; stage <= ISLAND_STAGES; stage++) {
      expect(islandStageName(stage)).toBe(ISLAND_STAGE_NAMES[stage - 1]);
    }
  });

  it('falls back to stage 1 outside 1–8', () => {
    expect(islandStageName(0)).toBe('A–D');
    expect(islandStageName(9)).toBe('A–D');
  });
});
