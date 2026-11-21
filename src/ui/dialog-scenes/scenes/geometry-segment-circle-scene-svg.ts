// Geometry segment + circle pictures (phase 04): the line and the labelled points only —
// no length is ever written on the picture (the tier-2 midpoint question asks for it).
import type { SceneBody } from '../../../geometry/geo-scene-types';
import { svgEl } from '../../../levels/workshop/workshop-shape-svg';
import type { DialogSceneRenderer } from '../dialog-scene-registry';
import { dsLabel, polar, sceneRoot } from '../dialog-scene-svg';

type Segment = Extract<SceneBody, { kind: 'segment' }>;
type Circle = Extract<SceneBody, { kind: 'circle' }>;
type CircleRow = Extract<SceneBody, { kind: 'circle-row' }>;

function renderSegment(scene: Segment): SVGElement {
  const svg = sceneRoot(320, 110, 'Đoạn thẳng');
  const x0 = 20;
  const x1 = 300;
  const y = 55;
  const scale = (x1 - x0) / scene.length;
  svg.append(svgEl('line', { x1: x0, y1: y, x2: x1, y2: y, class: 'ds-line' }));
  for (const p of scene.points) {
    const px = x0 + p.at * scale;
    svg.append(
      svgEl('line', { x1: px, y1: y - 8, x2: px, y2: y + 8, class: 'ds-line' }),
      svgEl('circle', { cx: px, cy: y, r: 4, class: 'ds-point' }),
      dsLabel(px, 30, p.label),
    );
  }
  return svg;
}

function renderCircle(scene: Circle): SVGElement {
  const svg = sceneRoot(280, 280, 'Hình tròn');
  const [cx, cy, r] = [140, 140, 105];
  const at = new Map<string, readonly [number, number]>();
  for (const p of scene.points)
    at.set(p.label, p.angleDeg === null ? [cx, cy] : polar(cx, cy, r, p.angleDeg));
  for (const [a, b] of scene.segments) {
    const pa = at.get(a);
    const pb = at.get(b);
    if (!pa || !pb) continue;
    svg.append(svgEl('line', { x1: pa[0], y1: pa[1], x2: pb[0], y2: pb[1], class: 'ds-line' }));
  }
  svg.append(svgEl('circle', { cx, cy, r, class: 'ds-circle' }));
  for (const p of scene.points) {
    const [px, py] = at.get(p.label) as readonly [number, number];
    const [lx, ly] = p.angleDeg === null ? [px - 16, py - 16] : polar(cx, cy, r + 18, p.angleDeg);
    svg.append(
      svgEl('circle', { cx: px, cy: py, r: 4, class: 'ds-point' }),
      dsLabel(lx, ly, p.label),
    );
  }
  return svg;
}

function renderCircleRow(scene: CircleRow): SVGElement {
  const r = 28;
  const step = 64;
  const width = 30 + scene.count * step;
  const svg = sceneRoot(width, 120, 'Hàng hình tròn');
  const cy = 60;
  for (let i = 0; i < scene.count; i++) {
    const cx = 30 + step / 2 + i * step;
    svg.append(svgEl('circle', { cx, cy, r, class: 'ds-circle' }));
    if (i === 0) {
      svg.append(
        svgEl('line', { x1: cx, y1: cy, x2: cx + r, y2: cy, class: 'ds-line' }),
        dsLabel(cx + r / 2, cy - 12, `${scene.radius} cm`),
      );
    }
  }
  return svg;
}

export const sceneRenderer: DialogSceneRenderer = {
  kinds: ['segment', 'circle', 'circle-row'],
  render(scene) {
    if (scene.kind === 'segment') return renderSegment(scene);
    if (scene.kind === 'circle') return renderCircle(scene);
    return renderCircleRow(scene as CircleRow);
  },
};
