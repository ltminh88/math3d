import { describe, expect, it } from 'vitest';
import { expansionRegionText } from './expansion-region-strings';
import { EXPANSION_REGIONS } from './expansion-regions';

describe('expansion region strings', () => {
  it('vi text mirrors the config (the source the map and HUD fall back to)', () => {
    for (const region of EXPANSION_REGIONS) {
      expect(expansionRegionText(region, 'name')).toBe(region.name);
      expect(expansionRegionText(region, 'subtitle')).toBe(region.subtitle);
      expect(expansionRegionText(region, 'blurb')).toBe(region.blurb);
    }
  });
});
