// Minimap and full-screen world map overlay: drawing, region list/detail panel, open/close.

import { allRegions, anyRegionById, isAreaUnlocked } from '../config/expansion-region-lookup';
import { expansionRegionText } from '../config/expansion-region-strings';
import { type AnyRegion, isExpansionRegion } from '../config/expansion-regions';
import { LEVEL_GATES } from '../config/level-gate-config';
import { translateDomTree, translateLongText, translateText } from '../i18n/legacy-translator';
import { currentGateStatus, gateStateText, isLevelRunning } from '../levels/shared/level-gates';
import { tl } from '../levels/shared/level-host-strings';
import { areaAtMapPoint } from '../map/map-area-hit-test';
import { drawMap, type MapDrawState } from '../map/map-render';
import {
  fitWorldMapView,
  type MapView,
  prepareMapCanvas,
  screenToWorld,
} from '../map/map-view-transform';
import { gameState, getWorld } from './game-state';
import { byId, icon } from './icons';

function mapDrawState(labels: boolean, withSelection = labels): MapDrawState {
  const world = getWorld();
  const position = world.player.position;
  return {
    player: { x: position.x, z: position.z, facing: world.player.rotation.y },
    milo: { x: world.milo.position.x, z: world.milo.position.z },
    bridge: gameState.progress.bridge,
    questComplete: gameState.progress.questComplete,
    selected: withSelection ? gameState.selectedRegionId : undefined,
    labels,
    translate: translateText,
    time: performance.now() / 1000,
    expansion: { name: (region) => expansionRegionText(region, 'name') },
  };
}

/** Redraws the corner minimap, centred on the player and rotated with the camera. */
export function drawMinimap(): void {
  const { ctx, w, h } = prepareMapCanvas(byId<HTMLCanvasElement>('minimap-canvas'));
  const world = getWorld();
  const position = world.player.position;
  const view = { cx: position.x, cz: position.z, scale: w / 70, rotation: world.heading };
  drawMap(ctx, w, h, view, mapDrawState(false));
}

/** World-map view: leaves room for the side panel (wide) or the bottom sheet (narrow). */
function overlayView(w: number, h: number): MapView {
  const wide = w > 820;
  const view = fitWorldMapView(wide ? w - 360 : w, wide ? h : h * 0.62, wide ? 56 : 22);
  if (wide) {
    view.cx += 180 / view.scale;
  } else {
    view.cz += (h * 0.19) / view.scale;
  }
  return view;
}

function drawOverlayFrame(): void {
  if (!gameState.mapOpen) return;
  const { ctx, w, h } = prepareMapCanvas(byId<HTMLCanvasElement>('map-canvas'));
  drawMap(ctx, w, h, overlayView(w, h), mapDrawState(w > 600, true));
  requestAnimationFrame(drawOverlayFrame);
}

/** Panel text: original regions stay Vietnamese here (the legacy translator runs on the whole
 * panel, as before); chapter 2 regions come already in the current language. */
const panelText = (region: AnyRegion, field: 'name' | 'subtitle' | 'blurb'): string =>
  isExpansionRegion(region) ? expansionRegionText(region, field) : region[field];

function regionButtonHtml(region: AnyRegion): string {
  const unlocked = isAreaUnlocked(region, gameState.progress.questComplete);
  return `<button class="map-region${unlocked ? '' : ' locked'}" data-region="${region.id}" aria-pressed="${gameState.selectedRegionId === region.id}"><span class="map-region-icon" style="--tint:${region.color}">${unlocked ? region.icon : '🔒'}</span><span><strong>${panelText(region, 'name')}</strong><small>${panelText(region, 'subtitle')}</small></span>${gameState.currentRegionId === region.id ? '<em>Bạn ở đây</em>' : ''}</button>`;
}

/** Region detail line about levels: the gate state for regions with a level gate. */
function regionLevelHtml(region: AnyRegion): string {
  const gate = LEVEL_GATES.find((g) => g.regionId === region.id);
  if (!gate) return '';
  const state = gateStateText(gate.levelId, currentGateStatus(gate));
  return `<p class="map-gate">${tl('mapGate', { state })}</p>`;
}

function renderMapPanel(): void {
  byId('map-regions').innerHTML = translateLongText(allRegions().map(regionButtonHtml).join(''));
  const selected = anyRegionById(gameState.selectedRegionId);
  byId('map-detail').innerHTML = selected
    ? translateLongText(
        `<strong>${selected.icon} ${panelText(selected, 'name')}</strong><p>${panelText(selected, 'blurb')}</p>${isAreaUnlocked(selected, gameState.progress.questComplete) ? '' : `<p class="map-locked">${icon('lock')} Mở khóa khi hoàn thành Cây cầu tình bạn</p>`}${regionLevelHtml(selected)}`,
      )
    : '';
  for (const button of document.querySelectorAll<HTMLElement>('[data-region]')) {
    button.onclick = () => {
      gameState.selectedRegionId = button.dataset.region;
      renderMapPanel();
    };
  }
}

/** Opens the world map (only while playing and no dialog is open); pauses the world. */
export function openMap(): void {
  const world = getWorld();
  // A level loading or running owns the screen (closing the map would unpause the world).
  if (!world.active || isLevelRunning() || byId<HTMLDialogElement>('dialog').open) return;
  gameState.mapOpen = true;
  world.paused = true;
  world.clearInput();
  gameState.selectedRegionId = gameState.currentRegionId || undefined;
  byId('world-map').hidden = false;
  renderMapPanel();
  translateDomTree(byId('world-map'));
  byId('close-map').focus();
  requestAnimationFrame(drawOverlayFrame);
}

export function closeMap(): void {
  if (!gameState.mapOpen) return;
  gameState.mapOpen = false;
  byId('world-map').hidden = true;
  const world = getWorld();
  world.paused = false;
  world.clearInput();
}

export function wireMapOverlay(): void {
  byId('minimap').onclick = openMap;
  byId('open-map').onclick = openMap;
  byId('close-map').onclick = closeMap;
  byId('map-canvas').addEventListener('click', (event) => {
    const canvas = event.currentTarget as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    const view = overlayView(rect.width, rect.height);
    const point = screenToWorld(
      view,
      rect.width,
      rect.height,
      event.clientX - rect.left,
      event.clientY - rect.top,
    );
    gameState.selectedRegionId = areaAtMapPoint(point.x, point.z)?.id;
    renderMapPanel();
  });
}
