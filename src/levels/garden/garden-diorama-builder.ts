// The riverside garden: the recovered garden palette (region green #c9dd7c, cream fence
// 0xf2e5bd, soil beds 0xb29362 with green heads and yellow blossoms, the scarecrow flag and the
// sand plate 0xe8c97b), `buildTree` around it and VLM (`buildMiloModel`) beside the work spot.
// Built from the recovered primitives into a scratch context and baked into one mesh.
import {
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  Scene,
} from 'three';
import { SKY_HORIZON_COLOR } from '../../config/world-constants';
import { buildMiloModel } from '../../world/characters-milo-avatar';
import { buildTree } from '../../world/props-house-tree';
import type { WorldBuildContext } from '../../world/world-build-context';
import { WORLD_LIGHTING } from '../../world/world-lighting-tuning';
import { addBox, addCylinder, addSphere } from '../../world/world-primitives';
import { bakeVertexColoredGeometry } from '../shared/bake-vertex-colored-geometry';

/** Recovered garden colours (`village-garden-builder.ts`, region colour). */
export const GARDEN_COLORS = {
  ground: 0xc9dd7c,
  grass: 0xb4cf6c,
  fence: 0xf2e5bd,
  soil: 0xb29362,
  leaf: 0x5aab59,
  blossom: 0xedb958,
  pole: 0x8b7049,
  flag: 0xffc956,
  plate: 0xe8c97b,
} as const;

/** Where VLM stands (left of the pots, the balance and the seed bags). */
export const GUIDE_AT = { x: -5.4, z: 1.4 } as const;

/** [x, z, scale, variant] of the trees around the garden. */
const TREES: readonly (readonly [number, number, number, number])[] = [
  [-11, -6, 1.3, 1],
  [-12.5, 0.5, 1.1, 2],
  [11.5, -6.5, 1.4, 3],
  [12.5, 0, 1.05, 4],
  [-9, -10, 1.2, 5],
  [9, -10.5, 1.25, 6],
];

function scratchContext(scene: Scene): WorldBuildContext {
  return {
    scene,
    materials: new Map(),
    obstacles: [],
    floaters: [],
    ripples: [],
    windmill: new Group(),
  };
}

function buildGardenGround(ctx: WorldBuildContext): void {
  const root = ctx.scene;
  const C = GARDEN_COLORS;
  addBox(ctx, root, 0, -0.1, -2, 44, 0.2, 32, C.grass);
  addBox(ctx, root, 0, 0.01, -1, 22, 0.04, 12, C.ground);
  addCylinder(ctx, root, 0, 0.05, 0.6, 5.2, 5.2, 0.08, C.plate, 16);
  // Fence along the back: posts and one rail, as in the region builder.
  for (let i = 0; i < 12; i++)
    addBox(ctx, root, -9.9 + i * 1.8, 0.65, -6.6, 0.15, 1.3, 0.15, C.fence);
  addBox(ctx, root, 0, 0.8, -6.6, 20, 0.15, 0.15, C.fence);
  // Vegetable beds left and right of the work spot.
  for (const x of [-9.2, -7.6, 7.6, 9.2]) {
    addBox(ctx, root, x, 0.09, -2.6, 1, 0.12, 5.5, C.soil);
    for (let i = 0; i < 6; i++) {
      addSphere(ctx, root, x, 0.35, -4.6 + i * 0.8, 0.32, C.leaf);
      addSphere(ctx, root, x, 0.54, -4.6 + i * 0.8, 0.15, C.blossom);
    }
  }
  // The scarecrow flag behind, on the right.
  addCylinder(ctx, root, 5.2, 2.1, -5, 0.08, 0.08, 4.2, C.pole);
  addBox(ctx, root, 5.8, 3.6, -5, 1.2, 0.8, 0.06, C.flag);
}

export interface GardenDiorama {
  readonly sun: DirectionalLight;
}

/** Builds the garden, VLM, sky colour and lights into `scene`. */
export function buildGardenDiorama(scene: Scene): GardenDiorama {
  scene.background = new Color(SKY_HORIZON_COLOR);
  const scratch = new Scene();
  const ctx = scratchContext(scratch);
  buildGardenGround(ctx);
  for (const [x, z, scale, variant] of TREES) buildTree(ctx, x, z, scale, variant);
  const guide = new Group();
  guide.position.set(GUIDE_AT.x, 0, GUIDE_AT.z);
  guide.rotation.y = 0.5;
  buildMiloModel(ctx, guide);
  scratch.add(guide);
  const material = new MeshStandardMaterial({
    vertexColors: true,
    roughness: WORLD_LIGHTING.roughness.primitive,
    metalness: 0,
    flatShading: true,
  });
  const mesh = new Mesh(bakeVertexColoredGeometry(scratch), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  const { hemisphereSky, hemisphereGround, hemisphereIntensity } = WORLD_LIGHTING;
  scene.add(new HemisphereLight(hemisphereSky, hemisphereGround, hemisphereIntensity));
  const sun = new DirectionalLight(WORLD_LIGHTING.sunColor, WORLD_LIGHTING.sunIntensity);
  sun.position.set(-8, 18, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.normalBias = 0.045;
  sun.shadow.bias = -0.0003;
  sun.shadow.radius = WORLD_LIGHTING.shadowRadius;
  Object.assign(sun.shadow.camera, {
    left: -14,
    right: 14,
    top: 10,
    bottom: -10,
    near: 1,
    far: 60,
  });
  sun.shadow.camera.updateProjectionMatrix();
  scene.add(sun, sun.target);
  return { sun };
}
