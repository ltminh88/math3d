// Runs the valley: sets up each round's board (figure, blocks, chips, tap targets, camera frame),
// takes the opening action (stone, centre, ê-ke corner, block), then the item's steps on the step
// card; board taps also choose card options. Hints, rewards, the garden stone and the hand-over
// to the celebration. Rules live in valley-round-flow.ts; the board look in valley-board-views.ts.
import { renderGeometryPrompt } from '../../geometry/geometry-strings';
import { shouldOfferHint } from '../../learning/hint-ladder';
import { playableSteps } from '../../reasoning/reasoning-step-answers';
import { createStepCard, type StepAnswerEvent, type StepCard } from '../../ui/kit/step-card';
import { createLevelRunTally } from '../shared/level-run-tally';
import type { LevelContext } from '../shared/level-types';
import type { ValleyBoardViews } from './valley-board-views';
import { valleyHint } from './valley-hints';
import type { ValleyTarget } from './valley-layout-types';
import type { ValleyPanel } from './valley-panel';
import { VALLEY_HINT_RUNGS, type ValleyRoundFlow } from './valley-round-flow';
import { answerPrompt, ekeText, foundText, roundPrompt } from './valley-round-texts';
import { type ValleyStrings, valleyText } from './valley-strings';

export interface ValleyRoundHooks {
  onRoundDone(index: number): void;
  onLevelDone(earned: { xp: number; coins: number }, stars: number): void;
}

export class ValleyRoundController {
  card: StepCard | null = null;
  private idle = 0;
  private readonly tally = createLevelRunTally();

  constructor(
    private readonly ctx: LevelContext,
    private readonly vs: ValleyStrings,
    readonly flow: ValleyRoundFlow,
    private readonly panel: ValleyPanel,
    readonly board: ValleyBoardViews,
    private readonly hooks: ValleyRoundHooks,
  ) {
    // Toggles on the card (multi-select) light up the matching shapes / blocks on the board.
    panel.cardHost.addEventListener('click', () => this.board.syncSelection(this.card), {
      signal: ctx.disposer.signal,
    });
  }

  startRound(): void {
    const round = this.flow.round;
    if (!round) return;
    this.card?.destroy();
    this.card = null;
    this.idle = 0;
    this.board.setRound(round);
    const prompt = roundPrompt(this.vs, round);
    const story = renderGeometryPrompt(round.item.story);
    this.panel.showRound(this.flow.index, this.flow.rounds.length, round.kind, prompt, story);
    if (this.flow.phase === 'steps') this.mountCard();
    this.board.refresh(true);
    this.ctx.announce(`${prompt} ${story}`);
  }

  /** A wrong tap or answer: gentle words, a hint offered. */
  private miss(text: string): void {
    this.panel.setFeedback(text, 'gentle');
    this.panel.offerHint(true);
    this.ctx.audio.hint();
    this.ctx.announce(text);
  }

  /** A tap on a board target (button proxy over a point, corner, shape or block). */
  tap(id: string): void {
    const round = this.flow.round;
    const target = round?.layout.targets.find((t) => t.id === id);
    if (!round || !target || this.flow.phase === 'complete') return;
    this.idle = 0;
    if (this.flow.phase === 'action') {
      const verdict = this.flow.tap(id);
      if (verdict === 'wrong') this.miss(this.vs('notThere'));
      else if (verdict !== 'ignored') {
        const right =
          verdict === 'right'
            ? target
            : (round.layout.targets.find((t) => t.right) as ValleyTarget);
        this.completeAction(right, verdict === 'revealed');
      }
    } else if (target.kind === 'corner') {
      this.board.layEke(target);
      this.panel.setFeedback(ekeText(this.vs, target), target.fits ? 'success' : '');
      this.ctx.announce(ekeText(this.vs, target));
    } else if (target.option) {
      this.board.chooseOption(this.card, round.item, target.option);
    } else if (target.kind === 'block') {
      this.board.toggleLift(0);
    }
    this.board.refresh(!this.roundOver());
  }

  private roundOver(): boolean {
    return this.flow.phase === 'complete';
  }

  private completeAction(target: ValleyTarget, revealed: boolean): void {
    const round = this.flow.round;
    if (!round) return;
    this.board.pick(target.id);
    if (round.layout.action === 'set-square') this.board.layEke(target);
    if (round.layout.action === 'lift') this.board.toggleLift(0);
    const text = foundText(this.vs, round, target);
    this.panel.setFeedback(text, 'success');
    this.ctx.audio.tone(698, 0.12);
    this.ctx.announce(text);
    this.mountCard();
    if (revealed) queueMicrotask(() => this.revealAll());
  }

  private mountCard(): void {
    const round = this.flow.round;
    if (!round || this.card) return;
    this.panel.story.hidden = true;
    this.panel.prompt.textContent = answerPrompt(this.vs, round);
    this.card = createStepCard(round.item, {
      render: renderGeometryPrompt,
      onAnswer: (event) => this.onAnswer(event),
      onComplete: () => this.finishRound(),
    });
    this.panel.cardHost.replaceChildren(this.card.element);
  }

  private onAnswer(event: StepAnswerEvent): void {
    this.idle = 0;
    const verdict = this.flow.answer(event.correct, event.answer);
    if (verdict === 'wrong') this.miss(this.vs('wrong'));
    else if (verdict === 'revealed') {
      // After the card's own handling of this try (it does not advance on a wrong answer).
      queueMicrotask(() => this.revealAll());
    } else if (verdict === 'correct') {
      this.panel.setFeedback(this.vs('stepRight'), 'success');
      this.ctx.audio.tone(698, 0.12);
    }
  }

  /** Third miss: every remaining step shows its answer, the round ends as not correct. */
  private revealAll(): void {
    const steps = this.flow.round ? playableSteps(this.flow.round.item).length : 0;
    for (let i = 0; i < steps && this.flow.phase !== 'complete'; i++) this.card?.reveal();
  }

  private finishRound(): void {
    if (this.flow.phase === 'complete') return;
    const outcome = this.flow.completeSteps();
    this.ctx.learning.record(outcome);
    const reward = this.tally.add(outcome);
    const text = this.vs(outcome.correct ? 'correct' : 'revealed');
    this.panel.setFeedback(text, outcome.correct ? 'success' : 'gentle');
    if (reward.xp > 0)
      this.panel.popReward(this.vs('reward', { xp: reward.xp }), this.ctx.disposer.signal);
    if (outcome.correct) this.ctx.audio.correct();
    else this.ctx.audio.hint();
    this.hooks.onRoundDone(this.flow.index);
    this.board.refresh(false);
    this.panel.setAnswered(true);
    this.ctx.announce(text);
  }

  hint(): void {
    const round = this.flow.round;
    if (!round || this.flow.phase === 'complete' || this.flow.hint.rung >= VALLEY_HINT_RUNGS)
      return;
    const rung = this.flow.takeHint() as 1 | 2 | 3;
    const hint = valleyHint(round.item, rung);
    const text = valleyText(this.vs, hint.key);
    this.panel.showHint(text, rung, rung >= VALLEY_HINT_RUNGS);
    if (hint.aid) this.board.showAid();
    this.ctx.audio.hint();
    this.ctx.announce(text);
    this.idle = 0;
  }

  next(): void {
    if (this.flow.phase !== 'complete') return;
    this.flow.next();
    if (this.flow.done) this.hooks.onLevelDone(this.tally.earned(), this.tally.stars());
    else this.startRound();
  }

  update(dt: number): void {
    this.board.update(dt);
    if (this.flow.done || this.flow.phase === 'complete') return;
    this.idle += dt * 1000;
    const offer =
      this.flow.hint.rung < VALLEY_HINT_RUNGS && shouldOfferHint(this.flow.hint, this.idle);
    if (offer && !this.panel.hint.classList.contains('offer')) this.panel.offerHint(true);
  }

  destroy(): void {
    this.card?.destroy();
  }
}
