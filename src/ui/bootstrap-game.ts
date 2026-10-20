// Game bootstrap: renders the shell, wires every control in the original order, builds the 3D
// world (synchronously, as the original: world text signs and Math.random order depend on it),
// then opens the store and hydrates progress (store-boot.ts). Without WebGL the loading card
// turns into a "could not open the 3D world" notice.
import { translateDomTree } from '../i18n/legacy-translator';
import { initLevelGates } from '../levels/shared/level-gates';
import { World } from '../world/world';
import type { WorldPublicApi } from '../world/world-public-api';
import { wireBookAndHelp } from './book-help-dialogs';
import { wireDialog } from './dialog';
import { gameShellHtml } from './dom-template';
import { gameState } from './game-state';
import { talkToGuide, wireGuideTriggers } from './guide-dialog';
import { initQuestCard, refreshHud } from './hud';
import { byId } from './icons';
import { registerGuideInteractable } from './interact-target';
import { wireKeyboardAndJoystick } from './keyboard-joystick';
import { wireMapOverlay } from './map-overlay';
import { wireMenu } from './menu-language-start';
import { wireSettingsAndToolbar } from './settings-dialog';
import { bootStore } from './store-boot';
import { onWorldFrame } from './world-frame-hook';

const WORLD_FAILED_HTML =
  '<strong>Chưa mở được thế giới 3D</strong><p>Hãy bật tăng tốc đồ họa trong trình duyệt, hoặc thử Chrome / Edge mới hơn.</p><button class="primary" onclick="location.reload()">Thử lại</button>';

declare global {
  interface Window {
    /** Test builds only: the world instance for parity scene dumps. */
    __parity?: WorldPublicApi;
  }
}

function wireControls(): void {
  initQuestCard();
  wireDialog();
  wireMenu();
  wireGuideTriggers();
  wireBookAndHelp();
  wireSettingsAndToolbar();
  wireMapOverlay();
  wireKeyboardAndJoystick();
}

function startWorld(): void {
  try {
    const world = new World(byId('world'));
    gameState.world = world;
    if (import.meta.env.MODE === 'test') {
      window.__parity = world;
      void import('../levels/shared/test-debug-hook').then((m) => m.installTestDebugHook());
    }
    registerGuideInteractable();
    initLevelGates(world);
    world.setBridge(gameState.progress.bridge);
    world.setAvatar(gameState.progress.avatar);
    world.onJump = () => gameState.audio.jump();
    world.onSceneClick = () => talkToGuide();
    world.onFrame = onWorldFrame;
    byId('loading').hidden = true;
    refreshHud();
  } catch (error) {
    byId('loading').innerHTML = WORLD_FAILED_HTML;
    console.error(error);
  }
}

/** Builds the whole game into `#app`. Call once, after the stylesheet is imported. */
export function bootstrapGame(): Promise<void> {
  const app = byId('app');
  app.innerHTML = gameShellHtml();
  translateDomTree(app);
  wireControls();
  startWorld();
  return bootStore();
}
