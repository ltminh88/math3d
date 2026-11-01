// What VLM's panel says in a valley round: the opening action, the answer prompt, and the line
// for a found stone / centre / lifted block or a tested corner.
import type { ValleyTarget } from './valley-layout-types';
import type { ValleyRound } from './valley-round-flow';
import type { ValleyStrings } from './valley-strings';

const ACTION_PROMPT = {
  midpoint: 'actMidpoint',
  centre: 'actCentre',
  'set-square': 'actSetSquare',
  lift: 'actLift',
} as const;

/** Answer prompt: board taps also choose the card's options when the figures are lettered. */
export function answerPrompt(vs: ValleyStrings, round: ValleyRound): string {
  return vs(round.layout.targets.some((t) => t.option) ? 'tapShapes' : 'answerNow');
}

/** The round's opening line: its action, or the answer prompt when it has none. */
export function roundPrompt(vs: ValleyStrings, round: ValleyRound): string {
  const action = round.layout.action;
  if (!action) return answerPrompt(vs, round);
  return vs(round.item.scene.kind === 'circle-row' ? 'actCentreRow' : ACTION_PROMPT[action]);
}

export const ekeText = (vs: ValleyStrings, target: ValleyTarget): string =>
  vs(target.fits ? 'ekeFits' : 'ekeMisses');

/** The line once the action is done with `target`. */
export function foundText(vs: ValleyStrings, round: ValleyRound, target: ValleyTarget): string {
  switch (round.layout.action) {
    case 'set-square':
      return ekeText(vs, target);
    case 'lift':
      return vs('lifted');
    case 'midpoint':
      return vs('midFound');
    default:
      return vs(target.id.startsWith('centre:') ? 'centreRowFound' : 'centreFound');
  }
}
