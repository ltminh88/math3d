// Region progression for level gates (pure). Regions themselves stay walkable after the bridge
// exactly as in the original; only the gates are gated: field needs the bridge quest, forest
// needs a completed field run.
import type { GateRequirement } from '../../config/regions';

export interface ProgressionState {
  readonly bridgeComplete: boolean;
  /** Level ids with a completion time (`LevelProgress.completedAt > 0`). */
  readonly completedLevels: ReadonlySet<string>;
}

export type GateStatus = 'locked' | 'coming-soon' | 'open' | 'completed';

export function progressionState(
  bridgeComplete: boolean,
  levelProgress: Readonly<Record<string, { readonly completedAt: number } | undefined>>,
): ProgressionState {
  const completedLevels = new Set<string>();
  for (const [levelId, level] of Object.entries(levelProgress)) {
    if ((level?.completedAt ?? 0) > 0) completedLevels.add(levelId);
  }
  return { bridgeComplete, completedLevels };
}

export function isGateOpen(requires: GateRequirement, state: ProgressionState): boolean {
  if (requires === null) return true;
  if (requires === 'bridge') return state.bridgeComplete;
  return state.completedLevels.has(requires);
}

/**
 * What the gate shows. A locked gate stays locked even without a level module (the child sees
 * what to do first); an open gate whose level is not shipped says "Sắp ra mắt".
 */
export function gateStatus(
  gate: { readonly levelId: string; readonly requires: GateRequirement },
  state: ProgressionState,
  levelRegistered: boolean,
): GateStatus {
  if (!isGateOpen(gate.requires, state)) return 'locked';
  if (!levelRegistered) return 'coming-soon';
  return state.completedLevels.has(gate.levelId) ? 'completed' : 'open';
}
