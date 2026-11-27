// Add/sub bug explainers (boost, Phase 1A): one explainer per add/sub bug, naming
// the mistake in words and never stating the answer. This module is DATA only —
// its imports from wrong-answer-explanation are type-only (erased at compile),
// so there is no runtime import cycle; wrong-answer-explanation merges this map
// into the registry right after the Map is created (same as the length lane).
import type { Misconception } from '../reasoning/reasoning-types';
import type {
  BugExplainer,
  WrongAnswerContext,
  WrongAnswerExplanation,
} from './wrong-answer-explanation';

const explain =
  (key: WrongAnswerExplanation['key']): BugExplainer =>
  (ctx: WrongAnswerContext): WrongAnswerExplanation | null =>
    ctx.option ? { key } : null;

export const ADD_SUB_BUG_EXPLAINERS: ReadonlyMap<Misconception, BugExplainer> = new Map([
  ['forgot-carry', explain('bugForgotCarry')],
  ['carry-not-added', explain('bugCarryNotAdded')],
  ['smaller-from-larger', explain('bugSmallerFromLarger')],
  ['borrow-no-decrement', explain('bugBorrowNoDecrement')],
  ['zero-borrow-skip', explain('bugZeroBorrowSkip')],
  ['zero-minus-n-zero', explain('bugZeroMinusNZero')],
  ['misaligned-columns', explain('bugMisalignedColumns')],
  ['second-regroup-dropped', explain('bugSecondRegroupDropped')],
]);
