// Nhóm 3 (R35) — trung điểm: geo-midpoint-length. The three tiers are three different
// problems, so the matcher branches on the story key (midPart / midSum / midHalf):
// the same wrong number means a different mistake per tier (w = len forgets the
// subtraction in tier 1 but forgets the halving in tier 3).
import {
  numParam,
  type WrongAnswerContext,
  type WrongAnswerExplanation,
} from './wrong-answer-explanation';

const FALLBACK: WrongAnswerExplanation = { key: 'midFallback' };

export function explainMidpoint(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  const key = ctx.item.story.key;
  const p = ctx.item.story.params;
  if (key === 'midPart') {
    const len = numParam(p, 'len');
    const am = numParam(p, 'am');
    if (len === undefined || am === undefined) return FALLBACK;
    const w = ctx.wrongNumber;
    if (w === undefined) return null;
    if (w === len) return { key: 'mid1Whole', params: { len, am } };
    if (w === am) return { key: 'mid1AmInstead', params: { am } };
    if (w === len + am) return { key: 'mid1AddInstead', params: { len, am } };
    // R38 Q3: only blame halving when halving is actually wrong — when
    // am == len/2, MB is len/2, so halving is right (the dispatcher guard
    // already returns null then; check explicitly so the matcher never
    // blames a right halving).
    if (w === len / 2) {
      if (ctx.step.kind === 'number' && len / 2 === ctx.step.answer) return null;
      return { key: 'mid1HalfInstead', params: { len, am } };
    }
    return FALLBACK;
  }
  if (key === 'midSum') {
    // Choice: both wrong options share 'one-step-only' (one part instead of the whole).
    if (ctx.option?.misconception === 'one-step-only') return { key: 'mid2OnePart' };
    return FALLBACK;
  }
  if (key === 'midHalf') {
    const len = numParam(p, 'len');
    if (len === undefined) return FALLBACK;
    const w = ctx.wrongNumber;
    if (w === undefined) return null;
    if (w === len) return { key: 'mid3Whole', params: { len } };
    if (w === len / 4) return { key: 'mid3Quarter', params: { len } };
    return FALLBACK;
  }
  return FALLBACK;
}
