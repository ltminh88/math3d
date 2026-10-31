// Test-only helpers (imported by *.test.ts): recompute geometry facts from a scene's raw data
// (vertices, segments, cells), independently from the generators.
import { numbersOfItem } from '../reasoning/reasoning-test-oracles';
import type { ReasoningItem, ReasoningStep } from '../reasoning/reasoning-types';
import type { GeoItem, GeoScene, Point } from './geo-scene-types';

type V = readonly [number, number];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1]];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1];
const cross = (a: V, b: V) => a[0] * b[1] - a[1] * b[0];
const len2 = (a: V) => dot(a, a);

/** Corners whose two edges are perpendicular. */
export function rightAngles(vs: readonly Point[]): number {
  let n = 0;
  for (let i = 0; i < vs.length; i++) {
    const p = vs[i] as V;
    const prev = vs[(i + vs.length - 1) % vs.length] as V;
    const next = vs[(i + 1) % vs.length] as V;
    if (dot(sub(prev, p), sub(next, p)) === 0) n++;
  }
  return n;
}

export type ShapeClass = 'triangle' | 'quad' | 'rect' | 'square' | 'other';

/** KNTT B19: square = 4 right angles + 4 equal sides; rectangle = 4 right angles, not a square. */
export function classify(vs: readonly Point[]): ShapeClass {
  if (vs.length === 3) return 'triangle';
  if (vs.length !== 4) return 'other';
  if (rightAngles(vs) < 4) return 'quad';
  const sides = vs.map((p, i) => len2(sub(vs[(i + 1) % 4] as V, p as V)));
  return sides.every((s) => s === sides[0]) ? 'square' : 'rect';
}

/** Convex, non-degenerate polygon (all turns the same way, no zero-length side). */
export function isConvex(vs: readonly Point[]): boolean {
  const turns = vs.map((p, i) =>
    Math.sign(
      cross(sub(vs[(i + 1) % vs.length] as V, p as V), sub(vs[(i + 2) % vs.length] as V, p as V)),
    ),
  );
  return turns.every((t) => t !== 0 && t === turns[0]);
}

type Seg = readonly [number, number, number, number];
const onSeg = (p: V, s: Seg): boolean => {
  const a: V = [s[0], s[1]];
  const b: V = [s[2], s[3]];
  return (
    cross(sub(b, a), sub(p, a)) === 0 &&
    Math.min(a[0], b[0]) <= p[0] &&
    p[0] <= Math.max(a[0], b[0]) &&
    Math.min(a[1], b[1]) <= p[1] &&
    p[1] <= Math.max(a[1], b[1])
  );
};
const joined = (segs: readonly Seg[], p: V, q: V) => segs.some((s) => onSeg(p, s) && onSeg(q, s));

/** Axis-aligned rectangles drawn by the segments; also returns how many of them are squares. */
export function countRectangles(segs: readonly Seg[]): { rects: number; squares: number } {
  const xs = [...new Set(segs.flatMap((s) => [s[0], s[2]]))].sort((a, b) => a - b);
  const ys = [...new Set(segs.flatMap((s) => [s[1], s[3]]))].sort((a, b) => a - b);
  let rects = 0;
  let squares = 0;
  for (const [i, x1] of xs.entries())
    for (const x2 of xs.slice(i + 1))
      for (const [j, y1] of ys.entries())
        for (const y2 of ys.slice(j + 1)) {
          const c: V[] = [
            [x1, y1],
            [x2, y1],
            [x2, y2],
            [x1, y2],
          ];
          if (c.every((p, k) => joined(segs, p, c[(k + 1) % 4] as V))) {
            rects++;
            if (x2 - x1 === y2 - y1) squares++;
          }
        }
  return { rects, squares };
}

/** Triangles whose three sides lie on the segments (corners among the segment endpoints). */
export function countTriangles(segs: readonly Seg[]): number {
  const key = (p: V) => `${p[0]},${p[1]}`;
  const pts = [
    ...new Map(
      segs
        .flatMap((s): V[] => [
          [s[0], s[1]],
          [s[2], s[3]],
        ])
        .map((p) => [key(p), p]),
    ).values(),
  ];
  let n = 0;
  for (let a = 0; a < pts.length; a++)
    for (let b = a + 1; b < pts.length; b++)
      for (let c = b + 1; c < pts.length; c++) {
        const [p, q, r] = [pts[a], pts[b], pts[c]] as [V, V, V];
        if (cross(sub(q, p), sub(r, p)) === 0) continue;
        if (joined(segs, p, q) && joined(segs, q, r) && joined(segs, r, p)) n++;
      }
  return n;
}

/** Numbers a child reads in a scene (labels, ticks shown as numbers), for the <= 100 cap. */
export function shownSceneNumbers(scene: GeoScene): number[] {
  switch (scene.kind) {
    case 'segment':
      return [scene.length, ...scene.points.map((p) => p.at)];
    case 'circle':
    case 'circle-row':
      return [scene.radius];
    case 'solids':
      return scene.solids.flatMap((s) => s.dims);
    case 'ruler':
      return [scene.maxCm, scene.fromMm, scene.toMm];
    case 'balance':
      return [scene.count, ...scene.weights];
    case 'jug':
      return [scene.capacity];
    case 'thermometers':
      return scene.readings.map((r) => r.value);
    case 'side-polygon':
      return [...scene.sides];
    case 'rect':
      return [scene.width, scene.height, scene.cut ?? 0, scene.gate ?? 0];
    default:
      return [];
  }
}

export const allNumbers = (item: GeoItem): number[] => [
  ...numbersOfItem(item),
  ...shownSceneNumbers(item.scene),
];

/** The value of a step: number answer, or the `n` of the correct option of a choice. */
export function stepValue(step: ReasoningStep | undefined): number {
  if (step?.kind === 'number') return step.answer;
  if (step?.kind === 'choice') return Number(step.options.find((o) => o.correct)?.label.params?.n);
  throw new Error('step has no numeric value');
}

export const lastValue = (item: ReasoningItem): number => stepValue(item.steps.at(-1));

/** Option ids marked correct in the first choice / multi step. */
export function correctLabels(item: ReasoningItem): string[] {
  const step = item.steps.find((s) => s.kind === 'choice' || s.kind === 'multi');
  if (step?.kind !== 'choice' && step?.kind !== 'multi') throw new Error('no choice step');
  return step.options.filter((o) => o.correct).map((o) => String(o.label.params?.l));
}
