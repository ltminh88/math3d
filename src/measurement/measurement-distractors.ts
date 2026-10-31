// Measurement-only builders: item nouns, "which one?" options naming two objects, and splitting
// a mass into the balance's gram weights.
import { type Rng, shuffle } from '../learning/seeded-rng';
import { ref } from '../reasoning/reasoning-distractors';
import type { ChoiceOption, Misconception, PromptRef } from '../reasoning/reasoning-types';
import { WEIGHTS } from './measurement-ranges';

export const LONG_NOUNS = ['i:pencil', 'i:eraser', 'i:ribbon', 'i:leaf', 'i:crayon'] as const;
export const MASS_NOUNS = ['i:candyBag', 'i:sugarBag', 'i:orange', 'i:cake'] as const;

/** Two different nouns from `nouns`. */
export function twoNouns(rng: Rng, nouns: readonly string[]): [string, string] {
  const [x, y] = shuffle(rng, nouns) as [string, string];
  return [x, y];
}

export interface Pick {
  readonly label: PromptRef;
  readonly correct: boolean;
  readonly misconception?: Misconception;
}

/** Options "{x}", "{y}", "bằng nhau": ids follow the given order, then shuffled. */
export function pickOptions(rng: Rng, picks: readonly Pick[]): ChoiceOption[] {
  const options = picks.map(
    (p, i): ChoiceOption =>
      p.correct
        ? { id: `o${i}`, label: p.label, correct: true }
        : {
            id: `o${i}`,
            label: p.label,
            correct: false,
            misconception: p.misconception ?? 'near-miss',
          },
  );
  return shuffle(rng, options);
}

export const nounLabel = (item: string): PromptRef => ref('nounOpt', { item });

/** Fewest weights from 50, 20, 10, 5, 2, 1 g that make `grams` (largest first). */
export function weightsFor(grams: number): number[] {
  const out: number[] = [];
  let left = grams;
  for (const w of WEIGHTS)
    while (left >= w) {
      out.push(w);
      left -= w;
    }
  return out;
}
