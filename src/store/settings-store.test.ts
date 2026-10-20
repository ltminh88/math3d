import { describe, expect, it } from 'vitest';
import { SAVE_KEY } from '../config/world-constants';
import { readLegacySettings } from './legacy-settings-defaults';
import {
  createSettingsStore,
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  type StorageLike,
} from './settings-store';

const memory = (initial?: string): StorageLike & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  if (initial !== undefined) data.set(SETTINGS_STORAGE_KEY, initial);
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
};
const throwing: StorageLike = {
  getItem() {
    throw new Error('SecurityError');
  },
  setItem() {
    throw new Error('QuotaExceeded');
  },
};

describe('settings store', () => {
  it('persists updates and reloads them', () => {
    const storage = memory();
    createSettingsStore(storage).update({ lang: 'en', volume: 0.3 });
    const again = createSettingsStore(storage);
    expect(again.get()).toMatchObject({ lang: 'en', volume: 0.3, sound: true });
    expect(again.isPersistent()).toBe(true);
  });

  it('falls back to defaults on corrupt or invalid stored data', () => {
    expect(createSettingsStore(memory('{nope')).get()).toEqual(DEFAULT_SETTINGS);
    const s = createSettingsStore(
      memory(JSON.stringify({ lang: 'fr', volume: 7, sound: 'yes', qualityTier: 'high' })),
    );
    expect(s.get()).toEqual({ ...DEFAULT_SETTINGS, qualityTier: 'high' });
  });

  it('keeps working in memory when storage throws (private mode)', () => {
    const s = createSettingsStore(throwing);
    expect(s.get()).toEqual(DEFAULT_SETTINGS);
    expect(s.update({ sound: false }).sound).toBe(false);
    expect(s.get().sound).toBe(false);
    expect(s.isPersistent()).toBe(false);
  });

  it('works with no storage at all and notifies subscribers', () => {
    const s = createSettingsStore(null);
    let seen = 0;
    const off = s.subscribe(() => seen++);
    s.update({ readAloud: false });
    off();
    s.update({ readAloud: true });
    expect(seen).toBe(1);
  });

  it('stores under math3d.settings with music and quest-card state', () => {
    const storage = memory();
    createSettingsStore(storage).update({ music: true, questCollapsed: true });
    expect(SETTINGS_STORAGE_KEY).toBe('math3d.settings');
    expect(JSON.parse(storage.data.get(SETTINGS_STORAGE_KEY) ?? '{}')).toMatchObject({
      music: true,
      questCollapsed: true,
    });
    expect(DEFAULT_SETTINGS).toMatchObject({ music: false, questCollapsed: false, lang: 'vi' });
  });

  it('derives first-boot settings from legacy keys without writing anything', () => {
    const storage = memory();
    storage.data.set('aigame3d_language', 'en');
    storage.data.set('aigame3d_quest_collapsed', '1');
    storage.data.set(SAVE_KEY, JSON.stringify({ version: 1, sound: false, music: true }));
    const before = new Map(storage.data);
    const s = createSettingsStore(storage, readLegacySettings);
    expect(s.get()).toMatchObject({ lang: 'en', questCollapsed: true, sound: false, music: true });
    expect(storage.data).toEqual(before);
    // Once the new key exists, legacy keys are ignored (a later language switch sticks).
    s.update({ lang: 'vi' });
    expect(createSettingsStore(storage, readLegacySettings).get().lang).toBe('vi');
    expect(storage.data.get('aigame3d_language')).toBe('en');
  });

  it('legacy settings fall back to the original defaults for junk or throwing storage', () => {
    const junk = memory();
    junk.data.set('aigame3d_language', 'fr');
    junk.data.set(SAVE_KEY, '{broken');
    expect(createSettingsStore(junk, readLegacySettings).get()).toEqual(DEFAULT_SETTINGS);
    expect(readLegacySettings(throwing)).toEqual({});
  });

  it('rejects out-of-range patches instead of storing them', () => {
    const s = createSettingsStore(null);
    expect(s.update({ volume: 5 }).volume).toBe(DEFAULT_SETTINGS.volume);
  });
});
