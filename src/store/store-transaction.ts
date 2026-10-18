import type { GameDb } from './idb-database';
import { ALL_STORES, type WriteTx } from './progress-repository';

/** Runs `work` in one readwrite transaction over every store; any throw aborts it and rethrows. */
export async function inTransaction<T>(db: GameDb, work: (tx: WriteTx) => Promise<T>): Promise<T> {
  const tx = db.transaction(ALL_STORES, 'readwrite');
  try {
    const result = await work(tx);
    await tx.done;
    return result;
  } catch (err) {
    try {
      tx.abort();
    } catch {
      // Already finished or aborted by a failed request; the original error is what matters.
    }
    await tx.done.catch(() => undefined);
    throw err;
  }
}
