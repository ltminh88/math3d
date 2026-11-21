// KNTT T1 B14 (một phần mấy), fraction of a set: N divisible by n, N ≤ 45 (phase 12).
// fraction-of-set-circle shows the set as a picture (scene); fraction-of-set-number and
// fraction-wp are pure numbers (scene-free), so B14 is playable before phase 16.
import { pick, type Rng } from '../learning/seeded-rng';
import { numberChoiceStep, numberStep, ref } from '../reasoning/reasoning-distractors';
import type { ReasoningStep } from '../reasoning/reasoning-types';
import { fractionItem, fractionSceneItem, setScene } from './fraction-distractors';
import { DENOMINATORS, SET_MAX } from './fraction-ranges';
import type { FractionGenerator } from './fraction-scene-types';

const NOUNS = ['i:marble', 'i:candy', 'i:apple', 'i:flower'] as const;

/** A set size N divisible by n, at least 2n (so one part is at least 2), at most `max`. */
const setSize = (rng: Rng, n: number, max: number): number => {
  const multiples: number[] = [];
  for (let k = 2; k * n <= max; k++) multiples.push(k * n);
  return pick(rng, multiples);
};

/** The two named traps for "1/n of N": answering N, or answering n. */
const divideCandidates = (total: number, n: number) => [
  { value: total, misconception: 'forget-divide' as const },
  { value: n, misconception: 'wrong-denominator' as const },
];

export const fractionOfSetCircle: FractionGenerator = (rng, tier) => {
  const n = tier === 1 ? 2 : tier === 2 ? pick(rng, [3, 4, 5]) : pick(rng, DENOMINATORS);
  const max = tier === 1 ? 8 : tier === 2 ? 30 : SET_MAX;
  const total = setSize(rng, n, max);
  const part = total / n;
  const item = pick(rng, NOUNS);
  const cols = total <= 12 ? 4 : 6;
  const marked = Array.from({ length: part }, (_, k) => k);
  const sceneData = setScene(total, marked, cols);
  const story = ref('setCircleStory', { item, count: total, n });
  if (tier === 3) {
    const steps: ReasoningStep[] = [
      numberStep(ref('askMarked', { item }), part),
      numberStep(ref('askLeft', { item }), total - part),
    ];
    return fractionSceneItem('fraction-of-set-circle', tier, story, steps, sceneData, [
      part,
      total - part,
    ]);
  }
  if (tier === 2) {
    const step = numberChoiceStep(
      rng,
      ref('askMarked', { item }),
      part,
      divideCandidates(total, n),
    );
    return fractionSceneItem('fraction-of-set-circle', tier, story, [step], sceneData);
  }
  return fractionSceneItem(
    'fraction-of-set-circle',
    tier,
    story,
    [numberStep(ref('askMarked', { item }), part)],
    sceneData,
  );
};

export const fractionOfSetNumber: FractionGenerator = (rng, tier) => {
  const n =
    tier === 1
      ? pick(rng, [2, 3])
      : tier === 2
        ? pick(rng, [2, 3, 4, 5, 6])
        : pick(rng, DENOMINATORS);
  const max = tier === 1 ? 12 : tier === 2 ? 30 : SET_MAX;
  const total = setSize(rng, n, max);
  const part = total / n;
  const item = pick(rng, NOUNS);
  const story = ref('setNumberStory', { item, count: total, n });
  if (tier === 3) {
    // Second step: k parts altogether (k < n; for n = 2 the two parts are the whole set).
    const ks: number[] = [];
    for (let k = 2; k < n; k++) ks.push(k);
    const k = ks.length > 0 ? pick(rng, ks) : 2;
    const steps: ReasoningStep[] = [
      numberStep(ref('askOnePart', { item }), part),
      numberStep(ref('askKParts', { k, item }), k * part),
    ];
    return fractionItem('fraction-of-set-number', tier, story, steps, [part, k * part]);
  }
  if (tier === 2) {
    const step = numberChoiceStep(
      rng,
      ref('askOnePart', { item }),
      part,
      divideCandidates(total, n),
    );
    return fractionItem('fraction-of-set-number', tier, story, [step]);
  }
  return fractionItem('fraction-of-set-number', tier, story, [
    numberStep(ref('askOnePart', { item }), part),
  ]);
};

type WpContext = 'share' | 'eat' | 'class' | 'read';
const WP_STORIES: Record<WpContext, { story: string; ask: string }> = {
  share: { story: 'wpShare', ask: 'askWpGive' },
  eat: { story: 'wpEat', ask: 'askWpEat' },
  class: { story: 'wpClass', ask: 'askWpClass' },
  read: { story: 'wpRead', ask: 'askWpRead' },
};

export const fractionWp: FractionGenerator = (rng, tier) => {
  const n =
    tier === 1
      ? pick(rng, [2, 3, 4])
      : tier === 2
        ? pick(rng, [2, 3, 4, 5, 6])
        : pick(rng, DENOMINATORS);
  const max = tier === 1 ? 24 : tier === 2 ? 36 : SET_MAX;
  const total = setSize(rng, n, max);
  const part = total / n;
  // Tier 3 asks a second step ("how many are left?"), which only the share/eat stories can
  // phrase with the same noun.
  const ctx =
    tier === 3
      ? pick(rng, ['share', 'eat'] as const)
      : pick(rng, ['share', 'eat', 'class', 'read'] as const);
  const { story, ask } = WP_STORIES[ctx];
  const item = pick(rng, NOUNS);
  const withNoun = ctx === 'share' || ctx === 'eat';
  const storyRef = ref(story, withNoun ? { item, count: total, n } : { count: total, n });
  const askRef = ref(ask, withNoun ? { item } : undefined);
  if (tier === 3) {
    const steps: ReasoningStep[] = [
      numberStep(askRef, part),
      numberStep(ref('askWpLeft', { item }), total - part),
    ];
    return fractionItem('fraction-wp', tier, storyRef, steps, [part, total - part]);
  }
  if (tier === 2) {
    const step = numberChoiceStep(rng, askRef, part, divideCandidates(total, n));
    return fractionItem('fraction-wp', tier, storyRef, [step]);
  }
  return fractionItem('fraction-wp', tier, storyRef, [numberStep(askRef, part)]);
};
