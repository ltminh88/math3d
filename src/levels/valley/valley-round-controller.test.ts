// R42: the valley shows a per-skill explanation for a wrong STEP answer when it is
// recognised (R35), keeps its generic sentence otherwise — and keeps notThere for a
// wrong BOARD tap, which is not a step answer (Q2). The step card builds the answer
// event (step-card.test.ts covers that); here the controller's onAnswer handler is
// driven directly with that event, through the real flow and real generated rounds.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineStrings } from '../../i18n/i18n';
import { mulberry32 } from '../../learning/seeded-rng';
import { playableSteps, type StepAnswer } from '../../reasoning/reasoning-step-answers';
import type { StepAnswerEvent } from '../../ui/kit/step-card';
import {
  assertWrong,
  created,
  FakeElement,
  fakeLevelContext,
  must,
  stubDom,
  wrongAnswerFor,
} from '../shared/level-controller-test-harness';
import { wrongAnswerFeedback } from '../shared/wrong-answer-feedback';
import { ValleyRoundController } from './valley-round-controller';
import { buildValleyRounds, type ValleyRound, ValleyRoundFlow } from './valley-round-flow';
import { valleyStrings } from './valley-strings';

const vs = valleyStrings(defineStrings);

function fakePanel() {
  const feedback: string[] = [];
  return {
    feedback,
    showRound: vi.fn(),
    setFeedback: vi.fn((text: string) => {
      feedback.push(text);
    }),
    offerHint: vi.fn(),
    showHint: vi.fn(),
    popReward: vi.fn(),
    setAnswered: vi.fn(),
    hint: new FakeElement(),
    cardHost: new FakeElement(),
    story: new FakeElement(),
    prompt: new FakeElement(),
  };
}

function fakeBoard() {
  return {
    setRound: vi.fn(),
    refresh: vi.fn(),
    pick: vi.fn(),
    layEke: vi.fn(),
    toggleLift: vi.fn(),
    syncSelection: vi.fn(),
    chooseOption: vi.fn(),
    showAid: vi.fn(),
    update: vi.fn(),
  };
}

function runValley(skillId: string) {
  stubDom();
  const round = must(buildValleyRounds([{ skillId, tier: 1 }], mulberry32(7))[0], 'valley round');
  const flow = new ValleyRoundFlow([round], () => 1000);
  const panel = fakePanel();
  const controller = new ValleyRoundController(
    fakeLevelContext(),
    vs,
    flow,
    panel as never,
    fakeBoard() as never,
    { onRoundDone: () => {}, onLevelDone: () => {} },
  );
  controller.startRound();
  return { controller, panel, round, flow };
}

/** A wrong board tap is only possible in the action phase; finish it to reach the steps. */
function reachSteps(
  controller: ValleyRoundController,
  flow: ValleyRoundFlow,
  round: ValleyRound,
): void {
  if (flow.phase !== 'action') return;
  const right = round.layout.targets.find((t) => t.right);
  if (!right) throw new Error('action round without a right target');
  controller.tap(right.id);
  expect(flow.phase).toBe('steps');
}

function answerWrong(
  controller: ValleyRoundController,
  round: ValleyRound,
  stepIndex = 0,
): StepAnswer {
  const step = must(playableSteps(round.item)[stepIndex], 'step');
  const answer = wrongAnswerFor(step);
  assertWrong(step, answer);
  (controller as unknown as { onAnswer(event: StepAnswerEvent): void }).onAnswer({
    stepIndex,
    correct: false,
    answer,
  });
  return answer;
}

describe('valley round controller — wrong-answer explanations (R42)', () => {
  afterEach(() => {
    created.length = 0;
    vi.unstubAllGlobals();
  });

  it('shows the specific explanation for a geo-midpoint-length mistake', () => {
    const { controller, panel, round, flow } = runValley('geo-midpoint-length');
    reachSteps(controller, flow, round);
    const answer = answerWrong(controller, round);
    const last = panel.feedback[panel.feedback.length - 1];
    expect(last).not.toBe(vs('wrong'));
    expect(last).toBe(
      wrongAnswerFeedback({
        skillId: 'geo-midpoint-length',
        tier: round.item.tier,
        item: round.item,
        stepIndex: 0,
        answer,
        missNumber: 1,
      }),
    );
  });

  it('shows the same explanation on the second miss (Q5)', () => {
    const { controller, panel, round, flow } = runValley('geo-midpoint-length');
    reachSteps(controller, flow, round);
    answerWrong(controller, round);
    answerWrong(controller, round);
    const [first, second] = panel.feedback.slice(-2);
    expect(second).toBe(first);
    expect(second).not.toBe(vs('wrong'));
  });

  it('keeps notThere for a wrong board tap (Q2)', () => {
    const { controller, panel, round, flow } = runValley('geo-midpoint-length');
    expect(flow.phase).toBe('action');
    const wrong = round.layout.targets.find((t) => !t.right);
    if (!wrong) throw new Error('action round without a wrong target');
    controller.tap(wrong.id);
    expect(panel.feedback).toEqual([vs('notThere')]);
  });

  it('keeps the generic sentence for geo-shape-classify', () => {
    const { controller, panel, round, flow } = runValley('geo-shape-classify');
    reachSteps(controller, flow, round);
    answerWrong(controller, round);
    const last = panel.feedback[panel.feedback.length - 1];
    expect(last).toBe(vs('wrong'));
  });
});
