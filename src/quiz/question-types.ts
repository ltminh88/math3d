// Quiz question shapes shared by the generator, stats and hint text.

export type Rng = () => number;

/** 'bridge' renders options as expressions (`7 × 8`); any other mode renders products. */
export type QuizMode = 'bridge' | 'practice' | (string & {});

export interface AnswerOption {
  value: number;
  label: string;
}

/** Bridge word problems (phase 04): two-step stories built on the chosen table. */
export type WordProblemSkill = 'wp-times-then-add' | 'wp-times-compare';

export interface WordProblem {
  readonly skillId: WordProblemSkill;
  /** Story numbers: a (per team) and n (times), or big and small. */
  readonly params: Readonly<Record<string, number>>;
  /** Intermediate results of the solution (worked hint). */
  readonly work: readonly number[];
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
  /** Set for a reasoning word problem (`factKey` is its `sk:` key, options are numbers). */
  word?: WordProblem;
}
