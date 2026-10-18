// Builds the whole scene in the original order. The order is load-bearing: it fixes the scene
// graph, which collision circles the scatter pass sees, and the static-mesh merge buckets.
import type { Group, Mesh } from 'three';
import { buildBridge } from './bridge-segments';
import { buildMiloModel, buildPlayerModel, type PlayerModelParts } from './characters-milo-avatar';
import { mergeStaticMeshes } from './merge-static-meshes';
import { buildCity, buildTower } from './regions/city-tower-builder';
import { buildForest, buildMathMeadow } from './regions/meadow-forest-builder';
import { buildGarden, buildVillage } from './regions/village-garden-builder';
import { buildCloudsAndMountains } from './sky-decor-clouds-mountains';
import { buildTerrain } from './terrain-river-roads';
import { buildWestBank } from './west-bank-builder';
import type { WorldBuildContext } from './world-build-context';
import { scatterWorld } from './world-scatter';

export interface WorldBuildTargets extends WorldBuildContext {
  readonly player: Group;
  readonly milo: Group;
  readonly bridge: Group;
  readonly clouds: Group[];
  /** Sky dome, already in the scene (excluded from merging). */
  readonly sky: Mesh;
  readonly lowPower: boolean;
}

/** Fills the scene, merges static meshes and places the player and Milo at their start spots. */
export function buildWorldScene(ctx: WorldBuildTargets): PlayerModelParts {
  buildTerrain(ctx);
  buildVillage(ctx);
  buildGarden(ctx);
  buildMathMeadow(ctx);
  buildForest(ctx);
  buildCity(ctx);
  buildTower(ctx);
  buildWestBank(ctx);
  const playerParts = buildPlayerModel(ctx, ctx.player);
  buildMiloModel(ctx, ctx.milo);
  buildBridge(ctx, ctx.bridge);
  scatterWorld(ctx, ctx.lowPower);
  buildCloudsAndMountains(ctx, ctx.clouds);
  ctx.scene.add(ctx.player, ctx.milo, ctx.bridge);
  mergeStaticMeshes(ctx.scene, ctx.materials.values(), [
    ctx.player,
    ctx.milo,
    ctx.bridge,
    ctx.windmill,
    ctx.sky,
    ...ctx.clouds,
    ...ctx.ripples,
    ...ctx.floaters.map((floater) => floater.object),
  ]);
  ctx.player.position.set(-6, 0, 6);
  ctx.milo.position.set(-3, 0, 1.5);
  // Milo is added after the scatter pass on purpose: trees may grow right next to him.
  ctx.obstacles.push({ x: -3, z: 1.5, radius: 0.85 });
  return playerParts;
}
