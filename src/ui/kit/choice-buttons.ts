import { announce } from './aria-announcer';
import { createUiButton } from './ui-button';
import { tk } from './ui-kit-strings';

export interface Choice {
  id: string;
  label: string;
}

export interface ChoiceButtons {
  element: HTMLElement;
  setDisabled(disabled: boolean): void;
  destroy(): void;
}

/** 2-4 large answer buttons. More or fewer is a programming error, so it throws. */
export function createChoiceButtons(
  choices: readonly Choice[],
  onChoose: (choice: Choice) => void,
  doc: Document = document,
): ChoiceButtons {
  if (choices.length < 2 || choices.length > 4) {
    throw new RangeError(`createChoiceButtons needs 2-4 choices, got ${choices.length}`);
  }
  const element = doc.createElement('div');
  element.className = 'kit-choices';
  element.setAttribute('role', 'group');
  element.setAttribute('aria-label', tk('choices'));
  const buttons = choices.map((choice) => {
    const button = createUiButton(
      {
        label: choice.label,
        variant: 'secondary',
        onClick: () => {
          announce(choice.label, doc);
          onChoose(choice);
        },
      },
      doc,
    );
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
