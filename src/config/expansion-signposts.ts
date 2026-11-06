// Wooden signposts that guide a child to the chapter 2 regions, above all along the long walk
// from the workshop over the bridge to the cave on the west bank. Pure data: the world builder
// turns each post into a pole with arrow boards. Every post stands beside a road (never on it)
// and every board's `heading` is a ground direction [dx, dz] that points toward its target
// region within 30° (checked by expansion-signposts.test.ts). Kept apart from ROADS/REGIONS.
import type { ExpansionRegionId } from './expansion-regions';

export interface SignBoard {
  readonly target: ExpansionRegionId;
  /** Ground direction the arrow points to, [dx, dz] (any length). */
  readonly heading: readonly [dx: number, dz: number];
}

export interface Signpost {
  readonly id: string;
  /** Pole position on the ground, [x, z]. */
  readonly position: readonly [x: number, z: number];
  /** Top board first. */
  readonly boards: readonly SignBoard[];
}

export const EXPANSION_SIGNPOSTS: readonly Signpost[] = [
  // East bank, where the valley and workshop roads leave the trunk road.
  {
    id: 'east-junction',
    position: [42.5, 4.3],
    boards: [
      { target: 'cave', heading: [-1, 0] },
      { target: 'valley', heading: [0.05, -1] },
      { target: 'workshop', heading: [0, 1] },
    ],
  },
  // West bank, where the bridge road arrives: to the cave west, back over the bridge east.
  {
    id: 'west-bridgehead',
    position: [1, 4],
    boards: [
      { target: 'cave', heading: [-1, 0.45] },
      { target: 'workshop', heading: [1, 0.45] },
      { target: 'valley', heading: [1, -0.55] },
    ],
  },
  // West bank, at the fork past the village (the floating label hangs over this one).
  {
    id: 'west-junction',
    position: [-30.5, 2.6],
    boards: [
      { target: 'cave', heading: [-0.2, 1] },
      { target: 'workshop', heading: [1, 0.22] },
      { target: 'valley', heading: [1, -0.2] },
    ],
  },
  // Where the cave road leaves the rest-hut road.
  {
    id: 'cave-branch',
    position: [-33, 8.4],
    boards: [{ target: 'cave', heading: [0.309, 0.951] }],
  },
  // Halfway up the cave road.
  {
    id: 'cave-road',
    position: [-30.2, 17.2],
    boards: [{ target: 'cave', heading: [0.15, 1] }],
  },
];

/** The post the floating "Hang Đố Vui" world label stands over. */
export const LABELED_SIGNPOST_ID = 'west-junction';

/** True when (x, z) lies within `distance` of a signpost pole (the scatter is cleared there). */
export const nearSignpost = (x: number, z: number, distance: number): boolean =>
  EXPANSION_SIGNPOSTS.some(
    (post) => Math.hypot(x - post.position[0], z - post.position[1]) < distance,
  );
