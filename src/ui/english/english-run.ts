// English run (Phase 1B + 3B + 2A, split in two-modes Phase 1): the run
// the island level shell (1A) calls. Eight rounds: the planner picks the
// weakest skill, the round builds the item (or a stored pack item joins),
// a tap-only widget renders it, the miss budget reveals after 3 misses,
// hints narrow the choices, and every round records under `sk:en-*`.
// 2A: each stage drills its own unit. R64: no finish screen — the run
// resolves after round 8; the level shell owns the ending screen. 3B:
// "🔊 Nghe" speaks the item, "Phụ huynh" unlocks the book pack, `signal`
// aborts mid-run. Round: `english-run-round.ts`; shell: `english-run-widgets.ts`; speech: `english-run-speech.ts`.
// R143: the widget CSS lives here (not only in the daily adapter) — the
// island run never loaded it, so the bank/slots rendered unstyled and the
// sentence tiles stacked one per row.
import './english-widgets.css';
import { createItemPlanner, type PlannedRound } from '../../english/engine/item-planner';
import type { EnglishBook } from '../../english/english-books';
import type { EnglishItem, EnglishPack } from '../../english/english-types';
import { fetchEnglishPack } from '../../english/pack/pack-client';
import { openPackStore } from '../../english/pack/pack-storage';
import type { LevelLearning } from '../../levels/shared/level-types';
import { appSettings } from '../../store/app-settings';
import { playEnglishRound } from './english-run-round';
import { createEnglishRunSpeech } from './english-run-speech';
import { buildEnglishRunShell } from './english-run-widgets';
import { createBrowserEnglishSpeaker } from './english-speaker';
import { tei } from './english-strings';
import { openPackUnlockDialog } from './pack-unlock-dialog';

/** What the island level shell hands the run: its book, stage, DOM root and learning services. */
export interface EnglishRunPort {
  /** The book this run drills (units, skills and pack key come from it). */
  readonly book: EnglishBook;
  /** Stage of this run (1-based, 1–8). */
  readonly stage: number;
  /** Overlay root for the run's DOM; removed on exit. */
  readonly ui: HTMLElement;
  /** Leitner stats + recorder (answers land under `sk:en-*`). */
  readonly learning: LevelLearning;
  /**
   * Abort mid-run (R57.1, 3B): the shell passes this from the level shell.
   * On abort the widget is removed, the run resolves `{completed: false}`,
   * and the in-progress round is not recorded.
   */
  readonly signal?: AbortSignal;
}

export interface EnglishRunResult {
  /** All rounds played: the level counts as completed (stars, bonus). */
  readonly completed: boolean;
  /** Rounds played in this run (8 in a full run). */
  readonly roundsPlayed: number;
  readonly correctCount: number;
}

export const ENGLISH_ROUNDS = 8;

/** Live run state for the test hook (`window.__game.island`). */
export interface EnglishRunLive {
  readonly round: number;
  readonly total: number;
  readonly done: boolean;
  readonly skillId: string | null;
  readonly item: EnglishItem | null;
  readonly hintRung: number;
}

let live: EnglishRunLive = {
  round: 0,
  total: ENGLISH_ROUNDS,
  done: false,
  skillId: null,
  item: null,
  hintRung: 0,
};

export function getEnglishRunLive(): EnglishRunLive {
  return live;
}

/** Daily practice (Phase 6) plays one English item outside the island run
 * and reports it here for the same test hook. The runs never play at once. */
export function setEnglishRunLive(next: EnglishRunLive): void {
  live = next;
}

export async function startEnglishRun(port: EnglishRunPort): Promise<EnglishRunResult> {
  const unit = port.book.unitForStage(port.stage);
  const learning = port.learning;
  const planner = createItemPlanner({
    skills: unit.skillIds,
    stats: learning.stats(),
    seed: learning.sessionNo,
  });
  const doc = port.ui.ownerDocument ?? document;
  // 3B: the speaker reads the game's sound setting; the pack loads in the
  // background so the first item mounts at once.
  const speaker = createBrowserEnglishSpeaker(() => !appSettings.get().sound);
  const packStorePromise = openPackStore(port.book.packKey);
  let packItems: EnglishItem[] = [];
  const usedPack = new Set<number>();

  const shell = buildEnglishRunShell(doc, {
    onParentUnlock: () => {
      openPackUnlockDialog({
        mount: port.ui,
        doc,
        unlock: async (passphrase) => {
          const store = await packStorePromise;
          const result = await fetchEnglishPack(passphrase, {
            stage: port.stage,
            book: port.book.id,
          });
          if (!result.ok) {
            if (result.error === 'bad-passphrase') await store.clearPassphrase();
            return { ok: false, error: result.error };
          }
          await store.save(passphrase, result.pack);
          return { ok: true, pack: result.pack };
        },
        onUnlocked: (pack: EnglishPack) => {
          packItems = [...packItems, ...pack.items];
          shell.root.dataset.packLoaded = 'true';
          shell.say(tei('packLoaded'));
        },
      });
    },
  });
  port.ui.appendChild(shell.root);
  const speech = createEnglishRunSpeech(speaker, shell.say);
  void packStorePromise.then(async (store) => {
    const stored = await store.load();
    if (stored) {
      packItems = [...stored.pack.items];
      shell.root.dataset.packLoaded = 'true';
    }
  });

  let correctCount = 0;
  let completedRounds = 0;
  let last: PlannedRound | null = null;
  let aborted = false;
  const onAbort = () => {
    aborted = true;
    shell.resolveNext();
  };
  port.signal?.addEventListener('abort', onAbort, { once: true });
  if (port.signal?.aborted) aborted = true;

  for (let round = 0; round < ENGLISH_ROUNDS; round++) {
    if (aborted) break;
    const played = await playEnglishRound({
      round,
      total: ENGLISH_ROUNDS,
      planner,
      last,
      unit,
      learning,
      packItems,
      usedPack,
      shell,
      speaker,
      speech,
      aborted: () => aborted,
      setLive: (next) => {
        live = next;
      },
    });
    last = played.last;
    if (played.aborted) break;
    completedRounds += 1;
    if (played.correct) correctCount += 1;
  }

  if (aborted) {
    port.signal?.removeEventListener('abort', onAbort);
    speaker.dispose();
    live = {
      round: completedRounds,
      total: ENGLISH_ROUNDS,
      done: true,
      skillId: null,
      item: null,
      hintRung: 0,
    };
    shell.root.remove();
    return { completed: false, roundsPlayed: completedRounds, correctCount };
  }

  live = {
    round: ENGLISH_ROUNDS,
    total: ENGLISH_ROUNDS,
    done: true,
    skillId: null,
    item: null,
    hintRung: 0,
  };
  // R64: no finish screen — resolve at once; clear the controls so nothing stale stays tappable.
  shell.root.textContent = '';
  port.signal?.removeEventListener('abort', onAbort);
  speaker.dispose();
  return { completed: true, roundsPlayed: ENGLISH_ROUNDS, correctCount };
}
