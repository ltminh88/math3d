// KNTT T1 B30 Mi-li-mét: reading a ruler, 1 cm = 10 mm, and the book's trap "con kiến 3 cm,
// con ve 3 mm": comparing numbers without looking at the unit. Only cm ↔ mm (author cap 100).

import type { GeoGenerator } from '../geometry/geo-scene-types';
import { geoItem, qtyChoiceStep, scene } from '../geometry/geometry-distractors';
import { pick, type Rng, randInt } from '../learning/seeded-rng';
import { numberStep, ref } from '../reasoning/reasoning-distractors';
import type { ReasoningStep } from '../reasoning/reasoning-types';
import { LONG_NOUNS, nounLabel, pickOptions, twoNouns } from './measurement-distractors';
import { RULER_MAX_CM } from './measurement-ranges';

const MAX_MM = RULER_MAX_CM * 10;

const ruler = (fromMm: number, toMm: number) =>
  scene({ kind: 'ruler', maxCm: RULER_MAX_CM, fromMm, toMm }, 32);

export const measRulerRead: GeoGenerator = (rng, tier) => {
  const item = pick(rng, LONG_NOUNS);
  if (tier === 1) {
    const cm = randInt(rng, 2, RULER_MAX_CM);
    const steps = [numberStep(ref('askLenCm'), cm)];
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
    const steps = [numberStep(ref('askLenMm'), mm)];
    return geoItem('meas-ruler-read', tier, ref('rulerMm', { item }), steps, ruler(0, mm), 'mm');
  }
  // Tier 3: the object starts at a later mark; reading only its end is the trap.
  const from = 10 * randInt(rng, 1, 4);
  const len = randInt(rng, 5, MAX_MM - from);
  const to = from + len;
  const step = qtyChoiceStep(rng, ref('askLenMm'), len, 'mm', [
    { value: to, misconception: 'read-end-not-length' },
    { value: from, misconception: 'wrong-step' },
  ]);
  return geoItem(
    'meas-ruler-read',
    tier,
    ref('rulerShift', { item }),
    [step],
    ruler(from, to),
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
    const n = randInt(rng, 1, RULER_MAX_CM);
    const s = ruler(0, n * 10);
    if (rng() < 0.5)
      return geoItem(
        'meas-mm-convert',
        tier,
        ref('cmToMm', { n }),
        [numberStep(ref('askNumber'), n * 10)],
        s,
        'mm',
      );
    const m = n * 10;
    return geoItem(
      'meas-mm-convert',
      tier,
      ref('mmToCm', { m }),
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
