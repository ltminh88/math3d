// HUD refresh (level, XP bar, coins, avatar, quest card, region locks, sound button) and the
// collapsible quest card. Called ad hoc after every progress change, like the original `_n()`.
import '../styles/player-card-name-fit.css';
import '../styles/touch-hit-areas.css';
import { isRegionUnlocked } from '../config/regions';
import { BRIDGE_SEGMENTS, LEVEL_XP_THRESHOLDS } from '../config/world-constants';
import { levelForXp } from '../game/xp-levels';
import { translateDomTree, translateLongText, translateText } from '../i18n/legacy-translator';
import { initShop } from '../shop/shop-init';
import { openShop } from '../shop/shop-panel';
import { tshop } from '../shop/shop-strings';
import { appSettings } from '../store/app-settings';
import { LABELED_REGIONS } from './dom-template';
import { gameState } from './game-state';
import { byId, icon } from './icons';
import { renderQuestCard } from './quest-chain';
import { setMarkup } from './set-markup-if-changed';

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
  renderQuestCard();
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
  byId('sound').setAttribute('aria-label', translateText(sound ? 'Tắt âm thanh' : 'Bật âm thanh'));
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
