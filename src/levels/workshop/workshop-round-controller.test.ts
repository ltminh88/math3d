// R42: the workshop shows a per-skill explanation when a wrong answer is recognised
// (R35), and keeps its generic sentence otherwise. The step card builds the answer
// event (step-card.test.ts covers that); here the controller's onAnswer handler is
// driven directly with that event, through the real flow and real generated rounds.
// Q1(b): an existing misconception note wins over the R35 sentence — the R35 sentence
// is used only when there is no note, never both. (Generated group-4 options never
// carry a note-mapped misconception, so the priority case retags one option on a copy
// of a real item; the scene and the step stay real.)
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineStrings } from '../../i18n/i18n';
import { mulberry32 } from '../../learning/seeded-rng';
import { playableSteps, type StepAnswer } from '../../reasoning/reasoning-step-answers';
import type { StepAnswerEvent } from '../../ui/kit/step-card';
import {
  assertWrong,
  correctAnswerFor,
  created,
  FakeElement,
  fakeLevelContext,
  stubDom,
  wrongAnswerFor,
} from '../shared/level-controller-test-harness';
import { wrongAnswerFeedback } from '../shared/wrong-answer-feedback';
import { workshopHintStrings } from './workshop-hint-strings';
import { WorkshopRoundController } from './workshop-round-controller';
import { WorkshopRoundFlow } from './workshop-round-flow';
import { planWorkshopRounds, type WorkshopRound } from './workshop-round-plan';
import { workshopStrings } from './workshop-strings';

vi.mock('./workshop-board', () => ({
  createWorkshopBoard: () => ({
    element: {},
    fence: null,
    tiles: null,
    walkNext: () => {},
    placeRow: () => {},
  }),
}));

const ws = workshopStrings(defineStrings);
const hs = workshopHintStrings(defineStrings);

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
    boardHost: new FakeElement(),
    cardHost: new FakeElement(),
  };
}

function runWorkshop(rounds: readonly WorkshopRound[]) {
  stubDom();
  const flow = new WorkshopRoundFlow(rounds, () => 1000);
  const panel = fakePanel();
  const controller = new WorkshopRoundController(fakeLevelContext(), ws, hs, flow, panel as never, {
    onRound: () => {},
    onTiles: () => {},
    onLevelDone: () => {},
  });
  controller.startRound();
  return { controller, panel, flow };
}

function planRound(skillId: string, seed = 7): WorkshopRound {
  const [round] = planWorkshopRounds([skillId], {}, mulberry32(seed));
  if (!round) throw new Error(`no workshop round for ${skillId}`);
  return round;
}

/** Answer the steps before `targetIndex` right, then the target step wrong. */
function answerTargetWrong(
  controller: WorkshopRoundController,
  round: WorkshopRound,
  targetIndex: number,
  answer: StepAnswer,
): void {
  const steps = playableSteps(round.item);
  for (let i = 0; i < targetIndex; i++) {
    const prior = steps[i];
    if (!prior) throw new Error('missing step');
    (
      controller as unknown as { onAnswer(round: WorkshopRound, event: StepAnswerEvent): void }
    ).onAnswer(round, {
      stepIndex: i,
      correct: true,
      answer: correctAnswerFor(prior),
    });
  }
  (
    controller as unknown as { onAnswer(round: WorkshopRound, event: StepAnswerEvent): void }
  ).onAnswer(round, {
    stepIndex: targetIndex,
    correct: false,
    answer,
  });
}

function answerFirstStepWrong(
  controller: WorkshopRoundController,
  round: WorkshopRound,
): StepAnswer {
  const step = playableSteps(round.item)[0];
  if (!step) throw new Error('no steps');
  const answer = wrongAnswerFor(step);
  assertWrong(step, answer);
  answerTargetWrong(controller, round, 0, answer);
  return answer;
}

describe('workshop round controller — wrong-answer explanations (R42)', () => {
  afterEach(() => {
    created.length = 0;
    vi.unstubAllGlobals();
  });

  it('shows the specific explanation for a meas-area-count mistake', () => {
    const round = planRound('meas-area-count');
    const { controller, panel } = runWorkshop([round]);
    const answer = answerFirstStepWrong(controller, round);
    expect(panel.feedback).toHaveLength(1);
    expect(panel.feedback[0]).not.toBe(ws('wrong'));
    expect(panel.feedback[0]).toBe(
      wrongAnswerFeedback({
        skillId: 'meas-area-count',
        tier: round.tier,
        item: round.item,
        stepIndex: 0,
        answer,
        missNumber: 1,
      }),
    );
  });

  it('shows the same explanation on the second miss (Q5)', () => {
    const round = planRound('meas-area-count');
    const { controller, panel } = runWorkshop([round]);
    answerFirstStepWrong(controller, round);
    answerFirstStepWrong(controller, round);
    expect(panel.feedback).toHaveLength(2);
    expect(panel.feedback[1]).toBe(panel.feedback[0]);
    expect(panel.feedback[1]).not.toBe(ws('wrong'));
  });

  it('keeps the generic sentence for meas-ruler-read', () => {
    const round = planRound('meas-ruler-read');
    const { controller, panel } = runWorkshop([round]);
    answerFirstStepWrong(controller, round);
    expect(panel.feedback).toEqual([ws('wrong')]);
  });

  it('keeps the misconception note when it exists, R35 only without one (Q1b)', () => {
    // A real meas-area-equal item: its askBigger choice step, with one wrong
    // option retagged to a note-mapped misconception on a copy of the item.
    let found: {
      round: WorkshopRound;
      stepIndex: number;
      noteOptionId: string;
      plainOptionId: string;
    } | null = null;
    for (let seed = 1; seed <= 20 && !found; seed++) {
      const round = planRound('meas-area-equal', seed);
      const steps = playableSteps(round.item);
      const stepIndex = steps.findIndex((s) => s.kind === 'choice' && s.prompt.key === 'askBigger');
      if (stepIndex < 0) continue;
      const step = steps[stepIndex];
      if (step?.kind !== 'choice') continue;
      const wrongOptions = step.options.filter((o) => !o.correct);
      if (wrongOptions.length < 2) continue;
      const [noteOption, plainOption] = wrongOptions;
      if (!noteOption || !plainOption) continue;
      const targetStep = step;
      const item = {
        ...round.item,
        steps: round.item.steps.map((s) =>
          s === targetStep && s.kind === 'choice'
            ? {
                ...s,
                options: s.options.map((o) =>
                  o.id === noteOption.id
                    ? { ...o, misconception: 'perimeter-not-area' as const }
                    : o,
                ),
              }
            : s,
        ),
      };
      found = {
        round: { ...round, item },
        stepIndex,
        noteOptionId: noteOption.id,
        plainOptionId: plainOption.id,
      };
    }
    if (!found) throw new Error('no meas-area-equal item with an askBigger choice step');
    const { round, stepIndex, noteOptionId, plainOptionId } = found;

    // With the note-mapped option: the note wins, no R35 sentence.
    const noted = runWorkshop([round]);
    answerTargetWrong(noted.controller, round, stepIndex, noteOptionId);
    const notedLast = noted.panel.feedback[noted.panel.feedback.length - 1];
    expect(notedLast).toBe(hs('mPerimNotArea'));

    // With a plain wrong option: the R35 sentence (the note does not apply).
    const plain = runWorkshop([round]);
    answerTargetWrong(plain.controller, round, stepIndex, plainOptionId);
    const plainLast = plain.panel.feedback[plain.panel.feedback.length - 1];
    expect(plainLast).not.toBe(ws('wrong'));
    expect(plainLast).toBe(
      wrongAnswerFeedback({
        skillId: 'meas-area-equal',
        tier: round.tier,
        item: round.item,
        stepIndex,
        answer: plainOptionId,
        missNumber: 1,
      }),
    );
  });
});
