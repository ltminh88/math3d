// KNTT T1 B18: góc vuông, góc không vuông (checked with an ê-ke). The key trap: a right angle
// that is turned (no arm horizontal) still is a right angle. Tiers: upright figures -> turned
// figures -> choose all / "hình nào có nhiều góc vuông nhất?" (the book's Luyện tập 2).
import { pick, type Rng, randInt, shuffle } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { numberStep, ref } from '../reasoning/reasoning-distractors';
import type { Misconception, ReasoningStep } from '../reasoning/reasoning-types';
import type { GeoGenerator } from './geo-scene-types';
import { geoItem, LETTERS, letterOptions, qtyChoiceStep, scene } from './geometry-distractors';
import { NOT_RIGHT_DEGREES, ROTATION_RANGE } from './geometry-ranges';
import { makeShape, SHAPE_FACTS, type ShapeKind } from './polygon-templates';

const turned = (rng: Rng) => randInt(rng, ROTATION_RANGE[0], ROTATION_RANGE[1]);

interface AngleFig {
  degrees: number;
  rotationDeg: number;
  misconception?: Misconception;
}

function angleFigures(rng: Rng, tier: SkillTier): AngleFig[] {
  const others = shuffle(rng, NOT_RIGHT_DEGREES[tier]);
  if (tier === 1)
    return [
      { degrees: 90, rotationDeg: 0 },
      ...others.slice(0, 3).map((degrees) => ({ degrees, rotationDeg: 0 })),
    ];
  if (tier === 2)
    return [
      { degrees: 90, rotationDeg: turned(rng) },
      // An upright angle that is not right: picked by children who trust "nằm ngang" only.
      { degrees: others[0] as number, rotationDeg: 0, misconception: 'upright-only' },
      ...others.slice(1, 3).map((degrees) => ({ degrees, rotationDeg: turned(rng) })),
    ];
  const rights = randInt(rng, 1, 3);
  return Array.from({ length: 4 }, (_, i) =>
    i < rights
      ? { degrees: 90, rotationDeg: i === 0 ? turned(rng) : pick(rng, [0, turned(rng)]) }
      : { degrees: others[i] as number, rotationDeg: pick(rng, [0, turned(rng)]) },
  );
}

export const geoRightAngle: GeoGenerator = (rng, tier) => {
  const figs = shuffle(rng, angleFigures(rng, tier));
  const options = letterOptions(
    figs.map((f) => ({
      correct: f.degrees === 90,
      misconception: f.misconception ?? 'not-a-right-angle',
    })),
  );
  const step: ReasoningStep =
    tier === 3
      ? { kind: 'multi', prompt: ref('pickAllRightAngles'), options }
      : { kind: 'choice', prompt: ref('pickRightAngle'), options };
  const s = scene({
    kind: 'angles',
    angles: figs.map((f, i) => ({
      label: LETTERS[i] as string,
      degrees: f.degrees,
      rotationDeg: f.rotationDeg,
    })),
  });
  return geoItem('geo-right-angle', tier, ref('rightAngle'), [step], s, null);
};

const COUNT_KINDS: readonly ShapeKind[] = [
  'rect',
  'rightTriangle',
  'rightTrapezoid',
  'parallelogram',
  'house',
];
/** One kind per right-angle count, so "nhiều góc vuông nhất" has a single answer. */
const BY_COUNT: Readonly<Record<number, readonly ShapeKind[]>> = {
  4: ['rect'],
  2: ['rightTrapezoid', 'house'],
  1: ['rightTriangle'],
  0: ['parallelogram', 'trapezoid', 'triangle'],
};

export const geoCountRightAngles: GeoGenerator = (rng, tier) => {
  if (tier === 3) {
    const counts = shuffle(rng, [4, 2, 1, 0]).slice(0, 3);
    const kinds = counts.map((c) => pick(rng, BY_COUNT[c] as readonly ShapeKind[]));
    const max = Math.max(...counts);
    const shapes = kinds.map((k, i) => ({
      label: LETTERS[i] as string,
      vertices: makeShape(rng, k),
      rotationDeg: pick(rng, [0, turned(rng)]),
    }));
    const options = letterOptions(
      counts.map((c) => ({ correct: c === max, misconception: 'missed-count' as const })),
    );
    const step: ReasoningStep = { kind: 'choice', prompt: ref('pickMostRight'), options };
    const s = scene({ kind: 'shapes', shapes });
    return geoItem('geo-count-right-angles', tier, ref('mostRight'), [step], s, null);
  }
  const kind = pick(rng, COUNT_KINDS);
  const count = SHAPE_FACTS[kind].rightAngles;
  const rotationDeg = tier === 2 ? turned(rng) : 0;
  const prompt = ref('askRightCount');
  const step =
    tier === 1
      ? numberStep(prompt, count)
      : qtyChoiceStep(rng, prompt, count, null, [
          { value: 0, misconception: 'upright-only' },
          { value: count - 1, misconception: 'missed-count' },
          { value: count + 1, misconception: 'near-miss' },
        ]);
  const s = scene({
    kind: 'shapes',
    shapes: [{ label: 'A', vertices: makeShape(rng, kind), rotationDeg }],
  });
  return geoItem('geo-count-right-angles', tier, ref('countRight'), [step], s, null);
};
