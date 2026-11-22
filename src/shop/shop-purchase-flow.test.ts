import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { openGameStore } from '../store/game-store';
import type { GameStore } from '../store/game-store-api';
import { COSMETIC_CATALOG, type CosmeticItem } from './cosmetic-catalog';
import {
  buyCosmetic,
  equipCosmetic,
  equippedOf,
  itemState,
  missingCoins,
  unequipItem,
} from './shop-purchase-flow';

let dbCounter = 0;

async function storeWithCoins(coins: number): Promise<GameStore> {
  const store = await openGameStore({ dbName: `shop-flow-${++dbCounter}` });
  const profileId = store.getSnapshot().profile.id;
  await store.commitSession({
    batchId: `seed-${dbCounter}`,
    profileId,
    clientTs: 1,
    v: 1,
    facts: {},
    levels: {},
    xp: 0,
    coins,
  });
  return store;
}

const item = (id: string): CosmeticItem => {
  const found = COSMETIC_CATALOG.find((c) => c.id === id);
  if (!found) throw new Error(id);
  return found;
};
const scarf = item('vlm-red-scarf');
const cape = item('vlm-starry-cape');

describe('shop purchase flow', () => {
  it('refuses an item the wallet cannot pay for, without touching the store', async () => {
    const store = await storeWithCoins(scarf.price - 5);
    const before = store.getSnapshot();
    expect(itemState(scarf, before)).toBe('too-expensive');
    expect(missingCoins(scarf, before)).toBe(5);
    expect(await buyCosmetic(store, scarf)).toEqual({
      ok: false,
      reason: 'insufficient-coins',
      missing: 5,
    });
    expect(store.getSnapshot()).toBe(before);
    store.close();
  });

  it('buys once: coins debited, item owned, a second buy is refused', async () => {
    const store = await storeWithCoins(100);
    expect(itemState(scarf, store.getSnapshot())).toBe('affordable');
    expect(await buyCosmetic(store, scarf)).toEqual({ ok: true });
    const after = store.getSnapshot();
    expect(after.wallet.coins).toBe(100 - scarf.price);
    expect(after.ownedCosmetics).toEqual([scarf.id]);
    expect(itemState(scarf, after)).toBe('owned');
    expect(await buyCosmetic(store, scarf)).toEqual({ ok: false, reason: 'already-owned' });
    expect(store.getSnapshot().wallet.coins).toBe(100 - scarf.price);
    store.close();
  });

  it('equips only owned items, several spots at once, and unequips one at a time', async () => {
    const store = await storeWithCoins(200);
    expect(await equipCosmetic(store, scarf)).toEqual({ ok: false, reason: 'not-owned' });
    expect(equippedOf(store.getSnapshot())).toEqual({ vlm: {}, avatar: {}, decor: [] });

    await buyCosmetic(store, scarf);
    await buyCosmetic(store, cape);
    expect(await equipCosmetic(store, scarf)).toEqual({ ok: true });
    expect(itemState(scarf, store.getSnapshot())).toBe('equipped');
    await equipCosmetic(store, cape);
    expect(equippedOf(store.getSnapshot()).vlm).toEqual({
      neck: 'vlm-red-scarf',
      back: 'vlm-starry-cape',
    });
    expect(itemState(scarf, store.getSnapshot())).toBe('equipped');
    expect(equippedOf(store.getSnapshot()).avatar).toEqual({});

    await unequipItem(store, cape);
    expect(store.getSnapshot().profile.settings.equipped.vlm).toEqual({
      neck: 'vlm-red-scarf',
    });
    expect(equippedOf(store.getSnapshot()).vlm).toEqual({ neck: 'vlm-red-scarf' });
    expect(itemState(cape, store.getSnapshot())).toBe('owned');
    store.close();
  });

  it('ignores an equipped id that is not owned, unknown, or in the wrong slot', async () => {
    const store = await storeWithCoins(0);
    await store.setEquipped({
      vlm: { neck: scarf.id }, // not owned
      avatar: { head: 'retired-item' }, // unknown
      decor: ['vlm-red-scarf'], // a VLM item placed as decor
    });
    expect(equippedOf(store.getSnapshot())).toEqual({ vlm: {}, avatar: {}, decor: [] });
    store.close();
  });
});
