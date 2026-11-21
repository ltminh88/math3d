// Chance generators (phase 15): a bag of marbles and a die. The verdict (chắc chắn /
// có thể / không thể) is built into the construction — the test re-derives it by
// enumerating every possible draw/face from the scene, independently.
import { pick, type Rng, randInt, shuffle } from '../learning/seeded-rng';
import type { Candidate } from '../reasoning/reasoning-distractors';
import { ref } from '../reasoning/reasoning-distractors';
import type { PromptRef } from '../reasoning/reasoning-types';
import {
  bagScene,
  type ChanceVerdict,
  chanceLabel,
  colourParam,
  dataSceneItem,
  diceScene,
  labelChoiceStep,
} from './data-distractors';
import { COLOURS, type Colour } from './data-ranges';
import type { DataGenerator } from './data-scene-types';

/** The two wrong chance answers for a correct verdict, each with its own tag. */
function chanceDistractors(verdict: ChanceVerdict): Candidate<PromptRef>[] {
  const tag = (v: ChanceVerdict): string => {
    if (verdict === 'certain')
      return v === 'possible' ? 'possible-when-certain' : 'impossible-when-certain';
    if (verdict === 'possible')
      return v === 'certain' ? 'certain-when-possible' : 'impossible-when-possible';
    return v === 'certain' ? 'certain-when-impossible' : 'possible-when-impossible';
  };
  return (['certain', 'possible', 'impossible'] as const)
    .filter((v) => v !== verdict)
    .map((v) => ({
      value: chanceLabel(v),
      misconception: tag(v) as Candidate<PromptRef>['misconception'],
    }));
}

function chanceStep(rng: Rng, prompt: PromptRef, verdict: ChanceVerdict) {
  return labelChoiceStep(rng, prompt, chanceLabel(verdict), chanceDistractors(verdict));
}

/** One colour, drawn once (T1): certain when the bag is all that colour. */
export const chanceBag: DataGenerator = (rng, tier) => {
  if (tier === 1) {
    const colour = pick(rng, COLOURS);
    const branch = randInt(rng, 1, 3);
    let items: { colour: Colour; count: number }[];
    let verdict: ChanceVerdict;
    if (branch === 1) {
      items = [{ colour, count: randInt(rng, 6, 10) }];
      verdict = 'certain';
    } else if (branch === 2) {
      const other = pick(
        rng,
        COLOURS.filter((c) => c !== colour),
      );
      items = shuffle(rng, [
        { colour, count: randInt(rng, 4, 8) },
        { colour: other, count: randInt(rng, 1, 3) },
      ]);
      verdict = 'possible';
    } else {
      const present = pick(
        rng,
        COLOURS.filter((c) => c !== colour),
      );
      const other = pick(
        rng,
        COLOURS.filter((c) => c !== colour && c !== present),
      );
      items = shuffle(rng, [
        { colour: present, count: randInt(rng, 4, 8) },
        { colour: other, count: randInt(rng, 1, 3) },
      ]);
      verdict = 'impossible';
    }
    const count = items.find((b) => b.colour === colour)?.count ?? 0;
    const step = chanceStep(rng, ref('bagEventOne', { colour: colourParam(colour) }), verdict);
    return dataSceneItem('chance-bag', tier, ref('bagStory'), [step], bagScene(items, 1), [count]);
  }
  if (tier === 2) {
    const colour = pick(rng, COLOURS);
    const branch = randInt(rng, 1, 3);
    let items: { colour: Colour; count: number }[];
    let verdict: ChanceVerdict;
    if (branch === 1) {
      items = [{ colour, count: randInt(rng, 6, 10) }];
      verdict = 'certain';
    } else if (branch === 2) {
      const other = pick(
        rng,
        COLOURS.filter((c) => c !== colour),
      );
      items = shuffle(rng, [
        { colour, count: randInt(rng, 2, 8) },
        { colour: other, count: randInt(rng, 1, 3) },
      ]);
      verdict = 'possible';
    } else {
      const present = pick(
        rng,
        COLOURS.filter((c) => c !== colour),
      );
      const other = pick(
        rng,
        COLOURS.filter((c) => c !== colour && c !== present),
      );
      items = shuffle(rng, [
        { colour: present, count: randInt(rng, 4, 8) },
        { colour: other, count: 1 },
      ]);
      verdict = 'impossible';
    }
    const count = items.find((b) => b.colour === colour)?.count ?? 0;
    const step = chanceStep(rng, ref('bagEventTwo', { colour: colourParam(colour) }), verdict);
    return dataSceneItem('chance-bag', tier, ref('bagStory'), [step], bagScene(items, 2), [count]);
  }
  // T3: draw 2, one of each of two colours — certain only when the bag holds exactly
  // those two marbles; possible when both colours are in the bag; impossible when one
  // colour is missing.
  const [colour1, colour2] = shuffle(rng, [...COLOURS]).slice(0, 2) as [Colour, Colour];
  const branch = randInt(rng, 1, 4);
  let items: { colour: Colour; count: number }[];
  let verdict: ChanceVerdict;
  if (branch === 1) {
    items = [
      { colour: colour1, count: 1 },
      { colour: colour2, count: 1 },
    ];
    verdict = 'certain';
  } else if (branch <= 3) {
    const third = pick(
      rng,
      COLOURS.filter((c) => c !== colour1 && c !== colour2),
    );
    items = shuffle(rng, [
      { colour: colour1, count: randInt(rng, 2, 6) },
      { colour: colour2, count: randInt(rng, 2, 6) },
      { colour: third, count: randInt(rng, 1, 3) },
    ]);
    verdict = 'possible';
  } else {
    const third = pick(
      rng,
      COLOURS.filter((c) => c !== colour1 && c !== colour2),
    );
    items = shuffle(rng, [
      { colour: colour1, count: randInt(rng, 2, 6) },
      { colour: third, count: randInt(rng, 2, 6) },
    ]);
    verdict = 'impossible';
  }
  const count1 = items.find((b) => b.colour === colour1)?.count ?? 0;
  const count2 = items.find((b) => b.colour === colour2)?.count ?? 0;
  const step = chanceStep(
    rng,
    ref('bagEventMixed', { colour1: colourParam(colour1), colour2: colourParam(colour2) }),
    verdict,
  );
  return dataSceneItem('chance-bag', tier, ref('bagStory'), [step], bagScene(items, 2), [
    count1,
    count2,
  ]);
};

/** A die: one face (T1), two views (T2), covered faces (T3) — a covered face can still come up. */
export const chanceDice: DataGenerator = (rng, tier) => {
  const up = randInt(rng, 1, 6);
  if (tier === 1) {
    const face = rng() < 0.5 ? randInt(rng, 1, 6) : pick(rng, [0, 7]);
    const verdict: ChanceVerdict = face >= 1 && face <= 6 ? 'possible' : 'impossible';
    const step = chanceStep(rng, ref('diceEventFace', { face }), verdict);
    return dataSceneItem('chance-dice', tier, ref('diceStory'), [step], diceScene(up), [
      verdict === 'possible' ? 1 : 0,
    ]);
  }
  const other = pick(
    rng,
    [1, 2, 3, 4, 5, 6].filter((f) => f !== up),
  );
  if (tier === 2) {
    const branch = randInt(rng, 1, 3);
    let prompt: PromptRef;
    let verdict: ChanceVerdict;
    let satisfying: number;
    if (branch === 1) {
      prompt = ref('diceEventAll');
      verdict = 'certain';
      satisfying = 6;
    } else {
      const face = branch === 2 ? randInt(rng, 1, 6) : pick(rng, [0, 7]);
      prompt = ref('diceEventFace', { face });
      verdict = face >= 1 && face <= 6 ? 'possible' : 'impossible';
      satisfying = verdict === 'possible' ? 1 : 0;
    }
    const step = chanceStep(rng, prompt, verdict);
    return dataSceneItem('chance-dice', tier, ref('diceStory'), [step], diceScene(up, other), [
      satisfying,
    ]);
  }
  // T3: two faces are covered over — asking about one of them is still "possible".
  const hidden = shuffle(
    rng,
    [1, 2, 3, 4, 5, 6].filter((f) => f !== up && f !== other),
  ).slice(0, 2);
  const branch = randInt(rng, 1, 4);
  let prompt: PromptRef;
  let verdict: ChanceVerdict;
  let satisfying: number;
  if (branch === 1) {
    prompt = ref('diceEventAll');
    verdict = 'certain';
    satisfying = 6;
  } else if (branch <= 3) {
    const face = hidden[randInt(rng, 0, 1)] as number;
    prompt = ref('diceEventFace', { face });
    verdict = 'possible';
    satisfying = 1;
  } else {
    const face = pick(rng, [0, 7]);
    prompt = ref('diceEventFace', { face });
    verdict = 'impossible';
    satisfying = 0;
  }
  const step = chanceStep(rng, prompt, verdict);
  return dataSceneItem(
    'chance-dice',
    tier,
    ref('diceStory'),
    [step],
    diceScene(up, other, hidden),
    [satisfying],
  );
};

export const chanceGenerators: Readonly<Record<string, DataGenerator>> = Object.freeze({
  'chance-bag': chanceBag,
  'chance-dice': chanceDice,
});
