// M3D6 save code (phase 23): the same fields as M3D5, but `e` carries the multi-equip
// model ({vlm, avatar, decor}) instead of the old slot -> id map. An M3D5 code imports
// with the same items worn (its old `e` maps to the new model); a malformed `e` still
// rejects the code, and an unknown well-formed cosmetic id is dropped, as in M3D5.
import { describe, expect, it } from 'vitest';
import type { FactStat } from '../learning/learning-types';
import { newFactStat } from '../learning/leitner-box';
import type { GameSnapshot } from './progress-repository';
import {
  crc32Hex,
  decodeSaveCode,
  encodeSaveCodeV6,
  importOfDecodedSaveCode,
  SAVE_CODE_VERSION,
  SaveCodeError,
} from './save-code-codec';
import { newProfile } from './save-schema';

const AT = Date.UTC(2026, 9, 31, 8, 30, 15);
const audio = { sound: true, music: false };
const stat = (over: Partial<FactStat>): FactStat => ({ ...newFactStat(), lastSeenAt: AT, ...over });

function snapshot(): GameSnapshot {
  const profile = newProfile('p1');
  profile.settings.equipped = {
    vlm: { head: 'vlm-star-band', neck: 'vlm-red-scarf', back: 'vlm-starry-cape' },
    avatar: { head: 'avatar-blue-cap' },
    decor: ['decor-flower-pots', 'decor-fountain'],
  };
  return {
    profile,
    factStats: { 'mul:3x7': stat({ attempts: 9, correct: 7, totalMs: 41000, box: 3 }) },
    levelProgress: {},
    wallet: { xp: 10, coins: 5 },
    ownedCosmetics: [
      'vlm-star-band',
      'vlm-red-scarf',
      'vlm-starry-cape',
      'avatar-blue-cap',
      'decor-flower-pots',
      'decor-fountain',
    ],
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

describe('M3D6 save code', () => {
  it('is the version export writes', () => {
    expect(SAVE_CODE_VERSION).toBe(6);
    expect(encodeSaveCodeV6(snapshot(), audio)).toMatch(/^M3D6-[A-Za-z0-9_-]+-[0-9a-f]{8}$/);
  });

  it('round-trips three spots plus decor', () => {
    const { records } = importOfDecodedSaveCode(
      decodeSaveCode(encodeSaveCodeV6(snapshot(), audio)),
      AT,
    );
    expect(records.cosmetics?.equipped).toEqual({
      vlm: { head: 'vlm-star-band', neck: 'vlm-red-scarf', back: 'vlm-starry-cape' },
      avatar: { head: 'avatar-blue-cap' },
      decor: ['decor-flower-pots', 'decor-fountain'],
    });
    expect(records.cosmetics?.owned).toEqual(snapshot().ownedCosmetics);
  });

  it('round-trips chapter 3 level stars (market)', () => {
    const snap = snapshot();
    snap.levelProgress = {
      market: {
        profileId: 'p1',
        levelId: 'market',
        stars: 2,
        bestScore: 0,
        completedAt: AT,
        progress: 1,
        acceptedAt: AT,
        stageStars: [2],
      },
    };
    const { records } = importOfDecodedSaveCode(decodeSaveCode(encodeSaveCodeV6(snap, audio)), AT);
    expect(records.levels.market).toMatchObject({ stars: 2, progress: 1 });
  });

  it('an M3D5 code imports with the same items worn (old e maps to the new model)', () => {
    const payload = {
      o: ['vlm-red-scarf', 'avatar-gold-crown', 'decor-fountain'],
      e: {
        'vlm-outfit': 'vlm-red-scarf',
        'avatar-outfit': 'avatar-gold-crown',
        'village-decor': 'decor-fountain',
      },
    };
    const { records } = importOfDecodedSaveCode(decodeSaveCode(code(5, payload)), AT);
    expect(records.cosmetics?.equipped).toEqual({
      vlm: { neck: 'vlm-red-scarf' },
      avatar: { head: 'avatar-gold-crown' },
      decor: ['decor-fountain'],
    });
    expect(records.cosmetics?.owned).toEqual(payload.o);
  });

  it('an M3D5 code with the unequipped sentinel or an unknown id imports worn as nothing', () => {
    const payload = {
      o: ['vlm-red-scarf'],
      e: { 'vlm-outfit': 'none', 'avatar-outfit': 'retired-item' },
    };
    const { records } = importOfDecodedSaveCode(decodeSaveCode(code(5, payload)), AT);
    expect(records.cosmetics?.equipped).toEqual({ vlm: {}, avatar: {}, decor: [] });
  });

  it('drops an unknown well-formed cosmetic id from a v6 e; a malformed one rejects', () => {
    const good = {
      e: {
        vlm: { neck: 'zz-future-scarf', back: 'vlm-starry-cape' },
        avatar: {},
        decor: ['decor-fountain'],
      },
    };
    const { records } = importOfDecodedSaveCode(decodeSaveCode(code(6, good)), AT);
    expect(records.cosmetics?.equipped).toEqual({
      vlm: { back: 'vlm-starry-cape' },
      avatar: {},
      decor: ['decor-fountain'],
    });
  });

  it('drops a known item written in the wrong spot (its anchor never matches)', () => {
    const { records } = importOfDecodedSaveCode(
      decodeSaveCode(code(6, { e: { vlm: { neck: 'vlm-star-band' } } })),
      AT,
    );
    expect(records.cosmetics?.equipped).toEqual({ vlm: {}, avatar: {}, decor: [] });
  });

  it('rejects a malformed v6 e', () => {
    for (const bad of [
      { e: { vlm: { side: 'vlm-red-scarf' } } }, // unknown anchor key
      { e: { vlm: { neck: 'Bad Id!' } } }, // malformed id
      { e: { decor: 'decor-fountain' } }, // decor must be an array
      { e: { decor: ['decor-fountain', 'decor-fountain'] } }, // duplicate decor
      { e: { attic: {} } }, // unknown top-level key
      { e: { vlm: [] } }, // vlm must be an object
    ])
      expect(reason(() => decodeSaveCode(code(6, bad)))).not.toBe('no error');
  });

  it('a version 7 code is rejected', () => {
    expect(reason(() => decodeSaveCode(code(7, {})))).toBe('version');
  });
});
