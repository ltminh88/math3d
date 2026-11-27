// Add bug values (boost, Phase 1A — split from add-sub-bug-catalogue.ts, R103.2):
// the add-only bugs, plus the shared digit helpers and the two bugs that are
// parameterized by operation (misaligned-columns, second-regroup-dropped),
// which the sub file reuses. The AddSubBug/AddSubOp imports are type-only
// (erased at compile), so there is no runtime import cycle with the barrel.
import type { AddSubBug, AddSubOp } from './add-sub-bug-catalogue';
import { wrongAddByForgotCarry } from './arithmetic-distractors';

/** Least-significant-first digits of a non-negative integer. */
export const digitsOf = (n: number): readonly number[] => {
  if (n === 0) return [0];
  const out: number[] = [];
  for (let rest = Math.floor(n); rest > 0; rest = Math.floor(rest / 10)) {
    out.push(rest % 10);
  }
  return out;
};

export const fromDigits = (digits: readonly number[]): number => {
  let value = 0;
  for (let i = digits.length - 1; i >= 0; i--) value = value * 10 + (digits[i] ?? 0);
  return value;
};

/** Add, but the carry out of the units column is dropped (forced to 0). */
export const carryNotAdded = (a: number, b: number): number => {
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

/**
 * The shorter operand is shifted left by the length difference (×10^d), i.e.
 * its units are lined up under the longer operand's tens/hundreds. Only
 * applies when the operand lengths differ; for subtraction only when the
 * result is >= 0 (otherwise the value is the correct answer and bugsFor
 * filters it out).
 */
export const misalignedColumns = (a: number, b: number, op: AddSubOp): number => {
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
 * (the second regroup is dropped). With no regroup out of column 1 this is
 * the correct value.
 */
export const secondRegroupDropped = (a: number, b: number, op: AddSubOp): number => {
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
 * The wrong value an add bug produces for `a + b`. A sub bug returns the
 * correct value (so bugsFor filters it out).
 */
export const addBugValue = (bug: AddSubBug, a: number, b: number): number => {
  switch (bug) {
    case 'forgot-carry':
      return wrongAddByForgotCarry(a, b);
    case 'carry-not-added':
      return carryNotAdded(a, b);
    case 'misaligned-columns':
      return misalignedColumns(a, b, '+');
    case 'second-regroup-dropped':
      return secondRegroupDropped(a, b, '+');
    default:
      return a + b;
  }
};
