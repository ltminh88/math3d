// The shared practice run loop (phase 06, extracted from daily-practice.ts): a list of fact
// keys played in the shared dialog — skill keys through the step kit, × / : facts through
// the quiz dialog. Outcomes go through the session recorder (one batch), +5 coins per
// correct answer, no XP. Leaving mid-run keeps the answered items; the batch is committed
// either way. Daily and lesson both call it; only their title, note and finish differ —
// the caller passes those in, and the run calls back when it finishes.

import { unitForSkill } from '../english/content/units';
import { generateItem } from '../english/engine/item-generators';
import { kindsForSkill } from '../english/engine/item-planner';
import type { EnglishItemKind, EnglishSkillId } from '../english/english-types';
import { type FactKey, isSkillKey, parseKey } from '../learning/fact-key';
import { COINS_PER_CORRECT } from '../learning/scoring';
import { mulberry32, type Rng } from '../learning/seeded-rng';
import type { QuestionOutcome } from '../learning/session-recorder';
import { skillTierOf } from '../learning/skill-tiers';
import type { ReasoningRoundPlan } from '../levels/shared/reasoning-round-slot';
import { dialogRenderable, familyOfSkill, itemForSkill } from '../practice/item-for-skill';
import { buildDailyQuestion } from '../quiz/daily-question';
import { createQuizAnswerBatch, type QuizAnswerBatch } from '../quiz/quiz-answer-batch';
import type { GameStore } from '../store/game-store-api';
import { newId } from '../store/new-id';
import { mountQuizItem, quizItemHtml } from './daily-quiz-item';
import { mountSkillItem, skillItemHtml, skillPlan } from './daily-skill-item';
import { closeDialog, openDialog } from './dialog';
import { type DialogKind, gameState } from './game-state';
import { refreshHud } from './hud';
import { byId } from './icons';
import { commitDailyAnswers } from './progress-sync';

export interface PracticeRunState {
  readonly keys: readonly FactKey[];
  index: number;
  plan: ReasoningRoundPlan | null;
  readonly store: GameStore;
  readonly batch: QuizAnswerBatch;
  correctCount: number;
  committed: boolean;
  readonly rng: Rng;
  readonly signal: AbortController;
  current: { destroy(): void; missed(): QuestionOutcome | null } | null;
  readonly kind: DialogKind;
  readonly titleFor: (index: number, total: number) => string;
  readonly alreadyCounted: boolean;
  readonly onFinish: (correctCount: number) => void;
  readonly testHook?: PracticeTestHook;
}

/** Test builds only: installs the run's `window.__*` hook, removed with the run. */
export interface PracticeTestHook {
  install(getRun: () => PracticeRunState | null): void;
  remove(): void;
}

export interface StartPracticeRunOptions {
  store: GameStore;
  keys: readonly FactKey[];
  seed: number;
  kind: DialogKind;
  /** Dialog title for item `index` of `total` (0-based). */
  titleFor(index: number, total: number): string;
  /** True when the run replays already-counted work (daily only): shows the note. */
  alreadyCounted?: boolean;
  /** Called after the batch is committed on a finished run; shows the finish screen. */
  onFinish(correctCount: number): void;
  testHook?: PracticeTestHook;
}

let run: PracticeRunState | null = null;

/** The current run, or null. */
export function currentPracticeRun(): PracticeRunState | null {
  return run;
}

/**
 * True when one fact key can be shown in the shared dialog — judged on the ITEM, never
 * on the skill's family (phase 04, le 21/11 11:01): a table fact always renders (the quiz
 * dialog); a skill renders when its generated item has no scene, or its scene kind has
 * a renderer. An unknown id throws in itemForSkill and is dropped, never breaking the
 * dialog open. Daily filters its pool with this; lesson planning passes it per key.
 */
export function isKeyRenderable(key: FactKey, box: number): boolean {
  if (!isSkillKey(key)) return true;
  const parsed = parseKey(key);
  const id = parsed?.op === 'skill' ? parsed.id : '';
  // English Island (Phase 6): an English skill renders when its generator can
  // build an item for it from its home unit. The widget itself loads lazily
  // at render time, so this check only proves the content exists.
  if (familyOfSkill(id) === 'english') {
    try {
      const skillId = id as EnglishSkillId;
      const kinds = kindsForSkill(skillId);
      generateItem(
        skillId,
        kinds[0] as EnglishItemKind,
        skillTierOf({ box }),
        unitForSkill(skillId),
        mulberry32(0),
      );
      return true;
    } catch {
      return false;
    }
  }
  try {
    const item = itemForSkill(id, mulberry32(0), skillTierOf({ box }));
    return dialogRenderable(item);
  } catch {
    return false;
  }
}

export function startPracticeRun(opts: StartPracticeRunOptions): PracticeRunState {
  const snapshot = opts.store.getSnapshot();
  run = {
    keys: opts.keys,
    index: 0,
    plan: null,
    store: opts.store,
    batch: createQuizAnswerBatch({
      profileId: snapshot.profile.id,
      sessionNo: opts.store.nextSessionNo(),
      getStat: (key) => opts.store.getSnapshot().factStats[key],
      now: Date.now,
      newId,
    }),
    correctCount: 0,
    committed: false,
    rng: mulberry32(opts.seed ^ 0x9e3779b9),
    signal: new AbortController(),
    current: null,
    kind: opts.kind,
    titleFor: opts.titleFor,
    alreadyCounted: opts.alreadyCounted ?? false,
    onFinish: opts.onFinish,
    testHook: opts.testHook,
  };
  byId<HTMLDialogElement>('dialog').addEventListener('close', onDialogClosed, { once: true });
  if (import.meta.env.MODE === 'test') opts.testHook?.install(() => run);
  renderItem();
  return run;
}

const onDialogClosed = (): void => {
  if (!run) return;
  if (run.committed) destroyPracticeRun();
  else void leaveRun();
};

const onAnswered = (outcome: QuestionOutcome): void => {
  if (!run) return;
  run.batch.recordQuestion(outcome, { xp: 0, coins: outcome.correct ? COINS_PER_CORRECT : 0 });
  if (outcome.correct) {
    run.correctCount += 1;
    gameState.progress.coins += COINS_PER_CORRECT;
    refreshHud();
  }
};

const onNext = (): void => {
  if (!run) return;
  run.index += 1;
  if (run.index >= run.keys.length) void finishRun();
  else renderItem();
};

function renderItem(): void {
  if (!run) return;
  const { keys, index, store } = run;
  const key = keys[index] as FactKey;
  const title = run.titleFor(index, keys.length);
  const isLast = index === keys.length - 1;
  run.current?.destroy();
  run.plan = null;
  if (isSkillKey(key)) {
    const parsed = parseKey(key);
    const id = parsed?.op === 'skill' ? parsed.id : '';
    // English Island (Phase 6): one English item in the shared dialog. The
    // widgets load lazily (dynamic import) so the daily dialog's chunk does
    // not carry them until the first English item is shown.
    if (familyOfSkill(id) === 'english') {
      void renderEnglishItem(key, id as EnglishSkillId, title, isLast);
      return;
    }
    const plan = skillPlan(id, store.getSnapshot().factStats[key]?.box ?? 1, run.rng);
    run.plan = plan;
    openDialog(title, skillItemHtml(index, keys.length, run.alreadyCounted), run.kind);
    const skill = mountSkillItem(plan, isLast, run.signal.signal, {
      onAnswered,
      onNext,
      onLeave: () => void leaveRun(),
    });
    run.current = { destroy: () => skill.destroy(), missed: () => null };
    return;
  }
  const question = buildDailyQuestion(key, store.getSnapshot().factStats[key], run.rng);
  openDialog(title, quizItemHtml(question, run.alreadyCounted), run.kind);
  const missed = mountQuizItem(question, isLast, {
    onAnswered,
    onNext,
    onLeave: () => void leaveRun(),
  });
  run.current = { destroy: () => {}, missed };
}

/** The English branch of renderItem: the import resolves after the dialog's */
async function renderEnglishItem(
  key: FactKey,
  skillId: EnglishSkillId,
  title: string,
  isLast: boolean,
): Promise<void> {
  const mod = await import('./english/english-daily-item');
  // The run may have ended (leave / finish) while the import was in flight.
  if (!run || run.keys[run.index] !== key) return;
  const { store } = run;
  openDialog(title, mod.englishItemHtml(run.index, run.keys.length, run.alreadyCounted), run.kind);
  const mounted = mod.mountEnglishDailyItem({
    skillId,
    box: store.getSnapshot().factStats[key]?.box ?? 1,
    isLast,
    rng: run.rng,
    signal: run.signal.signal,
    cb: {
      onAnswered,
      onNext,
      onLeave: () => void leaveRun(),
    },
  });
  run.current = { destroy: () => mounted.destroy(), missed: () => null };
}

async function finishRun(): Promise<void> {
  if (!run || run.committed) return;
  run.committed = true;
  const { batch, correctCount, onFinish } = run;
  // The daily batch commit is the shared practice commit (facts + per-answer coins);
  // the caller's onFinish adds only its own finish reward and screen.
  await commitDailyAnswers(batch.finish());
  onFinish(correctCount);
}

async function leaveRun(): Promise<void> {
  if (!run || run.committed) return;
  run.committed = true;
  const { batch, current } = run;
  const missed = current?.missed() ?? null;
  if (missed) batch.recordQuestion(missed, { xp: 0, coins: 0 });
  if (batch.size > 0) await commitDailyAnswers(batch.finish());
  destroyPracticeRun();
  closeDialog();
}

/** Destroys the current run (if any) without committing — the finish screen's back button. */
export function destroyPracticeRun(): void {
  if (!run) return;
  run.current?.destroy();
  run.signal.abort();
  if (import.meta.env.MODE === 'test') run.testHook?.remove();
  run = null;
}
