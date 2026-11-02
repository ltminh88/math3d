// KNTT T1 B31 Gam (balance with weights), B32 Mi-li-lít (jug with marks, pouring into cups),
// B33 Nhiệt độ (read, compare places, how much colder). Every amount <= 100 (no kg / l).

import type { GeoGenerator } from '../geometry/geo-scene-types';
import { geoItem, qtyChoiceStep, scene } from '../geometry/geometry-distractors';
import { pick, randInt, shuffle } from '../learning/seeded-rng';
import { numberStep, ref } from '../reasoning/reasoning-distractors';
import type { ReasoningStep } from '../reasoning/reasoning-types';
import {
  MASS_NOUNS,
  nounLabel,
  pickOptions,
  twoNouns,
  weightsFor,
} from './measurement-distractors';
import { JUG_CAPACITY, JUG_MARKS, PLACES, TEMP_RANGE, WEIGHTS } from './measurement-ranges';

const balance = (item: string, count: number, grams: number) =>
  scene({ kind: 'balance', item, count, weights: weightsFor(grams) }, 32);

export const measGram: GeoGenerator = (rng, tier) => {
  if (tier === 1) {
    const item = pick(rng, MASS_NOUNS);
    const weights = Array.from({ length: randInt(rng, 2, 3) }, () => pick(rng, WEIGHTS.slice(1)));
    const grams = weights.reduce((a, b) => a + b, 0);
    const s = scene({ kind: 'balance', item, count: 1, weights }, 32);
    return geoItem(
      'meas-gram',
      tier,
      ref('balanceRead', { item }),
      [numberStep(ref('askItemG', { item }), grams)],
      s,
      'g',
    );
  }
  if (tier === 2) {
    const a = randInt(rng, 10, 100);
    const b = pick(
      rng,
      Array.from({ length: 91 }, (_, i) => i + 10).filter((n) => n !== a),
    );
    const [x, y] = twoNouns(rng, MASS_NOUNS);
    const options = pickOptions(rng, [
      { label: nounLabel(x), correct: a > b, misconception: 'wrong-step' },
      { label: nounLabel(y), correct: b > a, misconception: 'wrong-step' },
      { label: ref('sameWeight'), correct: false, misconception: 'near-miss' },
    ]);
    const steps: ReasoningStep[] = [
      { kind: 'choice', prompt: ref('askHeavier'), options },
      numberStep(ref('askHowMuchHeavier'), Math.abs(a - b)),
    ];
    return geoItem('meas-gram', tier, ref('heavier', { a, b, x, y }), steps, balance(x, 1, a), 'g');
  }
  // Tier 3: equal packets balance the weights -> total, then one packet.
  const item = pick(rng, MASS_NOUNS);
  const count = randInt(rng, 2, 5);
  const per = randInt(rng, 2, Math.floor(100 / count));
  const total = count * per;
  const steps = [
    numberStep(ref('askWeightsTotal'), total),
    qtyChoiceStep(rng, ref('askEachG', { item }), per, 'g', [
      { value: total, misconception: 'one-step-only' },
      { value: weightsFor(total).length, misconception: 'count-weights' },
      { value: total - count, misconception: 'minus-instead-of-divide' },
    ]),
  ];
  const story = ref('balanceShare', { count, item });
  return geoItem('meas-gram', tier, story, steps, balance(item, count, total), 'g', [total, per]);
};

const jug = (marks: number, level: number) =>
  scene({ kind: 'jug', capacity: JUG_CAPACITY, marks, level }, 32);

export const measMl: GeoGenerator = (rng, tier) => {
  const marks = pick(rng, JUG_MARKS[tier]);
  const per = JUG_CAPACITY / marks;
  if (tier === 1) {
    const level = randInt(rng, 1, marks - 1);
    const story = ref('jugRead', { capacity: JUG_CAPACITY, marks });
    return geoItem(
      'meas-ml',
      tier,
      story,
      [numberStep(ref('askWaterMl'), level * per)],
      jug(marks, level),
      'ml',
    );
  }
  if (tier === 2) {
    const level = randInt(rng, 1, marks - 1);
    const steps = [
      numberStep(ref('askPerMark'), per),
      qtyChoiceStep(rng, ref('askWaterMl'), level * per, 'ml', [
        { value: level, misconception: 'count-marks' },
        { value: per, misconception: 'one-step-only' },
        { value: level * 10, misconception: 'wrong-step' },
      ]),
    ];
    const story = ref('jugMarks', { capacity: JUG_CAPACITY, marks });
    return geoItem('meas-ml', tier, story, steps, jug(marks, level), 'ml', [per, level * per]);
  }
  // Tier 3: pour equal cups out of the jug, then what is left.
  const level = randInt(rng, 3, marks);
  const total = level * per;
  const cups = randInt(rng, 2, 4);
  const cupMl = 5 * randInt(rng, 1, Math.floor((total - 5) / cups / 5));
  const poured = cups * cupMl;
  const steps = [
    numberStep(ref('askPoured'), poured),
    qtyChoiceStep(rng, ref('askLeftMl'), total - poured, 'ml', [
      { value: total - cupMl, misconception: 'one-step-only' },
      { value: poured, misconception: 'wrong-step' },
    ]),
  ];
  const story = ref('jugPour', { total, cups, per: cupMl });
  return geoItem('meas-ml', tier, story, steps, jug(marks, level), 'ml', [poured, total - poured]);
};

export const measTemperature: GeoGenerator = (rng, tier) => {
  const [lo, hi] = TEMP_RANGE;
  if (tier === 1) {
    const value = 5 * randInt(rng, lo / 5, hi / 5);
    const s = scene({ kind: 'thermometers', minorStep: 5, readings: [{ label: 'A', value }] }, 32);
    return geoItem(
      'meas-temperature',
      tier,
      ref('tempRead'),
      [numberStep(ref('askTemp'), value)],
      s,
      'degC',
    );
  }
  if (tier === 2) {
    const places = shuffle(rng, PLACES).slice(0, 3);
    const values = shuffle(
      rng,
      Array.from({ length: hi - lo + 1 }, (_, i) => lo + i),
    ).slice(0, 3);
    const hottest = rng() < 0.5;
    const best = hottest ? Math.max(...values) : Math.min(...values);
    const worst = hottest ? Math.min(...values) : Math.max(...values);
    const options = pickOptions(
      rng,
      places.map((l, i) => ({
        label: ref('letter', { l }),
        correct: values[i] === best,
        misconception: values[i] === worst ? ('wrong-step' as const) : ('near-miss' as const),
      })),
    );
    const readings = places.map((label, i) => ({ label, value: values[i] as number }));
    const s = scene({ kind: 'thermometers', minorStep: 1, readings }, 32);
    const steps: ReasoningStep[] = [
      { kind: 'choice', prompt: ref(hottest ? 'askHottest' : 'askColdest'), options },
    ];
    return geoItem(
      'meas-temperature',
      tier,
      ref(hottest ? 'tempHottest' : 'tempColdest'),
      steps,
      s,
      null,
    );
  }
  const noon = randInt(rng, 25, hi);
  const night = randInt(rng, lo + 5, noon - 5);
  const drop = noon - night;
  const steps = [
    qtyChoiceStep(rng, ref('askDrop'), drop, 'degC', [
      { value: noon + night, misconception: 'wrong-step' },
      { value: night, misconception: 'one-step-only' },
    ]),
  ];
  const readings = [
    { label: 'A', value: noon },
    { label: 'B', value: night },
  ];
  const s = scene({ kind: 'thermometers', minorStep: 1, readings }, 32);
  return geoItem('meas-temperature', tier, ref('tempDrop', { noon, night }), steps, s, 'degC', [
    drop,
  ]);
};
