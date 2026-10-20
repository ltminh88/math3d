// Re-renders the world and HUD after the progress view was replaced (boot hydrate, save-code
// import). Without a world (WebGL failed) only the HUD is refreshed.
import { gameState } from './game-state';
import { refreshHud } from './hud';

export function renderProgress(): void {
  const world = gameState.world;
  if (world) {
    world.setBridge(gameState.progress.bridge);
    world.setAvatar(gameState.progress.avatar);
  }
  refreshHud();
}
