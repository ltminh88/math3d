import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../learning/seeded-rng';
import { cityHint, skipSteps } from './city-hints';
import { planCityRounds, REVERSE_BOX } from './city-round-flow';

const fact = (table: number, other: number) => ({ table, other });
const numbers = (params: Readonly<Record<string, number | string>>) =>
  Object.values(params).filter((v): v is number => typeof v === 'number');

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

  it('rung 4 counts back from ten on the factor closest to 10 (6 x 9 = 60 - 6)', () => {
    expect(cityHint(4, fact(6, 9))).toMatchObject({
      key: 'hintTen',
      params: { a: 6, b: 9, back: 1, ten: 60, minus: 6 },
    });
    // The 6-9 factor shown first is 9 here: still 6 × 10 - 6, not 9 × 10 - 4 × 9.
    expect(cityHint(4, fact(9, 6)).params).toMatchObject({ a: 6, b: 9, back: 1, ten: 60 });
    expect(cityHint(4, fact(8, 8)).params).toMatchObject({ ten: 80, minus: 16 });
  });

  it('delivery rounds skip count without windows (rung 3)', () => {
    const hint = cityHint(3, { ...fact(8, 4), kind: 'deliver' });
    expect(hint.key).toBe('hintCount');
    expect(hint.steps).toEqual(['8', '16', '24', '?']);
    expect(cityHint(3, { ...fact(8, 4), kind: 'windows' }).key).toBe('hintSkip');
  });

  it('reverse rounds never name the right parcel from rung 2 on', () => {
    const facts = ['mul:7x8', 'mul:6x9', 'mul:3x8', 'mul:6x6', 'mul:9x10', 'mul:2x7'];
    const rounds = planCityRounds({
      facts,
      boxOf: () => REVERSE_BOX,
      errorsOf: () => [],
      rng: mulberry32(4),
    });
    for (const round of rounds) {
      const right = round.parcels.find((p) => p.correct)?.label as string;
      const swapped = right.split(' × ').reverse().join(' × ');
      for (const rung of [2, 3, 4] as const) {
        const hint = cityHint(rung, round);
        expect(hint.key).toMatch(/^hintReverse/);
        const shown = Object.values(hint.params).map(String);
        expect(shown).not.toContain(right);
        expect(shown).not.toContain(swapped);
        const values = numbers(hint.params);
        if (round.table !== round.other) {
          expect(values.includes(round.table) && values.includes(round.other)).toBe(false);
        }
      }
    }
  });

  it('reverse rung 3 rules out a parcel the child has not tried yet', () => {
    const [round] = planCityRounds({
      facts: ['mul:7x8'],
      boxOf: () => REVERSE_BOX,
      errorsOf: () => [],
      rng: mulberry32(4),
    });
    if (!round) throw new Error('no round');
    const wrong = round.parcels.filter((p) => !p.correct);
    const tried = wrong[0]?.value as number;
    const hint = cityHint(3, round, [tried]);
    expect(hint.params).toMatchObject({ label: wrong[1]?.label, value: wrong[1]?.value });
  });

  it('only rung 2 carries colour bands', () => {
    for (const rung of [1, 3, 4] as const) expect(cityHint(rung, fact(7, 6)).bands).toBeNull();
  });
});
