// Chapter 2 scenery: ground pads + roads, geometry valley, measurement workshop and puzzle cave.
// Built where the level gates are built (after the world, outside the static merge): three draws
// `Math.random` for every object UUID, so building earlier would shift the clouds/mountains and
// every seeded draw after them. Builders write into scratch groups with their own materials; the
// groups are baked into 3 meshes (ground, solid scenery, unlit glow), i.e. +4 world draw calls
// with the solid mesh's shadow pass, plus the signpost text faces (one atlas mesh, no shadow:
// +1). Collision circles are appended to the obstacle list (signposts add none).
import {
  type BufferGeometry,
  Group,
  type Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from 'three';
import { bakeVertexColoredGeometry } from '../levels/shared/bake-vertex-colored-geometry';
import { buildExpansionGround } from './expansion-road-builder';
import { buildExpansionSignposts } from './expansion-signpost-builder';
import { buildGeometryValley } from './regions/geometry-valley-builder';
import { buildMeasurementWorkshop } from './regions/measurement-workshop-builder';
import { buildPuzzleCave } from './regions/puzzle-cave-builder';
import type { WorldBuildContext } from './world-build-context';
import { WORLD_LIGHTING } from './world-lighting-tuning';

export interface ExpansionWorldView {
  readonly ground: Mesh;
  readonly scenery: Mesh;
  readonly glow: Mesh;
  readonly signText: Mesh;
}

function bakedMesh(name: string, root: Group, material: Material): Mesh {
  const geometry: BufferGeometry = bakeVertexColoredGeometry(root);
  const mesh = new Mesh(geometry, material);
  mesh.name = name;
  return mesh;
}

const litMaterial = () =>
  new MeshStandardMaterial({
    vertexColors: true,
    roughness: WORLD_LIGHTING.roughness.primitive,
    metalness: 0,
  });

/** Builds the chapter 2 scenery into `world.scene` (call once, right after the level gates). */
export function buildExpansionWorld(world: WorldBuildContext): ExpansionWorldView {
  // Scratch context: shared obstacle list, private material cache (baked away afterwards).
  const scratch: WorldBuildContext = { ...pickContext(world), materials: new Map() };
  const groundRoot = new Group();
  const solidRoot = new Group();
  const glowRoot = new Group();
  buildExpansionGround(scratch, groundRoot);
  buildGeometryValley(scratch, solidRoot);
  buildMeasurementWorkshop(scratch, solidRoot);
  buildPuzzleCave(scratch, solidRoot, glowRoot);
  const signText = buildExpansionSignposts(scratch, solidRoot);
  const ground = bakedMesh('expansion-ground', groundRoot, litMaterial());
  ground.receiveShadow = true;
  const scenery = bakedMesh('expansion-scenery', solidRoot, litMaterial());
  scenery.castShadow = true;
  scenery.receiveShadow = true;
  const glow = bakedMesh('expansion-glow', glowRoot, new MeshBasicMaterial({ vertexColors: true }));
  world.scene.add(ground, scenery, glow, signText);
  return { ground, scenery, glow, signText };
}

function pickContext(world: WorldBuildContext): WorldBuildContext {
  const { scene, materials, obstacles, floaters, ripples, windmill } = world;
  return { scene, materials, obstacles, floaters, ripples, windmill };
}
