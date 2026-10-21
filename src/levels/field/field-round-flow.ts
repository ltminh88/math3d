// Field round flow (pure): planned facts -> rounds of type (a) build the plot then give the total,
// (b) pick both equations that describe a planted plot, (c) recall the total (Leitner box 3+,
// equation shown in either order). Answers walk the shared hint ladder (3 attempts).
import { type FactKey, parseFactKey } from '../../learning/fact-key';
import {
  createHintState,
  type HintState,
  isOutOfAttempts,
  recordWrong,
  takeHint,
  toQuestionResult,
} from '../../learning/hint-ladder';
import { type Rng, shuffle } from '../../learning/seeded-rng';
import type { QuestionOutcome } from '../../learning/session-recorder';

export type FieldRoundType = 'build' | 'equations' | 'recall';

/** Facts from this box on are recalled instead of built (spec: "box 3+"). */
export const RECALL_BOX = 3;

export interface EquationOption {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly correct: boolean;
}

export interface FieldRound {
  readonly factKey: FactKey;
  readonly rows: number;
  readonly cols: number;
  readonly total: number;
  readonly type: FieldRoundType;
  /** Factor order the equation is shown in (recall rounds may swap it). */
  readonly shownOrder: readonly [number, number];
  /** Equations round only: 4 options, two of them correct. */
  readonly options: readonly EquationOption[];
}

export interface PlanRoundsInput {
  facts: readonly FactKey[];
  boxOf: (key: FactKey) => number;
  rng: Rng;
}

function equationOptions(rows: number, cols: number, rng: Rng): EquationOption[] {
  const options: EquationOption[] = [
    { id: 'rc', label: `${rows} × ${cols}`, value: rows * cols, correct: true },
    { id: 'cr', label: `${cols} × ${rows}`, value: rows * cols, correct: true },
    { id: 'sum', label: `${rows} + ${cols}`, value: rows + cols, correct: false },
    { id: 'more', label: `${rows} × ${cols + 1}`, value: rows * (cols + 1), correct: false },
  ];
  return shuffle(rng, options);
}

export function planFieldRounds({ facts, boxOf, rng }: PlanRoundsInput): FieldRound[] {
  return facts.map((factKey, index) => {
    const fact = parseFactKey(factKey);
    if (fact?.op !== 'mul') throw new Error(`Field rounds need multiplication facts: ${factKey}`);
    const { min: rows, max: cols } = fact;
    const square = rows === cols;
    const type: FieldRoundType =
      boxOf(factKey) >= RECALL_BOX ? 'recall' : index % 2 === 1 && !square ? 'equations' : 'build';
    const swap = type === 'recall' && rng() < 0.5;
    return {
      factKey,
      rows,
      cols,
      total: rows * cols,
      type,
      shownOrder: swap ? [cols, rows] : [rows, cols],
      options: type === 'equations' ? equationOptions(rows, cols, rng) : [],
    };
  });
}

export type Verdict = 'correct' | 'wrong' | 'revealed';

export interface RoundState {
  readonly round: FieldRound;
  readonly hint: HintState;
  readonly wrongAnswers: readonly number[];
  readonly solved: boolean;
}

export const startRound = (round: FieldRound): RoundState => ({
  round,
  hint: createHintState(),
  wrongAnswers: [],
  solved: false,
});

const finished = (state: RoundState): Verdict | null =>
  state.solved ? 'correct' : isOutOfAttempts(state.hint) ? 'revealed' : null;

function judge(state: RoundState, right: boolean, wrongValue: number) {
  const done = finished(state);
  if (done) return { state, verdict: done };
  if (right) return { state: { ...state, solved: true }, verdict: 'correct' as Verdict };
  const next: RoundState = {
    ...state,
    hint: recordWrong(state.hint),
    wrongAnswers: [...state.wrongAnswers, wrongValue],
  };
  return { state: next, verdict: (isOutOfAttempts(next.hint) ? 'revealed' : 'wrong') as Verdict };
}

/** Number answer (build and recall rounds). */
export const answerTotal = (state: RoundState, value: number) =>
  judge(state, value === state.round.total, value);

/** Equations round: right only when exactly the two correct options are picked. */
export function answerEquations(state: RoundState, ids: readonly string[]) {
  const picked = state.round.options.filter((o) => ids.includes(o.id));
  const right = picked.length === 2 && picked.every((o) => o.correct);
  const wrongPick = picked.find((o) => !o.correct);
  return judge(state, right, wrongPick?.value ?? picked[0]?.value ?? 0);
}

export const askHint = (state: RoundState): RoundState =>
  finished(state) ? state : { ...state, hint: takeHint(state.hint) };

export function roundOutcome(state: RoundState, ms: number): QuestionOutcome {
  const result = toQuestionResult(state.hint, state.solved);
  return {
    factKey: state.round.factKey,
    ms,
    correct: result.correct,
    firstTry: result.firstTry,
    usedHint: result.usedHint,
    wrongAnswers: [...state.wrongAnswers],
  };
}
