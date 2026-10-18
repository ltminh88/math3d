/** Elements that own their keyboard input; the 3D keyboard layer must not react while they have it. */
export const INTERACTIVE_SELECTOR =
  'input, textarea, select, button, a[href], [contenteditable]:not([contenteditable="false"]), [role="button"], [role="textbox"], [role="slider"], [role="spinbutton"]';

/** Minimal Element slice so the guard is testable without a DOM. */
export interface ClosestCapable {
  closest(selector: string): unknown;
}

function hasClosest(value: unknown): value is ClosestCapable {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ClosestCapable).closest === 'function'
  );
}

/** True when `node` is (or sits inside) a form control, button, link or editable element. */
export function isInteractiveNode(node: unknown): boolean {
  return hasClosest(node) && node.closest(INTERACTIVE_SELECTOR) !== null;
}

/**
 * Whether the 3D keyboard layer (or a document-wide shortcut) should skip this keydown:
 * modifier chords, already-handled events, or the event target / focused element is a control.
 */
export function shouldIgnoreSceneKey(
  event: Pick<KeyboardEvent, 'defaultPrevented' | 'altKey' | 'ctrlKey' | 'metaKey' | 'target'>,
  activeElement: unknown,
): boolean {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return true;
  return isInteractiveNode(event.target) || isInteractiveNode(activeElement);
}
