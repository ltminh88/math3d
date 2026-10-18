// Quiz question shapes shared by the generator, stats and hint text.

export type Rng = () => number;

/** 'bridge' renders options as expressions (`7 × 8`); any other mode renders products. */
export type QuizMode = 'bridge' | 'practice' | (string & {});

export interface AnswerOption {
  value: number;
  label: string;
}

export interface Question {
  /** Stats key `m{a}_{b}`. */
  id: string;
  a: number;
  b: number;
  answer: number;
  options: AnswerOption[];
  /** True when the fact was drawn from the review queue. */
  review: boolean;
}
