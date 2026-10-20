// While the store boots (<html data-boot="store">, the IndexedDB open plus the legacy import),
// a progress-changing click (Play, avatar, save-code import, book table) would be overwritten by
// the hydrate that follows. Such clicks are held and replayed, in click order, once the store is
// connected; after that they run at once, so a click after boot behaves exactly as before.
let ready = false;
const held = new Map<string, () => void>();

/** Runs `action` now, or once boot is done. A repeated `key` keeps only the latest click. */
export function whenStoreReady(key: string, action: () => void): void {
  if (ready) {
    action();
    return;
  }
  held.delete(key);
  held.set(key, action);
}

/** Boot finished (store connected, or no store at all): replay held clicks. */
export function releaseHeldActions(): void {
  ready = true;
  const actions = [...held.values()];
  held.clear();
  for (const action of actions) {
    try {
      action();
    } catch (err) {
      console.error('Replaying a click held during boot failed', err);
    }
  }
}
