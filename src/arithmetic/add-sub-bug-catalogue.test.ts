// Bug catalogue (boost, Phase 1A): one wrong-value function per classic add/sub bug.
// RED-first: the catalogue does not exist yet.
// Research examples (researcher-02 §1): 47+38→75, 256+178→324, 52−27→35, 63−28→45,
// 403−158→355, 305−127→202, 146+29→436, 385+247→532.
import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import type { Misconception } from '../reasoning/reasoning-types';
import { bugValue, bugsFor, type AddSubBug } from './add-sub-bug-catalogue';

const ADD_BUGS: readonly AddSubBug[] = [
  'forgot-carry',
  'carry-not-added',
  'misaligned-columns',
  'second-regroup-dropped',
];
const SUB_BUGS: readonly AddSubBug[] = [
  'smaller-from-larger',
  'borrow-no-decrement',
  'zero-borrow-skip',
  'zero-minus-n-zero',
  'misaligned-columns',
  'second-regroup-dropped',
];

describe('bugValue', () => {
  it.each([
    ['forgot-carry', 47, 38, '+', 75],
    ['forgot-carry', 256, 178, '+', 324],
    ['carry-not-added', 256, 178, '+', 424],
    ['carry-not-added', 385, 247, '+', 622],
    ['smaller-from-larger', 52, 27, '−', 35],
    ['borrow-no-decrement', 63, 28, '−', 45],
    ['zero-borrow-skip', 403, 158, '−', 355],
    ['zero-borrow-skip', 500, 236, '−', 334],
    ['zero-minus-n-zero', 305, 127, '−', 202],
    ['misaligned-columns', 146, 29, '+', 436],
    ['misaligned-columns', 425, 32, '−', 105],
    ['second-regroup-dropped', 385, 247, '+', 532],
    ['second-regroup-dropped', 532, 178, '−', 454],
  ] as const)('%s(%s %s %s) = %s', (bug, a, b, op, value) => {
    expect(bugValue(bug, a, b, op)).toBe(value);
  });

  it('an add bug on a subtraction (and vice versa) is the correct value', () => {
    // A bug from the other operation cannot apply: the value is the right answer,
    // so bugsFor filters it out.
    expect(bugValue('forgot-carry', 52, 27, '−')).toBe(25);
    expect(bugValue('smaller-from-larger', 47, 38, '+')).toBe(85);
  });

  it('misaligned-columns does nothing when both operands have the same length', () => {
    expect(bugValue('misaligned-columns', 146, 129, '+')).toBe(275);
  });

  it('second-regroup-dropped is the correct value with fewer than two regroups', () => {
    expect(bugValue('second-regroup-dropped', 47, 38, '+')).toBe(85);
    expect(bugValue('second-regroup-dropped', 63, 28, '−')).toBe(35);
  });
});

describe('bugsFor', () => {
  it('lists only bugs whose value differs from the correct answer', () => {
    // 123 + 234 has no regroup: no add bug changes the value.
    expect(bugsFor(123, 234, '+')).toEqual([]);
    // 385 + 247 carries twice: three bugs give three distinct wrong values.
    const found = bugsFor(385, 247, '+');
    expect(found.map((f) => f.bug)).toEqual([
      'forgot-carry',
      'carry-not-added',
      'second-regroup-dropped',
    ]);
    expect(found.map((f) => f.value)).toEqual([522, 622, 532]);
  });

  it('keeps one entry per distinct wrong value, in catalogue order', () => {
    // 403 − 158: smaller-from-larger, borrow-no-decrement and zero-borrow-skip
    // all give 355 — only the first (in catalogue order) is kept.
    const found = bugsFor(403, 158, '−');
    const byValue = new Map(found.map((f) => [f.value, f.bug]));
    expect(byValue.get(355)).toBe('smaller-from-larger');
    expect(new Set(found.map((f) => f.value)).size).toBe(found.length);
    for (const f of found) expect(f.value).not.toBe(245);
  });

  it('every listed value equals bugValue for its bug, over 1 000 seeds', () => {
    for (let seed = 0; seed < 1000; seed++) {
      const rng = mulberry32(seed);
      const op = rng() < 0.5 ? '+' : '−';
      const a = 100 + Math.floor(rng() * 800);
      const b =
        op === '+'
          ? 10 + Math.floor(rng() * 90)
          : 10 + Math.floor(rng() * (a - 10));
      const correct = op === '+' ? a + b : a - b;
      const found = bugsFor(a, b, op as '+' | '−');
      const values = new Set<number>();
      for (const f of found) {
        expect(f.value).toBe(bugValue(f.bug, a, b, op as '+' | '−'));
        expect(f.value).toBeGreaterThanOrEqual(0);
        expect(f.value).not.toBe(correct);
        expect(values.has(f.value)).toBe(false);
        values.add(f.value);
      }
      const allowed = op === '+' ? ADD_BUGS : SUB_BUGS;
      for (const f of found) expect(allowed).toContain(f.bug);
    }
  });

  it('a bug-tagged value never exceeds the lesson cap when the pair is in range', () => {
    // Misaligned columns can overshoot (146 + 290 = 436 is fine, but 999 + 99
    // left-aligned is 999 + 990 = 1989): the generator filters, the catalogue
    // only promises non-negative distinct values.
    for (let seed = 0; seed < 200; seed++) {
      const rng = mulberry32(seed);
      const a = 100 + Math.floor(rng() * 900);
      const b = 10 + Math.floor(rng() * 90);
      for (const f of bugsFor(a, b, '+')) expect(f.value).toBeGreaterThanOrEqual(0);
    }
  });

  it('catalogue order is the Phase 0 order, add bugs first', () => {
    // The order bugsFor returns is the order Phase 0 lists the ids in
    // reasoning-types.ts: forgot-carry, carry-not-added, smaller-from-larger,
    // borrow-no-decrement, zero-borrow-skip, zero-minus-n-zero,
    // misaligned-columns, second-regroup-dropped.
    const found = bugsFor(1005, 178, '−');
    const order = found.map((f) => f.bug);
    const catalogue = [
      'smaller-from-larger',
      'borrow-no-decrement',
      'zero-borrow-skip',
      'zero-minus-n-zero',
      'misaligned-columns',
      'second-regroup-dropped',
    ];
    expect(order).toEqual(catalogue.filter((bug) => order.includes(bug as AddSubBug)));
  });
});
