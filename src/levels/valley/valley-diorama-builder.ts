// The valley diorama in the recovered low-poly style: a green valley floor, the sandy stone board
// (where each round's figure is drawn), six pedestals around it for the rebuilt shape stones, the
// pond, the giant ê-ke and trees from the world builder. Built into a scratch context, baked to
// one mesh (one draw call + its shadow pass).
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
import { buildTree } from '../../world/props-house-tree';
import type { WorldBuildContext } from '../../world/world-build-context';
import { WORLD_LIGHTING } from '../../world/world-lighting-tuning';
import { addBox, addCylinder, addSphere } from '../../world/world-primitives';
import { bakeVertexColoredGeometry } from '../shared/bake-vertex-colored-geometry';
import { BOARD, VALLEY_COLORS as C, PEDESTALS } from './valley-layout-constants';

const TREES: readonly (readonly [number, number, number])[] = [
  [-10.5, -6, 1.1],
  [-12, 1.5, 0.9],
  [10.8, -5.2, 1.05],
  [12.2, 2.4, 0.95],
  [-8.4, -9.4, 0.85],
  [8.6, -9.8, 1],
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

function buildValleyFloor(ctx: WorldBuildContext, root: Group): void {
  addBox(ctx, root, 0, -0.1, 0, 90, 0.2, 90, C.ground);
  // The stone board: a raised sandy slab with a darker rim.
  addBox(ctx, root, 0, 0.04, 0, BOARD.width + 0.8, 0.1, BOARD.depth + 0.8, C.rim);
  addBox(ctx, root, 0, 0.08, 0, BOARD.width, 0.1, BOARD.depth, C.board);
  for (const [x, z] of PEDESTALS)
    addCylinder(ctx, root, x, 0.18, z, 0.55, 0.65, 0.36, C.pedestal, 8);
  // Pond (back left) and the giant ê-ke (back right), as in the valley region of the world.
  addCylinder(ctx, root, -7.5, 0.04, -7.6, 2.4, 2.4, 0.06, C.rim, 18).castShadow = false;
  addCylinder(ctx, root, -7.5, 0.07, -7.6, 2, 2, 0.06, C.water, 18).castShadow = false;
  addBox(ctx, root, 7.4, 1.4, -8, 0.3, 2.8, 0.3, C.eke);
  addBox(ctx, root, 8.3, 0.15, -8, 2.1, 0.3, 0.3, C.eke);
  for (const [x, z, r] of [
    [-9.6, 4.8, 0.32],
    [9.9, 5.2, 0.26],
    [-4.2, -9.6, 0.36],
    [4.6, -10, 0.3],
  ] as const) {
    addSphere(ctx, root, x, r * 0.5, z, r, C.rock).scale.y = 0.6;
  }
}

export interface ValleyDiorama {
  readonly sun: DirectionalLight;
}

/** Builds the valley floor, sky colour and lights into `scene`. */
export function buildValleyDiorama(scene: Scene): ValleyDiorama {
  scene.background = new Color(SKY_HORIZON_COLOR);
  const scratch = new Scene();
  const ctx = scratchContext(scratch);
  const root = new Group();
  scratch.add(root);
  buildValleyFloor(ctx, root);
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
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  scene.add(mesh);

  const { hemisphereSky, hemisphereGround, hemisphereIntensity } = WORLD_LIGHTING;
  scene.add(new HemisphereLight(hemisphereSky, hemisphereGround, hemisphereIntensity));
  const sun = new DirectionalLight(WORLD_LIGHTING.sunColor, WORLD_LIGHTING.sunIntensity);
  sun.position.set(-6, 18, 9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.normalBias = 0.045;
  sun.shadow.bias = -0.0003;
  sun.shadow.radius = WORLD_LIGHTING.shadowRadius;
  Object.assign(sun.shadow.camera, {
    left: -13,
    right: 13,
    top: 12,
    bottom: -12,
    near: 1,
    far: 50,
  });
  sun.shadow.camera.updateProjectionMatrix();
  scene.add(sun, sun.target);
  return { sun };
}
