// Ground plane, river with banks and ripples, village plaza, roads and the stepping-stone path.
import { BufferAttribute, Color, Mesh, MeshStandardMaterial, PlaneGeometry } from 'three';
import { ROADS, type RoadPoint } from '../config/roads';
import { RIVER } from '../config/world-constants';
import { groundHeight } from './sky-dome';
import type { WorldBuildContext } from './world-build-context';
import { WORLD_LIGHTING } from './world-lighting-tuning';
import { addBox, addCylinder } from './world-primitives';

const PATH_COLOR = 0xead5a3;
const RIVER_LENGTH = 900;

/** 2400^2 vertex-coloured, flat-shaded plane displaced by `groundHeight`. */
function buildGroundPlane(ctx: WorldBuildContext): void {
  const geometry = new PlaneGeometry(2400, 2400, 200, 200);
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.attributes.position;
  if (!position) throw new Error('PlaneGeometry without position attribute');
  const colors = new Float32Array(position.count * 3);
  const color = new Color();
  const base = new Color(0x8ec963);
  const light = new Color(0xa9cf6a);
  const dark = new Color(0x6fae55);
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const z = position.getZ(i);
    const height = groundHeight(x, z);
    position.setY(i, height);
    const patch = (Math.sin(x * 0.13 + z * 0.07) + Math.sin(z * 0.11 - x * 0.05)) * 0.25 + 0.5;
    color
      .copy(base)
      .lerp(patch > 0.5 ? light : dark, Math.abs(patch - 0.5) * 1.4)
      .lerp(dark, Math.min(0.5, height / 30));
    colors.set([color.r, color.g, color.b], i * 3);
  }
  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  const ground = new Mesh(
    geometry,
    new MeshStandardMaterial({
      vertexColors: true,
      roughness: WORLD_LIGHTING.roughness.ground,
      flatShading: true,
    }),
  );
  ground.receiveShadow = true;
  ctx.scene.add(ground);
}

function buildRiver(ctx: WorldBuildContext): void {
  const { riverMin, riverMax } = RIVER;
  const water = addBox(
    ctx,
    ctx.scene,
    (riverMin + riverMax) / 2,
    -0.33,
    0,
    riverMax - riverMin,
    0.74,
    RIVER_LENGTH,
    0x48b8cf,
  );
  water.castShadow = false;
  for (const bankX of [riverMin - 0.45, riverMax + 0.45]) {
    const bank = addBox(ctx, ctx.scene, bankX, 0.012, 0, 0.9, 0.03, RIVER_LENGTH, 0xdcc998);
    bank.castShadow = false;
  }
  for (let i = 0; i < 60; i++) {
    const ripple = addBox(
      ctx,
      ctx.scene,
      4.7 + (i % 4) * 1.35,
      0.05,
      -42 + ((i * 2.17) % 84),
      0.35 + (i % 3) * 0.2,
      0.025,
      0.07,
      0xb5f4ed,
    );
    ripple.castShadow = false;
    ctx.ripples.push(ripple);
  }
}

/** Builds the whole ground layer in the original order (ground, river, plaza, roads, stones). */
export function buildTerrain(ctx: WorldBuildContext): void {
  buildGroundPlane(ctx);
  buildRiver(ctx);
  addBox(ctx, ctx.scene, -7, 0.055, 1, 21, 0.08, 3.2, PATH_COLOR);
  addBox(ctx, ctx.scene, -10, 0.055, -4, 3.1, 0.08, 20, PATH_COLOR);
  addCylinder(ctx, ctx.scene, -6, 0.07, 5, 4.5, 4.5, 0.1, PATH_COLOR, 24);
  for (const road of ROADS.slice(2)) {
    for (let i = 1; i < road.length; i++) {
      const from = road[i - 1];
      const to = road[i];
      if (from && to) buildRoadSegment(ctx, from, to);
    }
  }
  for (let i = 0; i < 15; i++) {
    const stone = addBox(
      ctx,
      ctx.scene,
      -16 + i * 1.3,
      0.12,
      1 + Math.sin(i) * 0.8,
      0.65,
      0.08,
      0.4,
      0xf5e9ca,
    );
    stone.rotation.y = i;
  }
}

/** One straight road strip from `from` to `to` with round caps at both ends. */
export function buildRoadSegment(
  ctx: WorldBuildContext,
  [fromX, fromZ]: RoadPoint,
  [toX, toZ]: RoadPoint,
): void {
  const dx = toX - fromX;
  const dz = toZ - fromZ;
  const length = Math.hypot(dx, dz);
  const strip = addBox(
    ctx,
    ctx.scene,
    (fromX + toX) / 2,
    0.05,
    (fromZ + toZ) / 2,
    3,
    0.07,
    length,
    PATH_COLOR,
  );
  strip.rotation.y = Math.atan2(dx, dz);
  strip.castShadow = false;
  for (const [capX, capZ] of [
    [fromX, fromZ],
    [toX, toZ],
  ] as const) {
    const cap = addCylinder(ctx, ctx.scene, capX, 0.052, capZ, 1.5, 1.5, 0.07, PATH_COLOR, 16);
    cap.castShadow = false;
  }
}
