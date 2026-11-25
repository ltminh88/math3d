// Perfect-player walkthrough (phase 21 staging, TASK R18): simulates "Học tiếp"
// walking B1→B81 with every answer correct, in the pure layer — no DOM, no UI.
// The simulation mirrors the real run loop exactly: it plans with `planLessonRun`
// (renderable = `isKeyRenderable`, the same predicate the picker and the run use),
// generates each item the way the run does (`skillPlan` tier from the Leitner box,
// `buildDailyQuestion` for table facts), checks the item renders and its correct
// answer through the family's own oracle, then records a clean first-try correct
// attempt (`applyAttempt`, ms 1000) — the box promotion the UI's step kit produces.
// A lesson is done at 3 stars, which is what `nextLesson` ("Học tiếp") requires to
// move on. Pure and deterministic (fixed seeds).
//
// Two walks:
// - `walkLessonChain` follows `nextLesson` itself, like a child tapping "Học tiếp"
//   again and again: it stops the moment a lesson cannot reach 3 stars.
// - `walkLessonsInOrder` plays every lesson directly, in B1→B81 order, to show
//   which lessons are finishable on their own (the report's 81-row table).

import { dialogRenderable, itemForSkill } from '../practice/item-for-skill';
import { buildDailyQuestion } from '../quiz/daily-question';
import { isStepAnswerCorrect, playableSteps } from '../reasoning/reasoning-step-answers';
import type { ClockSetting } from '../time/clock-setter';
import { isKeyRenderable } from '../ui/practice-run';
import { type FactKey, isSkillKey, parseKey } from './fact-key';
import {
  ALL_LESSONS,
  type KnttLessonKind,
  lessonByNumber,
  skillsOfLesson,
} from './kntt-lesson-index';
import type { FactStat } from './learning-types';
import { applyAttempt, newFactStat } from './leitner-box';
import { planLessonRun, plannableKeys } from './lesson-planner';
import { lessonStars, nextLesson } from './lesson-progress';
import { mulberry32 } from './seeded-rng';
import { skillTierOf } from './skill-tiers';

/** Perfect play needs at most this many 6-item runs per lesson (measured: B4 needs
 * 17 — 36 keys at 6 items per run; the mix lessons need far fewer because their
 * keys are shared with earlier lessons). */
export const MAX_WALKTHROUGH_RUNS = 20;
/** Fixed seed base: the whole walk is deterministic. */
export const WALKTHROUGH_SEED = 20261124;

export interface LessonWalkResult {
  n: number;
  topic: number;
  kind: KnttLessonKind;
  /** Keys the lesson practises (skills + table facts). */
  skillCount: number;
  /** Plannable keys at the start (0 = the lesson cannot be practised yet). */
  plannable: number;
  /** Perfect-play runs needed to reach 3 stars. */
  runs: number;
  itemsPlayed: number;
  firstRunItems: number;
  stars: number;
  status: 'done' | 'unplayable' | 'stuck' | 'blocked';
  /** Human-readable note, e.g. why a lesson needed 0 runs. */
  note: string;
  failures: string[];
}

export interface ChainWalkResult {
  /** One row per lesson, in B1→B81 order. */
  lessons: LessonWalkResult[];
  /** The order `nextLesson` ("Học tiếp") actually pointed at. */
  visitOrder: number[];
  chainFailures: string[];
  nextAfterChain: number | undefined;
  /** The lesson the chain stopped at, if it stopped early. */
  blockedAt: number | undefined;
}

type Stats = Record<FactKey, FactStat | undefined>;

/** The correct answer for one playable step, as the step kit would submit it. */
function correctAnswerOf(step: ReturnType<typeof playableSteps>[number]): {
  answer: number | string | readonly string[] | boolean | ClockSetting;
  problem?: string;
} {
  switch (step.kind) {
    case 'number':
      return Number.isFinite(step.answer)
        ? { answer: step.answer }
        : { answer: step.answer, problem: `number step with non-finite answer ${step.answer}` };
    case 'choice': {
      const right = step.options.filter((o) => o.correct);
      if (right.length === 0) return { answer: '', problem: 'choice step with no correct option' };
      return { answer: (right[0] as { id: string }).id };
    }
    case 'multi': {
      const right = step.options.filter((o) => o.correct);
      if (right.length === 0) return { answer: [], problem: 'multi step with no correct option' };
      return { answer: right.map((o) => o.id) };
    }
    case 'verdict':
      return typeof step.answer === 'boolean'
        ? { answer: step.answer }
        : { answer: false, problem: 'verdict step with non-boolean answer' };
    case 'set-clock':
      return { answer: { h: step.h, m: step.m } };
  }
}

/** Checks one planned item the way the run loop plays it; returns failure lines (empty = ok). */
function checkItem(key: FactKey, stats: Stats, rng: ReturnType<typeof mulberry32>): string[] {
  const failures: string[] = [];
  if (!isSkillKey(key)) {
    try {
      const q = buildDailyQuestion(key, stats[key], rng);
      if (q.options.length !== 3)
        failures.push(`${key}: quiz has ${q.options.length} options, want 3`);
      const values = q.options.map((o) => o.value);
      if (new Set(values).size !== values.length)
        failures.push(`${key}: quiz options repeat a value (${values.join(',')})`);
      if (!values.includes(q.answer))
        failures.push(`${key}: quiz answer ${q.answer} is not among options (${values.join(',')})`);
      if (typeof q.answer !== 'number' || !Number.isFinite(q.answer))
        failures.push(`${key}: quiz answer is not a finite number`);
    } catch (e) {
      failures.push(`${key}: buildDailyQuestion threw: ${(e as Error).message}`);
    }
    return failures;
  }
  const parsed = parseKey(key);
  const id = parsed?.op === 'skill' ? parsed.id : '';
  const box = stats[key]?.box ?? 1;
  let item: ReturnType<typeof itemForSkill>;
  try {
    item = itemForSkill(id, rng, skillTierOf({ box }));
  } catch (e) {
    return [`${key}: itemForSkill threw: ${(e as Error).message}`];
  }
  if (!dialogRenderable(item))
    failures.push(`${key}: item does not render (scene ${item.scene?.kind} has no renderer)`);
  const steps = playableSteps(item);
  if (steps.length === 0) failures.push(`${key}: item has no playable steps`);
  for (const [i, step] of steps.entries()) {
    const { answer, problem } = correctAnswerOf(step);
    if (problem) failures.push(`${key} step ${i}: ${problem}`);
    else if (!isStepAnswerCorrect(step, answer))
      failures.push(`${key} step ${i} (${step.kind}): the oracle rejects its own correct answer`);
  }
  return failures;
}

function emptyResult(
  n: number,
  stars: number,
  status: LessonWalkResult['status'],
  note: string,
): LessonWalkResult {
  const lesson = lessonByNumber(n);
  if (!lesson) throw new Error(`emptyResult: unknown lesson ${n}`);
  return {
    n,
    topic: lesson.topic,
    kind: lesson.kind,
    skillCount: skillsOfLesson(n).length,
    plannable: 0,
    runs: 0,
    itemsPlayed: 0,
    firstRunItems: 0,
    stars,
    status,
    note,
    failures: [],
  };
}

/**
 * Plays one lesson perfectly (6-item runs, all correct) until it reaches 3 stars.
 * Mutates `stats` — the chain walk passes the accumulating stats, like a real child
 * who keeps what earlier lessons taught. Returns the lesson's walk result.
 */
export function simulateLesson(
  n: number,
  stats: Stats,
  seedBase = WALKTHROUGH_SEED,
): LessonWalkResult {
  const lesson = lessonByNumber(n);
  if (!lesson) throw new Error(`simulateLesson: unknown lesson ${n}`);
  const renderable = (key: FactKey): boolean => isKeyRenderable(key, stats[key]?.box ?? 1);
  const result: LessonWalkResult = {
    n,
    topic: lesson.topic,
    kind: lesson.kind,
    skillCount: skillsOfLesson(n).length,
    plannable: plannableKeys(n, renderable).length,
    runs: 0,
    itemsPlayed: 0,
    firstRunItems: 0,
    stars: lessonStars(n, stats),
    status: 'unplayable',
    note: '',
    failures: [],
  };
  if (result.stars === 3) {
    result.status = 'done';
    result.note = 'already 3 stars from earlier lessons';
    return result;
  }
  while (result.stars < 3 && result.runs < MAX_WALKTHROUGH_RUNS) {
    const runKeys = planLessonRun(n, stats, mulberry32(seedBase + n * 1000 + result.runs), {
      renderable,
    });
    if (runKeys.length === 0) {
      if (result.runs > 0)
        result.failures.push(
          `B${n}: run ${result.runs + 1} planned 0 items after ${result.runs} runs`,
        );
      break;
    }
    if (result.runs === 0) result.firstRunItems = runKeys.length;
    for (const [i, key] of runKeys.entries()) {
      const itemRng = mulberry32(seedBase + n * 100000 + result.runs * 7919 + i * 131);
      for (const f of checkItem(key, stats, itemRng)) result.failures.push(`B${n}: ${f}`);
      const before = stats[key] ?? newFactStat();
      stats[key] = applyAttempt(before, {
        correct: true,
        firstTry: true,
        usedHint: false,
        ms: 1000,
        sessionNo: result.runs + 1,
        at: 1000 * (result.runs + 1),
      });
      result.itemsPlayed += 1;
    }
    result.runs += 1;
    result.stars = lessonStars(n, stats);
  }
  if (result.stars === 3) {
    result.status = 'done';
  } else if (result.runs === 0) {
    result.status = 'unplayable';
    result.note = 'no plannable keys — skipped by Học tiếp';
  } else {
    result.status = 'stuck';
    result.note = `stuck at ${result.stars}★ after ${result.runs} runs`;
  }
  return result;
}

/**
 * Plays every lesson directly, B1→B81 in order, each perfectly to 3 stars (or to
 * "stuck" after MAX_WALKTHROUGH_RUNS runs). This is the report's 81-row table: it
 * shows which lessons are finishable on their own, whether or not "Học tiếp"
 * ever points at them.
 */
export function walkLessonsInOrder(seedBase = WALKTHROUGH_SEED): LessonWalkResult[] {
  const stats: Stats = {};
  return ALL_LESSONS.map((lesson) => simulateLesson(lesson.n, stats, seedBase));
}

/**
 * Follows `nextLesson` ("Học tiếp") the way a child does: take the lesson it
 * points at, play it perfectly to 3 stars, repeat. Stops when there is nothing
 * left (all done) or when a lesson cannot reach 3 stars — then "Học tiếp" is
 * stuck pointing at that lesson forever.
 */
export function walkLessonChain(seedBase = WALKTHROUGH_SEED): ChainWalkResult {
  const stats: Stats = {};
  const byN = new Map<number, LessonWalkResult>();
  const visitOrder: number[] = [];
  const chainFailures: string[] = [];
  let blockedAt: number | undefined;
  for (let step = 0; step < ALL_LESSONS.length; step++) {
    const next = nextLesson(stats);
    if (next === undefined) break;
    visitOrder.push(next);
    const r = simulateLesson(next, stats, seedBase);
    byN.set(next, r);
    if (r.status !== 'done') {
      blockedAt = next;
      chainFailures.push(
        `B${next} stuck at ${r.stars}★ after ${r.runs} runs — Học tiếp cannot advance past it`,
      );
      break;
    }
  }
  if (blockedAt !== undefined) {
    chainFailures.push(
      `chain blocked at B${blockedAt}: B${blockedAt + 1}–B81 never reached via Học tiếp`,
    );
  }
  const lessons = ALL_LESSONS.map((lesson) => {
    const r = byN.get(lesson.n);
    if (r) return r;
    const stars = lessonStars(lesson.n, stats);
    if (stars === 3)
      return emptyResult(lesson.n, 3, 'done', 'already 3 stars from earlier lessons');
    return emptyResult(
      lesson.n,
      stars,
      blockedAt === undefined ? 'stuck' : 'blocked',
      blockedAt === undefined
        ? 'never reached by Học tiếp and not finished'
        : `never reached — chain blocked at B${blockedAt}`,
    );
  });
  return { lessons, visitOrder, chainFailures, nextAfterChain: nextLesson(stats), blockedAt };
}
