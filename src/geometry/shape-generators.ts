// KNTT T1 B19: hình tam giác, hình tứ giác, hình chữ nhật, hình vuông. KNTT does not call a
// square a rectangle (B19 Bài 1 lists them apart), so option sets are kept unambiguous: no square
// when the target is "hình chữ nhật", no rectangle/square when it is "hình tứ giác".
// Counting shapes in a split figure (B19 Bài 2): strips of rectangles, a fan of triangles.
import { pick, type Rng, randInt, shuffle } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { numberStep, ref } from '../reasoning/reasoning-distractors';
import type { Misconception, ReasoningStep } from '../reasoning/reasoning-types';
import type { GeoGenerator } from './geo-scene-types';
import { geoItem, LETTERS, letterOptions, qtyChoiceStep, scene } from './geometry-distractors';
import { GRID_MAX, ROTATION_RANGE } from './geometry-ranges';
import { makeShape, SHAPE_FACTS, type ShapeKind } from './polygon-templates';

type Target = 'triangle' | 'quad' | 'rect' | 'square';
const TARGETS: readonly Target[] = ['triangle', 'quad', 'rect', 'square'];

const RIGHT: Readonly<Record<Target, readonly ShapeKind[]>> = {
  triangle: ['triangle', 'rightTriangle'],
  quad: ['parallelogram', 'rightTrapezoid', 'trapezoid', 'rhombus'],
  rect: ['rect'],
  square: ['square'],
};
/** Wrong figures per target; the first ones are the tricky look-alikes used at tier 3. */
const WRONG: Readonly<Record<Target, readonly [ShapeKind, Misconception][]>> = {
  triangle: [
    ['rightTrapezoid', 'wrong-shape'],
    ['house', 'wrong-shape'],
    ['rect', 'wrong-shape'],
    ['square', 'wrong-shape'],
  ],
  quad: [
    ['house', 'wrong-shape'],
    ['rightTriangle', 'wrong-shape'],
    ['triangle', 'wrong-shape'],
  ],
  rect: [
    ['parallelogram', 'equal-sides-only'],
    ['rightTrapezoid', 'wrong-shape'],
    ['house', 'wrong-shape'],
    ['rightTriangle', 'wrong-shape'],
  ],
  square: [
    ['rect', 'right-angles-only'],
    ['rhombus', 'equal-sides-only'],
    ['trapezoid', 'wrong-shape'],
    ['triangle', 'wrong-shape'],
  ],
};

export const geoShapeClassify: GeoGenerator = (rng, tier) => {
  const target = pick(rng, TARGETS);
  const rights = tier === 1 ? 1 : randInt(rng, 1, 3);
  const wrongPool = tier === 3 ? WRONG[target] : shuffle(rng, WRONG[target]);
  const figs: { kind: ShapeKind; misconception?: Misconception }[] = [
    ...Array.from({ length: rights }, () => ({ kind: pick(rng, RIGHT[target]) })),
    ...Array.from({ length: 4 - rights }, (_, i) => {
      const [kind, misconception] = wrongPool[i % wrongPool.length] as [ShapeKind, Misconception];
      return { kind, misconception };
    }),
  ];
  const order = shuffle(rng, figs);
  const shapes = order.map((f, i) => ({
    label: LETTERS[i] as string,
    vertices: makeShape(rng, f.kind),
    rotationDeg: tier === 3 ? pick(rng, [0, randInt(rng, ...ROTATION_RANGE)]) : 0,
  }));
  const options = letterOptions(
    order.map((f) => ({
      correct: SHAPE_FACTS[f.kind].cls === target,
      misconception: f.misconception,
    })),
  );
  const step: ReasoningStep =
    tier === 1
      ? { kind: 'choice', prompt: ref(`pickOne_${target}`), options }
      : { kind: 'multi', prompt: ref(`pickAll_${target}`), options };
  return geoItem(
    'geo-shape-classify',
    tier,
    ref('classify'),
    [step],
    scene({ kind: 'shapes', shapes }),
    null,
  );
};

type Seg = readonly [number, number, number, number];

const contiguousSums = (parts: readonly number[]): Set<number> => {
  const out = new Set<number>();
  for (let i = 0; i < parts.length; i++)
    for (let j = i; j < parts.length; j++)
      out.add(parts.slice(i, j + 1).reduce((a, b) => a + b, 0));
  return out;
};

/** Widths / heights with no width sum equal to a height sum: no piece is a square. */
function noSquareSplit(rng: Rng, cols: number, rows: number): { ws: number[]; hs: number[] } {
  for (;;) {
    const ws = Array.from({ length: cols }, () => randInt(rng, 1, Math.floor(GRID_MAX.w / cols)));
    const hs = Array.from({ length: rows }, () => randInt(rng, 1, Math.floor(GRID_MAX.h / rows)));
    const wSums = contiguousSums(ws);
    if (![...contiguousSums(hs)].some((h) => wSums.has(h))) return { ws, hs };
  }
}

const prefix = (parts: readonly number[]) =>
  parts.map((_, i) => parts.slice(0, i + 1).reduce((a, b) => a + b, 0));

function rectFigure(rng: Rng, cols: number, rows: number): Seg[] {
  const { ws, hs } = noSquareSplit(rng, cols, rows);
  const xs = prefix(ws);
  const ys = prefix(hs);
  const [W, H] = [xs.at(-1) as number, ys.at(-1) as number];
  return [
    [0, 0, W, 0],
    [0, H, W, H],
    [0, 0, 0, H],
    ...xs.map((x): Seg => [x, 0, x, H]),
    ...ys.slice(0, -1).map((y): Seg => [0, y, W, y]),
  ];
}

/** A triangle with `cuts` segments from the apex to the base. */
function fanFigure(rng: Rng, cuts: number): Seg[] {
  const W = GRID_MAX.w;
  const base = shuffle(rng, [1, 2, 3, 4, 5, 6, 7])
    .slice(0, cuts)
    .sort((a, b) => a - b);
  const apex = [randInt(rng, 2, W - 2), randInt(rng, 3, GRID_MAX.h)] as const;
  return [[0, 0, W, 0], ...[0, ...base, W].map((x): Seg => [apex[0], apex[1], x, 0])];
}

const SIZE: Readonly<
  Record<SkillTier, { rect: [number, number]; cuts: number; answer: [number, number] }>
> = {
  1: { rect: [2, 1], cuts: 1, answer: [3, 3] },
  2: { rect: [3, 1], cuts: 2, answer: [6, 6] },
  3: { rect: [2, 2], cuts: 3, answer: [9, 10] },
};

export const geoShapeCount: GeoGenerator = (rng, tier) => {
  const ask = rng() < 0.5 ? 'rectangle' : 'triangle';
  const size = SIZE[tier];
  const segments = ask === 'rectangle' ? rectFigure(rng, ...size.rect) : fanFigure(rng, size.cuts);
  const answer = ask === 'rectangle' ? size.answer[0] : size.answer[1];
  const prompt = ref(ask === 'rectangle' ? 'askCountRect' : 'askCountTri');
  const smallOnly = ask === 'rectangle' ? size.rect[0] * size.rect[1] : size.cuts + 1;
  const step =
    tier === 1
      ? qtyChoiceStep(rng, prompt, answer, null, [
          { value: smallOnly, misconception: 'missed-count' },
        ])
      : numberStep(prompt, answer);
  return geoItem(
    'geo-shape-count',
    tier,
    ref('countShapes'),
    [step],
    scene({ kind: 'figure', ask, segments }),
    null,
  );
};
