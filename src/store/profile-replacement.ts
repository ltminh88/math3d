import type { FactKey } from '../learning/fact-key';
import type { FactStat } from '../learning/learning-types';
import { newLevelProgress, type WriteTx } from './progress-repository';
import {
  DEFAULT_GAME_META,
  type GameMeta,
  type LegacyImportMarker,
  type LevelProgress,
  META_ACTIVE_PROFILE,
  META_LEGACY_IMPORT,
  metaGameKey,
  metaSessionCountKey,
  newProfile,
  type Profile,
} from './save-schema';

/** Everything a profile's progress consists of; written wholesale by an import or a reset. */
export interface ProgressRecords {
  avatarId: string;
  wallet: { coins: number; xp: number };
  levels: Record<string, Omit<LevelProgress, 'profileId' | 'levelId'>>;
  facts: Record<FactKey, FactStat>;
  gameMeta: GameMeta;
  /** Shop items owned and worn (save code M3D2); absent = none. */
  cosmetics?: { owned: string[]; equipped: Record<string, string> };
  /** Committed session counter (keeps `lastSeenSession` spacing meaningful); absent = 0. */
  sessionCount?: number;
}

export const emptyProgressRecords = (): ProgressRecords => ({
  avatarId: 'default',
  wallet: { coins: 0, xp: 0 },
  levels: {},
  facts: {},
  gameMeta: { ...DEFAULT_GAME_META },
});

export interface ReplaceOptions {
  /**
   * Legacy-save import: skip when the marker exists. Every replacement writes the marker (if
   * absent), so a reset or save-code import is never overwritten by a later legacy-import retry.
   */
  legacyImport?: boolean;
}

export async function hasLegacyImportMarker(tx: WriteTx): Promise<boolean> {
  return (await tx.objectStore('meta').get(META_LEGACY_IMPORT)) !== undefined;
}

/**
 * Writes `records` as a brand-new guest profile and makes it the active one, inside the caller's
 * transaction. The previous profile's rows stay untouched (no delete needed, nothing to undo).
 */
export async function writeReplacementProfile(
  tx: WriteTx,
  profileId: string,
  records: ProgressRecords,
  now: number,
  options: ReplaceOptions = {},
): Promise<Profile> {
  const base = newProfile(profileId, 'guest');
  const equipped = { ...(records.cosmetics?.equipped ?? {}) };
  const profile: Profile = { ...base, avatarId: records.avatarId, settings: { equipped } };
  await tx.objectStore('profiles').put(profile);
  await tx.objectStore('wallet').put({ profileId, ...records.wallet });
  for (const [levelId, level] of Object.entries(records.levels)) {
    await tx
      .objectStore('levelProgress')
      .put({ ...newLevelProgress(profileId, levelId), ...level, profileId, levelId });
  }
  for (const [key, stat] of Object.entries(records.facts)) {
    await tx.objectStore('factStats').put({ ...stat, profileId, key });
  }
  for (const cosmeticId of records.cosmetics?.owned ?? []) {
    await tx.objectStore('ownedCosmetics').put({ profileId, cosmeticId, acquiredAt: now });
  }
  const meta = tx.objectStore('meta');
  await meta.put({ key: metaGameKey(profileId), value: { ...records.gameMeta } });
  if (records.sessionCount)
    await meta.put({ key: metaSessionCountKey(profileId), value: records.sessionCount });
  await meta.put({ key: META_ACTIVE_PROFILE, value: profileId });
  // Any replacement supersedes the legacy save: a later import retry must never overwrite it.
  if (options.legacyImport || !(await hasLegacyImportMarker(tx))) {
    const marker: LegacyImportMarker = { v: 1, at: now, profileId };
    await meta.put({ key: META_LEGACY_IMPORT, value: marker });
  }
  return profile;
}
