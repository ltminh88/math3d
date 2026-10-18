export interface UiButtonOptions {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'accent' | 'secondary';
  ariaLabel?: string;
}

/** A real <button> with the kit's 56px minimum target. */
export function createUiButton(
  options: UiButtonOptions,
  doc: Document = document,
): HTMLButtonElement {
  const button = doc.createElement('button');
  button.type = 'button';
  button.className = 'kit-button';
  if (options.variant && options.variant !== 'primary') {
    button.classList.add(`kit-button--${options.variant}`);
  }
  button.textContent = options.label;
  if (options.ariaLabel) button.setAttribute('aria-label', options.ariaLabel);
  button.addEventListener('click', options.onClick);
  return button;
}
