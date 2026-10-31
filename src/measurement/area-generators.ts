// KNTT T2 B51 (diện tích by counting 1 cm² squares, comparing two shapes) and B52 (dài × rộng,
// cạnh × cạnh; the book's cut-corner cake 64 − 9 and "thẻ vuông gấp đôi thẻ đỏ" 18 × 2 = 36).
// The named misconception is chu vi vs diện tích (cạnh 7 cm -> 28 vs 49) and cm vs cm².

import type { GeoGenerator, Point } from '../geometry/geo-scene-types';
import { geoItem, qtyChoiceStep, scene, unitChoiceStep } from '../geometry/geometry-distractors';
import { pick, type Rng, randInt } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { numberStep, ref } from '../reasoning/reasoning-distractors';
import { AREA_CELLS, AREA_SIDE_MAX, CELL_GRID } from './measurement-ranges';

/** A connected shape of `size` unit cells grown cell by cell inside the grid. */
function cellShape(rng: Rng, size: number): Point[] {
  const key = (x: number, y: number) => `${x},${y}`;
  const start: Point = [randInt(rng, 0, CELL_GRID.w - 1), randInt(rng, 0, CELL_GRID.h - 1)];
  const cells: Point[] = [start];
  const taken = new Set([key(...start)]);
  while (cells.length < size) {
    const free = cells.flatMap(([x, y]) =>
      (
        [
          [x + 1, y],
          [x - 1, y],
          [x, y + 1],
          [x, y - 1],
        ] as Point[]
      ).filter(
        ([nx, ny]) =>
          nx >= 0 && ny >= 0 && nx < CELL_GRID.w && ny < CELL_GRID.h && !taken.has(key(nx, ny)),
      ),
    );
    const next = pick(rng, free);
    taken.add(key(...next));
    cells.push(next);
  }
  return cells;
}

const cellsScene = (groups: { label: string; cells: Point[] }[]) =>
  scene({ kind: 'cells', groups }, 28);

const range = (tier: SkillTier) => AREA_CELLS[tier];

export const measAreaCount: GeoGenerator = (rng, tier) => {
  const [lo, hi] = range(tier);
  if (tier !== 3) {
    const cells = cellShape(rng, randInt(rng, lo, hi));
    const s = cellsScene([{ label: 'A', cells }]);
    if (tier === 1)
      return geoItem(
        'meas-area-count',
        tier,
        ref('areaCount'),
        [numberStep(ref('askArea'), cells.length)],
        s,
        'cm2',
      );
    const steps = [
      numberStep(ref('askCellCount'), cells.length),
      unitChoiceStep(rng, 'cm2', ['cm', 'mm']),
    ];
    return geoItem('meas-area-count', tier, ref('areaUnit'), steps, s, 'cm2');
  }
  const a = randInt(rng, lo, hi);
  const b = randInt(rng, 3, a - 1);
  const s = cellsScene([
    { label: 'A', cells: cellShape(rng, a) },
    { label: 'B', cells: cellShape(rng, b) },
  ]);
  const steps = [
    numberStep(ref('askAreaOf', { l: 'A' }), a),
    numberStep(ref('askAreaOf', { l: 'B' }), b),
    qtyChoiceStep(rng, ref('askAreaMore'), a - b, 'cm2', [
      { value: a + b, misconception: 'wrong-step' },
      { value: a, misconception: 'one-step-only' },
    ]),
  ];
  return geoItem('meas-area-count', tier, ref('areaDiff'), steps, s, 'cm2', [a, b, a - b]);
};

const rectScene = (w: number, h: number, extra = {}) =>
  scene({
    kind: 'rect',
    width: w,
    height: h,
    unit: 'cm',
    showWidth: true,
    showHeight: true,
    ...extra,
  });

export const measAreaRect: GeoGenerator = (rng, tier) => {
  const a = randInt(rng, 3, AREA_SIDE_MAX);
  const b = randInt(rng, 2, a - 1);
  const area = a * b;
  if (tier === 3) {
    const c = randInt(rng, 1, b - 1);
    const steps = [
      numberStep(ref('askRectArea'), area),
      numberStep(ref('askCutArea'), c * c),
      qtyChoiceStep(rng, ref('askLeftArea'), area - c * c, 'cm2', [
        { value: area - c, misconception: 'wrong-step' },
        { value: area - 4 * c, misconception: 'perimeter-not-area' },
        { value: area, misconception: 'one-step-only' },
      ]),
    ];
    const story = ref('rectCut', { a, b, c });
    return geoItem('meas-area-rect', tier, story, steps, rectScene(a, b, { cut: c }), 'cm2', [
      area,
      c * c,
      area - c * c,
    ]);
  }
  const steps =
    tier === 1
      ? [numberStep(ref('askAreaRect'), area)]
      : [
          qtyChoiceStep(rng, ref('askAreaRectNum'), area, null, [
            { value: 2 * (a + b), misconception: 'perimeter-not-area' },
            { value: a + b, misconception: 'add-instead-of-times' },
          ]),
          unitChoiceStep(rng, 'cm2', ['cm', 'mm']),
        ];
  return geoItem('meas-area-rect', tier, ref('rectArea', { a, b }), steps, rectScene(a, b), 'cm2', [
    area,
  ]);
};

/** Rectangles a × b (a < b <= 10) whose double area is a square number <= 100. */
const DOUBLE_TO_SQUARE: readonly (readonly [number, number])[] = [
  [1, 2],
  [1, 8],
  [2, 4],
  [2, 9],
  [3, 6],
  [4, 8],
  [5, 10],
];

export const measAreaSquare: GeoGenerator = (rng, tier) => {
  if (tier === 3) {
    const [a, b] = pick(rng, DOUBLE_TO_SQUARE);
    const red = a * b;
    const side = Math.round(Math.sqrt(2 * red));
    const steps = [
      numberStep(ref('askRedArea'), red),
      numberStep(ref('askYellowArea'), 2 * red),
      qtyChoiceStep(rng, ref('askYellowSide'), side, 'cm', [
        { value: red, misconception: 'one-step-only' },
        { value: (2 * red) / 4, misconception: 'area-not-perimeter' },
        { value: red / 2, misconception: 'wrong-step' },
      ]),
    ];
    const story = ref('squareFromRect', { a, b });
    return geoItem('meas-area-square', tier, story, steps, rectScene(b, a), 'cm', [
      red,
      2 * red,
      side,
    ]);
  }
  const s = randInt(rng, 2, AREA_SIDE_MAX);
  const area = s * s;
  const steps =
    tier === 1
      ? [numberStep(ref('askAreaSquare'), area)]
      : [
          qtyChoiceStep(rng, ref('askAreaSquareNum'), area, null, [
            { value: 4 * s, misconception: 'perimeter-not-area' },
            { value: 2 * s, misconception: 'square-times-two' },
          ]),
          unitChoiceStep(rng, 'cm2', ['cm', 'mm']),
        ];
  const sc = rectScene(s, s, { showHeight: false });
  return geoItem('meas-area-square', tier, ref('squareArea', { s }), steps, sc, 'cm2', [area]);
};
