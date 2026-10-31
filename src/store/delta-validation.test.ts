import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import type { SessionDelta } from '../learning/learning-types';
import { createSessionRecorder } from '../learning/session-recorder';
import { InvalidDeltaError, validateDelta } from './delta-validation';
import { openGameStore } from './game-store';

const delta = (facts: SessionDelta['facts']): SessionDelta => ({
  batchId: 'b1',
  profileId: 'p1',
  clientTs: 1,
  v: 1,
  facts,
  levels: {},
  xp: 0,
  coins: 0,
});
const fact = { a: 1, c: 1, ms: 900, box: 2, seenAt: 5 };

describe('validateDelta with skill keys', () => {
  it('accepts catalog skills next to × / : facts and rejects unknown skills', () => {
    expect(() =>
      validateDelta(delta({ 'mul:2x3': fact, 'sk:div-rem-ceil': fact }), 'p1'),
    ).not.toThrow();
    for (const key of ['sk:made-up-skill', 'sk:', 'skill:div-rem-ceil'])
      expect(() => validateDelta(delta({ [key]: fact }), 'p1'), key).toThrow(InvalidDeltaError);
  });

  it('a recorded skill session commits to the store and reloads', async () => {
    let n = 0;
    const newId = () => `id-${++n}`;
    const name = `skill-delta-${Date.now()}`;
    const store = await openGameStore({ dbName: name, newId });
    const profileId = store.getSnapshot().profile.id;
    const recorder = createSessionRecorder({
      profileId,
      levelId: 'bridge',
      sessionNo: 1,
      getStat: (key) => store.getSnapshot().factStats[key],
      now: () => 1000,
      newId,
    });
    // Choice / verdict misses carry no numeric wrong answer.
    recorder.recordQuestion({
      factKey: 'sk:tf-explain',
      ms: 4000,
      correct: true,
      firstTry: false,
      usedHint: false,
      wrongAnswers: [],
    });
    recorder.recordQuestion({
      factKey: 'sk:div-rem-ceil',
      ms: 3000,
      correct: true,
      firstTry: true,
      usedHint: false,
      wrongAnswers: [],
    });
    await store.commitSession(recorder.finish().delta);
    store.close();
    const reopened = await openGameStore({ dbName: name, newId });
    const stats = reopened.getSnapshot().factStats;
    expect(stats['sk:div-rem-ceil']).toMatchObject({ attempts: 1, correct: 1, box: 2 });
    expect(stats['sk:tf-explain']).toMatchObject({ attempts: 1, correct: 1, box: 1 });
    reopened.close();
  });
});
