import { SAVE_KEY } from '../config/world-constants';
import { LEGACY_LANGUAGE_KEY } from '../i18n/legacy-language-key';
import { parseSave } from '../save/save-storage';
import type { Settings, StorageLike } from './settings-store';

export const LEGACY_QUEST_COLLAPSED_KEY = 'aigame3d_quest_collapsed';

const read = (storage: StorageLike, key: string): string | null => {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};

/**
 * Settings the original game kept in its own keys: language, quest card state and the sound /
 * music flags inside the v1 save. Read only (old keys are never written again), each value with
 * the original fallback, so a missing or junk key changes nothing.
 */
export function readLegacySettings(storage: StorageLike): Partial<Settings> {
  const out: Partial<Settings> = {};
  const language = read(storage, LEGACY_LANGUAGE_KEY);
  if (language !== null) out.lang = language === 'en' ? 'en' : 'vi';
  if (read(storage, LEGACY_QUEST_COLLAPSED_KEY) === '1') out.questCollapsed = true;
  const raw = read(storage, SAVE_KEY);
  if (raw !== null) {
    const save = parseSave(raw);
    out.sound = save.sound;
    out.music = save.music;
  }
  return out;
}
