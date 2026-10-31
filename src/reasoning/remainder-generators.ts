// Division with remainder in context (KNTT T1 B25: số dư bé hơn số chia). Every item has a
// remainder > 0 and total <= 100.
import { pick, type Rng, randInt } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import {
  numberChoiceStep,
  numberStep,
  optionsFrom,
  pickNoun,
  reasoningItem,
  ref,
} from './reasoning-distractors';
import { MAX_NUMBER, REMAINDER_DIVISORS } from './reasoning-ranges';
import type { PromptRef, ReasoningGenerator, ReasoningStep } from './reasoning-types';

interface Split {
  total: number;
  per: number;
  q: number;
  r: number;
}

function split(rng: Rng, tier: SkillTier): Split {
  const per = pick(rng, REMAINDER_DIVISORS[tier]);
  const maxTotal = tier === 1 ? 30 : MAX_NUMBER;
  const r = randInt(rng, 1, per - 1);
  const q = randInt(
    rng,
    tier === 3 ? 3 : 1,
    Math.max(tier === 3 ? 3 : 1, Math.floor((maxTotal - r) / per)),
  );
  return { total: q * per + r, per, q, r };
}

const qrLabel = ({ q, r }: { q: number; r: number }): PromptRef => ({
  key: 'qr',
  params: { q, r },
});

/** "Xếp được nhiều nhất mấy hộp, còn thừa mấy cái?": q and r. */
export const divRemFloor: ReasoningGenerator = (rng, tier) => {
  const s = split(rng, tier);
  const story = ref('divRemFloor', { total: s.total, per: s.per, item: pickNoun(rng) });
  const askQ = numberStep(ref('askBoxes'), s.q);
  const askR = numberStep(ref('askLeft'), s.r);
  let steps: ReasoningStep[];
  if (tier === 2) {
    const candidates = [
      { value: { q: s.q - 1, r: s.r + s.per }, misconception: 'remainder-too-big' as const },
      { value: { q: s.q + 1, r: s.r }, misconception: 'near-miss' as const },
      { value: { q: s.q, r: s.per - s.r }, misconception: 'wrong-step' as const },
      { value: { q: s.r, r: s.q }, misconception: 'near-miss' as const },
    ].filter((c) => c.value.q >= 0 && c.value.r <= MAX_NUMBER);
    const options = optionsFrom(rng, { q: s.q, r: s.r }, candidates, qrLabel);
    steps = [{ kind: 'choice', prompt: ref('pickBoxesLeft'), options }];
  } else {
    // Tier 3 adds the check "số dư phải bé hơn số chia" as a prompt on the remainder step.
    steps = [askQ, tier === 3 ? numberStep(ref('askLeftCheck', { per: s.per }), s.r) : askR];
  }
  return reasoningItem('div-rem-floor', tier, story, steps, [s.q * s.per, s.r]);
};

/** "Cần ít nhất mấy xe?": the remainder needs one more (the trap is rounding down). */
export const divRemCeil: ReasoningGenerator = (rng, tier) => {
  const s = split(rng, tier);
  const story = ref('divRemCeil', { total: s.total, per: s.per });
  const need = ref('askNeed');
  const steps: ReasoningStep[] =
    tier === 1
      ? [numberStep(ref('askFull'), s.q), numberStep(need, s.q + 1)]
      : tier === 2
        ? [numberStep(need, s.q + 1)]
        : [
            numberChoiceStep(rng, need, s.q + 1, [
              { value: s.q, misconception: 'round-down-trap' },
              { value: s.r, misconception: 'one-step-only' },
              { value: s.q + 2, misconception: 'near-miss' },
            ]),
          ];
  return reasoningItem('div-rem-ceil', tier, story, steps, [s.q, s.q + 1]);
};
