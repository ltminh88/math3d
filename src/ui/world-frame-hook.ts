// Per-frame world hook: interact button, level gate states, floating labels, area badge, minimap
// refresh and the quest completion (+50 XP, +10 coins) when the player crosses the finished bridge.
import { Vector3 } from 'three';
import { BRIDGE_SEGMENTS } from '../config/world-constants';
import { refreshLevelGates } from '../levels/shared/level-gates';
import { tl } from '../levels/shared/level-host-strings';
import { QUEST_COMPLETE_REWARD } from '../quiz/quiz-rewards';
import { closeDialog, openDialog } from './dialog';
import { gameState, getWorld } from './game-state';
import { refreshHud } from './hud';
import { byId, icon } from './icons';
import { renderInteractButton } from './interact-target';
import { drawMinimap } from './map-overlay';
import { saveQuestComplete } from './progress-sync';
import { tq } from './quest-chain-strings';
import { projectWorldLabels, updateCurrentArea } from './world-labels';

function completeQuest(): void {
  const progress = gameState.progress;
  const world = getWorld();
  progress.questComplete = true;
  progress.xp += QUEST_COMPLETE_REWARD.xp;
  progress.coins += QUEST_COMPLETE_REWARD.coins;
  void saveQuestComplete();
  refreshHud();
  gameState.audio.celebrate();
  world.burst(world.player.position.clone().add(new Vector3(0, 1, 0)));
  openDialog(
    'Bạn đã làm được rồi!',
    `<div class="completion-medal">${icon('crown')}</div><p class="dialog-copy centered">Nhờ bạn, hai bờ đã được nối liền.<br><b>Cây cầu tình bạn</b> đã hoàn thành!</p><div class="completion-rewards"><span>★ +50 XP</span><span>◉ +10 xu</span></div><p class="book-note centered">${tq('completeNote', { gate: tl('gateField') })}</p><button id="keep-playing" class="primary wide">Tiếp tục khám phá ${icon('arrow')}</button>`,
    'complete',
  );
  byId('keep-playing').onclick = closeDialog;
}

/**
 * World `onFrame` handler. UI work runs every 2nd frame while playing (minimap every 6th);
 * `crossedBridge` is the world's east-bank check (x > 12, |z| < 4).
 */
export function onWorldFrame(nearMilo: boolean, crossedBridge: boolean): void {
  const world = getWorld();
  gameState.nearMilo = nearMilo;
  if (++gameState.frameCount % 2 !== 0 || !world.active) return;
  renderInteractButton(world.nearestInteractable(), world.paused);
  refreshLevelGates();
  projectWorldLabels();
  byId('milo-label').classList.toggle('near', nearMilo);
  updateCurrentArea();
  if (gameState.frameCount % 6 === 0) {
    drawMinimap();
  }
  const progress = gameState.progress;
  if (
    world.active &&
    !world.paused &&
    progress.bridge === BRIDGE_SEGMENTS &&
    !progress.questComplete &&
    crossedBridge
  ) {
    completeQuest();
  }
}
