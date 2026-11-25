// R42: the garden shows a per-skill explanation when a wrong answer is recognised
// (R35), and keeps its generic sentence otherwise. The step card builds the answer
// event (step-card.test.ts covers that); here the controller's answer handler is
// driven directly with that event, through the real flow and real generated items.
// Note the garden flow checks the answer itself, so the driven answer must really be
// wrong (assertWrong guards that).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineStrings } from '../../i18n/i18n';
import { skillKey } from '../../learning/fact-key';
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
import { GardenRoundController } from './garden-round-controller';
import { GardenRoundFlow } from './garden-round-flow';
import { buildGardenItem, type GardenRound, gardenKindOf } from './garden-round-plan';
import { gardenStrings } from './garden-strings';

const gs = gardenStrings(defineStrings);

function fakePanel() {
  const feedback: string[] = [];
  return {
    feedback,
    showRound: vi.fn(),
    mountCard: vi.fn(),
    setFeedback: vi.fn((text: string) => {
      feedback.push(text);
    }),
    offerHint: vi.fn(),
    clearHint: vi.fn(),
    showHint: vi.fn(),
    showPots: vi.fn(),
    popReward: vi.fn(),
    setAnswered: vi.fn(),
    hint: new FakeElement(),
  };
}

function fakeViews() {
  return {
    row: { group: { visible: false }, show: vi.fn(), bloom: vi.fn() },
    balance: { group: { visible: false }, tip: vi.fn(), level: vi.fn() },
    bags: { group: { visible: false }, show: vi.fn(), sprout: vi.fn() },
  };
}

function runGarden(skillId: string) {
  stubDom();
  const item = buildGardenItem(skillId, mulberry32(7), 1);
  const round: GardenRound = {
    kind: gardenKindOf(skillId),
    skillId,
    factKey: skillKey(skillId),
    item,
  };
  const flow = new GardenRoundFlow([round], () => 1000);
  const panel = fakePanel();
  const controller = new GardenRoundController(
    fakeLevelContext(),
    gs,
    flow,
    panel as never,
    fakeViews() as never,
    () => 'x',
    { onLevelDone: () => {} },
  );
  controller.startRound();
  return { controller, panel, round, flow };
}

function answerWrong(
  controller: GardenRoundController,
  round: GardenRound,
  stepIndex = 0,
): StepAnswer {
  const step = must(playableSteps(round.item)[stepIndex], 'step');
  const answer = wrongAnswerFor(step);
  assertWrong(step, answer);
  (controller as unknown as { answer(event: StepAnswerEvent): void }).answer({
    stepIndex,
    correct: false,
    answer,
  });
  return answer;
}

describe('garden round controller — wrong-answer explanations (R42)', () => {
  afterEach(() => {
    created.length = 0;
    vi.unstubAllGlobals();
  });

  it('shows the specific explanation for an unknown-add-sub mistake', () => {
    const { controller, panel, round } = runGarden('unknown-add-sub');
    const answer = answerWrong(controller, round);
    expect(panel.feedback).toHaveLength(1);
    expect(panel.feedback[0]).not.toBe(gs('wrong'));
    expect(panel.feedback[0]).toBe(
      wrongAnswerFeedback({
        skillId: 'unknown-add-sub',
        tier: round.item.tier,
        item: round.item,
        stepIndex: 0,
        answer,
        missNumber: 1,
      }),
    );
  });

  it('shows the same explanation on the second miss (Q5)', () => {
    const { controller, panel, round } = runGarden('unknown-add-sub');
    answerWrong(controller, round);
    answerWrong(controller, round);
    expect(panel.feedback).toHaveLength(2);
    expect(panel.feedback[1]).toBe(panel.feedback[0]);
    expect(panel.feedback[1]).not.toBe(gs('wrong'));
  });

  it('keeps the generic sentence for pattern-add', () => {
    const { controller, panel, round } = runGarden('pattern-add');
    answerWrong(controller, round);
    expect(panel.feedback).toEqual([gs('wrong')]);
  });
});
