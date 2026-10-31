// Roads to the chapter 2 regions, as [x, z] polylines starting on an original road. Kept apart
// from ROADS (golden, and the scatter's `nearRoad` test reads ROADS during its seeded draws);
// scatter instances on these roads are removed after the scatter pass instead.
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
    [-38.13, 10],
    [-30, 26.5],
  ],
];
