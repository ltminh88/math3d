import { announce } from './aria-announcer';
import { createUiButton } from './ui-button';
import { tk } from './ui-kit-strings';

export interface VerdictButtons {
  element: HTMLElement;
  setDisabled(disabled: boolean): void;
  destroy(): void;
}

/** Two large tap targets, "Đúng" and "Sai" (no key needed; a focused button also takes Enter/Space). */
export function createVerdictButtons(
  onVerdict: (isTrue: boolean) => void,
  doc: Document = document,
): VerdictButtons {
  const element = doc.createElement('div');
  element.className = 'kit-verdict';
  element.setAttribute('role', 'group');
  element.setAttribute('aria-label', tk('verdict'));
  const buttons = ([true, false] as const).map((value) => {
    const label = tk(value ? 'yes' : 'no');
    const button = createUiButton(
      {
        label,
        variant: value ? 'primary' : 'accent',
        onClick: () => {
          announce(label, doc);
          onVerdict(value);
        },
      },
      doc,
    );
    button.dataset.verdict = String(value);
    element.appendChild(button);
    return button;
  });
  return {
    element,
    setDisabled: (disabled) => {
      for (const button of buttons) button.disabled = disabled;
    },
    destroy: () => element.remove(),
  };
}
