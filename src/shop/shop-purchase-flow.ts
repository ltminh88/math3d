// Pure shop rules over the game store: what an item's state is, and buy/equip/unequip calls that
// refuse early (no store write) when the rule says no. The store stays the only writer.
// Phase 23: VLM and the avatar each wear one item per body spot (head/neck/back); village
// decor is an open list. The equipped value is computed by the reducer in
// equipped-cosmetics.ts and written wholesale with setEquipped.
import type { GameStore } from '../store/game-store-api';
import type { GameSnapshot } from '../store/progress-repository';
import type { CharacterAnchor, EquippedCosmetics } from '../store/save-schema';
import { type CosmeticItem, cosmeticById } from './cosmetic-catalog';
import { isEquipped, unwearItem, wearItem } from './equipped-cosmetics';

export type ShopStore = Pick<GameStore, 'getSnapshot' | 'purchaseCosmetic' | 'setEquipped'>;
export type ItemState = 'equipped' | 'owned' | 'affordable' | 'too-expensive';
export type BuyResult =
  | { ok: true }
  | { ok: false; reason: 'already-owned' }
  | { ok: false; reason: 'insufficient-coins'; missing: number };
export type EquipResult = { ok: true } | { ok: false; reason: 'not-owned' };

const owns = (snapshot: GameSnapshot, item: CosmeticItem): boolean =>
  snapshot.ownedCosmetics.includes(item.id);

const isCharacterAnchor = (a: string): a is CharacterAnchor =>
  a === 'head' || a === 'neck' || a === 'back';

/** The equipped value of a snapshot (never the raw stored map: stale ids are ignored). */
export function equippedOf(snapshot: GameSnapshot): EquippedCosmetics {
  const raw = snapshot.profile.settings.equipped;
  const vlm: Partial<Record<CharacterAnchor, string>> = {};
  const avatar: Partial<Record<CharacterAnchor, string>> = {};
  const decor: string[] = [];
  for (const [owner, spots] of [
    ['vlm', vlm],
    ['avatar', avatar],
  ] as const) {
    const slot = owner === 'vlm' ? 'vlm-outfit' : 'avatar-outfit';
    for (const [anchor, id] of Object.entries(raw[owner])) {
      const item = id && cosmeticById(id);
      if (
        item &&
        item.slot === slot &&
        isCharacterAnchor(anchor) &&
        item.anchor === anchor &&
        owns(snapshot, item)
      )
        spots[anchor] = id;
    }
  }
  for (const id of raw.decor) {
    const item = cosmeticById(id);
    if (item && item.slot === 'village-decor' && owns(snapshot, item) && !decor.includes(id))
      decor.push(id);
  }
  return { vlm, avatar, decor };
}

/** Coins still needed to buy `item` (0 when affordable). */
export const missingCoins = (item: CosmeticItem, snapshot: GameSnapshot): number =>
  Math.max(0, item.price - snapshot.wallet.coins);

export function itemState(item: CosmeticItem, snapshot: GameSnapshot): ItemState {
  if (isEquipped(equippedOf(snapshot), item)) return 'equipped';
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
  const snapshot = store.getSnapshot();
  if (!owns(snapshot, item)) return { ok: false, reason: 'not-owned' };
  await store.setEquipped(wearItem(equippedOf(snapshot), item));
  return { ok: true };
}

/** Takes `item` off (a no-op when it is not worn); other worn items stay on. */
export const unequipItem = (store: ShopStore, item: CosmeticItem): Promise<void> =>
  store.setEquipped(unwearItem(equippedOf(store.getSnapshot()), item));
