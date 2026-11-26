// Order step widget (boost, Phase 2B): tap tiles into the slots in order, then
// "Xong". Tap a tile in a slot to send it back to the bank. Tap only — every
// tile is a real <button>, so touch and keyboard play the same way. A wrong
// order stays in the slots for the child to rearrange.
import { announce } from './aria-announcer';
import { tkm } from './step-kit-order-match-strings';
import { createUiButton } from './ui-button';
import { tk } from './ui-kit-strings';

export interface TapOrderStep {
  element: HTMLElement;
  /** Marks the first misplaced tile after a wrong "Xong". */
  markWrong(slotIndex: number): void;
  setDisabled(disabled: boolean): void;
  destroy(): void;
}

/** 2–5 tiles (narrow phones wrap to two rows; more would overflow). */
export function createTapOrderStep(
  tiles: readonly string[],
  onDone: (sequence: number[]) => void,
  doc: Document = document,
): TapOrderStep {
  if (tiles.length < 2 || tiles.length > 5) {
    throw new RangeError(`createTapOrderStep needs 2-5 tiles, got ${tiles.length}`);
  }
  let disabled = false;
  const element = doc.createElement('div');
  element.className = 'kit-order';
  element.setAttribute('role', 'group');
  element.setAttribute('aria-label', tkm('orderCue'));
  const slots = doc.createElement('div');
  slots.className = 'kit-order__slots';
  slots.setAttribute('role', 'group');
  slots.setAttribute('aria-label', tkm('orderSlots'));
  const bank = doc.createElement('div');
  bank.className = 'kit-order__bank';
  bank.setAttribute('role', 'group');
  bank.setAttribute('aria-label', tkm('orderBank'));

  const done = createUiButton({ label: tk('ok'), onClick: () => onDone(sequence()) }, doc);
  done.classList.add('kit-order__done');

  /** Tile indices in slot order (what "Xong" submits). */
  const sequence = (): number[] =>
    [...slots.querySelectorAll('.kit-order__tile')].map((t) =>
      Number((t as HTMLElement).dataset.tile),
    );

  const refreshDone = () => {
    done.disabled = disabled || sequence().length !== tiles.length;
  };

  /** One tap moves the tile: bank -> first empty slot, slot -> back to the bank. */
  const toggleTile = (tile: HTMLButtonElement) => {
    if (disabled) return;
    tile.classList.remove('wrong');
    const label = tile.textContent ?? '';
    const inSlot = tile.parentElement?.classList.contains('kit-order__slot') ?? false;
    if (inSlot) {
      bank.appendChild(tile);
      announce(tkm('returned', { label }), doc);
    } else {
      const empty = [...slots.children].find((s) => s.childElementCount === 0);
      if (!empty) return;
      empty.appendChild(tile);
      announce(tkm('placed', { label }), doc);
    }
    refreshDone();
  };

  for (const [index, label] of tiles.entries()) {
    const tile = createUiButton(
      { label, variant: 'secondary', onClick: () => toggleTile(tile) },
      doc,
    );
    tile.classList.add('kit-order__tile');
    tile.dataset.tile = String(index);
    bank.appendChild(tile);
  }
  for (let i = 0; i < tiles.length; i++) {
    const slot = doc.createElement('div');
    slot.className = 'kit-order__slot';
    slots.appendChild(slot);
  }
  element.append(slots, bank, done);
  refreshDone();

  return {
    element,
    markWrong(slotIndex) {
      const tile = slots.children[slotIndex]?.querySelector('.kit-order__tile');
      tile?.classList.add('wrong');
    },
    setDisabled: (value) => {
      disabled = value;
      for (const tile of element.querySelectorAll('button'))
        (tile as HTMLButtonElement).disabled = value;
      refreshDone();
    },
    destroy: () => element.remove(),
  };
}
