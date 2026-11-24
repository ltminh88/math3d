// The cosmetics on sale: visual only (never read by learning, quiz or level code). Prices follow
// the old-04 rule: a level run or the bridge quest (~30 coins) buys an item every 1-2 runs.

import type { CosmeticAnchor } from './cosmetic-anchors';
import * as build from './cosmetic-mesh-builders';
import type { Part } from './vertex-color-parts';

export type { CosmeticAnchor };

export type CosmeticSlot = 'vlm-outfit' | 'avatar-outfit' | 'village-decor';
export const COSMETIC_SLOTS: readonly CosmeticSlot[] = [
  'vlm-outfit',
  'avatar-outfit',
  'village-decor',
];

/** Same rule as the server's owned_cosmetics id check (phase 16). */
export const COSMETIC_ID_PATTERN = /^[a-z0-9-]{1,40}$/;

export interface CosmeticItem {
  /** Also the item's name key in the shop strings. */
  readonly id: string;
  readonly slot: CosmeticSlot;
  readonly price: number;
  readonly anchor: CosmeticAnchor;
  /**
   * Village ground spot [x, z] (decor only): each decoration stands on its own spot
   * beside the stall, off both village roads. Outfits ignore it.
   */
  readonly spot?: readonly [x: number, z: number];
  /** Fresh parts relative to the anchor (merged into one mesh by the applier). */
  readonly buildParts: () => Part[];
}

const item = (
  id: string,
  slot: CosmeticSlot,
  price: number,
  anchor: CosmeticAnchor,
  buildParts: () => Part[],
  spot?: readonly [x: number, z: number],
): CosmeticItem => ({ id, slot, price, anchor, buildParts, ...(spot ? { spot } : {}) });

export const COSMETIC_CATALOG: readonly CosmeticItem[] = [
  item('vlm-red-scarf', 'vlm-outfit', 20, 'neck', build.vlmRedScarf),
  item('vlm-star-band', 'vlm-outfit', 25, 'head', build.vlmStarBand),
  item('vlm-flower-garland', 'vlm-outfit', 35, 'head', build.vlmFlowerGarland),
  item('vlm-starry-cape', 'vlm-outfit', 50, 'back', build.vlmStarryCape),
  item('vlm-wizard-hat', 'vlm-outfit', 60, 'head', build.vlmWizardHat),
  item('vlm-round-glasses', 'vlm-outfit', 30, 'head', build.vlmRoundGlasses),
  item('vlm-star-pendant', 'vlm-outfit', 25, 'neck', build.vlmStarPendant),
  item('vlm-book-bag', 'vlm-outfit', 40, 'back', build.vlmBookBag),
  item('vlm-star-staff', 'vlm-outfit', 70, 'back', build.vlmStarStaff),
  item('vlm-moon-pin', 'vlm-outfit', 35, 'head', build.vlmMoonPin),
  item('vlm-rainbow-ribbon', 'vlm-outfit', 30, 'neck', build.vlmRainbowRibbon),
  item('avatar-blue-cap', 'avatar-outfit', 20, 'head', build.avatarBlueCap),
  item('avatar-striped-scarf', 'avatar-outfit', 25, 'neck', build.avatarStripedScarf),
  item('avatar-gold-crown', 'avatar-outfit', 45, 'head', build.avatarGoldCrown),
  item('avatar-butterfly-wings', 'avatar-outfit', 55, 'back', build.avatarButterflyWings),
  item('avatar-straw-hat', 'avatar-outfit', 30, 'head', build.avatarStrawHat),
  item('avatar-flower-lei', 'avatar-outfit', 35, 'neck', build.avatarFlowerLei),
  item('avatar-raincoat', 'avatar-outfit', 45, 'back', build.avatarRaincoat),
  item('avatar-knit-beanie', 'avatar-outfit', 40, 'head', build.avatarKnitBeanie),
  item('avatar-red-bow', 'avatar-outfit', 25, 'neck', build.avatarRedBow),
  item('avatar-backpack', 'avatar-outfit', 50, 'back', build.avatarBackpack),
  item('decor-flower-pots', 'village-decor', 20, 'ground', build.decorFlowerPots, [-3.6, -4.4]),
  item('decor-star-lantern', 'village-decor', 30, 'ground', build.decorStarLantern, [-6.8, -7.6]),
  item(
    'decor-paper-lanterns',
    'village-decor',
    40,
    'ground',
    build.decorPaperLanterns,
    [-1.0, -7.8],
  ),
  item('decor-fountain', 'village-decor', 60, 'ground', build.decorFountain, [-6.9, -1.8]),
  item('decor-peach-tree', 'village-decor', 55, 'ground', build.decorPeachTree, [-2.0, -2.5]),
  item('decor-chicken-coop', 'village-decor', 45, 'ground', build.decorChickenCoop, [-8.8, -5.8]),
  item('decor-rainbow-arch', 'village-decor', 50, 'ground', build.decorRainbowArch, [-4.5, -8.5]),
  item('decor-windmill', 'village-decor', 80, 'ground', build.decorWindmill, [-8.8, -8.6]),
  item('decor-number-sign', 'village-decor', 45, 'ground', build.decorNumberSign, [-1.3, -5.2]),
  item('decor-berry-bush', 'village-decor', 30, 'ground', build.decorBerryBush, [-3.4, -6.6]),
  item('decor-stone-frog', 'village-decor', 35, 'ground', build.decorStoneFrog, [-5.2, -3.0]),
];

const byId = new Map(COSMETIC_CATALOG.map((c) => [c.id, c]));

export const cosmeticById = (id: string): CosmeticItem | undefined => byId.get(id);

export const itemsInSlot = (slot: CosmeticSlot): CosmeticItem[] =>
  COSMETIC_CATALOG.filter((c) => c.slot === slot);
