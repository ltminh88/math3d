import { describe, expect, it } from 'vitest';
import { isSkillId, SKILL_CATALOG, SKILL_ID_PATTERN_SOURCE, skillsOfFamily } from './skill-catalog';

// Frozen copy of the shipped ids, in order: the catalog is append-only (save codes, SQL check).
const SHIPPED_IDS = [
  'wp-times-then-add',
  'wp-divide-then-add',
  'wp-more-less-then-total',
  'wp-unit-then-times',
  'wp-times-compare',
  'div-rem-floor',
  'div-rem-ceil',
  'unknown-add-sub',
  'unknown-mul-div',
  'pattern-add',
  'pattern-sub',
  'pattern-skip-count',
  'expr-order',
  'expr-brackets',
  'expr-from-story',
  'choose-all-correct',
  'tf-explain',
  'wp-difference-compare',
  'geo-midpoint',
  'geo-circle-parts',
  'geo-radius-diameter',
  'geo-right-angle',
  'geo-count-right-angles',
  'geo-shape-classify',
  'geo-shape-count',
  'geo-solid-identify',
  'geo-solid-parts',
  'meas-ruler-read',
  'meas-mm-convert',
  'meas-gram',
  'meas-ml',
  'meas-temperature',
  'meas-perimeter-polygon',
  'meas-perimeter-rect',
  'meas-perimeter-square',
  'meas-area-count',
  'meas-area-rect',
  'meas-area-square',
  'meas-wp-fence',
];

describe('skill catalog', () => {
  it('only appends: the shipped ids keep their order and spelling', () => {
    expect(SKILL_CATALOG.slice(0, SHIPPED_IDS.length).map((s) => s.id)).toEqual(SHIPPED_IDS);
  });

  it('ids are unique, match the key grammar and carry a family and a KNTT lesson', () => {
    const pattern = new RegExp(`^${SKILL_ID_PATTERN_SOURCE}$`);
    expect(new Set(SKILL_CATALOG.map((s) => s.id)).size).toBe(SKILL_CATALOG.length);
    for (const s of SKILL_CATALOG) {
      expect(pattern.test(s.id), s.id).toBe(true);
      expect(s.lesson).toMatch(/^T[12] /);
    }
  });

  it('accepts only catalog ids', () => {
    expect(isSkillId('expr-brackets')).toBe(true);
    for (const bad of ['', 'expr-bracket', 'Expr-brackets', 'a', '1abc', `a${'b'.repeat(39)}`])
      expect(isSkillId(bad), bad).toBe(false);
  });

  it('groups skills by family', () => {
    expect(skillsOfFamily('remainder')).toEqual(['div-rem-floor', 'div-rem-ceil']);
    expect(skillsOfFamily('geometry')).toHaveLength(9);
    expect(skillsOfFamily('measurement')).toHaveLength(12);
  });
});
