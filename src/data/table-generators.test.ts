// Table generators: oracles are hand-derived from the scene's raw data (table cells,
// tally marks, hidden cell), never from generator internals.
import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { dataItemForSkill } from './data-item-for-skill';
import type { DataItem } from './data-scene-types';
import { stepLabel, stepValue, tableOf, tallyOf } from './data-test-oracles';
import { sweepItem } from './data-test-sweep';

const TABLE_SKILLS = [
  'tally-count',
  'table-read',
  'table-max-min',
  'table-sums',
  'table-fill-missing',
] as const;

const ORACLE: Record<(typeof TABLE_SKILLS)[number], (item: DataItem, tier: SkillTier) => void> = {
  'tally-count': (i, tier) => {
    const marks = tallyOf(i);
    const hits = marks.filter(Boolean).length;
    const misses = marks.length - hits;
    if (tier === 1) expect(marks.length).toBeGreaterThanOrEqual(6);
    if (tier === 1) expect(marks.length).toBeLessThanOrEqual(10);
    if (tier === 2) expect(marks.length).toBeGreaterThanOrEqual(10);
    if (tier === 2) expect(marks.length).toBeLessThanOrEqual(18);
    if (tier === 3) expect(marks.length).toBeGreaterThanOrEqual(18);
    if (tier === 3) expect(marks.length).toBeLessThanOrEqual(30);
    expect(hits).toBeGreaterThanOrEqual(2);
    expect(misses).toBeGreaterThanOrEqual(1);
    expect(i.steps[0]?.prompt.key).toBe('askTally');
    expect(stepValue(i.steps[0])).toBe(hits);
    expect(i.work).toEqual([hits]);
  },
  'table-read': (i, tier) => {
    const table = tableOf(i);
    const prompt = i.steps[0]?.prompt;
    const col = table.headers.indexOf(String(prompt?.params?.header));
    expect(col).toBeGreaterThanOrEqual(0);
    const row =
      prompt?.key === 'askTableCellRow'
        ? (table.rowLabels ?? []).indexOf(String(prompt.params?.row))
        : 0;
    expect(row).toBeGreaterThanOrEqual(0);
    const value = table.rows[row]?.[col];
    expect(typeof value).toBe('number');
    if (tier === 1) {
      expect(table.rows.length).toBe(1);
      expect(table.headers.length).toBe(3);
      expect(prompt?.key).toBe('askTableCell');
    }
    if (tier === 2) {
      expect(table.rows.length).toBe(1);
      expect(table.headers.length).toBe(4);
    }
    if (tier === 3) {
      expect(table.rows.length).toBe(2);
      expect(table.headers.length).toBe(3);
      expect(prompt?.key).toBe('askTableCellRow');
    }
    expect(stepValue(i.steps[0])).toBe(value);
    expect(i.work).toEqual([value]);
  },
  'table-max-min': (i, tier) => {
    const table = tableOf(i);
    const row = table.rows[0] as readonly number[];
    const max = Math.max(...row);
    const min = Math.min(...row);
    // A unique most/least: the question has one right category.
    expect(row.filter((v) => v === max).length).toBe(1);
    expect(row.filter((v) => v === min).length).toBe(1);
    if (tier === 1) expect(table.headers.length).toBe(3);
    if (tier === 2) expect(table.headers.length).toBe(4);
    if (tier === 3) {
      expect(table.headers.length).toBe(5);
      expect(i.steps.length).toBe(2);
    } else {
      expect(i.steps.length).toBe(1);
    }
    for (const step of i.steps) {
      const asked = step.prompt.key === 'askMost' ? max : min;
      const col = row.indexOf(asked);
      expect(stepLabel(step)).toBe(`item_${(table.headers[col] as string).slice(2)}`);
    }
    // One numeric answer per step, in step order.
    expect(i.work).toEqual(i.steps.map((s) => (s.prompt.key === 'askMost' ? max : min)));
  },
  'table-sums': (i, tier) => {
    const table = tableOf(i);
    expect(table.rows.length).toBe(2);
    expect(table.headers.length).toBe(3);
    const prompt = i.steps[0]?.prompt;
    const rows = table.rows as readonly (readonly number[])[];
    let expected: number;
    if (prompt?.key === 'askRowSum') {
      const r = (table.rowLabels ?? []).indexOf(String(prompt.params?.row));
      expect(r).toBeGreaterThanOrEqual(0);
      expected = (rows[r] as readonly number[]).reduce((a, b) => a + b, 0);
      expect(tier).toBe(1);
    } else if (prompt?.key === 'askColSum') {
      const c = table.headers.indexOf(String(prompt?.params?.header));
      expect(c).toBeGreaterThanOrEqual(0);
      expected = (rows[0]?.[c] as number) + (rows[1]?.[c] as number);
      expect(tier).toBe(2);
    } else {
      expect(prompt?.key).toBe('askTableSum');
      expected = rows.flat().reduce((a, b) => a + b, 0);
      expect(tier).toBe(3);
    }
    expect(stepValue(i.steps[0])).toBe(expected);
    expect(i.work).toEqual([expected]);
  },
  'table-fill-missing': (i, tier) => {
    const table = tableOf(i);
    expect(table.rows.length).toBe(3);
    expect(table.headers.length).toBe(3);
    expect(table.hiddenCell).toBeDefined();
    const { row, col } = table.hiddenCell as { row: number; col: number };
    const rows = table.rows as readonly (readonly (number | null)[])[];
    let expected: number;
    if (row === 2) {
      expected = (rows[0]?.[col] as number) + (rows[1]?.[col] as number);
      expect(tier).toBe(1);
    } else {
      expected = (rows[2]?.[col] as number) - (rows[1 - row]?.[col] as number);
      expect(tier).toBeGreaterThanOrEqual(2);
    }
    expect(stepValue(i.steps[0])).toBe(expected);
    expect(i.work).toEqual([expected]);
  },
};

describe('table generators', () => {
  for (const skillId of TABLE_SKILLS)
    it(`${skillId}: exact answers, unique options, numbers <= 999, deterministic`, () => {
      for (const tier of [1, 2, 3] as SkillTier[])
        for (let seed = 0; seed < 1000; seed++) {
          const item = dataItemForSkill(skillId, mulberry32(seed), tier);
          sweepItem(skillId, tier, item);
          ORACLE[skillId]?.(item, tier);
        }
      for (let seed = 0; seed < 20; seed++) {
        const a = dataItemForSkill(skillId, mulberry32(seed), 2);
        const b = dataItemForSkill(skillId, mulberry32(seed), 2);
        expect(a).toEqual(b);
      }
    });
});
