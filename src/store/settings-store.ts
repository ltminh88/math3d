/** Device settings in localStorage with an in-memory fallback (private mode, blocked storage, node). */
export type QualityTier = 'auto' | 'low' | 'medium' | 'high';

export interface Settings {
  lang: 'vi' | 'en';
  sound: boolean;
  volume: number;
  readAloud: boolean;
  reducedMotion: boolean;
  qualityTier: QualityTier;
  /** Soft background music (legacy save `music`). */
  music: boolean;
  /** The quest card is collapsed (legacy key `aigame3d_quest_collapsed`). */
  questCollapsed: boolean;
}

export const DEFAULT_SETTINGS: Readonly<Settings> = {
  lang: 'vi',
  sound: true,
  volume: 0.8,
  readAloud: true,
  reducedMotion: false,
  qualityTier: 'auto',
  music: false,
  questCollapsed: false,
};

export const SETTINGS_STORAGE_KEY = 'math3d.settings';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface SettingsStore {
  get(): Settings;
  update(patch: Partial<Settings>): Settings;
  subscribe(listener: (s: Settings) => void): () => void;
  /** False when writes only live in memory (progress of settings will not survive a reload). */
  isPersistent(): boolean;
}

const QUALITY: readonly QualityTier[] = ['auto', 'low', 'medium', 'high'];

/** Keeps only valid, correctly typed fields; anything else falls back to the default. */
export function sanitizeSettings(raw: unknown): Settings {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  const d = DEFAULT_SETTINGS;
  const bool = (v: unknown, fallback: boolean): boolean => (typeof v === 'boolean' ? v : fallback);
  return {
    lang: r.lang === 'vi' || r.lang === 'en' ? r.lang : d.lang,
    sound: bool(r.sound, d.sound),
    volume: typeof r.volume === 'number' && r.volume >= 0 && r.volume <= 1 ? r.volume : d.volume,
    readAloud: bool(r.readAloud, d.readAloud),
    reducedMotion: bool(r.reducedMotion, d.reducedMotion),
    qualityTier: QUALITY.find((q) => q === r.qualityTier) ?? d.qualityTier,
    music: bool(r.music, d.music),
    questCollapsed: bool(r.questCollapsed, d.questCollapsed),
  };
}

export function defaultStorage(): StorageLike | null {
  try {
    return (globalThis as { localStorage?: StorageLike }).localStorage ?? null;
  } catch {
    return null; // accessing localStorage itself can throw (SecurityError)
  }
}

/**
 * `firstBootDefaults` seeds the settings while nothing is stored under SETTINGS_STORAGE_KEY yet
 * (e.g. values carried over from the legacy save). Nothing is written until the first update.
 */
export function createSettingsStore(
  storage: StorageLike | null = defaultStorage(),
  firstBootDefaults?: (storage: StorageLike) => Partial<Settings>,
): SettingsStore {
  let persistent = storage !== null;
  let current: Settings = { ...DEFAULT_SETTINGS };
  if (storage) {
    try {
      const stored = storage.getItem(SETTINGS_STORAGE_KEY);
      if (stored !== null) current = sanitizeSettings(JSON.parse(stored));
      else if (firstBootDefaults)
        current = sanitizeSettings({ ...DEFAULT_SETTINGS, ...firstBootDefaults(storage) });
    } catch {
      persistent = false; // unreadable or corrupt: start from defaults
    }
  }
  const listeners = new Set<(s: Settings) => void>();

  return {
    get: () => current,
    isPersistent: () => persistent,
    update(patch) {
      current = sanitizeSettings({ ...current, ...patch });
      if (storage) {
        try {
          storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(current));
        } catch {
          persistent = false; // quota or private mode: keep working in memory
        }
      }
      for (const l of listeners) l(current);
      return current;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
