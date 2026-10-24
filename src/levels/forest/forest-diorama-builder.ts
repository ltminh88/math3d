// The forest clearing: recovered trees (props-house-tree `buildTree`, the same builder as the
// world's forest region) in a ring, ground, path, stumps, mushrooms and the leaf mat for the fruit
// pile. Built with the recovered primitives into a scratch context, then baked to one mesh.
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
import { PILE_CENTER } from './forest-layout';

/** Forest ground, path and stump colours of the recovered forest region builder. */
const FOREST_GROUND = 0x6fa55b;
const CLEARING = 0x86b862;
const PATH = 0xd2b77d;
const STUMP = 0x8e6b4c;
const MUSHROOM_STEM = 0xf6ecd4;
const MUSHROOM_CAP = 0xd9534a;
const LEAF_MAT = 0x4f9a62;

/** Tree ring behind and beside the clearing: [x, z, scale]; variant = index + 2 like the world. */
const TREES: readonly (readonly [number, number, number])[] = [
  [-9.5, -6.5, 1.1],
  [-6.8, -7.6, 0.95],
  [-3.6, -8.2, 1.2],
  [-0.4, -8.8, 1.05],
  [2.8, -8.1, 1.15],
  [6, -7.4, 0.9],
  [9.2, -6.2, 1.2],
  [-10.8, -2.2, 1],
  [10.9, -1.8, 1.05],
  [-9.6, 2.8, 0.85],
  [9.8, 3.2, 0.95],
  [-7.6, -4.6, 0.7],
  [7.8, -4.4, 0.75],
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

function buildGroundAndProps(ctx: WorldBuildContext, root: Object3D): void {
  addBox(ctx, root, 0, -0.1, -2, 34, 0.2, 26, FOREST_GROUND);
  addCylinder(ctx, root, 0, 0.02, 0, 6.8, 7.2, 0.06, CLEARING, 24);
  addBox(ctx, root, 0, 0.05, 6.5, 1.8, 0.08, 6, PATH);
  addCylinder(ctx, root, PILE_CENTER.x, 0.08, PILE_CENTER.z, 1.15, 1.2, 0.08, LEAF_MAT, 10);
  for (const [x, z] of [
    [-6.2, 1.8],
    [6.4, 1.2],
    [-5.4, -4.8],
  ] as const) {
    addCylinder(ctx, root, x, 0.22, z, 0.42, 0.5, 0.44, STUMP, 9);
  }
  for (let i = 0; i < 5; i++) {
    const x = 5 + (i % 3) * 0.6;
    const z = 3.6 + Math.floor(i / 3) * 0.7;
    addCylinder(ctx, root, x, 0.2, z, 0.08, 0.1, 0.4, MUSHROOM_STEM, 6);
    addSphere(ctx, root, x, 0.45, z, 0.24, MUSHROOM_CAP).scale.y = 0.6;
  }
  for (let i = 0; i < 4; i++) {
    addSphere(ctx, root, -4.6 + i * 0.5, 0.12, 4.4 - (i % 2) * 0.4, 0.22, 0xa7a58c).scale.y = 0.5;
  }
}

export interface ForestDiorama {
  readonly root: Group;
  readonly sun: DirectionalLight;
}

/** Builds the clearing, sky colour and lights into `scene`. */
export function buildForestDiorama(scene: Scene): ForestDiorama {
  scene.background = new Color(SKY_HORIZON_COLOR);
  const scratch = new Scene();
  const ctx = scratchContext(scratch);
  buildGroundAndProps(ctx, scratch);
  TREES.forEach(([x, z, scale], i) => {
    buildTree(ctx, x, z, scale, i + 2);
  });
  const material = new MeshStandardMaterial({
    vertexColors: true,
    roughness: WORLD_LIGHTING.roughness.primitive,
    metalness: 0,
  });
  const mesh = new Mesh(bakeVertexColoredGeometry(scratch), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  const root = new Group();
  root.add(mesh);
  scene.add(root);

  const { hemisphereSky, hemisphereGround, hemisphereIntensity } = WORLD_LIGHTING;
  scene.add(new HemisphereLight(hemisphereSky, hemisphereGround, hemisphereIntensity));
  const sun = new DirectionalLight(WORLD_LIGHTING.sunColor, WORLD_LIGHTING.sunIntensity);
  sun.position.set(-9, 16, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.normalBias = 0.045;
  sun.shadow.bias = -0.0003;
  sun.shadow.radius = WORLD_LIGHTING.shadowRadius;
  Object.assign(sun.shadow.camera, {
    left: -14,
    right: 14,
    top: 12,
    bottom: -12,
    near: 1,
    far: 50,
  });
  sun.shadow.camera.updateProjectionMatrix();
  scene.add(sun, sun.target);
  return { root, sun };
}
