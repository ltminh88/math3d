// Rounding + Roman numerals (phase 08): RED-first — the converter and the generators
// do not exist yet. Exact answers for the new story keys live in the ORACLE of
// numbers-generators.test.ts (it sweeps every num-* skill); this file holds the
// converter + rounding hand tables and the phase-08 structural checks.
import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { dialogRenderable } from '../practice/item-for-skill';
import type { PracticeItem } from '../practice/practice-scene';
import { NUMBER_SKILLS, numberItemForSkill } from './number-item-for-skill';
import type { PlaceName } from './numbers-scene-types';
import {
  correctLabel,
  ROMAN_TABLE,
  romanToNumberOracle,
  roundToOracle,
} from './numbers-test-oracles';
import { sweepNumberItem } from './numbers-test-sweep';
import { fromRoman, toRoman } from './roman-numerals';
import { roundTo } from './rounding-generators';

const PHASE08_SKILLS = [
  'round-tens',
  'round-hundreds',
  'round-thousands',
  'round-ten-thousands',
  'round-which-place',
  'roman-to-number',
  'number-to-roman',
  'roman-sequence',
] as const;

/** [n, place, expected] — 5 rounds up, incl. carries across a thousand and to 10 000. */
const ROUNDING_TABLE: readonly [number, string, number][] = [
  [14, 'tens', 10],
  [15, 'tens', 20],
  [344, 'tens', 340],
  [345, 'tens', 350],
  [349, 'tens', 350],
  [351, 'tens', 350],
  [995, 'tens', 1000],
  [999, 'tens', 1000],
  [344, 'hundreds', 300],
  [349, 'hundreds', 300],
  [350, 'hundreds', 400],
  [449, 'hundreds', 400],
  [450, 'hundreds', 500],
  [995, 'hundreds', 1000],
  [999, 'hundreds', 1000],
  [1344, 'thousands', 1000],
  [1499, 'thousands', 1000],
  [1500, 'thousands', 2000],
  [9500, 'thousands', 10000],
  [9995, 'thousands', 10000],
  [14999, 'tenThousands', 10000],
  [15000, 'tenThousands', 20000],
  [49999, 'tenThousands', 50000],
  [50000, 'tenThousands', 50000],
  [95000, 'tenThousands', 100000],
  [99995, 'tenThousands', 100000],
];

describe('roman numerals converter', () => {
  it('converts I..XX both ways (hand table)', () => {
    for (const [roman, n] of Object.entries(ROMAN_TABLE)) {
      expect(toRoman(n)).toBe(roman);
      expect(fromRoman(roman)).toBe(n);
    }
  });

  it('rejects out-of-range numbers and invalid numerals', () => {
    for (const n of [0, 21, 100]) expect(() => toRoman(n)).toThrow();
    for (const s of ['', 'IIII', 'ABC', 'XXI', 'iv', 'IL']) expect(() => fromRoman(s)).toThrow();
  });
});

describe('rounding rule', () => {
  it('matches the hand table (5 rounds up, carries included)', () => {
    for (const [n, place, want] of ROUNDING_TABLE) {
      expect(roundTo(n, place as PlaceName), `${n} to ${place}`).toBe(want);
      expect(roundToOracle(n, place), `oracle ${n} to ${place}`).toBe(want);
    }
  });
});

describe('rounding + roman generators', () => {
  it('cover the 8 phase-08 skills', () => {
    for (const id of PHASE08_SKILLS) expect(NUMBER_SKILLS).toContain(id);
  });

  for (const skillId of PHASE08_SKILLS)
    it(`${skillId}: shape, range, unique options, deterministic`, () => {
      for (const tier of [1, 2, 3] as SkillTier[])
        for (let seed = 0; seed < 200; seed++) {
          const item = numberItemForSkill(skillId, mulberry32(seed), tier);
          sweepNumberItem(item, skillId, tier, seed);
          if (seed < 20) expect(numberItemForSkill(skillId, mulberry32(seed), tier)).toEqual(item);
        }
    });

  it('dialog filter: every phase-08 skill renders (scene-free)', () => {
    for (const skillId of PHASE08_SKILLS)
      for (const tier of [1, 2, 3] as SkillTier[]) {
        const item = numberItemForSkill(skillId, mulberry32(0), tier);
        expect(dialogRenderable(item)).toBe(true);
        expect(item.scene).toBeUndefined();
      }
  });

  it('round-which-place: the rounded value is unique to one place', () => {
    for (let seed = 0; seed < 200; seed++) {
      const item = numberItemForSkill('round-which-place', mulberry32(seed), 3);
      const n = Number(item.story.params?.n);
      const r = Number(item.story.params?.r);
      const step = item.steps[0];
      if (step?.kind !== 'choice') throw new Error('roundWhichPlace needs a choice step');
      const places = step.options.map((o) => String(o.label.key).replace(/^item_/, ''));
      expect(new Set(places).size).toBe(places.length);
      expect(places.filter((p) => roundToOracle(n, p) === r)).toHaveLength(1);
      expect(roundToOracle(n, String(correctLabel(step).key).replace(/^item_/, ''))).toBe(r);
    }
  });

  it('roman traps appear at tier 3 (IV/IX/XIV/XIX as story or option)', () => {
    const traps = new Set(['IV', 'IX', 'XIV', 'XIX']);
    const seen = new Set<string>();
    for (const skillId of ['roman-to-number', 'number-to-roman', 'roman-sequence'])
      for (let seed = 0; seed < 200; seed++) {
        const item = numberItemForSkill(skillId, mulberry32(seed), 3);
        const roman = String(item.story.params?.roman ?? item.story.params?.seq ?? '');
        for (const t of traps) if (roman.includes(t)) seen.add(t);
        for (const step of item.steps) {
          if (step.kind !== 'choice') continue;
          for (const o of step.options) {
            const r = String(o.label.params?.r ?? '');
            if (traps.has(r)) seen.add(r);
          }
        }
      }
    for (const t of traps) expect(seen, `trap ${t} appears`).toContain(t);
  });

  it('rounding skills use both forms (number pad and MCQ) across seeds', () => {
    for (const skillId of [
      'round-tens',
      'round-hundreds',
      'round-thousands',
      'round-ten-thousands',
    ]) {
      const kinds = new Set<string>();
      for (let seed = 0; seed < 200; seed++) {
        const item: PracticeItem = numberItemForSkill(skillId, mulberry32(seed), 2);
        const step = item.steps[0];
        if (step) kinds.add(step.kind);
      }
      expect(kinds, `${skillId} forms`).toEqual(new Set(['number', 'choice']));
    }
  });

  it('roman-sequence: the missing value is the average of its neighbours', () => {
    for (let seed = 0; seed < 200; seed++) {
      const item = numberItemForSkill('roman-sequence', mulberry32(seed), 2);
      const shown = String(item.story.params?.seq).split(', ');
      const missing = shown.indexOf('?');
      expect(missing).toBeGreaterThan(0);
      const nums = shown.map((s) => (s === '?' ? NaN : romanToNumberOracle(s)));
      const want = ((nums[missing - 1] as number) + (nums[missing + 1] as number)) / 2;
      expect(Number.isInteger(want)).toBe(true);
      const step = item.steps[0];
      if (!step) throw new Error('romanSequence needs a step');
      if (step.kind === 'number') expect(step.answer).toBe(want);
      else expect(romanToNumberOracle(String(correctLabel(step).params?.r))).toBe(want);
    }
  });
});
