// One English run round (two-modes Phase 1, split from english-run.ts,
// move-only): plan the weakest skill, take a stored pack item when skill +
// kind match, else generate from the unit; mount the tap-only widget, run
// the miss budget (reveal after 3 misses, hints narrow the choices), and
// record the outcome. An abort mid-round destroys the widget, records
// nothing, and reports `aborted: true`.
import type { EnglishAttempt } from '../../english/engine/answer-check';
import { checkAnswer } from '../../english/engine/answer-check';
import { englishWrongFeedback } from '../../english/engine/english-wrong-feedback';
import { generateItem } from '../../english/engine/item-generators';
import type { ItemPlanner, PlannedRound } from '../../english/engine/item-planner';
import type { EnglishItem, EnglishUnit } from '../../english/english-types';
import { skillKey } from '../../learning/fact-key';
import type { QuestionOutcome } from '../../learning/session-recorder';
import { skillTierOf } from '../../learning/skill-tiers';
import type { LevelLearning } from '../../levels/shared/level-types';
import { StepMissBudget } from '../../levels/shared/step-miss-budget';
import { appSettings } from '../../store/app-settings';
import type { EnglishRunLive } from './english-run';
import type { EnglishRunSpeech } from './english-run-speech';
import type { EnglishRunShell } from './english-run-widgets';
import type { EnglishSpeaker } from './english-speaker';
import { tei } from './english-strings';
import type { EnglishWidget, EnglishWidgetHooks } from './english-widget-layout';
import { mountWidget } from './english-widget-mount';

export interface EnglishRoundContext {
  /** 0-based round index. */
  readonly round: number;
  readonly total: number;
  readonly planner: ItemPlanner;
  readonly last: PlannedRound | null;
  readonly unit: EnglishUnit;
  readonly learning: LevelLearning;
  readonly packItems: EnglishItem[];
  readonly usedPack: Set<number>;
  readonly shell: EnglishRunShell;
  readonly speaker: EnglishSpeaker;
  readonly speech: EnglishRunSpeech;
  readonly aborted: () => boolean;
  readonly setLive: (next: EnglishRunLive) => void;
}

export type EnglishRoundResult =
  | { readonly aborted: true; readonly last: PlannedRound }
  | { readonly aborted: false; readonly last: PlannedRound; readonly correct: boolean };

export async function playEnglishRound(ctx: EnglishRoundContext): Promise<EnglishRoundResult> {
  const { shell, learning } = ctx;
  const planned = ctx.planner.next(ctx.last);
  const tier = skillTierOf(learning.stats()[`sk:${planned.skillId}`]);
  // A stored pack item joins when its skill + kind match the planned round.
  const packIndex = ctx.packItems.findIndex(
    (p, i) => !ctx.usedPack.has(i) && p.skillId === planned.skillId && p.kind === planned.kind,
  );
  let item: EnglishItem;
  if (packIndex >= 0) {
    ctx.usedPack.add(packIndex);
    item = ctx.packItems[packIndex] as EnglishItem;
  } else {
    item = generateItem(planned.skillId, planned.kind, tier, ctx.unit, learning.rng);
  }
  const budget = new StepMissBudget();
  const startedAt = performance.now();
  const wrongAnswers: number[] = [];
  shell.roundEl.textContent = tei('roundOf', { n: ctx.round + 1, total: ctx.total });
  ctx.setLive({
    round: ctx.round + 1,
    total: ctx.total,
    done: false,
    skillId: planned.skillId,
    item,
    hintRung: 0,
  });
  shell.feedback.textContent = '';
  shell.nextButton.hidden = true;
  shell.hintButton.disabled = true;

  let widget: EnglishWidget | null = null;
  const hooks: EnglishWidgetHooks = {
    onAttempt: (attempt: EnglishAttempt) => {
      const checked = checkAnswer(item, attempt);
      if (checked.correct) return { correct: true, reveal: false };
      if (checked.wrongPickIndex !== null) wrongAnswers.push(checked.wrongPickIndex);
      if (budget.miss()) {
        widget?.revealAnswer();
        widget?.showGloss();
        shell.say(tei('revealed'));
        shell.hintButton.disabled = true;
        shell.nextButton.hidden = false;
        return { correct: false, reveal: true };
      }
      shell.say(tei(englishWrongFeedback(item)));
      shell.hintButton.disabled = false;
      return { correct: false, reveal: false };
    },
    onSolved: () => {
      shell.say(tei('correct'));
      widget?.showGloss();
      shell.hintButton.disabled = true;
      shell.nextButton.hidden = false;
    },
  };
  // Tier 3 listen-only (3B): hide the word once audio exists for it.
  const hideWord =
    item.kind === 'listen-pick-picture' &&
    item.listenOnly === true &&
    ctx.speaker.isAvailable(item.word);
  widget = mountWidget(item, hooks, ctx.speech.onSpeak, hideWord);
  shell.itemArea.appendChild(widget.element);
  if (!appSettings.get().sound) ctx.speech.promptMutedOnce();

  shell.hintButton.onclick = () => {
    if (!widget || shell.nextButton.hidden === false) return;
    const rung = budget.takeHint(2);
    ctx.setLive({
      round: ctx.round + 1,
      total: ctx.total,
      done: false,
      skillId: planned.skillId,
      item,
      hintRung: rung,
    });
    if (rung === 1) shell.say(tei('hintEncourage'));
    else if (rung === 2) {
      widget.helpOnce();
      shell.say(tei('hintNarrowed'));
    }
    shell.hintButton.disabled = budget.hint.rung >= 2;
  };

  await shell.waitNext();
  // Aborted mid-round: the round is not recorded.
  if (ctx.aborted()) {
    widget.destroy();
    shell.itemArea.textContent = '';
    return { aborted: true, last: planned };
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
  widget.destroy();
  shell.itemArea.textContent = '';
  return { aborted: false, last: planned, correct: result.correct };
}
