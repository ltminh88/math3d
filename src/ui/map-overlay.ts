// Minimap and full-screen world map overlay: drawing, region list/detail panel, open/close.
import { isRegionUnlocked, REGIONS } from '../config/regions';
import { translateDomTree, translateLongText, translateText } from '../i18n/legacy-translator';
import { drawMap, type MapDrawState } from '../map/map-render';
import {
  fitWorldMapView,
  type MapView,
  prepareMapCanvas,
  regionAtMapPoint,
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
    bridge: gameState.save.bridge,
    questComplete: gameState.save.questComplete,
    selected: withSelection ? gameState.selectedRegionId : undefined,
    labels,
    translate: translateText,
    time: performance.now() / 1000,
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

function regionButtonHtml(region: (typeof REGIONS)[number]): string {
  const unlocked = isRegionUnlocked(region, gameState.save.questComplete);
  return `<button class="map-region${unlocked ? '' : ' locked'}" data-region="${region.id}" aria-pressed="${gameState.selectedRegionId === region.id}"><span class="map-region-icon" style="--tint:${region.color}">${unlocked ? region.icon : '🔒'}</span><span><strong>${region.name}</strong><small>${region.subtitle}</small></span>${gameState.currentRegionId === region.id ? '<em>Bạn ở đây</em>' : ''}</button>`;
}

function renderMapPanel(): void {
  byId('map-regions').innerHTML = translateLongText(REGIONS.map(regionButtonHtml).join(''));
  const selected = REGIONS.find((r) => r.id === gameState.selectedRegionId);
  byId('map-detail').innerHTML = selected
    ? translateLongText(
        `<strong>${selected.icon} ${selected.name}</strong><p>${selected.blurb}</p>${isRegionUnlocked(selected, gameState.save.questComplete) ? '' : `<p class="map-locked">${icon('lock')} Mở khóa khi hoàn thành Cây cầu tình bạn</p>`}`,
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
  if (!world.active || byId<HTMLDialogElement>('dialog').open) return;
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
    gameState.selectedRegionId = regionAtMapPoint(point.x, point.z)?.id;
    renderMapPanel();
  });
}
