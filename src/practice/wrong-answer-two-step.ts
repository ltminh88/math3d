// Nhóm 2 (R35) — bài toán hai bước: wp-times-then-sub / wp-divide-then-sub.
// Story params carry {a, n}; work is [first-step result, final answer]. The step is
// identified by its prompt key (askOther / askLeftOver / pickExpr) because tier 2 has
// only the final step at index 0. For the tier-3 expression choice, the two wrong
// options share the tag 'wrong-step', so the chosen expression text decides.
import {
  numParam,
  type WrongAnswerContext,
  type WrongAnswerExplanation,
} from './wrong-answer-explanation';

const FALLBACK: WrongAnswerExplanation = { key: 'wp2Fallback' };

function explainFirstStep(a: number, n: number, times: boolean, w: number): WrongAnswerExplanation {
  if (times) {
    if (w === a + n) return { key: 'wp2Step0AddInstead', params: { a, n } };
    if (w === a) return { key: 'wp2Step0ForgotTimes', params: { a, n } };
    return { key: 'wp2Step0GenericTimes', params: { a, n } };
  }
  if (w === a - n) return { key: 'wp2Step0SubInstead', params: { a, n } };
  if (w === a * n) return { key: 'wp2Step0MulInstead', params: { a, n } };
  if (w === a) return { key: 'wp2Step0ForgotDivide', params: { a, n } };
  return { key: 'wp2Step0GenericDivide', params: { a, n } };
}

function explainFinalStep(
  ctx: WrongAnswerContext,
  a: number,
  n: number,
  times: boolean,
  w: number,
): WrongAnswerExplanation {
  const first = ctx.item.work[0];
  if (times) {
    const step1 = first ?? a * n;
    if (w === step1) return { key: 'wp2ForgotStep2', params: { a, n } };
    if (w === a * n + a) return { key: 'wp2AddInsteadSub', params: { a } };
    if (w === 0) return { key: 'wp2SubFirst', params: { a, n } };
    if (w === a * n - n) return { key: 'wp2SubNInsteadA', params: { a, n } };
    return FALLBACK;
  }
  const q = first ?? a / n;
  if (w === q) return { key: 'wp2ForgotStep2Divide', params: { a } };
  if (w === a + q) return { key: 'wp2AddInsteadSubDivide', params: { a } };
  if (w === a * n - a) return { key: 'wp2MulInsteadDivide', params: { a, n } };
  return FALLBACK;
}

function explainPickExpr(
  a: number,
  n: number,
  times: boolean,
  text: string,
): WrongAnswerExplanation {
  if (times) {
    if (text === `${a} × ${n}`) return { key: 'wp2PickOneStep' };
    if (text === `${a} × ${n} + ${a}`) return { key: 'wp2PickAddInstead', params: { a } };
    if (text === `${a} − ${n}`) return { key: 'wp2PickSubN', params: { a, n } };
    return FALLBACK;
  }
  if (text === `${a} : ${n}`) return { key: 'wp2PickOneStep' };
  if (text === `${a} + ${a} : ${n}`) return { key: 'wp2PickAddInsteadDivide' };
  if (text === `${a} × ${n} − ${a}`) return { key: 'wp2PickMulInsteadDivide', params: { a, n } };
  return FALLBACK;
}

export function explainTwoStep(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  const a = numParam(ctx.item.story.params, 'a');
  const n = numParam(ctx.item.story.params, 'n');
  if (a === undefined || n === undefined) return FALLBACK;
  const times = ctx.skillId === 'wp-times-then-sub';
  const promptKey = ctx.step.prompt.key;
  if (promptKey === 'pickExpr') {
    const text = ctx.option?.label.params?.text;
    return typeof text === 'string' ? explainPickExpr(a, n, times, text) : null;
  }
  const w = ctx.wrongNumber;
  if (w === undefined) return null;
  if (promptKey === 'askOther') return explainFirstStep(a, n, times, w);
  if (promptKey === 'askLeftOver') return explainFinalStep(ctx, a, n, times, w);
  return FALLBACK;
}
