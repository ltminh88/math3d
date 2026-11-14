// M3D4 save-code payload (written by export since phase 01): every M3D3 field for the
// chapter-2 level set, plus
//   t per-level stage stars {levelId: [s1, s2, …]} (only levels with a non-zero stage
//     beyond stage 1, to keep codes short)
//   d [lastDailyDay, dailyStreak] (phase 11 owns the semantics; the field exists here
//     so its shape is frozen)
// The phase-01 design said `s` for stage stars, but `s` is already the audio
// [sound, music] pair in M3D2/M3D3, so M3D4 uses `t` (stages) instead. Decoding is
// strict, like M3D3: an unknown level/skill id or a malformed `d` rejects the code.
// One exception: `t[0]` is redundant with the level's `stars`, and a code written
// before the stageStars[0] === stars invariant was enforced can drift — importing
// such a code repairs stage 1 to `stars` (keeping stages 2+ as written) instead of
// rejecting the child's save.

import type { GameSnapshot } from './progress-repository';
import { isIntIn } from './save-code-v2-facts';
import {
  type Compact,
  compactFieldsToImport,
  isPlainObject,
  M3D2_KEYS,
  type SaveCodeAudio,
  type SaveCodeImport,
} from './save-code-v2-payload';
import { M3D3_LEVELS, snapshotToCompactV3 } from './save-code-v3-payload';
import { tuplesToSkillStats } from './save-code-v3-skills';
import type { DailyProgress } from './save-schema';

export const M3D4_KEYS: readonly string[] = [...M3D2_KEYS, 'k', 't', 'd'];
const LEVEL_SET: ReadonlySet<string> = new Set(M3D3_LEVELS);
/** Plan max is 6 stages, plus the 7th-stage contingency (phase 00) — 8 leaves room. */
const MAX_STAGE_STARS = 8;
const MAX_DAILY_DAY = 100_000;
const MAX_DAILY_STREAK = 10_000;

const trimStageStars = (stars: readonly number[]): number[] => {
  const out = [...stars];
  while (out.length > 1 && out[out.length - 1] === 0) out.pop();
  return out;
};

export function snapshotToCompactV4(snapshot: GameSnapshot, audio: SaveCodeAudio): Compact {
  const out = snapshotToCompactV3(snapshot, audio);
  const t: Record<string, number[]> = {};
  for (const l of Object.values(snapshot.levelProgress)) {
    const stars = l.stageStars ?? [];
    if (stars.slice(1).some((s) => s > 0)) t[l.levelId] = trimStageStars(stars);
  }
  if (Object.keys(t).length) out.t = t;
  const d = snapshot.daily;
  if (d && (d.lastDailyDay > 0 || d.dailyStreak > 0)) out.d = [d.lastDailyDay, d.dailyStreak];
  return out;
}

type LevelRecords = SaveCodeImport['records']['levels'];

function decodeStageStars(raw: unknown, levels: LevelRecords): boolean {
  if (raw === undefined) return true;
  if (!isPlainObject(raw)) return false;
  for (const [id, stars] of Object.entries(raw)) {
    const level = levels[id];
    if (!level) return false;
    if (
      !Array.isArray(stars) ||
      stars.length < 1 ||
      stars.length > MAX_STAGE_STARS ||
      !stars.every((s) => isIntIn(s, 0, 3))
    )
      return false;
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
export function compactV4ToImport(raw: unknown): SaveCodeImport | null {
  if (!isPlainObject(raw)) return null;
  const { k = [], t, d, ...fields } = raw;
  const skills = tuplesToSkillStats(k);
  const data = compactFieldsToImport(fields, LEVEL_SET, M3D4_KEYS);
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
