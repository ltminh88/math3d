// HUD refresh (level, XP bar, coins, avatar, quest card, region locks, sound button) and the
// collapsible quest card. Called ad hoc after every save mutation, like the original `_n()`.
import { isRegionUnlocked } from '../config/regions';
import { BRIDGE_SEGMENTS, LEVEL_XP_THRESHOLDS } from '../config/world-constants';
import { levelForXp } from '../game/xp-levels';
import { translateDomTree, translateLongText } from '../i18n/legacy-translator';
import { LABELED_REGIONS } from './dom-template';
import { gameState } from './game-state';
import { byId, icon } from './icons';

const QUEST_COLLAPSED_KEY = 'aigame3d_quest_collapsed';

function questCopy(): string {
  const save = gameState.save;
  if (save.questComplete) {
    return 'Bạn đã nối liền hai bờ! Hãy khám phá các vùng đất mới trên bản đồ, hoặc quay lại VLM để luyện tập.';
  }
  if (save.bridge === BRIDGE_SEGMENTS) {
    return 'Cây cầu đã sẵn sàng! Hãy đi qua cầu sang khu vườn bên kia sông.';
  }
  return save.questAccepted
    ? 'Giúp VLM chọn phép nhân đúng. Mỗi câu trả lời sẽ xây thêm một đoạn cầu.'
    : 'VLM đang chờ bạn bên dòng sông. Đến gần và chào bạn ấy nhé!';
}

function questProgress(): string {
  const save = gameState.save;
  if (save.questComplete) return '✓ Hoàn thành';
  if (save.bridge === BRIDGE_SEGMENTS) return 'Đi qua cầu để hoàn thành';
  return save.questAccepted
    ? `${save.bridge} / ${BRIDGE_SEGMENTS} đoạn cầu`
    : 'Gặp người dẫn đường';
}

function questStepsHtml(): string {
  const built = gameState.save.bridge;
  return Array.from(
    { length: BRIDGE_SEGMENTS },
    (_, s) =>
      `<span class="${s < built ? 'done' : ''}" aria-label="Đoạn ${s + 1}: ${s < built ? 'đã xây' : 'chưa xây'}">${s < built ? icon('check') : s + 1}</span>`,
  ).join('');
}

function refreshXp(): void {
  const save = gameState.save;
  const level = levelForXp(save.xp);
  const floor = LEVEL_XP_THRESHOLDS[level - 1] as number;
  const next = LEVEL_XP_THRESHOLDS[level];
  byId('level').textContent = String(level);
  byId('coins').textContent = String(save.coins);
  byId('xp-text').textContent = translateLongText(
    next ? `${save.xp - floor} / ${next - floor} XP` : `${save.xp} XP · Cấp cao nhất`,
  );
  const percent = next ? Math.min(100, ((save.xp - floor) / (next - floor)) * 100) : 100;
  byId('xp-fill').style.width = `${percent}%`;
  byId('xp-fill').parentElement?.setAttribute('aria-valuenow', String(Math.round(percent)));
}

/** Re-renders every HUD field from the save, then re-runs the DOM translator on the HUD. */
export function refreshHud(): void {
  const save = gameState.save;
  refreshXp();
  byId('avatar-face').textContent = save.avatar === 'girl' ? '👧' : '👦';
  byId('player-name').textContent = save.avatar === 'girl' ? 'Nhà khám phá' : 'Nhà thám hiểm';
  byId('boy').setAttribute('aria-pressed', String(save.avatar === 'boy'));
  byId('girl').setAttribute('aria-pressed', String(save.avatar === 'girl'));
  byId('play').innerHTML = translateLongText(
    `${save.started ? 'Tiếp tục phiêu lưu' : 'Bắt đầu phiêu lưu'} ${icon('arrow')}`,
  );
  byId('quest-copy').textContent = questCopy();
  byId('quest-title').textContent = save.questComplete
    ? 'Cây cầu tình bạn đã hoàn thành!'
    : 'Một cây cầu, ngàn niềm vui';
  byId('quest-progress').textContent = questProgress();
  byId('quest-steps').innerHTML = questStepsHtml();
  byId('bridge-count').textContent = `${save.bridge} / ${BRIDGE_SEGMENTS} đoạn cầu`;
  for (const region of LABELED_REGIONS) {
    const label = byId(`${region.id}-label`);
    const unlocked = isRegionUnlocked(region, save.questComplete);
    label.classList.toggle('locked', !unlocked);
    (label.querySelector('.region-icon') as HTMLElement).textContent = unlocked
      ? region.icon
      : '🔒';
  }
  byId('sound').innerHTML = icon(save.sound ? 'sound' : 'mute');
  byId('sound').setAttribute('aria-label', save.sound ? 'Tắt âm thanh' : 'Bật âm thanh');
  gameState.audio.enabled = save.sound;
  translateDomTree(byId('hud'));
}

/** Collapses/expands the quest card and remembers the choice. */
export function setQuestCollapsed(collapsed: boolean): void {
  byId('quest-card').classList.toggle('collapsed', collapsed);
  byId('quest-toggle').setAttribute('aria-expanded', String(!collapsed));
  try {
    localStorage.setItem(QUEST_COLLAPSED_KEY, collapsed ? '1' : '0');
  } catch {}
}

/** Wires the toggle and restores the collapsed state (always collapsed on narrow screens). */
export function initQuestCard(): void {
  byId('quest-toggle').onclick = () =>
    setQuestCollapsed(!byId('quest-card').classList.contains('collapsed'));
  try {
    if (
      localStorage.getItem(QUEST_COLLAPSED_KEY) === '1' ||
      matchMedia('(max-width: 700px)').matches
    ) {
      setQuestCollapsed(true);
    }
  } catch {}
}
