// The level gates in the world: built once after the world, registered as interactables, and
// refreshed from progress (every 2nd world frame, cheap: DOM and materials change only when a
// gate's status changes). Using a gate either explains why it is closed, says "Sắp ra mắt" when
// its level is not shipped yet, or enters the level through the level host.
import { LEVEL_GATES, type LevelGate } from '../../config/level-gate-config';
import { BRIDGE_SEGMENTS } from '../../config/world-constants';
import { reloadForNewBuild } from '../../core/stale-build-reload';
import { tc } from '../../i18n/common-strings';
import { gameState } from '../../ui/game-state';
import { byId } from '../../ui/icons';
import { connectedStore } from '../../ui/progress-sync';
import { showToast } from '../../ui/toast-and-persist';
import { buildExpansionWorld } from '../../world/expansion-world-builder';
import type { WorldBuildContext } from '../../world/world-build-context';
import type { WorldPublicApi } from '../../world/world-public-api';
import { buildLevelGate, type LevelGateView } from './level-gate-builder';
import { LevelHost } from './level-host';
import { createLevelHostPorts } from './level-host-ports';
import { gateNameOf, tl } from './level-host-strings';
import { type GateStatus, gateStatus, progressionState } from './level-progression';
import { levelDefinition } from './level-registry';
import { nextStage, stagesCompleted } from './level-stages';
import './level-host.css';

/** Reach of a gate from its centre (the player stands ~1.9 in front of the portal). */
export const GATE_REACH = 2.6;

interface GateEntry {
  readonly gate: LevelGate;
  readonly view: LevelGateView;
  /** Status + state text last rendered (stars can change while the status stays). */
  rendered: string;
}

const gates: GateEntry[] = [];
let host: LevelHost | undefined;

type Requirement = Exclude<LevelGate['requires'], null | 'bridge'>;

/** Locked label line and toast for a gate that waits on a completed level. */
const LEVEL_LOCK_KEYS = {
  field: ['lockReasonField', 'lockedField'],
  forest: ['lockReasonForest', 'lockedForest'],
  city: ['lockReasonCity', 'lockedCity'],
  tower: ['lockReasonTower', 'lockedTower'],
  garden: ['lockReasonGarden', 'lockedGarden'],
  valley: ['lockReasonValley', 'lockedValley'],
  workshop: ['lockReasonWorkshop', 'lockedWorkshop'],
} as const satisfies Record<Requirement, readonly Parameters<typeof tl>[0][]>;

export const gateName = (gate: LevelGate): string => gateNameOf(gate.levelId);

const starsText = (stars: number): string => '★'.repeat(stars) + '☆'.repeat(3 - stars);

/** Why a locked gate is closed: the bridge quest, or the level its gate requires. */
function lockReason(levelId: string): string {
  const requires = LEVEL_GATES.find((g) => g.levelId === levelId)?.requires;
  if (!requires || requires === 'bridge') return tl('lockReasonBridge');
  return tl(LEVEL_LOCK_KEYS[requires][0]);
}

/** Short state line for the gate label and the map detail. */
export function gateStateText(levelId: string, status: GateStatus): string {
  if (status === 'locked') return lockReason(levelId);
  if (status === 'coming-soon') return tl('comingSoon');
  if (status === 'open') return withStageLine(levelId, tl('stateOpen'));
  const stars = connectedStore()?.getSnapshot().levelProgress[levelId]?.stars ?? 0;
  return withStageLine(levelId, tl('stateCompleted', { stars: starsText(stars) }));
}

/**
 * Appends "Chặng {next}/{stages}" for a level with more than one stage — the next
 * uncompleted stage. A one-stage level shows nothing extra, so phase 01 changes no
 * visible gate text (every level has stages: 1 until phases 03–10).
 */
function withStageLine(levelId: string, base: string): string {
  const definition = levelDefinition(levelId);
  if (!definition || definition.stages <= 1) return base;
  const progress = connectedStore()?.getSnapshot().levelProgress[levelId];
  const stageStars = progress?.stageStars ?? [];
  if (stagesCompleted({ stages: definition.stages, stageStars }) >= definition.stages) return base;
  const next = nextStage({ stages: definition.stages, stageStars });
  return `${base} · ${tl('stageLine', { n: next, m: definition.stages })}`;
}

/** Current status of `gate` (bridge from the progress view, levels from the store). */
export function currentGateStatus(gate: LevelGate): GateStatus {
  const levels = connectedStore()?.getSnapshot().levelProgress ?? {};
  const state = progressionState(gameState.progress.questComplete, levels);
  return gateStatus(gate, state, levelDefinition(gate.levelId) !== undefined);
}

/** Interact-button text: what pressing E will do at this gate. */
function interactLabel(gate: LevelGate): string {
  const status = currentGateStatus(gate);
  if (status === 'locked') return `${gateName(gate)} 🔒 · ${lockReason(gate.levelId)}`;
  if (status === 'coming-soon') return `${gateName(gate)} · ${tl('comingSoon')}`;
  return tl('enter', { gate: gateName(gate) });
}

/** A level is loading or running: world keys, map and settings stay out of its way. */
export const isLevelRunning = (): boolean => host?.running ?? false;

async function enterGate(gate: LevelGate): Promise<void> {
  const definition = levelDefinition(gate.levelId);
  if (!definition || !host || !connectedStore()) {
    showToast(tl('loadFailed'));
    return;
  }
  gameState.audio.unlock();
  const outcome = await host.enter(definition);
  // A tab older than the last deploy: reload onto the new build (progress is already saved).
  if (outcome === 'stale' && reloadForNewBuild()) showToast(tl('reloadingNewBuild'));
  else if (outcome === 'stale' || outcome === 'failed') showToast(tl('loadFailed'));
}

function lockedToast(gate: LevelGate): string {
  if (gate.requires && gate.requires !== 'bridge') return tl(LEVEL_LOCK_KEYS[gate.requires][1]);
  return gameState.progress.bridge === BRIDGE_SEGMENTS
    ? tl('lockedBridgeCross')
    : tl('lockedBridge', { guide: tc('guideName') });
}

function useGate(gate: LevelGate, world: WorldPublicApi): void {
  if (!world.active || world.paused) return;
  const status = currentGateStatus(gate);
  if (status === 'locked') {
    showToast(lockedToast(gate));
  } else if (status === 'coming-soon') {
    showToast(tl('comingSoonToast'));
  } else {
    void enterGate(gate);
  }
}

function renderGateLabel(entry: GateEntry, status: GateStatus, stateText: string): void {
  const label = byId(`gate-${entry.gate.levelId}-label`);
  label.classList.toggle('locked', status === 'locked');
  label.dataset.status = status;
  (label.querySelector('.region-icon') as HTMLElement).textContent =
    status === 'locked' ? '🔒' : '✨';
  (label.querySelector('strong') as HTMLElement).textContent = gateName(entry.gate);
  (label.querySelector('small') as HTMLElement).textContent = stateText;
}

/** Re-applies gate statuses that changed since the last call (materials + labels). */
export function refreshLevelGates(): void {
  for (const entry of gates) {
    const status = currentGateStatus(entry.gate);
    const stateText = gateStateText(entry.gate.levelId, status);
    if (`${status}|${stateText}` === entry.rendered) continue;
    entry.rendered = `${status}|${stateText}`;
    entry.view.setStatus(status);
    renderGateLabel(entry, status, stateText);
  }
}

/** Builds the gates into the world (once, after the world is built) and sets up the host. */
export function initLevelGates(world: WorldPublicApi & WorldBuildContext): void {
  host = new LevelHost(createLevelHostPorts(world));
  for (const gate of LEVEL_GATES) {
    const entry: GateEntry = { gate, view: buildLevelGate(world, gate), rendered: '' };
    gates.push(entry);
    world.registerInteractable({
      id: `gate:${gate.levelId}`,
      position: { x: gate.position[0], z: gate.position[1] },
      radius: GATE_REACH,
      label: () => interactLabel(gate),
      onInteract: () => useGate(gate, world),
    });
  }
  // Chapter 2 scenery at the same build point as the gates (UUID draws after the world's).
  buildExpansionWorld(world);
  refreshLevelGates();
}
