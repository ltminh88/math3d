// HUD refresh (level, XP bar, coins, avatar, quest card, region locks, sound button) and the
// collapsible quest card. Called ad hoc after every progress change, like the original `_n()`.
import { isRegionUnlocked } from '../config/regions';
import { BRIDGE_SEGMENTS, LEVEL_XP_THRESHOLDS } from '../config/world-constants';
import { levelForXp } from '../game/xp-levels';
import { translateDomTree, translateLongText } from '../i18n/legacy-translator';
import { initShop } from '../shop/shop-init';
import { openShop } from '../shop/shop-panel';
import { tshop } from '../shop/shop-strings';
import { appSettings } from '../store/app-settings';
import { LABELED_REGIONS } from './dom-template';
import { gameState } from './game-state';
import { byId, icon } from './icons';

function questCopy(): string {
  const progress = gameState.progress;
  if (progress.questComplete) {
    return 'Bạn đã nối liền hai bờ! Hãy khám phá các vùng đất mới trên bản đồ, hoặc quay lại VLM để luyện tập.';
  }
  if (progress.bridge === BRIDGE_SEGMENTS) {
    return 'Cây cầu đã sẵn sàng! Hãy đi qua cầu sang khu vườn bên kia sông.';
  }
  return progress.questAccepted
    ? 'Giúp VLM chọn phép nhân đúng. Mỗi câu trả lời sẽ xây thêm một đoạn cầu.'
    : 'VLM đang chờ bạn bên dòng sông. Đến gần và chào bạn ấy nhé!';
}

function questProgress(): string {
  const progress = gameState.progress;
  if (progress.questComplete) return '✓ Hoàn thành';
  if (progress.bridge === BRIDGE_SEGMENTS) return 'Đi qua cầu để hoàn thành';
  return progress.questAccepted
    ? `${progress.bridge} / ${BRIDGE_SEGMENTS} đoạn cầu`
    : 'Gặp người dẫn đường';
}

function questStepsHtml(): string {
  const built = gameState.progress.bridge;
  return Array.from(
    { length: BRIDGE_SEGMENTS },
    (_, s) =>
      `<span class="${s < built ? 'done' : ''}" aria-label="Đoạn ${s + 1}: ${s < built ? 'đã xây' : 'chưa xây'}">${s < built ? icon('check') : s + 1}</span>`,
  ).join('');
}

function refreshXp(): void {
  const progress = gameState.progress;
  const level = levelForXp(progress.xp);
  const floor = LEVEL_XP_THRESHOLDS[level - 1] as number;
  const next = LEVEL_XP_THRESHOLDS[level];
  byId('level').textContent = String(level);
  byId('coins').textContent = String(progress.coins);
  byId('xp-text').textContent = translateLongText(
    next ? `${progress.xp - floor} / ${next - floor} XP` : `${progress.xp} XP · Cấp cao nhất`,
  );
  const percent = next ? Math.min(100, ((progress.xp - floor) / (next - floor)) * 100) : 100;
  byId('xp-fill').style.width = `${percent}%`;
  byId('xp-fill').parentElement?.setAttribute('aria-valuenow', String(Math.round(percent)));
}

/**
 * Rewrites markup only when it changed: the HUD is refreshed again after the store hydrates, and
 * re-inserting identical icons under the glass (backdrop-filter) buttons changes their raster.
 */
const writtenMarkup = new WeakMap<Element, string>();
function setMarkup(id: string, html: string): void {
  const el = byId(id);
  if (writtenMarkup.get(el) !== html) {
    el.innerHTML = html;
    writtenMarkup.set(el, html);
  }
}

/** The toolbar's shop button (phase 19), added once next to the map button. */
function ensureShopButton(): void {
  if (document.getElementById('open-shop')) return;
  const button = document.createElement('button');
  button.id = 'open-shop';
  button.className = 'tool-button';
  button.innerHTML = `${icon('coin')}<span></span>`;
  (button.querySelector('span') as HTMLElement).textContent = tshop('hudButton');
  button.onclick = openShop;
  byId('learn').before(button);
}

/** Re-renders every HUD field from the progress view, then re-runs the DOM translator on the HUD. */
export function refreshHud(): void {
  const progress = gameState.progress;
  refreshXp();
  byId('avatar-face').textContent = progress.avatar === 'girl' ? '👧' : '👦';
  byId('player-name').textContent = progress.avatar === 'girl' ? 'Nhà khám phá' : 'Nhà thám hiểm';
  byId('boy').setAttribute('aria-pressed', String(progress.avatar === 'boy'));
  byId('girl').setAttribute('aria-pressed', String(progress.avatar === 'girl'));
  setMarkup(
    'play',
    translateLongText(
      `${progress.started ? 'Tiếp tục phiêu lưu' : 'Bắt đầu phiêu lưu'} ${icon('arrow')}`,
    ),
  );
  byId('quest-copy').textContent = questCopy();
  byId('quest-title').textContent = progress.questComplete
    ? 'Cây cầu tình bạn đã hoàn thành!'
    : 'Một cây cầu, ngàn niềm vui';
  byId('quest-progress').textContent = questProgress();
  setMarkup('quest-steps', questStepsHtml());
  byId('bridge-count').textContent = `${progress.bridge} / ${BRIDGE_SEGMENTS} đoạn cầu`;
  for (const region of LABELED_REGIONS) {
    const label = byId(`${region.id}-label`);
    const unlocked = isRegionUnlocked(region, progress.questComplete);
    label.classList.toggle('locked', !unlocked);
    (label.querySelector('.region-icon') as HTMLElement).textContent = unlocked
      ? region.icon
      : '🔒';
  }
  const { sound } = appSettings.get();
  setMarkup('sound', icon(sound ? 'sound' : 'mute'));
  byId('sound').setAttribute('aria-label', sound ? 'Tắt âm thanh' : 'Bật âm thanh');
  gameState.audio.enabled = sound;
  ensureShopButton();
  initShop();
  translateDomTree(byId('hud'));
}

/** Collapses/expands the quest card and remembers the choice. */
export function setQuestCollapsed(collapsed: boolean): void {
  byId('quest-card').classList.toggle('collapsed', collapsed);
  byId('quest-toggle').setAttribute('aria-expanded', String(!collapsed));
  appSettings.update({ questCollapsed: collapsed });
}

/** Wires the toggle and restores the collapsed state (always collapsed on narrow screens). */
export function initQuestCard(): void {
  byId('quest-toggle').onclick = () =>
    setQuestCollapsed(!byId('quest-card').classList.contains('collapsed'));
  if (appSettings.get().questCollapsed || matchMedia('(max-width: 700px)').matches) {
    setQuestCollapsed(true);
  }
}
