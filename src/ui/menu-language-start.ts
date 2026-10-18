// Welcome menu: language toggle (persists then reloads), avatar choice, start/continue and
// returning to the menu from settings.

import { getLegacyLanguage, setLegacyLanguage } from '../i18n/legacy-translator';
import type { Avatar } from '../save/save-types';
import { closeDialog } from './dialog';
import { gameState, getWorld } from './game-state';
import { refreshHud } from './hud';
import { byId } from './icons';
import { closeMap, drawMinimap } from './map-overlay';
import { persistSave, showToast } from './toast-and-persist';
import { updateCurrentArea } from './world-labels';

/** Leaves the menu: starts music, activates the world and shows the HUD. */
export function startAdventure(): void {
  gameState.audio.unlock();
  gameState.audio.music(gameState.save.music);
  gameState.save.started = true;
  const world = getWorld();
  world.active = true;
  world.paused = false;
  world.setAvatar(gameState.save.avatar);
  byId('welcome').hidden = true;
  byId('hud').hidden = false;
  byId('area-label').hidden = false;
  byId('world-caption').hidden = true;
  byId('menu-footer').hidden = true;
  document.body.classList.add('playing');
  persistSave();
  refreshHud();
  gameState.currentRegionId = '';
  updateCurrentArea();
  requestAnimationFrame(drawMinimap);
  showToast('Chào bạn! Di chuyển đến Milo, hoặc chạm xuống đất để đi.');
}

/** Back to the welcome menu: closes dialog/map, deactivates the world, stops music. */
export function returnToMenu(): void {
  closeDialog();
  closeMap();
  const world = getWorld();
  world.active = false;
  world.clearInput();
  byId('welcome').hidden = false;
  byId('hud').hidden = true;
  byId('area-label').hidden = true;
  byId('world-caption').hidden = false;
  byId('menu-footer').hidden = false;
  document.body.classList.remove('playing');
  refreshHud();
  gameState.audio.music(false);
}

export function wireMenu(): void {
  byId('language').onclick = () => {
    setLegacyLanguage(getLegacyLanguage() === 'vi' ? 'en' : 'vi');
    location.reload();
  };
  byId('play').onclick = startAdventure;
  for (const avatar of ['boy', 'girl'] as const satisfies readonly Avatar[]) {
    byId(avatar).onclick = () => {
      gameState.save.avatar = avatar;
      getWorld().setAvatar(avatar);
      refreshHud();
      persistSave();
    };
  }
}
