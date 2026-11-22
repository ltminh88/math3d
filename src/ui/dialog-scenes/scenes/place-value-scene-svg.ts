// Place-value table picture (phase 16): one column per place, the digit's worth
// of unit blocks stacked in it, the digit itself underneath. Blocks are the digit
// in that place (0–9); a column with more than 9 would show the first 9 plus a
// "×n" badge (the phase-16 risk countermove — no generator makes one today).
import { svgEl } from '../../../levels/workshop/workshop-shape-svg';
import { PLACE_WORD } from '../../../numbers/numbers-ranges';
import type { NumberScene, PlaceColumn } from '../../../numbers/numbers-scene-types';
import { renderNumbersPrompt } from '../../../numbers/numbers-strings';
import type { DialogSceneRenderer } from '../dialog-scene-registry';
import { dsLabel, sceneRoot } from '../dialog-scene-svg';

type PlaceValueScene = Extract<NumberScene, { kind: 'place-value' }>;

const WIDTH = 420;
const HEIGHT = 210;
const BLOCK = 12;
const PITCH = 15;
const BASELINE = 172;

function renderColumn(col: PlaceColumn, x: number, colWidth: number): SVGElement[] {
  const cx = x + colWidth / 2;
  const parts: SVGElement[] = [dsLabel(cx, 24, renderNumbersPrompt({ key: `item_${col.place}` }))];
  // The block area: a faint frame so a zero column still shows its place.
  parts.push(
    svgEl('rect', {
      x: cx - 20,
      y: BASELINE - 9 * PITCH,
      width: 40,
      height: 9 * PITCH,
      class: 'ds-block-frame',
    }),
  );
  const shown = Math.min(col.blocks, 9);
  for (let i = 0; i < shown; i++) {
    parts.push(
      svgEl('rect', {
        x: cx - BLOCK / 2,
        y: BASELINE - (i + 1) * PITCH,
        width: BLOCK,
        height: BLOCK,
        class: 'ds-block',
      }),
    );
  }
  if (col.blocks > 9) parts.push(dsLabel(cx, BASELINE - 9 * PITCH - 12, `×${col.blocks}`));
  parts.push(dsLabel(cx, 196, String(col.blocks)));
  return parts;
}

function renderPlaceValue(scene: PlaceValueScene): SVGElement {
  const n = scene.columns.length;
  const colWidth = WIDTH / n;
  const label = scene.columns.map((c) => `${c.blocks} ${PLACE_WORD[c.place]}`).join(', ');
  const svg = sceneRoot(WIDTH, HEIGHT, `Bảng giá trị: ${label}`);
  scene.columns.forEach((col, i) => {
    svg.append(...renderColumn(col, i * colWidth, colWidth));
  });
  return svg;
}

export const sceneRenderer: DialogSceneRenderer = {
  kinds: ['place-value'],
  render(scene) {
    return renderPlaceValue(scene as PlaceValueScene);
  },
};
