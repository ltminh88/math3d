import { describe, expect, it } from 'vitest';
import { crc32Hex, decodeSaveCode, SaveCodeError } from './save-code-codec';

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
const v2Code = (payload: unknown): string => {
  const p = b64url(JSON.stringify(payload));
  return `M3D2-${p}-${crc32Hex(p)}`;
};

describe('M3D2 save code validation', () => {
  it('rejects oversized, unknown or out-of-range fields with a payload error', () => {
    const fact = ['3x7', 1, 1, 100, 2, 1, 0];
    const bad: unknown[] = [
      [],
      { zz: 1 },
      { x: -1 },
      { c: 10_000_001 },
      { x: 1.5 },
      { a: 'Girl!' },
      { l: { castle: [1, 0, 0, 0, 0] } },
      { l: { field: [4, 0, 0, 0, 0] } },
      { l: { field: [1, 0, 0, 0] } },
      { o: ['UPPER'] },
      { o: ['a'.repeat(41)] },
      { o: ['dup', 'dup'] },
      { o: Array.from({ length: 65 }, (_, i) => `i${i}`) },
      { e: { 'avatar-outfit': '<script>' } },
      { f: [['7x3', 1, 1, 100, 2, 1, 0]] },
      { f: [['3x7', 1, 2, 100, 2, 1, 0]] },
      { f: [['3x7', 1, 1, 100, 6, 1, 0]] },
      { f: [fact, fact] },
      { f: [['3x7', 1, 1, 100, 2, 1, 8.64e12 + 1]] },
      { g: [13, 0, 0] },
      { n: -1 },
    ];
    for (const payload of bad)
      expect(
        reason(() => decodeSaveCode(v2Code(payload))),
        JSON.stringify(payload),
      ).toBe('payload');
    expect(reason(() => decodeSaveCode(v2Code({ f: [fact] })))).toBe('no error');
  });
});
