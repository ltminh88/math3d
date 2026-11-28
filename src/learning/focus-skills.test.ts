// Focus skills (boost, Phase 4A): the fixed set is 21 add/sub ids + 10 length ids,
// every one a catalog id with a generator.
import { describe, expect, it } from 'vitest';
import {
  FOCUS_SKILL_IDS,
  focusGroupOf,
  focusSkillsValid,
  isFocusSkillId,
  isFocusSkillKey,
} from './focus-skills';

describe('FOCUS_SKILL_IDS', () => {
  it('has 31 ids, no duplicates', () => {
    expect(FOCUS_SKILL_IDS).toHaveLength(31);
    expect(new Set(FOCUS_SKILL_IDS).size).toBe(31);
  });

  it('every id is a catalog id with a generator', () => {
    expect(focusSkillsValid()).toBe(true);
  });

  it('covers the add/sub ids (B2, B54/55/63/64 calc, 1A/2A/3A formats)', () => {
    for (const id of [
      'add-sub-1000',
      'add-sub-1000-wp',
      'add-sub-find-error',
      'add-missing-digit',
      'add-4digit',
      'sub-5digit',
      'add-sub-10000-wp',
      'add-sub-bug-choice',
      'add-sub-true-false',
      'add-sub-column',
      'add-sub-match',
      'add-sub-10000-bug-choice',
      'add-sub-100000-bug-choice',
    ])
      expect(isFocusSkillId(id)).toBe(true);
  });

  it('covers the length ids (ruler, mm-convert, every meas-len-*)', () => {
    for (const id of [
      'meas-ruler-read',
      'meas-mm-convert',
      'meas-len-ladder',
      'meas-len-convert',
      'meas-len-convert-far',
      'meas-len-compare',
      'meas-len-order',
      'meas-len-choose-unit',
      'meas-len-mixed',
      'meas-len-add-sub',
    ])
      expect(isFocusSkillId(id)).toBe(true);
  });

  it('excludes other families (tables skills, ×/÷ formats, unknown-add-sub)', () => {
    for (const id of [
      'unknown-add-sub',
      'mul-2d-1d',
      'meas-gram',
      'meas-perimeter-rect',
      'en-letters-a-d',
    ])
      expect(isFocusSkillId(id)).toBe(false);
  });
});

describe('isFocusSkillKey / focusGroupOf', () => {
  it('keys are sk:-prefixed focus ids', () => {
    expect(isFocusSkillKey('sk:add-sub-1000')).toBe(true);
    expect(isFocusSkillKey('sk:meas-len-order')).toBe(true);
    expect(isFocusSkillKey('mul:3x4')).toBe(false);
    expect(isFocusSkillKey('sk:mul-2d-1d')).toBe(false);
  });

  it('meas-* ids are length, the rest add-sub', () => {
    expect(focusGroupOf('meas-mm-convert')).toBe('length');
    expect(focusGroupOf('meas-len-add-sub')).toBe('length');
    expect(focusGroupOf('add-sub-1000')).toBe('add-sub');
    expect(focusGroupOf('add-sub-column')).toBe('add-sub');
  });
});
