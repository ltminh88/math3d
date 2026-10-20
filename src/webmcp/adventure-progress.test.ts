import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { openGameStore } from '../store/game-store';
import { importLegacySave } from '../store/legacy-save-import';
import { createMemoryGameDb } from '../store/memory-database';
import { adventureProgressFromSnapshot } from './adventure-progress';

describe('read_adventure_progress payload', () => {
  it('reports store values under store field names, nothing personal', async () => {
    const store = await openGameStore({ db: createMemoryGameDb() });
    await importLegacySave(
      store,
      '{"version":1,"xp":260,"coins":40,"bridge":4,"questAccepted":true,"avatar":"girl"}',
    );
    const progress = adventureProgressFromSnapshot(store.getSnapshot());
    expect(progress).toEqual({
      app: 'math3d',
      xp: 260,
      coins: 40,
      level: 3,
      bridgeProgress: 4,
      avatarId: 'girl',
    });
    expect(Object.keys(progress)).not.toContain('profileId');
    store.close();
  });
});
