// Solids as simple isometric boxes (phase 04): the valley shows them in 3D, the dialog
// draws the same edges (dims are BoxGeometry(w, h, d) in cm) so equal edges look equal.
import type { SceneBody } from '../../../geometry/geo-scene-types';
import { svgEl } from '../../../levels/workshop/workshop-shape-svg';
import type { DialogSceneRenderer } from '../dialog-scene-registry';
import { dsLabel, sceneRoot } from '../dialog-scene-svg';

type Solids = Extract<SceneBody, { kind: 'solids' }>;

/** One box: front face w×h, depth offset up-right; edge lengths labelled in cm. */
function drawBox(
  svg: SVGSVGElement,
  cx: number,
  cy: number,
  dims: readonly number[],
  target: number,
): void {
  const [w, h, d] = dims as readonly [number, number, number];
  const sc = target / Math.max(w, h, d);
  const [fw, fh, fd] = [w * sc, h * sc, d * sc];
  const [dx, dy] = [fd * 0.55, -fd * 0.4];
  const x = cx - (fw + dx) / 2;
  const y = cy - (fh + dy) / 2 - dy / 2;
  const top = `${x},${y} ${x + fw},${y} ${x + fw + dx},${y + dy} ${x + dx},${y + dy}`;
  const side = `${x + fw},${y} ${x + fw + dx},${y + dy} ${x + fw + dx},${y + fh + dy} ${x + fw},${y + fh}`;
  svg.append(
    svgEl('polygon', { points: top, class: 'ds-solid-top' }),
    svgEl('polygon', { points: side, class: 'ds-solid-side' }),
    svgEl('rect', { x, y, width: fw, height: fh, class: 'ds-solid-front' }),
    dsLabel(x + fw / 2, y + fh + 16, `${w} cm`),
    dsLabel(x - 8, y + fh / 2, `${h} cm`, 'end'),
    dsLabel(x + fw + dx / 2 + 4, y + dy / 2 - 4, `${d} cm`, 'start'),
  );
}

function renderSolids(scene: Solids): SVGElement {
  const svg = sceneRoot(320, 280, 'Khối');
  const single = scene.solids.length === 1;
  scene.solids.forEach((solid, i) => {
    const cell = single
      ? { x: 0, y: 0, w: 320, h: 280 }
      : { x: (i % 2) * 160, y: Math.floor(i / 2) * 140, w: 160, h: 140 };
    const cx = cell.x + cell.w / 2;
    const cy = cell.y + cell.h / 2 + 6;
    drawBox(svg, cx, cy, solid.dims, single ? 110 : 56);
    svg.append(dsLabel(cx, cell.y + 16, solid.label));
  });
  return svg;
}

export const sceneRenderer: DialogSceneRenderer = {
  kinds: ['solids'],
  render(scene) {
    return renderSolids(scene as Solids);
  },
};
