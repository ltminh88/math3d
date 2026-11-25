// Nhóm 4 (R35) — diện tích đếm ô: meas-area-count / meas-area-equal. The numbers live
// only in the scene (groups A/B of 1 cm² cells), never in the story or the steps, so the
// matcher reads them from `scene.groups`. On a step whose answer is a shape count, the
// count is never named. The `misconception` tags on the equal-choice options are generic
// (every wrong letter is 'wrong-step'), so the chosen letter + the scene counts decide,
// never the tag — except the unit step, whose only wrong tag is 'wrong-unit'.
import type { GeoScene } from '../geometry/geo-scene-types';
import type { PracticeItem } from './practice-scene';
import type { WrongAnswerContext, WrongAnswerExplanation } from './wrong-answer-explanation';

const FALLBACK: WrongAnswerExplanation = { key: 'areaFallback' };

/** Cell counts of the two shapes; `b` is undefined for single-shape items. */
function cellCounts(item: PracticeItem): { a: number; b?: number } | null {
  const scene = item.scene as GeoScene | undefined;
  if (scene?.kind !== 'cells') return null;
  const a = scene.groups.find((g) => g.label === 'A')?.cells.length;
  if (a === undefined) return null;
  return { a, b: scene.groups.find((g) => g.label === 'B')?.cells.length };
}

/** One square missed (w = answer − 1) or one too many (w = answer + 1). */
function offByOne(answer: number, w: number): WrongAnswerExplanation | null {
  if (w === answer - 1) return { key: 'areaMissOne' };
  if (w === answer + 1) return { key: 'areaExtraOne' };
  return null;
}

function explainEqualChoice(
  a: number,
  b: number,
  chosenKey: string,
  chosenLetter?: string | number,
): WrongAnswerExplanation {
  // The guard in the dispatcher already returned null for the right pick, so a
  // 'sameArea' pick here means the shapes really differ, and a letter pick with
  // equal shapes means the child thought one was bigger.
  if (chosenKey === 'sameArea') return { key: 'areaEqualThoughtSame' };
  if (chosenKey === 'letter') {
    if (a === b) return { key: 'areaEqualThoughtBigger' };
    if (chosenLetter !== (a > b ? 'A' : 'B')) return { key: 'areaEqualReversed' };
  }
  return FALLBACK;
}

export function explainArea(ctx: WrongAnswerContext): WrongAnswerExplanation | null {
  const counts = cellCounts(ctx.item);
  if (!counts) return FALLBACK;
  const { a, b } = counts;
  const key = ctx.step.prompt.key;
  if (ctx.step.kind === 'choice') {
    if (key === 'pickUnit') {
      if (ctx.option?.misconception === 'wrong-unit') return { key: 'areaWrongUnit' };
      return ctx.option ? FALLBACK : null;
    }
    if (key === 'askBigger') {
      const label = ctx.option?.label;
      if (!label) return null;
      if (b === undefined) return FALLBACK;
      return explainEqualChoice(a, b, label.key, label.params?.l);
    }
    if (key === 'askAreaMore') {
      // meas-area-count tier 3, step 2: the difference of the two areas. The child
      // already counted both shapes, so {a} and {b} are on screen and safe to name.
      // Trust the formulas over the tags: a value equal to B's area rides on a
      // 'near-miss' option but still means "took B's area for the difference".
      const w = ctx.wrongNumber;
      if (w === undefined || b === undefined) return w === undefined ? null : FALLBACK;
      if (w === a + b) return { key: 'areaAddInstead' };
      if (w === a) return { key: 'areaForgotSub', params: { a, b } };
      if (w === b) return { key: 'areaDiffIsB' };
      return FALLBACK;
    }
    return FALLBACK;
  }
  if (ctx.step.kind !== 'number') return FALLBACK;
  const w = ctx.wrongNumber;
  if (w === undefined) return null;
  if (key === 'askAreaMore') {
    // meas-area-equal tier 2: one number step, the difference.
    if (b === undefined) return FALLBACK;
    if (w === a) return { key: 'areaForgotSub', params: { a, b } };
    if (w === a + b) return { key: 'areaAddInstead' };
    return offByOne(ctx.step.answer, w) ?? FALLBACK;
  }
  // A single shape count (askArea / askCellCount / askAreaOf / askArea): only ±1
  // is diagnosable — the count itself is the answer, so it is never named.
  return offByOne(ctx.step.answer, w) ?? FALLBACK;
}
