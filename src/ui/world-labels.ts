// DOM labels pinned to world points (VLM, bridge, level gates, regions) and the current-area
// badge/toast.
import { Vector3 } from 'three';
import { LEVEL_GATES } from '../config/level-gate-config';
import { isRegionUnlocked, regionAtPoint } from '../config/regions';
import { getLegacyLanguage, translateText } from '../i18n/legacy-translator';
import { LABELED_REGIONS } from './dom-template';
import { gameState, getWorld } from './game-state';
import { byId } from './icons';
import { showToast } from './toast-and-persist';

const VLM_LABEL_AT = new Vector3(-3, 3.5, 1.5);
const BRIDGE_LABEL_AT = new Vector3(7, 0.8, 0);
/** Gate labels float just above the gate sign. */
const GATE_LABEL_HEIGHT = 4.6;

/** Places `label` over world point `at`, fading it out between 70 and 140 units away. */
function projectLabel(label: HTMLElement, at: Vector3, offset: string, hide: boolean): void {
  const projected = getWorld().project(at);
  const opacity = Math.max(0, Math.min(1, 1 - (projected.distance - 70) / 70));
  label.hidden = hide || !projected.visible || opacity <= 0;
  if (!label.hidden) {
    label.style.transform = `translate(${projected.x}px,${projected.y}px) ${offset}`;
    label.style.opacity = String(opacity);
  }
}

/** Repositions every floating label (all hidden while the world is paused). */
export function projectWorldLabels(): void {
  const paused = getWorld().paused;
  projectLabel(byId('milo-label'), VLM_LABEL_AT, 'translate(-50%,-100%)', paused);
  projectLabel(byId('bridge-label'), BRIDGE_LABEL_AT, 'translate(-50%,15px)', paused);
  for (const gate of LEVEL_GATES) {
    projectLabel(
      byId(`gate-${gate.levelId}-label`),
      new Vector3(gate.position[0], GATE_LABEL_HEIGHT, gate.position[1]),
      'translate(-50%,-100%)',
      paused,
    );
  }
  for (const region of LABELED_REGIONS) {
    projectLabel(
      byId(`${region.id}-label`),
      new Vector3(region.center[0], region.labelHeight, region.center[1]),
      'translate(-50%,-100%)',
      paused,
    );
  }
}

/**
 * Updates the area badge when the player enters another region (replaying the `arrive`
 * animation) and welcomes them to unlocked regions beyond the village and garden.
 */
export function updateCurrentArea(): void {
  const world = getWorld();
  const position = world.player.position;
  const region = regionAtPoint(position.x, position.z);
  if (region.id === gameState.currentRegionId) return;
  const firstCheck = gameState.currentRegionId === '';
  gameState.currentRegionId = region.id;
  byId('area-icon').textContent = region.icon;
  byId('area-name').textContent = translateText(region.name);
  byId('area-sub').textContent = translateText(region.subtitle);
  const badge = byId('area-label');
  badge.classList.remove('arrive');
  void badge.offsetWidth;
  badge.classList.add('arrive');
  if (
    !firstCheck &&
    world.active &&
    region.id !== 'village' &&
    region.id !== 'garden' &&
    isRegionUnlocked(region, gameState.progress.questComplete)
  ) {
    showToast(
      getLegacyLanguage() === 'vi'
        ? `Chào mừng đến ${region.name}!`
        : `Welcome to ${translateText(region.name)}!`,
    );
  }
}
