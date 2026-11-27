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
    // Unknown part: {name} has {a}, ends with {total} — find the part.
    const [total, a] = pickLadderPair(rng, '−', ladder);
    const unknown = total - a;
    return arithmeticItem(
      'add-sub-bar-model-wp',
      tier,
      ref('barModelPart', { name, item, a, total }),
      [
        barOptions(rng, [
          { label: ref('barWhole', { n: total }), correct: false },
          { label: ref('barKnown', { n: a }), correct: false },
          { label: ref('barUnknown'), correct: true },
        ]),
        expressionChoiceStep(rng, ref('askBarOp'), '−', [
          { value: '+', misconception: 'wrong-inverse' },
        ]),
        numberStep(ref('askUnknownPart'), unknown),
      ],
    );
  }
  // Unknown total: {name} has {a}, buys {b} more — find the total.
  const [a, b] = pickLadderPair(rng, '+', ladder);
  return arithmeticItem('add-sub-bar-model-wp', tier, ref('barModelTotal', { name, item, a, b }), [
    barOptions(rng, [
      { label: ref('barKnown', { n: a }), correct: false },
      { label: ref('barKnown', { n: b }), correct: false },
      { label: ref('barWhole', { n: '?' }), correct: true },
    ]),
    expressionChoiceStep(rng, ref('askBarOp'), '+', [
      { value: '−', misconception: 'wrong-inverse' },
    ]),
    numberStep(ref('askTotal', { name, item }), a + b),
  ]);
};
