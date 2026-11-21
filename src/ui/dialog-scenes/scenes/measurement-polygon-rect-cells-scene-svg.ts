// Perimeter polygons + rectangles + area cells (phase 04): a static fence picture — the
// workshop's outline and side labels without the walk buttons — plus one grid per group
// of 1 cm² cells. No side is ever labelled with a number the question asks for: hidden
// sides show "?", unshown rect sides stay blank.
import type { Point, SceneBody } from '../../../geometry/geo-scene-types';
import { MIN_UNIT_PX } from '../../../geometry/geometry-ranges';
import { fenceSides } from '../../../levels/workshop/workshop-fence-walk';
import {
  label,
  outlinePolygon,
  type Pt,
  shapeOutline,
  sideLabelPoint,
  svgEl,
} from '../../../levels/workshop/workshop-shape-svg';
import type { DialogSceneRenderer } from '../dialog-scene-registry';
import { dsLabel, sceneRoot, ws } from '../dialog-scene-svg';

type SidePolygon = Extract<SceneBody, { kind: 'side-polygon' }>;
type Rect = Extract<SceneBody, { kind: 'rect' }>;
type Cells = Extract<SceneBody, { kind: 'cells' }>;

/** The side's label: its length with the unit, "?" when hidden, "Tường" for a wall side. */
function sideText(scene: SidePolygon | Rect, length: number, known: boolean): string {
  if (!known) return '?';
  const unit = scene.kind === 'rect' ? scene.unit : 'cm';
  return `${length} ${unit}`;
}

function renderFence(scene: SidePolygon | Rect): SVGElement {
  // shapeOutline/fenceSides take a GeoScene; minUnitPx is only a type tag there.
  const geo = { ...scene, minUnitPx: MIN_UNIT_PX };
  const outline = shapeOutline(geo);
  const svg = sceneRoot(outline.width, outline.height, 'Hình cần đo');
  svg.append(outlinePolygon(outline, 'ws-garden'));
  const sides = fenceSides(geo);
  sides.forEach((side, i) => {
    const c = outline.corners;
    const [a, b] = [c[i] as Pt, c[(i + 1) % c.length] as Pt];
    const g = svgEl('g', { class: side.wall ? 'ws-side ws-wall' : 'ws-side' });
    g.append(
      svgEl('line', {
        x1: a[0],
        y1: a[1],
        x2: b[0],
        y2: b[1],
        class: 'ws-side__line',
      }),
    );
    const text = side.wall ? ws('wall') : sideText(scene, side.length, side.known);
    g.append(label(sideLabelPoint(outline, i), text));
    svg.append(g);
  });
  if (scene.kind === 'rect') {
    const c = outline.corners;
    const [bl, br] = [c[3] as Pt, c[2] as Pt];
    if (scene.gate) {
      const mid = (bl[0] + br[0]) / 2;
      svg.append(
        svgEl('rect', { x: mid - 14, y: bl[1] - 4, width: 28, height: 8, class: 'ws-gate' }),
        label([mid, bl[1] - 16], ws('gate', { g: scene.gate }), 'ws-label ws-label--small'),
      );
    }
    if (scene.cut) {
      const [tl, tr] = [c[0] as Pt, c[1] as Pt];
      const [x0, y0] = tl as Pt;
      const cw = ((tr as Pt)[0] - x0) / scene.width;
      const ch = ((bl as Pt)[1] - y0) / scene.height;
      const s = scene.cut;
      svg.append(
        svgEl('rect', {
          x: x0 + (scene.width - s) * cw,
          y: y0,
          width: s * cw,
          height: s * ch,
          class: 'ws-cut',
        }),
        label(
          [x0 + (scene.width - s / 2) * cw, y0 + (s * ch) / 2],
          `${s} cm`,
          'ws-label ws-label--small',
        ),
      );
    }
  }
  return svg;
}

function renderCells(scene: Cells): SVGElement {
  const svg = sceneRoot(320, 260, 'Các ô vuông');
  const cols = scene.groups.length === 1 ? 1 : 2;
  scene.groups.forEach((group, gi) => {
    const colW = 320 / cols;
    const ox0 = gi * colW;
    const xs = group.cells.map((p) => p[0]);
    const ys = group.cells.map((p) => p[1]);
    const [minX, maxX, minY, maxY] = [
      Math.min(...xs),
      Math.max(...xs),
      Math.min(...ys),
      Math.max(...ys),
    ];
    const bw = maxX - minX + 1;
    const bh = maxY - minY + 1;
    const cell = Math.min((colW - 40) / bw, 170 / bh, 26);
    const gw = bw * cell;
    const gh = bh * cell;
    const ox = ox0 + (colW - gw) / 2;
    const oy = 34 + (170 - gh) / 2;
    for (const [x, y] of group.cells as readonly Point[])
      svg.append(
        svgEl('rect', {
          x: ox + (x - minX) * cell,
          y: oy + (y - minY) * cell,
          width: cell - 1,
          height: cell - 1,
          class: 'ds-cell',
        }),
      );
    svg.append(dsLabel(ox0 + colW / 2, 20, group.label));
  });
  svg.append(dsLabel(160, 244, ws('tileUnit')));
  return svg;
}

export const sceneRenderer: DialogSceneRenderer = {
  kinds: ['side-polygon', 'rect', 'cells'],
  render(scene) {
    if (scene.kind === 'cells') return renderCells(scene);
    return renderFence(scene as SidePolygon | Rect);
  },
};
