// Where each cosmetic hangs, as pure data (no three, no DOM): the single source of truth
// for the catalog's slot/anchor facts. The save-code decoder and the v2 store migration
// read this table — they cannot import the catalog itself (its builders use three), so
// the catalog test asserts the two listings agree on every item.
export type CosmeticAnchor = 'head' | 'neck' | 'back' | 'ground';

/** Which character (or the village ground) an item belongs to. */
export type CosmeticOwner = 'vlm' | 'avatar' | 'decor';

export interface CosmeticPlacement {
  readonly owner: CosmeticOwner;
  readonly anchor: CosmeticAnchor;
}

/** Anchor of every catalog id (phase 24 adds its items here too). */
export const PLACEMENT_BY_ID: Readonly<Record<string, CosmeticPlacement>> = {
  'vlm-red-scarf': { owner: 'vlm', anchor: 'neck' },
  'vlm-star-band': { owner: 'vlm', anchor: 'head' },
  'vlm-flower-garland': { owner: 'vlm', anchor: 'head' },
  'vlm-starry-cape': { owner: 'vlm', anchor: 'back' },
  'vlm-wizard-hat': { owner: 'vlm', anchor: 'head' },
  'vlm-round-glasses': { owner: 'vlm', anchor: 'head' },
  'vlm-star-pendant': { owner: 'vlm', anchor: 'neck' },
  'vlm-book-bag': { owner: 'vlm', anchor: 'back' },
  'avatar-blue-cap': { owner: 'avatar', anchor: 'head' },
  'avatar-striped-scarf': { owner: 'avatar', anchor: 'neck' },
  'avatar-gold-crown': { owner: 'avatar', anchor: 'head' },
  'avatar-butterfly-wings': { owner: 'avatar', anchor: 'back' },
  'avatar-straw-hat': { owner: 'avatar', anchor: 'head' },
  'avatar-flower-lei': { owner: 'avatar', anchor: 'neck' },
  'avatar-raincoat': { owner: 'avatar', anchor: 'back' },
  'decor-flower-pots': { owner: 'decor', anchor: 'ground' },
  'decor-star-lantern': { owner: 'decor', anchor: 'ground' },
  'decor-paper-lanterns': { owner: 'decor', anchor: 'ground' },
  'decor-fountain': { owner: 'decor', anchor: 'ground' },
  'decor-peach-tree': { owner: 'decor', anchor: 'ground' },
  'decor-chicken-coop': { owner: 'decor', anchor: 'ground' },
  'decor-rainbow-arch': { owner: 'decor', anchor: 'ground' },
};

export const placementOf = (id: string): CosmeticPlacement | undefined => PLACEMENT_BY_ID[id];
