// Pure run logic of the tower: which facts the seven floors ask (weak facts first, both
// operations), and the answer/hint state of the current floor. Rules: no timer, no lives; every
// step of a floor has its own three tries: the third miss shows that step's answer and the floor
// goes on (recorded once, not correct).
import { divFactsForTables, mulFactsForTables } from '../../learning/curriculum-tables';
import { divKey, type FactKey, mulKey } from '../../learning/fact-key';
import { type HintRung, type HintState, shouldOfferHint } from '../../learning/hint-ladder';
import type { FactStat } from '../../learning/learning-types';
import { type Rng, shuffle } from '../../learning/seeded-rng';
import type { QuestionOutcome } from '../../learning/session-recorder';
import { StepMissBudget } from '../shared/step-miss-budget';
import {
  assignFormats,
  buildQuestion,
  factTriple,
  type TowerQuestion,
  type TowerStep,
} from './tower-question-formats';

export const TOWER_TABLES = [2, 3, 4, 5, 6, 7, 8, 9] as const;
/** Last taught rung of a step (rung 5 is only reached by three misses). */
const TOWER_LAST_RUNG = 4;

type Stats = Readonly<Record<FactKey, FactStat | undefined>>;

/** Every multiplication and its inverse divisions over tables 2-9. */
export function towerFactPool(): FactKey[] {
  return [...mulFactsForTables(TOWER_TABLES), ...divFactsForTables(TOWER_TABLES)];
}

/** mul:a×b ↔ div:p/b (the larger factor as divisor while it is a table 2-9: 8 × 10 → 80 : 8). */
function inverseOf(key: FactKey): FactKey {
  const t = factTriple(key);
  if (t.op === 'div') return mulKey(t.a, t.b);
  return divKey(t.p, t.b <= Math.max(...TOWER_TABLES) ? t.b : t.a);
}

/**
 * The floors' facts from the planner's pick: distinct facts topped up to `length` (seen facts
 * weakest first, then fresh ones), at least one × and one :, sorted weakest box first.
 */
export function planTowerFacts(
  planned: readonly FactKey[],
  stats: Stats,
  rng: Rng,
  length: number,
): FactKey[] {
  const box = (k: FactKey) => stats[k]?.box ?? 1;
  const facts = [...new Set(planned)].slice(0, length);
  const rest = towerFactPool().filter((k) => !facts.includes(k));
  const seen = rest.filter((k) => (stats[k]?.attempts ?? 0) > 0).sort((a, b) => box(a) - box(b));
  const fresh = shuffle(
    rng,
    rest.filter((k) => !seen.includes(k)),
  );
  for (const k of [...seen, ...fresh]) {
    if (facts.length >= length) break;
    facts.push(k);
  }
  const ops = new Set(facts.map((k) => k.slice(0, 3)));
  if (ops.size === 1) {
    for (let i = facts.length - 1; i >= 0; i--) {
      const inverse = inverseOf(facts[i] as FactKey);
      if (facts.includes(inverse)) continue;
      facts[i] = inverse;
      break;
    }
  }
  return facts.sort((a, b) => box(a) - box(b));
}

/** Questions for the floors: rotated formats, distractors fed by the child's own errors. */
export function planTowerQuestions(facts: readonly FactKey[], stats: Stats, rng: Rng) {
  const formats = assignFormats(facts);
  return facts.map((key, i) =>
    buildQuestion(key, formats[i] ?? 'missing', rng, stats[key]?.errs ?? []),
  );
}

export type StepAnswer = number | boolean;

export interface SubmitResult {
  verdict: 'correct' | 'wrong' | 'revealed' | 'ignored';
  /** Set when the floor just ended: record it with `learning.record`. */
  outcome?: QuestionOutcome;
}

/** Answers of one climb. `step` is what the current floor asks now. */
export class TowerRoundFlow {
  index = 0;
  stepIndex = 0;
  roundComplete = false;
  private readonly budget = new StepMissBudget();
  private wrongAnswers: number[] = [];
  private startedAt: number;

  constructor(
    readonly questions: readonly TowerQuestion[],
    private readonly now: () => number,
    /** Floors shown to the child (a reasoning floor may follow these). */
    readonly total = questions.length,
  ) {
    this.startedAt = now();
  }

  /** The live step's hint ladder (its misses and rungs). */
  get hint(): HintState {
    return this.budget.hint;
  }

  get question(): TowerQuestion | undefined {
    return this.questions[this.index];
  }

  get step(): TowerStep | undefined {
    return this.question?.steps[this.stepIndex];
  }

  get done(): boolean {
    return this.index >= this.questions.length;
  }

  expected(): StepAnswer | undefined {
    return this.step?.answer;
  }

  submit(value: StepAnswer): SubmitResult {
    const question = this.question;
    const step = this.step;
    if (!question || !step || this.roundComplete) return { verdict: 'ignored' };
    if (typeof value !== typeof step.answer) return { verdict: 'ignored' };
    if (value === step.answer) return this.advance(question, 'correct');
    // A false claim judged true means the child believed its number: that is the slip to bank.
    if (typeof value === 'number') this.wrongAnswers.push(value);
    else if (value) this.wrongAnswers.push(step.eq.z);
    if (!this.budget.miss()) return { verdict: 'wrong' };
    return this.advance(question, 'revealed');
  }

  /** The step is answered or shown: the next step (fresh tries, hints from rung 1) or the end. */
  private advance(question: TowerQuestion, verdict: 'correct' | 'revealed'): SubmitResult {
    this.stepIndex += 1;
    if (this.stepIndex < question.steps.length) {
      this.budget.nextStep();
      return { verdict };
    }
    return { verdict, outcome: this.finish(question) };
  }

  hintOffered(idleMs: number): boolean {
    return !this.roundComplete && shouldOfferHint(this.hint, idleMs);
  }

  takeHint(): HintRung {
    return this.budget.takeHint(TOWER_LAST_RUNG);
  }

  /** Moves up after a finished floor. */
  next(): void {
    if (!this.roundComplete) return;
    this.index += 1;
    this.stepIndex = 0;
    this.budget.reset();
    this.roundComplete = false;
    this.wrongAnswers = [];
    this.startedAt = this.now();
  }

  private finish(question: TowerQuestion): QuestionOutcome {
    this.roundComplete = true;
    const result = this.budget.result();
    return {
      factKey: question.factKey,
      ms: this.now() - this.startedAt,
      correct: result.correct,
      firstTry: result.firstTry,
      usedHint: result.usedHint,
      wrongAnswers: [...this.wrongAnswers],
    };
  }
}
