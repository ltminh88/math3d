// Drifting clouds and the distant mountain ring, from their own seeded stream (seed 91).
// Quirk kept: mountains near the river axis are skipped after their angle/radius draws.
import { Group } from 'three';
import { createSeededLcg } from '../config/seeded-lcg';
import { groundHeight } from './sky-dome';
import type { WorldBuildContext } from './world-build-context';
import { addCylinder, addSphere } from './world-primitives';

const DECOR_SEED = 91;
const CLOUD_COUNT = 22;
const MOUNTAIN_SLOTS = 18;

/** Builds clouds (pushed onto `clouds` for the frame loop) then mountains. */
export function buildCloudsAndMountains(ctx: WorldBuildContext, clouds: Group[]): void {
  const random = createSeededLcg(DECOR_SEED);
  buildClouds(ctx, clouds, random);
  buildMountains(ctx, random);
}

function buildClouds(ctx: WorldBuildContext, clouds: Group[], random: () => number): void {
  for (let n = 0; n < CLOUD_COUNT; n++) {
    const cloud = new Group();
    const angle = random() * Math.PI * 2;
    const radius = 80 + random() * 110;
    cloud.position.set(10 + Math.cos(angle) * radius, 16 + random() * 10, Math.sin(angle) * radius);
    cloud.scale.setScalar(1.4 + random() * 1.4);
    for (let puff = 0; puff < 4; puff++) {
      const size = 0.95 + (puff % 2) * 0.4;
      const mesh = addSphere(ctx, cloud, puff * 1.1, Math.sin(puff) * 0.35, 0, size, 0xf4fcf5);
      mesh.scale.set(1.4, 0.65, 1);
      mesh.castShadow = false;
      mesh.receiveShadow = false;
    }
    ctx.scene.add(cloud);
    clouds.push(cloud);
  }
}

function buildMountains(ctx: WorldBuildContext, random: () => number): void {
  for (let n = 0; n < MOUNTAIN_SLOTS; n++) {
    const angle = (n / MOUNTAIN_SLOTS) * Math.PI * 2 + random() * 0.2;
    const radius = 230 + random() * 140;
    const mountain = new Group();
    const x = 10 + Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    if (Math.abs(x - 7) < 40) {
      continue;
    }
    mountain.position.set(x, groundHeight(x, z) - 1, z);
    mountain.rotation.y = random() * 6;
    const spread = 16 + random() * 20;
    for (let peak = 0; peak < 3; peak++) {
      const height = 10 + random() * 26;
      const cone = addCylinder(
        ctx,
        mountain,
        (random() - 0.5) * spread,
        height / 2,
        (random() - 0.5) * spread,
        0,
        spread * 0.45,
        height,
        peak % 2 ? 0x6f9e7a : 0x7ea88a,
        7,
      );
      cone.castShadow = false;
      if (height > 26) {
        const snowRadius = spread * 0.45 * 0.2 + 0.4;
        const snowY = height * 0.9;
        const { x: snowX, z: snowZ } = cone.position;
        const snow = addCylinder(
          ctx,
          mountain,
          snowX,
          snowY,
          snowZ,
          0,
          snowRadius,
          height * 0.2,
          0xf4f8f2,
          7,
        );
        snow.castShadow = false;
      }
    }
    ctx.scene.add(mountain);
  }
}
