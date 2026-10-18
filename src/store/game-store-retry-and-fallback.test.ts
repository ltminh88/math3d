import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SessionDelta } from '../learning/learning-types';
import { type GameStore, openGameStore } from './game-store';
import { DbBlockedError } from './idb-database';
import { createMemoryGameDb } from './memory-database';
import { MIGRATIONS } from './save-migrations';

let dbCounter = 0;
const freshName = () => `retry-db-${++dbCounter}`;
const ids = () => {
  let n = 0;
  return () => `id-${++n}`;
};
const session = (profileId: string, batchId: string, over: Partial<SessionDelta> = {}) =>
  ({
    batchId,
    profileId,
    clientTs: 1000,
    v: 1,
    facts: { 'mul:2x3': { a: 2, c: 1, ms: 9000, box: 2, seenAt: 5000 } },
    levels: { bridge: { stars: 2, bestScore: 80 } },
    xp: 20,
    coins: 10,
    ...over,
  }) as SessionDelta;

afterEach(() => vi.unstubAllGlobals());

const backends: Array<[string, () => Promise<GameStore>]> = [
  ['indexeddb', () => openGameStore({ dbName: freshName(), newId: ids() })],
  ['memory', () => openGameStore({ db: createMemoryGameDb(), newId: ids() })],
];

describe.each(backends)('game store on %s', (_label, open) => {
  it('treats a retried batchId as already committed and still fires session-committed', async () => {
    const store = await open();
    const pid = store.getSnapshot().profile.id;
    let committed = 0;
    store.on('session-committed', () => committed++);
    await store.commitSession(session(pid, 'b1'));
    const after = store.getSnapshot();

    await expect(store.commitSession(session(pid, 'b1'))).resolves.toBeUndefined();
    expect(store.getSnapshot()).toEqual(after);
    expect(after.sessionCount).toBe(1);
    expect(committed).toBe(2);
    store.close();
  });

  it('rolls back every write when the outbox insert fails', async () => {
    const store = await open();
    const pid = store.getSnapshot().profile.id;
    await store.commitSession(session(pid, 'b1'));
    const before = store.getSnapshot();
    // A function cannot be structured-cloned: the outbox add (last write) throws DataCloneError.
    const poisoned = { ...session(pid, 'b2', { xp: 99 }), extra: () => 1 } as SessionDelta;
    await expect(store.commitSession(poisoned)).rejects.toThrow();
    expect(store.getSnapshot()).toEqual(before);
    await store.commitSession(session(pid, 'b3'));
    expect(store.getSnapshot().wallet).toEqual({ coins: 20, xp: 40 });
    store.close();
  });

  it('purchases atomically and reports persistence', async () => {
    const store = await open();
    expect(store.persistent).toBe(_label === 'indexeddb');
    await store.commitSession(session(store.getSnapshot().profile.id, 'b1', { coins: 30 }));
    expect(await store.purchaseCosmetic('hat', 25)).toEqual({ ok: true });
    expect(await store.purchaseCosmetic('hat', 25)).toEqual({ ok: false, reason: 'already-owned' });
    expect(store.getSnapshot()).toMatchObject({ ownedCosmetics: ['hat'], wallet: { coins: 5 } });
    store.close();
  });
});

describe('game store across tabs and environments', () => {
  it('derives the session number inside the transaction so two tabs never reuse it', async () => {
    const name = freshName();
    const tabA = await openGameStore({ dbName: name, newId: ids() });
    const tabB = await openGameStore({ dbName: name, newId: ids() });
    const pid = tabA.getSnapshot().profile.id;
    await tabA.commitSession(session(pid, 'a1'));
    await tabB.commitSession(session(pid, 'b1'));
    expect(tabB.getSnapshot().sessionCount).toBe(2);
    expect(tabB.getSnapshot().factStats['mul:2x3']?.lastSeenSession).toBe(2);
    tabA.close();
    tabB.close();
  });

  it('falls back to an in-memory store when IndexedDB is unavailable', async () => {
    vi.stubGlobal('indexedDB', undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const store = await openGameStore({ dbName: freshName(), newId: ids() });
    expect(store.persistent).toBe(false);
    await store.commitSession(session(store.getSnapshot().profile.id, 'b1'));
    expect(store.getSnapshot().wallet).toEqual({ coins: 10, xp: 20 });
    store.close();
  });

  it('does not fall back when blocked by another tab (progress would silently be lost)', async () => {
    const name = freshName();
    const stale = await new Promise<IDBDatabase>((resolve) => {
      const req = indexedDB.open(name, 1);
      req.onsuccess = () => resolve(req.result);
    });
    await expect(
      openGameStore({
        dbName: name,
        migrations: [...MIGRATIONS, { version: 2, up() {} }],
        blockedTimeoutMs: 20,
      }),
    ).rejects.toBeInstanceOf(DbBlockedError);
    stale.close();
  });
});
