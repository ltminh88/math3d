// Lenient skill decoding (M3D5): the same tuple format as M3D3/M3D4, but a well-formed id
// that is not in the catalog yet is dropped instead of rejecting the whole code — so one
// version covers all future family ids. A malformed tuple still rejects the code.
import { type FactKey, skillKey } from '../learning/fact-key';
import type { FactStat } from '../learning/learning-types';
import { isSkillId } from '../learning/skill-catalog';
import { parseSkillTuple } from './save-code-v3-skills';

/** Cap on skill tuples in one code (the catalog is ~40 today, ~140 after all families). */
export const MAX_SKILL_TUPLES = 512;

/**
 * Tuples -> skill stats keyed `sk:<id>`; well-formed unknown ids are dropped, a malformed
 * tuple or a repeat still rejects the code. The count is capped before iterating.
 */
export function tuplesToSkillStatsLenient(raw: unknown): Record<FactKey, FactStat> | null {
  if (!Array.isArray(raw) || raw.length > MAX_SKILL_TUPLES) return null;
  const stats: Record<FactKey, FactStat> = {};
  for (const tuple of raw) {
    const parsed = parseSkillTuple(tuple);
    if (!parsed) return null;
    const [id, stat] = parsed;
    if (!isSkillId(id)) continue; // well-formed future id: dropped, not rejected
    const key = skillKey(id);
    if (key in stats) return null;
    stats[key] = stat;
  }
  return stats;
}
