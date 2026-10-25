import { describe, expect, it } from 'vitest';
import {
  LIVE_SAVE_MID_QUEST,
  LIVE_SAVE_QUEST_COMPLETE,
} from '../../tests/e2e/legacy-live-save-fixtures';
import { newFactStat } from '../learning/leitner-box';
import { decodeSaveV1 } from '../save/save-storage';
import type { SaveV1 } from '../save/save-types';
import type { GameSnapshot } from './progress-repository';
import {
  decodeSaveCode,
  encodeSaveCode,
  encodeSaveCodeV2,
  importOfDecodedSaveCode,
  MAX_SAVE_CODE_CHARS,
  SaveCodeError,
} from './save-code-codec';
import { newProfile } from './save-schema';

const AT = Date.UTC(2026, 9, 20, 8, 30, 15);
const AT_SEC_MS = Math.floor(AT / 1000) * 1000;

const level = (levelId: string, stars: number, progress = 0) => ({
  profileId: 'p1',
  levelId,
  stars,
  bestScore: stars * 100,
  completedAt: stars > 0 ? AT : 0,
  progress,
  acceptedAt: AT,
});

function snapshot(): GameSnapshot {
  return {
    profile: {
      ...newProfile('p1'),
      avatarId: 'girl',
      settings: { equipped: { 'avatar-outfit': 'avatar-gold-crown', 'vlm-outfit': 'none' } },
    },
    factStats: {
      'mul:3x7': {
        ...newFactStat(),
        attempts: 9,
        correct: 7,
        totalMs: 41000,
        box: 3,
        lastSeenSession: 11,
        lastSeenAt: AT,
        streak: 2,
        fluent: true,
        errs: [20, 24],
      },
      'div:21/3': {
        ...newFactStat(),
        attempts: 2,
        correct: 1,
        totalMs: 9000,
        box: 1,
        lastSeenAt: AT,
      },
    },
    levelProgress: {
      bridge: level('bridge', 1, 6),
      field: level('field', 2),
      forest: level('forest', 1),
      city: level('city', 3),
      tower: level('tower', 1),
    },
    wallet: { xp: 1230, coins: 415 },
    ownedCosmetics: ['avatar-gold-crown', 'decor-fountain'],
    sessionCount: 12,
    gameMeta: { table: 7, combo: 4, started: true },
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
describe('M3D2 save code', () => {
  it('round-trips levels, cosmetics, equipped items, facts, wallet, meta and audio', () => {
    const code = encodeSaveCodeV2(snapshot(), { sound: false, music: true });
    expect(code).toMatch(/^M3D2-[A-Za-z0-9_-]+-[0-9a-f]{8}$/);
    const { records, audio } = importOfDecodedSaveCode(decodeSaveCode(code), AT);
    expect(audio).toEqual({ sound: false, music: true });
    expect(records.avatarId).toBe('girl');
    expect(records.wallet).toEqual({ xp: 1230, coins: 415 });
    expect(records.gameMeta).toEqual({ table: 7, combo: 4, started: true });
    expect(records.sessionCount).toBe(12);
    for (const [id, l] of Object.entries(snapshot().levelProgress)) {
      const { profileId: _p, levelId: _l, ...rest } = l;
      expect(records.levels[id], id).toEqual({
        ...rest,
        completedAt: rest.completedAt && AT_SEC_MS,
        acceptedAt: AT_SEC_MS,
      });
    }
    expect(records.cosmetics).toEqual({
      owned: ['avatar-gold-crown', 'decor-fountain'],
      equipped: { 'avatar-outfit': 'avatar-gold-crown', 'vlm-outfit': 'none' },
    });
    expect(records.facts['mul:3x7']).toEqual({
      ...snapshot().factStats['mul:3x7'],
      lastSeenAt: AT_SEC_MS,
    });
    expect(records.facts['div:21/3']).toEqual({
      ...snapshot().factStats['div:21/3'],
      lastSeenAt: AT_SEC_MS,
    });
  });

  it('a full save (every curriculum fact, all levels, all items) stays copy-pasteable', () => {
    const s = snapshot();
    for (let a = 1; a <= 10; a++)
      for (let b = 1; b <= 10; b++) {
        const stat = { ...newFactStat(), attempts: 120, correct: 99, totalMs: 987654, box: 5 };
        s.factStats[`mul:${Math.min(a, b)}x${Math.max(a, b)}`] = {
          ...stat,
          lastSeenSession: 345,
          lastSeenAt: AT,
          streak: 12,
          fluent: true,
          errs: [81, 72, 63],
        };
        s.factStats[`div:${a * b}/${b}`] = { ...stat, lastSeenSession: 345, lastSeenAt: AT };
      }
    s.ownedCosmetics = Array.from({ length: 12 }, (_, i) => `cosmetic-item-${i}`);
    s.wallet = { xp: 9_999_999, coins: 9_999_999 };
    const code = encodeSaveCodeV2(s, { sound: true, music: true });
    expect(code.length).toBeLessThanOrEqual(MAX_SAVE_CODE_CHARS);
    const { records } = importOfDecodedSaveCode(decodeSaveCode(code), AT);
    expect(Object.keys(records.facts)).toHaveLength(Object.keys(s.factStats).length);
  });

  it('old M3D1 codes (live fixtures) still decode exactly as before', () => {
    for (const raw of [LIVE_SAVE_MID_QUEST, LIVE_SAVE_QUEST_COMPLETE]) {
      const save = decodeSaveV1(raw, { cap: false }) as SaveV1;
      const decoded = decodeSaveCode(encodeSaveCode(save, {}));
      expect(decoded.version).toBe(1);
      // M3D1 always stored answer times in whole seconds.
      const toSec = (iso: string) =>
        new Date(Math.floor(Date.parse(iso) / 1000) * 1000).toISOString();
      const stats = Object.entries(save.questionStats).map(([id, st]) => [
        id,
        { ...st, lastAnsweredAt: toSec(st.lastAnsweredAt) },
      ]);
      if (decoded.version === 1)
        expect(decoded.save).toEqual({ ...save, questionStats: Object.fromEntries(stats) });
      const { records, audio } = importOfDecodedSaveCode(decoded, AT);
      expect(audio).toEqual({ sound: save.sound, music: save.music });
      expect(records.wallet).toEqual({ xp: save.xp, coins: save.coins });
      expect(records.cosmetics).toBeUndefined();
    }
  });

  it('a tampered payload fails the checksum', () => {
    const code = encodeSaveCodeV2(snapshot(), { sound: true, music: false });
    const i = 12;
    const typo = code.slice(0, i) + (code[i] === 'A' ? 'B' : 'A') + code.slice(i + 1);
    expect(reason(() => decodeSaveCode(typo))).toBe('checksum');
    expect(reason(() => decodeSaveCode(code.replace('M3D2-', 'M3D9-')))).toBe('version');
  });
});
