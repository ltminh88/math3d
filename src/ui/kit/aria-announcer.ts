let region: HTMLElement | null = null;

function ensureRegion(doc: Document): HTMLElement {
  if (region?.isConnected) return region;
  region = doc.createElement('div');
  region.className = 'kit-sr-only';
  region.setAttribute('aria-live', 'polite');
  region.setAttribute('role', 'status');
  doc.body.appendChild(region);
  return region;
}

/** Create the live region up front (at boot): screen readers often drop a region's first message. */
export function initAnnouncer(doc: Document = document): void {
  ensureRegion(doc);
}

/** Politely announce a message to screen readers (answers, feedback, selection changes). */
export function announce(message: string, doc: Document = document): void {
  const target = ensureRegion(doc);
  // Clearing first makes repeated identical messages be announced again.
  target.textContent = '';
  requestAnimationFrame(() => {
    target.textContent = message;
  });
}
