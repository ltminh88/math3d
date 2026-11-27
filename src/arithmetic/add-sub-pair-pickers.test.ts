// Ladder picker (boost, Phase 1A): pickLadderPair samples a pair whose regroup
// pattern matches the ladder step, so each SkillTier practices one regroup shape.
// RED-first: the picker does not exist yet.
import { describe, expect, it } from 'vitest';
import { countAddCarries, countSubBorrows, hasBorrowAcrossZero } from './carry-count';
import { mulberry32 } from '../learning/seeded-rng';
import {
  addCarryAt,
  ladderOfSkillTier,
  pickLadderPair,
  subBorrowAt,
  type Ladder,
} from './add-sub-pair-pickers';

const checkPair = (a: number, b: number, op: '+' | '−') => {
  expect(a).toBeGreaterThanOrEqual(10);
  expect(b).toBeGreaterThanOrEqual(10);
  expect(a).toBeLessThanOrEqual(1000);
  expect(b).toBeLessThanOrEqual(1000);
  if (op === '+') expect(a + b).toBeLessThanOrEqual(1000);
  else expect(a).toBeGreaterThanOrEqual(b);
};

describe('pickLadderPair', () => {
  it.each([
    [0, '+', 0],
    [0, '−', 0],
    [1, '+', 1],
    [1, '−', 1],
    [2, '+', 1],
    [2, '−', 1],
    [3, '+', 2],
    [3, '−', 2],
  ] as const)('ladder %s %s has the right regroup count', (ladder, op, count) => {
    for (let seed = 0; seed < 100; seed++) {
      const rng = mulberry32(seed * 17 + ladder);
      const [a, b] = pickLadderPair(rng, op, ladder);
      checkPair(a, b, op);
      if (ladder === 3) {
        if (op === '+') expect(countAddCarries(a, b)).toBeGreaterThanOrEqual(2);
        else expect(countSubBorrows(a, b)).toBeGreaterThanOrEqual(2);
      } else if (op === '+') expect(countAddCarries(a, b)).toBe(count);
      else expect(countSubBorrows(a, b)).toBe(count);
    }
  });

  it('ladder 1 regroups only in the units column', () => {
    for (let seed = 0; seed < 100; seed++) {
      const rng = mulberry32(seed);
      const [a, b] = pickLadderPair(rng, '+', 1);
      expect(addCarryAt(a, b, 0)).toBe(true);
      expect(addCarryAt(a, b, 1)).toBe(false);
      expect(addCarryAt(a, b, 2)).toBe(false);
      const [c, d] = pickLadderPair(rng, '−', 1);
      expect(subBorrowAt(c, d, 0)).toBe(true);
      expect(subBorrowAt(c, d, 1)).toBe(false);
      expect(subBorrowAt(c, d, 2)).toBe(false);
    }
  });

  it('ladder 2 regroups only in the tens column', () => {
    for (let seed = 0; seed < 100; seed++) {
      const rng = mulberry32(seed);
      const [a, b] = pickLadderPair(rng, '+', 2);
      expect(addCarryAt(a, b, 0)).toBe(false);
      expect(addCarryAt(a, b, 1)).toBe(true);
      const [c, d] = pickLadderPair(rng, '−', 2);
      expect(subBorrowAt(c, d, 0)).toBe(false);
      expect(subBorrowAt(c, d, 1)).toBe(true);
    }
  });

  it('ladder 4 subtraction borrows across a zero', () => {
    for (let seed = 0; seed < 100; seed++) {
      const rng = mulberry32(seed);
      const [a, b] = pickLadderPair(rng, '−', 4);
      checkPair(a, b, '−');
      expect(hasBorrowAcrossZero(a, b)).toBe(true);
    }
  });

  it('ladder 4 addition falls back to two regroups (documented)', () => {
    for (let seed = 0; seed < 50; seed++) {
      const rng = mulberry32(seed);
      const [a, b] = pickLadderPair(rng, '+', 4);
      expect(countAddCarries(a, b)).toBeGreaterThanOrEqual(2);
    }
  });

  it('the same seed gives the same pair', () => {
    for (const ladder of [0, 1, 2, 3, 4] as const) {
      for (const op of ['+', '−'] as const) {
        const first = pickLadderPair(mulberry32(7), op, ladder);
        const second = pickLadderPair(mulberry32(7), op, ladder);
        expect(second).toEqual(first);
      }
    }
  });

  it('ladderOfSkillTier maps tier 1 → L0, tier 2 → L1/L2, tier 3 → L3/L4', () => {
    expect(ladderOfSkillTier(mulberry32(1), 1)).toBe(0);
    for (let seed = 0; seed < 50; seed++) {
      const l2 = ladderOfSkillTier(mulberry32(seed), 2);
      expect([1, 2] as Ladder[]).toContain(l2);
      const l3 = ladderOfSkillTier(mulberry32(seed), 3);
      expect([3, 4] as Ladder[]).toContain(l3);
    }
  });
});
