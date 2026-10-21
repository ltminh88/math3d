// The village shop stall: a wooden counter under a striped awning with a big coin sign, baked
// into one vertex-coloured mesh. Built once after the world (after the scatter pass, like the
// level gates): no RNG draw, its collision circle appended to the obstacle list.
import type { Mesh } from 'three';
import { SHOP_STALL } from '../config/regions';
import type { WorldPublicApi } from '../world/world-public-api';
import { box, cylinder, type Part, partsMesh, sphere } from './vertex-color-parts';

const WOOD = 0x8c6947;
const WOOD_LIGHT = 0xb78a54;
const AWNING = [0xe8562f, 0xfff1cb] as const;

/** Reach of the stall from its centre (the player stands ~2 in front of the counter). */
export const STALL_REACH = 2.9;
const STALL_RADIUS = 1.5;
const FRONT_DISTANCE = 2.1;

function stallParts(): Part[] {
  const stripes = Array.from({ length: 6 }, (_, i) =>
    box(0.5, 0.08, 1.5, AWNING[i % 2] as number, [-1.25 + i * 0.5, 2.62, 0.2], [0.28, 0, 0]),
  );
  return [
    box(2.6, 1, 1, WOOD_LIGHT, [0, 0.5, 0.25]),
    box(2.7, 0.12, 1.15, WOOD, [0, 1.05, 0.28]),
    box(2.4, 0.5, 0.06, 0xf2e5bd, [0, 0.55, 0.78]),
    ...[-1.25, 1.25].flatMap((x) => [
      cylinder(0.08, 0.1, 2.7, WOOD, [x, 1.35, -0.25]),
      cylinder(0.08, 0.1, 2.3, WOOD, [x, 1.15, 0.72]),
    ]),
    ...stripes,
    cylinder(0.38, 0.38, 0.1, 0xffd064, [0, 3.2, 0.1], [Math.PI / 2, 0, 0], 14),
    box(0.08, 0.36, 0.04, 0xa97d25, [0, 3.2, 0.17]),
    sphere(0.17, 0x9774b8, [-0.75, 1.27, 0.35]),
    cylinder(0.18, 0.22, 0.2, 0x4d95a3, [-0.2, 1.21, 0.4]),
    sphere(0.15, 0xffce58, [0.45, 1.25, 0.35]),
    sphere(0.12, 0xf18e81, [0.85, 1.23, 0.45]),
  ];
}

/** Where the player stands to use the stall (in front of the counter). */
export function stallFrontPoint(): { x: number; z: number } {
  const [x, z] = SHOP_STALL.position;
  const { facing } = SHOP_STALL;
  return { x: x + Math.sin(facing) * FRONT_DISTANCE, z: z + Math.cos(facing) * FRONT_DISTANCE };
}

export function buildShopStall(world: WorldPublicApi): Mesh {
  const [x, z] = SHOP_STALL.position;
  const stall = partsMesh('shop-stall', stallParts());
  stall.position.set(x, 0, z);
  stall.rotation.y = SHOP_STALL.facing;
  world.scene.add(stall);
  world.obstacles.push({ x, z, radius: STALL_RADIUS });
  return stall;
}
