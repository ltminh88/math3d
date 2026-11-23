// M3D3 save-code payload (written by export since chapter 2): every M3D2 field
// (save-code-v2-payload.ts) for the chapter-2 level set, plus
//   k skill tuples (save-code-v3-skills.ts)
// The level set below is shared by every version (v3–v6) and grows with new gates: chapter 3
// added market and numberfort. That is safe because export always writes the newest version,
// whose decoder has been lenient since M3D5, and no v3/v4 code written before chapter 3 can
// contain the new levels. Decoding of the old versions stays strict, like M3D2.
import { BRIDGE_LEVEL_ID } from './legacy-save-import';
import type { GameSnapshot } from './progress-repository';
import {
  type Compact,
  compactFieldsToImport,
  isPlainObject,
  M3D2_KEYS,
  type SaveCodeAudio,
  type SaveCodeImport,
  snapshotToCompactFields,
} from './save-code-v2-payload';
import { skillStatsToTuples, tuplesToSkillStats } from './save-code-v3-skills';

/** Bridge + every level gate of chapters 1–3. */
export const M3D3_LEVELS: readonly string[] = [
  BRIDGE_LEVEL_ID,
  'field',
  'forest',
  'city',
  'tower',
  'garden',
  'valley',
  'workshop',
  'cave',
  'market',
  'numberfort',
];
const LEVEL_SET: ReadonlySet<string> = new Set(M3D3_LEVELS);

export function snapshotToCompactV3(snapshot: GameSnapshot, audio: SaveCodeAudio): Compact {
  const out = snapshotToCompactFields(snapshot, audio, LEVEL_SET);
  const skills = skillStatsToTuples(snapshot.factStats);
  if (skills.length) out.k = skills;
  return out;
}

/** Compact payload -> import (facts and skills in one record), or null for anything malformed. */
export function compactV3ToImport(raw: unknown): SaveCodeImport | null {
  if (!isPlainObject(raw)) return null;
  const { k = [], ...fields } = raw;
  const skills = tuplesToSkillStats(k);
  const data = compactFieldsToImport(fields, LEVEL_SET, M3D2_KEYS);
  if (!skills || !data) return null;
  return { ...data, records: { ...data.records, facts: { ...data.records.facts, ...skills } } };
}
