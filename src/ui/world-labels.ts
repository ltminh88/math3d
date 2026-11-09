// DOM labels pinned to world points (VLM, bridge, level gates, regions, the west-bank signpost)
// and the current-area badge/toast.
import { Vector3 } from 'three';
import { areaAt, isAreaUnlocked } from '../config/expansion-region-lookup';
import { tx } from '../config/expansion-region-strings';
import { EXPANSION_SIGNPOSTS, LABELED_SIGNPOST_ID } from '../config/expansion-signposts';
import { LEVEL_GATES } from '../config/level-gate-config';
import { getLegacyLanguage } from '../i18n/legacy-translator';
import { areaText } from '../map/area-display-text';
import { LABELED_REGIONS } from './dom-template';
import { gameState, getWorld } from './game-state';
import { byId } from './icons';
import { showToast } from './toast-and-persist';

const VLM_LABEL_AT = new Vector3(-3, 3.5, 1.5);
const BRIDGE_LABEL_AT = new Vector3(7, 0.8, 0);
/** Gate labels float just above the gate sign. */
const GATE_LABEL_HEIGHT = 4.6;
const SIGNPOST_POSITION = EXPANSION_SIGNPOSTS.find((p) => p.id === LABELED_SIGNPOST_ID)?.position;
/** The signpost label floats over the pole cap (4.9). */
const SIGNPOST_LABEL_AT = new Vector3(SIGNPOST_POSITION?.[0], 5.6, SIGNPOST_POSITION?.[1]);

let signpostLabel: HTMLElement | undefined;

/**
 * The floating "Hang Đố Vui" label over the west-bank signpost (created on first use, after the
 * bridge label: the recovered shell template stays verbatim). Locked look until the bridge quest.
 */
function signpostLabelElement(): HTMLElement {
  if (!signpostLabel) {
    signpostLabel = document.createElement('div');
    signpostLabel.id = 'signpost-label';
    signpostLabel.className = 'world-label landmark region-label';
    signpostLabel.innerHTML = '<span class="region-icon"></span><strong></strong><small></small>';
    (signpostLabel.querySelector('strong') as HTMLElement).textContent = tx('caveName');
    (signpostLabel.querySelector('small') as HTMLElement).textContent = tx('signpostHint');
    byId('bridge-label').after(signpostLabel);
  }
  const locked = !gameState.progress.questComplete;
  if (signpostLabel.classList.contains('locked') !== locked || !signpostLabel.dataset.icon) {
    signpostLabel.classList.toggle('locked', locked);
    signpostLabel.dataset.icon = locked ? '🔒' : '🧩';
    (signpostLabel.querySelector('.region-icon') as HTMLElement).textContent =
      signpostLabel.dataset.icon;
  }
  return signpostLabel;
}

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
  projectLabel(signpostLabelElement(), SIGNPOST_LABEL_AT, 'translate(-50%,-100%)', paused);
}

/**
 * Updates the area badge when the player enters another region (replaying the `arrive`
 * animation) and welcomes them to unlocked regions beyond the village and garden.
 */
export function updateCurrentArea(): void {
  const world = getWorld();
  const position = world.player.position;
  const region = areaAt(position.x, position.z);
  if (region.id === gameState.currentRegionId) return;
  const firstCheck = gameState.currentRegionId === '';
  gameState.currentRegionId = region.id;
  byId('area-icon').textContent = region.icon;
  byId('area-name').textContent = areaText(region, 'name');
  byId('area-sub').textContent = areaText(region, 'subtitle');
  const badge = byId('area-label');
  badge.classList.remove('arrive');
  void badge.offsetWidth;
  badge.classList.add('arrive');
  if (
    !firstCheck &&
    world.active &&
    region.id !== 'village' &&
    region.id !== 'garden' &&
    isAreaUnlocked(region, gameState.progress.questComplete)
  ) {
    showToast(
      getLegacyLanguage() === 'vi'
        ? `Chào mừng đến ${region.name}!`
        : `Welcome to ${areaText(region, 'name')}!`,
    );
  }
}
