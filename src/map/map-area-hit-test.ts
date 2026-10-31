// World-map hit test over both region lists: an exact chapter 2 footprint first, else the
// recovered `regionAtMapPoint` (golden-checked, unchanged).
import { expansionRegionAt } from '../config/expansion-region-lookup';
import type { AnyRegion } from '../config/expansion-regions';
import { regionAtMapPoint } from './map-view-transform';

export const areaAtMapPoint = (x: number, z: number): AnyRegion | undefined =>
  expansionRegionAt(x, z) ?? regionAtMapPoint(x, z);
