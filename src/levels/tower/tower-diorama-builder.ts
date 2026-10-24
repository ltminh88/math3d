// The tower diorama: the recovered tower silhouette (purple body, cream rings, gold roof) rebuilt
// as seven stacked low-poly floors on the plinth, with meadow ground, trees and rocks around.
// Built from the recovered primitives into a scratch context, then baked to one mesh.
import {
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
  Scene,
} from 'three';
import { SKY_HORIZON_COLOR } from '../../config/world-constants';
import { buildTree } from '../../world/props-house-tree';
import type { WorldBuildContext } from '../../world/world-build-context';
import { WORLD_LIGHTING } from '../../world/world-lighting-tuning';
import { addBox, addCylinder, addSphere } from '../../world/world-primitives';
import { bakeVertexColoredGeometry } from '../shared/bake-vertex-colored-geometry';
import {
  TOWER_COLORS as C,
  FLOOR_COUNT,
  FLOOR_HEIGHT,
  floorBottom,
  floorRadius,
  ROOF_HEIGHT,
  TOP_Y,
} from './tower-layout';

/** Trees around the plinth: [x, z, scale]. */
const TREES: readonly (readonly [number, number, number])[] = [
  [-8.5, -4, 1.1],
  [-6.4, -7.2, 0.95],
  [7.2, -6.4, 1.15],
  [9.4, -2.6, 0.9],
  [-9.8, 1.6, 0.85],
  [9.6, 2.4, 1],
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

function buildTowerBody(ctx: WorldBuildContext, root: Object3D): void {
  addBox(ctx, root, 0, -0.1, -2, 40, 0.2, 30, C.ground);
  addCylinder(ctx, root, 0, 0.06, 0, 6.6, 7, 0.12, C.ground, 20);
  addCylinder(ctx, root, 0, 0.2, 0, 4.4, 4.6, 0.2, C.plinth, 14);
  for (let floor = 0; floor < FLOOR_COUNT; floor++) {
    const bottom = floorBottom(floor);
    const radius = floorRadius(floor);
    const color = floor % 2 === 0 ? C.body : C.bodyLight;
    addCylinder(
      ctx,
      root,
      0,
      bottom + FLOOR_HEIGHT / 2,
      0,
      radius,
      radius + 0.06,
      FLOOR_HEIGHT,
      color,
      10,
    );
    addCylinder(
      ctx,
      root,
      0,
      bottom + FLOOR_HEIGHT - 0.1,
      0,
      radius + 0.2,
      radius + 0.2,
      0.2,
      C.cornice,
      10,
    );
  }
  addCylinder(
    ctx,
    root,
    0,
    TOP_Y + ROOF_HEIGHT / 2,
    0,
    0,
    floorRadius(FLOOR_COUNT - 1) + 0.5,
    ROOF_HEIGHT,
    C.roof,
    10,
  );
  addBox(ctx, root, 0, 1.25, 2.85, 1.2, 1.9, 0.2, C.door);
  for (const [x, z, r] of [
    [-3.6, 4.6, 0.3],
    [4.4, 3.8, 0.24],
    [-5.2, -1.2, 0.34],
  ] as const) {
    addSphere(ctx, root, x, r * 0.5, z, r, 0xa7a58c).scale.y = 0.6;
  }
}

export interface TowerDiorama {
  readonly sun: DirectionalLight;
}

/** Builds the tower, sky colour and lights into `scene`. */
export function buildTowerDiorama(scene: Scene): TowerDiorama {
  scene.background = new Color(SKY_HORIZON_COLOR);
  const scratch = new Scene();
  const ctx = scratchContext(scratch);
  buildTowerBody(ctx, scratch);
  TREES.forEach(([x, z, scale], i) => {
    buildTree(ctx, x, z, scale, i + 1);
  });
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
  sun.position.set(-8, 20, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.normalBias = 0.045;
  sun.shadow.bias = -0.0003;
  sun.shadow.radius = WORLD_LIGHTING.shadowRadius;
  Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 16, bottom: -6, near: 1, far: 60 });
  sun.shadow.camera.updateProjectionMatrix();
  scene.add(sun, sun.target);
  return { sun };
}
