// Length units (boost, Phase 1B, D1): m/dm/cm/mm, whole numbers <= 1000, m<->mm
// only from ladder L2. The ladder is m -> dm -> cm -> mm, one x10 step per rung.
import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import {
  allowsMetreToMillimetre,
  convertLength,
  formatMixed,
  formatQty,
  ladderForTier,
  ladderPairs,
  mixedToMm,
  rungsBetween,
} from './length-units';

describe('length units', () => {
  it('converts down by x10 per rung', () => {
    expect(convertLength(3, 'm', 'dm')).toBe(30);
    expect(convertLength(3, 'm', 'cm')).toBe(300);
    expect(convertLength(1, 'm', 'mm')).toBe(1000);
    expect(convertLength(4, 'dm', 'cm')).toBe(40);
    expect(convertLength(25, 'cm', 'mm')).toBe(250);
    // 1 dm = 10 cm = 100 mm (R112: never "fix" the [dm,mm] factor to 10).
    expect(convertLength(1, 'dm', 'mm')).toBe(100);
    expect(convertLength(1, 'dm', 'cm')).toBe(10);
    expect(convertLength(10, 'cm', 'mm')).toBe(100);
  });

  it('converts up by ÷10 per rung, null when not whole', () => {
    expect(convertLength(500, 'mm', 'cm')).toBe(50);
    expect(convertLength(30, 'cm', 'dm')).toBe(3);
    expect(convertLength(1000, 'mm', 'm')).toBe(1);
    expect(convertLength(15, 'mm', 'cm')).toBeNull();
    expect(convertLength(25, 'mm', 'cm')).toBeNull();
    expect(convertLength(3, 'cm', 'm')).toBeNull();
  });

  it('counts rungs between units', () => {
    expect(rungsBetween('m', 'dm')).toBe(1);
    expect(rungsBetween('m', 'cm')).toBe(2);
    expect(rungsBetween('m', 'mm')).toBe(3);
    expect(rungsBetween('cm', 'mm')).toBe(1);
    expect(rungsBetween('dm', 'dm')).toBe(0);
  });

  it('adds mixed values in millimetres', () => {
    expect(mixedToMm(1, 'm', 5, 'cm')).toBe(1050);
    expect(mixedToMm(2, 'dm', 3, 'cm')).toBe(230);
    expect(mixedToMm(5, 'cm', 4, 'mm')).toBe(54);
  });

  it('formats quantities the way the textbook writes them', () => {
    expect(formatMixed(1, 'm', 5, 'cm')).toBe('1 m 5 cm');
    expect(formatQty(3, 'm')).toBe('3 m');
    expect(formatQty(1000, 'mm')).toBe('1 000 mm');
  });

  it('ladderForTier maps tiers to L0-1 / L2-3 / L4-5', () => {
    for (const tier of [1, 2, 3] as SkillTier[])
      for (let seed = 0; seed < 50; seed++) {
        const ladder = ladderForTier(tier, mulberry32(seed));
        expect(ladder).toBeGreaterThanOrEqual((tier - 1) * 2);
        expect(ladder).toBeLessThanOrEqual((tier - 1) * 2 + 1);
      }
  });

  it('m<->mm only from L2', () => {
    expect(allowsMetreToMillimetre(0)).toBe(false);
    expect(allowsMetreToMillimetre(1)).toBe(false);
    expect(allowsMetreToMillimetre(2)).toBe(true);
    expect(allowsMetreToMillimetre(5)).toBe(true);
    const hasMmJump = (ladder: number) =>
      ladderPairs(ladder).some(([a, b]) => (a === 'm' && b === 'mm') || (a === 'mm' && b === 'm'));
    expect(hasMmJump(0)).toBe(false);
    expect(hasMmJump(1)).toBe(false);
    expect(hasMmJump(2)).toBe(true);
  });
});
