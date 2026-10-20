// The level gates in the world: built once after the world, registered as interactables, and
// refreshed from progress (every 2nd world frame, cheap: DOM and materials change only when a
// gate's status changes). Using a gate either explains why it is closed, says "Sắp ra mắt" when
// its level is not shipped yet, or enters the level through the level host.
import { LEVEL_GATES, type LevelGate } from '../../config/regions';
import { gameState } from '../../ui/game-state';
import { byId } from '../../ui/icons';
import { connectedStore } from '../../ui/progress-sync';
import { showToast } from '../../ui/toast-and-persist';
import type { WorldBuildContext } from '../../world/world-build-context';
import type { WorldPublicApi } from '../../world/world-public-api';
import { buildLevelGate, type LevelGateView } from './level-gate-builder';
import { LevelHost } from './level-host';
import { createLevelHostPorts } from './level-host-ports';
import { tl } from './level-host-strings';
import { type GateStatus, gateStatus, progressionState } from './level-progression';
import { levelDefinition } from './level-registry';
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

export const gateName = (gate: LevelGate): string =>
  gate.levelId === 'field' ? tl('gateField') : tl('gateForest');

const starsText = (stars: number): string => '★'.repeat(stars) + '☆'.repeat(3 - stars);

/** Short state line for the gate label and the map detail. */
export function gateStateText(levelId: string, status: GateStatus): string {
  if (status === 'locked') return tl('stateLocked');
  if (status === 'coming-soon') return tl('comingSoon');
  if (status === 'open') return tl('stateOpen');
  const stars = connectedStore()?.getSnapshot().levelProgress[levelId]?.stars ?? 0;
  return tl('stateCompleted', { stars: starsText(stars) });
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
  if (status === 'locked') return `${gateName(gate)} 🔒`;
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
  if ((await host.enter(definition)) === 'failed') showToast(tl('loadFailed'));
}

function useGate(gate: LevelGate, world: WorldPublicApi): void {
  if (!world.active || world.paused) return;
  const status = currentGateStatus(gate);
  if (status === 'locked') {
    showToast(gate.requires === 'field' ? tl('lockedField') : tl('lockedBridge'));
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
  refreshLevelGates();
}
