// Which quest the quest card shows (pure). The chain follows the gates: the bridge quest opens
// the field gate, then each level opens the next (forest, city, tower); after the tower a closing
// card remains.
import type { ProgressionState } from '../levels/shared/level-progression';

/** The levels of the chain in gate order (each one's gate opens once the previous is done). */
export const CHAIN_LEVELS = ['field', 'forest', 'city', 'tower'] as const;

export type ChainLevel = (typeof CHAIN_LEVELS)[number];
export type QuestStage = 'bridge' | ChainLevel | 'done';

/** Same state the level gates read: bridge quest flag plus the completed level ids. */
export function questStage(state: ProgressionState): QuestStage {
  if (!state.bridgeComplete) return 'bridge';
  return CHAIN_LEVELS.find((levelId) => !state.completedLevels.has(levelId)) ?? 'done';
}
