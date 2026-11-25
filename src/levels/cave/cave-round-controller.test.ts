// R42: the cave shows a per-skill explanation when a wrong answer is recognised
// (R35), and keeps its generic sentence otherwise. The step card builds the answer
// event (step-card.test.ts covers that); here the controller's answer handler is
// driven directly with that event, through the real flow and real generated chambers.
// Note the cave flow checks the answer itself, so the driven answer must really be
// wrong (assertWrong guards that).
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
import { buildCaveChambers, type CaveChamber } from './cave-chamber-formats';
import { CaveRoundController } from './cave-round-controller';
import { CaveRoundFlow } from './cave-round-flow';
import { caveStrings } from './cave-strings';

const cs = caveStrings(defineStrings);

function fakePanel() {
  const feedback: string[] = [];
  return {
    feedback,
    showChamber: vi.fn(),
    setFeedback: vi.fn((text: string) => {
      feedback.push(text);
    }),
    offerHint: vi.fn(),
    clearHint: vi.fn(),
    showHint: vi.fn(),
    popReward: vi.fn(),
    setAnswered: vi.fn(),
    hint: new FakeElement(),
    cardHost: new FakeElement(),
  };
}

function runCave(skillId: string) {
  stubDom();
  const chamber = must(buildCaveChambers([skillId], {}, mulberry32(7))[0], 'cave chamber');
  const flow = new CaveRoundFlow([chamber], () => 1000);
  const panel = fakePanel();
  const controller = new CaveRoundController(fakeLevelContext(), cs, flow, panel as never, {
    onChamberDone: () => {},
    onLevelDone: () => {},
  });
  controller.startRound();
  return { controller, panel, chamber, flow };
}

function answerWrong(
  controller: CaveRoundController,
  chamber: CaveChamber,
  stepIndex = 0,
): StepAnswer {
  const step = must(playableSteps(chamber.item)[stepIndex], 'step');
  const answer = wrongAnswerFor(step);
  assertWrong(step, answer);
  (controller as unknown as { answer(event: StepAnswerEvent): void }).answer({
    stepIndex,
    correct: false,
    answer,
  });
  return answer;
}

describe('cave round controller — wrong-answer explanations (R42)', () => {
  afterEach(() => {
    created.length = 0;
    vi.unstubAllGlobals();
  });

  it('shows the specific explanation for a div-rem-ceil mistake', () => {
    const { controller, panel, chamber } = runCave('div-rem-ceil');
    const answer = answerWrong(controller, chamber);
    expect(panel.feedback).toHaveLength(1);
    expect(panel.feedback[0]).not.toBe(cs('wrong'));
    expect(panel.feedback[0]).toBe(
      wrongAnswerFeedback({
        skillId: 'div-rem-ceil',
        tier: chamber.item.tier,
        item: chamber.item,
        stepIndex: 0,
        answer,
        missNumber: 1,
      }),
    );
  });

  it('shows the same explanation on the second miss (Q5)', () => {
    const { controller, panel, chamber } = runCave('div-rem-ceil');
    answerWrong(controller, chamber);
    answerWrong(controller, chamber);
    expect(panel.feedback).toHaveLength(2);
    expect(panel.feedback[1]).toBe(panel.feedback[0]);
    expect(panel.feedback[1]).not.toBe(cs('wrong'));
  });

  it('keeps the generic sentence for tf-explain', () => {
    const { controller, panel, chamber } = runCave('tf-explain');
    answerWrong(controller, chamber);
    expect(panel.feedback).toEqual([cs('wrong')]);
  });
});
