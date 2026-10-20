// Renders the world and HUD from the progress view (boot hydrate, save-code import). Like the
// original bootstrap, nothing is rendered when the world failed to build (WebGL unavailable).
import { gameState } from './game-state';
import { refreshHud } from './hud';

export function renderProgress(): void {
  const world = gameState.world;
  if (!world) return;
  world.setBridge(gameState.progress.bridge);
  world.setAvatar(gameState.progress.avatar);
  refreshHud();
}
