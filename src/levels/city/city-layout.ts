// Where things stand in the city diorama (world units, +z towards the camera): four houses on
// the street, the parcels on the road in front, the tall building in the houses' place for the
// windows rounds, and the window grid of that building.
import type { GroundPoint } from '../../core/input/interaction-types';

export const HOUSE_X: readonly number[] = [-7.2, -2.4, 2.4, 7.2];
export const HOUSE_Z = -1.6;
export const HOUSE_SCALE = 0.85;
/** Reverse delivery uses one house: the second one from the left (centre of the picture). */
export const REVERSE_HOUSE = 1;
/** Drop area in front of each door (circle radius). */
export const HOUSE_ZONE_RADIUS = 1.5;
export const houseZoneCenter = (index: number): GroundPoint => ({
  x: HOUSE_X[index] ?? 0,
  z: 0.9,
});

export const PARCEL_Z = 3.4;
export const PARCEL_Y = 0.32;
export const PARCEL_SIZE = 0.64;
/** Parcel x positions: one parcel in the middle, or three side by side. */
export const parcelSlots = (count: number): number[] =>
  count === 1 ? [0] : Array.from({ length: count }, (_, i) => (i - (count - 1) / 2) * 1.9);

/** Tall building of the windows rounds (centre of its footprint and its front face). */
export const BUILDING_Z = -2;
export const BUILDING_DEPTH = 3;
export const FACADE_Z = BUILDING_Z + BUILDING_DEPTH / 2;
export const WINDOW_STEP_X = 0.8;
export const FLOOR_HEIGHT = 1;
export const GROUND_FLOOR_Y = 0.75;
export const MAX_FLOORS = 10;
export const MAX_WINDOWS_PER_FLOOR = 9;

export const buildingWidth = (perFloor: number): number => perFloor * WINDOW_STEP_X + 0.8;
export const buildingHeight = (floors: number): number => floors * FLOOR_HEIGHT + 0.5;
export const floorY = (floor: number): number => GROUND_FLOOR_Y + floor * FLOOR_HEIGHT;
export const windowX = (column: number, perFloor: number): number =>
  (column - (perFloor - 1) / 2) * WINDOW_STEP_X;

/** Postman and VLM on the road either side of the parcels (figures face the camera). */
export const POSTMAN_AT: GroundPoint = { x: -3.2, z: 3.7 };
export const GUIDE_AT: GroundPoint = { x: 3.4, z: 3.8 };
