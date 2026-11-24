import { describe, expect, it } from 'vitest';
import { PLACEMENT_BY_ID } from './cosmetic-anchors';
import {
  COSMETIC_CATALOG,
  COSMETIC_ID_PATTERN,
  COSMETIC_SLOTS,
  cosmeticById,
} from './cosmetic-catalog';
import { cosmeticName } from './shop-strings';
import { mergeParts } from './vertex-color-parts';

describe('cosmetic catalog', () => {
  it('has 11 VLM, 10 avatar and 11 decor items, with unique ids the server accepts', () => {
    expect(COSMETIC_SLOTS).toEqual(['vlm-outfit', 'avatar-outfit', 'village-decor']);
    expect(COSMETIC_CATALOG.filter((item) => item.slot === 'vlm-outfit')).toHaveLength(11);
    expect(COSMETIC_CATALOG.filter((item) => item.slot === 'avatar-outfit')).toHaveLength(10);
    expect(COSMETIC_CATALOG.filter((item) => item.slot === 'village-decor')).toHaveLength(11);
    const ids = COSMETIC_CATALOG.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(COSMETIC_ID_PATTERN);
      expect(cosmeticById(id)?.id).toBe(id);
    }
    expect(cosmeticById('unknown')).toBeUndefined();
  });

  it('agrees with the placement table the save code and migration read (phase 23)', () => {
    expect(Object.keys(PLACEMENT_BY_ID).sort()).toEqual(
      COSMETIC_CATALOG.map((item) => item.id).sort(),
    );
    for (const item of COSMETIC_CATALOG) {
      const placement = PLACEMENT_BY_ID[item.id];
      expect(placement?.anchor).toBe(item.anchor);
      expect(placement?.owner).toBe(
        item.slot === 'village-decor' ? 'decor' : item.slot === 'vlm-outfit' ? 'vlm' : 'avatar',
      );
    }
  });

  it('every decor item has its own village spot; outfits have none', () => {
    const spots = COSMETIC_CATALOG.filter((item) => item.slot === 'village-decor').map(
      (item) => item.spot,
    );
    expect(spots).toHaveLength(11);
    expect(spots.every(Boolean)).toBe(true);
    expect(new Set(spots.map((s) => s?.join(','))).size).toBe(11);
    for (const item of COSMETIC_CATALOG.filter((item) => item.slot !== 'village-decor'))
      expect(item.spot).toBeUndefined();
  });

  it('prices are whole coins between 20 and 120 (phase 24 raised the old 60 cap)', () => {
    for (const { price } of COSMETIC_CATALOG) {
      expect(Number.isInteger(price)).toBe(true);
      expect(price).toBeGreaterThanOrEqual(20);
      expect(price).toBeLessThanOrEqual(120);
    }
  });

  it('every item has a name and builds into one vertex-coloured geometry', () => {
    for (const item of COSMETIC_CATALOG) {
      expect(cosmeticName(item.id)).not.toContain('.');
      const geometry = mergeParts(item.buildParts());
      expect(geometry.getAttribute('position').count).toBeGreaterThan(0);
      expect(geometry.getAttribute('color').count).toBe(geometry.getAttribute('position').count);
      geometry.dispose();
    }
  });
});
