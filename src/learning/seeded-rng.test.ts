import { describe, expect, it } from 'vitest';
import { mulberry32, pick, randInt, shuffle } from './seeded-rng';

describe('seeded-rng', () => {
  it('is deterministic per seed and stays in [0, 1)', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      const v = a();
      expect(v).toBe(b());
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });

  it('randInt covers the inclusive range', () => {
    const rng = mulberry32(7);
    const seen = new Set<number>();
    for (let i = 0; i < 300; i++) seen.add(randInt(rng, 3, 6));
    expect([...seen].sort()).toEqual([3, 4, 5, 6]);
  });

  it('shuffle keeps elements, does not mutate input', () => {
    const input = [1, 2, 3, 4, 5, 6];
    const out = shuffle(mulberry32(3), input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6]);
    expect([...out].sort()).toEqual(input);
  });

  it('pick rejects an empty list', () => {
    expect(() => pick(mulberry32(1), [])).toThrow();
  });
});
