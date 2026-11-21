// Money generators (word skills, phase 14): change back from a note, and shopping word
// problems. Scene-free: the story carries every amount as formatted text, so these two
// skills play in the dialog today. Change is a number-pad step (phase file).
import { pick, randInt, shuffle } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { Candidate } from '../reasoning/reasoning-distractors';
import { numberStep, pickName, pickNoun, ref } from '../reasoning/reasoning-distractors';
import { moneyChoiceStep, moneyItem } from './money-distractors';
import { DENOMINATIONS, smallestNoteAbove, TOTAL_MAX } from './money-ranges';
import type { MoneyGenerator } from './money-scene-types';
import { formatMoney } from './money-strings';

const PRICES: Record<SkillTier, readonly number[]> = {
  1: [1000, 2000, 5000, 10000],
  2: [1000, 2000, 5000],
  3: [2000, 5000, 10000],
};

export const moneyChangeBack: MoneyGenerator = (rng, tier) => {
  const name = pickName(rng);
  const item = pickNoun(rng);
  const count = tier === 1 ? 1 : randInt(rng, 2, tier === 2 ? 3 : 5);
  const price = pick(rng, PRICES[tier]);
  const total = count * price;
  const paid = smallestNoteAbove(total) as number;
  const story = ref('changeStory', {
    name,
    count,
    item,
    price: formatMoney(price),
    paid: formatMoney(paid),
  });
  if (tier === 1) {
    return moneyItem(
      'money-change-back',
      tier,
      story,
      [numberStep(ref('askChange'), paid - total)],
      [paid - total],
    );
  }
  return moneyItem(
    'money-change-back',
    tier,
    story,
    [numberStep(ref('askChangeTotal'), total), numberStep(ref('askChange'), paid - total)],
    [total, paid - total],
  );
};

const WP_NOUNS = ['i:notebook', 'i:pen', 'i:cake', 'i:book'] as const;

export const moneyWp: MoneyGenerator = (rng, tier) => {
  const name = pickName(rng);
  if (tier === 1) {
    const item = pick(rng, WP_NOUNS);
    const count = randInt(rng, 2, 4);
    const price = pick(rng, [1000, 2000, 5000] as const);
    const total = count * price;
    const candidates: Candidate<number>[] = [
      { value: count + price, misconception: 'add-instead-of-times' },
    ];
    const step = moneyChoiceStep(rng, ref('askWpTotal', { name }), total, candidates);
    return moneyItem(
      'money-wp',
      tier,
      ref('wpBuyStory', { name, count, item, price: formatMoney(price) }),
      [step],
      [total],
    );
  }
  if (tier === 2) {
    const shuffled = shuffle(rng, [...WP_NOUNS]);
    const item1 = shuffled[0] as (typeof WP_NOUNS)[number];
    const item2 = shuffled[1] as (typeof WP_NOUNS)[number];
    const count1 = randInt(rng, 2, 3);
    const count2 = randInt(rng, 2, 3);
    const price1 = pick(rng, [1000, 2000, 5000] as const);
    const price2 = pick(rng, [1000, 2000, 5000] as const);
    const total = count1 * price1 + count2 * price2;
    const candidates: Candidate<number>[] = [
      { value: count1 * price1, misconception: 'one-step-only' },
      { value: count2 * price2, misconception: 'one-step-only' },
    ];
    const step = moneyChoiceStep(rng, ref('askWpTotal', { name }), total, candidates);
    return moneyItem(
      'money-wp',
      tier,
      ref('wpTwoStory', {
        name,
        count1,
        item1,
        price1: formatMoney(price1),
        count2,
        item2,
        price2: formatMoney(price2),
      }),
      [step],
      [total],
    );
  }
  const item = pick(rng, WP_NOUNS);
  const count = randInt(rng, 2, 4);
  const price = pick(rng, [2000, 5000, 10000] as const);
  const total = count * price;
  const have = (DENOMINATIONS.find((d) => d > total && d <= TOTAL_MAX) ?? 100000) as number;
  return moneyItem(
    'money-wp',
    tier,
    ref('wpLeftStory', { name, have: formatMoney(have), count, item, price: formatMoney(price) }),
    [
      numberStep(ref('askWpTotal', { name }), total),
      numberStep(ref('askWpLeft', { name }), have - total),
    ],
    [total, have - total],
  );
};
