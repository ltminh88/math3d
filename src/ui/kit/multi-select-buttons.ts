import { toggleSelection } from '../../reasoning/reasoning-step-answers';
import { announce } from './aria-announcer';
import type { Choice } from './choice-buttons';
import { createUiButton } from './ui-button';
import { tk } from './ui-kit-strings';

export interface MultiSelectButtons {
  element: HTMLElement;
  setDisabled(disabled: boolean): void;
  /** Clears the selection (after a wrong try). */
  reset(): void;
  destroy(): void;
}

/** Toggle buttons (aria-pressed) plus "Xong", enabled once something is chosen. Tap only. */
export function createMultiSelectButtons(
  choices: readonly Choice[],
  onDone: (selectedIds: string[]) => void,
  doc: Document = document,
): MultiSelectButtons {
  if (choices.length < 2 || choices.length > 6) {
    throw new RangeError(`createMultiSelectButtons needs 2-6 choices, got ${choices.length}`);
  }
  let selected: string[] = [];
  let disabled = false;
  const element = doc.createElement('div');
  element.className = 'kit-multi';
  element.setAttribute('role', 'group');
  element.setAttribute('aria-label', tk('pickMany'));
  const done = createUiButton({ label: tk('ok'), onClick: () => onDone([...selected]) }, doc);
  done.classList.add('kit-multi__done');

  const toggles = choices.map((choice) => {
    const button = createUiButton(
      {
        label: choice.label,
        variant: 'secondary',
        onClick: () => {
          selected = toggleSelection(selected, choice.id);
          const on = selected.includes(choice.id);
          announce(tk(on ? 'selected' : 'unselected', { label: choice.label }), doc);
          render();
        },
      },
      doc,
    );
    button.classList.add('kit-multi__option');
    button.dataset.choice = choice.id;
    element.appendChild(button);
    return { id: choice.id, button };
  });
  element.appendChild(done);

  function render(): void {
    for (const { id, button } of toggles) {
      button.setAttribute('aria-pressed', String(selected.includes(id)));
      button.disabled = disabled;
    }
    done.disabled = disabled || selected.length === 0;
  }
  render();

  return {
    element,
    setDisabled: (value) => {
      disabled = value;
      render();
    },
    reset: () => {
      selected = [];
      render();
    },
    destroy: () => element.remove(),
  };
}
