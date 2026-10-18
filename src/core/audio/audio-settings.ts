export interface AudioSettings {
  muted: boolean;
  /** 0..1 */
  volume: number;
}

export interface AudioSettingsStore {
  load(): AudioSettings;
  save(settings: AudioSettings): void;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = { muted: false, volume: 0.7 };
const STORAGE_KEY = 'nsq.audio';

/** Validates untrusted persisted data; anything malformed falls back to the defaults. */
export function parseAudioSettings(raw: string | null): AudioSettings {
  if (!raw) return { ...DEFAULT_AUDIO_SETTINGS };
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) return { ...DEFAULT_AUDIO_SETTINGS };
    const { muted, volume } = data as Record<string, unknown>;
    return {
      muted: typeof muted === 'boolean' ? muted : DEFAULT_AUDIO_SETTINGS.muted,
      volume:
        typeof volume === 'number' && Number.isFinite(volume)
          ? Math.min(1, Math.max(0, volume))
          : DEFAULT_AUDIO_SETTINGS.volume,
    };
  } catch {
    return { ...DEFAULT_AUDIO_SETTINGS };
  }
}

/**
 * Default persistence (localStorage). The app can supply its own AudioSettingsStore backed by the
 * game settings store once it exists; the engine only depends on the interface.
 */
export function createLocalAudioSettingsStore(storage?: StorageLike): AudioSettingsStore {
  const target = storage ?? safeLocalStorage();
  return {
    load: () => {
      try {
        return parseAudioSettings(target?.getItem(STORAGE_KEY) ?? null);
      } catch {
        return { ...DEFAULT_AUDIO_SETTINGS };
      }
    },
    save: (settings) => {
      try {
        target?.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch {
        // Storage may be blocked (private mode); the setting still applies this session.
      }
    },
  };
}

function safeLocalStorage(): StorageLike | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}
