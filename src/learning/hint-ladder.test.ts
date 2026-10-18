import { describe, expect, it } from 'vitest';
import {
  createHintState,
  IDLE_OFFER_MS,
  isOutOfAttempts,
  recordWrong,
  shouldOfferHint,
  takeHint,
  toQuestionResult,
} from './hint-ladder';

describe('hint ladder', () => {
  it('offers nothing on a fresh question until 10 s idle', () => {
    const s = createHintState();
    expect(shouldOfferHint(s, IDLE_OFFER_MS - 1)).toBe(false);
    expect(shouldOfferHint(s, IDLE_OFFER_MS)).toBe(true);
  });

  it('auto-offers after the first wrong answer, once per wrong answer', () => {
    let s = recordWrong(createHintState());
    expect(shouldOfferHint(s, 0)).toBe(true);
    s = takeHint(s);
    expect(s.rung).toBe(1);
    expect(shouldOfferHint(s, 0)).toBe(false);
    s = recordWrong(s);
    expect(shouldOfferHint(s, 0)).toBe(true);
  });

  it('third wrong answer reveals the worked answer, requeues and counts wrong', () => {
    let s = createHintState();
    for (let i = 0; i < 3; i++) s = recordWrong(s);
    expect(s).toMatchObject({ rung: 5, revealed: true });
    expect(isOutOfAttempts(s)).toBe(true);
    expect(shouldOfferHint(s, 99_999)).toBe(false);
    expect(takeHint(s)).toBe(s);
    expect(toQuestionResult(s, true)).toEqual({
      correct: false,
      firstTry: false,
      usedHint: true,
      requeue: true,
    });
  });

  it('never teaches past rung 4 by request', () => {
    let s = createHintState();
    for (let i = 0; i < 6; i++) s = takeHint(s);
    expect(s.rung).toBe(4);
    expect(s.hintsTaken).toBe(4);
  });

  it('maps outcomes for scoring', () => {
    expect(toQuestionResult(createHintState(), true)).toEqual({
      correct: true,
      firstTry: true,
      usedHint: false,
      requeue: false,
    });
    expect(toQuestionResult(takeHint(createHintState()), true)).toMatchObject({
      correct: true,
      firstTry: true,
      usedHint: true,
    });
    expect(toQuestionResult(recordWrong(createHintState()), true)).toMatchObject({
      correct: true,
      firstTry: false,
    });
  });
});
