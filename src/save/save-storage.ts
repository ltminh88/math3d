// v1 save: defaults, defensive parsing and localStorage persistence (recovered verbatim).
import { BRIDGE_SEGMENTS, SAVE_KEY, TABLES } from '../config/world-constants';
import { type SaveV1, STAT_KEY_PATTERN } from './save-types';

/** Upper bound of the parsed questionStats / review lists (original quirk, fixed in phase 12). */
const MAX_PARSED_ENTRIES = 30;

/** Fresh save. Literal order defines the JSON key order written to localStorage. */
export const defaultSave = (): SaveV1 => ({
  version: 1,
  xp: 0,
  coins: 0,
  bridge: 0,
  questAccepted: false,
  questComplete: false,
  avatar: 'boy',
  table: 0,
  sound: true,
  music: false,
  combo: 0,
  questionStats: {},
  review: [],
  started: false,
});

/** Finite numbers floored and clamped to [0, max]; anything else becomes 0. */
export const clampInt = (value: unknown, max = 10000000): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.min(max, Math.floor(value)));
  }
  return 0;
};

type Loose = Record<string, unknown>;

/**
 * Parses a stored save string. Any version other than 1, bad JSON or a non-object resets to
 * defaults. Only the first 30 questionStats entries are inspected and at most 30 review ids
 * are kept (original behaviour).
 */
export function parseSave(raw: string | null | undefined): SaveV1 {
  const save = defaultSave();
  if (!raw) {
    return save;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !('version' in parsed) || parsed.version !== 1) {
      return save;
    }
    const data = parsed as Loose;
    save.xp = clampInt(data.xp);
    save.coins = clampInt(data.coins);
    save.bridge = clampInt(data.bridge, BRIDGE_SEGMENTS);
    save.questAccepted = data.questAccepted === true || save.bridge > 0;
    save.questComplete = data.questComplete === true && save.bridge === BRIDGE_SEGMENTS;
    save.avatar = data.avatar === 'girl' ? 'girl' : 'boy';
    save.table = TABLES.includes(data.table as number) ? (data.table as number) : 0;
    save.sound = data.sound !== false;
    save.music = data.music === true;
    save.started = data.started === true;
    save.combo = clampInt(data.combo, 10000);
    if (data.questionStats && typeof data.questionStats === 'object') {
      const entries = Object.entries(data.questionStats).slice(0, MAX_PARSED_ENTRIES);
      for (const [key, value] of entries) {
        if (!STAT_KEY_PATTERN.test(key) || !value || typeof value !== 'object') {
          continue;
        }
        const stat = value as Loose;
        const correct = clampInt(stat.correct);
        const wrong = clampInt(stat.wrong);
        save.questionStats[key] = {
          attempts: correct + wrong,
          correct,
          wrong,
          responseTime: clampInt(stat.responseTime),
          lastAnsweredAt:
            typeof stat.lastAnsweredAt === 'string' ? stat.lastAnsweredAt.slice(0, 40) : '',
        };
      }
    }
    if (Array.isArray(data.review)) {
      save.review = [
        ...new Set(
          data.review.filter(
            (id): id is string => typeof id === 'string' && STAT_KEY_PATTERN.test(id),
          ),
        ),
      ].slice(0, MAX_PARSED_ENTRIES);
    }
    return save;
  } catch {
    return save;
  }
}

/** Reads the save from localStorage; storage errors fall back to defaults. */
export function loadSave(): SaveV1 {
  try {
    return parseSave(localStorage.getItem(SAVE_KEY));
  } catch {
    return defaultSave();
  }
}

/** Writes the save; returns false when storage is unavailable or full. */
export function writeSave(save: SaveV1): boolean {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    return true;
  } catch {
    return false;
  }
}
