// Nhóm 5 (R35) — phân số chia đều: fraction-wp plus the sibling skills
// fraction-of-set-number / fraction-of-set-circle (same traps, one matcher; Q5 pending —
// dropping the two siblings is one line in the dispatcher). Story params carry
// {count, n}; the main step always asks for one part (count / n). Tier 3 adds a second
// step: what is left (fraction-wp, fraction-of-set-circle) or k parts (of-set-number).
// The noun ({item}) is NOT named: twa interpolates plainly, so an `i:` ref would print
// literally — the sentences use the generic classifier "cái" instead.
import {
  numParam,
  type WrongAnswerContext,
  type WrongAnswerExplanation,
} from './wrong-answer-explanation';

const FALLBACK: WrongAnswerExplanation = { key: 'fracFallback' };

export function explainFraction(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  const count = numParam(ctx.item.story.params, 'count');
  const n = numParam(ctx.item.story.params, 'n');
  if (count === undefined || n === undefined) return FALLBACK;
  const part = count / n;
  const key = ctx.step.prompt.key;
  if (key === 'askKParts') {
    const k = numParam(ctx.step.prompt.params, 'k');
    if (k === undefined) return FALLBACK;
    const w = ctx.wrongNumber;
    if (w === undefined) return null;
    if (w === part) return { key: 'fracKPartsOnePart', params: { k } };
    if (w === count) return { key: 'fracKPartsWhole', params: { count, k } };
    if (w === k) return { key: 'fracKPartsK', params: { k } };
    return FALLBACK;
  }
  if (key === 'askWpLeft' || key === 'askLeft') {
    const w = ctx.wrongNumber;
    if (w === undefined) return null;
    const p = ctx.item.work[0] ?? part;
    if (w === p || w === count) return { key: 'fracLeftOnePart', params: { count } };
    return FALLBACK;
  }
  // Step 0: one part of the set. The choice traps carry their own tags; a number
  // step is recognised by the same formulas (w = count took the whole set,
  // w = n answered with the number of parts).
  if (ctx.step.kind === 'choice') {
    const tag = ctx.option?.misconception;
    if (tag === 'forget-divide') return { key: 'fracForgetDivide', params: { count, n } };
    if (tag === 'wrong-denominator') return { key: 'fracWrongDenominator', params: { count, n } };
    if (!ctx.option) return null;
  }
  const w = ctx.wrongNumber;
  if (w === undefined) return null;
  if (w === count) return { key: 'fracForgetDivide', params: { count, n } };
  if (w === n) return { key: 'fracWrongDenominator', params: { count, n } };
  return FALLBACK;
}
