// Bar-model word problems (boost, Phase 1A): three steps — choose the unknown bar,
// choose + or −, then the number pad. Two shapes: unknown part (a + ? = total,
// so the operation is −) and unknown total (a + b = ?, so the operation is +).
// Numbers stay under 1 000, so the story uses personal items (le's rule).
import { type Rng, shuffle } from '../learning/seeded-rng';
import { expressionChoiceStep, pickName, pickNoun } from '../reasoning/reasoning-distractors';
import type {
  ChoiceOption,
  PromptRef,
  ReasoningGenerator,
  ReasoningStep,
} from '../reasoning/reasoning-types';
import { ladderOfSkillTier, pickLadderPair } from './add-sub-pair-pickers';
import { arithmeticItem, numberStep, ref } from './arithmetic-distractors';

const barOptions = (
  rng: Rng,
  bars: readonly { label: PromptRef; correct: boolean }[],
): ReasoningStep => {
  const options: ChoiceOption[] = shuffle(
    rng,
    bars.map((b, i) => ({ id: `o${i}`, label: b.label, correct: b.correct })),
  );
  return { kind: 'choice', prompt: ref('askUnknownBar'), options };
};

export const barModelWp: ReasoningGenerator = (rng, tier) => {
  const ladder = ladderOfSkillTier(rng, tier);
  const name = pickName(rng);
  const item = pickNoun(rng);
  if (rng() < 0.5) {
    // Unknown part: {name} has {a}, ends with {total} — find the part. The
    // unknown part must be positive: total === a would mean buying 0 (R103.3).
    let total = 0;
    let a = 0;
    for (let t = 0; t < 20; t++) {
      [total, a] = pickLadderPair(rng, '−', ladder);
      if (total > a) break;
    }
    if (total <= a) {
      // Fallback (R108): the loop can exhaust with total === a, which would
      // make the unknown part 0. Force a positive unknown, staying ≤ 1 000.
      a = Math.min(a, 999);
      total = a + 1;
    }
    const unknown = total - a;
    return arithmeticItem(
      'add-sub-bar-model-wp',
      tier,
      ref('barModelPart', { name, item, a, total }),
      [
        barOptions(rng, [
          { label: ref('barPartHave', { name }), correct: false },
          { label: ref('barPartAdded'), correct: true },
          { label: ref('barBoth'), correct: false },
        ]),
        expressionChoiceStep(rng, ref('askBarOpPart'), '−', [
          { value: '+', misconception: 'wrong-inverse' },
        ]),
        numberStep(ref('askUnknownPart'), unknown),
      ],
    );
  }
  // Unknown total: {name} has {a}, buys {b} more — find the total. The two
  // parts must differ (R103.3): with a === b the two known bars would be
  // indistinguishable.
  let a = 0;
  let b = 0;
  for (let t = 0; t < 20; t++) {
    [a, b] = pickLadderPair(rng, '+', ladder);
    if (a !== b) break;
  }
  if (a === b) {
    // Fallback (R108): the loop can exhaust with a === b, which would make
    // the two known bars indistinguishable. Force the parts apart, staying
    // inside the 1 000 range.
    b = a + 1;
    if (a + b > 1000) b = a - 1;
  }
  return arithmeticItem('add-sub-bar-model-wp', tier, ref('barModelTotal', { name, item, a, b }), [
    barOptions(rng, [
      { label: ref('barPartHave', { name }), correct: false },
      { label: ref('barPartAdded'), correct: false },
      { label: ref('barBoth'), correct: true },
    ]),
    expressionChoiceStep(rng, ref('askBarOpTotal'), '+', [
      { value: '−', misconception: 'wrong-inverse' },
    ]),
    numberStep(ref('askTotal', { name, item }), a + b),
  ]);
};
