// Pack storage (Phase 3B): the pack's own IndexedDB database — never the game
// store, never the save code. Keeps the passphrase (for refresh) and the pack
// (so it works offline). When IndexedDB is blocked (private mode), the pack
// lives in memory for the session instead. A 401 clears the stored passphrase
// (the caller does that); the pack itself stays for offline play.
import type { EnglishPack } from '../english-types';

export interface StoredEnglishPack {
  readonly passphrase: string;
  readonly pack: EnglishPack;
}

export interface PackStore {
  save(passphrase: string, pack: EnglishPack): Promise<void>;
  load(): Promise<StoredEnglishPack | null>;
  /** 401: forget the passphrase; the pack stays for offline play. */
  clearPassphrase(): Promise<void>;
  clear(): Promise<void>;
}

/** Session-only store (fallback when IndexedDB is blocked; also the test store). */
export function createMemoryPackStore(): PackStore {
  let stored: StoredEnglishPack | null = null;
  return {
    async save(passphrase, pack) {
      stored = { passphrase, pack };
    },
    async load() {
      return stored;
    },
    async clearPassphrase() {
      if (stored) stored = { passphrase: '', pack: stored.pack };
    },
    async clear() {
      stored = null;
    },
  };
}

const DB_NAME = 'english-pack-db';
const STORE_NAME = 'pack';
const KEY = 'current';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('indexedDB open failed'));
  });
}

function idbRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('indexedDB request failed'));
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('indexedDB transaction failed'));
    tx.onabort = () => reject(tx.error ?? new Error('indexedDB transaction aborted'));
  });
}

/** IndexedDB store (browser only; throws when IndexedDB is unavailable). */
export function createIndexedDbPackStore(): PackStore {
  const loadStored = async (): Promise<StoredEnglishPack | null> => {
    const db = await openDb();
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(KEY);
      const value = await idbRequest(request);
      await txDone(tx);
      return (value ?? null) as StoredEnglishPack | null;
    } finally {
      db.close();
    }
  };
  const saveStored = async (value: StoredEnglishPack): Promise<void> => {
    const db = await openDb();
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(value, KEY);
      await txDone(tx);
    } finally {
      db.close();
    }
  };
  const deleteStored = async (): Promise<void> => {
    const db = await openDb();
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(KEY);
      await txDone(tx);
    } finally {
      db.close();
    }
  };
  return {
    save: (passphrase, pack) => saveStored({ passphrase, pack }),
    load: loadStored,
    async clearPassphrase() {
      const stored = await loadStored();
      if (stored) await saveStored({ passphrase: '', pack: stored.pack });
    },
    clear: deleteStored,
  };
}

/**
 * Open the real store, falling back to memory when IndexedDB is blocked or
 * missing (private mode, old browsers, unit tests under node).
 */
export async function openPackStore(): Promise<PackStore> {
  if (typeof indexedDB === 'undefined') return createMemoryPackStore();
  try {
    const store = createIndexedDbPackStore();
    await store.load();
    return store;
  } catch {
    return createMemoryPackStore();
  }
}
