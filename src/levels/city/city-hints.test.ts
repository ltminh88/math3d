import { describe, expect, it } from 'vitest';
import { cityHint, skipSteps } from './city-hints';

const fact = (table: number, other: number) => ({ table, other });

describe('cityHint', () => {
  it('rung 1 encourages', () => {
    expect(cityHint(1, fact(7, 8))).toMatchObject({ key: 'hint1', bands: null });
    expect(cityHint(0, fact(7, 8)).key).toBe('hint1');
  });

  it('rung 2 splits the 6-9 factor into 5 and the rest (colour bands)', () => {
    expect(cityHint(2, fact(8, 7))).toMatchObject({
      key: 'hintSplit',
      params: { t: 8, rest: 3, m: 7, five: 35, part: 21 },
      bands: { first: 5, rest: 3 },
    });
    expect(cityHint(2, fact(6, 10)).bands).toEqual({ first: 5, rest: 1 });
  });

  it('rung 3 skip counts by the windows of a floor, the last step left as "?"', () => {
    const hint = cityHint(3, fact(8, 4));
    expect(hint.key).toBe('hintSkip');
    expect(hint.steps).toEqual(['8', '16', '24', '?']);
    expect(hint.params.steps).toBe('8, 16, 24, ?');
    expect(skipSteps(fact(9, 2))).toEqual(['9', '?']);
  });

  it('rung 4 swaps the factors when the other table is a known one (2-5, 10)', () => {
    expect(cityHint(4, fact(6, 3))).toMatchObject({
      key: 'hintCommute',
      params: { t: 6, m: 3 },
    });
    expect(cityHint(4, fact(9, 10)).key).toBe('hintCommute');
  });

  it('rung 4 uses a near square for neighbours (7 x 8 = 7 x 7 + 7)', () => {
    expect(cityHint(4, fact(8, 7))).toMatchObject({
      key: 'hintNearSquare',
      params: { t: 8, m: 7, s: 7, square: 49 },
    });
  });

  it('rung 4 counts back from ten otherwise (6 x 9 = 60 - 6)', () => {
    expect(cityHint(4, fact(6, 9))).toMatchObject({
      key: 'hintTen',
      params: { t: 6, m: 9, back: 1, ten: 60, minus: 6 },
    });
    expect(cityHint(4, fact(8, 8)).params).toMatchObject({ ten: 80, minus: 16 });
  });

  it('only rung 2 carries colour bands', () => {
    for (const rung of [1, 3, 4] as const) expect(cityHint(rung, fact(7, 6)).bands).toBeNull();
  });
});
