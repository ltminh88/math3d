import type { FactKey } from './fact-key';
import type { DeltaFact, FactLocalState, FactStat, SessionDelta } from './learning-types';
import { applyAttempt, LEITNER, newFactStat } from './leitner-box';
import { questionReward, starsFor } from './scoring';

export interface QuestionOutcome {
  factKey: FactKey;
  /** Total time spent on the question. */
  ms: number;
  /** Final result (false: revealed / out of attempts). */
  correct: boolean;
  /** No wrong answer before the final one. */
  firstTry: boolean;
  usedHint: boolean;
  /** Wrong answers given, in order. */
  wrongAnswers: readonly number[];
}

export interface SessionResult {
  delta: SessionDelta;
  /** Device-only per-fact state to persist next to the delta. */
  local: Record<FactKey, FactLocalState>;
}

export interface RecorderOptions {
  profileId: string;
  levelId: string;
  sessionNo: number;
  getStat: (key: FactKey) => FactStat | undefined;
  now: () => number;
  newId: () => string;
}

export interface SessionRecorder {
  recordQuestion(outcome: QuestionOutcome): void;
  finish(completed?: boolean): SessionResult;
}

export function createSessionRecorder(opts: RecorderOptions): SessionRecorder {
  const working = new Map<FactKey, FactStat>();
  const facts: Record<FactKey, DeltaFact> = {};
  let xp = 0;
  let coins = 0;
  let total = 0;
  let firstTryClean = 0;
  let hintsUsed = 0;

  return {
    recordQuestion(o) {
      let stat = working.get(o.factKey) ?? opts.getStat(o.factKey) ?? newFactStat();
      const boxBefore = stat.box;
      // A revealed question counts as (at least) one wrong attempt.
      const wrongs = o.correct
        ? [...o.wrongAnswers]
        : o.wrongAnswers.length > 0
          ? [...o.wrongAnswers]
          : [undefined];
      const attempts = wrongs.length + (o.correct ? 1 : 0);
      const perAttemptMs = o.ms / attempts;
      const at = opts.now();
      const entry = facts[o.factKey] ?? { a: 0, c: 0, ms: 0, box: stat.box, seenAt: at };

      const step = (correct: boolean, wrongAnswer?: number): void => {
        const before = stat;
        stat = applyAttempt(stat, {
          correct,
          firstTry: o.firstTry,
          usedHint: o.usedHint,
          ms: perAttemptMs,
          wrongAnswer,
          sessionNo: opts.sessionNo,
          at,
        });
        entry.a += 1;
        entry.c += correct ? 1 : 0;
        entry.ms += stat.totalMs - before.totalMs;
      };
      for (const w of wrongs) step(false, w);
      if (o.correct) step(true);
      // Every attempt is counted, but the box moves once per question: any miss is one step down.
      if (wrongs.length > 0) stat = { ...stat, box: Math.max(LEITNER.minBox, boxBefore - 1) };

      entry.box = stat.box;
      entry.seenAt = at;
      facts[o.factKey] = entry;
      working.set(o.factKey, stat);

      const reward = questionReward(o);
      xp += reward.xp;
      coins += reward.coins;
      total += 1;
      if (o.correct && o.firstTry && !o.usedHint) firstTryClean += 1;
      if (o.usedHint) hintsUsed += 1;
    },

    finish(completed = true) {
      const stars = starsFor({ total, firstTryClean, hintsUsed, completed });
      const delta: SessionDelta = {
        batchId: opts.newId(),
        profileId: opts.profileId,
        clientTs: opts.now(),
        v: 1,
        facts,
        levels: completed ? { [opts.levelId]: { stars, bestScore: xp } } : {},
        xp,
        coins,
      };
      const local: Record<FactKey, FactLocalState> = {};
      for (const [key, s] of working)
        local[key] = { streak: s.streak, fluent: s.fluent, errs: s.errs };
      return { delta, local };
    },
  };
}
