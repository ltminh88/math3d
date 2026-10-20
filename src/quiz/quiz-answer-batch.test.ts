import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BRIDGE_SEGMENTS } from '../config/world-constants';
import { questionReward } from '../learning/scoring';
import { createQuizAnswerBatch, questCompleteDelta } from './quiz-answer-batch';
import {
  BRIDGE_SEGMENTS_PER_CORRECT,
  COMBO_SHOWN_FROM,
  CORRECT_ANSWER_REWARD,
  QUEST_COMPLETE_REWARD,
} from './quiz-rewards';

const original = readFileSync(
  new URL('../../recovered/formatted/game-app-section.js', import.meta.url),
  'utf8',
);

describe('frozen bridge rewards (validated: keep the original)', () => {
  it('equal the original answer handler fg() and the quest completion', () => {
    const answer = original.slice(original.indexOf('function fg('));
    const handler = answer.slice(0, answer.indexOf('\nfunction '));
    expect(handler).toContain(`(ie.xp += ${CORRECT_ANSWER_REWARD.xp})`);
    expect(handler).toContain(`(ie.coins += ${CORRECT_ANSWER_REWARD.coins})`);
    expect(handler).toContain(`ie.bridge + ${BRIDGE_SEGMENTS_PER_CORRECT})`);
    expect(handler).toContain(`ie.combo >= ${COMBO_SHOWN_FROM} ?`);
    expect(original).toContain(
      `((ie.questComplete = !0),\n            (ie.xp += ${QUEST_COMPLETE_REWARD.xp}),\n            (ie.coins += ${QUEST_COMPLETE_REWARD.coins}),`,
    );
  });

  it('a hinted, second-try correct answer still pays the full reward (scoring.ts not consulted)', () => {
    let n = 0;
    const batch = createQuizAnswerBatch({
      profileId: 'p',
      sessionNo: 4,
      getStat: () => undefined,
      now: () => 1000,
      newId: () => `b${++n}`,
    });
    const outcome = {
      factKey: 'mul:3x4',
      ms: 4000,
      correct: true,
      firstTry: false,
      usedHint: true,
      wrongAnswers: [13],
    };
    expect(questionReward(outcome).xp).toBe(5); // what scoring.ts would have paid
    batch.recordQuestion(outcome, CORRECT_ANSWER_REWARD);
    batch.recordQuestion(
      { ...outcome, factKey: 'mul:2x5', correct: false, wrongAnswers: [9] },
      {
        xp: 0,
        coins: 0,
      },
    );
    batch.setLevelProgress('bridge', 2);
    expect(batch.size).toBe(2);
    const { delta, local } = batch.finish();
    expect(delta).toMatchObject({
      batchId: 'b1',
      profileId: 'p',
      xp: 10,
      coins: 5,
      levels: { bridge: { stars: 0, bestScore: 0, progress: 2 } },
    });
    expect(delta.facts['mul:3x4']).toMatchObject({ a: 2, c: 1 });
    expect(delta.facts['mul:2x5']).toMatchObject({ a: 1, c: 0, box: 1 });
    expect(local['mul:3x4']?.errs).toEqual([13]);
    expect(batch.pendingCounts()).toEqual({
      'mul:3x4': { attempts: 2, correct: 1 },
      'mul:2x5': { attempts: 1, correct: 0 },
    });
    // finish() is stable so a failed commit can be retried with the same batchId.
    expect(batch.finish().delta.batchId).toBe('b1');
  });

  it('quest completion pays +50 XP / +10 coins and completes the bridge level', () => {
    expect(questCompleteDelta('p', 'q1', 7)).toEqual({
      batchId: 'q1',
      profileId: 'p',
      clientTs: 7,
      v: 1,
      facts: {},
      levels: { bridge: { stars: 1, bestScore: 0, progress: BRIDGE_SEGMENTS } },
      xp: 50,
      coins: 10,
    });
  });
});
