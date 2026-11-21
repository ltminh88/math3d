// Money notes picture (phase 17): flat coloured cards with the value text (SGK
// grouping via formatMoney — the one formatting place for money) and a letter
// badge when the child must pick the note. Never a banknote image.

import { svgEl } from '../../../levels/workshop/workshop-shape-svg';
import { DENOMINATIONS } from '../../../money/money-ranges';
import type { MoneyScene } from '../../../money/money-scene-types';
import { formatMoney } from '../../../money/money-strings';
import type { DialogSceneRenderer } from '../dialog-scene-registry';
import { dsLabel, sceneRoot } from '../dialog-scene-svg';

// Light tints, one per denomination (DENOMINATIONS order), dark text on top.
const NOTE_FILLS = [
  '#fde8d0',
  '#dff0d8',
  '#dbe7fb',
  '#fbd9e4',
  '#fdf3cf',
  '#d3e2fb',
  '#e6def7',
  '#fbdcd3',
  '#d2ece9',
] as const;

const CARD_W = 132;
const CARD_H = 84;
const GAP = 12;
const PER_ROW = 3;

function renderNotes(scene: MoneyScene): SVGElement {
  const n = scene.notes.length;
  const cols = Math.min(PER_ROW, n);
  const rows = Math.ceil(n / PER_ROW);
  const width = cols * CARD_W + (cols - 1) * GAP;
  const height = rows * CARD_H + (rows - 1) * GAP;
  const svg = sceneRoot(width, height, 'Các tờ tiền');
  scene.notes.forEach((note, i) => {
    const x = (i % PER_ROW) * (CARD_W + GAP);
    const y = Math.floor(i / PER_ROW) * (CARD_H + GAP);
    const fill = NOTE_FILLS[DENOMINATIONS.indexOf(note.value)] ?? '#f2efe9';
    svg.append(
      svgEl('rect', { x, y, width: CARD_W, height: CARD_H, rx: 8, class: 'ds-note', fill }),
    );
    svg.append(
      svgEl(
        'text',
        {
          x: x + CARD_W / 2,
          y: y + 32,
          class: 'ds-note-value',
          'text-anchor': 'middle',
          'dominant-baseline': 'middle',
        },
        formatMoney(note.value),
      ),
    );
    svg.append(dsLabel(x + CARD_W / 2, y + 60, 'đồng'));
    if (note.label !== undefined) {
      svg.append(
        svgEl('circle', { cx: x + CARD_W - 18, cy: y + 18, r: 12, class: 'ds-note-badge' }),
        dsLabel(x + CARD_W - 18, y + 18, note.label),
      );
    }
  });
  return svg;
}

export const sceneRenderer: DialogSceneRenderer = {
  kinds: ['notes'],
  render(scene) {
    return renderNotes(scene as MoneyScene);
  },
};
