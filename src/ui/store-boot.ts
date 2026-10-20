// Boot step after the shell and world are built: open the game store (IndexedDB, or memory when
// unavailable), import the legacy v1 save once and hydrate the progress view (a few ms after the
// world, which shows defaults until then). <html data-boot> is "store" while this runs and
// "ready" afterwards; the parity runner waits for it before driving the virtual clock. Clicks
// that change progress during this window are held and replayed afterwards.
import { openGameStore } from '../store/game-store';
import type { GameStore } from '../store/game-store-api';
import { DbBlockedError } from '../store/idb-database';
import { importLegacySave, readLegacySaveRaw } from '../store/legacy-save-import';
import { createMemoryGameDb } from '../store/memory-database';
import { defaultStorage } from '../store/settings-store';
import { releaseHeldActions } from './boot-window-action-gate';
import { openDialog } from './dialog';
import { gameState } from './game-state';
import { byId } from './icons';
import { connectStore, flushProgress } from './progress-sync';
import { renderProgress } from './render-progress';
import { ts } from './save-code-strings';
import { showToast } from './toast-and-persist';

/**
 * Another tab upgraded the database or switched the active profile, or the browser dropped the
 * connection: ask for a reload.
 */
function promptReload(): void {
  if (!gameState.world) return;
  openDialog(
    ts('reloadTitle'),
    `<p class="dialog-copy">${ts('reloadCopy')}</p><button id="reload-page" class="primary wide">${ts('reloadButton')}</button>`,
    'notice',
  );
  byId('reload-page').onclick = () => location.reload();
}

const memoryStore = (): Promise<GameStore> => openGameStore({ db: createMemoryGameDb() });

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
    return { store: await memoryStore(), blocked: true };
  }
}

/** Imports the legacy save into `store`, then connects the UI to it. */
async function importAndConnect(store: GameStore): Promise<void> {
  try {
    await importLegacySave(store, readLegacySaveRaw(defaultStorage()));
  } catch (err) {
    // No marker was written: the next boot retries, and the old key is untouched.
    console.error('Legacy save import failed', err);
  }
  connectStore(store, {
    onProfileSwitched: () => {
      renderProgress();
      promptReload();
    },
  });
}

export async function bootStore(): Promise<void> {
  document.documentElement.dataset.boot = 'store';
  try {
    const { store, blocked } = await openStore();
    await importAndConnect(store);
    if (blocked) showToast(ts('blocked'));
    else if (!store.persistent) showToast(ts('notPersistent'));
  } catch (err) {
    // The database opened but could not be read: keep the session playable in memory.
    console.error('Game store unavailable; progress is kept in memory', err);
    try {
      await importAndConnect(await memoryStore());
    } catch (memoryErr) {
      console.error('In-memory game store failed', memoryErr);
    }
    showToast(ts('notPersistent'));
  } finally {
    addEventListener('pagehide', () => void flushProgress());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) void flushProgress();
    });
    renderProgress();
    document.documentElement.dataset.boot = 'ready';
    releaseHeldActions();
  }
}
