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
import { JUG_SETS, PLACES, TEMP_RANGE, WEIGHTS } from './measurement-ranges';

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

const jug = (capacity: number, marks: number, level: number) =>
  scene({ kind: 'jug', capacity, marks, level }, 32);

export const measMl: GeoGenerator = (rng, tier) => {
  const { capacity, marks } = pick(rng, JUG_SETS[tier]);
  const per = capacity / marks;
  if (tier === 1) {
    const level = randInt(rng, 1, marks - 1);
    const story = ref('jugRead', { capacity, marks });
    return geoItem(
      'meas-ml',
      tier,
      story,
      [numberStep(ref('askWaterMl'), level * per)],
      jug(capacity, marks, level),
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
    const story = ref('jugMarks', { capacity, marks });
    return geoItem('meas-ml', tier, story, steps, jug(capacity, marks, level), 'ml', [
      per,
      level * per,
    ]);
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
  return geoItem('meas-ml', tier, story, steps, jug(capacity, marks, level), 'ml', [
    poured,
    total - poured,
  ]);
};

export const measTemperature: GeoGenerator = (rng, tier) => {
  const [lo, hi] = TEMP_RANGE;
  if (tier === 1) {
    const value = 5 * randInt(rng, lo / 5, hi / 5);
    // Review fix: the thermometer is labelled with a place from PLACES, not a
    // letter — relabelling A/B/C is not a new question for the child (same
    // thermometer, same reading), a place is (6 places × 8 values = 48).
    const place = pick(rng, PLACES);
    const s = scene(
      { kind: 'thermometers', minorStep: 5, readings: [{ label: place, value }] },
      32,
    );
    return geoItem(
      'meas-temperature',
      tier,
      ref('tempRead'),
      [numberStep(ref('askTemp', { place }), value)],
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

/** B31 second skill: add / subtract masses (the first skill reads one pack / compares). */
export const measGramCalc: GeoGenerator = (rng, tier) => {
  const [x, y] = twoNouns(rng, MASS_NOUNS);
  const a = 5 * randInt(rng, 2, 18);
  const b = 5 * randInt(rng, 2, Math.floor((100 - a) / 5));
  const story = ref('gramTotal', { x, y, a, b });
  const totalScene = balance(x, 2, a + b);
  if (tier === 1)
    return geoItem(
      'meas-gram-calc',
      tier,
      story,
      [numberStep(ref('askGramTotal'), a + b)],
      totalScene,
      'g',
    );
  if (tier === 2) {
    const steps = [
      qtyChoiceStep(rng, ref('askGramTotal'), a + b, 'g', [
        { value: a - b, misconception: 'wrong-step' },
        { value: a, misconception: 'one-step-only' },
        { value: b, misconception: 'one-step-only' },
      ]),
    ];
    return geoItem('meas-gram-calc', tier, story, steps, totalScene, 'g');
  }
  // Tier 3: add two packs, then use some grams -> what is left.
  const c = 5 * randInt(rng, 1, Math.floor((a + b - 5) / 5));
  const steps = [
    numberStep(ref('askGramTotal'), a + b),
    qtyChoiceStep(rng, ref('askGramLeft'), a + b - c, 'g', [
      { value: c, misconception: 'wrong-step' },
      { value: a + b, misconception: 'one-step-only' },
    ]),
  ];
  return geoItem(
    'meas-gram-calc',
    tier,
    ref('gramTotalLeft', { x, y, a, b, c }),
    steps,
    totalScene,
    'g',
    [a + b, a + b - c],
  );
};

/** B32 second skill: add / subtract millilitres (the first skill reads one jug). */
export const measMlCalc: GeoGenerator = (rng, tier) => {
  // One 100 ml jug with 10 ml marks, so the scene level is always a whole mark.
  const jug100 = (total: number) => jug(100, 10, total / 10);
  const pair = (maxTotal: number): [number, number] => {
    const a = 10 * randInt(rng, 1, maxTotal / 10 - 1);
    const b = 10 * randInt(rng, 1, (maxTotal - a) / 10);
    return [a, b];
  };
  if (tier === 1) {
    const [a, b] = pair(100);
    return geoItem(
      'meas-ml-calc',
      tier,
      ref('mlAdd', { a, b }),
      [numberStep(ref('askMlTotal'), a + b)],
      jug100(a + b),
      'ml',
    );
  }
  if (tier === 2) {
    let [a, b] = pair(100);
    while (a === b) [a, b] = pair(100);
    const steps = [
      qtyChoiceStep(rng, ref('askMlDiff'), Math.abs(a - b), 'ml', [
        { value: a + b, misconception: 'wrong-step' },
        { value: a, misconception: 'one-step-only' },
      ]),
    ];
    return geoItem(
      'meas-ml-calc',
      tier,
      ref('mlDiff', { a, b }),
      steps,
      jug100(Math.max(a, b)),
      'ml',
    );
  }
  // Tier 3: pour more, then what is missing to fill the 100 ml jug.
  const [a, b] = pair(90);
  const total = a + b;
  const steps = [
    numberStep(ref('askMlTotal'), total),
    qtyChoiceStep(rng, ref('askMlMissing'), 100 - total, 'ml', [
      { value: total, misconception: 'wrong-step' },
      { value: a, misconception: 'one-step-only' },
    ]),
  ];
  return geoItem('meas-ml-calc', tier, ref('mlFill', { a, b }), steps, jug100(total), 'ml', [
    total,
    100 - total,
  ]);
};

/** B33 second skill: differences between places / drops (the first skill reads one place). */
export const measTemperatureCompare: GeoGenerator = (rng, tier) => {
  const [lo, hi] = TEMP_RANGE;
  if (tier === 1) {
    const [x, y] = twoNouns(rng, PLACES);
    const a = randInt(rng, lo, hi);
    let b = randInt(rng, lo, hi);
    while (b === a) b = randInt(rng, lo, hi);
    const readings = [
      { label: x, value: a },
      { label: y, value: b },
    ];
    const s = scene({ kind: 'thermometers', minorStep: 1, readings }, 32);
    return geoItem(
      'meas-temperature-compare',
      tier,
      ref('tempCompare'),
      [numberStep(ref('askTempDiff'), Math.abs(a - b))],
      s,
      'degC',
    );
  }
  if (tier === 2) {
    const places = shuffle(rng, PLACES).slice(0, 3);
    const temps = shuffle(
      rng,
      Array.from({ length: hi - lo + 1 }, (_, i) => lo + i),
    ).slice(0, 3);
    const options = pickOptions(
      rng,
      places.map((l, i) => ({
        label: ref('letter', { l }),
        correct: temps[i] === Math.max(...temps),
        misconception:
          temps[i] === Math.min(...temps) ? ('wrong-step' as const) : ('near-miss' as const),
      })),
    );
    const readings = places.map((label, i) => ({ label, value: temps[i] as number }));
    const s = scene({ kind: 'thermometers', minorStep: 1, readings }, 32);
    const steps: ReasoningStep[] = [
      { kind: 'choice', prompt: ref('askHottest'), options },
      numberStep(ref('askTempDiff'), Math.max(...temps) - Math.min(...temps)),
    ];
    return geoItem('meas-temperature-compare', tier, ref('tempHotDiff'), steps, s, 'degC');
  }
  // Tier 3: two places, noon -> evening drops; which drop is bigger, by how much.
  const [x, y] = twoNouns(rng, PLACES);
  const dropPair = (): [number, number, number, number] => {
    const a = randInt(rng, 25, hi);
    const dx = randInt(rng, 5, 20);
    const c = randInt(rng, 25, hi);
    const dy = randInt(rng, 5, 20);
    return [a, a - dx, c, c - dy];
  };
  let [a, b, c, d] = dropPair();
  while (a - b === c - d) [a, b, c, d] = dropPair();
  const [dx, dy] = [a - b, c - d];
  const options = pickOptions(rng, [
    { label: ref('letter', { l: x }), correct: dx > dy, misconception: 'wrong-step' },
    { label: ref('letter', { l: y }), correct: dy > dx, misconception: 'wrong-step' },
    { label: ref('sameDrop'), correct: false, misconception: 'near-miss' },
  ]);
  const readings = [
    { label: 'A', value: a },
    { label: 'B', value: b },
    { label: 'C', value: c },
    { label: 'D', value: d },
  ];
  const s = scene({ kind: 'thermometers', minorStep: 1, readings }, 32);
  const steps: ReasoningStep[] = [
    { kind: 'choice', prompt: ref('askBiggerDrop'), options },
    numberStep(ref('askDropDiff'), Math.abs(dx - dy)),
  ];
  return geoItem(
    'meas-temperature-compare',
    tier,
    ref('tempDropCompare', { x, y, a, b, c, d }),
    steps,
    s,
    'degC',
    [dx, dy],
  );
};
