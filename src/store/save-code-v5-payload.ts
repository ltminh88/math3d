// M3D5 save-code payload (written by export since phase 03): every M3D4 field, with lenient
// decoding — a well-formed skill/level id that is not in the catalog/level set yet is
// dropped, not rejected, so one version covers all future family ids and chapter-3 levels.
// A malformed id (or a malformed tuple/field) still rejects the code. Decoding of v1–v4
// is unchanged: their payload files are frozen, and the strict path here is the v4 code
// with only the drop branches added.

import type { GameSnapshot } from './progress-repository';
import { isIntIn } from './save-code-v2-facts';
import {
  type Compact,
  compactFieldsToImport,
  isPlainObject,
  M3D2_KEYS,
  type SaveCodeAudio,
  type SaveCodeImport,
  WELL_FORMED_ID_PATTERN,
} from './save-code-v2-payload';
import { M3D3_LEVELS } from './save-code-v3-payload';
import { snapshotToCompactV4 } from './save-code-v4-payload';
import { tuplesToSkillStatsLenient } from './save-code-v5-skills-lenient';
import type { DailyProgress } from './save-schema';

export const M3D5_KEYS: readonly string[] = [...M3D2_KEYS, 'k', 't', 'd'];
const LEVEL_SET: ReadonlySet<string> = new Set(M3D3_LEVELS);
/** Plan max is 6 stages, plus the 7th-stage contingency (phase 00) — 8 leaves room. */
const MAX_STAGE_STARS = 8;
const MAX_DAILY_DAY = 100_000;
const MAX_DAILY_STREAK = 10_000;

/** M3D5 writes the same fields as M3D4; only decoding is lenient. */
export function snapshotToCompactV5(snapshot: GameSnapshot, audio: SaveCodeAudio): Compact {
  return snapshotToCompactV4(snapshot, audio);
}

type LevelRecords = SaveCodeImport['records']['levels'];

function decodeStageStars(raw: unknown, levels: LevelRecords): boolean {
  if (raw === undefined) return true;
  if (!isPlainObject(raw)) return false;
  for (const [id, stars] of Object.entries(raw)) {
    if (
      !Array.isArray(stars) ||
      stars.length < 1 ||
      stars.length > MAX_STAGE_STARS ||
      !stars.every((s) => isIntIn(s, 0, 3))
    )
      return false;
    const level = levels[id];
    if (!level) {
      if (!WELL_FORMED_ID_PATTERN.test(id)) return false;
      continue; // well-formed future level: its stage stars are dropped with it
    }
    // `t[0]` is redundant with the level's stars (the authoritative value): a drifted
    // code repairs stage 1 to `stars` on import instead of being rejected.
    level.stageStars = [level.stars, ...(stars as number[]).slice(1)];
  }
  return true;
}

function decodeDaily(raw: unknown): DailyProgress | undefined | null {
  if (raw === undefined) return undefined;
  if (!Array.isArray(raw) || raw.length !== 2) return null;
  const [lastDailyDay, dailyStreak] = raw as unknown[];
  if (!isIntIn(lastDailyDay, 0, MAX_DAILY_DAY) || !isIntIn(dailyStreak, 0, MAX_DAILY_STREAK))
    return null;
  return { lastDailyDay, dailyStreak };
}

/** Compact payload -> import, or null for anything malformed. */
export function compactV5ToImport(raw: unknown): SaveCodeImport | null {
  if (!isPlainObject(raw)) return null;
  const { k = [], t, d, ...fields } = raw;
  const skills = tuplesToSkillStatsLenient(k);
  const data = compactFieldsToImport(fields, LEVEL_SET, M3D5_KEYS, true);
  if (!skills || !data) return null;
  if (!decodeStageStars(t, data.records.levels)) return null;
  const daily = decodeDaily(d);
  if (daily === null) return null;
  return {
    ...data,
    records: {
      ...data.records,
      facts: { ...data.records.facts, ...skills },
      ...(daily ? { daily } : {}),
    },
  };
}
