import type { FactKey } from '../learning/fact-key';
import type { FactStat, SessionDelta } from '../learning/learning-types';

export type { FactLocalState, FactStat, SessionDelta } from '../learning/learning-types';

export const SCHEMA_VERSION = 1;
export const DB_NAME = 'math3d';

export interface ProfileSettings {
  /** slot -> equipped cosmetic id */
  equipped: Record<string, string>;
}

export interface Profile {
  id: string;
  kind: 'guest' | 'child';
  remoteChildId?: string;
  nickname: string;
  avatarId: string;
  picturePasswordHash?: string;
  unlockFailures: number;
  lockedUntil?: number;
  settings: ProfileSettings;
}

export interface FactStatRecord extends FactStat {
  profileId: string;
  key: FactKey;
}

export interface LevelProgress {
  profileId: string;
  levelId: string;
  stars: number;
  bestScore: number;
  completedAt: number;
  /** Level-specific progress counter, e.g. bridge segments built (0..6). Only grows. */
  progress: number;
  /** When the level's quest was accepted (0 = not yet). */
  acceptedAt: number;
  /** Best stars per stage (index 0 = stage 1); missing entries count as 0. Sparse: a
   * record written before stages existed has none and is migrated on read. */
  stageStars: readonly number[];
}

export interface Wallet {
  profileId: string;
  coins: number;
  xp: number;
}

export interface OwnedCosmetic {
  profileId: string;
  cosmeticId: string;
  acquiredAt: number;
}

/** Per-profile game state that is neither wallet nor level progress (legacy save: table, combo, started). */
export interface GameMeta {
  /** Practice table filter, or 0 for all tables. */
  table: number;
  /** Consecutive correct answers (shown as "Combo N" from 3). */
  combo: number;
  /** The adventure was started once (menu button says "continue"). */
  started: boolean;
}

export const DEFAULT_GAME_META: Readonly<GameMeta> = { table: 0, combo: 0, started: false };

/** Written in the same transaction as an imported legacy save; its presence makes the import idempotent. */
export interface LegacyImportMarker {
  v: 1;
  at: number;
  /** Profile created by the import. */
  profileId: string;
}

export interface MetaRecord {
  key: string;
  value: string | number | GameMeta | LegacyImportMarker;
}

/** Pending sync item; `payload` is exactly what `sync_batch` receives. */
export interface OutboxItem {
  /** Auto-increment, defines flush order. */
  seq?: number;
  batchId: string;
  profileId: string;
  createdAt: number;
  payload: SessionDelta;
}

export const META_ACTIVE_PROFILE = 'activeProfileId';
export const META_LEGACY_IMPORT = 'legacyImport';
export const metaSessionCountKey = (profileId: string): string => `sessionCount:${profileId}`;
export const metaGameKey = (profileId: string): string => `game:${profileId}`;

export function newProfile(id: string, kind: Profile['kind'] = 'guest'): Profile {
  return {
    id,
    kind,
    nickname: '',
    avatarId: 'default',
    unlockFailures: 0,
    settings: { equipped: {} },
  };
}
