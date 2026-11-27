// The workshop ruler station's length slots (boost, Phase 3B): which meas-len-*
// skills each stage drills, weakest-first among attempted ids, with the legacy
// ruler pair as the stage's fallback. Never more than one length round in a row
// from the same id: the length id played most recently is skipped while another
// length id remains.
import { skillKey } from '../../learning/fact-key';
import type { FactStat } from '../../learning/learning-types';
import { isLengthSkill } from '../../measurement/length-item-for-skill';

/** Length skills per stage, cumulative along the ladder (1B ladder, 2B steps). */
export const LENGTH_RULER_SLOTS: Readonly<Record<number, readonly string[]>> = {
  1: ['meas-len-choose-unit', 'meas-len-ladder', 'meas-len-convert'],
  2: ['meas-len-choose-unit', 'meas-len-ladder', 'meas-len-convert', 'meas-len-convert-far'],
  3: [
    'meas-len-choose-unit',
    'meas-len-ladder',
    'meas-len-convert',
    'meas-len-convert-far',
    'meas-len-compare',
    'meas-len-order',
  ],
  4: [
    'meas-len-choose-unit',
    'meas-len-ladder',
    'meas-len-convert',
    'meas-len-convert-far',
    'meas-len-compare',
    'meas-len-order',
    'meas-len-mixed',
  ],
  5: [
    'meas-len-choose-unit',
    'meas-len-ladder',
    'meas-len-convert',
    'meas-len-convert-far',
    'meas-len-compare',
    'meas-len-order',
    'meas-len-mixed',
    'meas-len-add-sub',
  ],
};

/** The legacy ruler pair: the stage's fallback when no length id is playable. */
export const RULER_SLOT_FALLBACK: readonly string[] = ['meas-ruler-read', 'meas-mm-convert'];

/** The ruler slot's candidates for `stage` (unknown stages play stage 1). */
export function rulerSlotForStage(stage: number): readonly string[] {
  const length = LENGTH_RULER_SLOTS[stage] ?? LENGTH_RULER_SLOTS[1] ?? [];
  return [...length, ...RULER_SLOT_FALLBACK];
}

type Stats = Readonly<Record<string, FactStat | undefined>>;

/** Skip the length id played most recently, while another length id remains:
 * the most recent length round never repeats right away. When every length id
 * was played in the same last session (or none was played yet), nothing is
 * skipped — the weakest-first order below decides instead. */
export function excludeJustPlayedLength(
  candidates: readonly string[],
  stats: Stats,
): readonly string[] {
  const length = candidates.filter(isLengthSkill);
  if (length.length === 0) return candidates;
  const lastSeen = (id: string) => stats[skillKey(id)]?.lastSeenSession ?? 0;
  const max = Math.max(...length.map(lastSeen));
  if (max <= 0) return candidates;
  const kept = candidates.filter((id) => !(isLengthSkill(id) && lastSeen(id) === max));
  return kept.some(isLengthSkill) ? kept : candidates;
}
