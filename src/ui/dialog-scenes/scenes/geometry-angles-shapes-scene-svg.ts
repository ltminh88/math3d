// Geometry angles + shapes + split-figure pictures (phase 04). Angles are never marked
// right (that is the question); shapes are drawn turned by their rotationDeg.
import type { Point, SceneBody } from '../../../geometry/geo-scene-types';
import { svgEl } from '../../../levels/workshop/workshop-shape-svg';
import type { DialogSceneRenderer } from '../dialog-scene-registry';
import { dsLabel, polar, sceneRoot } from '../dialog-scene-svg';

type Angles = Extract<SceneBody, { kind: 'angles' }>;
type Shapes = Extract<SceneBody, { kind: 'shapes' }>;
type Figure = Extract<SceneBody, { kind: 'figure' }>;

function renderAngles(scene: Angles): SVGElement {
  const svg = sceneRoot(320, 280, 'Các góc');
  const [cellW, cellH] = [160, 140];
  scene.angles.forEach((a, i) => {
    const ox = (i % 2) * cellW;
    const oy = Math.floor(i / 2) * cellH;
    const [vx, vy] = [ox + 80, oy + 78];
    const [p1, p2] = [
      polar(vx, vy, 16, a.rotationDeg),
      polar(vx, vy, 16, a.rotationDeg + a.degrees),
    ];
    const [e1, e2] = [
      polar(vx, vy, 48, a.rotationDeg),
      polar(vx, vy, 48, a.rotationDeg + a.degrees),
    ];
    const [lx, ly] = polar(vx, vy, 62, a.rotationDeg + a.degrees / 2);
    svg.append(
      svgEl('line', { x1: vx, y1: vy, x2: e1[0], y2: e1[1], class: 'ds-line' }),
      svgEl('line', { x1: vx, y1: vy, x2: e2[0], y2: e2[1], class: 'ds-line' }),
      svgEl('path', {
        d: `M${p1[0]},${p1[1]} A16,16 0 0 0 ${p2[0]},${p2[1]}`,
        class: 'ds-arc',
      }),
      svgEl('circle', { cx: vx, cy: vy, r: 3, class: 'ds-point' }),
      dsLabel(lx, ly, a.label),
    );
  });
  return svg;
}

/** Cells for 1-4 figures: one centred, two side by side, three or four in a 2×2 grid. */
function cells(count: number): readonly (readonly [number, number, number, number])[] {
  if (count === 1) return [[0, 0, 320, 280]];
  if (count === 2)
    return [
      [0, 0, 160, 280],
      [160, 0, 160, 280],
    ];
  return [
    [0, 0, 160, 140],
    [160, 0, 160, 140],
    [0, 140, 160, 140],
    [160, 140, 160, 140],
  ];
}

function renderShapes(scene: Shapes): SVGElement {
  const svg = sceneRoot(320, 280, 'Các hình');
  const layout = cells(scene.shapes.length);
  scene.shapes.forEach((shape, i) => {
    const [cx0, cy0, cw, ch] = layout[i] as readonly [number, number, number, number];
    // Vertices are y-up; the screen is y-down, so flip before fitting.
    const maxY = Math.max(...shape.vertices.map((p) => p[1]));
    const flipped = shape.vertices.map(([x, y]): Point => [x, maxY - y]);
    const xs = flipped.map((p) => p[0]);
    const ys = flipped.map((p) => p[1]);
    const [minX, maxX, minY, maxY2] = [
      Math.min(...xs),
      Math.max(...xs),
      Math.min(...ys),
      Math.max(...ys),
    ];
    const scale = Math.min(
      (cw - 40) / Math.max(maxX - minX, 1),
      (ch - 56) / Math.max(maxY2 - minY, 1),
    );
    const w = (maxX - minX) * scale;
    const h = (maxY2 - minY) * scale;
    const ox = cx0 + (cw - w) / 2 - minX * scale;
    const oy = cy0 + 8 + (ch - 24 - h) / 2 - minY * scale;
    const points = flipped.map(([x, y]) => `${ox + x * scale},${oy + y * scale}`).join(' ');
    const ccx = cx0 + cw / 2;
    const ccy = cy0 + 8 + (ch - 24) / 2;
    const poly = svgEl('polygon', {
      points,
      class: 'ds-shape',
      transform: `rotate(${shape.rotationDeg} ${ccx} ${ccy})`,
    });
    svg.append(poly, dsLabel(ccx, cy0 + ch - 12, shape.label));
  });
  return svg;
}

function renderFigure(scene: Figure): SVGElement {
  const svg = sceneRoot(320, 260, 'Hình chia');
  const xs = scene.segments.flatMap(([x1, , x2]) => [x1, x2]);
  const ys = scene.segments.flatMap(([, y1, , y2]) => [y1, y2]);
  const [minX, maxX, minY, maxY] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys),
  ];
  const scale = Math.min(280 / Math.max(maxX - minX, 1), 220 / Math.max(maxY - minY, 1));
  const ox = 20 + (280 - (maxX - minX) * scale) / 2 - minX * scale;
  const oy = 20 + (220 - (maxY - minY) * scale) / 2 - minY * scale;
  for (const [x1, y1, x2, y2] of scene.segments)
    svg.append(
      svgEl('line', {
        x1: ox + x1 * scale,
        y1: oy + y1 * scale,
        x2: ox + x2 * scale,
        y2: oy + y2 * scale,
        class: 'ds-line',
      }),
    );
  return svg;
}

export const sceneRenderer: DialogSceneRenderer = {
  kinds: ['angles', 'shapes', 'figure'],
  render(scene) {
    if (scene.kind === 'angles') return renderAngles(scene);
    if (scene.kind === 'shapes') return renderShapes(scene);
    return renderFigure(scene as Figure);
  },
};
