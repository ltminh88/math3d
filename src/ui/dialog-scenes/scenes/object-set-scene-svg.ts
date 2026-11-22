// Object-set picture (phase 16): the fraction-of-set objects in rows, the marked
// ones filled blue. One circle per object, `cols` per row.

import type { FractionSetScene } from '../../../fractions/fraction-scene-types';
import { svgEl } from '../../../levels/workshop/workshop-shape-svg';
import type { DialogSceneRenderer } from '../dialog-scene-registry';
import { sceneRoot } from '../dialog-scene-svg';

const WIDTH = 420;
const CELL = 34;
const R = 12;

function renderFractionSet(scene: FractionSetScene): SVGElement {
  const rows = Math.ceil(scene.count / scene.cols);
  const height = 24 + rows * CELL;
  const marked = new Set(scene.marked);
  const svg = sceneRoot(
    WIDTH,
    height,
    `Tập hợp ${scene.count} vật, ${scene.marked.length} vật được khoanh`,
  );
  const x0 = (WIDTH - scene.cols * CELL) / 2 + CELL / 2;
  for (let i = 0; i < scene.count; i++) {
    const col = i % scene.cols;
    const row = Math.floor(i / scene.cols);
    svg.append(
      svgEl('circle', {
        cx: x0 + col * CELL,
        cy: 12 + row * CELL + CELL / 2,
        r: R,
        class: marked.has(i) ? 'ds-set-marked' : 'ds-set-item',
      }),
    );
  }
  return svg;
}

export const sceneRenderer: DialogSceneRenderer = {
  kinds: ['fraction-set'],
  render(scene) {
    return renderFractionSet(scene as FractionSetScene);
  },
};
