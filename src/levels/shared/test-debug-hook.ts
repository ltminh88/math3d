// Test builds only (`vite build --mode test`): `window.__game` lets e2e specs seed progress,
// teleport the player and read the store and gate states. Imported behind
// `import.meta.env.MODE === 'test'`, so production bundles never contain it.
import { LEVEL_GATES } from '../../config/level-gate-config';
import { BRIDGE_SEGMENTS } from '../../config/world-constants';
import type { FactKey } from '../../learning/fact-key';
import type { DeltaFact, DeltaLevel } from '../../learning/learning-types';
import { mulberry32 } from '../../learning/seeded-rng';
import type { SkillTier } from '../../learning/skill-tiers';
import { reasoningItemForSkill } from '../../reasoning/reasoning-item-for-skill';
import { playableSteps } from '../../reasoning/reasoning-step-answers';
import { renderPrompt } from '../../reasoning/reasoning-strings';
import { newId } from '../../store/new-id';
import type { GameSnapshot } from '../../store/progress-repository';
import { progressViewFromSnapshot } from '../../store/store-to-save-v1';
import { gameState, getWorld } from '../../ui/game-state';
import { createStepCard } from '../../ui/kit/step-card';
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

/** Per key: the Leitner box to reach (and optionally the counters). */
export type SeedFactStats = Record<FactKey, { box: number; attempts?: number; correct?: number }>;

/** What a step card expects, per playable step, so a spec can answer it by taps. */
export type PlannedStep =
  | { kind: 'number'; answer: number }
  | { kind: 'choice'; label: string }
  | { kind: 'multi'; ids: string[] }
  | { kind: 'verdict'; answer: boolean };

export interface TestGameHook {
  /** Commits stats for × / : facts and `sk:` skills (e.g. box 3+ to reach higher tiers). */
  seedFactStats(stats: SeedFactStats): Promise<void>;
  /** Commits stage stars for one level (stage 1's stars also set the level's stars). */
  seedStageProgress(levelId: string, stageStars: readonly number[]): Promise<void>;
  /** Shows a step card for a seeded reasoning item over the page; returns the right answers. */
  mountStepCard(skillId: string, seed: number, tier: SkillTier): PlannedStep[];
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
    batchId: newId(),
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

async function seedStageProgress(levelId: string, stageStars: readonly number[]): Promise<void> {
  const store = connectedStore();
  if (!store) throw new Error('store not connected');
  await flushProgress();
  await store.commitSession({
    batchId: newId(),
    profileId: store.getSnapshot().profile.id,
    clientTs: Date.now(),
    v: 1,
    facts: {},
    levels: { [levelId]: { stars: stageStars[0] ?? 0, bestScore: 0, stageStars } },
    xp: 0,
    coins: 0,
  });
  gameState.progress = progressViewFromSnapshot(store.getSnapshot());
  renderProgress();
  refreshLevelGates();
}

async function seedFactStats(stats: SeedFactStats): Promise<void> {
  const store = connectedStore();
  if (!store) throw new Error('store not connected');
  await flushProgress();
  const facts: Record<FactKey, DeltaFact> = {};
  for (const [key, s] of Object.entries(stats)) {
    const a = s.attempts ?? 1;
    facts[key] = { a, c: s.correct ?? a, ms: 1000 * a, box: s.box, seenAt: Date.now() };
  }
  await store.commitSession({
    batchId: newId(),
    profileId: store.getSnapshot().profile.id,
    clientTs: Date.now(),
    v: 1,
    facts,
    levels: {},
    xp: 0,
    coins: 0,
  });
}

function mountStepCard(skillId: string, seed: number, tier: SkillTier): PlannedStep[] {
  const item = reasoningItemForSkill(skillId, mulberry32(seed), tier);
  document.getElementById('test-step-card')?.remove();
  const host = document.createElement('div');
  host.id = 'test-step-card';
  host.style.cssText =
    'position:fixed;inset:0;z-index:10000;overflow:auto;padding:16px;background:#fff;color:#222';
  const card = createStepCard(item, {
    onComplete: () => card.element.setAttribute('data-complete', 'true'),
  });
  host.appendChild(card.element);
  document.body.appendChild(host);
  return playableSteps(item).map((step): PlannedStep => {
    if (step.kind === 'number') return { kind: 'number', answer: step.answer };
    if (step.kind === 'verdict') return { kind: 'verdict', answer: step.answer };
    const right = step.options.filter((o) => o.correct);
    if (step.kind === 'multi') return { kind: 'multi', ids: right.map((o) => o.id) };
    return {
      kind: 'choice',
      label: right.map((o) => renderPrompt(o.label)).join(', '),
    };
  });
}

function teleport(x: number, z: number): void {
  const world = getWorld();
  world.clearInput();
  world.player.position.set(x, 0, z);
}

export function installTestDebugHook(): void {
  window.__game = {
    seedProgress,
    seedFactStats,
    seedStageProgress,
    mountStepCard,
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
