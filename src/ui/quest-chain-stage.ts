// Which quest the quest card shows (pure). The chain follows the gates: the bridge quest opens
// the field gate, the field opens the forest gate, and after the forest a closing card remains.
import type { ProgressionState } from '../levels/shared/level-progression';

export type QuestStage = 'bridge' | 'field' | 'forest' | 'done';

/** Same state the level gates read: bridge quest flag plus the completed level ids. */
export function questStage(state: ProgressionState): QuestStage {
  if (!state.bridgeComplete) return 'bridge';
  if (!state.completedLevels.has('field')) return 'field';
  if (!state.completedLevels.has('forest')) return 'forest';
  return 'done';
}
