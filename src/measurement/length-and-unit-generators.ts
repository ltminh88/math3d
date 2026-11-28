// KNTT T1 B30 Mi-li-mét: reading a ruler, 1 cm = 10 mm, and the book's trap "con kiến 3 cm,
// con ve 3 mm": comparing numbers without looking at the unit. Only cm ↔ mm (author cap 100).

import type { GeoGenerator } from '../geometry/geo-scene-types';
import { geoItem, qtyChoiceStep, scene } from '../geometry/geometry-distractors';
import { pick, type Rng, randInt } from '../learning/seeded-rng';
import { numberStep, ref } from '../reasoning/reasoning-distractors';
import type { ReasoningStep } from '../reasoning/reasoning-types';
import { LONG_NOUNS, nounLabel, pickOptions, twoNouns } from './measurement-distractors';
import { OBJECTS } from './length-everyday-objects';
import { RULER_MAX_CM } from './measurement-ranges';

const MAX_MM = RULER_MAX_CM * 10;

const ruler = (fromMm: number, toMm: number, showMmLabels = false) =>
  scene(
    { kind: 'ruler', maxCm: RULER_MAX_CM, fromMm, toMm, ...(showMmLabels ? { showMmLabels } : {}) },
    32,
  );

export const measRulerRead: GeoGenerator = (rng, tier) => {
  const item = pick(rng, LONG_NOUNS);
  if (tier === 1) {
    const cm = randInt(rng, 2, RULER_MAX_CM);
    const steps = [numberStep(ref('askLenCm', { item }), cm)];
    return geoItem(
      'meas-ruler-read',
      tier,
      ref('rulerCm', { item }),
      steps,
      ruler(0, cm * 10),
      'cm',
    );
  }
  if (tier === 2) {
    const mm = pick(
      rng,
      Array.from({ length: MAX_MM - 10 }, (_, i) => i + 11).filter((n) => n % 10 !== 0),
    );
    const steps = [numberStep(ref('askLenMm', { item }), mm)];
    return geoItem('meas-ruler-read', tier, ref('rulerMm', { item }), steps, ruler(0, mm), 'mm');
  }
  // Tier 3: the object starts at a later mark; reading only its end is the trap.
  // The answer is two number steps (cm part, then mm part) — "6 cm 4 mm".
  // The ruler numbers its mm ticks here (showMmLabels), so the child can read
  // the mm part without counting ticks.
  const from = 10 * randInt(rng, 1, 4);
  const len = randInt(rng, 5, MAX_MM - from);
  const to = from + len;
  const steps = [
    numberStep(ref('askCmPart'), Math.floor(len / 10)),
    numberStep(ref('askMmPart'), len % 10),
  ];
  return geoItem(
    'meas-ruler-read',
    tier,
    ref('rulerShift', { item }),
    steps,
    ruler(from, to, true),
    'mm',
    [to, from],
  );
};

/** Tier 2: which is longer, a cm or b mm? b is a bigger number than a, so units decide. */
function compareItem(rng: Rng) {
  const a = randInt(rng, 2, 9);
  const equal = rng() < 0.25;
  const b = equal
    ? 10 * a
    : pick(
        rng,
        Array.from({ length: 98 - a }, (_, i) => a + 1 + i).filter((n) => n !== 10 * a),
      );
  const [x, y] = twoNouns(rng, LONG_NOUNS);
  const winner = 10 * a === b ? 'same' : 10 * a > b ? 'x' : 'y';
  // Comparing the bare numbers picks y (b > a): that is the "ignore the unit" option.
  const options = pickOptions(rng, [
    { label: nounLabel(x), correct: winner === 'x', misconception: 'wrong-step' },
    { label: nounLabel(y), correct: winner === 'y', misconception: 'ignore-unit' },
    { label: ref('sameLength'), correct: winner === 'same', misconception: 'near-miss' },
  ]);
  const step: ReasoningStep = { kind: 'choice', prompt: ref('askLonger'), options };
  const s = scene({ kind: 'ruler', maxCm: RULER_MAX_CM, fromMm: 0, toMm: b });
  return geoItem('meas-mm-convert', 2, ref('compareCmMm', { a, b, x, y }), [step], s, null, [
    10 * a,
  ]);
}

export const measMmConvert: GeoGenerator = (rng, tier) => {
  if (tier === 2) return compareItem(rng);
  if (tier === 1) {
    // R112: four small nouns so each T1 question feels different (the 20
    // conversion pairs themselves are curriculum-bound — see plan.md T2).
    // R129: the noun must fit the number — pick from OBJECTS the cm objects
    // whose range contains n, so no "pencil 2 cm" (every n in 1–10 has at
    // least one: 1 → button, 10 → leaf/crayon/cup/candle). The T1 number
    // range itself is unchanged.
    const n = randInt(rng, 1, RULER_MAX_CM);
    const candidates = OBJECTS.filter((o) => o.unit === 'cm' && o.lo <= n && n <= o.hi);
    const item = pick(rng, candidates).item;
    const s = ruler(0, n * 10);
    if (rng() < 0.5)
      return geoItem(
        'meas-mm-convert',
        tier,
        ref('cmToMm', { item, n }),
        [numberStep(ref('askNumber'), n * 10)],
        s,
        'mm',
      );
    const m = n * 10;
    return geoItem(
      'meas-mm-convert',
      tier,
      ref('mmToCm', { item, m }),
      [numberStep(ref('askNumber'), n)],
      s,
      'cm',
    );
  }
  // Tier 3: convert first, then the difference in mm.
  const a = randInt(rng, 2, 9);
  const b = randInt(rng, 5, 10 * a - 1);
  const [x, y] = twoNouns(rng, LONG_NOUNS);
  const diff = 10 * a - b;
  const steps = [
    numberStep(ref('askToMm', { a }), 10 * a),
    qtyChoiceStep(rng, ref('askDiffMm', { x, y }), diff, 'mm', [
      { value: Math.abs(b - a), misconception: 'ignore-unit' },
      { value: 10 * a, misconception: 'one-step-only' },
    ]),
  ];
  const s = scene({ kind: 'ruler', maxCm: RULER_MAX_CM, fromMm: 0, toMm: b });
  return geoItem('meas-mm-convert', tier, ref('diffCmMm', { a, b, x, y }), steps, s, 'mm', [
    10 * a,
    diff,
  ]);
};
