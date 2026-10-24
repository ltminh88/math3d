import { describe, expect, it } from 'vitest';
import { mulFactsForTables } from '../../learning/curriculum-tables';
import { parseFactKey } from '../../learning/fact-key';
import { mulberry32 } from '../../learning/seeded-rng';
import { CityRoundFlow, type CityRound, planCityRounds, REVERSE_BOX } from './city-round-flow';

const plan = (facts: string[], box = 1, errs: number[] = []) =>
  planCityRounds({ facts, boxOf: () => box, errorsOf: () => errs, rng: mulberry32(11) });

const FIVE = ['mul:7x8', 'mul:6x9', 'mul:3x8', 'mul:6x6', 'mul:9x10'];

describe('planCityRounds', () => {
  it('alternates delivery and windows while the facts are new', () => {
    expect(plan(FIVE).map((r) => r.kind)).toEqual([
      'deliver',
      'windows',
      'deliver',
      'windows',
      'deliver',
    ]);
  });

  it(`asks reverse delivery from Leitner box ${REVERSE_BOX} on`, () => {
    expect(plan(FIVE, REVERSE_BOX).every((r) => r.kind === 'reverse')).toBe(true);
    expect(plan(FIVE, REVERSE_BOX - 1).some((r) => r.kind === 'reverse')).toBe(false);
  });

  it('puts a factor of the 6-9 tables first (windows per floor), the other one second', () => {
    for (const round of plan(FIVE)) {
      expect(round.table).toBeGreaterThanOrEqual(6);
      expect(round.table).toBeLessThanOrEqual(9);
      expect(round.table * round.other).toBe(round.product);
    }
    expect(plan(['mul:3x8'])[0]).toMatchObject({ table: 8, other: 3, product: 24 });
    expect(plan(['mul:9x10'])[0]).toMatchObject({ table: 9, other: 10, product: 90 });
  });

  it('delivery shows four different house numbers, exactly one the product', () => {
    for (const round of plan(FIVE).filter((r) => r.kind === 'deliver')) {
      expect(round.houses).toHaveLength(4);
      expect(new Set(round.houses).size).toBe(4);
      expect(round.houses.filter((n) => n === round.product)).toHaveLength(1);
      for (const n of round.houses) expect(n >= 1 && n <= 100).toBe(true);
      expect(round.parcels).toEqual([
        { label: `${round.table} × ${round.other}`, value: round.product, correct: true },
      ]);
    }
  });

  it('delivery prefers the child’s own recent wrong answers as house numbers', () => {
    const [round] = plan(['mul:7x8'], 1, [54]);
    expect(round?.houses).toContain(54);
  });

  it('reverse delivery: one house with the product, three parcels with one right expression', () => {
    for (const round of plan(FIVE, REVERSE_BOX)) {
      expect(round.houses).toEqual([round.product]);
      expect(round.parcels).toHaveLength(3);
      expect(round.parcels.filter((p) => p.correct)).toHaveLength(1);
      expect(round.parcels.find((p) => p.correct)?.value).toBe(round.product);
      expect(new Set(round.parcels.map((p) => p.value)).size).toBe(3);
      for (const p of round.parcels) expect(p.label).toMatch(/^\d+ [×+] \d+$/);
    }
  });

  it('only accepts multiplication facts', () => {
    expect(() => plan(['div:56/7'])).toThrow();
  });

  it('every fact of the pool has a factor in the 6-9 tables', () => {
    for (const key of mulFactsForTables([6, 7, 8, 9])) {
      const fact = parseFactKey(key);
      expect(fact?.op).toBe('mul');
      const [round] = plan([key]);
      expect(round?.table).toBeGreaterThanOrEqual(6);
    }
  });
});

describe('CityRoundFlow', () => {
  const rounds = (): CityRound[] => plan(['mul:7x8', 'mul:6x9']);
  const flowOf = () => {
    let t = 0;
    return { flow: new CityRoundFlow(rounds(), () => (t += 500)), at: () => t };
  };

  it('a right first answer is correct, first try, without hint', () => {
    const { flow } = flowOf();
    const result = flow.submit(56);
    expect(result.verdict).toBe('correct');
    expect(result.outcome).toMatchObject({
      factKey: 'mul:7x8',
      correct: true,
      firstTry: true,
      usedHint: false,
      wrongAnswers: [],
    });
    expect(result.outcome?.ms).toBeGreaterThan(0);
    expect(flow.submit(56).verdict).toBe('ignored');
  });

  it('wrong answers offer a hint; a hint taken marks the round', () => {
    const { flow } = flowOf();
    expect(flow.submit(54).verdict).toBe('wrong');
    expect(flow.hintOffered(0)).toBe(true);
    expect(flow.takeHint()).toBe(1);
    const result = flow.submit(56);
    expect(result.outcome).toMatchObject({
      correct: true,
      firstTry: false,
      usedHint: true,
      wrongAnswers: [54],
    });
  });

  it('three misses reveal the answer and record the round as wrong', () => {
    const { flow } = flowOf();
    flow.submit(54);
    flow.submit(48);
    const result = flow.submit(63);
    expect(result.verdict).toBe('revealed');
    expect(result.outcome).toMatchObject({ correct: false, wrongAnswers: [54, 48, 63] });
    expect(flow.roundComplete).toBe(true);
  });

  it('next() moves on only after a finished round and ends after the last one', () => {
    const { flow } = flowOf();
    flow.next();
    expect(flow.index).toBe(0);
    flow.submit(56);
    flow.next();
    expect(flow.round?.factKey).toBe('mul:6x9');
    expect(flow.hint.rung).toBe(0);
    flow.submit(54);
    flow.next();
    expect(flow.done).toBe(true);
    expect(flow.submit(1).verdict).toBe('ignored');
  });
});
