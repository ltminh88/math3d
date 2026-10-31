// KNTT T1 B16 (điểm ở giữa, trung điểm) and B17 (tâm, bán kính, đường kính). B17 never writes
// "đường kính gấp 2 lần bán kính"; it adds two radii (7 + 7 = 14 cm), so items say the same.
import { pick, type Rng, randInt, shuffle } from '../learning/seeded-rng';
import { numberStep, ref } from '../reasoning/reasoning-distractors';
import type { ChoiceOption, Misconception, ReasoningStep } from '../reasoning/reasoning-types';
import type { GeoGenerator } from './geo-scene-types';
import { geoItem, qtyChoiceStep, scene } from './geometry-distractors';
import { CIRCLE_ROW_COUNTS, MIDPOINT_LENGTHS, RADIUS_MAX } from './geometry-ranges';

const segmentScene = (length: number, m: number) =>
  scene({
    kind: 'segment',
    length,
    points: [
      { label: 'A', at: 0 },
      { label: 'M', at: m },
      { label: 'B', at: length },
    ],
  });

export const geoMidpoint: GeoGenerator = (rng, tier) => {
  const [lo, hi] = MIDPOINT_LENGTHS[tier];
  const half = randInt(rng, lo / 2, hi / 2);
  const len = 2 * half;
  if (tier === 1) {
    const steps = [numberStep(ref('askAM'), half)];
    return geoItem(
      'geo-midpoint',
      tier,
      ref('midFind', { len }),
      steps,
      segmentScene(len, half),
      'cm',
    );
  }
  if (tier === 2) {
    const steps = [
      qtyChoiceStep(rng, ref('askAB'), len, 'cm', [
        { value: half, misconception: 'half-not-double' },
        { value: half + 2, misconception: 'wrong-step' },
      ]),
    ];
    const s = segmentScene(len, half);
    return geoItem('geo-midpoint', tier, ref('midDouble', { half }), steps, s, 'cm', [len]);
  }
  // Tier 3: "M ở giữa A và B" is not enough: AM must equal MB. Unequal parts keep an even total.
  const truth = rng() < 0.5;
  const shift = truth
    ? 0
    : pick(
        rng,
        [1, 2, 3].filter((d) => d < half),
      );
  const am = half + shift * (rng() < 0.5 ? 1 : -1);
  const mb = len - am;
  const fix = { prompt: ref('fixMid', { len }), answer: half };
  const step: ReasoningStep = {
    kind: 'verdict',
    prompt: ref('isItTrue'),
    statement: ref('stmtMid'),
    answer: truth,
    ...(truth ? {} : { fix }),
  };
  const story = ref('midCheck', { am, mb });
  return geoItem('geo-midpoint', tier, story, [step], segmentScene(len, am), 'cm', [len, half]);
};

/** Points of a circle: centre O, diameter ends, radius ends and a chord (never through O). */
function circleParts(rng: Rng, radii: number) {
  const base = randInt(rng, 0, 11) * 15;
  const letters = shuffle(rng, ['A', 'B', 'C', 'D', 'E', 'G']);
  const [d1, d2, c1, c2, r1, r2] = letters as [string, string, string, string, string, string];
  const points = [
    { label: 'O', angleDeg: null },
    { label: d1, angleDeg: base },
    { label: d2, angleDeg: base + 180 },
    { label: c1, angleDeg: base + 30 },
    { label: c2, angleDeg: base + 120 },
    { label: r1, angleDeg: base + 240 },
    ...(radii > 1 ? [{ label: r2, angleDeg: base + 300 }] : []),
  ];
  return { d: [d1, d2], c: [c1, c2], r: radii > 1 ? [r1, r2] : [r1], points };
}

export const geoCircleParts: GeoGenerator = (rng, tier) => {
  const parts = circleParts(rng, tier === 3 ? 2 : 1);
  const radius = parts.r.map((r) => ['O', r] as const);
  const diameter = parts.d as [string, string];
  const chord = parts.c as [string, string];
  const wantDiameter = tier === 2;
  type Fig = readonly [readonly [string, string], boolean, Misconception];
  const figures: Fig[] = [
    ...radius.map((pair): Fig => [pair, !wantDiameter, 'radius-diameter-swap']),
    [diameter, wantDiameter, 'radius-diameter-swap'],
    [chord, false, wantDiameter ? 'not-through-centre' : 'wrong-shape'],
  ];
  const options: ChoiceOption[] = shuffle(rng, figures).map(([[a, b], ok, m], i) =>
    ok
      ? { id: `o${i}`, label: ref('seg', { a, b }), correct: true }
      : { id: `o${i}`, label: ref('seg', { a, b }), correct: false, misconception: m },
  );
  const key = tier === 1 ? 'pickRadius' : tier === 2 ? 'pickDiameter' : 'pickAllRadius';
  const step: ReasoningStep = { kind: tier === 3 ? 'multi' : 'choice', prompt: ref(key), options };
  const s = scene({
    kind: 'circle',
    radius: 4,
    points: parts.points,
    segments: [...radius, diameter, chord],
  });
  return geoItem('geo-circle-parts', tier, ref('circleParts'), [step], s, null);
};

export const geoRadiusDiameter: GeoGenerator = (rng, tier) => {
  const r = randInt(rng, tier === 2 ? 2 : 1, RADIUS_MAX[tier]);
  const d = 2 * r;
  const circle = (radius: number) =>
    scene({
      kind: 'circle',
      radius,
      points: [
        { label: 'O', angleDeg: null },
        { label: 'A', angleDeg: 0 },
        { label: 'B', angleDeg: 180 },
      ],
      segments: [tier === 1 ? ['O', 'A'] : ['A', 'B']],
    });
  if (tier === 1)
    return geoItem(
      'geo-radius-diameter',
      tier,
      ref('circleR', { r }),
      [numberStep(ref('askD'), d)],
      circle(r),
      'cm',
    );
  if (tier === 2) {
    const step = qtyChoiceStep(rng, ref('askR'), r, 'cm', [
      { value: 2 * d, misconception: 'radius-diameter-swap' },
      { value: d, misconception: 'whole-not-half' },
    ]);
    return geoItem('geo-radius-diameter', tier, ref('circleD', { d }), [step], circle(r), 'cm');
  }
  const count = pick(rng, CIRCLE_ROW_COUNTS);
  const total = count * d;
  const steps = [
    numberStep(ref('askD'), d),
    qtyChoiceStep(rng, ref('askRow', { count }), total, 'cm', [
      { value: count * r, misconception: 'radius-diameter-swap' },
      { value: d, misconception: 'one-step-only' },
    ]),
  ];
  const s = scene({ kind: 'circle-row', radius: r, count });
  return geoItem('geo-radius-diameter', tier, ref('circleRow', { r, count }), steps, s, 'cm', [
    d,
    total,
  ]);
};
