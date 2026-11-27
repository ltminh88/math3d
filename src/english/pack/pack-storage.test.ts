// Pack storage (Phase 3B): memory store round-trip + the IndexedDB fallback
// (node has no indexedDB, so `openPackStore()` must hand back memory there).
import { describe, expect, it } from 'vitest';
import { SYNTHETIC_PACK } from '../fixtures/synthetic-pack';
import { createMemoryPackStore, openPackStore } from './pack-storage';

describe('createMemoryPackStore', () => {
  it('loads null before anything is saved', async () => {
    const store = createMemoryPackStore();
    expect(await store.load()).toBeNull();
  });

  it('round-trips passphrase + pack', async () => {
    const store = createMemoryPackStore();
    await store.save('gia-dinh', SYNTHETIC_PACK);
    expect(await store.load()).toEqual({ passphrase: 'gia-dinh', pack: SYNTHETIC_PACK });
  });

  it('clearPassphrase keeps the pack for offline play', async () => {
    const store = createMemoryPackStore();
    await store.save('gia-dinh', SYNTHETIC_PACK);
    await store.clearPassphrase();
    expect(await store.load()).toEqual({ passphrase: '', pack: SYNTHETIC_PACK });
  });

  it('clear forgets everything', async () => {
    const store = createMemoryPackStore();
    await store.save('gia-dinh', SYNTHETIC_PACK);
    await store.clear();
    expect(await store.load()).toBeNull();
  });
});

describe('openPackStore', () => {
  it('falls back to memory when IndexedDB is missing', async () => {
    const store = await openPackStore();
    await store.save('gia-dinh', SYNTHETIC_PACK);
    expect(await store.load()).toEqual({ passphrase: 'gia-dinh', pack: SYNTHETIC_PACK });
  });

  it('accepts an explicit key (cec keeps the default current key)', async () => {
    const store = await openPackStore('current');
    await store.save('gia-dinh', SYNTHETIC_PACK);
    expect((await store.load())?.pack).toBe(SYNTHETIC_PACK);
  });
});
