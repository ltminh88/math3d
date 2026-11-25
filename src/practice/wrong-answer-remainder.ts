// Nhóm 10 (R35) — chia có dư: div-2d/3d/4d/5d-1d-remainder (remainderDiv) and the
// legacy div-rem-floor / div-rem-ceil. Both steps are main steps: the quotient step
// and the remainder step each have their own traps. Hard rule at the remainder
// step: a remainder ≥ the divisor is always diagnosed first — it covers w == r + b,
// r + k·b, and the overlap where w == q while q ≥ b.
import { playableSteps } from '../reasoning/reasoning-step-answers';
import {
  numParam,
  type WrongAnswerContext,
  type WrongAnswerExplanation,
} from './wrong-answer-explanation';

const FALLBACK: WrongAnswerExplanation = { key: 'remFallback' };

function explainRemainderDiv(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  if (ctx.step.kind !== 'number') return FALLBACK;
  const params = ctx.item.story.params;
  const a = numParam(params, 'a');
  const b = numParam(params, 'b');
  const w = ctx.wrongNumber;
  if (a === undefined || b === undefined || w === undefined) return null;
  const steps = playableSteps(ctx.item);
  const qStep = steps[0];
  const rStep = steps[1];
  if (qStep?.kind !== 'number' || rStep?.kind !== 'number') return FALLBACK;
  const q = qStep.answer;
  const r = rStep.answer;
  if (ctx.stepIndex === 0) {
    // askQuotient: the T3 zero-drop first, then rounded up / stopped early, then swapped.
    if (String(q).includes('0') && Number(String(q).replace('0', '')) === w)
      return { key: 'remQuotientZero' };
    if (w === q + 1) return { key: 'remQuotientOneMore', params: { a, b } };
    if (w === q - 1) return { key: 'remQuotientOneLess', params: { a, b } };
    if (w === r) return { key: 'remQuotientRemainder' };
    return { key: 'remFallback', params: { a, b } };
  }
  if (ctx.stepIndex === 1) {
    // askRemainder: w >= b first (hard rule), then the quotient in the remainder box.
    if (w >= b) return { key: 'remRemainderTooBig', params: { w, b } };
    if (w === q) return { key: 'remRemainderQuotient', params: { q, a, b } };
    return { key: 'remFallback', params: { a, b } };
  }
  return FALLBACK;
}

function explainFloor(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  const params = ctx.item.story.params;
  const total = numParam(params, 'total');
  const per = numParam(params, 'per');
  if (total === undefined || per === undefined) return null;
  if (ctx.step.kind === 'choice') {
    // T2 pickBoxesLeft: the options are {q, r} pairs; the tag names the error.
    // q and r come back from work: [q·per, r].
    if (!ctx.option) return null;
    const tag = ctx.option.misconception;
    const packed = ctx.item.work[0];
    const r = ctx.item.work[1];
    if (tag === 'remainder-too-big') return { key: 'remFloorPickTooBig' };
    if (tag === 'wrong-step') return { key: 'remFloorPickRemainderWrong', params: { total } };
    if (tag === 'near-miss' && packed !== undefined && r !== undefined) {
      const q = packed / per;
      const labelQ = numParam(ctx.option.label.params, 'q');
      const labelR = numParam(ctx.option.label.params, 'r');
      if (labelQ === q + 1 && labelR === r) return { key: 'remFloorPickOneMore', params: { per } };
      if (labelQ === r && labelR === q) return { key: 'remFloorPickSwapped' };
    }
    return { key: 'remFloorFallback', params: { per } };
  }
  if (ctx.step.kind !== 'number') return FALLBACK;
  const w = ctx.wrongNumber;
  if (w === undefined) return null;
  const steps = playableSteps(ctx.item);
  const qStep = steps[0];
  const rStep = steps[1];
  if (qStep?.kind !== 'number' || rStep?.kind !== 'number') return FALLBACK;
  const q = qStep.answer;
  const r = rStep.answer;
  if (ctx.stepIndex === 0) {
    // askBoxes
    if (w === q + 1) return { key: 'remFloorBoxesOneMore', params: { per } };
    if (w === q - 1) return { key: 'remFloorBoxesOneLess', params: { per } };
    if (w === r) return { key: 'remFloorBoxesRemainder', params: { per } };
    return { key: 'remFloorFallback', params: { per } };
  }
  // askLeft / askLeftCheck: the remainder must be smaller than the divisor.
  if (w >= per) return { key: 'remFloorLeftTooBig', params: { w, per } };
  if (w === q) return { key: 'remFloorLeftQuotient' };
  return { key: 'remFloorFallback', params: { per } };
}

function explainCeil(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  const params = ctx.item.story.params;
  const total = numParam(params, 'total');
  const per = numParam(params, 'per');
  if (total === undefined || per === undefined) return null;
  // work is [q, q + 1]: the full trips and the trips needed.
  const q = ctx.item.work[0];
  const need = ctx.item.work[1];
  if (q === undefined || need === undefined) return FALLBACK;
  const r = total - q * per;
  if (ctx.step.kind === 'choice') {
    // T3 askNeed: the tag names the error.
    if (!ctx.option) return null;
    const tag = ctx.option.misconception;
    if (tag === 'round-down-trap') return { key: 'remCeilNeedRoundedDown', params: { q, r } };
    if (tag === 'one-step-only') return { key: 'remCeilNeedRemainder' };
    return { key: 'remCeilFallback' };
  }
  if (ctx.step.kind !== 'number') return FALLBACK;
  const w = ctx.wrongNumber;
  if (w === undefined) return null;
  if (ctx.step.prompt.key === 'askFull') {
    // T1 step 0: how many full cars.
    if (w === q + 1) return { key: 'remCeilFullOneMore' };
    if (w === r) return { key: 'remCeilFullRemainder', params: { per } };
    return { key: 'remCeilFallback' };
  }
  // askNeed (T1 step 1 / T2): how many cars in total.
  if (w === q) return { key: 'remCeilNeedRoundedDown', params: { q, r } };
  if (w === r) return { key: 'remCeilNeedRemainder' };
  return { key: 'remCeilFallback' };
}

export function explainRemainder(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  if (
    ctx.skillId === 'div-2d-1d-remainder' ||
    ctx.skillId === 'div-3d-1d-remainder' ||
    ctx.skillId === 'div-4d-1d-remainder' ||
    ctx.skillId === 'div-5d-1d-remainder'
  )
    return explainRemainderDiv(ctx);
  if (ctx.skillId === 'div-rem-floor') return explainFloor(ctx);
  if (ctx.skillId === 'div-rem-ceil') return explainCeil(ctx);
  return null;
}
