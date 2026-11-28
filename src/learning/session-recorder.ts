import { itemFingerprint } from '../practice/item-fingerprint';
import type { Misconception, ReasoningItem } from '../reasoning/reasoning-types';
import type { FactKey } from './fact-key';
import type { DeltaFact, FactLocalState, FactStat, SessionDelta } from './learning-types';
import { applyAttempt, LEITNER, newFactStat } from './leitner-box';
import { rememberSeen } from './recent-items';
import { questionReward, starsFor } from './scoring';

/** One wrong pick inside a question, in the order given. A number wrong carries
 * its value (kept in the error bank). */
export interface WrongAttempt {
  readonly wrongAnswer?: number;
}

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
  /** Wrong attempts in the order given (boost Phase 0). When absent, the
   * recorder derives them from `wrongAnswers` (number wrongs only), so older
   * callers keep working. */
  wrongAttempts?: readonly WrongAttempt[];
  /** The question's bugs (boost Phase 0, R79): they go only into the bug bank
   * — they never add an attempt or move the box. */
  bugs?: readonly Misconception[];
  /** The item as shown (anti-repeat Phase 2): its fingerprint is recorded into
   * `seen` — recording seen is not an attempt, so it touches nothing else. */
  item?: ReasoningItem;
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
  /** Stage of this run (1-based, from the host): stages 2+ record their stars in `stageStars`. */
  stage?: number;
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
      const derived: readonly WrongAttempt[] =
        o.wrongAttempts ?? o.wrongAnswers.map((wrongAnswer) => ({ wrongAnswer }));
      const wrongs: readonly WrongAttempt[] = !o.correct && derived.length === 0 ? [{}] : derived;
      const attempts = wrongs.length + (o.correct ? 1 : 0);
      const perAttemptMs = o.ms / attempts;
      const at = opts.now();
      const entry = facts[o.factKey] ?? { a: 0, c: 0, ms: 0, box: stat.box, seenAt: at };

      const step = (correct: boolean, wrong?: WrongAttempt): void => {
        const before = stat;
        stat = applyAttempt(stat, {
          correct,
          firstTry: o.firstTry,
          usedHint: o.usedHint,
          ms: perAttemptMs,
          wrongAnswer: wrong?.wrongAnswer,
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
      // The question's bugs go only into the bug bank (R79): they never add an
      // attempt or move the box. `recent` shifts once per question here, not
      // per attempt — a choice miss with no numeric wrong still counts as a 0
      // bit (a per-attempt shift would skip it).
      if (o.bugs && o.bugs.length > 0) {
        const fresh = [...new Set(o.bugs)];
        stat = { ...stat, bugs: [...(stat.bugs ?? []), ...fresh].slice(-LEITNER.bugsKept) };
      }
      const mask = (1 << LEITNER.recentKept) - 1;
      stat = {
        ...stat,
        recent: (((stat.recent ?? 0) << 1) | (o.correct && o.firstTry ? 1 : 0)) & mask,
        // One recorded try per question, capped like the mask: the count is the
        // denominator for `recent` (R133) — `attempts` also counts retries and
        // seeded/imported attempts the mask never saw.
        recentCount: Math.min((stat.recentCount ?? 0) + 1, LEITNER.recentKept),
      };
      // Recording "seen" is not an attempt: it runs after the attempt/bug
      // logic for every outcome and touches nothing else (R79 unchanged).
      if (o.item !== undefined) stat = rememberSeen(stat, itemFingerprint(o.item));

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
      const stage = opts.stage ?? 1;
      const level: { stars: number; bestScore: number; stageStars?: readonly number[] } =
        stage > 1
          ? {
              // Stage 1 keeps the level's `stars` (and its first-completion bonus); a later
              // stage records only its own slot, so it never overwrites stage 1's stars.
              stars: 0,
              bestScore: xp,
              stageStars: Array.from({ length: stage }, (_, i) => (i === stage - 1 ? stars : 0)),
            }
          : { stars, bestScore: xp };
      const delta: SessionDelta = {
        batchId: opts.newId(),
        profileId: opts.profileId,
        clientTs: opts.now(),
        v: 1,
        facts,
        levels: completed ? { [opts.levelId]: level } : {},
        xp,
        coins,
      };
      const local: Record<FactKey, FactLocalState> = {};
      for (const [key, s] of working)
        local[key] = {
          streak: s.streak,
          fluent: s.fluent,
          errs: s.errs,
          bugs: s.bugs,
          recent: s.recent,
          recentCount: s.recentCount,
          seen: s.seen,
        };
      return { delta, local };
    },
  };
}
