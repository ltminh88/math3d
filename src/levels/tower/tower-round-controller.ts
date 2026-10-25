// Runs the climb: floor setup, answers from the cards or the number pad, the "đố vui" verdict and
// its fix or confirmation, hints, rewards, lighting the floor and asking the camera to climb, then
// the hand-over to the celebration. Rules live in tower-round-flow.ts and tower-question-formats.ts.
import { createLevelRunTally } from '../shared/level-run-tally';
import type { LevelContext } from '../shared/level-types';
import { equationText, renderHint, spokenEquation } from './tower-hints';
import type { TowerPanel } from './tower-panel';
import type { TowerQuestionCard } from './tower-question-card';
import type { TowerQuestion } from './tower-question-formats';
import type { StepAnswer, TowerRoundFlow } from './tower-round-flow';
import type { TowerStrings } from './tower-strings';

export interface TowerRoundHooks {
  /** Floor `floor` (0-based) is finished: light it and climb to the next one. */
  onFloorDone(floor: number): void;
  onLevelDone(earned: { xp: number; coins: number }, stars: number): void;
}

function floorTexts(ts: TowerStrings, q: TowerQuestion): { prompt: string; guide: string } {
  const { a, b, p } = q.triple;
  const eq = q.steps[0]?.eq;
  switch (q.format) {
    case 'choice':
      return { prompt: ts('promptChoice'), guide: ts('guideChoice') };
    case 'pad':
      return { prompt: ts('promptPad'), guide: ts('guidePad') };
    case 'missing':
      return { prompt: ts('promptMissing'), guide: ts('guideMissing', { y: eq?.y ?? b, z: p }) };
    case 'family':
      return { prompt: ts('promptFamily', { a, b, p }), guide: ts('guideFamily') };
    default:
      return { prompt: ts('promptClaim'), guide: ts('guideClaim') };
  }
}

export class TowerRoundController {
  private idle = 0;
  private readonly tally = createLevelRunTally();

  constructor(
    private readonly ctx: LevelContext,
    private readonly ts: TowerStrings,
    readonly flow: TowerRoundFlow,
    private readonly panel: TowerPanel,
    private readonly card: TowerQuestionCard,
    private readonly hooks: TowerRoundHooks,
  ) {}

  startRound(): void {
    const question = this.flow.question;
    const step = this.flow.step;
    if (!question || !step) return;
    const texts = floorTexts(this.ts, question);
    const total = this.flow.questions.length;
    this.panel.showFloor(this.flow.index, total, question.format, texts.prompt, texts.guide);
    this.card.render(question);
    this.panel.showInput(step);
    this.idle = 0;
    this.ctx.announce(`${texts.prompt} ${spokenEquation(this.ts, step.eq)}`);
  }

  /** Answer card `index` (choice value or Đúng/Sai). */
  pick(index: number): void {
    const step = this.flow.step;
    if (!step || this.flow.roundComplete || !this.panel.answers.isAvailable(index)) return;
    if (step.kind === 'choice') this.answer(step.choices[index] as number, index);
    else if (step.kind === 'verdict') this.answer(index === 0, index);
  }

  submit(value: number): void {
    if (this.flow.step?.kind === 'number') this.answer(value);
  }

  private answer(value: StepAnswer, card?: number): void {
    const question = this.flow.question;
    const step = this.flow.step;
    const stepIndex = this.flow.stepIndex;
    if (!question || !step) return;
    const result = this.flow.submit(value);
    if (result.verdict === 'ignored') return;
    this.panel.pad.clear();
    this.idle = 0;
    if (result.verdict === 'wrong') {
      if (card === undefined) this.card.shake();
      else this.panel.answers.mark(card, false);
      this.panel.setFeedback(this.ts('wrong'), 'gentle');
      this.panel.offerHint(this.flow.hintOffered(0));
      this.ctx.audio.hint();
      this.ctx.announce(this.ts('wrong'));
      return;
    }
    const right = step.kind === 'choice' ? step.choices.indexOf(step.answer) : step.answer ? 0 : 1;
    if (step.kind !== 'number') this.panel.answers.mark(right, true);
    if (result.verdict === 'revealed') this.card.revealFrom(question, stepIndex);
    else if (typeof value === 'number') this.card.fill(stepIndex, value);
    else this.card.judged(question);
    const next = this.flow.step;
    if (!result.outcome && next) {
      // After the verdict: fix a false claim, or confirm a true one with its result hidden.
      const fixing = step.kind === 'verdict';
      const confirming = fixing && step.answer === true;
      if (fixing)
        this.panel.prompt.textContent = this.ts(confirming ? 'promptConfirm' : 'promptFix');
      else this.card.setActive(this.flow.stepIndex);
      this.panel.showInput(next);
      this.panel.clearHint();
      this.panel.hint.disabled = false;
      const text = this.ts(confirming ? 'claimTrue' : fixing ? 'claimCaught' : 'correctStep');
      this.panel.setFeedback(text, 'success');
      this.ctx.audio.tone(698, 0.12);
      this.ctx.announce(`${text} ${spokenEquation(this.ts, next.eq)}`);
      return;
    }
    if (result.outcome) this.finishFloor(question, result.verdict === 'correct', result.outcome);
  }

  private finishFloor(
    question: TowerQuestion,
    correct: boolean,
    outcome: Parameters<LevelContext['learning']['record']>[0],
  ): void {
    this.ctx.learning.record(outcome);
    const reward = this.tally.add(outcome);
    const last = question.steps[question.steps.length - 1];
    const equation = last ? equationText(this.ts, last.eq) : '';
    const text = this.ts(correct ? 'correct' : 'revealed', { equation });
    this.panel.setFeedback(text, correct ? 'success' : 'gentle');
    if (reward.xp > 0) {
      this.panel.popReward(this.ts('reward', { xp: reward.xp }), this.ctx.disposer.signal);
    }
    if (correct) this.ctx.audio.correct();
    else this.ctx.audio.hint();
    this.hooks.onFloorDone(this.flow.index);
    this.ctx.announce(`${text} ${this.ts('lit', { n: this.flow.index + 1 })}`);
    this.panel.setAnswered(true);
  }

  hint(): void {
    const step = this.flow.step;
    if (!step || this.flow.roundComplete) return;
    const rung = this.flow.takeHint();
    const text = renderHint(this.panel.hintArea, this.ts, rung, step);
    this.panel.offerHint(false);
    // The last taught rung is shown: the button is spent until the next step (QA m-4).
    this.panel.hint.disabled = rung >= 4;
    this.ctx.audio.hint();
    this.ctx.announce(text);
    this.idle = 0;
  }

  next(): void {
    if (!this.flow.roundComplete) return;
    this.flow.next();
    if (this.flow.done) this.hooks.onLevelDone(this.tally.earned(), this.tally.stars());
    else this.startRound();
  }

  update(dt: number): void {
    if (this.flow.done) return;
    this.idle += dt * 1000;
    if (!this.panel.hint.classList.contains('offer') && this.flow.hintOffered(this.idle)) {
      this.panel.offerHint(true);
    }
  }
}
