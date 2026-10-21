// The shop panel: opens in the shared recovered <dialog> (which pauses the world and restores it
// on close), so it is keyboard and screen-reader reachable like every other dialog. Never opens
// while a level runs. Every action goes through the pure purchase flow; coins spent are taken
// off the HUD's progress view once the store confirms.
import { isLevelRunning } from '../levels/shared/level-gates';
import { openDialog } from '../ui/dialog';
import { gameState } from '../ui/game-state';
import { refreshHud } from '../ui/hud';
import { byId } from '../ui/icons';
import { announce } from '../ui/kit/aria-announcer';
import { connectedStore, flushProgress } from '../ui/progress-sync';
import { showToast } from '../ui/toast-and-persist';
import { COSMETIC_SLOTS, type CosmeticSlot, cosmeticById } from './cosmetic-catalog';
import { type ShopView, shopPanelHtml, useVerb } from './shop-panel-markup';
import { buyCosmetic, equipCosmetic, type ShopStore, unequipSlot } from './shop-purchase-flow';
import { cosmeticName, tshop } from './shop-strings';
import './shop-panel.css';

let view: ShopView = { tab: 'vlm-outfit', confirming: undefined, message: '' };
let busy = false;

/** Re-renders the panel and puts focus back on `focus` (a selector inside the panel). */
function render(store: ShopStore, focus?: string): void {
  openDialog(tshop('title'), shopPanelHtml(store.getSnapshot(), view), 'shop');
  const panel = document.querySelector<HTMLElement>('.shop-panel');
  if (!panel) return;
  panel.onclick = (event) => onClick(store, event);
  panel.onkeydown = (event) => onTabKey(store, event);
  if (view.message) announce(view.message);
  const target = focus ? panel.querySelector<HTMLElement>(focus) : undefined;
  (target ?? byId(`shop-tab-${view.tab}`)).focus();
}

const cardFocus = (id: string) => `[data-card="${id}"] .shop-action`;

function setView(store: ShopStore, patch: Partial<ShopView>, focus?: string): void {
  view = { ...view, ...patch };
  render(store, focus);
}

/** Arrow keys move between the tabs (WAI-ARIA tabs pattern). */
function onTabKey(store: ShopStore, event: KeyboardEvent): void {
  if (!(event.target as HTMLElement).matches('.shop-tab')) return;
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
  event.preventDefault();
  const step = event.key === 'ArrowRight' ? 1 : -1;
  const index = COSMETIC_SLOTS.indexOf(view.tab);
  const tab = COSMETIC_SLOTS.at((index + step) % COSMETIC_SLOTS.length) as CosmeticSlot;
  setView(store, { tab, confirming: undefined, message: '' });
}

async function run(store: ShopStore, action: string, id: string): Promise<void> {
  const item = cosmeticById(id);
  if (!item) return;
  const name = cosmeticName(id);
  if (action === 'cancel')
    return setView(store, { confirming: undefined, message: '' }, cardFocus(id));
  if (action === 'ask') {
    const missing = item.price - store.getSnapshot().wallet.coins;
    if (missing > 0)
      return setView(store, { message: tshop('notEnough', { missing }) }, cardFocus(id));
    return setView(
      store,
      { confirming: id, message: '' },
      `[data-card="${id}"] [data-action="buy"]`,
    );
  }
  if (action === 'buy') {
    const result = await buyCosmetic(store, item);
    if (result.ok) {
      gameState.progress.coins = Math.max(0, gameState.progress.coins - item.price);
      refreshHud();
    }
    const message = result.ok
      ? tshop('bought', { name, action: useVerb(item.slot) })
      : result.reason === 'insufficient-coins'
        ? tshop('notEnough', { missing: result.missing })
        : '';
    return setView(store, { confirming: undefined, message }, cardFocus(id));
  }
  if (action === 'equip') await equipCosmetic(store, item);
  if (action === 'unequip') await unequipSlot(store, item.slot);
  const message = action === 'equip' ? tshop('worn', { name }) : tshop('removed', { name });
  setView(store, { message }, cardFocus(id));
}

function onClick(store: ShopStore, event: MouseEvent): void {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
  if (!button || busy) return;
  if (button.dataset.tab) {
    setView(store, { tab: button.dataset.tab as CosmeticSlot, confirming: undefined, message: '' });
    return;
  }
  const { action, item } = button.dataset;
  if (!action || !item) return;
  busy = true;
  run(store, action, item)
    .catch((err: unknown) => {
      console.error('Shop action failed', err);
      setView(store, { confirming: undefined, message: tshop('failed') });
    })
    .finally(() => {
      busy = false;
    });
}

/** Opens the shop (stall or HUD button). Ignored inside a level or before the game starts. */
export function openShop(): void {
  const world = gameState.world;
  if (!world?.active || isLevelRunning()) return;
  const store = connectedStore();
  if (!store) {
    showToast(tshop('unavailable'));
    return;
  }
  view = { tab: view.tab, confirming: undefined, message: '' };
  // Pending quiz coins reach the wallet first, so the panel shows what the HUD shows.
  void flushProgress().then(() => render(store));
}
