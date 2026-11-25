// Nhóm 9 (R35) — cộng/trừ có nhớ: add-sub-1000 (+ wp/chain), add/sub 4–5 chữ số,
// add-sub-find-error, add-missing-digit. The per-step diagnosis lives in
// wrong-answer-carry-core.ts; this file only routes each skill's steps to it.
// A wrong Đúng/Sai on find-error is not diagnosable — the diagnosis moves to the
// fix step after it. A wrong digit on add-missing-digit is not diagnosable either.
import { playableSteps } from '../reasoning/reasoning-step-answers';
import { explainCalcStep } from './wrong-answer-carry-core';
import {
  numParam,
  type WrongAnswerContext,
  type WrongAnswerExplanation,
} from './wrong-answer-explanation';

const FALLBACK: WrongAnswerExplanation = { key: 'carryFallbackPlain' };

function explainPlain(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  if (ctx.step.kind !== 'number') return FALLBACK;
  const params = ctx.item.story.params;
  const a = numParam(params, 'a');
  const b = numParam(params, 'b');
  const w = ctx.wrongNumber;
  if (a === undefined || b === undefined || w === undefined) return null;
  const isAdd = ctx.item.story.key === 'addCalc';
  return explainCalcStep(a, b, isAdd, w, ctx.step.answer, isAdd ? '+' : '−');
}

function explainWp(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  if (ctx.step.kind !== 'number') return FALLBACK;
  const params = ctx.item.story.params;
  const key = ctx.item.story.key;
  const w = ctx.wrongNumber;
  if (w === undefined) return null;
  const a = numParam(params, 'a');
  const b = numParam(params, 'b');
  const c = numParam(params, 'c');
  if (a === undefined || b === undefined) return null;
  if (ctx.stepIndex === 0) {
    // The first step of a two-step problem is always a + b.
    const finalStep = playableSteps(ctx.item)[1];
    if (finalStep?.kind === 'number' && w === finalStep.answer)
      return { key: 'carryChainSkipped', params: { a, op1: '+', b } };
    const isAdd = key === 'wpAddHave' || key.startsWith('wpTwoStep');
    return explainCalcStep(a, b, isAdd, w, ctx.step.answer, isAdd ? '+' : '−');
  }
  // Step 1 of a two-step problem: the first result is work[0].
  const first = ctx.item.work[0];
  if (first === undefined || c === undefined) return FALLBACK;
  if (w === first) {
    const op2 = key === 'wpTwoStepAdd' ? '+' : '−';
    return { key: 'carryChainForgotSecond', params: { op2, c } };
  }
  const isAdd = key === 'wpTwoStepAdd';
  return explainCalcStep(first, c, isAdd, w, ctx.step.answer, isAdd ? '+' : '−');
}

function explainChain(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  if (ctx.step.kind !== 'number') return FALLBACK;
  const params = ctx.item.story.params;
  const w = ctx.wrongNumber;
  if (w === undefined) return null;
  const a = numParam(params, 'a');
  const b = numParam(params, 'b');
  const c = numParam(params, 'c');
  const op1 = typeof params?.op1 === 'string' ? params.op1 : undefined;
  const op2 = typeof params?.op2 === 'string' ? params.op2 : undefined;
  if (
    a === undefined ||
    b === undefined ||
    c === undefined ||
    op1 === undefined ||
    op2 === undefined
  )
    return null;
  if (ctx.stepIndex === 0) {
    const finalStep = playableSteps(ctx.item)[1];
    if (finalStep?.kind === 'number' && w === finalStep.answer)
      return { key: 'carryChainSkipped', params: { a, op1, b } };
    return explainCalcStep(a, b, op1 === '+', w, ctx.step.answer, op1);
  }
  const first = ctx.item.work[0];
  if (first === undefined) return FALLBACK;
  if (w === first) return { key: 'carryChainForgotSecond', params: { op2, c } };
  return explainCalcStep(first, c, op2 === '+', w, ctx.step.answer, op2);
}

function explainFindError(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  const params = ctx.item.story.params;
  const a = numParam(params, 'a');
  const b = numParam(params, 'b');
  const shown = numParam(params, 'shown');
  if (a === undefined || b === undefined || shown === undefined) return null;
  // A wrong Đúng/Sai is not diagnosable — the diagnosis moves to the fix step.
  if (ctx.step.kind === 'verdict') return null;
  if (ctx.step.kind !== 'number') return FALLBACK;
  const w = ctx.wrongNumber;
  if (w === undefined) return null;
  const isAdd = ctx.item.story.key === 'errorAdd';
  const op = isAdd ? '+' : '−';
  if (w === shown) return { key: 'carryFixRepeat', params: { a, op, b } };
  return explainCalcStep(a, b, isAdd, w, ctx.step.answer, op);
}

function explainMissingDigit(_ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  // A wrong digit 0–9 is not diagnosable — only the per-type fallback.
  return { key: 'carryFallbackPlain' };
}

export function explainCarry(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  if (
    ctx.skillId === 'add-sub-1000' ||
    ctx.skillId === 'add-4digit' ||
    ctx.skillId === 'sub-4digit' ||
    ctx.skillId === 'add-5digit' ||
    ctx.skillId === 'sub-5digit'
  )
    return explainPlain(ctx);
  if (
    ctx.skillId === 'add-sub-1000-wp' ||
    ctx.skillId === 'add-sub-10000-wp' ||
    ctx.skillId === 'add-sub-100000-wp'
  )
    return explainWp(ctx);
  if (ctx.skillId === 'add-sub-1000-chain') return explainChain(ctx);
  if (ctx.skillId === 'add-sub-find-error') return explainFindError(ctx);
  if (ctx.skillId === 'add-missing-digit') return explainMissingDigit(ctx);
  return null;
}
