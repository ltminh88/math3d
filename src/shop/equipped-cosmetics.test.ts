// Multi-equip reducer (phase 23): VLM and the avatar each wear one item per body spot
// (head/neck/back); village decor is an open list. The reducer is pure — the shop flow
// checks ownership, the store only persists the returned value.
import { describe, expect, it } from 'vitest';
import { COSMETIC_CATALOG, type CosmeticItem } from './cosmetic-catalog';
import {
  equippedIds,
  isEquipped,
  migrateEquippedV1,
  unwearItem,
  wearItem,
} from './equipped-cosmetics';

const item = (id: string): CosmeticItem => {
  const found = COSMETIC_CATALOG.find((c) => c.id === id);
  if (!found) throw new Error(id);
  return found;
};
const scarf = item('vlm-red-scarf');
const band = item('vlm-star-band');
const garland = item('vlm-flower-garland');
const cape = item('vlm-starry-cape');
const cap = item('avatar-blue-cap');
const pots = item('decor-flower-pots');
const lantern = item('decor-star-lantern');
const fountain = item('decor-fountain');

const EMPTY = { vlm: {}, avatar: {}, decor: [] };

describe('wearItem / unwearItem', () => {
  it('wears three spots at once (hat + scarf + cape on VLM)', () => {
    const worn = wearItem(wearItem(wearItem(EMPTY, band), scarf), cape);
    expect(worn).toEqual({
      vlm: { head: 'vlm-star-band', neck: 'vlm-red-scarf', back: 'vlm-starry-cape' },
      avatar: {},
      decor: [],
    });
    expect(isEquipped(worn, band)).toBe(true);
    expect(isEquipped(worn, scarf)).toBe(true);
    expect(isEquipped(worn, cape)).toBe(true);
    expect(equippedIds(worn)).toEqual(['vlm-star-band', 'vlm-red-scarf', 'vlm-starry-cape']);
  });

  it('a second hat swaps the first; the other spots stay worn', () => {
    const worn = wearItem(wearItem(EMPTY, band), scarf);
    const swapped = wearItem(worn, garland);
    expect(swapped.vlm).toEqual({ head: 'vlm-flower-garland', neck: 'vlm-red-scarf' });
    expect(isEquipped(swapped, band)).toBe(false);
    expect(isEquipped(swapped, garland)).toBe(true);
  });

  it('wears decor without limit, each once', () => {
    const worn = wearItem(wearItem(wearItem(EMPTY, pots), lantern), fountain);
    expect(worn.decor).toEqual(['decor-flower-pots', 'decor-star-lantern', 'decor-fountain']);
    expect(wearItem(worn, pots)).toEqual(worn);
  });

  it('unwears one item and leaves the rest worn', () => {
    const worn = wearItem(wearItem(wearItem(EMPTY, band), scarf), cape);
    const after = unwearItem(worn, scarf);
    expect(after.vlm).toEqual({ head: 'vlm-star-band', back: 'vlm-starry-cape' });
    expect(unwearItem(after, scarf)).toEqual(after);
    expect(isEquipped(after, scarf)).toBe(false);
  });

  it('keeps the two characters separate (same anchor, different owner)', () => {
    const worn = wearItem(wearItem(EMPTY, band), cap);
    expect(worn.vlm).toEqual({ head: 'vlm-star-band' });
    expect(worn.avatar).toEqual({ head: 'avatar-blue-cap' });
  });

  it('does not mutate its input', () => {
    const worn = wearItem(EMPTY, scarf);
    expect(EMPTY).toEqual({ vlm: {}, avatar: {}, decor: [] });
    expect(worn).not.toBe(EMPTY);
  });
});

describe('migrateEquippedV1 (old slot -> id map)', () => {
  it('maps each slot to its body spot (anchor from the catalog)', () => {
    expect(
      migrateEquippedV1({
        'vlm-outfit': 'vlm-red-scarf',
        'avatar-outfit': 'avatar-gold-crown',
        'village-decor': 'decor-fountain',
      }),
    ).toEqual({
      vlm: { neck: 'vlm-red-scarf' },
      avatar: { head: 'avatar-gold-crown' },
      decor: ['decor-fountain'],
    });
  });

  it('drops the unequipped sentinel, unknown ids and wrong-slot ids', () => {
    expect(
      migrateEquippedV1({
        'vlm-outfit': 'none',
        'avatar-outfit': 'retired-item',
        'village-decor': 'vlm-red-scarf',
      }),
    ).toEqual({ vlm: {}, avatar: {}, decor: [] });
  });

  it('an empty old map migrates to the empty model', () => {
    expect(migrateEquippedV1({})).toEqual({ vlm: {}, avatar: {}, decor: [] });
  });
});
