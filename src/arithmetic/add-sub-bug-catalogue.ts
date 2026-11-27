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

import type { Misconception } from '../reasoning/reasoning-types';
import { wrongAddByForgotCarry, wrongSubByNoBorrow } from './arithmetic-distractors';

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

/** Least-significant-first digits of a non-negative integer. */
const digitsOf = (n: number): readonly number[] => {
  if (n === 0) return [0];
  const out: number[] = [];
  for (let rest = Math.floor(n); rest > 0; rest = Math.floor(rest / 10)) {
    out.push(rest % 10);
  }
  return out;
};

const fromDigits = (digits: readonly number[]): number => {
  let value = 0;
  for (let i = digits.length - 1; i >= 0; i--) value = value * 10 + (digits[i] ?? 0);
  return value;
};

/** Add, but the carry out of the units column is dropped (forced to 0). */
const carryNotAdded = (a: number, b: number): number => {
  const da = digitsOf(a);
  const db = digitsOf(b);
  const n = Math.max(da.length, db.length);
  const out: number[] = [];
  let carry = 0;
  for (let i = 0; i < n; i++) {
    const sum = (da[i] ?? 0) + (db[i] ?? 0) + carry;
    out.push(sum % 10);
    carry = i === 0 ? 0 : Math.floor(sum / 10);
  }
  if (carry > 0) out.push(carry);
  return fromDigits(out);
};

/** Subtract, but the borrow-in is never subtracted from the lending digit. */
const borrowNoDecrement = (a: number, b: number): number => {
  const da = digitsOf(a);
  const db = digitsOf(b);
  const n = Math.max(da.length, db.length);
  const out: number[] = [];
  let borrowIn = false;
  for (let i = 0; i < n; i++) {
    const daDigit = da[i] ?? 0;
    const dbDigit = db[i] ?? 0;
    out.push((((daDigit - dbDigit + (borrowIn ? 10 : 0)) % 10) + 10) % 10);
    borrowIn = daDigit - dbDigit < 0;
  }
  return fromDigits(out);
};

/**
 * Subtract, but when a borrow-in hits a zero digit of the minuend the digit is
 * written as the subtrahend digit and the borrow is absorbed (no borrow out).
 */
const zeroBorrowSkip = (a: number, b: number): number => {
  const da = digitsOf(a);
  const db = digitsOf(b);
  const n = Math.max(da.length, db.length);
  const out: number[] = [];
  let borrowIn = false;
  for (let i = 0; i < n; i++) {
    const daDigit = da[i] ?? 0;
    const dbDigit = db[i] ?? 0;
    if (borrowIn && daDigit === 0) {
      out.push(dbDigit);
      borrowIn = false;
      continue;
    }
    const raw: number = daDigit - dbDigit - (borrowIn ? 1 : 0);
    out.push(((raw % 10) + 10) % 10);
    borrowIn = raw < 0;
  }
  return fromDigits(out);
};

/** Subtract digit by digit; a zero minuend digit stays zero. */
const zeroMinusNZero = (a: number, b: number): number => {
  const da = digitsOf(a);
  const db = digitsOf(b);
  const n = Math.max(da.length, db.length);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const daDigit = da[i] ?? 0;
    out.push(daDigit === 0 ? 0 : Math.abs(daDigit - (db[i] ?? 0)));
  }
  return fromDigits(out);
};

/**
 * The shorter operand is shifted left by the length difference (×10^d), i.e.
 * its units are lined up under the longer operand's tens/hundreds. Only
 * applies when the operand lengths differ; for subtraction only when the
 * result is >= 0 (otherwise the value is the correct answer and bugsFor
 * filters it out).
 */
const misalignedColumns = (a: number, b: number, op: AddSubOp): number => {
  const lenA = String(a).length;
  const lenB = String(b).length;
  const d = Math.abs(lenA - lenB);
  if (d === 0) return op === '+' ? a + b : a - b;
  const factor = 10 ** d;
  const value =
    lenA > lenB
      ? op === '+'
        ? a + b * factor
        : a - b * factor
      : op === '+'
        ? a * factor + b
        : a * factor - b;
  return value < 0 ? (op === '+' ? a + b : a - b) : value;
};

/**
 * Correct computation except the carry/borrow out of column 1 is forced to 0
 * (the second regroup is dropped). With fewer than two regroups this is the
 * correct value.
 */
const secondRegroupDropped = (a: number, b: number, op: AddSubOp): number => {
  const da = digitsOf(a);
  const db = digitsOf(b);
  const n = Math.max(da.length, db.length);
  const out: number[] = [];
  let carry = 0;
  for (let i = 0; i < n; i++) {
    const daDigit = da[i] ?? 0;
    const dbDigit = db[i] ?? 0;
    if (op === '+') {
      const sum = daDigit + dbDigit + carry;
      out.push(sum % 10);
      carry = i === 1 ? 0 : Math.floor(sum / 10);
    } else {
      const raw = daDigit - dbDigit - carry;
      out.push(((raw % 10) + 10) % 10);
      carry = i === 1 ? 0 : raw < 0 ? 1 : 0;
    }
  }
  if (op === '+' && carry > 0) out.push(carry);
  return fromDigits(out);
};

/**
 * The wrong value a child with this bug produces for `a op b`. A bug from the
 * other operation returns the correct value (so bugsFor filters it out).
 */
export const bugValue = (bug: AddSubBug, a: number, b: number, op: AddSubOp): number => {
  switch (bug) {
    case 'forgot-carry':
      return op === '+' ? wrongAddByForgotCarry(a, b) : a - b;
    case 'carry-not-added':
      return op === '+' ? carryNotAdded(a, b) : a - b;
    case 'smaller-from-larger':
      return op === '−' ? wrongSubByNoBorrow(a, b) : a + b;
    case 'borrow-no-decrement':
      return op === '−' ? borrowNoDecrement(a, b) : a + b;
    case 'zero-borrow-skip':
      return op === '−' ? zeroBorrowSkip(a, b) : a + b;
    case 'zero-minus-n-zero':
      return op === '−' ? zeroMinusNZero(a, b) : a + b;
    case 'misaligned-columns':
      return misalignedColumns(a, b, op);
    case 'second-regroup-dropped':
      return secondRegroupDropped(a, b, op);
  }
};

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
