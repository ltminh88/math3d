// Bug catalogue (boost, Phase 1B): every wrong value a bug predicts, table-tested
// against the catalogue itself — the generator sweep checks each wrong option
// against these same functions, so a bug and its value never drift apart.
import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import { ref } from '../reasoning/reasoning-distractors';
import {
  bugConvertValue,
  bugMixedPair,
  bugMixedValue,
  dedupeCandidates,
  lenQtyChoiceStep,
  lenTextChoiceStep,
} from './length-bug-catalogue';

describe('length bug catalogue', () => {
  it('unit-direction is the inverse factor, only when it stays whole and <= 1000', () => {
    // 100 m -> dm: the child divides by 10 instead of multiplying: 10 m.
    expect(bugConvertValue('unit-direction', 100, 'm', 'dm')).toBe(10);
    // 100 dm -> m: the child multiplies by 10 instead of dividing: 1000 dm.
    expect(bugConvertValue('unit-direction', 100, 'dm', 'm')).toBe(1000);
    // 3 m -> cm: the inverse (3 cm -> m) is not whole, so the bug has no value.
    expect(bugConvertValue('unit-direction', 3, 'm', 'cm')).toBeNull();
    // 30 cm -> m: the true conversion (0.3 m) is not whole, so no bug value.
    expect(bugConvertValue('unit-direction', 30, 'cm', 'm')).toBeNull();
  });

  it('unit-factor is one x10 step on far jumps only', () => {
    expect(bugConvertValue('unit-factor', 3, 'm', 'cm')).toBe(30);
    expect(bugConvertValue('unit-factor', 300, 'cm', 'm')).toBe(30);
    expect(bugConvertValue('unit-factor', 1, 'm', 'mm')).toBe(10);
    expect(bugConvertValue('unit-factor', 3, 'm', 'dm')).toBeNull();
    expect(bugConvertValue('unit-factor', 5, 'cm', 'mm')).toBeNull();
  });

  it('dm-skipped jumps two x10 steps on m<->mm only', () => {
    expect(bugConvertValue('dm-skipped', 1, 'm', 'mm')).toBe(100);
    expect(bugConvertValue('dm-skipped', 1000, 'mm', 'm')).toBe(10);
    expect(bugConvertValue('dm-skipped', 3, 'm', 'cm')).toBeNull();
  });

  it('ignore-unit keeps the bare number', () => {
    expect(bugConvertValue('ignore-unit', 3, 'm', 'cm')).toBe(3);
    expect(bugConvertValue('ignore-unit', 300, 'cm', 'm')).toBe(300);
  });

  it('mixed-concat glues the digits; drop-big keeps only the small part', () => {
    expect(bugMixedValue('mixed-concat', 1, 'm', 5, 'cm', 'cm')).toBe(15);
    expect(bugMixedValue('mixed-drop-big', 1, 'm', 5, 'cm', 'cm')).toBe(5);
    // 5 cm 4 mm: gluing the digits IS the answer (54 mm), so no concat value.
    expect(bugMixedValue('mixed-concat', 5, 'cm', 4, 'mm', 'mm')).toBeNull();
    expect(bugMixedValue('mixed-drop-big', 5, 'cm', 4, 'mm', 'mm')).toBe(4);
  });

  it('mixed unit-factor converts the big part one step short', () => {
    // 1 m 5 cm -> cm: 1 m as 10 cm (one x10) + 5 cm = 15 — the same digits
    // as concat, so the generator's dedupe keeps the first tag.
    expect(bugMixedValue('unit-factor', 1, 'm', 5, 'cm', 'cm')).toBe(15);
    // 2 dm 3 cm -> cm: 2 dm as 2 cm + 3 cm = 5.
    expect(bugMixedValue('unit-factor', 2, 'dm', 3, 'cm', 'cm')).toBe(5);
    // 5 cm 4 mm -> mm: 5 cm as 5 mm + 4 mm = 9.
    expect(bugMixedValue('unit-factor', 5, 'cm', 4, 'mm', 'mm')).toBe(9);
  });

  it('mixed pairs: unit-factor divides the big part by 10, ignore-unit drops it', () => {
    expect(bugMixedPair('unit-factor', 1050, 'm', 'cm')).toEqual({ big: 10, small: 5 });
    expect(bugMixedPair('ignore-unit', 1050, 'm', 'cm')).toEqual({ big: 0, small: 105 });
    expect(bugMixedPair('unit-factor', 230, 'dm', 'cm')).toEqual({ big: 23, small: 0 });
    expect(bugMixedPair('ignore-unit', 230, 'dm', 'cm')).toEqual({ big: 0, small: 23 });
  });

  it('dedupeCandidates keeps the first bug on a value clash', () => {
    expect(
      dedupeCandidates(
        [
          { value: 15, misconception: 'mixed-concat' },
          { value: 15, misconception: 'unit-factor' },
          { value: 5, misconception: 'mixed-drop-big' },
        ],
        105,
      ),
    ).toEqual([
      { value: 15, misconception: 'mixed-concat' },
      { value: 5, misconception: 'mixed-drop-big' },
    ]);
  });

  it('lenQtyChoiceStep offers 3-4 whole options in range, exactly one correct', () => {
    const step = lenQtyChoiceStep(mulberry32(7), ref('askNumber'), 105, 'cm', [
      { value: 15, misconception: 'mixed-concat' },
      { value: 5, misconception: 'mixed-drop-big' },
    ]);
    expect(step.kind).toBe('choice');
    if (step.kind !== 'choice') throw new Error('not a choice');
    expect(step.options.length).toBeGreaterThanOrEqual(3);
    expect(step.options.length).toBeLessThanOrEqual(4);
    expect(step.options.filter((o) => o.correct)).toHaveLength(1);
    for (const o of step.options) {
      expect(Number(o.label.params?.n)).toBeGreaterThan(0);
      expect(Number(o.label.params?.n)).toBeLessThanOrEqual(1000);
    }
  });

  it('lenTextChoiceStep offers at most 4 options, exactly one correct', () => {
    const step = lenTextChoiceStep(
      mulberry32(7),
      ref('lenPickSign'),
      '>',
      [
        { value: '<', misconception: 'unit-direction' },
        { value: '=', misconception: 'near-miss' },
      ],
      (s) => ref('lenSign', { s }),
    );
    expect(step.kind).toBe('choice');
    if (step.kind !== 'choice') throw new Error('not a choice');
    expect(step.options).toHaveLength(3);
    expect(step.options.filter((o) => o.correct)).toHaveLength(1);
  });
});
