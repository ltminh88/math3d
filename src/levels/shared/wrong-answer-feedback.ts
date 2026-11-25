// R42: one shared call site for the R35 wrong-answer explanations in the levels.
// A level calls this in its 'wrong' branch with the same inputs the lesson dialog
// passes (daily-skill-item.ts): the selector returns a sentence when the mistake is
// recognised, null when it is not — so the caller keeps its generic sentence. The
// selector never states the answer; the hint ladder is untouched.
import { explainWrongAnswer, type WrongAnswerInput } from '../../practice/wrong-answer-explanation';
import { twa } from '../../practice/wrong-answer-strings';

/** The wrong-answer sentence for this try, or null to keep the generic sentence. */
export function wrongAnswerFeedback(input: WrongAnswerInput): string | null {
  const explanation = explainWrongAnswer(input);
  return explanation ? twa(explanation.key, explanation.params) : null;
}
