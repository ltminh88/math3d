// Test builds only (`vite build --mode test`): `window.__game.island` lets e2e
// specs start an English run (the island level shell of 1A is not on main yet)
// and read the current item's answer. Installed from the test-debug hook;
// the run commits through the same level path the host uses (levelId 'island').
import { type EnglishExpected, expectedOf } from '../../english/engine/answer-check';
import { ENGLISH_BOOKS } from '../../english/english-books';
import { mulberry32 } from '../../learning/seeded-rng';
import { planSession } from '../../learning/session-planner';
import { createSessionRecorder } from '../../learning/session-recorder';
import { firstCompletionBonus, levelRunToCommit } from '../../levels/shared/level-run-result';
import type { LevelLearning } from '../../levels/shared/level-types';
import { newId } from '../../store/new-id';
import { commitLevelRun, connectedStore } from '../progress-sync';
import { getEnglishRunLive, startEnglishRun } from './english-run';

export interface IslandRunState {
  readonly round: number;
  readonly total: number;
  readonly done: boolean;
  readonly skillId: string | null;
  readonly kind: string | null;
  readonly hintRung: number;
}

export interface IslandTestHook {
  /** Mounts a run in a full-screen test container (removes any previous one). */
  start(stage: number, seed?: number): void;
  /** The live run, or null before the first start. */
  state(): IslandRunState | null;
  /** What the current item expects, in the terms a spec taps. */
  currentAnswer(): EnglishExpected | null;
  /** Abort the running run (3B): the run resolves `{completed: false}`. */
  abort(): void;
}

export function createIslandTestHook(): IslandTestHook {
  let controller: AbortController | null = null;
  return {
    start(stage, seed) {
      const store = connectedStore();
      if (!store) throw new Error('island test hook: store not connected');
      document.getElementById('english-test-run')?.remove();
      const container = document.createElement('div');
      container.id = 'english-test-run';
      container.style.cssText = 'position:fixed;inset:0;z-index:10000';
      document.body.appendChild(container);
      controller = new AbortController();
      const sessionNo = store.nextSessionNo();
      const stats = () => store.getSnapshot().factStats;
      const rng = mulberry32(seed ?? sessionNo);
      const recorder = createSessionRecorder({
        profileId: store.getSnapshot().profile.id,
        levelId: ENGLISH_BOOKS.cec.levelId,
        sessionNo,
        stage,
        getStat: (key) => stats()[key],
        now: Date.now,
        newId,
      });
      const learning: LevelLearning = {
        stats,
        sessionNo,
        rng,
        planSession: (pool, length) =>
          planSession({ stats: stats(), pool, tables: [], sessionNo, rng, length }),
        record: (outcome) => recorder.recordQuestion(outcome),
      };
      void startEnglishRun({
        book: ENGLISH_BOOKS.cec,
        stage,
        ui: container,
        learning,
        signal: controller.signal,
      }).then((result) => {
        // R64: the run draws no finish screen (the level shell owns it), so the
        // hook shows a minimal summary line itself for the spec to assert.
        const summary = document.createElement('p');
        summary.className = 'english-test-summary';
        summary.textContent = `Bạn đúng ${result.correctCount}/${result.roundsPlayed} câu.`;
        container.appendChild(summary);
        const commit = levelRunToCommit(recorder, result);
        if (commit)
          void commitLevelRun(commit, firstCompletionBonus(ENGLISH_BOOKS.cec.levelId, commit));
      });
    },
    abort() {
      controller?.abort();
    },
    state() {
      const live = getEnglishRunLive();
      if (live.round === 0) return null;
      return {
        round: live.round,
        total: live.total,
        done: live.done,
        skillId: live.skillId,
        kind: live.item?.kind ?? null,
        hintRung: live.hintRung,
      };
    },
    currentAnswer() {
      const live = getEnglishRunLive();
      return live.item ? expectedOf(live.item) : null;
    },
  };
}
