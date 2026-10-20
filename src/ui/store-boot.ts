// Boot step after the shell and world are built: open the game store (IndexedDB, or memory when
// unavailable), import the legacy v1 save once and hydrate the progress view (a few ms after the
// world, which shows defaults until then). <html data-boot> is "store" while this runs and
// "ready" afterwards; the parity runner waits for it before driving the virtual clock.
import { openGameStore } from '../store/game-store';
import type { GameStore } from '../store/game-store-api';
import { DbBlockedError } from '../store/idb-database';
import { importLegacySave, readLegacySaveRaw } from '../store/legacy-save-import';
import { createMemoryGameDb } from '../store/memory-database';
import { defaultStorage } from '../store/settings-store';
import { openDialog } from './dialog';
import { gameState } from './game-state';
import { byId } from './icons';
import { connectStore, flushProgress } from './progress-sync';
import { renderProgress } from './render-progress';
import { ts } from './save-code-strings';
import { showToast } from './toast-and-persist';

/** Another tab upgraded the database, or the browser dropped the connection: ask for a reload. */
function promptReload(): void {
  if (!gameState.world) return;
  openDialog(
    ts('reloadTitle'),
    `<p class="dialog-copy">${ts('reloadCopy')}</p><button id="reload-page" class="primary wide">${ts('reloadButton')}</button>`,
    'notice',
  );
  byId('reload-page').onclick = () => location.reload();
}

async function openStore(): Promise<{ store: GameStore; blocked: boolean }> {
  try {
    const store = await openGameStore({
      onVersionChange: promptReload,
      onTerminated: promptReload,
    });
    return { store, blocked: false };
  } catch (err) {
    if (!(err instanceof DbBlockedError)) throw err;
    // Still playable this session; the toast explains why nothing is saved.
    return { store: await openGameStore({ db: createMemoryGameDb() }), blocked: true };
  }
}

export async function bootStore(): Promise<void> {
  document.documentElement.dataset.boot = 'store';
  try {
    const { store, blocked } = await openStore();
    try {
      await importLegacySave(store, readLegacySaveRaw(defaultStorage()));
    } catch (err) {
      // No marker was written: the next boot retries, and the old key is untouched.
      console.error('Legacy save import failed', err);
    }
    connectStore(store);
    if (blocked) showToast(ts('blocked'));
    else if (!store.persistent) showToast(ts('notPersistent'));
    addEventListener('pagehide', () => void flushProgress());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) void flushProgress();
    });
  } catch (err) {
    console.error('Game store unavailable', err);
  } finally {
    renderProgress();
    document.documentElement.dataset.boot = 'ready';
  }
}
