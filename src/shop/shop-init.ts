// Brings the shop into the world once it exists: the stall (built after the world and the level
// gates, so the scatter never shifts) and its interactable, then, once the store is connected,
// the applier that keeps equipped cosmetics in the scene. Idempotent: the HUD calls it on every
// refresh (the first refresh follows the world build, a later one the store hydrate).
import { SHOP_STALL } from '../config/regions';
import type { GameStore } from '../store/game-store-api';
import { gameState } from '../ui/game-state';
import { connectedStore } from '../ui/progress-sync';
import type { CosmeticSlot } from './cosmetic-catalog';
import { EquippedCosmeticsApplier } from './equipped-cosmetics-applier';
import { openShop } from './shop-panel';
import { buildShopStall, STALL_REACH } from './shop-stall-builder';
import { tshop } from './shop-strings';

let applier: EquippedCosmeticsApplier | undefined;
let followed: GameStore | undefined;

export function initShop(): void {
  const world = gameState.world;
  if (!world) return;
  if (!applier) {
    buildShopStall(world);
    world.registerInteractable({
      id: 'shop-stall',
      position: { x: SHOP_STALL.position[0], z: SHOP_STALL.position[1] },
      radius: STALL_REACH,
      label: () => tshop('stallLabel'),
      onInteract: openShop,
    });
    applier = new EquippedCosmeticsApplier(world);
  }
  const store = connectedStore();
  if (store && store !== followed) {
    followed = store;
    const target = applier;
    target.apply(store.getSnapshot());
    store.subscribe((snapshot) => target.apply(snapshot));
  }
}

/** Name of the mesh worn in `slot` (test hook and e2e read the scene through it). */
export const wornCosmeticName = (slot: CosmeticSlot): string | undefined =>
  applier?.meshIn(slot)?.name;
