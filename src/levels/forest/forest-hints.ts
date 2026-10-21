// Hint rungs in the recovered hint area: 1 encourage, 2 model (dealing one each in 3D, groups of
// stones in the card), 3 skip counting, 4 inverse multiplication (`? x 3 = 12`).
import type { HintRung } from '../../learning/hint-ladder';
import type { ForestRound } from './forest-round-flow';
import type { ForestStrings } from './forest-strings';

/** Counting by the divisor up to the dividend: "3, 6, 9, 12". */
export const skipCount = (round: ForestRound): string =>
  Array.from({ length: round.quotient }, (_, i) => round.divisor * (i + 1)).join(', ');

function hintText(ts: ForestStrings, rung: HintRung, round: ForestRound): string {
  if (rung <= 1) return ts('hint1');
  if (rung === 2) {
    if (round.kind === 'share') return ts('hint2');
    if (round.kind === 'pack') return ts('hint2Pack', { size: round.divisor });
    return ts('hint2Family', { p: round.dividend, a: round.divisor, b: round.quotient });
  }
  if (rung === 3) return ts('hint3', { step: round.divisor, sequence: skipCount(round) });
  return ts('hint4', { mul: ts('mulSign'), divisor: round.divisor, dividend: round.dividend });
}

/** Stone groups (recovered `.stone-groups`): `divisor` groups of `quotient` stones. */
function stoneGroups(round: ForestRound): HTMLElement {
  const groups = document.createElement('div');
  groups.className = 'stone-groups';
  groups.setAttribute('aria-hidden', 'true');
  for (let g = 0; g < round.divisor; g++) {
    const group = document.createElement('div');
    group.className = 'stone-group';
    for (let s = 0; s < round.quotient; s++) group.append(document.createElement('i'));
    groups.append(group);
  }
  return groups;
}

/** Renders `rung` into the hint area and returns the text (for the screen-reader announcement). */
export function renderHint(
  area: HTMLElement,
  ts: ForestStrings,
  rung: HintRung,
  round: ForestRound,
): string {
  const text = hintText(ts, rung, round);
  const p = document.createElement('p');
  p.textContent = text;
  const model = rung >= 2 && round.kind === 'family' ? [stoneGroups(round)] : [];
  area.replaceChildren(p, ...model);
  area.hidden = false;
  area.dataset.rung = String(rung);
  return text;
}
