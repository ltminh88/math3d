// City round flow (pure): planned facts of tables 6-9 -> rounds of type (a) deliver a parcel
// "7 × 8" to the house numbered 56, (b) light a building of floors x windows and give the total,
// (c) reverse delivery (Leitner box 3+): a house shows 56, pick the right parcel. Every answer is
// a number (house number, window total, parcel value) walked along the shared hint ladder.
import { pickDistractors, placeAnswer } from '../../learning/distractor-picker';
import { expressionChoice } from '../../learning/expression-choice';
import { type FactKey, parseFactKey } from '../../learning/fact-key';
import {
  createHintState,
  type HintRung,
  type HintState,
  recordWrong,
  shouldOfferHint,
  takeHint,
  toQuestionResult,
} from '../../learning/hint-ladder';
import type { Rng } from '../../learning/seeded-rng';
import type { QuestionOutcome } from '../../learning/session-recorder';

export type CityRoundKind = 'deliver' | 'windows' | 'reverse';

/** Facts from this Leitner box on are delivered backwards (spec: "box ≥3"). */
export const REVERSE_BOX = 3;
const CITY_TABLES: readonly number[] = [6, 7, 8, 9];

export interface ParcelOption {
  readonly label: string;
  readonly value: number;
  readonly correct: boolean;
}

export interface CityRound {
  readonly kind: CityRoundKind;
  readonly factKey: FactKey;
  /** The 6-9 factor: windows per floor, shown first ("8 × 7"). */
  readonly table: number;
  /** The other factor: floors of the building. */
  readonly other: number;
  readonly product: number;
  /** House numbers on the street (deliver: 4 shuffled; reverse: the product only). */
  readonly houses: readonly number[];
  /** Parcels to deliver (deliver: the fact; reverse: 3 expressions, one right). */
  readonly parcels: readonly ParcelOption[];
}

export interface PlanCityInput {
  facts: readonly FactKey[];
  boxOf: (key: FactKey) => number;
  /** The child's last wrong answers for a fact (distractor "personal" class). */
  errorsOf: (key: FactKey) => readonly number[];
  rng: Rng;
}

/** Value of "a × b" / "a + b" (labels of the learning core use a plain "x"). */
function expressionValue(label: string): number {
  const [a, op, b] = label.split(' ');
  return op === '+' ? Number(a) + Number(b) : Number(a) * Number(b);
}

function reverseParcels(factKey: FactKey, table: number, other: number, rng: Rng) {
  const question = expressionChoice(factKey, table, other, rng);
  return question.expressions.map((expression, i) => ({
    label: expression.replace(' x ', ' × '),
    value: expressionValue(expression),
    correct: i === question.answerIndex,
  }));
}

export function planCityRounds({ facts, boxOf, errorsOf, rng }: PlanCityInput): CityRound[] {
  return facts.map((factKey, index) => {
    const fact = parseFactKey(factKey);
    if (fact?.op !== 'mul') throw new Error(`City rounds need multiplication facts: ${factKey}`);
    const both = CITY_TABLES.includes(fact.min) && CITY_TABLES.includes(fact.max);
    const table = both
      ? rng() < 0.5
        ? fact.min
        : fact.max
      : CITY_TABLES.includes(fact.min)
        ? fact.min
        : fact.max;
    const other = table === fact.min ? fact.max : fact.min;
    const product = table * other;
    const kind: CityRoundKind =
      boxOf(factKey) >= REVERSE_BOX ? 'reverse' : index % 2 === 0 ? 'deliver' : 'windows';
    if (kind === 'reverse') {
      const parcels = reverseParcels(factKey, table, other, rng);
      return { kind, factKey, table, other, product, houses: [product], parcels };
    }
    const context = { factKey, a: table, b: other, answer: product, errorBank: errorsOf(factKey) };
    const { choices } = placeAnswer(product, pickDistractors(context, rng), rng);
    const parcels = [{ label: `${table} × ${other}`, value: product, correct: true }];
    return { kind, factKey, table, other, product, houses: choices, parcels };
  });
}

export interface SubmitResult {
  verdict: 'correct' | 'wrong' | 'revealed' | 'ignored';
  /** Set when the round just ended: record it with `learning.record`. */
  outcome?: QuestionOutcome;
}

/** Answers of one run: every round wants its product. */
export class CityRoundFlow {
  index = 0;
  hint: HintState = createHintState();
  roundComplete = false;
  private wrongAnswers: number[] = [];
  private startedAt: number;

  constructor(
    readonly rounds: readonly CityRound[],
    private readonly now: () => number,
    /** Rounds shown to the child (a reasoning round may follow these). */
    readonly total = rounds.length,
  ) {
    this.startedAt = now();
  }

  get round(): CityRound | undefined {
    return this.rounds[this.index];
  }

  get done(): boolean {
    return this.index >= this.rounds.length;
  }

  /** Wrong answers given in this round (hints rule out other parcels). */
  get tried(): readonly number[] {
    return this.wrongAnswers;
  }

  submit(value: number): SubmitResult {
    const round = this.round;
    if (!round || this.roundComplete) return { verdict: 'ignored' };
    if (value === round.product) return { verdict: 'correct', outcome: this.finish(round, true) };
    this.wrongAnswers.push(value);
    this.hint = recordWrong(this.hint);
    if (!this.hint.revealed) return { verdict: 'wrong' };
    return { verdict: 'revealed', outcome: this.finish(round, false) };
  }

  hintOffered(idleMs: number): boolean {
    return !this.roundComplete && shouldOfferHint(this.hint, idleMs);
  }

  takeHint(): HintRung {
    this.hint = takeHint(this.hint);
    return this.hint.rung;
  }

  /** Moves on after a completed round. */
  next(): void {
    if (!this.roundComplete) return;
    this.index += 1;
    this.hint = createHintState();
    this.roundComplete = false;
    this.wrongAnswers = [];
    this.startedAt = this.now();
  }

  private finish(round: CityRound, solved: boolean): QuestionOutcome {
    this.roundComplete = true;
    const result = toQuestionResult(this.hint, solved);
    return {
      factKey: round.factKey,
      ms: this.now() - this.startedAt,
      correct: result.correct,
      firstTry: result.firstTry,
      usedHint: result.usedHint,
      wrongAnswers: [...this.wrongAnswers],
    };
  }
}
