// Pure round logic of the forest: which division facts to practise, which story each round tells
// (share among friends, pack baskets, fact family) and the answer/hint state of the round.
import { divFactsForTables } from '../../learning/curriculum-tables';
import { type FactKey, mulKey, parseFactKey } from '../../learning/fact-key';
import {
  createHintState,
  type HintRung,
  type HintState,
  recordWrong,
  shouldOfferHint,
  takeHint,
  toQuestionResult,
} from '../../learning/hint-ladder';
import type { FactStat } from '../../learning/learning-types';
import type { QuestionOutcome } from '../../learning/session-recorder';

export type RoundKind = 'share' | 'pack' | 'family';

export interface ForestRound {
  readonly kind: RoundKind;
  readonly factKey: FactKey;
  readonly dividend: number;
  readonly divisor: number;
  readonly quotient: number;
}

export interface FamilyEquation {
  readonly a: number;
  readonly op: 'mul' | 'div';
  readonly b: number;
  readonly answer: number;
}

/** Fruit a concrete round can lay out; bigger dividends are practised symbolically. */
export const CONCRETE_MAX_FRUIT = 20;
/** Facts at this Leitner box or higher skip the objects (fact family only). */
export const SYMBOLIC_BOX = 3;
const FOREST_TABLES = [2, 3, 4, 5] as const;
const MIN_KNOWN_FACTS = 3;
const ROUND_KINDS: readonly RoundKind[] = ['share', 'pack', 'family', 'share', 'pack'];

type Stats = Readonly<Record<FactKey, FactStat | undefined>>;

function divParts(key: FactKey): { dividend: number; divisor: number } {
  const parsed = parseFactKey(key);
  if (parsed?.op !== 'div') throw new Error(`forest: not a division fact: ${key}`);
  return parsed;
}

/**
 * Division builds on multiplication: inverse divisions of known (box 3+) multiplication facts and
 * divisions already practised; until there are a few, the concrete starter set (tables 2-5, at
 * most 20 fruit, so a first run is not all ÷2).
 */
export function forestFactPool(stats: Stats): FactKey[] {
  const known = divFactsForTables(FOREST_TABLES).filter((key) => {
    const { dividend, divisor } = divParts(key);
    const inverse = stats[mulKey(divisor, dividend / divisor)];
    return (inverse?.box ?? 0) >= SYMBOLIC_BOX || (stats[key]?.attempts ?? 0) > 0;
  });
  if (known.length >= MIN_KNOWN_FACTS) return known;
  return divFactsForTables(FOREST_TABLES).filter(
    (key) => divParts(key).dividend <= CONCRETE_MAX_FRUIT,
  );
}

/** Rounds for the planned facts: share, pack, family, share, pack unless the fact is symbolic. */
export function planForestRounds(facts: readonly FactKey[], stats: Stats): ForestRound[] {
  return facts.map((factKey, i) => {
    const { dividend, divisor } = divParts(factKey);
    const symbolic = dividend > CONCRETE_MAX_FRUIT || (stats[factKey]?.box ?? 0) >= SYMBOLIC_BOX;
    const kind = symbolic ? 'family' : (ROUND_KINDS[i % ROUND_KINDS.length] as RoundKind);
    return { kind, factKey, dividend, divisor, quotient: dividend / divisor };
  });
}

/** a x b = p, b x a = p, p : a = b, p : b = a (duplicates dropped when a = b). */
export function familyEquations(round: ForestRound): FamilyEquation[] {
  const { dividend: p, divisor: a, quotient: b } = round;
  const all: FamilyEquation[] = [
    { a, op: 'mul', b, answer: p },
    { a: b, op: 'mul', b: a, answer: p },
    { a: p, op: 'div', b: a, answer: b },
    { a: p, op: 'div', b, answer: a },
  ];
  return all.filter(
    (eq, i) => all.findIndex((o) => o.op === eq.op && o.a === eq.a && o.b === eq.b) === i,
  );
}

export interface SubmitResult {
  verdict: 'correct' | 'wrong' | 'revealed' | 'ignored';
  /** Set when the round just ended: record it with `learning.record`. */
  outcome?: QuestionOutcome;
}

/** Answers of one run. `expected()` is the number the current blank wants. */
export class ForestRoundFlow {
  index = 0;
  /** Blank being filled (fact family has up to four, the stories one). */
  blank = 0;
  hint: HintState = createHintState();
  roundComplete = false;
  private wrongAnswers: number[] = [];
  private startedAt: number;

  constructor(
    readonly rounds: readonly ForestRound[],
    private readonly now: () => number,
    /** Rounds shown to the child (a reasoning round may follow these). */
    readonly total = rounds.length,
  ) {
    this.startedAt = now();
  }

  get round(): ForestRound | undefined {
    return this.rounds[this.index];
  }

  get done(): boolean {
    return this.index >= this.rounds.length;
  }

  /** Answers of the current round's blanks, in order. */
  answers(): number[] {
    const round = this.round;
    if (!round) return [];
    return round.kind === 'family'
      ? familyEquations(round).map((eq) => eq.answer)
      : [round.quotient];
  }

  expected(): number | undefined {
    return this.answers()[this.blank];
  }

  submit(value: number): SubmitResult {
    const round = this.round;
    if (!round || this.roundComplete) return { verdict: 'ignored' };
    if (value === this.expected()) {
      this.blank += 1;
      if (this.blank < this.answers().length) return { verdict: 'correct' };
      return { verdict: 'correct', outcome: this.finish(round, true) };
    }
    this.wrongAnswers.push(value);
    this.hint = recordWrong(this.hint);
    if (!this.hint.revealed) return { verdict: 'wrong' };
    this.blank = this.answers().length;
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
    this.blank = 0;
    this.hint = createHintState();
    this.roundComplete = false;
    this.wrongAnswers = [];
    this.startedAt = this.now();
  }

  private finish(round: ForestRound, solved: boolean): QuestionOutcome {
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
