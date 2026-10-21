// The cosmetics on sale: visual only (never read by learning, quiz or level code). Prices follow
// the old-04 rule: a level run or the bridge quest (~30 coins) buys an item every 1-2 runs.
import * as build from './cosmetic-mesh-builders';
import type { Part } from './vertex-color-parts';

export type CosmeticSlot = 'vlm-outfit' | 'avatar-outfit' | 'village-decor';
export const COSMETIC_SLOTS: readonly CosmeticSlot[] = [
  'vlm-outfit',
  'avatar-outfit',
  'village-decor',
];

/** Same rule as the server's owned_cosmetics id check (phase 16). */
export const COSMETIC_ID_PATTERN = /^[a-z0-9-]{1,40}$/;

/** Where the item hangs: a character anchor, or the village decor slot ('ground'). */
export type CosmeticAnchor = 'head' | 'neck' | 'back' | 'ground';

export interface CosmeticItem {
  /** Also the item's name key in the shop strings. */
  readonly id: string;
  readonly slot: CosmeticSlot;
  readonly price: number;
  readonly anchor: CosmeticAnchor;
  /** Fresh parts relative to the anchor (merged into one mesh by the applier). */
  readonly buildParts: () => Part[];
}

const item = (
  id: string,
  slot: CosmeticSlot,
  price: number,
  anchor: CosmeticAnchor,
  buildParts: () => Part[],
): CosmeticItem => ({ id, slot, price, anchor, buildParts });

export const COSMETIC_CATALOG: readonly CosmeticItem[] = [
  item('vlm-red-scarf', 'vlm-outfit', 20, 'neck', build.vlmRedScarf),
  item('vlm-star-band', 'vlm-outfit', 25, 'head', build.vlmStarBand),
  item('vlm-flower-garland', 'vlm-outfit', 35, 'head', build.vlmFlowerGarland),
  item('vlm-starry-cape', 'vlm-outfit', 50, 'back', build.vlmStarryCape),
  item('avatar-blue-cap', 'avatar-outfit', 20, 'head', build.avatarBlueCap),
  item('avatar-striped-scarf', 'avatar-outfit', 25, 'neck', build.avatarStripedScarf),
  item('avatar-gold-crown', 'avatar-outfit', 45, 'head', build.avatarGoldCrown),
  item('avatar-butterfly-wings', 'avatar-outfit', 55, 'back', build.avatarButterflyWings),
  item('decor-flower-pots', 'village-decor', 20, 'ground', build.decorFlowerPots),
  item('decor-star-lantern', 'village-decor', 30, 'ground', build.decorStarLantern),
  item('decor-paper-lanterns', 'village-decor', 40, 'ground', build.decorPaperLanterns),
  item('decor-fountain', 'village-decor', 60, 'ground', build.decorFountain),
];

const byId = new Map(COSMETIC_CATALOG.map((c) => [c.id, c]));

export const cosmeticById = (id: string): CosmeticItem | undefined => byId.get(id);

export const itemsInSlot = (slot: CosmeticSlot): CosmeticItem[] =>
  COSMETIC_CATALOG.filter((c) => c.slot === slot);
