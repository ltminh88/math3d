import { describe, expect, it } from 'vitest';
import { newFactStat } from '../learning/leitner-box';
import { defaultSave } from '../save/save-storage';
import { mapSaveV1ToProgress } from './legacy-save-import';
import type { GameSnapshot } from './progress-repository';
import {
  crc32Hex,
  decodeSaveCode,
  encodeSaveCode,
  MAX_SAVE_CODE_CHARS,
  SaveCodeError,
} from './save-code-codec';
import { newProfile } from './save-schema';
import { snapshotToSaveV1 } from './store-to-save-v1';

const AT = Date.UTC(2026, 9, 20, 8, 30, 15);

function snapshot(): GameSnapshot {
  const stat = (attempts: number, correct: number, box: number, totalMs: number) => ({
    ...newFactStat(),
    attempts,
    correct,
    box,
    totalMs,
    lastSeenAt: AT,
  });
  return {
    profile: { ...newProfile('p1'), avatarId: 'girl' },
    factStats: {
      'mul:2x8': stat(3, 2, 2, 4800),
      'mul:1x6': stat(1, 1, 3, 900),
      'mul:7x9': stat(4, 1, 1, 12000),
      'mul:9x9': stat(6, 6, 5, 6000),
    },
    levelProgress: {
      bridge: {
        profileId: 'p1',
        levelId: 'bridge',
        stars: 1,
        bestScore: 0,
        completedAt: AT,
        progress: 6,
        acceptedAt: AT,
      },
    },
    wallet: { xp: 1230, coins: 415 },
    ownedCosmetics: [],
    sessionCount: 3,
    gameMeta: { table: 7, combo: 4, started: true },
  };
}

const b64url = (text: string): string =>
  btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const errorReason = (fn: () => unknown): string => {
  try {
    fn();
  } catch (err) {
    if (err instanceof SaveCodeError) return err.reason;
    throw err;
  }
  return 'no error';
};

describe('save code codec', () => {
  it('crc32 matches the standard check value', () => {
    expect(crc32Hex('123456789')).toBe('cbf43926');
  });

  it('round-trips a store snapshot to identical progress', () => {
    const { save, boxes } = snapshotToSaveV1(snapshot(), { sound: false, music: true });
    const code = encodeSaveCode(save, boxes);
    expect(code).toMatch(/^M3D1-[A-Za-z0-9_-]+-[0-9a-f]{8}$/);
    expect(code.length).toBeLessThan(2048);

    const decoded = decodeSaveCode(code);
    expect(decoded.save).toEqual(save);
    const records = mapSaveV1ToProgress(decoded.save, AT, decoded.boxes);
    expect(records.wallet).toEqual({ xp: 1230, coins: 415 });
    expect(records.avatarId).toBe('girl');
    expect(records.levels.bridge).toMatchObject({ progress: 6, stars: 1 });
    expect(records.gameMeta).toEqual({ table: 7, combo: 4, started: true });
    for (const [key, fact] of Object.entries(snapshot().factStats)) {
      expect(records.facts[key], key).toMatchObject({
        attempts: fact.attempts,
        correct: fact.correct,
        box: fact.box,
        lastSeenAt: Math.floor(AT / 1000) * 1000,
      });
    }
    expect(decoded.save).toMatchObject({ sound: false, music: true });
  });

  it('accepts whitespace and line breaks pasted into the code', () => {
    const code = encodeSaveCode(defaultSave(), {});
    const spaced = ` ${code.slice(0, 10)}\n${code.slice(10)} `;
    expect(decodeSaveCode(spaced).save).toEqual(defaultSave());
  });

  it('a full 90-fact save still fits a chat message', () => {
    const save = defaultSave();
    for (let a = 2; a <= 10; a++)
      for (let b = 1; b <= 10; b++)
        save.questionStats[`m${a}_${b}`] = {
          attempts: 120,
          correct: 99,
          wrong: 21,
          responseTime: 12345,
          lastAnsweredAt: new Date(AT).toISOString(),
        };
    const code = encodeSaveCode({ ...save, xp: 9999999, coins: 9999999 }, {});
    expect(code.length).toBeLessThan(MAX_SAVE_CODE_CHARS);
    expect(Object.keys(decodeSaveCode(code).save.questionStats)).toHaveLength(90);
  });

  it('rejects typos, truncation, wrong prefix, bad checksum and oversize with a reason', () => {
    const code = encodeSaveCode(
      snapshotToSaveV1(snapshot(), { sound: true, music: false }).save,
      {},
    );
    const mid = code.indexOf('-') + 8;
    const typo = code.slice(0, mid) + (code[mid] === 'A' ? 'B' : 'A') + code.slice(mid + 1);
    expect(errorReason(() => decodeSaveCode(typo))).toBe('checksum');
    expect(errorReason(() => decodeSaveCode(code.slice(0, -3)))).toBe('format');
    expect(['format', 'checksum']).toContain(
      errorReason(() => decodeSaveCode(code.slice(0, code.length - 20))),
    );
    expect(errorReason(() => decodeSaveCode(`X${code.slice(1)}`))).toBe('prefix');
    expect(errorReason(() => decodeSaveCode(code.replace('M3D1-', 'M3D2-')))).toBe('version');
    expect(errorReason(() => decodeSaveCode(`${code.slice(0, -8)}00000000`))).toBe('checksum');
    expect(
      errorReason(() => decodeSaveCode(`M3D1-${'A'.repeat(MAX_SAVE_CODE_CHARS)}-00000000`)),
    ).toBe('too-long');
    expect(errorReason(() => decodeSaveCode(''))).toBe('format');
  });

  it('rejects a well-checksummed payload that is not a save', () => {
    for (const json of ['[1]', '{"x":"lots"}', '{"f":[[2,3,"x"]]}', 'not json']) {
      const payload = b64url(json);
      expect(
        errorReason(() => decodeSaveCode(`M3D1-${payload}-${crc32Hex(payload)}`)),
        json,
      ).toBe('payload');
    }
  });

  it('clamps forged values through the v1 validator', () => {
    const json = JSON.stringify({ x: -5, c: 1e12, b: 99, t: 13, f: [[7, 8, 2, 1, 50, 0, 9]] });
    const payload = b64url(json);
    const { save, boxes } = decodeSaveCode(`M3D1-${payload}-${crc32Hex(payload)}`);
    expect(save).toMatchObject({ xp: 0, coins: 10000000, bridge: 6, table: 0 });
    expect(save.questionStats.m7_8).toMatchObject({ correct: 2, wrong: 1, attempts: 3 });
    expect(boxes).toEqual({});
  });
});

describe('decodeSaveCode outside the Date range', () => {
  it('a well-checksummed fact time no Date can hold is a payload error, not a RangeError', () => {
    for (const seenSec of [8.64e12 + 1, 1e15]) {
      const payload = b64url(JSON.stringify({ f: [[7, 8, 2, 1, 50, seenSec]] }));
      expect(errorReason(() => decodeSaveCode(`M3D1-${payload}-${crc32Hex(payload)}`))).toBe(
        'payload',
      );
    }
    const edge = b64url(JSON.stringify({ f: [[7, 8, 2, 1, 50, 8.64e12]] }));
    expect(decodeSaveCode(`M3D1-${edge}-${crc32Hex(edge)}`).save.questionStats.m7_8).toBeDefined();
  });
});
