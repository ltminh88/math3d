// Roads to the chapter 2 regions, as [x, z] polylines starting on an original road. Kept apart
// from ROADS (golden, and the scatter's `nearRoad` test reads ROADS during its seeded draws);
// scatter instances on these roads are removed after the scatter pass instead.
// Order matches EXPANSION_REGIONS (checked by expansion-region-lookup.test.ts): valley,
// workshop, cave, market, numberfort, island.
import type { RoadPoint } from './roads';

export const EXPANSION_ROADS: readonly (readonly RoadPoint[])[] = [
  // Valley (north-east): from the east trunk's end, between the meadow and the tower.
  [
    [46, 0],
    [47.5, -34],
  ],
  // Workshop (south-east): from the east trunk's end, between the forest and the city.
  [
    [46, 0],
    [46, 36],
  ],
  // Cave (west bank): from the gazebo road, east of the gazebo mound.
  [
    [-36.5, 6.5],
    [-30, 26.5],
  ],
  // Market (west bank north): from the pond road's end, north past the pond's east edge
  // (the road end sits at the pond's rim, as the original road does), then into the market.
  [
    [-36, -7],
    [-36, -5],
    [-31, -5],
    [-31, -28],
  ],
  // Numberfort (east bank, between city and tower): from the tower diagonal, into the fort.
  [
    [53, -9.55],
    [57, -2],
  ],
  // Island (west bank, south of the bridge road): from the bridge road, into the islet.
  // The road runs clear of the player spawn (-6, 6) and VLM (-3, 1.5).
  [
    [-8, 1],
    [-8, 8],
  ],
];
