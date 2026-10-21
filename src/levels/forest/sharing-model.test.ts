import { describe, expect, it } from 'vitest';
import {
  canMove,
  checkSharing,
  countsOf,
  createSharing,
  dealStep,
  isExactDivision,
  moveFruit,
  pileCount,
  visibleGroups,
} from './sharing-model';

describe('sharing model: share among friends (partitive)', () => {
  it('starts with every fruit in the pile', () => {
    const s = createSharing({ total: 12, groups: 3 });
    expect(pileCount(s)).toBe(12);
    expect(countsOf(s)).toEqual([0, 0, 0]);
    expect(visibleGroups(s)).toBe(3);
  });

  it('only builds exact divisions (no remainders in the MVP)', () => {
    expect(isExactDivision(12, 3)).toBe(true);
    expect(isExactDivision(13, 3)).toBe(false);
    expect(isExactDivision(12, 0)).toBe(false);
    expect(() => createSharing({ total: 13, groups: 3 })).toThrow(/exact/);
  });

  it('deals one fruit to each friend per step, round robin, until the pile is empty', () => {
    let s = createSharing({ total: 6, groups: 3 });
    s = dealStep(s);
    expect(countsOf(s)).toEqual([1, 1, 1]);
    s = dealStep(dealStep(s));
    expect(countsOf(s)).toEqual([2, 2, 2]);
    expect(pileCount(s)).toBe(0);
    expect(dealStep(s)).toBe(s);
  });

  it('deals one each after uneven moves without touching the moved fruit', () => {
    let s = createSharing({ total: 6, groups: 2 });
    s = moveFruit(s, 0, 1);
    s = moveFruit(s, 1, 1);
    s = dealStep(s);
    expect(countsOf(s)).toEqual([1, 3]);
    expect(pileCount(s)).toBe(2);
  });

  it('allows uneven dealing and reports who has too many or too few', () => {
    let s = createSharing({ total: 6, groups: 2 });
    for (const fruit of [0, 1, 2, 3]) s = moveFruit(s, fruit, 0);
    for (const fruit of [4, 5]) s = moveFruit(s, fruit, 1);
    const check = checkSharing(s);
    expect(check).toMatchObject({ complete: true, equal: false, target: 3, pile: 0 });
    expect(check.marks).toEqual(['tooMany', 'tooFew']);
  });

  it('is equal only when the pile is empty and every friend has the same', () => {
    let s = createSharing({ total: 4, groups: 2 });
    s = dealStep(s);
    expect(checkSharing(s)).toMatchObject({ complete: false, equal: false, pile: 2 });
    s = dealStep(s);
    expect(checkSharing(s)).toMatchObject({ complete: true, equal: true });
    expect(checkSharing(s).marks).toEqual(['ok', 'ok']);
  });

  it('moves fruit back to the pile and refuses no-op or out-of-range moves', () => {
    let s = createSharing({ total: 4, groups: 2 });
    s = moveFruit(s, 3, 1);
    expect(canMove(s, 3, 1)).toBe(false);
    expect(canMove(s, 3, 5)).toBe(false);
    expect(canMove(s, 9, 0)).toBe(false);
    s = moveFruit(s, 3, 'pile');
    expect(pileCount(s)).toBe(4);
  });
});

describe('sharing model: packing baskets (quotative)', () => {
  it('fills a whole basket per step and caps each basket at its size', () => {
    let s = createSharing({ total: 12, groups: 4, capacity: 3 });
    expect(visibleGroups(s)).toBe(1);
    s = dealStep(s);
    expect(countsOf(s)).toEqual([3, 0, 0, 0]);
    expect(visibleGroups(s)).toBe(2);
    const fruitInPile = s.spots.indexOf('pile');
    expect(canMove(s, fruitInPile, 0)).toBe(false);
    expect(canMove(s, fruitInPile, 1)).toBe(true);
    expect(canMove(s, fruitInPile, 2)).toBe(false);
  });

  it('keeps a basket visible while it still holds fruit', () => {
    let s = createSharing({ total: 6, groups: 3, capacity: 2 });
    s = dealStep(s);
    s = moveFruit(s, s.spots.indexOf('pile'), 1);
    s = moveFruit(s, s.spots.indexOf(0), 'pile');
    expect(countsOf(s)).toEqual([1, 1, 0]);
    expect(visibleGroups(s)).toBe(2);
  });

  it('is equal once every basket is full', () => {
    let s = createSharing({ total: 6, groups: 3, capacity: 2 });
    s = dealStep(dealStep(dealStep(s)));
    expect(checkSharing(s)).toMatchObject({ complete: true, equal: true, target: 2 });
    expect(visibleGroups(s)).toBe(3);
  });

  it('needs capacity x groups fruit', () => {
    expect(() => createSharing({ total: 7, groups: 3, capacity: 2 })).toThrow(/exact/);
  });
});
