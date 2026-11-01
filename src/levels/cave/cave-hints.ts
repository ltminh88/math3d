// Cave hint ladder text (pure): 1 encourage, 2 line diagram for word problems or the rule of the
// format plus the question restated, 3 the first step worked with a "?" result (choose-all names
// one sentence that is not true). No rung shows the result the step asks for.
import { renderGeometryPrompt } from '../../geometry/geometry-strings';
import { renderMeasurementPrompt } from '../../measurement/measurement-strings';
import { renderPrompt } from '../../reasoning/reasoning-strings';
import type { PromptParams, PromptRef } from '../../reasoning/reasoning-types';
import type { CaveChamber, CaveFamily } from './cave-chamber-formats';
import type { CaveStrings } from './cave-strings';

type Render = (prompt: PromptRef) => string;

export function renderOf(family: CaveFamily): Render {
  if (family === 'geometry') return renderGeometryPrompt;
  return family === 'measurement' ? renderMeasurementPrompt : renderPrompt;
}

/** The part of an expression done first: inside the brackets, else the first × or :. */
function firstPart(text: string): string | null {
  const bracket = /\(([^()]+)\)/.exec(text);
  if (bracket) return bracket[1] as string;
  return /\d+ [×:] \d+/.exec(text)?.[0] ?? null;
}

type Build = (p: Readonly<Record<string, number | string>>) => string | null;

/** First calculation per story or statement key, from the numbers the child already reads. */
const FIRST_STEP: Readonly<Record<string, Build>> = {
  wpTimesThenAdd: (p) => `${p.a} × ${p.n}`,
  wpDivideThenAdd: (p) => `${p.a} : ${p.n}`,
  wpMoreThenTotal: (p) => `${p.a} + ${p.d}`,
  wpLessThenTotal: (p) => `${p.a} − ${p.d}`,
  wpUnitThenTimes: (p) => `${p.total} : ${p.boxes}`,
  wpTimesCompare: (p) => `${p.big} : ${p.small}`,
  wpDifferenceCompare: (p) => `${p.big} − ${p.small}`,
  divRemFloor: (p) => `${p.total} : ${p.per}`,
  divRemCeil: (p) => `${p.total} : ${p.per}`,
  exprValue: (p) => firstPart(String(p.text)),
  exprStoryEat: (p) => `${p.n} × ${p.p}`,
  exprStoryShare: (p) => `${p.a} + ${p.b}`,
  rectPerim: (p) => `${p.a} + ${p.b}`,
  rectPerimBack: (p) => `${p.p} : 2`,
  rectArea: (p) => `${p.a} × ${p.b}`,
  rectCut: (p) => `${p.a} × ${p.b}`,
  fence: (p) => `${p.a} + ${p.b}`,
  fenceGate: (p) => `${p.a} + ${p.b}`,
  fenceWall: (p) => `${p.b} + ${p.b}`,
  circleR: (p) => `${p.r} + ${p.r}`,
  circleRow: (p) => `${p.r} + ${p.r}`,
  circleD: (p) => `nửa của ${p.d}`,
  stmtRem: (p) => `${p.total} : ${p.per}`,
  stmtTimes: (p) => `${p.big} : ${p.small}`,
  stmtMore: (p) => `${p.big} − ${p.small}`,
  stmtEq: (p) => firstPart(String(p.text)),
};

const firstOf = (ref: PromptRef | undefined): string | null =>
  ref ? (FIRST_STEP[ref.key]?.(ref.params ?? ({} as PromptParams)) ?? null) : null;

/** The chamber's first calculation ("a × n"), or null when it has none to show. */
export function firstStepExpression(chamber: CaveChamber): string | null {
  const first = chamber.steps[0];
  if (chamber.format === 'tf-explain' && first?.kind === 'verdict') return firstOf(first.statement);
  return firstOf(chamber.item.story);
}

function rungTwo(cs: CaveStrings, chamber: CaveChamber, ask: string): string {
  const id = chamber.skillId;
  switch (chamber.format) {
    case 'word':
      return cs('hint2Word', { ask });
    case 'remainder':
      return cs(id === 'div-rem-ceil' ? 'hint2Ceil' : 'hint2Remainder', { ask });
    case 'choose-all':
      return cs('hint2ChooseAll');
    case 'tf-explain':
      return cs('hint2Tf', { ask });
    case 'expression':
      return cs('hint2Expression', { ask });
    default:
      if (id === 'meas-wp-fence') return cs('hint2Fence', { ask });
      if (id === 'meas-area-rect') return cs('hint2Area', { ask });
      if (id === 'geo-radius-diameter') return cs('hint2Circle', { ask });
      return cs('hint2Perimeter', { ask });
  }
}

/** Hint text for `rung` (1-3) on step `stepIndex` of `chamber`. */
export function caveHintText(
  cs: CaveStrings,
  rung: number,
  chamber: CaveChamber,
  stepIndex: number,
): string {
  if (rung <= 1) return cs('hint1');
  const render = renderOf(chamber.family);
  const step = chamber.steps[stepIndex];
  const ask = step ? render(step.prompt) : '';
  if (rung === 2) return rungTwo(cs, chamber, ask);
  if (step?.kind === 'multi') {
    const wrong = step.options.find((o) => !o.correct);
    return wrong ? cs('hint3Wrong', { label: render(wrong.label) }) : cs('hint3Each');
  }
  const expr = firstStepExpression(chamber);
  return expr ? cs('hint3First', { expr, ask }) : cs('hint3Ask', { ask });
}
