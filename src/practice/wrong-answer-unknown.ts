// Nhóm 1 (R35) — tìm thành phần chưa biết: unknown-add-sub / unknown-mul-div (+ WP).
// The wrong number is matched against the trap values the generator itself uses. A
// match is only a pattern match, never proof of intent — but every trap value here is
// distinct from the right answer.
import type { WrongAnswerContext, WrongAnswerExplanation } from './wrong-answer-explanation';
import { parseUnknown, type UnknownForm } from './wrong-answer-unknown-form';

const FALLBACK: WrongAnswerExplanation = { key: 'unknown1Fallback' };

/** Tier 3 step 0 (askPart): the right-side calculation itself. */
function explainPart(form: UnknownForm, w: number): WrongAnswerExplanation {
  if (form.op === 'sub3') {
    const { a, b, c } = form;
    if (w === b + c) return { key: 'unknownPartAddInstead', params: { b, c } };
    if (w === b - c) return { key: 'unknownPartSubInstead', params: { b, c } };
    if (w === a - b || w === a * b) return { key: 'unknownPartUsedA', params: { a, b, c } };
    return FALLBACK;
  }
  if (form.op === 'mul3') {
    const { a, b } = form;
    if (w === a * b) return { key: 'unknownPartMulInstead', params: { a, b } };
    if (w === a - b) return { key: 'unknownPartSubInsteadAdd', params: { a, b } };
    if (w === a) return { key: 'unknownPartOneAddend', params: { a, b } };
    if (w === b) return { key: 'unknownPartOneAddend', params: { a: b, b: a } };
    return FALLBACK;
  }
  return FALLBACK;
}

function explainMain(form: UnknownForm, w: number): WrongAnswerExplanation {
  switch (form.op) {
    case 'add': {
      const { a, s } = form;
      if (w === s + a) return { key: 'unknownWrongInverseAdd', params: { s, a } };
      if (w === s) return { key: 'unknownGivenNumberAdd', params: { s, a } };
      if (w === a) return { key: 'unknownGivenAddend', params: { s, a } };
      return FALLBACK;
    }
    case 'subMinuend': {
      const { a, s } = form;
      if (w === s + a) return { key: 'unknownWrongInverseAdd', params: { s, a } };
      if (w === s) return { key: 'unknownGivenMinuend', params: { s, a } };
      if (w === a) return { key: 'unknownGivenAddend', params: { s, a } };
      return FALLBACK;
    }
    case 'subFirst': {
      const { a, r } = form;
      const s = a + r;
      if (w === r) return { key: 'unknownSubFirstRightSide', params: { s, a } };
      if (w === r - a) return { key: 'unknownSubFirstDoubleSub', params: { s, a } };
      if (w === a) return { key: 'unknownSubFirstGivenA', params: { a, b: r } };
      return FALLBACK;
    }
    case 'mul': {
      const { n, p } = form;
      if (w === p - n) return { key: 'unknownWrongInverseMul', params: { p, n } };
      if (w === p) return { key: 'unknownGivenNumberMul', params: { p, n } };
      if (w === n) return { key: 'unknownGivenFactor', params: { p, n } };
      return FALLBACK;
    }
    case 'divBoxes': {
      const { p, q } = form;
      if (w === p - q) return { key: 'unknownWrongInverseDivBoxes', params: { p, q } };
      if (w === q) return { key: 'unknownGivenNumberDivBoxes', params: { p, q } };
      if (w === p) return { key: 'unknownGivenDividend', params: { p, q } };
      return FALLBACK;
    }
    case 'divShare': {
      const { n, q } = form;
      if (w === q - n) return { key: 'unknownWrongInverseDivShareSub', params: { n, q } };
      if (w === n + q) return { key: 'unknownWrongInverseDivShareAdd', params: { n, q } };
      if (w === q) return { key: 'unknownGivenNumberDivShare', params: { n, q } };
      if (w === n) return { key: 'unknownGivenDivisorShare', params: { n, q } };
      return FALLBACK;
    }
    case 'sub3': {
      const { a, b, c } = form;
      if (w === b * c) return { key: 'unknownForgotStep', params: { b, c, a } };
      if (w === b * c - a) return { key: 'unknownForgotStepSub', params: { a } };
      return FALLBACK;
    }
    case 'mul3': {
      const { a, b, n } = form;
      const p = a + b;
      if (w === p) return { key: 'unknownForgotDivide', params: { a, b, n, p } };
      if (w === p - n) return { key: 'unknownWrongInverseMul', params: { p, n } };
      return FALLBACK;
    }
  }
}

export function explainUnknown(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  const form = parseUnknown(ctx.skillId, ctx.item.story);
  if (!form) return FALLBACK;
  const w = ctx.wrongNumber;
  if (w === undefined) return null;
  if (ctx.step.prompt.key === 'askPart') return explainPart(form, w);
  return explainMain(form, w);
}
