// Runs the market: round setup with the kit step card (number pad, choices, toggles + Xong,
// Đúng/Sai) over the round's scene picture, answers checked by the reasoning round flow,
// hints, the reveal after three misses, rewards, then the hand-over to the celebration. The
// scene picture comes from the dialog-scene registry (phases 16/17); the step card renders
// the item's story/steps through its family's prompt renderer.

import { shouldOfferHint } from '../../learning/hint-ladder';
import type { QuestionOutcome } from '../../learning/session-recorder';
import { renderPromptFor } from '../../practice/family-prompt-registry';
import { familyOfSkill } from '../../practice/item-for-skill';
import { renderScene } from '../../ui/dialog-scenes/dialog-scene-registry';
import { createStepCard, type StepAnswerEvent, type StepCard } from '../../ui/kit/step-card';
import { createLevelRunTally } from '../shared/level-run-tally';
import type { LevelContext } from '../shared/level-types';
import { LAST_REASONING_RUNG, ReasoningRoundFlow } from '../shared/reasoning-round-flow';
import type { ReasoningRoundPlan } from '../shared/reasoning-round-slot';
import type { MarketPanel } from './market-panel';
import type { MarketStrings } from './market-strings';

export interface MarketRoundHooks {
  /** Round `i` (0-based) is finished: reset the zoom for the next round. */
  onRoundDone(i: number): void;
  onLevelDone(earned: { xp: number; coins: number }, stars: number): void;
}

type MarketKey = Parameters<MarketStrings>[0];
const STAGE_TEXT: Readonly<Record<number, readonly [MarketKey, MarketKey]>> = {
  1: ['stageClock', 'guideClock'],
  2: ['stageCalendar', 'guideCalendar'],
  3: ['stageMoney', 'guideMoney'],
  4: ['stageData', 'guideData'],
  5: ['stageMix', 'guideMix'],
};

export class MarketRoundController {
  private idle = 0;
  private card: StepCard | null = null;
  private flow: ReasoningRoundFlow | null = null;
  private index = 0;
  private readonly tally = createLevelRunTally();

  constructor(
    private readonly ctx: LevelContext,
    private readonly cs: MarketStrings,
    private readonly rounds: readonly ReasoningRoundPlan[],
    private readonly panel: MarketPanel,
    private readonly hooks: MarketRoundHooks,
  ) {}

  /** The round's step card (keys reach its buttons through it). */
  get cardElement(): HTMLElement | null {
    return this.card?.element ?? null;
  }

  /** The live round's plan (the test hook reads its skill and item). */
  get plan(): ReasoningRoundPlan | undefined {
    return this.rounds[this.index];
  }

  /** All rounds' plans, in run order (the test hook lists their skills). */
  get plans(): readonly ReasoningRoundPlan[] {
    return this.rounds;
  }

  /** The live round's flow (the test hook reads its hint rung and done flag). */
  get roundFlow(): ReasoningRoundFlow | null {
    return this.flow;
  }

  get round(): number {
    return this.index;
  }

  get total(): number {
    return this.rounds.length;
  }

  get done(): boolean {
    return this.index >= this.rounds.length;
  }

  /** The live step's index (the card and the flow advance together). */
  currentStep(): number {
    return this.card?.currentStep() ?? 0;
  }

  startRound(): void {
    const plan = this.plan;
    if (!plan) return;
    const [title, guide] = STAGE_TEXT[this.ctx.stage] ??
      STAGE_TEXT[1] ?? ['stageClock', 'guideClock'];
    this.panel.showRound(this.index, this.total, this.cs(title), this.cs(guide));
    this.flow = new ReasoningRoundFlow(plan, () => performance.now());
    this.card?.destroy();
    const scene = plan.item.scene;
    this.panel.sceneHost.replaceChildren();
    if (scene) {
      const svg = renderScene(scene);
      if (svg) this.panel.sceneHost.append(svg);
    }
    const render = renderPromptFor(familyOfSkill(plan.skillId));
    this.card = createStepCard(plan.item, {
      onAnswer: (event) => this.answer(event),
      onComplete: () => {},
      render,
      signal: this.ctx.disposer.signal,
    });
    this.panel.cardHost.replaceChildren(this.card.element);
    this.idle = 0;
    this.ctx.announce(`${this.cs(title)}. ${render(plan.item.story)}`);
  }

  private answer(event: StepAnswerEvent): void {
    const flow = this.flow;
    if (!flow) return;
    const result = flow.answer(event);
    if (result.verdict === 'ignored') return;
    this.idle = 0;
    if (result.verdict === 'wrong') {
      this.panel.setFeedback(this.cs('wrong'), 'gentle');
      this.panel.offerHint(shouldOfferHint(flow.hint, 0));
      this.ctx.audio.hint();
      this.ctx.announce(this.cs('wrong'));
      return;
    }
    const revealed = result.verdict === 'revealed';
    if (revealed) {
      // Third miss on this step: after the card has handled this try, show this step's answer.
      const card = this.card;
      const stepIndex = event.stepIndex;
      queueMicrotask(() => {
        if (card && card === this.card && card.currentStep() === stepIndex) card.reveal();
      });
    }
    if (!result.outcome) {
      // A new step: its own hints from rung 1 (the last step's hint no longer applies).
      const text = this.cs(revealed ? 'revealed' : 'correctStep');
      this.panel.clearHint();
      this.panel.hint.disabled = false;
      this.panel.setFeedback(text, revealed ? 'gentle' : 'success');
      if (revealed) {
        this.ctx.audio.hint();
        this.ctx.announce(text);
      } else this.ctx.audio.tone(698, 0.12);
      return;
    }
    this.finishRound(result.outcome.correct, result.outcome);
  }

  private finishRound(correct: boolean, outcome: QuestionOutcome): void {
    this.ctx.learning.record(outcome);
    const reward = this.tally.add(outcome);
    const text = this.cs(correct ? 'correct' : 'revealed');
    this.panel.setFeedback(text, correct ? 'success' : 'gentle');
    if (reward.xp > 0) {
      this.panel.popReward(this.cs('reward', { xp: reward.xp }), this.ctx.disposer.signal);
    }
    if (correct) this.ctx.audio.correct();
    else this.ctx.audio.hint();
    this.hooks.onRoundDone(this.index);
    this.panel.setAnswered(true);
  }

  hint(): void {
    const flow = this.flow;
    if (!flow || flow.done) return;
    const text = flow.takeHint();
    this.panel.showHint(flow.hint.rung, text);
    this.panel.offerHint(false);
    // The last taught rung is shown: the button is spent until the next step.
    this.panel.hint.disabled = flow.hint.rung >= LAST_REASONING_RUNG;
    this.ctx.audio.hint();
    this.ctx.announce(text);
    this.idle = 0;
  }

  next(): void {
    const flow = this.flow;
    if (!flow?.done) return;
    this.index += 1;
    if (this.done) {
      this.card?.destroy();
      this.card = null;
      this.hooks.onLevelDone(this.tally.earned(), this.tally.stars());
    } else this.startRound();
  }

  update(dt: number): void {
    const flow = this.flow;
    if (!flow || flow.done) return;
    this.idle += dt * 1000;
    if (!this.panel.hint.classList.contains('offer') && shouldOfferHint(flow.hint, this.idle)) {
      this.panel.offerHint(true);
    }
  }

  destroy(): void {
    this.card?.destroy();
    this.card = null;
  }
}
