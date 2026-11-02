// Pure run logic of the valley: each round is a geometry item, an optional hands-on action on the
// board (tap the midpoint stone, the centre O, a corner for the ê-ke, lift the block) and then the
// item's steps on the step card. No timer, no lives: the action and every step each have three
// tries; the third miss shows that answer and the round goes on (recorded as not correct). One
// hint ladder for the whole round (the rung carries from the action to the steps).

import type { GeoItem } from '../../geometry/geo-scene-types';
import { geometryItemForSkill } from '../../geometry/geometry-item-for-skill';
import { skillKey } from '../../learning/fact-key';
import type { HintState } from '../../learning/hint-ladder';
import type { Rng } from '../../learning/seeded-rng';
import type { QuestionOutcome } from '../../learning/session-recorder';
import type { StepAnswer } from '../../reasoning/reasoning-step-answers';
import { StepMissBudget } from '../shared/step-miss-budget';
import { layoutFigure } from './valley-figure-layout';
import type { FigureLayout } from './valley-layout-types';
import { VALLEY_KIND, type ValleyKind, type ValleyRoundSpec } from './valley-round-plan';

/** Rungs the valley teaches: encourage, definition, visual aid. */
export const VALLEY_HINT_RUNGS = 3;

export interface ValleyRound {
  readonly kind: ValleyKind;
  readonly item: GeoItem;
  readonly layout: FigureLayout;
}

export function buildValleyRounds(specs: readonly ValleyRoundSpec[], rng: Rng): ValleyRound[] {
  return specs.map(({ skillId, tier }) => {
    const item = geometryItemForSkill(skillId, rng, tier);
    return { kind: VALLEY_KIND[skillId] as ValleyKind, item, layout: layoutFigure(item) };
  });
}

export type ValleyPhase = 'action' | 'steps' | 'complete';
export type Verdict = 'correct' | 'wrong' | 'revealed' | 'ignored';

export class ValleyRoundFlow {
  index = 0;
  phase: ValleyPhase = 'steps';
  private readonly budget = new StepMissBudget(true);
  private wrongAnswers: number[] = [];
  private startedAt: number;

  constructor(
    readonly rounds: readonly ValleyRound[],
    private readonly now: () => number,
  ) {
    this.startedAt = now();
    this.phase = this.firstPhase();
  }

  /** The live step's (or action's) hint ladder: its misses, the round's rung. */
  get hint(): HintState {
    return this.budget.hint;
  }

  get round(): ValleyRound | undefined {
    return this.rounds[this.index];
  }

  get done(): boolean {
    return this.index >= this.rounds.length;
  }

  /** A tap on a board target during the action; `right` finishes the action. */
  tap(targetId: string): 'right' | 'wrong' | 'revealed' | 'ignored' {
    const target = this.round?.layout.targets.find((t) => t.id === targetId);
    if (this.phase !== 'action' || !target) return 'ignored';
    if (!target.right && !this.budget.miss()) return 'wrong';
    this.phase = 'steps';
    this.budget.nextStep();
    return target.right ? 'right' : 'revealed';
  }

  /**
   * One try on the step card (the card checks it; numbers are kept for the error bank). A right
   * answer or a third miss ends the step: the next one starts with three fresh tries.
   */
  answer(correct: boolean, value: StepAnswer): Verdict {
    if (this.phase !== 'steps') return 'ignored';
    if (!correct) {
      if (typeof value === 'number') this.wrongAnswers.push(value);
      if (!this.budget.miss()) return 'wrong';
    }
    this.budget.nextStep();
    return correct ? 'correct' : 'revealed';
  }

  /** The card's last step is answered (or shown): the round ends with its outcome. */
  completeSteps(): QuestionOutcome {
    const round = this.round as ValleyRound;
    this.phase = 'complete';
    const result = this.budget.result();
    return {
      factKey: skillKey(round.item.skillId),
      ms: this.now() - this.startedAt,
      correct: result.correct,
      firstTry: result.firstTry,
      usedHint: result.usedHint,
      wrongAnswers: [...this.wrongAnswers],
    };
  }

  takeHint(): number {
    if (this.phase === 'complete') return this.hint.rung;
    return this.budget.takeHint(VALLEY_HINT_RUNGS);
  }

  next(): void {
    if (this.phase !== 'complete') return;
    this.index += 1;
    this.budget.reset();
    this.wrongAnswers = [];
    this.startedAt = this.now();
    this.phase = this.firstPhase();
  }

  private firstPhase(): ValleyPhase {
    return this.round?.layout.action ? 'action' : 'steps';
  }
}
