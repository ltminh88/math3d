// SVG drawing helpers for the workshop board: an element factory and the outline of a rectangle
// or a labelled polygon (side labels outside each side). Side-polygons are not to scale (the
// book's own drawings are not either); rectangles keep their proportions within limits.
import type { GeoScene } from '../../geometry/geo-scene-types';

const NS = 'http://www.w3.org/2000/svg';

export function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number> = {},
  text?: string,
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(NS, tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, String(value));
  if (text !== undefined) node.textContent = text;
  return node;
}

export function svgRoot(width: number, height: number, label: string): SVGSVGElement {
  return svgEl('svg', {
    viewBox: `0 0 ${width} ${height}`,
    class: 'workshop-svg',
    role: 'img',
    'aria-label': label,
  });
}

export type Pt = readonly [number, number];

export interface ShapeOutline {
  /** Corners in order; side i joins corner i to corner i + 1. */
  readonly corners: readonly Pt[];
  readonly width: number;
  readonly height: number;
}

const W = 300;
const H = 200;
const PAD = 46;

/** Corners of a rectangle scene fitted into the board (very thin ones are thickened). */
function rectCorners(width: number, height: number): Pt[] {
  const scale = Math.min((W - 2 * PAD) / width, (H - 2 * PAD) / height);
  const w = width * scale;
  const h = Math.max(height * scale, Math.min(40, H - 2 * PAD));
  const x = (W - w) / 2;
  const y = (H - h) / 2;
  return [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
}

const TRIANGLE: Pt[] = [
  [60, 160],
  [250, 160],
  [150, 40],
];
const QUAD: Pt[] = [
  [56, 150],
  [254, 162],
  [232, 44],
  [84, 40],
];

export function shapeOutline(scene: GeoScene): ShapeOutline {
  if (scene.kind === 'rect')
    return { corners: rectCorners(scene.width, scene.height), width: W, height: H };
  if (scene.kind === 'side-polygon')
    return { corners: scene.sides.length === 3 ? TRIANGLE : QUAD, width: W, height: H };
  return { corners: [], width: W, height: H };
}

/** Midpoint of side i pushed `out` px away from the shape's centre (where its label goes). */
export function sideLabelPoint(outline: ShapeOutline, i: number, out = 18): Pt {
  const c = outline.corners;
  const a = c[i] as Pt;
  const b = c[(i + 1) % c.length] as Pt;
  const cx = c.reduce((s, p) => s + p[0], 0) / c.length;
  const cy = c.reduce((s, p) => s + p[1], 0) / c.length;
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const len = Math.hypot(mx - cx, my - cy) || 1;
  return [mx + ((mx - cx) / len) * out, my + ((my - cy) / len) * out];
}

/** A text label centred on `p`. */
export function label(p: Pt, text: string, className = 'ws-label'): SVGTextElement {
  return svgEl(
    'text',
    { x: p[0], y: p[1], class: className, 'text-anchor': 'middle', 'dominant-baseline': 'middle' },
    text,
  );
}

/** The closed outline as one polygon. */
export function outlinePolygon(outline: ShapeOutline, className: string): SVGPolygonElement {
  return svgEl('polygon', {
    points: outline.corners.map((p) => p.join(',')).join(' '),
    class: className,
  });
}
