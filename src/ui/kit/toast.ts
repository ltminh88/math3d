import { announce } from './aria-announcer';

/** Short non-blocking message; also announced to screen readers. Returns a dismiss function. */
export function showToast(layer: HTMLElement, message: string, durationMs = 2500): () => void {
  const toast = layer.ownerDocument.createElement('div');
  toast.className = 'kit-toast';
  toast.textContent = message;
  layer.appendChild(toast);
  announce(message, layer.ownerDocument);
  const timer = setTimeout(() => toast.remove(), durationMs);
  return () => {
    clearTimeout(timer);
    toast.remove();
  };
}
