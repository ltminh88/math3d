// One English item inside the daily dialog (Phase 6): the same tap-only
// widget, speaker and miss budget as the island run, but a single item in the
// shared dialog's chrome instead of the island run's header and footer.
// Own content only — a stored pack never joins here (the pack is island-only).
// Dynamically imported from practice-run.ts, so the widgets, the speaker and
// their CSS stay out of the daily dialog's chunk until the first English item.
import './english-widgets.css';
import { unitForSkill } from '../../english/content/units';
import type { EnglishAttempt } from '../../english/engine/answer-check';
import { checkAnswer } from '../../english/engine/answer-check';
import { englishWrongFeedback } from '../../english/engine/english-wrong-feedback';
import { generateItem } from '../../english/engine/item-generators';
import { kindsForSkill } from '../../english/engine/item-planner';
import type { EnglishItemKind, EnglishSkillId } from '../../english/english-types';
import { skillKey } from '../../learning/fact-key';
import type { Rng } from '../../learning/seeded-rng';
import type { QuestionOutcome } from '../../learning/session-recorder';
import { skillTierOf } from '../../learning/skill-tiers';
import { StepMissBudget } from '../../levels/shared/step-miss-budget';
import { appSettings } from '../../store/app-settings';
import { td } from '../daily-practice-strings';
import { skillItemHtml } from '../daily-skill-item';
import { gameState } from '../game-state';
import { byId } from '../icons';
import { announce } from '../kit/aria-announcer';
import {
  dailySpeaker,
  disposeDailySpeaker,
  speakDaily,
  takeMutedPrompt,
} from './english-daily-speaker';
import { setEnglishRunLive } from './english-run';
import { tei } from './english-strings';
import type { EnglishWidget, EnglishWidgetHooks } from './english-widget-layout';
import { mountWidget } from './english-widget-mount';

export interface EnglishDailyItemCallbacks {
  /** The item is finished (solved or revealed): record it and pay the per-answer coins. */
  onAnswered(outcome: QuestionOutcome): void;
  /** The child asked for the next item (or the results, on the last one). */
  onNext(): void;
  /** The child left mid-item (unfinished: nothing is recorded for it). */
  onLeave(): void;
}

/** Body HTML for the item: the shared daily chrome with the English badge. */
export function englishItemHtml(index: number, total: number, alreadyCounted: boolean): string {
  return skillItemHtml(index, total, alreadyCounted, `🇬🇧 ${tei('dailyBadge')}`);
}

/** Mounts one English item in the open dialog; the caller owns the dialog itself. */
export function mountEnglishDailyItem(opts: {
  skillId: EnglishSkillId;
  box: number;
  isLast: boolean;
  rng: Rng;
  signal: AbortSignal;
  cb: EnglishDailyItemCallbacks;
}): { destroy(): void } {
  const { skillId, box, isLast, rng, signal, cb } = opts;
  const unit = unitForSkill(skillId);
  const kinds = kindsForSkill(skillId);
  const kind = kinds[Math.floor(rng() * kinds.length)] as EnglishItemKind;
  const item = generateItem(skillId, kind, skillTierOf({ box }), unit, rng);
  const budget = new StepMissBudget();
  const startedAt = performance.now();
  const wrongAnswers: number[] = [];
  let recorded = false;
  let widget: EnglishWidget | null = null;

  const root = byId('dialog-content');
  const stepsHost = root.querySelector('.daily-steps') as HTMLElement;
  const feedbackEl = root.querySelector('.feedback') as HTMLElement;
  const hintButton = root.querySelector('.daily-hint') as HTMLButtonElement;
  const nextButton = root.querySelector('.daily-next') as HTMLButtonElement;
  const leaveButton = root.querySelector('.daily-leave') as HTMLButtonElement;
  const say = (text: string, tone: 'success' | 'gentle' | '' = '') => {
    feedbackEl.textContent = text;
    feedbackEl.className = `feedback ${tone}`.trim();
    announce(text);
  };

  // The test hook reads the live item for its answer (`window.__game.island`,
  // `currentAnswer()`); the island run and the daily run never play at once.
  setEnglishRunLive({ round: 1, total: 1, done: false, skillId, item, hintRung: 0 });
  const clearLive = () =>
    setEnglishRunLive({ round: 1, total: 1, done: true, skillId: null, item: null, hintRung: 0 });

  if (signal.aborted) disposeDailySpeaker();
  else signal.addEventListener('abort', disposeDailySpeaker, { once: true });

  // The finish chrome mirrors daily-skill-item.ts: record once (solved or
  // revealed), pay +5 xu on a solve, then show Next.
  const finish = (correct: boolean): void => {
    if (recorded) return;
    recorded = true;
    const result = budget.result();
    cb.onAnswered({
      factKey: skillKey(skillId),
      ms: Math.round(performance.now() - startedAt),
      correct,
      firstTry: result.firstTry,
      usedHint: result.usedHint,
      wrongAnswers,
    });
    say(tei(correct ? 'correct' : 'revealed'), correct ? 'success' : 'gentle');
    hintButton.disabled = true;
    clearLive();
    if (correct) {
      gameState.audio.correct();
      const pop = document.createElement('b');
      pop.className = 'reward-pop';
      pop.textContent = '+5 xu';
      nextButton.append(pop);
      pop.addEventListener('animationend', () => pop.remove());
    } else gameState.audio.hint();
    nextButton.hidden = false;
    nextButton.textContent = isLast ? td('seeResult') : td('next');
    nextButton.focus({ preventScroll: true });
  };

  const hooks: EnglishWidgetHooks = {
    onAttempt: (attempt: EnglishAttempt) => {
      const checked = checkAnswer(item, attempt);
      if (checked.correct) return { correct: true, reveal: false };
      if (checked.wrongPickIndex !== null) wrongAnswers.push(checked.wrongPickIndex);
      if (budget.miss()) {
        widget?.revealAnswer();
        widget?.showGloss();
        hintButton.disabled = true;
        finish(false);
        return { correct: false, reveal: true };
      }
      say(tei(englishWrongFeedback(item)), 'gentle');
      hintButton.disabled = false;
      gameState.audio.hint();
      return { correct: false, reveal: false };
    },
    onSolved: () => {
      widget?.showGloss();
      finish(true);
    },
  };
  // Tier 3 listen-only: hide the word once audio exists for it (as on the island).
  const hideWord =
    item.kind === 'listen-pick-picture' &&
    item.listenOnly === true &&
    dailySpeaker().isAvailable(item.word);
  widget = mountWidget(
    item,
    hooks,
    (text) => void speakDaily(text, (notice) => say(tei(notice))),
    hideWord,
  );
  stepsHost.appendChild(widget.element);
  if (!appSettings.get().sound && takeMutedPrompt()) {
    say(tei('soundOff'));
  }

  const hint = () => {
    if (!widget || nextButton.hidden === false) return;
    const rung = budget.takeHint(2);
    setEnglishRunLive({ round: 1, total: 1, done: false, skillId, item, hintRung: rung });
    if (rung === 1) say(tei('hintEncourage'));
    else if (rung === 2) {
      widget.helpOnce();
      say(tei('hintNarrowed'));
    }
    hintButton.disabled = budget.hint.rung >= 2;
    gameState.audio.hint();
  };
  hintButton.disabled = true;
  hintButton.addEventListener('click', hint);
  nextButton.addEventListener('click', () => cb.onNext());
  leaveButton.addEventListener('click', () => cb.onLeave());
  // Announce the badge + the widget's cue line — never the item's text: the
  // cue is the instruction ("tap the picture for this word"), while speaking
  // the word itself would give a listen-only item away.
  announce(
    `${tei('dailyBadge')} ${widget.element.querySelector('.english-cue')?.textContent ?? ''}`,
  );

  return {
    destroy: () => {
      widget?.destroy();
      clearLive();
    },
  };
}
