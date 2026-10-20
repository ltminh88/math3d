// Quiz question shapes shared by the generator, stats and hint text.

export type Rng = () => number;

/** 'bridge' renders options as expressions (`7 × 8`); any other mode renders products. */
export type QuizMode = 'bridge' | 'practice' | (string & {});

export interface AnswerOption {
  value: number;
  label: string;
}

export interface Question {
  /** Directed id `m{a}_{b}` (the original stats key). */
  id: string;
  /** Pooled learning fact key, e.g. `mul:3x7`. */
  factKey: string;
  a: number;
  b: number;
  answer: number;
  options: AnswerOption[];
  /** The fact was answered before and sits in Leitner box 1 (shown as a review). */
  review: boolean;
}
