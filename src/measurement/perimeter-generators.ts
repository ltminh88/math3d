// KNTT T2 B50: chu vi hình tam giác, tứ giác (sum of sides), hình chữ nhật ((dài + rộng) × 2),
// hình vuông (cạnh × 4) and the garden fence with a gate (Luyện tập 3: (9 + 5) × 2 − 2).
// Distractors are the classic slips: dài + rộng only, dài × rộng, cạnh × 2, all four sides.

import type { GeoGenerator } from '../geometry/geo-scene-types';
import { geoItem, qtyChoiceStep, scene } from '../geometry/geometry-distractors';
import { pick, type Rng, randInt } from '../learning/seeded-rng';
import { numberStep, ref } from '../reasoning/reasoning-distractors';
import { FENCE_SIDE_RANGE, GATE_RANGE, SIDE_RANGE } from './measurement-ranges';

const [MIN_SIDE, MAX_SIDE] = SIDE_RANGE;
const sum = (ns: readonly number[]) => ns.reduce((a, b) => a + b, 0);

/** 3 or 4 sides where each side is shorter than the others together (a real polygon). */
function polygonSides(rng: Rng): number[] {
  const n = rng() < 0.5 ? 3 : 4;
  for (;;) {
    const sides = Array.from({ length: n }, () => randInt(rng, MIN_SIDE, MAX_SIDE));
    if (sides.every((s) => s < sum(sides) - s)) return sides;
  }
}

export const measPerimeterPolygon: GeoGenerator = (rng, tier) => {
  const sides = polygonSides(rng);
  const p = sum(sides);
  if (tier === 3) {
    const hidden = randInt(rng, 0, sides.length - 1);
    const answer = sides[hidden] as number;
    const s = scene({ kind: 'side-polygon', sides, hidden: [hidden] });
    const step = numberStep(ref('askMissing'), answer);
    return geoItem('meas-perimeter-polygon', tier, ref('perimMissing', { p }), [step], s, 'cm', [
      p - answer,
    ]);
  }
  const prompt = ref('askPerim');
  const step =
    tier === 1
      ? numberStep(prompt, p)
      : qtyChoiceStep(rng, prompt, p, 'cm', [
          { value: p - pick(rng, sides), misconception: 'one-side-missed' },
          { value: p + pick(rng, sides), misconception: 'wrong-step' },
        ]);
  const s = scene({ kind: 'side-polygon', sides, hidden: [] });
  return geoItem('meas-perimeter-polygon', tier, ref('perimSum'), [step], s, 'cm', [p]);
};

/** dài > rộng, both 1-20 cm. */
function rectSides(rng: Rng, min = MIN_SIDE): [number, number] {
  const a = randInt(rng, min + 1, MAX_SIDE);
  return [a, randInt(rng, 1, a - 1)];
}

const rectScene = (a: number, b: number, unit: 'cm' | 'm', extra = {}) =>
  scene({ kind: 'rect', width: a, height: b, unit, showWidth: true, showHeight: true, ...extra });

export const measPerimeterRect: GeoGenerator = (rng, tier) => {
  const [a, b] = rectSides(rng);
  const half = a + b;
  const p = 2 * half;
  if (tier === 3) {
    const steps = [
      numberStep(ref('askHalfPerim'), half),
      qtyChoiceStep(rng, ref('askWidth'), b, 'cm', [
        { value: half, misconception: 'one-step-only' },
        { value: p - a, misconception: 'half-perimeter' },
        { value: p / 4, misconception: 'square-times-two' },
      ]),
    ];
    const s = rectScene(a, b, 'cm', { showHeight: false });
    return geoItem('meas-perimeter-rect', tier, ref('rectPerimBack', { p, a }), steps, s, 'cm', [
      half,
      b,
    ]);
  }
  const ask = ref('askPerimRect');
  const steps =
    tier === 1
      ? [numberStep(ref('askHalfPerim'), half), numberStep(ask, p)]
      : [
          qtyChoiceStep(rng, ask, p, 'cm', [
            { value: half, misconception: 'half-perimeter' },
            { value: a * b, misconception: 'area-not-perimeter' },
            { value: a + b + a, misconception: 'one-side-missed' },
          ]),
        ];
  return geoItem(
    'meas-perimeter-rect',
    tier,
    ref('rectPerim', { a, b }),
    steps,
    rectScene(a, b, 'cm'),
    'cm',
    [half, p],
  );
};

export const measPerimeterSquare: GeoGenerator = (rng, tier) => {
  const s = randInt(rng, MIN_SIDE, MAX_SIDE);
  const p = 4 * s;
  if (tier === 3) {
    const step = qtyChoiceStep(rng, ref('askSide'), s, 'cm', [
      { value: p / 2, misconception: 'square-times-two' },
      { value: p - 4, misconception: 'add-instead-of-times' },
    ]);
    const sc = rectScene(s, s, 'cm', { showWidth: false, showHeight: false });
    return geoItem('meas-perimeter-square', tier, ref('wireSquare', { p }), [step], sc, 'cm', [p]);
  }
  const ask = ref('askPerimSquare');
  const step =
    tier === 1
      ? numberStep(ask, p)
      : qtyChoiceStep(rng, ask, p, 'cm', [
          { value: 2 * s, misconception: 'square-times-two' },
          { value: s * s, misconception: 'area-not-perimeter' },
          { value: s + 4, misconception: 'add-instead-of-times' },
        ]);
  const sc = rectScene(s, s, 'cm', { showHeight: false });
  return geoItem('meas-perimeter-square', tier, ref('squarePerim', { s }), [step], sc, 'cm', [p]);
};

export const measWpFence: GeoGenerator = (rng, tier) => {
  const a = randInt(rng, FENCE_SIDE_RANGE[0], FENCE_SIDE_RANGE[1]);
  const b = randInt(rng, 2, a - 1);
  const p = 2 * (a + b);
  if (tier === 1)
    return geoItem(
      'meas-wp-fence',
      tier,
      ref('fence', { a, b }),
      [numberStep(ref('askFence'), p)],
      rectScene(a, b, 'm'),
      'm',
      [a + b, p],
    );
  if (tier === 2) {
    const g = randInt(rng, GATE_RANGE[0], GATE_RANGE[1]);
    const steps = [
      numberStep(ref('askPerimM'), p),
      qtyChoiceStep(rng, ref('askFence'), p - g, 'm', [
        { value: p, misconception: 'one-step-only' },
        { value: p + g, misconception: 'wrong-step' },
      ]),
    ];
    const s = rectScene(a, b, 'm', { gate: g });
    return geoItem('meas-wp-fence', tier, ref('fenceGate', { a, b, g }), steps, s, 'm', [p, p - g]);
  }
  // Tier 3: one long side is a wall, so only three sides get a fence.
  const fence = a + 2 * b;
  const step = qtyChoiceStep(rng, ref('askFence'), fence, 'm', [
    { value: p, misconception: 'all-sides' },
    { value: a + b, misconception: 'half-perimeter' },
    { value: 2 * a + b, misconception: 'wrong-step' },
  ]);
  const s = rectScene(a, b, 'm', { wall: true });
  return geoItem('meas-wp-fence', tier, ref('fenceWall', { a, b }), [step], s, 'm', [fence]);
};
