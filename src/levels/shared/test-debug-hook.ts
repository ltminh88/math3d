// Test builds only (`vite build --mode test`): `window.__game` lets e2e specs seed progress,
// teleport the player and read the store and gate states. Imported behind
// `import.meta.env.MODE === 'test'`, so production bundles never contain it.
import { LEVEL_GATES } from '../../config/regions';
import { BRIDGE_SEGMENTS } from '../../config/world-constants';
import type { DeltaLevel } from '../../learning/learning-types';
import type { GameSnapshot } from '../../store/progress-repository';
import { progressViewFromSnapshot } from '../../store/store-to-save-v1';
import { gameState, getWorld } from '../../ui/game-state';
import { connectedStore, flushProgress } from '../../ui/progress-sync';
import { renderProgress } from '../../ui/render-progress';
import { gateFrontPoint } from './level-gate-builder';
import { currentGateStatus, isLevelRunning, refreshLevelGates } from './level-gates';
import type { GateStatus } from './level-progression';

export interface SeedProgress {
  /** Mark the bridge quest built and completed. */
  bridgeComplete?: boolean;
  /** Level ids to mark completed (1 star). */
  completedLevels?: readonly string[];
}

export interface TestGameHook {
  /** Commits `seed` to the store and re-renders the world/HUD from it. */
  seedProgress(seed: SeedProgress): Promise<void>;
  /** Places the player at (x, z), clearing any walk target. */
  teleport(x: number, z: number): void;
  /** Places the player in front of a level gate (where its interact prompt shows). */
  teleportToGate(levelId: string): void;
  gateStatus(levelId: string): GateStatus | undefined;
  levelRunning(): boolean;
  snapshot(): GameSnapshot | undefined;
  /** `renderer.info.memory` (leak checks). */
  memory(): { geometries: number; textures: number };
}

declare global {
  interface Window {
    __game?: TestGameHook;
  }
}

async function seedProgress(seed: SeedProgress): Promise<void> {
  const store = connectedStore();
  if (!store) throw new Error('store not connected');
  await flushProgress();
  const levels: Record<string, DeltaLevel> = {};
  if (seed.bridgeComplete) levels.bridge = { stars: 1, bestScore: 0, progress: BRIDGE_SEGMENTS };
  for (const levelId of seed.completedLevels ?? []) levels[levelId] = { stars: 1, bestScore: 0 };
  await store.commitSession({
    batchId: crypto.randomUUID(),
    profileId: store.getSnapshot().profile.id,
    clientTs: Date.now(),
    v: 1,
    facts: {},
    levels,
    xp: 0,
    coins: 0,
  });
  gameState.progress = progressViewFromSnapshot(store.getSnapshot());
  renderProgress();
  refreshLevelGates();
}

function teleport(x: number, z: number): void {
  const world = getWorld();
  world.clearInput();
  world.player.position.set(x, 0, z);
}

export function installTestDebugHook(): void {
  window.__game = {
    seedProgress,
    teleport,
    teleportToGate(levelId) {
      const gate = LEVEL_GATES.find((g) => g.levelId === levelId);
      if (!gate) throw new Error(`no gate for ${levelId}`);
      const { x, z } = gateFrontPoint(gate);
      teleport(x, z);
    },
    gateStatus(levelId) {
      const gate = LEVEL_GATES.find((g) => g.levelId === levelId);
      return gate ? currentGateStatus(gate) : undefined;
    },
    levelRunning: isLevelRunning,
    snapshot: () => connectedStore()?.getSnapshot(),
    memory: () => ({ ...getWorld().renderer.info.memory }),
  };
}
