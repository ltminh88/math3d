// Test-only helpers (imported by *.test.ts): recompute arithmetic facts independently
// from the generators — carry/borrow counts by a digit loop written fresh here, step
// answers from the story params, verdict truth from the statement itself, and the
// missing digit by parsing the displayed equation.
import { evalExpr, numbersOfItem, statementTruth } from '../reasoning/reasoning-test-oracles';
import type { ReasoningStep } from '../reasoning/reasoning-types';

/** Digits of `n`, most significant first (oracle-local, not the generator's helper). */
export const digitsOf = (n: number): number[] => String(n).split('').map(Number);

/** Carry count of a + b: positions where the digit sum plus the incoming carry reaches 10. */
export function oracleAddCarries(a: number, b: number): number {
  const da = digitsOf(a).reverse();
  const db = digitsOf(b).reverse();
  let carry = 0;
  let count = 0;
  for (let i = 0; i < Math.max(da.length, db.length); i++) {
    const s = (da[i] ?? 0) + (db[i] ?? 0) + carry;
    if (s >= 10) {
      count++;
      carry = 1;
    } else {
      carry = 0;
    }
  }
  return count;
}

/** Borrow count of a − b (a >= b): positions where the digit minus the incoming borrow goes below 0. */
export function oracleSubBorrows(a: number, b: number): number {
  const da = digitsOf(a).reverse();
  const db = digitsOf(b).reverse();
  let borrow = 0;
  let count = 0;
  for (let i = 0; i < Math.max(da.length, db.length); i++) {
    if ((da[i] ?? 0) - borrow - (db[i] ?? 0) < 0) {
      count++;
      borrow = 1;
    } else {
      borrow = 0;
    }
  }
  return count;
}

/** True when a borrow in a − b (a >= b) propagates through a zero digit of `a`. */
export function oracleBorrowAcrossZero(a: number, b: number): boolean {
  const da = digitsOf(a).reverse();
  const db = digitsOf(b).reverse();
  let borrow = 0;
  for (let i = 0; i < Math.max(da.length, db.length); i++) {
    if (borrow === 1 && (da[i] ?? 0) === 0) return true;
    if ((da[i] ?? 0) - borrow - (db[i] ?? 0) < 0) borrow = 1;
    else borrow = 0;
  }
  return false;
}

/** The numeric value of a number step, or of a verdict step's fix. */
export function stepNumber(step: ReasoningStep): number {
  if (step.kind === 'number') return step.answer;
  if (step.kind === 'verdict' && step.fix) return step.fix.answer;
  throw new Error(`step has no numeric value: ${step.kind}`);
}

/** The numeric values of an item's steps, in order (number steps and verdict fixes). */
export const stepValues = (item: { steps: readonly ReasoningStep[] }): number[] =>
  item.steps.map(stepNumber);

/** Truth of a verdict step's statement (stmtEq), or undefined when it is not one. */
export function verdictTruth(step: ReasoningStep): boolean | undefined {
  if (step.kind !== 'verdict') throw new Error('not a verdict step');
  return statementTruth(step.statement);
}

/**
 * The missing digit of a displayed equation ("45 ?78 + 12 345 = 58 023"): the single
 * digit 0–9 that makes the equation true, or undefined when none / more than one fits.
 * The '?' replaces exactly one decimal digit; the equation is a plain + or − of two
 * operands (a missing digit in the result is allowed too).
 */
export function equationMissingDigit(equation: string): number | undefined {
  const clean = equation.replace(/[\u202F ]/g, '');
  const [lhs, rhs] = clean.split('=').map((s) => s.trim());
  if (lhs === undefined || rhs === undefined) return undefined;
  const op = lhs.includes('+') ? '+' : lhs.includes('−') ? '−' : undefined;
  if (!op) return undefined;
  const [left, right] = lhs.split(op).map((s) => s.trim());
  if (left === undefined || right === undefined) return undefined;
  const tokens = [left, right, rhs];
  const blankAt = tokens.findIndex((t) => t.includes('?'));
  if (blankAt === -1) return undefined;
  const filled: number[] = [];
  for (let d = 0; d <= 9; d++) {
    const values = tokens
      .map((t, i) => (i === blankAt ? t.replace('?', String(d)) : t))
      .map(Number);
    const [a, b, c] = values as [number, number, number];
    if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(c)) continue;
    if (op === '+' ? a + b === c : a - b === c) filled.push(d);
  }
  return filled.length === 1 ? filled[0] : undefined;
}

/** The three operands of a displayed equation, with the '?' filled by its unique digit. */
export function equationOperands(equation: string): [number, number, number] | undefined {
  const missing = equationMissingDigit(equation);
  if (missing === undefined) return undefined;
  const clean = equation.replace(/[\u202F ]/g, '');
  const [lhs, rhs] = clean.split('=').map((s) => s.trim());
  if (lhs === undefined || rhs === undefined) return undefined;
  const op = lhs.includes('+') ? '+' : lhs.includes('−') ? '−' : undefined;
  if (!op) return undefined;
  const [left, right] = lhs.split(op).map((s) => s.trim());
  if (left === undefined || right === undefined) return undefined;
  const fill = (t: string): number => Number(t.replace('?', String(missing)));
  return [fill(left), fill(right), fill(rhs)];
}

/** Every number of an item: story, steps, work (shared helper, same as numbers). */
export const allNumbers = (item: Parameters<typeof numbersOfItem>[0]): number[] =>
  numbersOfItem(item);

export { evalExpr };
