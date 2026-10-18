import { describe, expect, it } from 'vitest';
import { loadGoldenTrace } from '../config/load-golden-trace-for-tests';
import { getGroundTuftDecor, getOuterBushDecor } from './map-decor';

interface MapDecorGolden {
  minimapDecor23: number[][];
  worldMapDecor7: number[][];
}

describe('map decor golden', () => {
  const golden = loadGoldenTrace<MapDecorGolden>('map-decor.json');

  it('outer bushes (seed 23) match the original ag() list exactly', () => {
    expect(getOuterBushDecor()).toEqual(golden.minimapDecor23);
  });

  it('ground tufts (seed 7) match the original og() list exactly', () => {
    expect(getGroundTuftDecor()).toEqual(golden.worldMapDecor7);
  });

  it('caches each list like the original module-level cache', () => {
    expect(getOuterBushDecor()).toBe(getOuterBushDecor());
    expect(getGroundTuftDecor()).toBe(getGroundTuftDecor());
  });
});
