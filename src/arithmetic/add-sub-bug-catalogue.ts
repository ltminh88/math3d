// Bug catalogue (boost, Phase 1A): the eight classic add/sub bugs, each as a pure
// wrong-value function over the operands. The catalogue never guesses: a bug
// "applies" only when its value differs from the correct answer, is >= 0 and
// is distinct from every earlier bug's value (see bugsFor). Bug ids are the
// Phase 0 Misconception ids, in Phase 0 order (reasoning-types.ts).
//
//   add: forgot-carry, carry-not-added, misaligned-columns, second-regroup-dropped
//   sub: smaller-from-larger, borrow-no-decrement, zero-borrow-skip,
//        zero-minus-n-zero, misaligned-columns, second-regroup-dropped
//
// Collisions are real and documented: 403 − 158 → 355 comes from three bugs
// (smaller-from-larger, borrow-no-decrement, zero-borrow-skip); bugsFor keeps
// the first in catalogue order. Per-bug function tests assert each rule on its
// own research example, independently of tagging order.
//
// The bug values live in two files (R103.2, the 200-line limit): the add-only
// bugs and the shared helpers in add-sub-bug-catalogue-add.ts, the sub-only
// bugs in add-sub-bug-catalogue-sub.ts. This file is the public API: the
// types, the order, and the dispatch.

import type { Misconception } from '../reasoning/reasoning-types';
import { addBugValue } from './add-sub-bug-catalogue-add';
import { subBugValue } from './add-sub-bug-catalogue-sub';

export type AddSubBug = Extract<
  Misconception,
  | 'forgot-carry'
  | 'carry-not-added'
  | 'smaller-from-larger'
  | 'borrow-no-decrement'
  | 'zero-borrow-skip'
  | 'zero-minus-n-zero'
  | 'misaligned-columns'
  | 'second-regroup-dropped'
>;

export const ADD_SUB_BUG_ORDER: readonly AddSubBug[] = [
  'forgot-carry',
  'carry-not-added',
  'smaller-from-larger',
  'borrow-no-decrement',
  'zero-borrow-skip',
  'zero-minus-n-zero',
  'misaligned-columns',
  'second-regroup-dropped',
];

export type AddSubOp = '+' | '−';

/**
 * The wrong value a child with this bug produces for `a op b`. A bug from the
 * other operation returns the correct value (so bugsFor filters it out).
 */
export const bugValue = (bug: AddSubBug, a: number, b: number, op: AddSubOp): number =>
  op === '+' ? addBugValue(bug, a, b) : subBugValue(bug, a, b);

export interface BugHit {
  readonly bug: AddSubBug;
  readonly value: number;
}

/**
 * The bugs that apply to `a op b`, in catalogue order, each with its distinct
 * wrong value. A bug is skipped when its value equals the correct answer, is
 * negative, or collides with an earlier bug's value (the first one wins).
 */
export const bugsFor = (a: number, b: number, op: AddSubOp): readonly BugHit[] => {
  const correct = op === '+' ? a + b : a - b;
  const seen = new Set<number>();
  const out: BugHit[] = [];
  for (const bug of ADD_SUB_BUG_ORDER) {
    const value = bugValue(bug, a, b, op);
    if (value === correct || value < 0 || seen.has(value)) continue;
    seen.add(value);
    out.push({ bug, value });
  }
  return out;
};
