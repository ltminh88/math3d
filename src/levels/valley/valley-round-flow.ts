// Pure run logic of the valley: each round is a geometry item, an optional hands-on action on the
// board (tap the midpoint stone, the centre O, a corner for the ê-ke, lift the block) and then the
// item's steps on the step card. No timer, no lives: misses of the action and of the steps share
// one hint ladder, and the third miss reveals the round (recorded as not correct).

import type { GeoItem } from '../../geometry/geo-scene-types';
import { geometryItemForSkill } from '../../geometry/geometry-item-for-skill';
import { skillKey } from '../../learning/fact-key';
import {
  createHintState,
  type HintState,
  recordWrong,
  takeHint,
  toQuestionResult,
} from '../../learning/hint-ladder';
import type { Rng } from '../../learning/seeded-rng';
import type { QuestionOutcome } from '../../learning/session-recorder';
import type { StepAnswer } from '../../reasoning/reasoning-step-answers';
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
  hint: HintState = createHintState();
  private wrongAnswers: number[] = [];
  private startedAt: number;

  constructor(
    readonly rounds: readonly ValleyRound[],
    private readonly now: () => number,
  ) {
    this.startedAt = now();
    this.phase = this.firstPhase();
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
    if (target.right) {
      this.phase = 'steps';
      return 'right';
    }
    this.hint = recordWrong(this.hint);
    if (!this.hint.revealed) return 'wrong';
    this.phase = 'steps';
    return 'revealed';
  }

  /** One try on the step card (the card checks it; numbers are kept for the error bank). */
  answer(correct: boolean, value: StepAnswer): Verdict {
    if (this.phase !== 'steps' || this.hint.revealed) return 'ignored';
    if (correct) return 'correct';
    if (typeof value === 'number') this.wrongAnswers.push(value);
    this.hint = recordWrong(this.hint);
    return this.hint.revealed ? 'revealed' : 'wrong';
  }

  /** The card's last step is answered (or revealed): the round ends with its outcome. */
  completeSteps(): QuestionOutcome {
    const round = this.round as ValleyRound;
    this.phase = 'complete';
    const result = toQuestionResult(this.hint, true);
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
    if (this.phase === 'complete' || this.hint.rung >= VALLEY_HINT_RUNGS) return this.hint.rung;
    this.hint = takeHint(this.hint);
    return this.hint.rung;
  }

  next(): void {
    if (this.phase !== 'complete') return;
    this.index += 1;
    this.hint = createHintState();
    this.wrongAnswers = [];
    this.startedAt = this.now();
    this.phase = this.firstPhase();
  }

  private firstPhase(): ValleyPhase {
    return this.round?.layout.action ? 'action' : 'steps';
  }
}
