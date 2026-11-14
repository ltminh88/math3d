import { describe, expect, it } from 'vitest';
import { LEVEL_GATES } from '../config/level-gate-config';
import { mulKey, skillKey } from '../learning/fact-key';
import type { FactStat } from '../learning/learning-types';
import { newFactStat } from '../learning/leitner-box';
import { SKILL_CATALOG } from '../learning/skill-catalog';
import type { GameSnapshot } from './progress-repository';
import {
  crc32Hex,
  decodeSaveCode,
  encodeSaveCodeV4,
  importOfDecodedSaveCode,
  MAX_SAVE_CODE_CHARS,
  SAVE_CODE_VERSION,
  SaveCodeError,
} from './save-code-codec';
import { SHIPPED_M3D2_CODE, SHIPPED_M3D2_IMPORT } from './save-code-shipped-m3d2-fixture';
import { SHIPPED_M3D3_CODE, SHIPPED_M3D3_IMPORT } from './save-code-shipped-m3d3-fixture';
import { M3D3_LEVELS } from './save-code-v3-payload';
import { newProfile } from './save-schema';

const AT = Date.UTC(2026, 9, 31, 8, 30, 15);
const audio = { sound: true, music: false };
const stat = (over: Partial<FactStat>): FactStat => ({ ...newFactStat(), lastSeenAt: AT, ...over });
const level = (levelId: string, stageStars: readonly number[] = [2]) => ({
  profileId: 'p1',
  levelId,
  stars: stageStars[0] ?? 0,
  bestScore: 200,
  completedAt: AT,
  progress: 0,
  acceptedAt: AT,
  stageStars: [...stageStars],
});

function snapshot(): GameSnapshot {
  return {
    profile: newProfile('p1'),
    factStats: {
      'mul:3x7': stat({ attempts: 9, correct: 7, totalMs: 41000, box: 3, errs: [20, 24] }),
      'sk:div-rem-ceil': stat({ attempts: 4, correct: 3, totalMs: 52000, box: 4, streak: 2 }),
      'sk:expr-brackets': stat({ attempts: 1, correct: 1, totalMs: 9000, box: 2, fluent: true }),
    },
    levelProgress: {
      bridge: level('bridge'),
      field: level('field', [3, 2, 1]),
      tower: level('tower', [1]),
      garden: level('garden', [2, 0, 3]),
    },
    wallet: { xp: 10, coins: 5 },
    ownedCosmetics: [],
    sessionCount: 3,
    gameMeta: { table: 0, combo: 0, started: true },
    daily: { lastDailyDay: 20345, dailyStreak: 7 },
  };
}

const reason = (fn: () => unknown): string => {
  try {
    fn();
  } catch (err) {
    if (err instanceof SaveCodeError) return err.reason;
    throw err;
  }
  return 'no error';
};
const b64url = (text: string): string =>
  btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const code = (version: number, payload: unknown): string => {
  const p = b64url(JSON.stringify(payload));
  return `M3D${version}-${p}-${crc32Hex(p)}`;
};

describe('M3D4 save code', () => {
  it('is the version export writes', () => {
    expect(SAVE_CODE_VERSION).toBe(4);
    expect(encodeSaveCodeV4(snapshot(), audio)).toMatch(/^M3D4-[A-Za-z0-9_-]+-[0-9a-f]{8}$/);
  });

  it('round-trips stage stars and the daily fields', () => {
    const { records } = importOfDecodedSaveCode(
      decodeSaveCode(encodeSaveCodeV4(snapshot(), audio)),
      AT,
    );
    expect(records.levels.field?.stageStars).toEqual([3, 2, 1]);
    expect(records.levels.garden?.stageStars).toEqual([2, 0, 3]);
    expect(records.levels.tower?.stageStars).toEqual([1]);
    expect(records.daily).toEqual({ lastDailyDay: 20345, dailyStreak: 7 });
    expect(records.levels.bridge?.stageStars).toEqual([2]);
  });

  it('omits t and d when there is nothing beyond stage 1 and no daily run', () => {
    const plain = snapshot();
    plain.levelProgress = {
      bridge: level('bridge', [2]),
      tower: level('tower', [0]),
    };
    plain.daily = undefined;
    const { records } = importOfDecodedSaveCode(decodeSaveCode(encodeSaveCodeV4(plain, audio)), AT);
    expect(records.levels.bridge?.stageStars).toEqual([2]);
    expect(records.levels.tower?.stageStars).toEqual([]);
    expect(records.daily).toBeUndefined();
  });

  it('knows every level a gate opens (a new gate needs a new version)', () => {
    for (const gate of LEVEL_GATES) expect(M3D3_LEVELS, gate.levelId).toContain(gate.levelId);
  });

  it('repairs a drifted stage-1 entry to the level stars on import', () => {
    const base = { l: { field: [2, 0, 0, 0, 0] } };
    const { records } = importOfDecodedSaveCode(
      decodeSaveCode(code(4, { ...base, t: { field: [1, 1] } })),
      AT,
    );
    expect(records.levels.field?.stageStars).toEqual([2, 1]);
  });

  it('rejects unknown levels and malformed daily fields', () => {
    const base = { l: { field: [2, 0, 0, 0, 0] } };
    expect(reason(() => decodeSaveCode(code(4, { ...base, t: { field: [2, 1] } })))).toBe(
      'no error',
    );
    for (const payload of [
      { ...base, t: { castle: [1] } },
      { ...base, t: { field: [2, 4] } }, // star out of range
      { ...base, t: { field: [] } },
      { ...base, t: { field: [2, 1, 1, 1, 1, 1, 1, 1, 1] } }, // longer than the cap
      { ...base, t: 'field' },
      { ...base, d: [20345] },
      { ...base, d: [20345, -1] },
      { ...base, d: [20345, 7, 1] },
      { ...base, d: '20345' },
      { ...base, t: { field: [2, 1] }, k: [['made-up-skill', 1, 1, 100, 2, 1, 0]] },
    ])
      expect(reason(() => decodeSaveCode(code(4, payload)))).not.toBe('no error');
    // `t` and `d` are not M3D3 fields: a v3 code carrying them is rejected.
    expect(reason(() => decodeSaveCode(code(3, { ...base, t: { field: [2, 1] } })))).toBe(
      'payload',
    );
    expect(reason(() => decodeSaveCode(code(3, { ...base, d: [20345, 7] })))).toBe('payload');
  });

  it('a maxed-out save (all facts, skills and stages) stays under the cap', () => {
    const full: FactStat = {
      ...newFactStat(),
      attempts: 99,
      correct: 99,
      totalMs: 987654,
      box: 5,
      streak: 12,
      fluent: true,
    };
    const s = snapshot();
    for (let a = 1; a <= 10; a++)
      for (let b = 1; b <= 10; b++) {
        s.factStats[mulKey(a, b)] = { ...full, lastSeenSession: 345, errs: [81, 72, 63] };
        s.factStats[`div:${a * b}/${b}`] = { ...full, lastSeenSession: 345 };
      }
    for (const { id } of SKILL_CATALOG)
      s.factStats[skillKey(id)] = { ...full, lastSeenSession: 345 };
    for (const id of M3D3_LEVELS)
      s.levelProgress[id] = level(id, id === 'cave' ? [3, 3, 3, 3, 3] : [3, 3, 3, 3, 3, 3]);
    s.ownedCosmetics = Array.from({ length: 12 }, (_, i) => `cosmetic-item-${i}`);
    s.daily = { lastDailyDay: 99999, dailyStreak: 9999 };
    const text = encodeSaveCodeV4(s, audio);
    expect(text.length).toBeLessThan(MAX_SAVE_CODE_CHARS);
    const { records } = importOfDecodedSaveCode(decodeSaveCode(text), AT);
    expect(records.levels.cave?.stageStars).toEqual([3, 3, 3, 3, 3]);
    expect(records.daily).toEqual({ lastDailyDay: 99999, dailyStreak: 9999 });
    expect(Object.keys(records.facts)).toHaveLength(Object.keys(s.factStats).length);
  });
});

describe('M3D1/M3D2/M3D3 still decode exactly as shipped', () => {
  it('a shipped M3D2 code decodes exactly as before', () => {
    const decoded = decodeSaveCode(SHIPPED_M3D2_CODE);
    expect(decoded.version).toBe(2);
    expect(importOfDecodedSaveCode(decoded, 0)).toEqual(SHIPPED_M3D2_IMPORT);
  });

  it('a shipped M3D3 code decodes exactly as before', () => {
    const decoded = decodeSaveCode(SHIPPED_M3D3_CODE);
    expect(decoded.version).toBe(3);
    expect(importOfDecodedSaveCode(decoded, 0)).toEqual(SHIPPED_M3D3_IMPORT);
  });

  it('a version 5 code is rejected', () => {
    expect(reason(() => decodeSaveCode(code(5, {})))).toBe('version');
  });
});
