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
  encodeSaveCodeV2,
  encodeSaveCodeV3,
  importOfDecodedSaveCode,
  MAX_SAVE_CODE_CHARS,
  SAVE_CODE_VERSION,
  SaveCodeError,
} from './save-code-codec';
import { SHIPPED_M3D2_CODE, SHIPPED_M3D2_IMPORT } from './save-code-shipped-m3d2-fixture';
import { M3D3_LEVELS } from './save-code-v3-payload';
import { newProfile } from './save-schema';

const AT = Date.UTC(2026, 9, 31, 8, 30, 15);
const AT_SEC_MS = Math.floor(AT / 1000) * 1000;
const audio = { sound: true, music: false };
const stat = (over: Partial<FactStat>): FactStat => ({ ...newFactStat(), lastSeenAt: AT, ...over });
const level = (levelId: string) => ({
  profileId: 'p1',
  levelId,
  stars: 2,
  bestScore: 200,
  completedAt: AT,
  progress: 0,
  acceptedAt: AT,
  stageStars: [2],
});

function snapshot(): GameSnapshot {
  return {
    profile: newProfile('p1'),
    factStats: {
      'mul:3x7': stat({ attempts: 9, correct: 7, totalMs: 41000, box: 3, errs: [20, 24] }),
      'sk:div-rem-ceil': stat({ attempts: 4, correct: 3, totalMs: 52000, box: 4, streak: 2 }),
      'sk:expr-brackets': stat({ attempts: 1, correct: 1, totalMs: 9000, box: 2, fluent: true }),
    },
    levelProgress: { bridge: level('bridge'), tower: level('tower'), garden: level('garden') },
    wallet: { xp: 10, coins: 5 },
    ownedCosmetics: [],
    sessionCount: 3,
    gameMeta: { table: 0, combo: 0, started: true },
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

describe('M3D3 save code', () => {
  it('is the version export writes', () => {
    expect(SAVE_CODE_VERSION).toBe(3);
    expect(encodeSaveCodeV3(snapshot(), audio)).toMatch(/^M3D3-[A-Za-z0-9_-]+-[0-9a-f]{8}$/);
  });

  it('round-trips skills next to facts and chapter-2 levels', () => {
    const { records } = importOfDecodedSaveCode(
      decodeSaveCode(encodeSaveCodeV3(snapshot(), audio)),
      AT,
    );
    const s = snapshot().factStats;
    expect(records.facts['sk:div-rem-ceil']).toEqual({
      ...s['sk:div-rem-ceil'],
      lastSeenAt: AT_SEC_MS,
    });
    expect(records.facts['sk:expr-brackets']).toEqual({
      ...s['sk:expr-brackets'],
      lastSeenAt: AT_SEC_MS,
    });
    expect(records.facts['mul:3x7']).toEqual({ ...s['mul:3x7'], lastSeenAt: AT_SEC_MS });
    expect(Object.keys(records.levels).sort()).toEqual(['bridge', 'garden', 'tower']);
  });

  it('knows every level a gate opens (a new gate needs a new version)', () => {
    for (const gate of LEVEL_GATES) expect(M3D3_LEVELS, gate.levelId).toContain(gate.levelId);
  });

  it('rejects unknown skills, unknown levels and malformed skill tuples', () => {
    const ok = ['div-rem-ceil', 1, 1, 100, 2, 1, 0];
    expect(reason(() => decodeSaveCode(code(3, { k: [ok] })))).toBe('no error');
    for (const payload of [
      { k: [['made-up-skill', 1, 1, 100, 2, 1, 0]] },
      { k: [['div-rem-ceil', 1, 2, 100, 2, 1, 0]] },
      { k: [['div-rem-ceil', 1, 1, 100, 6, 1, 0]] },
      { k: [['div-rem-ceil', 1, 1, 100, 2, 1, 0, 0, 0, []]] },
      { k: [ok, ok] },
      { k: 'div-rem-ceil' },
      { f: [['sk:div-rem-ceil', 1, 1, 100, 2, 1, 0]] },
      { l: { castle: [1, 0, 0, 0, 0] } },
    ])
      expect(
        reason(() => decodeSaveCode(code(3, payload))),
        JSON.stringify(payload),
      ).toBe('payload');
  });

  it('a full save (every fact, every skill, every level) stays copy-pasteable', () => {
    const s = snapshot();
    const full = stat({
      attempts: 120,
      correct: 99,
      totalMs: 987654,
      box: 5,
      streak: 12,
      fluent: true,
    });
    for (let a = 1; a <= 10; a++)
      for (let b = 1; b <= 10; b++) {
        s.factStats[mulKey(a, b)] = { ...full, lastSeenSession: 345, errs: [81, 72, 63] };
        s.factStats[`div:${a * b}/${b}`] = { ...full, lastSeenSession: 345 };
      }
    for (const { id } of SKILL_CATALOG)
      s.factStats[skillKey(id)] = { ...full, lastSeenSession: 345 };
    for (const id of M3D3_LEVELS) s.levelProgress[id] = level(id);
    s.ownedCosmetics = Array.from({ length: 12 }, (_, i) => `cosmetic-item-${i}`);
    const text = encodeSaveCodeV3(s, audio);
    expect(text.length).toBeLessThan(MAX_SAVE_CODE_CHARS);
    const { records } = importOfDecodedSaveCode(decodeSaveCode(text), AT);
    expect(Object.keys(records.facts)).toHaveLength(Object.keys(s.factStats).length);
  });
});

describe('M3D2 stays as shipped', () => {
  it('a shipped M3D2 code decodes exactly as before', () => {
    const decoded = decodeSaveCode(SHIPPED_M3D2_CODE);
    expect(decoded.version).toBe(2);
    expect(importOfDecodedSaveCode(decoded, 0)).toEqual(SHIPPED_M3D2_IMPORT);
  });

  it('M3D2 keeps its five levels and never carries skills', () => {
    const garden = { garden: [1, 0, 0, 0, 0] };
    expect(reason(() => decodeSaveCode(code(2, { l: garden })))).toBe('payload');
    expect(reason(() => decodeSaveCode(code(2, { k: [] })))).toBe('payload');
    const { records } = importOfDecodedSaveCode(
      decodeSaveCode(encodeSaveCodeV2(snapshot(), audio)),
      AT,
    );
    expect(Object.keys(records.facts)).toEqual(['mul:3x7']);
    expect(Object.keys(records.levels).sort()).toEqual(['bridge', 'tower']);
  });
});
