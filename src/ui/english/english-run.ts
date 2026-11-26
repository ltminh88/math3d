// English run (Phase 1B + 3B + 2A): the run the island level shell (1A) calls.
// Eight rounds: the planner picks the weakest skill, the generator builds
// the item (or a stored pack item joins when skill + kind match), a tap-only
// widget renders it, the miss budget reveals after 3 misses, hints narrow the
// choices, and every round records under `sk:en-*`.
// 2A: each stage drills its own unit (`content/units.ts`) — the engine reads
// its pool from the unit, not from the stage.
// R64: the run draws no finish screen and resolves right after round 8 — the
// level shell owns the ending screen (stars, reward, "Về cổng").
// 3B: "🔊 Nghe" speaks the item (clip → Web Speech → read item), the "Phụ huynh"
// button unlocks the book pack, and `signal` lets the shell abort mid-run.
import './english-widgets.css';
import { unitForStage } from '../../english/content/units';
import type { EnglishAttempt } from '../../english/engine/answer-check';
import { checkAnswer } from '../../english/engine/answer-check';
import { englishWrongFeedback } from '../../english/engine/english-wrong-feedback';
import { generateItem } from '../../english/engine/item-generators';
import { createItemPlanner, type PlannedRound } from '../../english/engine/item-planner';
import type { EnglishItem, EnglishPack, EnglishUnit } from '../../english/english-types';
import { fetchEnglishPack } from '../../english/pack/pack-client';
import { openPackStore } from '../../english/pack/pack-storage';
import { skillKey } from '../../learning/fact-key';
import type { QuestionOutcome } from '../../learning/session-recorder';
import { skillTierOf } from '../../learning/skill-tiers';
import type { LevelLearning } from '../../levels/shared/level-types';
import { StepMissBudget } from '../../levels/shared/step-miss-budget';
import { appSettings } from '../../store/app-settings';
import { announce } from '../kit/aria-announcer';
import { createUiButton } from '../kit/ui-button';
import { createBrowserEnglishSpeaker } from './english-speaker';
import { tei } from './english-strings';
import type {
  EnglishWidget,
  EnglishWidgetHooks,
  EnglishWidgetOptions,
} from './english-widget-layout';
import { mountFillChoice } from './fill-choice';
import { mountLetterChoice } from './letter-choice';
import { openPackUnlockDialog } from './pack-unlock-dialog';
import { mountPictureChoiceGrid } from './picture-choice-grid';
import { mountTapPairMatcher } from './tap-pair-matcher';
import { mountWordTileOrder } from './word-tile-order';

/** What the island level shell hands the run: its stage, DOM root and learning services. */
export interface EnglishRunPort {
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

/** Word → gloss pairs the widget reveals after the item is done. */
function glossesFor(item: EnglishItem, unit: EnglishUnit): { word: string; vi: string }[] {
  const byWord = new Map(unit.words.map((w) => [w.word, w.gloss]));
  const singular = (word: string): string =>
    byWord.has(word) ? word : word.endsWith('s') ? word.slice(0, -1) : word;
  const words: string[] =
    item.kind === 'listen-pick-picture'
      ? [item.word]
      : item.kind === 'letter-pick'
        ? [item.prompt]
        : item.kind === 'fill-pattern'
          ? [item.sentence[item.blankIndex] as string]
          : item.kind === 'match-pairs'
            ? item.pairs.map((p) => p.word)
            : item.words.map(singular).filter((w) => byWord.has(w));
  const out: { word: string; vi: string }[] = [];
  for (const word of words) {
    const key = singular(word);
    const vi = byWord.get(key);
    if (vi && !out.some((g) => g.word === key)) out.push({ word: key, vi });
  }
  return out;
}

/** The text "🔊 Nghe" speaks for each kind (the word, or the whole sentence). */
function speakTextFor(item: EnglishItem): string {
  switch (item.kind) {
    case 'listen-pick-picture':
      return item.word;
    case 'letter-pick':
      return item.prompt;
    case 'fill-pattern':
      return item.sentence.join(' ');
    case 'match-pairs':
      return item.pairs.map((p) => p.word).join(', ');
    case 'order-words':
      return item.words.join(' ');
  }
}

function mountWidget(
  item: EnglishItem,
  hooks: EnglishWidgetHooks,
  unit: EnglishUnit,
  onSpeak: (text: string) => void,
  hideWord: boolean,
): EnglishWidget {
  const options: EnglishWidgetOptions = {
    glosses: glossesFor(item, unit),
    speak: { onSpeak: () => onSpeak(speakTextFor(item)) },
    hideWord,
  };
  switch (item.kind) {
    case 'listen-pick-picture':
      return mountPictureChoiceGrid(item, hooks, options);
    case 'letter-pick':
      return mountLetterChoice(item, hooks, options);
    case 'fill-pattern':
      return mountFillChoice(item, hooks, options);
    case 'match-pairs':
      return mountTapPairMatcher(item, hooks, options);
    case 'order-words':
      return mountWordTileOrder(item, hooks, options);
  }
}

export async function startEnglishRun(port: EnglishRunPort): Promise<EnglishRunResult> {
  const unit = unitForStage(port.stage);
  const learning = port.learning;
  const planner = createItemPlanner({
    skills: unit.skillIds,
    stats: learning.stats(),
    seed: learning.sessionNo,
  });
  const doc = port.ui.ownerDocument ?? document;
  // 3B: the speaker reads the game's sound setting; the pack loads in the
  // background so the first item mounts at once (a stored pack joins from
  // the next round — the pool is read per round).
  const speaker = createBrowserEnglishSpeaker(() => !appSettings.get().sound);
  const packStorePromise = openPackStore();
  let packItems: EnglishItem[] = [];
  const usedPack = new Set<number>();
  void packStorePromise.then(async (store) => {
    const stored = await store.load();
    if (stored) {
      packItems = [...stored.pack.items];
      root.dataset.packLoaded = 'true';
    }
  });

  const root = doc.createElement('div');
  root.className = 'english-run';
  const header = doc.createElement('div');
  header.className = 'english-run__header';
  const title = doc.createElement('h2');
  title.className = 'english-run__title';
  title.textContent = tei('runTitle');
  const roundEl = doc.createElement('p');
  roundEl.className = 'english-run__round';
  const parentButton = createUiButton(
    {
      label: tei('parentUnlock'),
      variant: 'secondary',
      onClick: () => {
        openPackUnlockDialog({
          mount: port.ui,
          doc,
          unlock: async (passphrase) => {
            const store = await packStorePromise;
            const result = await fetchEnglishPack(passphrase, { stage: port.stage });
            if (!result.ok) {
              if (result.error === 'bad-passphrase') await store.clearPassphrase();
              return { ok: false, error: result.error };
            }
            await store.save(passphrase, result.pack);
            return { ok: true, pack: result.pack };
          },
          onUnlocked: (pack: EnglishPack) => {
            packItems = [...packItems, ...pack.items];
            root.dataset.packLoaded = 'true';
            say(tei('packLoaded'));
          },
        });
      },
    },
    doc,
  );
  parentButton.classList.add('english-parent-unlock');
  header.append(title, roundEl, parentButton);
  const itemArea = doc.createElement('div');
  itemArea.className = 'english-run__item';
  const feedback = doc.createElement('p');
  feedback.className = 'english-feedback';
  feedback.setAttribute('role', 'status');
  const footer = doc.createElement('div');
  footer.className = 'english-run__footer';
  const hintButton = createUiButton(
    { label: `💡 ${tei('hint')}`, variant: 'secondary', onClick: () => {} },
    doc,
  );
  hintButton.classList.add('english-hint');
  const nextButton = createUiButton({ label: tei('next'), onClick: () => {} }, doc);
  nextButton.classList.add('english-next');
  nextButton.hidden = true;
  footer.append(hintButton, nextButton);
  root.append(header, itemArea, feedback, footer);
  port.ui.appendChild(root);

  const say = (text: string) => {
    feedback.textContent = text;
    announce(text, doc);
  };

  let correctCount = 0;
  let completedRounds = 0;
  let last: PlannedRound | null = null;
  let resolveRound: (() => void) | null = null;
  let aborted = false;
  const onAbort = () => {
    aborted = true;
    resolveRound?.();
  };
  nextButton.addEventListener('click', () => resolveRound?.());
  port.signal?.addEventListener('abort', onAbort, { once: true });
  if (port.signal?.aborted) aborted = true;

  // 3B: one "bật âm thanh" prompt per run while muted, one parent notice
  // per run when an item has no audio at all. Both go through the feedback
  // line so the child (and the parent) never meets a silent item unawares.
  let mutedPromptShown = false;
  let audioNoticeShown = false;
  let unlockPrimed = false;
  const onSpeak = async (text: string) => {
    if (!unlockPrimed) {
      unlockPrimed = true;
      speaker.unlock();
    }
    const result = await speaker.speak(text);
    if (!result.played && result.reason === 'muted') say(tei('soundOff'));
    else if (!result.played && result.reason === 'unavailable' && !audioNoticeShown) {
      audioNoticeShown = true;
      say(tei('noAudio'));
    }
  };

  for (let round = 0; round < ENGLISH_ROUNDS; round++) {
    if (aborted) break;
    const planned = planner.next(last);
    last = planned;
    const tier = skillTierOf(learning.stats()[`sk:${planned.skillId}`]);
    // A stored pack item joins when its skill + kind match the planned round.
    const packIndex = packItems.findIndex(
      (p, i) => !usedPack.has(i) && p.skillId === planned.skillId && p.kind === planned.kind,
    );
    let item: EnglishItem;
    if (packIndex >= 0) {
      usedPack.add(packIndex);
      item = packItems[packIndex] as EnglishItem;
    } else {
      item = generateItem(planned.skillId, planned.kind, tier, unit, learning.rng);
    }
    const budget = new StepMissBudget();
    const startedAt = performance.now();
    const wrongAnswers: number[] = [];
    roundEl.textContent = tei('roundOf', { n: round + 1, total: ENGLISH_ROUNDS });
    live = {
      round: round + 1,
      total: ENGLISH_ROUNDS,
      done: false,
      skillId: planned.skillId,
      item,
      hintRung: 0,
    };
    feedback.textContent = '';
    nextButton.hidden = true;
    hintButton.disabled = true;

    let widget: EnglishWidget | null = null;
    const hooks: EnglishWidgetHooks = {
      onAttempt: (attempt: EnglishAttempt) => {
        const checked = checkAnswer(item, attempt);
        if (checked.correct) return { correct: true, reveal: false };
        if (checked.wrongPickIndex !== null) wrongAnswers.push(checked.wrongPickIndex);
        if (budget.miss()) {
          widget?.revealAnswer();
          widget?.showGloss();
          say(tei('revealed'));
          hintButton.disabled = true;
          nextButton.hidden = false;
          return { correct: false, reveal: true };
        }
        say(tei(englishWrongFeedback(item)));
        hintButton.disabled = false;
        return { correct: false, reveal: false };
      },
      onSolved: () => {
        say(tei('correct'));
        widget?.showGloss();
        hintButton.disabled = true;
        nextButton.hidden = false;
      },
    };
    // Tier 3 listen-only (3B): hide the word once audio exists for it.
    const hideWord =
      item.kind === 'listen-pick-picture' &&
      item.listenOnly === true &&
      speaker.isAvailable(item.word);
    widget = mountWidget(item, hooks, unit, onSpeak, hideWord);
    itemArea.appendChild(widget.element);
    if (!appSettings.get().sound && !mutedPromptShown) {
      mutedPromptShown = true;
      say(tei('soundOff'));
    }

    hintButton.onclick = () => {
      if (!widget || nextButton.hidden === false) return;
      const rung = budget.takeHint(2);
      live = { ...live, hintRung: rung };
      if (rung === 1) say(tei('hintEncourage'));
      else if (rung === 2) {
        widget.helpOnce();
        say(tei('hintNarrowed'));
      }
      hintButton.disabled = budget.hint.rung >= 2;
    };

    await new Promise<void>((resolve) => {
      resolveRound = resolve;
    });
    resolveRound = null;
    // Aborted mid-round: the round is not recorded.
    if (aborted) {
      widget.destroy();
      itemArea.textContent = '';
      break;
    }

    const result = budget.result();
    const outcome: QuestionOutcome = {
      factKey: skillKey(planned.skillId),
      ms: Math.round(performance.now() - startedAt),
      correct: result.correct,
      firstTry: result.firstTry,
      usedHint: result.usedHint,
      wrongAnswers,
    };
    learning.record(outcome);
    completedRounds += 1;
    if (result.correct) correctCount += 1;
    widget.destroy();
    itemArea.textContent = '';
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
    root.remove();
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
  // R64: no finish screen — resolve at once so the level shell can show its
  // own ending card. Clear the run's controls so nothing stale stays tappable.
  root.textContent = '';
  port.signal?.removeEventListener('abort', onAbort);
  speaker.dispose();
  return { completed: true, roundsPlayed: ENGLISH_ROUNDS, correctCount };
}
