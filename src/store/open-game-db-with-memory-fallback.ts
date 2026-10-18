import { DbBlockedError, type GameDb, type OpenOptions, openGameDb } from './idb-database';
import { createMemoryGameDb } from './memory-database';

export interface OpenDbOrMemoryOptions extends Omit<OpenOptions, 'name'> {
  /** Use this database as is (tests, or a caller-owned connection). */
  db?: GameDb;
  dbName?: string;
}

/** IndexedDB when it opens; in-memory when it is unavailable. A blocked upgrade still rejects. */
export async function openDbOrMemory(options: OpenDbOrMemoryOptions): Promise<GameDb> {
  if (options.db) return options.db;
  const { db: _db, dbName, ...openOptions } = options;
  try {
    return await openGameDb({ ...openOptions, name: dbName });
  } catch (err) {
    if (err instanceof DbBlockedError) throw err;
    console.warn('IndexedDB unavailable; progress will not be saved', err);
    return createMemoryGameDb(options.migrations);
  }
}
