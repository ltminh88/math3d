// Welcome menu: language toggle (persists then reloads), avatar choice, start/continue and
// returning to the menu from settings.

import { getLegacyLanguage, setLegacyLanguage } from '../i18n/legacy-translator';
import type { Avatar } from '../save/save-types';
import { appSettings } from '../store/app-settings';
import { whenStoreReady } from './boot-window-action-gate';
import { closeDialog } from './dialog';
import { th } from './english/english-home-strings';
import { gameState, getWorld } from './game-state';
import { refreshHud } from './hud';
import { byId, icon } from './icons';
import { closeMap, drawMinimap } from './map-overlay';
import { saveAvatar, saveGameMeta } from './progress-sync';
import { openSaveCodeImport } from './save-code-dialog';
import { showToast } from './toast-and-persist';
import { updateCurrentArea } from './world-labels';

/** Leaves the menu: starts music, activates the world and shows the HUD. */
export function startAdventure(): void {
  gameState.audio.unlock();
  gameState.audio.music(appSettings.get().music);
  gameState.progress.started = true;
  const world = getWorld();
  // Coming from the English home the world loop is suspended (a run's exit skips the
  // resume there); restart it. A no-op when the world was never suspended.
  world.resume();
  world.active = true;
  world.paused = false;
  world.setAvatar(gameState.progress.avatar);
  byId('welcome').hidden = true;
  byId('hud').hidden = false;
  byId('area-label').hidden = false;
  byId('world-caption').hidden = true;
  byId('menu-footer').hidden = true;
  document.body.classList.add('playing');
  void saveGameMeta({ started: true });
  appSettings.update({ playMode: 'game' });
  refreshHud();
  gameState.currentRegionId = '';
  updateCurrentArea();
  requestAnimationFrame(drawMinimap);
  showToast('Chào bạn! Di chuyển đến VLM, hoặc chạm xuống đất để đi.');
}

/** Back to the welcome menu: closes dialog/map, deactivates the world, stops music. */
export function returnToMenu(): void {
  closeDialog();
  closeMap();
  const world = getWorld();
  // Back from the English home the world loop may be suspended; restart it so the
  // welcome shows the live village again. A no-op when it was never suspended.
  world.resume();
  world.active = false;
  world.clearInput();
  byId('welcome').hidden = false;
  byId('hud').hidden = true;
  byId('area-label').hidden = true;
  byId('world-caption').hidden = false;
  byId('menu-footer').hidden = false;
  document.body.classList.remove('playing');
  refreshModeButtons();
  refreshHud();
  gameState.audio.music(false);
}

/** Highlights the welcome button of the remembered mode; the child still taps one each time. */
export function refreshModeButtons(): void {
  const mode = appSettings.get().playMode;
  // The English button's label comes from the home strings, so it translates in en mode
  // (the legacy translator's table is golden-guarded and takes no new entries).
  byId('play-english').innerHTML = `${th('title')} ${icon('book')}`;
  byId('play').classList.toggle('selected', mode === 'game');
  byId('play-english').classList.toggle('selected', mode === 'english');
}

export function wireMenu(): void {
  byId('language').onclick = () => {
    setLegacyLanguage(getLegacyLanguage() === 'vi' ? 'en' : 'vi');
    location.reload();
  };
  // Progress-changing clicks wait for the store boot (boot-window-action-gate.ts).
  byId('play').onclick = () => whenStoreReady('play', startAdventure);
  // English mode is its own lazy chunk: the world is never activated from here.
  byId('play-english').onclick = () =>
    whenStoreReady(
      'play-english',
      () => void import('./english/english-home').then((m) => m.startEnglishHome()),
    );
  refreshModeButtons();
  for (const avatar of ['boy', 'girl'] as const satisfies readonly Avatar[]) {
    byId(avatar).onclick = () =>
      whenStoreReady('avatar', () => {
        gameState.progress.avatar = avatar;
        getWorld().setAvatar(avatar);
        refreshHud();
        void saveAvatar(avatar);
      });
  }
  byId('import-save-code').onclick = () => whenStoreReady('import', () => openSaveCodeImport());
}
