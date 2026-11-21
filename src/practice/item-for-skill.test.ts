// Dispatcher (phase 00): one skill id -> the item its family generates; only unknown
// ids throw. A geo/meas item carries a `scene` the dialog cannot draw yet (phase 04),
// so daily filters those skills out instead of crashing on them.
import { describe, expect, test } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import { SKILL_CATALOG } from '../learning/skill-catalog';
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

describe('dialogRenderable', () => {
  test('reasoning items render in the dialog; scene items do not', () => {
    const reasoning = itemForSkill('wp-times-then-add', mulberry32(1), 1);
    const geo = itemForSkill('geo-midpoint', mulberry32(1), 1);
    const meas = itemForSkill('meas-gram', mulberry32(1), 1);
    expect(dialogRenderable(reasoning)).toBe(true);
    expect(dialogRenderable(geo)).toBe(false);
    expect(dialogRenderable(meas)).toBe(false);
  });

  test('an id renders exactly when its family has no scene', () => {
    expect(dialogRenderable('wp-times-then-add')).toBe(true);
    expect(dialogRenderable('geo-midpoint')).toBe(false);
    expect(dialogRenderable('meas-gram')).toBe(false);
    expect(dialogRenderable('not-a-skill')).toBe(false);
  });
});
