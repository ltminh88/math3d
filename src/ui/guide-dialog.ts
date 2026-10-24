// Talking to VLM (E key or interact button when he is the nearest interactable, his label, or
// clicking him): quest intro, the way to the next open gate, or a practice offer.
import { BRIDGE_SEGMENTS } from '../config/world-constants';
import { gateNameOf } from '../levels/shared/level-host-strings';
import { openDialog } from './dialog';
import { gameState, getWorld } from './game-state';
import { refreshHud } from './hud';
import { byId, icon } from './icons';
import { interactWithNearest } from './interact-target';
import { saveQuestAccepted } from './progress-sync';
import { CHAIN_TEXT_KEYS, currentQuestStage } from './quest-chain';
import { tq } from './quest-chain-strings';
import { openQuiz } from './quiz-dialog';
import { showToast } from './toast-and-persist';

/** After the bridge quest: VLM points at the next open gate (or offers practice at the end). */
function afterQuestLine(): string {
  const stage = currentQuestStage();
  if (stage === 'bridge' || stage === 'done') {
    return 'Bạn muốn cùng mình luyện thêm phép nhân không?';
  }
  return tq(CHAIN_TEXT_KEYS[stage][4], { gate: gateNameOf(stage) });
}

function miloBodyHtml(bridgeDone: boolean): string {
  const questComplete = gameState.progress.questComplete;
  return `<div class="dialog-eyebrow">NGƯỜI DẪN ĐƯỜNG CỦA BẠN</div><p class="dialog-copy">${bridgeDone ? `Cây cầu của chúng mình thật đẹp! ${questComplete ? afterQuestLine() : 'Bạn hãy đi qua cầu đến khu vườn bên kia nhé. Mình cũng luôn sẵn sàng luyện tập cùng bạn!'}` : 'Khu vườn bên kia sông đang chờ chúng mình. Hãy giúp mình xây <strong>6 đoạn cầu</strong> bằng những viên đá phép thuật nhé!'}</p><div class="milo-tip"><span>✦</span><p>${bridgeDone ? 'Cứ thong thả, không cần vội. Mỗi lần thử là một lần bạn tiến bộ!' : 'Chọn phép nhân cho đúng số viên đá. Mỗi câu đúng: <b>+10 XP, +5 xu</b>. Nếu chưa đúng, chúng mình cùng đếm lại!'}</p></div><button id="accept-quest" class="primary wide">${bridgeDone ? 'Cùng luyện tập' : 'Cùng xây cầu nào!'} ${icon('arrow')}</button>`;
}

/** Opens VLM's dialog when playing and near him; otherwise nudges the player toward him. */
export function talkToGuide(): void {
  const world = getWorld();
  if (!world.active || world.paused) return;
  if (!gameState.nearMilo) {
    showToast('Hãy đến gần VLM — người bạn có chiếc mũ xanh bên bờ sông.');
    return;
  }
  gameState.audio.unlock();
  const bridgeDone = gameState.progress.bridge === BRIDGE_SEGMENTS;
  openDialog('Chào bạn, mình là VLM!', miloBodyHtml(bridgeDone), 'milo');
  byId('accept-quest').onclick = () => {
    gameState.progress.questAccepted = true;
    void saveQuestAccepted();
    refreshHud();
    openQuiz(bridgeDone ? 'practice' : 'bridge');
  };
}

export function wireGuideTriggers(): void {
  byId('interact').onclick = () => interactWithNearest();
  byId('milo-label').onclick = talkToGuide;
}
