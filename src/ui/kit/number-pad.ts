import { isInteractiveNode } from '../../core/input/keyboard-target-guard';
import { announce } from './aria-announcer';
import { tk } from './ui-kit-strings';

export type PadKey = `${number}` | 'erase' | 'ok';

/** Result of applying one key to the entered digits (pure; unit-tested). */
export function applyPadKey(
  digits: string,
  key: PadKey,
  maxDigits: number,
): { digits: string; submit: boolean } {
  if (key === 'ok') return { digits, submit: digits.length > 0 };
  if (key === 'erase') return { digits: digits.slice(0, -1), submit: false };
  if (digits.length >= maxDigits) return { digits, submit: false };
  // No leading zeros: "0" then "5" is 5, not 05.
  const next = digits === '0' ? key : digits + key;
  return { digits: next, submit: false };
}

/** Map a KeyboardEvent.key to a pad key, or null if it is not one we handle. */
export function padKeyFromKeyboard(key: string): PadKey | null {
  if (/^[0-9]$/.test(key)) return key as PadKey;
  if (key === 'Backspace' || key === 'Delete') return 'erase';
  if (key === 'Enter') return 'ok';
  return null;
}

/**
 * Whether the pad should take a physical key. It listens only while focus is inside it, or, when
 * it is the screen's active input, while nothing else (button, input, link) holds focus.
 * A focused pad button handles its own Enter as a click, so Enter is left to it.
 */
export function padShouldHandleKey(state: {
  padHasFocus: boolean;
  activeInput: boolean;
  focusOnOtherControl: boolean;
  targetIsButton: boolean;
  key: string;
}): boolean {
  if (state.padHasFocus) return !(state.targetIsButton && state.key === 'Enter');
  return state.activeInput && !state.focusOnOtherControl;
}

export interface NumberPadOptions {
  maxDigits?: number;
  /** The screen's main answer input: also accept digits while focus rests on the page body. */
  activeInput?: boolean;
  onSubmit: (value: number) => void;
  onChange?: (digits: string) => void;
}

export interface NumberPad {
  element: HTMLElement;
  getDigits(): string;
  clear(): void;
  destroy(): void;
}

const LAYOUT: readonly PadKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'erase', '0', 'ok'];

export function createNumberPad(options: NumberPadOptions, doc: Document = document): NumberPad {
  const maxDigits = options.maxDigits ?? 3;
  let digits = '';
  const element = doc.createElement('div');
  element.className = 'kit-pad';
  element.setAttribute('role', 'group');
  element.setAttribute('aria-label', tk('numberPad'));
  const display = doc.createElement('div');
  display.className = 'kit-pad__display';
  display.setAttribute('aria-live', 'off');
  element.appendChild(display);

  const render = () => {
    display.textContent = digits;
    display.setAttribute(
      'aria-label',
      digits ? tk('answerValue', { value: digits }) : tk('answerEmpty'),
    );
  };

  const press = (key: PadKey) => {
    const result = applyPadKey(digits, key, maxDigits);
    if (result.digits !== digits) {
      digits = result.digits;
      render();
      options.onChange?.(digits);
      announce(digits ? tk('answerValue', { value: digits }) : tk('answerEmpty'), doc);
    }
    if (result.submit) options.onSubmit(Number(digits));
  };

  for (const key of LAYOUT) {
    const button = doc.createElement('button');
    button.type = 'button';
    button.className = 'kit-pad__key';
    if (key === 'ok') button.classList.add('kit-pad__key--ok');
    button.textContent = key === 'erase' ? '⌫' : key === 'ok' ? '✓' : key;
    if (key === 'erase') button.setAttribute('aria-label', tk('erase'));
    if (key === 'ok') button.setAttribute('aria-label', tk('ok'));
    button.addEventListener('click', () => press(key));
    element.appendChild(button);
  }

  const abort = new AbortController();
  doc.addEventListener(
    'keydown',
    (event) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      const key = padKeyFromKeyboard(event.key);
      if (!key) return;
      const target = event.target as Element | null;
      const active = doc.activeElement;
      const padHasFocus = active !== null && element.contains(active);
      const handle = padShouldHandleKey({
        padHasFocus,
        activeInput: options.activeInput === true,
        focusOnOtherControl: isInteractiveNode(active) || isInteractiveNode(target),
        targetIsButton: target?.tagName === 'BUTTON',
        key: event.key,
      });
      if (!handle) return;
      event.preventDefault();
      press(key);
    },
    { signal: abort.signal },
  );
  render();

  return {
    element,
    getDigits: () => digits,
    clear: () => {
      digits = '';
      render();
      options.onChange?.(digits);
    },
    destroy: () => {
      abort.abort();
      element.remove();
    },
  };
}
