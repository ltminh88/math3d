import { describe, expect, it } from 'vitest';
import { factGroup } from './fact-group';
import { skillTierOf, tierOfBox } from './skill-tiers';

describe('factGroup', () => {
  it('groups arithmetic facts by table and skills by family', () => {
    expect(factGroup('mul:2x7', [2, 5])).toBe(2);
    expect(factGroup('div:35/5', [2, 5])).toBe(5);
    expect(factGroup('mul:3x7', [2, 5])).toBeUndefined();
    expect(factGroup('sk:div-rem-ceil', [2, 5])).toBe('remainder');
    expect(factGroup('sk:unknown-thing', [2, 5])).toBeUndefined();
  });
});

describe('tiers', () => {
  it('box 1-2 -> 1, 3-4 -> 2, 5 -> 3; a new skill starts at tier 1', () => {
    expect([1, 2, 3, 4, 5].map(tierOfBox)).toEqual([1, 1, 2, 2, 3]);
    expect(tierOfBox(0)).toBe(1);
    expect(tierOfBox(9)).toBe(3);
    expect(skillTierOf(undefined)).toBe(1);
    expect(skillTierOf({ box: 4 })).toBe(2);
  });
});
