// The city street: recovered builders and palette (city ground and road of the region builder,
// `buildHouse` cottages, numbered blocks behind, lamps, `buildTree`, VLM's `buildMiloModel`) plus
// a low-poly postman. Built into scratch contexts and baked: the backdrop is one mesh, the four
// street houses another (hidden while the tall building of a windows round stands there).
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
import { buildHouse, buildTree } from '../../world/props-house-tree';
import type { WorldBuildContext } from '../../world/world-build-context';
import { WORLD_LIGHTING } from '../../world/world-lighting-tuning';
import { addBox, addCylinder, addSphere } from '../../world/world-primitives';
import { bakeVertexColoredGeometry } from '../shared/bake-vertex-colored-geometry';
import { GUIDE_AT, HOUSE_SCALE, HOUSE_X, HOUSE_Z, POSTMAN_AT } from './city-layout';

/** Colours of the recovered city region builder (ground, road, blocks, caps, lamps). */
const CITY_GROUND = 0xbac8b6;
const ROAD = 0x8d948f;
const SIDEWALK = 0xe7d09b;
const BLOCK_COLORS: readonly number[] = [0xe9c67e, 0x82b5b0, 0xe59b78, 0x9b9bd0];
const BLOCK_CAP = 0xf0e2c0;
const BLOCK_WINDOW = 0xfdf6dc;
const LAMP_POST = 0x4a5a5a;
const LAMP_LIGHT = 0xffe7a0;
/** Roofs of the street houses: the region tint (#8fb3c9) and the block palette. */
const ROOF_COLORS: readonly number[] = [0xe59b78, 0x8fb3c9, 0xe9c67e, 0x9b9bd0];

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

function buildBlocks(ctx: WorldBuildContext): void {
  const blocks = [-12, -7, -2, 3, 8, 13];
  blocks.forEach((x, i) => {
    const height = 4 + ((i * 7) % 4);
    const color = BLOCK_COLORS[i % BLOCK_COLORS.length] ?? CITY_GROUND;
    addBox(ctx, ctx.scene, x, height / 2, -10.5, 4.2, height, 3.8, color);
    addBox(ctx, ctx.scene, x, height + 0.3, -10.5, 4.5, 0.6, 4.1, BLOCK_CAP);
    for (let y = 1; y < height - 0.6; y += 1.3) {
      for (const wx of [-1.2, 0, 1.2]) {
        addBox(ctx, ctx.scene, x + wx, y + 0.3, -8.58, 0.6, 0.7, 0.06, BLOCK_WINDOW);
      }
    }
  });
}

function buildStreet(ctx: WorldBuildContext): void {
  const root = ctx.scene;
  addBox(ctx, root, 0, -0.1, -2, 52, 0.2, 34, CITY_GROUND);
  addBox(ctx, root, 0, 0.03, 3.2, 52, 0.06, 3, ROAD);
  addBox(ctx, root, 0, 0.04, 1.1, 52, 0.08, 1.2, SIDEWALK);
  for (let x = -22; x <= 22; x += 4) addBox(ctx, root, x, 0.07, 3.2, 1.6, 0.02, 0.16, 0xf6f0d9);
  for (const x of [-9.6, -4.8, 4.8, 9.6]) {
    addCylinder(ctx, root, x, 1.2, 0.8, 0.07, 0.09, 2.4, LAMP_POST);
    addSphere(ctx, root, x, 2.5, 0.8, 0.22, LAMP_LIGHT);
  }
  buildBlocks(ctx);
  for (const [x, z, scale, variant] of [
    [-14.5, -4, 1.1, 1],
    [14.5, -4.5, 1, 2],
    [-15, 1.5, 0.9, 4],
    [15.5, 1, 0.95, 5],
  ] as const) {
    buildTree(ctx, x, z, scale, variant);
  }
}

/** The postman: blue uniform, cap and a brown satchel, in the player's box-and-ball style. */
function buildPostman(ctx: WorldBuildContext, at: Group): void {
  addBox(ctx, at, 0, 0.93, 0, 0.7, 0.8, 0.47, 0x3f6fa8);
  addSphere(ctx, at, 0, 1.67, 0, 0.45, 0xffd5ae);
  addCylinder(ctx, at, 0, 2.02, 0, 0.42, 0.46, 0.2, 0x2d4f7c, 10);
  addBox(ctx, at, 0, 1.96, 0.36, 0.5, 0.06, 0.3, 0x2d4f7c);
  for (const side of [-0.16, 0.16]) {
    addSphere(ctx, at, side, 1.72, 0.394, 0.042, 0x273c35);
    addBox(ctx, at, side, 0.3, 0, 0.25, 0.55, 0.28, 0x2d4f7c);
  }
  addBox(ctx, at, -0.48, 0.94, 0, 0.2, 0.65, 0.23, 0x3f6fa8);
  addBox(ctx, at, 0.48, 0.94, 0, 0.2, 0.65, 0.23, 0x3f6fa8);
  addBox(ctx, at, 0.42, 0.78, 0.18, 0.2, 0.5, 0.5, 0xb07a45);
}

function bake(root: Scene, material: MeshStandardMaterial): Mesh {
  const mesh = new Mesh(bakeVertexColoredGeometry(root), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export interface CityDiorama {
  readonly root: Group;
  /** The four street houses (one mesh). */
  readonly houses: Mesh;
  readonly sun: DirectionalLight;
}

export function buildCityDiorama(scene: Scene): CityDiorama {
  scene.background = new Color(SKY_HORIZON_COLOR);
  const material = new MeshStandardMaterial({
    vertexColors: true,
    roughness: WORLD_LIGHTING.roughness.primitive,
    metalness: 0,
  });
  const backdrop = new Scene();
  const ctx = scratchContext(backdrop);
  buildStreet(ctx);
  for (const [{ x, z }, build] of [
    [POSTMAN_AT, (g: Group) => buildPostman(ctx, g)],
    [GUIDE_AT, (g: Group) => buildMiloModel(ctx, g)],
  ] as const) {
    const figure = new Group();
    figure.position.set(x, 0, z);
    build(figure);
    backdrop.add(figure);
  }
  const street = new Scene();
  const houseCtx = scratchContext(street);
  HOUSE_X.forEach((x, i) => {
    buildHouse(houseCtx, x, HOUSE_Z, ROOF_COLORS[i] ?? CITY_GROUND, HOUSE_SCALE);
  });
  const root = new Group();
  const houses = bake(street, material);
  root.add(bake(backdrop, material), houses);
  scene.add(root);

  const { hemisphereSky, hemisphereGround, hemisphereIntensity } = WORLD_LIGHTING;
  scene.add(new HemisphereLight(hemisphereSky, hemisphereGround, hemisphereIntensity));
  const sun = new DirectionalLight(WORLD_LIGHTING.sunColor, WORLD_LIGHTING.sunIntensity);
  sun.position.set(-9, 18, 9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.normalBias = 0.045;
  sun.shadow.bias = -0.0003;
  sun.shadow.radius = WORLD_LIGHTING.shadowRadius;
  Object.assign(sun.shadow.camera, {
    left: -18,
    right: 18,
    top: 14,
    bottom: -14,
    near: 1,
    far: 60,
  });
  sun.shadow.camera.updateProjectionMatrix();
  scene.add(sun, sun.target);
  return { root, houses, sun };
}
