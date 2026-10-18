import { describe, expect, it } from 'vitest';
import {
  createLocalAudioSettingsStore,
  DEFAULT_AUDIO_SETTINGS,
  parseAudioSettings,
  type StorageLike,
} from './audio-settings';

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => {
      data.set(k, v);
    },
  };
}

describe('audio settings', () => {
  it('persists mute across a reload', () => {
    const storage = memoryStorage();
    createLocalAudioSettingsStore(storage).save({ muted: true, volume: 0.3 });
    expect(createLocalAudioSettingsStore(storage).load()).toEqual({ muted: true, volume: 0.3 });
  });

  it('falls back to defaults for malformed or hostile data and clamps volume', () => {
    expect(parseAudioSettings('not json')).toEqual(DEFAULT_AUDIO_SETTINGS);
    expect(parseAudioSettings('42')).toEqual(DEFAULT_AUDIO_SETTINGS);
    expect(parseAudioSettings('{"muted":"yes","volume":"loud"}')).toEqual(DEFAULT_AUDIO_SETTINGS);
    expect(parseAudioSettings('{"muted":true,"volume":9}')).toEqual({ muted: true, volume: 1 });
  });

  it('survives storage that throws', () => {
    const broken: StorageLike = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    const store = createLocalAudioSettingsStore(broken);
    expect(store.load()).toEqual(DEFAULT_AUDIO_SETTINGS);
    expect(() => store.save({ muted: true, volume: 1 })).not.toThrow();
  });
});
