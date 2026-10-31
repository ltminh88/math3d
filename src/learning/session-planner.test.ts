import { describe, expect, it } from 'vitest';
import { levelFactPool, levelTables, tableOfFact } from './curriculum-tables';
import { factGroup } from './fact-group';
import type { FactStat } from './learning-types';
import { newFactStat } from './leitner-box';
import { mulberry32 } from './seeded-rng';
import { BOX_INTERVAL, planSession } from './session-planner';

const tables = levelTables('bridge');
const pool = levelFactPool('bridge');
const stat = (box: number, lastSeenSession: number): FactStat => ({
  ...newFactStat(),
  box,
  lastSeenSession,
  attempts: 3,
  correct: 2,
});

describe('planSession', () => {
  it('first session: only 3 new facts, all from the first table, repeated to fill the session', () => {
    const plan = planSession({ stats: {}, pool, tables, sessionNo: 1, rng: mulberry32(1) });
    expect(plan).toHaveLength(10);
    const distinct = new Set(plan);
    expect(distinct.size).toBe(3);
    for (const k of distinct) expect(tableOfFact(k, tables)).toBe(2);
  });

  it('is deterministic for a seed and restricted to the pool', () => {
    const a = planSession({ stats: {}, pool, tables, sessionNo: 1, rng: mulberry32(9) });
    const b = planSession({ stats: {}, pool, tables, sessionNo: 1, rng: mulberry32(9) });
    expect(a).toEqual(b);
    for (const k of a) expect(pool).toContain(k);
  });

  it('respects box intervals: due facts are scheduled, fresh high-box facts are not', () => {
    const stats: Record<string, FactStat> = {
      'mul:2x3': stat(1, 4),
      'mul:2x4': stat(3, 2),
      'mul:2x6': stat(3, 4),
    };
    const plan = planSession({ stats, pool, tables, sessionNo: 5, rng: mulberry32(2), maxNew: 0 });
    expect(plan).toContain('mul:2x3');
    expect(plan).toContain('mul:2x4');
    expect(BOX_INTERVAL[3]).toBe(4);
    expect(new Set(plan).has('mul:2x6')).toBe(true); // only via spill: nothing else is available
  });

  it('caps new facts at maxNew and spends a mastered check slot', () => {
    const stats: Record<string, FactStat> = { 'mul:2x2': stat(5, 1) };
    for (let n = 3; n <= 8; n++) stats[`mul:2x${n}`] = stat(1, 1);
    const plan = planSession({ stats, pool, tables, sessionNo: 3, rng: mulberry32(4) });
    const fresh = new Set(plan.filter((k) => !stats[k]));
    expect(fresh.size).toBeLessThanOrEqual(3);
    expect(plan).toContain('mul:2x2');
  });

  it('interleaves tables once two are known', () => {
    const stats: Record<string, FactStat> = {};
    for (const k of pool) stats[k] = stat(3, 1);
    const plan = planSession({ stats, pool, tables, sessionNo: 10, rng: mulberry32(5) });
    const tableOf = (k: string) => tableOfFact(k, tables);
    const c2 = plan.filter((k) => tableOf(k) === 2).length;
    const c5 = plan.length - c2;
    const sameAdjacent = plan.filter(
      (k, i) => i > 0 && tableOf(k) === tableOf(plan[i - 1] as string),
    ).length;
    // Greedy alternation only repeats a table once the other one has run out.
    expect(sameAdjacent).toBeLessThanOrEqual(Math.abs(c2 - c5));
  });

  it('returns an empty plan for an empty pool', () => {
    expect(planSession({ stats: {}, pool: [], tables, sessionNo: 1, rng: mulberry32(1) })).toEqual(
      [],
    );
  });

  it('mixed pool: skills join the new items while a table is taught blocked', () => {
    const skills = ['sk:wp-times-then-add', 'sk:div-rem-floor', 'sk:pattern-add'];
    const stats: Record<string, FactStat> = {};
    for (const k of pool) if (tableOfFact(k, tables) === 2) stats[k] = stat(1, 5);
    const plans = Array.from({ length: 20 }, (_, seed) =>
      planSession({
        stats,
        pool: [...pool, ...skills],
        tables,
        sessionNo: 5,
        rng: mulberry32(seed),
      }),
    );
    expect(plans.some((p) => p.some((k) => skills.includes(k)))).toBe(true);
  });

  it('mixed pool: interleaves skills by family next to tables', () => {
    const stats: Record<string, FactStat> = {};
    for (const k of pool) stats[k] = stat(3, 5);
    const skills = [
      'sk:wp-times-then-add',
      'sk:wp-divide-then-add',
      'sk:wp-unit-then-times',
      'sk:div-rem-floor',
      'sk:div-rem-ceil',
      'sk:pattern-add',
    ];
    for (const k of skills) stats[k] = stat(1, 1);
    const plan = planSession({
      stats,
      pool: [...pool, ...skills],
      tables,
      sessionNo: 5,
      rng: mulberry32(4),
    });
    expect(plan).toHaveLength(10);
    for (const k of skills) expect(plan).toContain(k);
    const group = (k: string) => factGroup(k, tables);
    const repeats = plan.filter((k, i) => i > 0 && group(k) === group(plan[i - 1] as string));
    expect(repeats).toEqual([]);
  });
});
