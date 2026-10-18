import { describe, expect, it } from 'vitest';
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

  it('rejects out-of-range patches instead of storing them', () => {
    const s = createSettingsStore(null);
    expect(s.update({ volume: 5 }).volume).toBe(DEFAULT_SETTINGS.volume);
  });
});
