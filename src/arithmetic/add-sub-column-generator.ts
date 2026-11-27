// Column-calc generator (boost, Phase 2A): skill `add-sub-column`. The child
// fills the result right→left one digit at a time (one `number` step per column,
// 0–9 pad), with a two-option choice after every column but the last — "Có nhớ 1
// không?" for addition, "Có phải vay 1 không?" for subtraction.
//
// Two deliberate choices, both against leaking the answer through the item
// itself:
//   1. A choice follows EVERY column but the last, whether it regroups or
//      not. A choice only after regrouping columns would teach the child that
//      "choice ⟺ carry" and answer itself. No choice follows the most
//      significant column: the capped result never regroups out of it, so the
//      question would always be "Không".
//   2. The digit prompt shows the column the child is computing with its
//      ORIGINAL digits plus the carry/borrow from the previous column
//      ("3 + 4 + 1", "0 − 1 − 5") — never the borrowed top digit ("13 − 8"
//      would give the borrow away) and never the result. The scene likewise
//      never pre-draws the true carry marks (see column-calc-
//      scene-types.ts). The carry question is a choice, not a verdict: a
//      verdict would ask the child to call a correct calculation "Sai"
//      whenever the column does not regroup (R119.1).
//
// Pairs come from the Phase 1A ladder picker at the tier's ladder step, then
// rejection-sampled to a result ≤ 999: column items stay within three columns
// (phase 2A risk mitigation — 4/5-digit skills keep the single-answer pad).
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type {
  ChoiceOption,
  Misconception,
  ReasoningGenerator,
  ReasoningStep,
} from '../reasoning/reasoning-types';
import type { AddSubOp } from './add-sub-bug-catalogue';
import { ladderOfSkillTier, pickLadderPair } from './add-sub-pair-pickers';
import { arithmeticItem, ref } from './arithmetic-distractors';
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
  /** The column's computation as the child performs it ("5 + 7", "3 − 8"). */
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
      out.push({
        col,
        topDigit,
        bottomDigit,
        carryIn,
        digit: borrow ? raw + 10 : raw,
        carryOut: borrow,
        // Original digits only: the borrowed top ("13 − 8") would give the
        // borrow away (R119.2). The carry-in shows as "− 1" (R119.3).
        sumText: carryIn ? `${topDigit} − 1 − ${bottomDigit}` : `${topDigit} − ${bottomDigit}`,
        sumValue: borrow ? raw + 10 : raw,
      });
      carry = borrow ? 1 : 0;
    }
  }
  return out;
}

const PLACE_KEYS = ['columnDigitOnes', 'columnDigitTens', 'columnDigitHundreds'] as const;

/**
 * The carry/borrow question as a two-option choice, yes first, always in that
 * order (R119.1): the kit renders options in the order given, so the child
 * cannot learn the answer from the position. A verdict would ask the child to
 * call a correct calculation "Sai" whenever the column does not regroup. The
 * wrong option carries the bug it matches, when one fits: missing a carry is
 * 'forgot-carry', subtracting without borrowing is 'smaller-from-larger';
 * claiming a regroup that is not there is a near-miss.
 */
const carryOptions = (op: AddSubOp, carryOut: boolean): readonly ChoiceOption[] => {
  const missed: Misconception = op === '+' ? 'forgot-carry' : 'smaller-from-larger';
  const yes: ChoiceOption = {
    id: 'yes',
    label: ref(op === '+' ? 'carryYes' : 'borrowYes'),
    correct: carryOut,
    ...(!carryOut ? { misconception: 'near-miss' as const } : {}),
  };
  const no: ChoiceOption = {
    id: 'no',
    label: ref(op === '+' ? 'carryNo' : 'borrowNo'),
    correct: !carryOut,
    ...(carryOut ? { misconception: missed } : {}),
  };
  return [yes, no];
};

/** The steps for `a op b`: one digit step per column, one carry/borrow choice
 *  after every column but the last. At most three columns (see columnPair's cap). */
export function buildColumnSteps(a: number, b: number, op: AddSubOp): ReasoningStep[] {
  const cols = columnsOf(a, b, op);
  if (cols.length > 3) throw new Error(`column-calc: ${a} ${op} ${b} has ${cols.length} columns`);
  const steps: ReasoningStep[] = [];
  cols.forEach((c, i) => {
    steps.push({
      kind: 'number',
      prompt: ref(PLACE_KEYS[i] as string, { text: c.sumText }),
      answer: c.digit,
    });
    if (i < cols.length - 1) {
      steps.push({
        kind: 'choice',
        prompt: ref(op === '+' ? 'askCarry' : 'askBorrow'),
        options: carryOptions(op, c.carryOut),
      });
    }
  });
  return steps;
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
