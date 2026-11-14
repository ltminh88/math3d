// Stage stars in the store (phase 01): an old record without `stageStars` is migrated
// on read, and session deltas merge per-stage stars with max-wins.
import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import type { SessionDelta } from '../learning/learning-types';
import { openGameStore } from './game-store';
import { openGameDb } from './idb-database';
import { decodeSaveCode, encodeSaveCodeV4, importOfDecodedSaveCode } from './save-code-codec';
import type { LevelProgress } from './save-schema';

const AT = Date.UTC(2026, 9, 31, 8, 30, 15);

/** A row exactly as a pre-stage build wrote it (no `stageStars` field). */
const preStageRecord = (over: Record<string, unknown>): LevelProgress =>
  over as unknown as LevelProgress;

let dbCounter = 0;
const freshName = () => `stage-db-${++dbCounter}`;
const ids = () => {
  let n = 0;
  return () => `id-${++n}`;
};

function session(
  profileId: string,
  batchId: string,
  over: Partial<SessionDelta> = {},
): SessionDelta {
  return {
    batchId,
    profileId,
    clientTs: 1000,
    v: 1,
    facts: {},
    levels: {},
    xp: 0,
    coins: 0,
    ...over,
  };
}

describe('stage stars in the store', () => {
  it('an old finished record reads as stage 1 complete, rest open', async () => {
    const name = freshName();
    const store = await openGameStore({ dbName: name, newId: ids() });
    const pid = store.getSnapshot().profile.id;
    store.close();
    // A record written before stages existed: no stageStars field at all.
    const db = await openGameDb({ name });
    await db.put(
      'levelProgress',
      preStageRecord({
        profileId: pid,
        levelId: 'cave',
        stars: 2,
        bestScore: 100,
        completedAt: 1000,
        progress: 0,
        acceptedAt: 1000,
      }),
    );
    db.close();

    const reopened = await openGameStore({ dbName: name, newId: ids() });
    expect(reopened.getSnapshot().levelProgress.cave).toMatchObject({
      stars: 2,
      completedAt: 1000,
      stageStars: [2],
    });
    reopened.close();
  });

  it('an old unfinished record reads as all zeros', async () => {
    const name = freshName();
    const store = await openGameStore({ dbName: name, newId: ids() });
    const pid = store.getSnapshot().profile.id;
    store.close();
    const db = await openGameDb({ name });
    await db.put(
      'levelProgress',
      preStageRecord({
        profileId: pid,
        levelId: 'field',
        stars: 0,
        bestScore: 0,
        completedAt: 0,
        progress: 0,
        acceptedAt: 0,
      }),
    );
    db.close();

    const reopened = await openGameStore({ dbName: name, newId: ids() });
    expect(reopened.getSnapshot().levelProgress.field).toMatchObject({ stars: 0, stageStars: [] });
    reopened.close();
  });

  it('stage stars merge with max-wins per stage', async () => {
    const name = freshName();
    const store = await openGameStore({ dbName: name, newId: ids() });
    const pid = store.getSnapshot().profile.id;
    await store.commitSession(
      session(pid, 'b1', { levels: { field: { stars: 1, bestScore: 0, stageStars: [1, 2] } } }),
    );
    await store.commitSession(
      session(pid, 'b2', { levels: { field: { stars: 1, bestScore: 0, stageStars: [0, 3, 1] } } }),
    );
    expect(store.getSnapshot().levelProgress.field?.stageStars).toEqual([1, 3, 1]);
    store.close();
  });

  it('replaying stage 1 with more stars keeps stageStars[0] in sync and the code round-trips', async () => {
    const name = freshName();
    const store = await openGameStore({ dbName: name, newId: ids() });
    const pid = store.getSnapshot().profile.id;
    // Normal play never sends stageStars: two sessions, the second better.
    await store.commitSession(
      session(pid, 'b1', { levels: { field: { stars: 1, bestScore: 10 } } }),
    );
    await store.commitSession(
      session(pid, 'b2', { levels: { field: { stars: 3, bestScore: 30 } } }),
    );
    expect(store.getSnapshot().levelProgress.field).toMatchObject({ stars: 3, stageStars: [3] });
    // A stage-2 star on top (the test hook sends stars following stage 1).
    await store.commitSession(
      session(pid, 'b3', {
        levels: { field: { stars: 3, bestScore: 30, stageStars: [3, 2] } },
      }),
    );
    const snap = store.getSnapshot();
    expect(snap.levelProgress.field).toMatchObject({ stars: 3, stageStars: [3, 2] });
    const code = encodeSaveCodeV4(snap, { sound: true, music: false });
    const { records } = importOfDecodedSaveCode(decodeSaveCode(code), AT);
    expect(records.levels.field?.stageStars).toEqual([3, 2]);
    store.close();
  });

  it('rejects stage stars outside 0–3 or longer than the cap', async () => {
    const name = freshName();
    const store = await openGameStore({ dbName: name, newId: ids() });
    const pid = store.getSnapshot().profile.id;
    await expect(
      store.commitSession(
        session(pid, 'b1', { levels: { field: { stars: 1, bestScore: 0, stageStars: [4] } } }),
      ),
    ).rejects.toThrow();
    await expect(
      store.commitSession(
        session(pid, 'b2', {
          levels: { field: { stars: 1, bestScore: 0, stageStars: [1, 1, 1, 1, 1, 1, 1, 1, 1] } },
        }),
      ),
    ).rejects.toThrow();
    store.close();
  });
});
