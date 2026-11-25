// R42: the numberfort shows a per-skill explanation when a wrong answer is recognised
// (R35), and keeps its generic sentence otherwise. Same shape as the market test: the
// step card builds the answer event (step-card.test.ts covers that); here the
// controller's answer handler is driven directly with that event, through the real
// flow and real generated items.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineStrings } from '../../i18n/i18n';
import { skillKey } from '../../learning/fact-key';
import { mulberry32 } from '../../learning/seeded-rng';
import { itemForSkill } from '../../practice/item-for-skill';
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
import { NumberfortRoundController } from './numberfort-round-controller';
import { numberfortStrings } from './numberfort-strings';

vi.mock('../../ui/dialog-scenes/dialog-scene-registry', () => ({ renderScene: () => null }));

const cs = numberfortStrings(defineStrings);

function fakePanel() {
  const feedback: string[] = [];
  return {
    feedback,
    showRound: vi.fn(),
    setFeedback: vi.fn((text: string) => {
      feedback.push(text);
    }),
    offerHint: vi.fn(),
    clearHint: vi.fn(),
    showHint: vi.fn(),
    popReward: vi.fn(),
    setAnswered: vi.fn(),
    hint: new FakeElement(),
    sceneHost: new FakeElement(),
    cardHost: new FakeElement(),
  };
}

function runNumberfort(skillId: string) {
  stubDom();
  const item = itemForSkill(skillId, mulberry32(7), 1);
  const plan = { skillId, tier: item.tier, factKey: skillKey(skillId), item };
  const panel = fakePanel();
  const controller = new NumberfortRoundController(
    fakeLevelContext(3),
    cs,
    [plan],
    panel as never,
    {
      onRoundDone: () => {},
      onLevelDone: () => {},
    },
  );
  controller.startRound();
  return { controller, panel, plan, item };
}

function answerWrong(
  controller: NumberfortRoundController,
  plan: { item: ReturnType<typeof itemForSkill> },
  stepIndex = 0,
): StepAnswer {
  const step = must(playableSteps(plan.item)[stepIndex], 'step');
  const answer = wrongAnswerFor(step);
  assertWrong(step, answer);
  (controller as unknown as { answer(event: StepAnswerEvent): void }).answer({
    stepIndex,
    correct: false,
    answer,
  });
  return answer;
}

describe('numberfort round controller — wrong-answer explanations (R42)', () => {
  afterEach(() => {
    created.length = 0;
    vi.unstubAllGlobals();
  });

  it('shows the specific explanation for an add-4digit mistake', () => {
    const { controller, panel, plan, item } = runNumberfort('add-4digit');
    const answer = answerWrong(controller, plan);
    expect(panel.feedback).toHaveLength(1);
    expect(panel.feedback[0]).not.toBe(cs('wrong'));
    expect(panel.feedback[0]).toBe(
      wrongAnswerFeedback({
        skillId: 'add-4digit',
        tier: 1,
        item,
        stepIndex: 0,
        answer,
        missNumber: 1,
      }),
    );
  });

  it('shows the same explanation on the second miss (Q5)', () => {
    const { controller, panel, plan } = runNumberfort('add-4digit');
    answerWrong(controller, plan);
    answerWrong(controller, plan);
    expect(panel.feedback).toHaveLength(2);
    expect(panel.feedback[1]).toBe(panel.feedback[0]);
    expect(panel.feedback[1]).not.toBe(cs('wrong'));
  });

  it('keeps the generic sentence for num-read-write-10000', () => {
    const { controller, panel, plan } = runNumberfort('num-read-write-10000');
    answerWrong(controller, plan);
    expect(panel.feedback).toEqual([cs('wrong')]);
  });
});
