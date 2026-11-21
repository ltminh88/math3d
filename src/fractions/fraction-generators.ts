// KNTT T1 B14 (một phần mấy): unit fractions 1/2..1/9 only (Q7). fraction-read is scene-free
// (it renders in the shared dialog today); fraction-shaded and fraction-pick-picture carry a
// scene the phase-16 renderer draws.
import { pick, type Rng, shuffle } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { ref } from '../reasoning/reasoning-distractors';
import type { Misconception, ReasoningStep } from '../reasoning/reasoning-types';
import {
  fracLabel,
  fractionChoiceStep,
  fractionItem,
  fractionSceneItem,
  LETTERS,
  labelChoiceStep,
  letterOptions,
  pickScene,
  shapeScene,
  wordChoiceStep,
  wordLabel,
} from './fraction-distractors';
import { DENOMINATORS, DENOMINATORS_T1, GRID_COLS, GRID_DENOMINATORS } from './fraction-ranges';
import type { FractionGenerator, FractionShapeBody } from './fraction-scene-types';

/** Denominators other than `n`, shuffled, for distractors. */
const otherDenoms = (rng: Rng, n: number, count: number): number[] =>
  shuffle(
    rng,
    DENOMINATORS.filter((d) => d !== n),
  ).slice(0, count);

const wrongDenomCandidates = (rng: Rng, n: number, count: number) =>
  otherDenoms(rng, n, count).map((d) => ({
    value: [1, d] as readonly [number, number],
    misconception: 'wrong-denominator' as const,
  }));

/** Word -> symbol ("một phần ba" -> 1/3), the T1 direction. */
const wordToSymbol = (rng: Rng, n: number): ReasoningStep =>
  fractionChoiceStep(rng, wordLabel(n), n, [
    { value: [n, 1] as const, misconception: 'not-unit' },
    ...wrongDenomCandidates(rng, n, 2),
  ]);

/** Symbol -> word (1/5 -> "một phần năm"), the T2 direction. */
const symbolToWord = (rng: Rng, n: number): ReasoningStep =>
  wordChoiceStep(
    rng,
    fracLabel(1, n),
    n,
    otherDenoms(rng, n, 3).map((d) => ({ value: d, misconception: 'wrong-denominator' as const })),
  );

export const fractionRead: FractionGenerator = (rng, tier) => {
  const denoms = tier === 1 ? DENOMINATORS_T1 : DENOMINATORS;
  if (tier === 3) {
    const [n1, n2] = shuffle(rng, [...denoms]).slice(0, 2) as [number, number];
    return fractionItem('fraction-read', tier, ref('readBothStory'), [
      wordToSymbol(rng, n1),
      symbolToWord(rng, n2),
    ]);
  }
  const n = pick(rng, denoms);
  return tier === 1
    ? fractionItem('fraction-read', tier, ref('readWordStory'), [wordToSymbol(rng, n)])
    : fractionItem('fraction-read', tier, ref('readSymbolStory'), [symbolToWord(rng, n)]);
};

/** A shape with `n` parts, one shaded; `equal` false means the parts have unequal sizes. */
const shadedBody = (
  n: number,
  shape: 'circle' | 'bar' | 'grid',
  equal: boolean,
): FractionShapeBody => {
  const body: FractionShapeBody =
    shape === 'grid'
      ? { shape, parts: n, shaded: [0], equal, cols: GRID_COLS[n] }
      : { shape, parts: n, shaded: [0], equal };
  if (!equal) {
    // One part twice as big as the rest (bar columns / circle sectors).
    const sizes = Array.from({ length: n }, () => 1);
    sizes[0] = 2;
    return { ...body, sizes };
  }
  return body;
};

/** Grid denominators a tier may show (T2 starts at 1/5, so no 1/4 grid). */
const gridDenoms = (tier: SkillTier): readonly number[] =>
  tier === 2 ? [6, 8, 9] : GRID_DENOMINATORS;

export const fractionShaded: FractionGenerator = (rng, tier) => {
  if (tier === 3 && rng() < 0.5) {
    // The unequal-parts trap: one part shaded, but the parts are not equal, so no 1/n
    // can be read off the picture.
    const n = pick(rng, [2, 3, 4, 5, 6]);
    const step = labelChoiceStep(rng, ref('askShaded'), ref('noEqualParts'), [
      { value: fracLabel(1, n), misconception: 'unequal-parts' },
      ...otherDenoms(rng, n, 2).map((d) => ({
        value: fracLabel(1, d),
        misconception: 'wrong-denominator' as const,
      })),
    ]);
    return fractionSceneItem(
      'fraction-shaded',
      tier,
      ref('shadedStory'),
      [step],
      shapeScene(shadedBody(n, pick(rng, ['circle', 'bar'] as const), false)),
    );
  }
  const shape = pick(
    rng,
    tier === 1 ? (['circle', 'bar'] as const) : (['circle', 'bar', 'grid'] as const),
  );
  const n =
    shape === 'grid'
      ? pick(rng, gridDenoms(tier))
      : pick(rng, tier === 1 ? DENOMINATORS_T1 : tier === 2 ? [5, 6, 7, 8, 9] : DENOMINATORS);
  const step = fractionChoiceStep(rng, ref('askShaded'), n, [
    { value: [n, 1] as const, misconception: 'not-unit' },
    ...wrongDenomCandidates(rng, n, 2),
  ]);
  return fractionSceneItem(
    'fraction-shaded',
    tier,
    ref('shadedStory'),
    [step],
    shapeScene(shadedBody(n, shape, true)),
  );
};

type Figure = FractionShapeBody & { correct: boolean; misconception?: Misconception };

/** A shape for `parts` parts: grids only for equal parts that factor into rows × cols. */
const shapeForParts = (rng: Rng, parts: number, equal: boolean): 'circle' | 'bar' | 'grid' => {
  const shapes: readonly ('circle' | 'bar' | 'grid')[] =
    equal && (GRID_DENOMINATORS as readonly number[]).includes(parts)
      ? ['circle', 'bar', 'grid']
      : ['circle', 'bar'];
  return pick(rng, shapes);
};

/** A figure body for `parts` parts, one shaded unless told otherwise. */
const bodyFor = (
  rng: Rng,
  parts: number,
  equal: boolean,
  shaded: readonly number[],
): FractionShapeBody => {
  const shape = shapeForParts(rng, parts, equal);
  const body: FractionShapeBody = { shape, parts, shaded, equal };
  if (shape === 'grid') return { ...body, cols: GRID_COLS[parts] };
  if (!equal) {
    const sizes = Array.from({ length: parts }, () => 1);
    sizes[0] = 2;
    return { ...body, sizes };
  }
  return body;
};

export const fractionPickPicture: FractionGenerator = (rng, tier) => {
  const n = pick(rng, tier === 1 ? DENOMINATORS_T1 : DENOMINATORS);
  const m = otherDenoms(rng, n, 1)[0] ?? 2;
  // The correct figure: n equal parts, one shaded. Distractors: unequal parts (the core
  // trap), a wrong denominator, and two shaded parts (2/n is not 1/n).
  const figures: Figure[] = [
    { ...bodyFor(rng, n, true, [0]), correct: true },
    { ...bodyFor(rng, n, false, [0]), correct: false, misconception: 'unequal-parts' },
    { ...bodyFor(rng, m, true, [0]), correct: false, misconception: 'wrong-denominator' },
  ];
  if (tier > 1)
    figures.push({
      ...bodyFor(rng, n, true, [0, 1]),
      correct: false,
      misconception: 'not-unit',
    });
  const labelled = shuffle(rng, figures).map((f, i) => ({ ...f, label: LETTERS[i] as string }));
  const step: ReasoningStep = {
    kind: 'choice',
    prompt: wordLabel(n),
    options: letterOptions(labelled),
  };
  return fractionSceneItem(
    'fraction-pick-picture',
    tier,
    ref('pickStory'),
    [step],
    pickScene(labelled),
  );
};
