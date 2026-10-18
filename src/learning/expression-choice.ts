import type { FactKey } from './fact-key';
import type { ExpressionChoiceQuestion } from './question-types';
import { type Rng, shuffle } from './seeded-rng';

export function expressionChoice(
  factKey: FactKey,
  groupSize: number,
  groupCount: number,
  rng: Rng,
): ExpressionChoiceQuestion {
  const product = groupSize * groupCount;
  const correct = `${groupSize} x ${groupCount}`;
  // Swapped order is valid maths, so it is excluded: only expressions with a different value qualify.
  const options: Array<[string, number]> = [
    [`${groupSize} + ${groupCount}`, groupSize + groupCount],
    [`${groupSize} x ${groupCount + 1}`, groupSize * (groupCount + 1)],
    [`${groupSize + 1} x ${groupCount}`, (groupSize + 1) * groupCount],
    [`${groupSize} x ${groupCount - 1}`, groupSize * (groupCount - 1)],
    [`${groupSize - 1} x ${groupCount}`, (groupSize - 1) * groupCount],
  ];
  // Dedupe by value too: for squares "n x (n+1)" and "(n+1) x n" are the same commutative pair.
  const seen = new Set<number>([product]);
  const wrong: string[] = [];
  for (const [expr, value] of shuffle(rng, options)) {
    if (value <= 0 || seen.has(value)) continue;
    seen.add(value);
    wrong.push(expr);
    if (wrong.length === 2) break;
  }
  const expressions = shuffle(rng, [correct, ...wrong]);
  return {
    type: 'expression-choice',
    factKey,
    representation: 'concrete',
    answer: product,
    groupSize,
    groupCount,
    expressions,
    answerIndex: expressions.indexOf(correct),
  };
}
