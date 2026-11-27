// Column-calc generator (boost, Phase 2A): skill `add-sub-column`. The child
// fills the result right→left one digit at a time (one `number` step per column,
// 0–9 pad), with a verdict step after every column but the last — "Có nhớ 1
// không?" for addition, "Có phải vay 1 không?" for subtraction.
//
// Two deliberate choices, both against leaking the answer through the item
// itself:
//   1. A verdict follows EVERY column but the last, whether it regroups or
//      not. A verdict only after regrouping columns would teach the child that
//      "verdict ⟺ carry" and answer itself. No verdict follows the most
//      significant column: the capped result never regroups out of it, so the
//      question would always be "Không".
//   2. The verdict's statement shows the column the child JUST computed (the
//      addends with the carry-in / the borrowed top digit, and its result) —
//      their own finished work, never the next column's answer. The scene
//      likewise never pre-draws the true carry marks (see column-calc-
//      scene-types.ts).
//
// Pairs come from the Phase 1A ladder picker at the tier's ladder step, then
// rejection-sampled to a result ≤ 999: column items stay within three columns
// (phase 2A risk mitigation — 4/5-digit skills keep the single-answer pad).
//
// Wrong-digit diagnosis: `bugForDigit` maps a wrong digit in one column to the
// bug whose wrong value carries that digit (catalogue order, as in `bugsFor`).
// It is pure and tested here; wiring it into the round flow's bug bank needs a
// hook in reasoning-round-flow.ts, outside this phase's ownership — recorded as
// a question for the reviewer instead of guessed here.
import { type Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { PracticeItem } from '../practice/practice-scene';
import type { ReasoningGenerator, ReasoningStep } from '../reasoning/reasoning-types';
import { type AddSubBug, type AddSubOp, bugsFor } from './add-sub-bug-catalogue';
import { arithmeticItem, ref } from './arithmetic-distractors';
import { ladderOfSkillTier, pickLadderPair } from './add-sub-pair-pickers';
import { RANGE_1000 } from './arithmetic-ranges';
import type { ColumnCalcScene } from './column-calc-scene-types';

const CAP = RANGE_1000;

/** One column's computed facts, least-significant-first (col 0 = units). */
export interface ColumnStep {
  readonly col: number;
  readonly topDigit: number;
  readonly bottomDigit: number;
  readonly carryIn: 0 | 1;
  /** The result digit the child writes in this column. */
  readonly digit: number;
  /** Whether this column regroups out (carry for +, borrow for −). */
  readonly carryOut: boolean;
  /** The column's computation as the child performs it ("5 + 7", "13 − 8"). */
  readonly sumText: string;
  /** The column's computed value (the sum for +, the borrowed difference for −). */
  readonly sumValue: number;
}

const digitAt = (n: number, col: number): number => Math.floor(n / 10 ** col) % 10;

/** The column-by-column computation of `a op b`, units first. */
export function columnsOf(a: number, b: number, op: AddSubOp): readonly ColumnStep[] {
  const result = op === '+' ? a + b : a - b;
  const n = Math.max(String(a).length, String(b).length, String(result).length);
  const out: ColumnStep[] = [];
  let carry = 0;
  for (let col = 0; col < n; col++) {
    const topDigit = digitAt(a, col);
    const bottomDigit = digitAt(b, col);
    const carryIn = carry as 0 | 1;
    if (op === '+') {
      const sum = topDigit + bottomDigit + carryIn;
      out.push({
        col,
        topDigit,
        bottomDigit,
        carryIn,
        digit: sum % 10,
        carryOut: sum >= 10,
        sumText: carryIn ? `${topDigit} + ${bottomDigit} + 1` : `${topDigit} + ${bottomDigit}`,
        sumValue: sum,
      });
      carry = sum >= 10 ? 1 : 0;
    } else {
      const raw = topDigit - carryIn - bottomDigit;
      const borrow = raw < 0;
      const effTop = topDigit + (borrow ? 10 : 0);
      out.push({
        col,
        topDigit,
        bottomDigit,
        carryIn,
        digit: borrow ? raw + 10 : raw,
        carryOut: borrow,
        sumText: carryIn ? `${effTop} − 1 − ${bottomDigit}` : `${effTop} − ${bottomDigit}`,
        sumValue: borrow ? raw + 10 : raw,
      });
      carry = borrow ? 1 : 0;
    }
  }
  return out;
}

const PLACE_KEYS = ['columnDigitOnes', 'columnDigitTens', 'columnDigitHundreds'] as const;

/** The steps for `a op b`: one digit step per column, one verdict after every
 *  column but the last. At most three columns (see columnPair's cap). */
export function buildColumnSteps(a: number, b: number, op: AddSubOp): ReasoningStep[] {
  const cols = columnsOf(a, b, op);
  if (cols.length > 3) throw new Error(`column-calc: ${a} ${op} ${b} has ${cols.length} columns`);
  const steps: ReasoningStep[] = [];
  cols.forEach((c, i) => {
    steps.push({
      kind: 'number',
      prompt: ref(PLACE_KEYS[i] as string, { a: c.topDigit, op, b: c.bottomDigit }),
      answer: c.digit,
    });
    if (i < cols.length - 1) {
      steps.push({
        kind: 'verdict',
        prompt: ref(op === '+' ? 'askCarry' : 'askBorrow'),
        statement: ref('stmtEq', { text: c.sumText, value: c.sumValue }),
        answer: c.carryOut,
        ...(c.carryOut ? {} : { fix: { prompt: ref('askCorrect'), answer: c.sumValue } }),
      });
    }
  });
  return steps;
}

/**
 * The bug whose wrong value carries `digit` in column `col` — the first in
 * catalogue order, as in `bugsFor`. Undefined when the digit is the correct
 * one, or when no bug produces it there.
 */
export function bugForDigit(
  a: number,
  b: number,
  op: AddSubOp,
  col: number,
  digit: number,
): AddSubBug | undefined {
  const correct = op === '+' ? a + b : a - b;
  if (digit === digitAt(correct, col)) return undefined;
  for (const { bug, value } of bugsFor(a, b, op)) {
    if (digitAt(value, col) === digit) return bug;
  }
  return undefined;
}

/** A ladder pair whose operands and result all fit in three columns. */
const columnPair = (rng: Rng, tier: SkillTier): { a: number; b: number; op: AddSubOp } => {
  const ladder = ladderOfSkillTier(rng, tier);
  const op: AddSubOp = rng() < 0.5 ? '+' : '−';
  for (let t = 0; t < 500; t++) {
    const [a, b] = pickLadderPair(rng, op, ladder);
    if (a >= CAP || b >= CAP) continue;
    const result = op === '+' ? a + b : a - b;
    if (result < 0 || result >= CAP) continue;
    return { a, b, op };
  }
  // Unreachable in practice (the rejection space is huge); a no-regroup pair.
  return op === '+' ? { a: 123, b: 234, op } : { a: 876, b: 123, op };
};

export const columnCalc: ReasoningGenerator = (rng, tier) => {
  const { a, b, op } = columnPair(rng, tier);
  const scene: ColumnCalcScene = {
    kind: 'column-calc',
    op,
    top: a,
    bottom: b,
    filled: [],
    carries: [],
    focusCol: 0,
  };
  return arithmeticItem(
    'add-sub-column',
    tier,
    ref('columnCalc', { a, op, b }),
    buildColumnSteps(a, b, op),
    [],
    scene,
  );
};

export const ADD_SUB_COLUMN_GENERATORS: Record<string, ReasoningGenerator> = {
  'add-sub-column': columnCalc,
};
