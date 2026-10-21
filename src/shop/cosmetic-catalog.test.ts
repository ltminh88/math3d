import { describe, expect, it } from 'vitest';
import {
  COSMETIC_CATALOG,
  COSMETIC_ID_PATTERN,
  COSMETIC_SLOTS,
  cosmeticById,
} from './cosmetic-catalog';
import { UNEQUIPPED } from './shop-purchase-flow';
import { cosmeticName } from './shop-strings';
import { mergeParts } from './vertex-color-parts';

describe('cosmetic catalog', () => {
  it('has 4 items in each of the three slots, with unique ids the server accepts', () => {
    expect(COSMETIC_SLOTS).toEqual(['vlm-outfit', 'avatar-outfit', 'village-decor']);
    for (const slot of COSMETIC_SLOTS) {
      expect(COSMETIC_CATALOG.filter((item) => item.slot === slot)).toHaveLength(4);
    }
    const ids = COSMETIC_CATALOG.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(COSMETIC_ID_PATTERN);
      expect(id).not.toBe(UNEQUIPPED);
      expect(cosmeticById(id)?.id).toBe(id);
    }
    expect(cosmeticById('unknown')).toBeUndefined();
  });

  it('prices are whole coins between 20 and 60 (one item every 1-2 runs)', () => {
    for (const { price } of COSMETIC_CATALOG) {
      expect(Number.isInteger(price)).toBe(true);
      expect(price).toBeGreaterThanOrEqual(20);
      expect(price).toBeLessThanOrEqual(60);
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
