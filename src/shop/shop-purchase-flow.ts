// Pure shop rules over the game store: what an item's state is, and buy/equip/unequip calls that
// refuse early (no store write) when the rule says no. The store stays the only writer.
import type { GameStore } from '../store/game-store-api';
import type { GameSnapshot } from '../store/progress-repository';
import { type CosmeticItem, type CosmeticSlot, cosmeticById } from './cosmetic-catalog';

/**
 * Equipped value of an empty slot. The store requires a non-empty id and has no "unequip", so an
 * emptied slot stores this sentinel (never a catalog id).
 */
export const UNEQUIPPED = 'none';

export type ShopStore = Pick<GameStore, 'getSnapshot' | 'purchaseCosmetic' | 'equipCosmetic'>;
export type ItemState = 'equipped' | 'owned' | 'affordable' | 'too-expensive';
export type BuyResult =
  | { ok: true }
  | { ok: false; reason: 'already-owned' }
  | { ok: false; reason: 'insufficient-coins'; missing: number };
export type EquipResult = { ok: true } | { ok: false; reason: 'not-owned' };

const owns = (snapshot: GameSnapshot, item: CosmeticItem): boolean =>
  snapshot.ownedCosmetics.includes(item.id);

/** The owned catalog item worn in `slot`, if any (stale, unknown or foreign ids are ignored). */
export function equippedItem(snapshot: GameSnapshot, slot: CosmeticSlot): CosmeticItem | undefined {
  const item = cosmeticById(snapshot.profile.settings.equipped[slot] ?? UNEQUIPPED);
  return item && item.slot === slot && owns(snapshot, item) ? item : undefined;
}

/** Coins still needed to buy `item` (0 when affordable). */
export const missingCoins = (item: CosmeticItem, snapshot: GameSnapshot): number =>
  Math.max(0, item.price - snapshot.wallet.coins);

export function itemState(item: CosmeticItem, snapshot: GameSnapshot): ItemState {
  if (equippedItem(snapshot, item.slot) === item) return 'equipped';
  if (owns(snapshot, item)) return 'owned';
  return missingCoins(item, snapshot) > 0 ? 'too-expensive' : 'affordable';
}

export async function buyCosmetic(store: ShopStore, item: CosmeticItem): Promise<BuyResult> {
  const snapshot = store.getSnapshot();
  if (owns(snapshot, item)) return { ok: false, reason: 'already-owned' };
  const missing = missingCoins(item, snapshot);
  if (missing > 0) return { ok: false, reason: 'insufficient-coins', missing };
  const result = await store.purchaseCosmetic(item.id, item.price);
  if (result.ok) return result;
  if (result.reason === 'already-owned') return { ok: false, reason: 'already-owned' };
  return {
    ok: false,
    reason: 'insufficient-coins',
    missing: missingCoins(item, store.getSnapshot()),
  };
}

export async function equipCosmetic(store: ShopStore, item: CosmeticItem): Promise<EquipResult> {
  if (!owns(store.getSnapshot(), item)) return { ok: false, reason: 'not-owned' };
  await store.equipCosmetic(item.slot, item.id);
  return { ok: true };
}

export const unequipSlot = (store: ShopStore, slot: CosmeticSlot): Promise<void> =>
  store.equipCosmetic(slot, UNEQUIPPED);
