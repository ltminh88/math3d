// Fraction shape picture (phase 16): a circle split into sectors, a bar split
// into columns, or a grid split into cells — one part shaded. Unequal parts
// (the core trap) are drawn with proportional sizes, so the picture itself says
// no 1/n can be read off it. The pick scene lays 3–4 such figures in a row
// with their letters above, the same file because it reuses the shape drawing.

import type {
  FractionPickScene,
  FractionScene,
  FractionShapeBody,
  FractionShapeScene,
} from '../../../fractions/fraction-scene-types';
import { svgEl } from '../../../levels/workshop/workshop-shape-svg';
import type { DialogSceneRenderer } from '../dialog-scene-registry';
import { dsLabel, sceneRoot } from '../dialog-scene-svg';

const WIDTH = 420;
const HEIGHT = 200;
const SHAPE_VI: Record<FractionShapeBody['shape'], string> = {
  circle: 'Hình tròn',
  bar: 'Thanh',
  grid: 'Lưới',
};

/** Two decimals: sector paths stay readable in the DOM. */
const r2 = (n: number): number => Math.round(n * 100) / 100;

function sectorPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const p0x = r2(cx + r * Math.cos(a0));
  const p0y = r2(cy + r * Math.sin(a0));
  const p1x = r2(cx + r * Math.cos(a1));
  const p1y = r2(cy + r * Math.sin(a1));
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${p0x} ${p0y} A ${r} ${r} 0 ${large} 1 ${p1x} ${p1y} Z`;
}

/** Angles of every part boundary, from 12 o'clock clockwise (screen coords). */
function boundaries(body: FractionShapeBody): readonly number[] {
  const total = body.equal ? body.parts : (body.sizes ?? []).reduce((a, s) => a + s, 0);
  const out: number[] = [-Math.PI / 2];
  let acc = 0;
  for (let i = 0; i < body.parts; i++) {
    const w = body.equal ? 1 : (body.sizes?.[i] ?? 1);
    acc += w;
    out.push(-Math.PI / 2 + (acc / total) * 2 * Math.PI);
  }
  return out;
}

/** One shape, centred at (cx, cy); `size` is the circle radius / bar half-width. */
function renderShape(body: FractionShapeBody, cx: number, cy: number, size: number): SVGElement[] {
  const shaded = new Set(body.shaded);
  const cls = (i: number): string => (shaded.has(i) ? 'ds-frac-shaded' : 'ds-frac-part');
  if (body.shape === 'circle') {
    const edges = boundaries(body);
    return Array.from({ length: body.parts }, (_, i) => {
      const a0 = edges[i] as number;
      const a1 = edges[i + 1] as number;
      return svgEl('path', { d: sectorPath(cx, cy, size, a0, a1), class: cls(i) });
    });
  }
  if (body.shape === 'bar') {
    const total = body.equal ? body.parts : (body.sizes ?? []).reduce((a, s) => a + s, 0);
    const h = Math.max(24, Math.round(size * 0.28));
    const y = cy - h / 2;
    let x = cx - size;
    return Array.from({ length: body.parts }, (_, i) => {
      const w = body.equal ? (2 * size) / body.parts : (2 * size * (body.sizes?.[i] ?? 1)) / total;
      const el = svgEl('rect', { x: r2(x), y, width: r2(w), height: h, class: cls(i) });
      x += w;
      return el;
    });
  }
  const cols = body.cols ?? 1;
  const rows = Math.ceil(body.parts / cols);
  const cell = Math.min(44, (2 * size) / cols);
  const x0 = cx - (cols * cell) / 2;
  const y0 = cy - (rows * cell) / 2;
  return Array.from({ length: body.parts }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return svgEl('rect', {
      x: r2(x0 + col * cell),
      y: r2(y0 + row * cell),
      width: r2(cell),
      height: r2(cell),
      class: cls(i),
    });
  });
}

function shapeLabel(body: FractionShapeBody): string {
  return `${SHAPE_VI[body.shape]} chia ${body.parts} phần ${body.equal ? 'bằng nhau' : 'không bằng nhau'}, tô màu ${body.shaded.length} phần`;
}

function renderFractionShape(scene: FractionShapeScene): SVGElement {
  const svg = sceneRoot(WIDTH, HEIGHT, shapeLabel(scene));
  svg.append(...renderShape(scene, 210, 100, 80));
  return svg;
}

function renderFractionPick(scene: FractionPickScene): SVGElement {
  const n = scene.figures.length;
  const svg = sceneRoot(WIDTH, HEIGHT, `${n} hình để chọn`);
  scene.figures.forEach((fig, i) => {
    const cx = ((i + 0.5) * WIDTH) / n;
    svg.append(dsLabel(cx, 22, fig.label));
    svg.append(...renderShape(fig, cx, 112, 44));
  });
  return svg;
}

export const sceneRenderer: DialogSceneRenderer = {
  kinds: ['fraction-shape', 'fraction-pick'],
  render(scene) {
    const s = scene as FractionScene;
    return s.kind === 'fraction-pick'
      ? renderFractionPick(s as FractionPickScene)
      : renderFractionShape(s as FractionShapeScene);
  },
};
