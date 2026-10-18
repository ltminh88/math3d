import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import type { SessionDelta } from '../learning/learning-types';
import { createSessionRecorder } from '../learning/session-recorder';
import { openGameStore } from './game-store';
import { openGameDb } from './idb-database';

let dbCounter = 0;
const freshName = () => `test-db-${++dbCounter}`;
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
    facts: { 'mul:2x3': { a: 2, c: 1, ms: 9000, box: 2, seenAt: 5000 } },
    levels: { bridge: { stars: 2, bestScore: 80 } },
    xp: 20,
    coins: 10,
    ...over,
  };
}
async function allOutbox(name: string) {
  const db = await openGameDb({ name });
  const items = await db.getAll('outbox');
  db.close();
  return items;
}

describe('game store', () => {
  it('bootstraps a guest profile once and reloads an identical snapshot', async () => {
    const name = freshName();
    const store = await openGameStore({ dbName: name, newId: ids() });
    const { profile } = store.getSnapshot();
    expect(profile).toMatchObject({ kind: 'guest', unlockFailures: 0 });
    await store.commitSession(session(profile.id, 'b1'));
    const before = store.getSnapshot();
    store.close();

    const reopened = await openGameStore({ dbName: name, newId: ids() });
    expect(reopened.getSnapshot()).toEqual(before);
    expect(reopened.getSnapshot().profile.id).toBe(profile.id);
    reopened.close();
  });

  it('commitSession updates facts, levels, wallet, counter and appends exactly one outbox item', async () => {
    const name = freshName();
    const store = await openGameStore({ dbName: name, now: () => 42, newId: ids() });
    const events: SessionDelta[] = [];
    store.on('session-committed', (e) => events.push(e.delta));
    const pid = store.getSnapshot().profile.id;

    await store.commitSession(session(pid, 'b1'), {
      'mul:2x3': { streak: 1, fluent: false, errs: [7] },
    });
    await store.commitSession(
      session(pid, 'b2', { levels: { bridge: { stars: 1, bestScore: 95 } } }),
    );

    const snap = store.getSnapshot();
    expect(snap.factStats['mul:2x3']).toMatchObject({
      attempts: 4,
      correct: 2,
      totalMs: 18000,
      box: 2,
      streak: 1,
      errs: [7],
      lastSeenSession: 2,
    });
    expect(snap.levelProgress.bridge).toMatchObject({ stars: 2, bestScore: 95 });
    expect(snap.wallet).toEqual({ coins: 20, xp: 40 });
    expect(snap.sessionCount).toBe(2);
    expect(store.nextSessionNo()).toBe(3);
    expect(events.map((d) => d.batchId)).toEqual(['b1', 'b2']);
    const outbox = await allOutbox(name);
    expect(outbox.map((o) => o.batchId)).toEqual(['b1', 'b2']);
    expect(outbox[0]?.payload).toEqual(session(pid, 'b1'));
    store.close();
  });

  it('is atomic: a failure mid-transaction changes nothing and leaves no outbox record', async () => {
    const name = freshName();
    const store = await openGameStore({ dbName: name, newId: ids() });
    const pid = store.getSnapshot().profile.id;
    await store.commitSession(session(pid, 'b1'));
    const before = store.getSnapshot();

    // A function cannot be structured-cloned: the outbox insert (last write) throws DataCloneError
    // after facts/levels/wallet/counter were already written in the same transaction.
    const clash = {
      ...session(pid, 'b2', {
        facts: { 'mul:5x5': { a: 1, c: 1, ms: 1000, box: 2, seenAt: 9000 } },
        xp: 99,
        coins: 99,
      }),
      poison: () => 1,
    } as SessionDelta;
    await expect(store.commitSession(clash)).rejects.toThrow();

    expect(store.getSnapshot()).toEqual(before);
    store.close();
    const reopened = await openGameStore({ dbName: name });
    expect(reopened.getSnapshot()).toEqual(before);
    expect(reopened.getSnapshot().factStats['mul:5x5']).toBeUndefined();
    expect(await allOutbox(name)).toHaveLength(1);
    reopened.close();
  });

  it('rejects malformed deltas at the boundary', async () => {
    const name = freshName();
    const store = await openGameStore({ dbName: name, newId: ids() });
    const pid = store.getSnapshot().profile.id;
    const bad: SessionDelta[] = [
      session('someone-else', 'x1'),
      session(pid, 'x2', { facts: { 'mul:3x2': { a: 1, c: 1, ms: 1, box: 1, seenAt: 1 } } }),
      session(pid, 'x3', { facts: { 'mul:2x3': { a: 1, c: 2, ms: 1, box: 1, seenAt: 1 } } }),
      session(pid, 'x4', { facts: { 'mul:2x3': { a: 1, c: 1, ms: 1, box: 6, seenAt: 1 } } }),
      session(pid, 'x5', { xp: -1 }),
      session(pid, 'x6', { coins: -5 }),
      session(pid, 'x7', { cosmetics: ['hat'] }),
      { ...session(pid, 'x8'), v: 2 as 1 },
    ];
    for (const d of bad) await expect(store.commitSession(d)).rejects.toThrow();
    expect(await allOutbox(name)).toHaveLength(0);
    expect(store.getSnapshot().sessionCount).toBe(0);
    store.close();
  });

  it('purchaseCosmetic with insufficient coins changes nothing', async () => {
    const name = freshName();
    const store = await openGameStore({ dbName: name, newId: ids() });
    const pid = store.getSnapshot().profile.id;
    await store.commitSession(session(pid, 'b1', { coins: 10 }));
    const before = store.getSnapshot();
    expect(await store.purchaseCosmetic('hat', 25)).toEqual({
      ok: false,
      reason: 'insufficient-coins',
    });
    expect(store.getSnapshot()).toEqual(before);
    expect(await allOutbox(name)).toHaveLength(1);
    store.close();
  });

  it('purchaseCosmetic debits once, owns the item and emits one outbox item', async () => {
    const name = freshName();
    const store = await openGameStore({ dbName: name, newId: ids() });
    const pid = store.getSnapshot().profile.id;
    await store.commitSession(session(pid, 'b1', { coins: 30 }));
    let committed = 0;
    store.on('session-committed', () => committed++);

    expect(await store.purchaseCosmetic('hat', 25)).toEqual({ ok: true });
    expect(store.getSnapshot().wallet.coins).toBe(5);
    expect(store.getSnapshot().ownedCosmetics).toEqual(['hat']);
    expect(store.getSnapshot().sessionCount).toBe(1);
    const outbox = await allOutbox(name);
    expect(outbox).toHaveLength(2);
    expect(outbox[1]?.payload).toMatchObject({ coins: -25, cosmetics: ['hat'], facts: {}, v: 1 });
    expect(committed).toBe(1);

    expect(await store.purchaseCosmetic('hat', 25)).toEqual({ ok: false, reason: 'already-owned' });
    expect(store.getSnapshot().wallet.coins).toBe(5);
    expect(await allOutbox(name)).toHaveLength(2);
    await expect(store.purchaseCosmetic('x', 0)).rejects.toThrow();
    await expect(store.purchaseCosmetic('x', 1.5)).rejects.toThrow();
    store.close();
  });

  it('serializes concurrent purchases so coins never go negative', async () => {
    const store = await openGameStore({ dbName: freshName(), newId: ids() });
    await store.commitSession(session(store.getSnapshot().profile.id, 'b1', { coins: 30 }));
    const results = await Promise.all([
      store.purchaseCosmetic('a', 20),
      store.purchaseCosmetic('b', 20),
    ]);
    expect(results.filter((r) => r.ok)).toHaveLength(1);
    expect(store.getSnapshot().wallet.coins).toBe(10);
    store.close();
  });

  it('equipCosmetic persists in profile settings across reload', async () => {
    const name = freshName();
    const store = await openGameStore({ dbName: name, newId: ids() });
    await store.equipCosmetic('hat', 'hat-red');
    expect(store.getSnapshot().profile.settings.equipped).toEqual({ hat: 'hat-red' });
    store.close();
    const reopened = await openGameStore({ dbName: name });
    expect(reopened.getSnapshot().profile.settings.equipped).toEqual({ hat: 'hat-red' });
    reopened.close();
  });

  it('commits a real recorder session end to end', async () => {
    const store = await openGameStore({ dbName: freshName(), newId: ids() });
    const rec = createSessionRecorder({
      profileId: store.getSnapshot().profile.id,
      levelId: 'bridge',
      sessionNo: store.nextSessionNo(),
      getStat: (k) => store.getSnapshot().factStats[k],
      now: () => 7000,
      newId: () => 'rec-1',
    });
    rec.recordQuestion({
      factKey: 'mul:2x5',
      ms: 2500,
      correct: true,
      firstTry: true,
      usedHint: false,
      wrongAnswers: [],
    });
    const { delta, local } = rec.finish();
    await store.commitSession(delta, local);
    expect(store.getSnapshot().factStats['mul:2x5']).toMatchObject({
      box: 2,
      fluent: true,
      streak: 1,
    });
    store.close();
  });

  it('notifies snapshot subscribers and survives a throwing listener', async () => {
    const store = await openGameStore({ dbName: freshName(), newId: ids() });
    let seen = 0;
    store.subscribe(() => {
      throw new Error('boom');
    });
    store.subscribe(() => seen++);
    await store.commitSession(session(store.getSnapshot().profile.id, 'b1'));
    expect(seen).toBe(1);
    store.close();
  });
});
