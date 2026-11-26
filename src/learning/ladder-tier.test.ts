// Ladder tier table (boost, Phase 0): box 1..5 × recent patterns.
import { describe, expect, it } from 'vitest';
import { ladderTierOf, ladderToSkillTier } from './ladder-tier';

describe('ladderTierOf', () => {
  it('is box − 1 with no recent history', () => {
    for (const box of [1, 2, 3, 4, 5]) expect(ladderTierOf({ box })).toBe(box - 1);
  });

  it('adds 1 only at box 5 with ≥ 8 correct of the last 10', () => {
    expect(ladderTierOf({ box: 5, recent: 0b11111111 })).toBe(5);
    expect(ladderTierOf({ box: 5, recent: 0b1111111111 })).toBe(5);
    expect(ladderTierOf({ box: 5, recent: 0b1111111 })).toBe(4);
    expect(ladderTierOf({ box: 4, recent: 0b1111111111 })).toBe(3);
  });

  it('subtracts 1 when the last 3 first tries were wrong', () => {
    expect(ladderTierOf({ box: 3, recent: 0b1000 })).toBe(1);
    expect(ladderTierOf({ box: 3, recent: 0b101000 })).toBe(1);
    expect(ladderTierOf({ box: 3, recent: 0b1001 })).toBe(2);
    expect(ladderTierOf({ box: 1, recent: 0 })).toBe(0);
  });

  it('clamps to 0..5', () => {
    expect(ladderTierOf({ box: 5, recent: 0b1111111111 })).toBe(5);
    expect(ladderTierOf({ box: 1, recent: 0b0 })).toBe(0);
  });
});

describe('ladderToSkillTier', () => {
  it('maps 0-1 → 1, 2-3 → 2, 4-5 → 3', () => {
    expect([0, 1, 2, 3, 4, 5].map(ladderToSkillTier)).toEqual([1, 1, 2, 2, 3, 3]);
  });
});
