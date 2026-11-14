// One-time import of the original game's v1 localStorage save into the store. The old key is
// only ever read: rolling back to the recovered build still finds the pre-migration progress.
import { SAVE_KEY } from '../config/world-constants';
import { type FactKey, mulKey } from '../learning/fact-key';
import type { FactStat } from '../learning/learning-types';
import { newFactStat } from '../learning/leitner-box';
import { decodeSaveV1 } from '../save/save-storage';
import type { SaveV1 } from '../save/save-types';
import { STAT_KEY_PATTERN } from '../save/save-types';
import type { GameStore } from './game-store-api';
import type { ProgressRecords } from './profile-replacement';
import type { StorageLike } from './settings-store';

/** Level id the original bridge quest maps to. */
export const BRIDGE_LEVEL_ID = 'bridge';

/** A localStorage blob larger than this is not a real v1 save (90 stats are ~10 KB). */
const MAX_LEGACY_SAVE_CHARS = 256 * 1024;

/**
 * Leitner box for an imported fact: queued for review -> 1; mastered without a miss -> 3;
 * answered right at least once -> 2; otherwise 1.
 */
export function seedLeitnerBox(
  stat: { correct: number; wrong: number },
  inReview: boolean,
): number {
  if (inReview) return 1;
  if (stat.correct >= 3 && stat.wrong === 0) return 3;
  return stat.correct >= 1 ? 2 : 1;
}

const parseStatId = (id: string): [number, number] | null => {
  const m = STAT_KEY_PATTERN.exec(id);
  return m ? [Number(m[1]), Number(m[2])] : null;
};

/**
 * Pools the original per-direction stats (`m7_3`, `m3_7`) into commutative fact keys
 * (`mul:3x7`). The original keeps only the last response time, so totalMs = time x attempts.
 * `boxes` (save codes) overrides the seeded box per fact key.
 */
function mapFacts(
  save: SaveV1,
  boxes: Readonly<Record<FactKey, number>>,
): Record<FactKey, FactStat> {
  const facts: Record<FactKey, FactStat> = {};
  const review = new Set<FactKey>();
  for (const [id, stat] of Object.entries(save.questionStats)) {
    const ab = parseStatId(id);
    if (!ab) continue;
    const key = mulKey(ab[0], ab[1]);
    if (save.review.includes(id)) review.add(key);
    const prev = facts[key] ?? newFactStat();
    const seenAt = Date.parse(stat.lastAnsweredAt);
    facts[key] = {
      ...prev,
      attempts: prev.attempts + stat.attempts,
      correct: prev.correct + stat.correct,
      totalMs: prev.totalMs + stat.responseTime * stat.attempts,
      lastSeenAt: Math.max(prev.lastSeenAt, Number.isFinite(seenAt) ? seenAt : 0),
    };
  }
  for (const [key, fact] of Object.entries(facts)) {
    const override = boxes[key];
    fact.box =
      override !== undefined
        ? override
        : seedLeitnerBox(
            { correct: fact.correct, wrong: fact.attempts - fact.correct },
            review.has(key),
          );
  }
  return facts;
}

/** Pure mapping of a validated v1 save to store records. */
export function mapSaveV1ToProgress(
  save: SaveV1,
  now: number,
  boxes: Readonly<Record<FactKey, number>> = {},
): ProgressRecords {
  const touched = save.bridge > 0 || save.questAccepted || save.questComplete;
  return {
    avatarId: save.avatar,
    wallet: { xp: save.xp, coins: save.coins },
    levels: touched
      ? {
          [BRIDGE_LEVEL_ID]: {
            stars: save.questComplete ? 1 : 0,
            bestScore: 0,
            completedAt: save.questComplete ? now : 0,
            progress: save.bridge,
            acceptedAt: save.questAccepted ? now : 0,
            stageStars: [],
          },
        }
      : {},
    facts: mapFacts(save, boxes),
    gameMeta: { table: save.table, combo: save.combo, started: save.started },
  };
}

/** The raw legacy blob, or null when absent or when storage itself throws. */
export function readLegacySaveRaw(storage: StorageLike | null): string | null {
  try {
    return storage?.getItem(SAVE_KEY) ?? null;
  } catch {
    return null;
  }
}

export type LegacyImportResult = 'imported' | 'already-imported' | 'absent' | 'invalid';

/**
 * Imports `raw` once. Invalid or unknown-version saves behave like the original (defaults: nothing
 * imported) and write no marker; a store failure rejects, also without a marker, so the next boot
 * retries.
 */
export async function importLegacySave(
  store: GameStore,
  raw: string | null,
  now: number = Date.now(),
): Promise<LegacyImportResult> {
  if (raw === null) return 'absent';
  const save = raw.length <= MAX_LEGACY_SAVE_CHARS ? decodeSaveV1(raw, { cap: false }) : null;
  if (!save) return 'invalid';
  const result = await store.replaceProgress(mapSaveV1ToProgress(save, now), {
    legacyImport: true,
  });
  return result === 'replaced' ? 'imported' : 'already-imported';
}
