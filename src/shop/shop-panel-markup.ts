// Markup of the shop panel (inside the shared recovered dialog): wallet line, one tab per slot,
// item cards with price/state/action, an inline buy confirmation and a polite status line.
// Static strings only: every text comes from the shop string table or the catalog.
import type { GameSnapshot } from '../store/progress-repository';
import { icon } from '../ui/icons';
import {
  COSMETIC_SLOTS,
  type CosmeticItem,
  type CosmeticSlot,
  itemsInSlot,
} from './cosmetic-catalog';
import { itemState } from './shop-purchase-flow';
import { cosmeticName, tshop } from './shop-strings';

export interface ShopView {
  readonly tab: CosmeticSlot;
  /** Item whose buy confirmation is showing. */
  readonly confirming: string | undefined;
  readonly message: string;
}

/** Verb for using / removing an item of `slot` (outfits are worn, decor is placed). */
export const useVerb = (slot: CosmeticSlot): string =>
  slot === 'village-decor' ? tshop('place') : tshop('wear');
export const removeVerb = (slot: CosmeticSlot): string =>
  slot === 'village-decor' ? tshop('putAway') : tshop('takeOff');

const action = (name: string, item: CosmeticItem, label: string, cls = 'secondary') =>
  `<button type="button" class="${cls} shop-action" data-action="${name}" data-item="${item.id}">${label}</button>`;

function cardActions(item: CosmeticItem, snapshot: GameSnapshot, view: ShopView): string {
  const state = itemState(item, snapshot);
  if (state === 'equipped') return action('unequip', item, removeVerb(item.slot));
  if (state === 'owned') return action('equip', item, useVerb(item.slot), 'primary');
  if (view.confirming === item.id) {
    const question = tshop('confirm', { name: cosmeticName(item.id), price: item.price });
    return `<p class="shop-confirm">${question}</p><div class="shop-confirm-actions">${action('buy', item, tshop('confirmYes'), 'primary')}${action('cancel', item, tshop('confirmNo'), 'text-button')}</div>`;
  }
  return action('ask', item, `${tshop('buy')} · ${tshop('price', { price: item.price })}`);
}

function cardHtml(item: CosmeticItem, snapshot: GameSnapshot, view: ShopView): string {
  const state = itemState(item, snapshot);
  const badge =
    state === 'equipped'
      ? `<em class="shop-badge equipped">${icon('check')} ${tshop('stateEquipped')}</em>`
      : state === 'owned'
        ? `<em class="shop-badge">${tshop('stateOwned')}</em>`
        : `<em class="shop-price">${icon('coin')} ${tshop('price', { price: item.price })}</em>`;
  return `<li class="shop-card" data-card="${item.id}" data-state="${state}"><strong>${cosmeticName(item.id)}</strong>${badge}<div class="shop-card-actions">${cardActions(item, snapshot, view)}</div></li>`;
}

const tabHtml = (slot: CosmeticSlot, active: boolean): string =>
  `<button type="button" role="tab" id="shop-tab-${slot}" class="shop-tab" data-tab="${slot}" aria-selected="${active}" aria-controls="shop-items" tabindex="${active ? 0 : -1}">${tshop(`tab-${slot}`)}</button>`;

export function shopPanelHtml(snapshot: GameSnapshot, view: ShopView): string {
  const tabs = COSMETIC_SLOTS.map((slot) => tabHtml(slot, slot === view.tab)).join('');
  const cards = itemsInSlot(view.tab)
    .map((item) => cardHtml(item, snapshot, view))
    .join('');
  return `<div class="shop-panel"><div class="dialog-eyebrow">${tshop('eyebrow')}</div><p class="dialog-copy">${tshop('intro')}</p><p id="shop-wallet" class="shop-wallet">${icon('coin')} ${tshop('wallet', { coins: snapshot.wallet.coins })}</p><div class="shop-tabs" role="tablist" aria-label="${tshop('tabsLabel')}">${tabs}</div><ul id="shop-items" class="shop-items" role="tabpanel" aria-labelledby="shop-tab-${view.tab}">${cards}</ul><p id="shop-status" class="shop-status" role="status" aria-live="polite">${view.message}</p></div>`;
}
