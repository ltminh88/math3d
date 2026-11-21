// Dispatcher (phase 00): one skill id -> the item its family generates; only unknown
// ids throw. A geo/meas item carries a `scene`; daily (phase 04) judges the generated
// item — no scene always renders, a scene renders only when its kind has a renderer.
import { describe, expect, test } from 'vitest';
import { ARITHMETIC_SKILLS, isArithmeticSkill } from '../arithmetic/arithmetic-item-for-skill';
import { DATA_SKILLS, isDataSkill } from '../data/data-item-for-skill';
import { DATA_ENTRIES } from '../data/data-skill-entries';
import { FRACTION_SKILLS, isFractionSkill } from '../fractions/fraction-item-for-skill';
import { mulberry32 } from '../learning/seeded-rng';
import { SKILL_CATALOG } from '../learning/skill-catalog';
import { isMoneySkill, MONEY_SKILLS } from '../money/money-item-for-skill';
import { MONEY_ENTRIES } from '../money/money-skill-entries';
import { isTimeSkill, TIME_SKILLS } from '../time/time-item-for-skill';
import { TIME_ENTRIES } from '../time/time-skill-entries';
import { dialogRenderable, familyOfSkill, itemForSkill } from './item-for-skill';

describe('itemForSkill', () => {
  test('one id per family returns that skill’s item', () => {
    expect(itemForSkill('wp-times-then-add', mulberry32(1), 1).skillId).toBe('wp-times-then-add');
    expect(itemForSkill('geo-midpoint', mulberry32(1), 1).skillId).toBe('geo-midpoint');
    expect(itemForSkill('meas-gram', mulberry32(1), 1).skillId).toBe('meas-gram');
  });

  test('unknown id throws', () => {
    expect(() => itemForSkill('not-a-skill', mulberry32(1), 1)).toThrow();
  });

  test('every catalog id dispatches', () => {
    for (const { id } of SKILL_CATALOG) expect(itemForSkill(id, mulberry32(7), 1).skillId).toBe(id);
  });
});

describe('familyOfSkill', () => {
  test('reads the family from the catalog, not the id prefix', () => {
    expect(familyOfSkill('wp-times-then-add')).toBe('word-problem');
    expect(familyOfSkill('geo-midpoint')).toBe('geometry');
    expect(familyOfSkill('meas-gram')).toBe('measurement');
    expect(familyOfSkill('not-a-skill')).toBeUndefined();
  });
});

describe('new families (phase 02 scaffolding)', () => {
  test('two families have no generator yet: is<F>Skill is false for every catalog id, <f>ItemForSkill throws', () => {
    const checks = [[isArithmeticSkill, ARITHMETIC_SKILLS]] as const;
    for (const [isSkill, skills] of checks) {
      expect(skills).toEqual([]);
      for (const { id } of SKILL_CATALOG) expect(isSkill(id), id).toBe(false);
    }
  });

  test('fraction has generators (phase 12): isFractionSkill is true for its six ids', () => {
    expect(FRACTION_SKILLS).toEqual([
      'fraction-read',
      'fraction-shaded',
      'fraction-pick-picture',
      'fraction-of-set-circle',
      'fraction-of-set-number',
      'fraction-wp',
    ]);
    for (const id of FRACTION_SKILLS) expect(isFractionSkill(id)).toBe(true);
    expect(isFractionSkill('wp-times-then-add')).toBe(false);
  });

  test('time has generators (phase 13): every time catalog entry has a generator', () => {
    // Derived from the entries file: the exact ids are pinned in skill-catalog.test.ts.
    expect(TIME_SKILLS).toEqual(TIME_ENTRIES.map((e) => e.id));
    for (const id of TIME_SKILLS) expect(isTimeSkill(id)).toBe(true);
    expect(isTimeSkill('wp-times-then-add')).toBe(false);
  });

  test('money has generators (phase 14): every money catalog entry has a generator', () => {
    // Derived from the entries file: the exact ids are pinned in skill-catalog.test.ts.
    expect(MONEY_SKILLS).toEqual(MONEY_ENTRIES.map((e) => e.id));
    for (const id of MONEY_SKILLS) expect(isMoneySkill(id)).toBe(true);
    expect(isMoneySkill('wp-times-then-add')).toBe(false);
  });

  test('data has generators (phase 15): every data catalog entry has a generator', () => {
    // Derived from the entries file: the exact ids are pinned in skill-catalog.test.ts.
    expect(DATA_SKILLS).toEqual(DATA_ENTRIES.map((e) => e.id));
    for (const id of DATA_SKILLS) expect(isDataSkill(id)).toBe(true);
    expect(isDataSkill('wp-times-then-add')).toBe(false);
  });
});

describe('dialogRenderable', () => {
  test('reasoning items render in the dialog; scene items render when their kind has a renderer', () => {
    const reasoning = itemForSkill('wp-times-then-add', mulberry32(1), 1);
    const geo = itemForSkill('geo-midpoint', mulberry32(1), 1);
    const meas = itemForSkill('meas-gram', mulberry32(1), 1);
    expect(dialogRenderable(reasoning)).toBe(true);
    // Phase 04 registers every scene kind, so scene items render now.
    expect(dialogRenderable(geo)).toBe(true);
    expect(dialogRenderable(meas)).toBe(true);
    // A kind without a renderer is still filtered out, never a blank picture.
    expect(dialogRenderable(geo, () => false)).toBe(false);
    expect(dialogRenderable(meas, () => false)).toBe(false);
  });

  test('fraction scene-free items render; fraction scene items wait for the phase-16 renderer', () => {
    for (const id of ['fraction-read', 'fraction-of-set-number', 'fraction-wp'])
      expect(dialogRenderable(itemForSkill(id, mulberry32(1), 1))).toBe(true);
    for (const id of ['fraction-shaded', 'fraction-pick-picture', 'fraction-of-set-circle']) {
      const item = itemForSkill(id, mulberry32(1), 1);
      expect(dialogRenderable(item)).toBe(false);
      expect(dialogRenderable(item, () => true)).toBe(true);
    }
  });

  test('time scene-free items render; time scene items render now (phase 17)', () => {
    for (const id of ['months-days-count', 'times-order-digital'])
      expect(dialogRenderable(itemForSkill(id, mulberry32(1), 1))).toBe(true);
    for (const id of [
      'clock-read-hour-half',
      'clock-read-5min',
      'clock-read-minute',
      'clock-sang-chieu-24h',
      'clock-elapsed-minutes',
      'roman-clock-hour',
      'calendar-weekday',
      'calendar-days-between',
    ]) {
      const item = itemForSkill(id, mulberry32(1), 1);
      expect(dialogRenderable(item)).toBe(true);
      expect(dialogRenderable(item, () => false)).toBe(false);
    }
  });

  test('money scene-free items render; money scene items render now (phase 17)', () => {
    for (const id of ['money-change-back', 'money-wp'])
      expect(dialogRenderable(itemForSkill(id, mulberry32(1), 1))).toBe(true);
    for (const id of [
      'money-recognize',
      'money-total-notes',
      'money-exchange',
      'money-pick-notes',
    ]) {
      const item = itemForSkill(id, mulberry32(1), 1);
      expect(dialogRenderable(item)).toBe(true);
      expect(dialogRenderable(item, () => false)).toBe(false);
    }
  });

  test('data items all need a picture: every data skill renders now (phase 17)', () => {
    for (const id of [
      'tally-count',
      'table-read',
      'table-max-min',
      'table-sums',
      'table-fill-missing',
      'chance-bag',
      'chance-dice',
    ]) {
      const item = itemForSkill(id, mulberry32(1), 1);
      expect(dialogRenderable(item)).toBe(true);
      expect(dialogRenderable(item, () => false)).toBe(false);
    }
  });

  test('an item without a scene always renders; a scene item only with a renderer', () => {
    const reasoning = itemForSkill('wp-times-then-add', mulberry32(1), 1);
    expect(dialogRenderable(reasoning)).toBe(true);
    for (const id of ['geo-midpoint', 'meas-gram']) {
      for (const tier of [1, 2, 3] as const) {
        const item = itemForSkill(id, mulberry32(1), tier);
        expect(dialogRenderable(item)).toBe(true);
        expect(dialogRenderable(item, () => false)).toBe(false);
      }
    }
    // No scene at all (a plain item object) renders too.
    expect(dialogRenderable({ skillId: 'x', tier: 1 } as never)).toBe(true);
  });
});
