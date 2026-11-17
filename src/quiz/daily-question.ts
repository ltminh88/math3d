// Daily-practice questions (phase 11, pure): one 3-choice question per learned × / : fact.
// Multiplication reuses the quiz dialog's builder; division mirrors it (a = dividend,
// b = divisor, answer = quotient, distractors from the same classes). Skill keys use the
// step kit, not this module.

import { placeAnswer } from '../learning/distractor-picker';
import { type FactKey, parseFactKey } from '../learning/fact-key';
import type { FactStat } from '../learning/learning-types';
import type { Rng } from '../learning/seeded-rng';
import { buildQuizQuestion, pickThreeChoiceDistractors } from './learning-quiz-adapter';
import type { Question } from './question-types';

/** A 3-choice question for a learned × / : fact. Throws for skill keys. */
export function buildDailyQuestion(key: FactKey, stat: FactStat | undefined, rng: Rng): Question {
  const parsed = parseFactKey(key);
  if (!parsed) throw new Error(`daily: not an arithmetic fact "${key}"`);
  if (parsed.op === 'mul') return buildQuizQuestion(key, { mode: 'practice', table: 0, stat }, rng);
  const { dividend, divisor } = parsed;
  const quotient = dividend / divisor;
  const distractors = pickThreeChoiceDistractors(
    {
      factKey: key,
      a: divisor,
      b: quotient,
      answer: quotient,
      dividend,
      errorBank: stat?.errs ?? [],
    },
    rng,
  );
  const { choices } = placeAnswer(quotient, distractors, rng);
  return {
    id: `d${dividend}_${divisor}`,
    factKey: key,
    a: dividend,
    b: divisor,
    answer: quotient,
    options: choices.map((value) => ({ value, label: String(value) })),
    review: (stat?.attempts ?? 0) > 0 && stat?.box === 1,
  };
}
