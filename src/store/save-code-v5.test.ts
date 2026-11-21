// M3D5 save code (phase 03): the one lenient bump. A well-formed skill/level id that is not
// in the catalog/level set yet is dropped, not rejected — so one version covers all future
// family/level ids. A malformed id still rejects the code, and v1–v4 decoding is frozen.
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
  encodeSaveCodeV5,
  importOfDecodedSaveCode,
  MAX_SAVE_CODE_CHARS,
  SAVE_CODE_VERSION,
  SaveCodeError,
} from './save-code-codec';
import { SHIPPED_M3D3_CODE, SHIPPED_M3D3_IMPORT } from './save-code-shipped-m3d3-fixture';
import { SHIPPED_M3D4_CODE, SHIPPED_M3D4_IMPORT } from './save-code-shipped-m3d4-fixture';
import { M3D3_LEVELS } from './save-code-v3-payload';
import { MAX_SKILL_TUPLES } from './save-code-v5-skills-lenient';
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
const tuple = (id: string): unknown[] => [id, 1, 1, 100, 2, 1, 0];

describe('M3D5 save code', () => {
  it('is the version export writes', () => {
    expect(SAVE_CODE_VERSION).toBe(5);
    expect(encodeSaveCodeV5(snapshot(), audio)).toMatch(/^M3D5-[A-Za-z0-9_-]+-[0-9a-f]{8}$/);
  });

  it('round-trips stage stars and the daily fields like M3D4', () => {
    const { records } = importOfDecodedSaveCode(
      decodeSaveCode(encodeSaveCodeV5(snapshot(), audio)),
      AT,
    );
    expect(records.levels.field?.stageStars).toEqual([3, 2, 1]);
    expect(records.levels.garden?.stageStars).toEqual([2, 0, 3]);
    expect(records.levels.tower?.stageStars).toEqual([1]);
    expect(records.daily).toEqual({ lastDailyDay: 20345, dailyStreak: 7 });
    expect(records.levels.bridge?.stageStars).toEqual([2]);
    expect(records.facts['sk:div-rem-ceil']?.attempts).toBe(4);
  });

  it('drops an unknown well-formed skill id, other stats intact', () => {
    const payload = {
      l: { field: [2, 0, 0, 0, 0] },
      k: [
        ['zz-future-skill', 4, 3, 52000, 4, 0, 1793435415, 2],
        ['div-rem-ceil', 4, 3, 52000, 4, 0, 1793435415, 2],
      ],
    };
    const { records } = importOfDecodedSaveCode(decodeSaveCode(code(5, payload)), AT);
    expect(records.facts['sk:div-rem-ceil']?.attempts).toBe(4);
    expect(records.facts).not.toHaveProperty('sk:zz-future-skill');
    expect(records.levels.field?.stars).toBe(2);
  });

  it('still rejects a malformed skill tuple', () => {
    const base = { l: { field: [2, 0, 0, 0, 0] } };
    for (const k of [
      [['Bad Id!', 1, 1, 100, 2, 1, 0]],
      [['zz-future-skill', 1, 1, 100, 9, 1, 0]], // box out of range
      [['zz-future-skill', 1, 2, 100, 2, 1, 0]], // correct > attempts
      [['zz-future-skill', 1, 1, 100, 2, 1]], // too short
      [['zz-future-skill', 1, 1, 100, 2, 1, 0, 0, 0, 0]], // too long
      [
        ['div-rem-ceil', 1, 1, 100, 2, 1, 0],
        ['div-rem-ceil', 1, 1, 100, 2, 1, 0],
      ], // repeat
      [['x', 1, 1, 100, 2, 1, 0]], // one-letter id is not well-formed
    ])
      expect(reason(() => decodeSaveCode(code(5, { ...base, k })))).not.toBe('no error');
  });

  it('drops an unknown well-formed level id from l and t; a malformed one rejects', () => {
    const good = {
      l: { field: [2, 0, 0, 0, 0], 'future-market': [1, 100, 1793435415, 0, 1793435415] },
      t: { field: [2, 1], 'future-market': [1, 2] },
    };
    const { records } = importOfDecodedSaveCode(decodeSaveCode(code(5, good)), AT);
    expect(records.levels.field?.stageStars).toEqual([2, 1]);
    expect(records.levels).not.toHaveProperty('future-market');
    for (const payload of [
      { l: { field: [2, 0, 0, 0, 0], 'Bad Level!': [1, 100, 0, 0, 0] } },
      { l: { field: [2, 0, 0, 0, 0] }, t: { 'Bad Level!': [1] } },
      { l: { field: [2, 0, 0, 0, 0], 'future-market': [9, 0, 0, 0, 0] } }, // bad stars
      { l: { field: [2, 0, 0, 0, 0] }, t: { 'future-market': [9] } }, // bad stage star
    ])
      expect(reason(() => decodeSaveCode(code(5, payload)))).not.toBe('no error');
  });

  it('round-trips the full catalog (a real skill is never silently dropped)', () => {
    const s = snapshot();
    for (const { id } of SKILL_CATALOG)
      s.factStats[skillKey(id)] = { ...stat({}), attempts: 3, correct: 2 };
    const { records } = importOfDecodedSaveCode(decodeSaveCode(encodeSaveCodeV5(s, audio)), AT);
    for (const { id } of SKILL_CATALOG) expect(records.facts[skillKey(id)]?.attempts, id).toBe(3);
  });

  it('caps skill tuples at 512, checked before iterating', () => {
    expect(MAX_SKILL_TUPLES).toBe(512);
    // Two-letter ids keep even 513 tuples under the 16 KB code limit, so the tuple cap —
    // not the length check — is what rejects.
    const many = (n: number): unknown[] =>
      Array.from({ length: n }, (_, i) => [
        String.fromCharCode(97 + Math.floor(i / 26), 97 + (i % 26)),
        1,
        1,
        1,
        2,
        1,
        0,
      ]);
    expect(reason(() => decodeSaveCode(code(5, { k: many(513) })))).toBe('payload');
    const { records } = importOfDecodedSaveCode(decodeSaveCode(code(5, { k: many(512) })), AT);
    expect(Object.keys(records.facts)).toHaveLength(0);
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
    const text = encodeSaveCodeV5(s, audio);
    expect(text.length).toBeLessThan(MAX_SAVE_CODE_CHARS);
    const { records } = importOfDecodedSaveCode(decodeSaveCode(text), AT);
    expect(records.levels.cave?.stageStars).toEqual([3, 3, 3, 3, 3]);
    expect(records.daily).toEqual({ lastDailyDay: 99999, dailyStreak: 9999 });
    expect(Object.keys(records.facts)).toHaveLength(Object.keys(s.factStats).length);
  });
});

describe('M3D1/M3D3/M3D4 still decode exactly as shipped', () => {
  it('a shipped M3D3 code decodes exactly as before', () => {
    const decoded = decodeSaveCode(SHIPPED_M3D3_CODE);
    expect(decoded.version).toBe(3);
    expect(importOfDecodedSaveCode(decoded, 0)).toEqual(SHIPPED_M3D3_IMPORT);
  });

  it('a shipped M3D4 code decodes exactly as before', () => {
    const decoded = decodeSaveCode(SHIPPED_M3D4_CODE);
    expect(decoded.version).toBe(4);
    expect(importOfDecodedSaveCode(decoded, 0)).toEqual(SHIPPED_M3D4_IMPORT);
  });

  it('a frozen M3D5 code decodes to the same import as its M3D4 twin', () => {
    // Same snapshot as the M3D4 fixture, encoded by the M3D5 exporter: the payload is
    // identical, only the version prefix changed. Frozen: the M3D5 exporter must keep
    // writing exactly this for that snapshot.
    const code5 = [
      'M3D5-eyJ4IjoxMCwiYyI6NSwiZyI6WzAsMCwxXSwicyI6WzEsMF0sIm4iOjMsImwiOnsiYnJpZGdl',
      'IjpbMiwyMDAsMTc5MzQzNTQxNSwwLDE3OTM0MzU0MTVdLCJmaWVsZCI6WzMsMjAwLDE3OTM0MzU0MT',
      'UsMCwxNzkzNDM1NDE1XSwidG93ZXIiOlsxLDIwMCwxNzkzNDM1NDE1LDAsMTc5MzQzNTQxNV0sImdh',
      'cmRlbiI6WzIsMjAwLDE3OTM0MzU0MTUsMCwxNzkzNDM1NDE1XX0sImYiOltbIjN4NyIsOSw3LDQx',
      'MDAwLDMsMCwxNzkzNDM1NDE1LDAsMCxbMjAsMjRdXV0sImsiOltbImRpdi1yZW0tY2VpbCIsNCwz',
      'LDUyMDAwLDQsMCwxNzkzNDM1NDE1LDJdLFsiZXhwci1icmFja2V0cyIsMSwxLDkwMDAsMiwwLDE3',
      'OTM0MzU0MTUsMCwxXV0sInQiOnsiZmllbGQiOlszLDIsMV0sImdhcmRlbiI6WzIsMCwzXX0sImQi',
      'OlsyMDM0NSw3XX0-3ee317cd',
    ].join('');
    const decoded = decodeSaveCode(code5);
    expect(decoded.version).toBe(5);
    expect(importOfDecodedSaveCode(decoded, 0)).toEqual(SHIPPED_M3D4_IMPORT);
  });

  it('a v4 code with an unknown id still rejects (format frozen)', () => {
    const base = { l: { field: [2, 0, 0, 0, 0] } };
    expect(
      reason(() => decodeSaveCode(code(4, { ...base, k: [tuple('zz-future-skill')] }))),
    ).not.toBe('no error');
    expect(
      reason(() =>
        decodeSaveCode(code(4, { l: { ...base.l, 'future-market': [1, 100, 0, 0, 0] } })),
      ),
    ).not.toBe('no error');
    expect(
      reason(() => decodeSaveCode(code(4, { ...base, t: { 'future-market': [1] } }))),
    ).not.toBe('no error');
  });

  it('a version 6 code is rejected', () => {
    expect(reason(() => decodeSaveCode(code(6, {})))).toBe('version');
  });

  it('knows every level a gate opens (a new gate needs no new version now)', () => {
    for (const gate of LEVEL_GATES) expect(M3D3_LEVELS, gate.levelId).toContain(gate.levelId);
  });
});
