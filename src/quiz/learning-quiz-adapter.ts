// Learning core -> the original 3-choice quiz dialog. Fact selection comes from the Leitner
// session planner over the chosen table; options from the distractor classes (practice) or
// expression choice (bridge). The dialog, hints and rewards stay the original ones.
import { TABLES } from '../config/world-constants';
import { FLUENCY_ORDER } from '../learning/curriculum-tables';
import type { DistractorContext } from '../learning/distractor-classes';
import { pickDistractors, placeAnswer } from '../learning/distractor-picker';
import { expressionChoice } from '../learning/expression-choice';
import { type FactKey, mulKey, parseFactKey } from '../learning/fact-key';
import type { FactStat } from '../learning/learning-types';
import { pick, type Rng } from '../learning/seeded-rng';
import { planSession } from '../learning/session-planner';
import type { AnswerOption, Question, QuizMode } from './question-types';
import { chooseWordProblemSkill, wordProblemDue } from './quiz-reasoning-slot';
import { buildWordProblemQuestion, WORD_PROBLEM_SKILLS } from './quiz-word-problem-question';

/** Facts drilled for a table filter (0 = all tables, the original 90 directed facts pooled). */
export function quizFactPool(table: number): { pool: FactKey[]; tables: number[] } {
  const tables = table ? [table] : FLUENCY_ORDER.filter((t) => TABLES.includes(t));
  const pool = new Set<FactKey>();
  for (const a of table ? [table] : TABLES) for (let b = 1; b <= 10; b++) pool.add(mulKey(a, b));
  return { pool: [...pool], tables };
}

/** Which factor is the table (`a` groups of `b`): the filtered table, else a random valid one. */
function orient(key: FactKey, table: number, rng: Rng): [number, number] {
  const parsed = parseFactKey(key);
  if (parsed?.op !== 'mul') throw new Error(`quiz: not a multiplication fact "${key}"`);
  const { min, max } = parsed;
  if (table === min || table === max) return [table, table === min ? max : min];
  const ways: Array<[number, number]> = [[min, max]];
  if (min !== max) ways.push([max, min]);
  const valid = ways.filter(([a]) => TABLES.includes(a));
  return pick(rng, valid.length ? valid : ways);
}

/**
 * Two distractors for a 3-choice question. pickDistractors keeps the answer off both extremes of
 * four options; dropping one of three uniformly would leave it in the middle 2/3 of the time, so
 * the drop is weighted to make smallest / middle / largest about equally likely.
 */
export function pickThreeChoiceDistractors(ctx: DistractorContext, rng: Rng): number[] {
  const three = pickDistractors(ctx, rng, 3);
  const below = three.filter((n) => n < ctx.answer);
  const above = three.filter((n) => n > ctx.answer);
  let drop: number;
  if (below.length === 0 || above.length === 0) drop = pick(rng, three);
  else if (below.length === 1) drop = rng() < 2 / 3 ? (below[0] as number) : pick(rng, above);
  else drop = rng() < 2 / 3 ? (above[0] as number) : pick(rng, below);
  return three.filter((n) => n !== drop);
}

const evaluate = (expression: string): number => {
  const [x, op, y] = expression.split(' ');
  return op === '+' ? Number(x) + Number(y) : Number(x) * Number(y);
};

export interface QuizQuestionContext {
  mode: QuizMode;
  table: number;
  stat?: FactStat;
}

export function buildQuizQuestion(key: FactKey, ctx: QuizQuestionContext, rng: Rng): Question {
  const [a, b] = orient(key, ctx.table, rng);
  const answer = a * b;
  let options: AnswerOption[];
  if (ctx.mode === 'bridge') {
    const choice = expressionChoice(key, a, b, rng);
    options = choice.expressions.map((e) => ({
      value: evaluate(e),
      label: e.replace(' x ', ' × '),
    }));
  } else {
    const errorBank = ctx.stat?.errs ?? [];
    const distractors = pickThreeChoiceDistractors({ factKey: key, a, b, answer, errorBank }, rng);
    const { choices } = placeAnswer(answer, distractors, rng);
    options = choices.map((value) => ({ value, label: String(value) }));
  }
  const review = (ctx.stat?.attempts ?? 0) > 0 && ctx.stat?.box === 1;
  return { id: `m${a}_${b}`, factKey: key, a, b, answer, options, review };
}

export interface PlannerContext {
  mode: QuizMode;
  table: number;
  stats: Readonly<Record<FactKey, FactStat | undefined>>;
  sessionNo: number;
}

export interface QuizPlanner {
  /** Next question; never the fact `lastKey` when another one is available. */
  next(ctx: PlannerContext, lastKey?: string): Question;
}

/**
 * Walks Leitner session plans (10 facts each), replanning when exhausted or the table changes.
 * Every 5th question is a word problem once the table is mastered (quiz-reasoning-slot.ts).
 */
export function createQuizPlanner(rng: Rng): QuizPlanner {
  let plan: FactKey[] = [];
  let planTable = -1;
  let asked = 0;
  return {
    next(ctx, lastKey = '') {
      asked += 1;
      if (wordProblemDue(asked, ctx.stats, quizFactPool(ctx.table).pool)) {
        const skill = chooseWordProblemSkill(ctx.stats, WORD_PROBLEM_SKILLS);
        return buildWordProblemQuestion(skill, ctx.table, ctx.stats, rng);
      }
      const replan = (): void => {
        const { pool, tables } = quizFactPool(ctx.table);
        plan = planSession({ stats: ctx.stats, pool, tables, sessionNo: ctx.sessionNo, rng });
        planTable = ctx.table;
      };
      if (planTable !== ctx.table || !plan.some((k) => k !== lastKey)) replan();
      const idx = plan.findIndex((k) => k !== lastKey);
      const [key] = plan.splice(idx === -1 ? 0 : idx, 1) as [FactKey];
      return buildQuizQuestion(
        key,
        { mode: ctx.mode, table: ctx.table, stat: ctx.stats[key] },
        rng,
      );
    },
  };
}
