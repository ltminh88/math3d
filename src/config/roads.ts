// Road polylines on the world ground plane, as [x, z] points (recovered verbatim).

export type RoadPoint = readonly [x: number, z: number];

export const ROADS: readonly (readonly RoadPoint[])[] = [
  [
    [-17.5, 1],
    [3.5, 1],
  ],
  [
    [-10, -14],
    [-10, 6],
  ],
  [
    [10, 0],
    [22, 0],
    [46, 0],
  ],
  [
    [46, 0],
    [57, -15],
  ],
  [
    [46, 0],
    [57, 11],
  ],
  [
    [30, 0],
    [36, -13],
  ],
  [
    [30, 0],
    [34, 14],
  ],
  [
    [-17.5, 1],
    [-33, -1],
    [-36, -7],
  ],
  [
    [-33, -1],
    [-40, 14],
  ],
];
