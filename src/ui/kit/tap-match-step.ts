// Match step widget (boost, Phase 2B): tap a left tile, then a right tile, to
// pair them; pair all, then "Xong". Tap a paired tile to undo that pair. Tap
// only — every tile is a real <button>, so touch and keyboard play the same
// way. A wrong pair flashes after "Xong" and stays playable.
import { announce } from './aria-announcer';
import { tkm } from './step-kit-order-match-strings';
import { createUiButton } from './ui-button';
import { tk } from './ui-kit-strings';

export interface TapMatchStep {
  element: HTMLElement;
  /** Marks the wrong pairs after a wrong "Xong". */
  markWrong(wrong: readonly { left: number; right: number }[]): void;
  setDisabled(disabled: boolean): void;
  destroy(): void;
}

/** 2–4 pairs (narrow phones wrap the columns; more would overflow). `left`
 * and `right` must have equal lengths — the widget throws otherwise, so a
 * generator (3A's add-sub-match) must emit equal sides. */
export function createTapMatchStep(
  left: readonly string[],
  right: readonly string[],
  onDone: (pairs: number[]) => void,
  doc: Document = document,
): TapMatchStep {
  if (left.length < 2 || left.length > 4 || left.length !== right.length) {
    throw new RangeError(
      `createTapMatchStep needs 2-4 equal sides, got left ${left.length}, right ${right.length}`,
    );
  }
  let disabled = false;
  /** pairs[i] = the right index paired with left i, or null when unpaired. */
  const pairs: (number | null)[] = left.map(() => null);
  let selected: { side: 'left' | 'right'; index: number } | null = null;
  const element = doc.createElement('div');
  element.className = 'kit-match';
  element.setAttribute('role', 'group');
  element.setAttribute('aria-label', tkm('matchCue'));
  const columns = doc.createElement('div');
  columns.className = 'kit-match__columns';
  const leftCol = doc.createElement('div');
  leftCol.className = 'kit-match__column';
  leftCol.setAttribute('role', 'group');
  leftCol.setAttribute('aria-label', tkm('matchLeft'));
  const rightCol = doc.createElement('div');
  rightCol.className = 'kit-match__column';
  rightCol.setAttribute('role', 'group');
  rightCol.setAttribute('aria-label', tkm('matchRight'));
  columns.append(leftCol, rightCol);

  const done = createUiButton(
    { label: tk('ok'), onClick: () => onDone(pairs.map((p) => p as number)) },
    doc,
  );
  done.classList.add('kit-match__done');

  const leftButtons: HTMLButtonElement[] = [];
  const rightButtons: HTMLButtonElement[] = [];

  const refreshDone = () => {
    done.disabled = disabled || pairs.some((p) => p === null);
  };

  const clearWrong = () => {
    for (const b of [...leftButtons, ...rightButtons]) b.classList.remove('wrong');
  };

  const clearSelection = () => {
    selected = null;
    for (const b of [...leftButtons, ...rightButtons]) b.classList.remove('selected');
  };

  const renderPairs = () => {
    // Paired tiles share a tint (data-pair) and a pair number, so the child
    // can see which left goes with which right (R90.4). The number rides in
    // an aria-hidden span: a ::after badge would leak into the button's
    // accessible name ('1 m 1') and break exact-name lookups.
    const pairNo = (b: HTMLButtonElement, n: number | null) => {
      const existing = b.querySelector('.kit-match__pair-no');
      if (n === null) {
        existing?.remove();
        return;
      }
      if (existing) {
        existing.textContent = String(n);
        return;
      }
      const span = doc.createElement('span');
      span.className = 'kit-match__pair-no';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = String(n);
      b.append(span);
    };
    for (const [i, b] of leftButtons.entries()) {
      const paired = pairs[i] !== null;
      b.classList.toggle('paired', paired);
      b.setAttribute('aria-pressed', String(paired));
      if (paired) b.dataset.pair = String(i + 1);
      else delete b.dataset.pair;
      pairNo(b, paired ? i + 1 : null);
    }
    for (const [j, b] of rightButtons.entries()) {
      const leftIndex = pairs.indexOf(j);
      const paired = leftIndex >= 0;
      b.classList.toggle('paired', paired);
      b.setAttribute('aria-pressed', String(paired));
      if (paired) b.dataset.pair = String(leftIndex + 1);
      else delete b.dataset.pair;
      pairNo(b, paired ? leftIndex + 1 : null);
    }
  };

  const unpair = (side: 'left' | 'right', index: number) => {
    if (side === 'left') {
      pairs[index] = null;
    } else {
      const leftIndex = pairs.indexOf(index);
      if (leftIndex >= 0) pairs[leftIndex] = null;
    }
  };

  const select = (side: 'left' | 'right', index: number) => {
    if (disabled) return;
    clearWrong();
    const button = side === 'left' ? leftButtons[index] : rightButtons[index];
    const label = button?.textContent ?? '';
    const paired = side === 'left' ? pairs[index] !== null : pairs.includes(index);
    if (paired) {
      // A paired tile unties its pair; the partner stays for a new match.
      unpair(side, index);
      announce(tkm('unpaired', { label }), doc);
      clearSelection();
      renderPairs();
      refreshDone();
      return;
    }
    if (selected?.side === side && selected.index === index) {
      clearSelection();
      return;
    }
    if (selected && selected.side !== side) {
      const leftIndex = side === 'left' ? index : selected.index;
      const rightIndex = side === 'right' ? index : selected.index;
      pairs[leftIndex] = rightIndex;
      announce(tkm('paired', { label }), doc);
      clearSelection();
      renderPairs();
      refreshDone();
      return;
    }
    clearSelection();
    selected = { side, index };
    button?.classList.add('selected');
  };

  for (const [i, label] of left.entries()) {
    const button = createUiButton(
      { label, variant: 'secondary', onClick: () => select('left', i) },
      doc,
    );
    button.classList.add('kit-match__left');
    button.dataset.left = String(i);
    leftCol.appendChild(button);
    leftButtons.push(button);
  }
  for (const [j, label] of right.entries()) {
    const button = createUiButton(
      { label, variant: 'secondary', onClick: () => select('right', j) },
      doc,
    );
    button.classList.add('kit-match__right');
    button.dataset.right = String(j);
    rightCol.appendChild(button);
    rightButtons.push(button);
  }
  element.append(columns, done);
  refreshDone();

  return {
    element,
    markWrong(wrong) {
      for (const { left: li, right: ri } of wrong) {
        leftButtons[li]?.classList.add('wrong');
        rightButtons[ri]?.classList.add('wrong');
      }
    },
    setDisabled: (value) => {
      disabled = value;
      for (const b of [...leftButtons, ...rightButtons]) b.disabled = value;
      refreshDone();
    },
    destroy: () => element.remove(),
  };
}
