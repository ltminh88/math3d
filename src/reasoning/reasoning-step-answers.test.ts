import { describe, expect, it } from 'vitest';
import {
  firstMisplacedTile,
  firstWrongPair,
  isStepAnswerCorrect,
  orderBug,
  playableSteps,
  toggleSelection,
  wrongAnswerBug,
} from './reasoning-step-answers';
import type { ReasoningItem, ReasoningStep } from './reasoning-types';

const opt = (id: string, correct: boolean) => ({
  id,
  label: { key: 'num', params: { n: id.length } },
  correct,
  ...(correct ? {} : { misconception: 'near-miss' as const }),
});
const p = { key: 'askValue' };

describe('reasoning step answers', () => {
  it('checks number, choice, multi and verdict answers', () => {
    const num: ReasoningStep = { kind: 'number', prompt: p, answer: 12 };
    expect(isStepAnswerCorrect(num, 12)).toBe(true);
    expect(isStepAnswerCorrect(num, 21)).toBe(false);
    expect(isStepAnswerCorrect(num, '12')).toBe(false);

    const choice: ReasoningStep = {
      kind: 'choice',
      prompt: p,
      options: [opt('a', true), opt('b', false)],
    };
    expect(isStepAnswerCorrect(choice, 'a')).toBe(true);
    expect(isStepAnswerCorrect(choice, 'b')).toBe(false);

    const multi: ReasoningStep = {
      kind: 'multi',
      prompt: p,
      options: [opt('a', true), opt('b', false), opt('c', true)],
    };
    expect(isStepAnswerCorrect(multi, ['c', 'a'])).toBe(true);
    expect(isStepAnswerCorrect(multi, ['a'])).toBe(false);
    expect(isStepAnswerCorrect(multi, ['a', 'b', 'c'])).toBe(false);

    const verdict: ReasoningStep = { kind: 'verdict', prompt: p, statement: p, answer: false };
    expect(isStepAnswerCorrect(verdict, false)).toBe(true);
    expect(isStepAnswerCorrect(verdict, true)).toBe(false);

    const setClock: ReasoningStep = {
      kind: 'set-clock',
      prompt: p,
      h: 3,
      m: 25,
      snapMinutes: 5,
    };
    expect(isStepAnswerCorrect(setClock, { h: 3, m: 25 })).toBe(true);
    expect(isStepAnswerCorrect(setClock, { h: 4, m: 25 })).toBe(false);
    expect(isStepAnswerCorrect(setClock, { h: 3, m: 30 })).toBe(false);
    expect(isStepAnswerCorrect(setClock, 325)).toBe(false);
    expect(isStepAnswerCorrect(setClock, '3:25')).toBe(false);
  });

  it('checks order answers and names the first misplaced tile', () => {
    const tiles = [{ key: 't0' }, { key: 't1' }, { key: 't2' }];
    const order: ReasoningStep = { kind: 'order', prompt: p, tiles, answer: [2, 0, 1] };
    expect(isStepAnswerCorrect(order, [2, 0, 1])).toBe(true);
    expect(isStepAnswerCorrect(order, [2, 1, 0])).toBe(false);
    expect(isStepAnswerCorrect(order, [0, 2, 1])).toBe(false);
    expect(isStepAnswerCorrect(order, [2, 0])).toBe(false);
    expect(isStepAnswerCorrect(order, [2, 0, 1, 2])).toBe(false);
    expect(isStepAnswerCorrect(order, '201')).toBe(false);
    expect(firstMisplacedTile(order, [2, 0, 1])).toBeNull();
    expect(firstMisplacedTile(order, [2, 1, 0])).toBe(1);
    expect(firstMisplacedTile(order, [0, 2, 1])).toBe(0);
    expect(firstMisplacedTile(order, [2, 0])).toBe(2);
  });

  it('names the bug a wrong order stands for (R90.2)', () => {
    // Tiles as meas-len-order emits them (lenQty {n, unit}); display order
    // 1 m, 20 cm, 300 mm — correct smallest-first is [1, 2, 0].
    const tiles = [
      { key: 'lenQty', params: { n: 1, unit: 'm' } },
      { key: 'lenQty', params: { n: 20, unit: 'cm' } },
      { key: 'lenQty', params: { n: 300, unit: 'mm' } },
    ];
    const order: ReasoningStep = { kind: 'order', prompt: p, tiles, answer: [1, 2, 0] };
    expect(orderBug(order, [1, 2, 0])).toBeUndefined();
    // Exact reverse of the correct order: largest first — direction error.
    expect(orderBug(order, [0, 2, 1])).toBe('unit-direction');
    // Sorted by the bare numbers (1, 20, 300) while ignoring the units.
    expect(orderBug(order, [0, 1, 2])).toBe('ignore-unit');
    // Wrong but neither known order: no bug.
    expect(orderBug(order, [2, 1, 0])).toBeUndefined();
    expect(orderBug(order, '120')).toBeUndefined();
    // Tiles without a numeric param: the bare-number check cannot apply.
    const plain: ReasoningStep = {
      kind: 'order',
      prompt: p,
      tiles: [{ key: 't0' }, { key: 't1' }, { key: 't2' }],
      answer: [2, 0, 1],
    };
    expect(orderBug(plain, [0, 2, 1])).toBeUndefined();
    expect(orderBug(plain, [1, 0, 2])).toBe('unit-direction');
  });

  it('names the bug a wrong answer stands for (3B)', () => {
    // Choice / multi: the picked option's misconception, when tagged.
    const choice: ReasoningStep = {
      kind: 'choice',
      prompt: p,
      options: [opt('a', true), opt('b', false)],
    };
    expect(wrongAnswerBug(choice, 'b')).toBe('near-miss');
    expect(wrongAnswerBug(choice, 'a')).toBeUndefined();
    const untagged: ReasoningStep = {
      kind: 'choice',
      prompt: p,
      options: [
        { id: 'a', label: { key: 'num', params: { n: 1 } }, correct: true },
        { id: 'b', label: { key: 'num', params: { n: 2 } }, correct: false },
      ],
    };
    expect(wrongAnswerBug(untagged, 'b')).toBeUndefined();
    // Order: the orderBug verdict (same fixture as the R90.2 test).
    const tiles = [
      { key: 'lenQty', params: { n: 1, unit: 'm' } },
      { key: 'lenQty', params: { n: 20, unit: 'cm' } },
      { key: 'lenQty', params: { n: 300, unit: 'mm' } },
    ];
    const order: ReasoningStep = { kind: 'order', prompt: p, tiles, answer: [1, 2, 0] };
    expect(wrongAnswerBug(order, [0, 2, 1])).toBe('unit-direction');
    expect(wrongAnswerBug(order, [0, 1, 2])).toBe('ignore-unit');
    expect(wrongAnswerBug(order, [2, 1, 0])).toBeUndefined();
    expect(wrongAnswerBug(order, [1, 2, 0])).toBeUndefined();
    // Match: the first wrong pair's right option's bug.
    const left = [{ key: 'l0' }, { key: 'l1' }, { key: 'l2' }];
    const right = [
      { label: { key: 'r0' } },
      { label: { key: 'r1' }, misconception: 'unit-direction' as const },
      { label: { key: 'r2' } },
    ];
    const match: ReasoningStep = { kind: 'match', prompt: p, left, right, pairs: [2, 0, 1] };
    expect(wrongAnswerBug(match, [2, 1, 0])).toBe('unit-direction');
    expect(wrongAnswerBug(match, [2, 0, 1])).toBeUndefined();
    // A number, a verdict or a clock set never stands for a bug.
    const num: ReasoningStep = { kind: 'number', prompt: p, answer: 12 };
    expect(wrongAnswerBug(num, 21)).toBeUndefined();
    expect(wrongAnswerBug(undefined, 'b')).toBeUndefined();
    expect(wrongAnswerBug(choice, 5)).toBeUndefined();
  });

  it('checks match answers and names the first wrong pair with its bug', () => {
    const left = [{ key: 'l0' }, { key: 'l1' }, { key: 'l2' }];
    const right = [
      { label: { key: 'r0' } },
      { label: { key: 'r1' }, misconception: 'unit-direction' as const },
      { label: { key: 'r2' } },
    ];
    const match: ReasoningStep = { kind: 'match', prompt: p, left, right, pairs: [2, 0, 1] };
    expect(isStepAnswerCorrect(match, [2, 0, 1])).toBe(true);
    expect(isStepAnswerCorrect(match, [2, 1, 0])).toBe(false);
    expect(isStepAnswerCorrect(match, [0, 2, 1])).toBe(false);
    expect(isStepAnswerCorrect(match, [2, 0])).toBe(false);
    expect(firstWrongPair(match, [2, 0, 1])).toBeNull();
    // left 1 paired with right 1 (the tagged option): the bug rides along.
    expect(firstWrongPair(match, [2, 1, 0])).toEqual({
      left: 1,
      right: 1,
      misconception: 'unit-direction',
    });
    // left 0 paired with right 0 (untagged): no bug to record.
    expect(firstWrongPair(match, [0, 2, 1])).toEqual({
      left: 0,
      right: 0,
      misconception: undefined,
    });
  });

  it('plays a false verdict with a fix as verdict, then a number step', () => {
    const fix = { prompt: { key: 'fixRem' }, answer: 1 };
    const item: ReasoningItem = {
      skillId: 'tf-explain',
      tier: 1,
      story: p,
      steps: [{ kind: 'verdict', prompt: p, statement: p, answer: false, fix }],
      work: [],
    };
    const steps = playableSteps(item);
    expect(steps.map((s) => s.kind)).toEqual(['verdict', 'number']);
    expect(steps[1]).toEqual({ kind: 'number', prompt: fix.prompt, answer: 1 });
  });

  it('toggles a multi selection', () => {
    expect(toggleSelection([], 'a')).toEqual(['a']);
    expect(toggleSelection(['a', 'b'], 'a')).toEqual(['b']);
  });
});
