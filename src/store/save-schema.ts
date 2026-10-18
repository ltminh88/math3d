import type { FactKey } from '../learning/fact-key';
import type { FactStat, SessionDelta } from '../learning/learning-types';

export type { FactLocalState, FactStat, SessionDelta } from '../learning/learning-types';

export const SCHEMA_VERSION = 1;
export const DB_NAME = 'number-stone-quest';

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

export interface MetaRecord {
  key: string;
  value: string | number;
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
export const metaSessionCountKey = (profileId: string): string => `sessionCount:${profileId}`;

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
