import type { GameDb } from './idb-database';
import { MIGRATIONS, type Migration } from './save-migrations';

/**
 * In-memory stand-in for the save database, used when IndexedDB is unavailable (blocked private
 * mode, old Safari). It implements only the slice of the idb API the store modules use —
 * `transaction().objectStore()` get/put/add + `index()` get/getAll, `tx.done`, `tx.abort()`,
 * `db.put`, `db.getAll`, `db.close` — so applyDelta/loadSnapshot stay the single implementation.
 *
 * Transaction model: each transaction works on a copy and commits it when `tx.done` is first read
 * (every store write path awaits it); `abort()` or a failed request discards the copy. Write
 * transactions must not overlap — GameStore serializes them.
 */

type KeyPath = string | string[];
interface StoreSchema {
  keyPath: KeyPath;
  autoIncrement: boolean;
  indexes: Map<string, { keyPath: KeyPath; unique: boolean }>;
}
type Row = Record<string, unknown>;
type State = Map<string, Map<string, Row>>;

const memoryDbs = new WeakSet<object>();
export const isMemoryGameDb = (db: unknown): boolean =>
  typeof db === 'object' && db !== null && memoryDbs.has(db);

/** Replays the schema-creating calls of the migrations (a fresh DB has no data to transform). */
function schemaFrom(migrations: readonly Migration[]): Map<string, StoreSchema> {
  const schema = new Map<string, StoreSchema>();
  const recorder = {
    createObjectStore(name: string, opts: { keyPath: KeyPath; autoIncrement?: boolean }) {
      const store: StoreSchema = {
        keyPath: opts.keyPath,
        autoIncrement: !!opts.autoIncrement,
        indexes: new Map(),
      };
      schema.set(name, store);
      return {
        createIndex(index: string, keyPath: KeyPath, o?: { unique?: boolean }) {
          store.indexes.set(index, { keyPath, unique: !!o?.unique });
        },
      };
    },
  };
  for (const m of [...migrations].sort((a, b) => a.version - b.version))
    void m.up(recorder as never, undefined as never);
  return schema;
}

const pick = (row: Row, path: KeyPath): unknown =>
  Array.isArray(path) ? path.map((p) => row[p]) : row[path];
const encode = (key: unknown): string => JSON.stringify(key);
const byKey = ([a]: [string, Row], [b]: [string, Row]): number => {
  const na = Number(a);
  const nb = Number(b);
  if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
  return a < b ? -1 : a > b ? 1 : 0;
};
const domError = (message: string, name: string): Error => new DOMException(message, name);

export function createMemoryGameDb(migrations: readonly Migration[] = MIGRATIONS): GameDb {
  const schema = schemaFrom(migrations);
  let state: State = new Map([...schema.keys()].map((name) => [name, new Map()]));
  const seq = new Map<string, number>();
  let closed = false;

  function transaction(_names: unknown, mode: IDBTransactionMode = 'readonly') {
    if (closed) throw domError('The database connection is closed', 'InvalidStateError');
    const working: State = structuredClone(state);
    let status: 'active' | 'committed' | 'aborted' = 'active';
    let done: Promise<void> | undefined;

    const fail = (err: Error): never => {
      status = 'aborted';
      throw err;
    };
    const objectStore = (name: string) => {
      const def = schema.get(name);
      const rows = working.get(name);
      if (!def || !rows) throw domError(`No object store "${name}"`, 'NotFoundError');
      const matching = (index: string, key: unknown): Row[] => {
        const idx = def.indexes.get(index);
        if (!idx) throw domError(`No index "${index}"`, 'NotFoundError');
        const k = encode(key);
        return [...rows.entries()]
          .sort(byKey)
          .filter(([, r]) => encode(pick(r, idx.keyPath)) === k)
          .map(([, r]) => structuredClone(r));
      };
      const write = async (value: Row, mustBeNew: boolean): Promise<unknown> => {
        if (status !== 'active' || mode !== 'readwrite')
          fail(domError('Transaction is not writable', 'ReadOnlyError'));
        const row = structuredClone(value);
        if (def.autoIncrement && row[def.keyPath as string] === undefined) {
          const next = (seq.get(name) ?? 0) + 1;
          seq.set(name, next);
          row[def.keyPath as string] = next;
        }
        const key = encode(pick(row, def.keyPath));
        if (mustBeNew && rows.has(key)) fail(domError('Key already exists', 'ConstraintError'));
        for (const idx of def.indexes.values()) {
          if (!idx.unique) continue;
          const v = encode(pick(row, idx.keyPath));
          for (const [k, r] of rows)
            if (k !== key && encode(pick(r, idx.keyPath)) === v)
              fail(domError('Unique index violated', 'ConstraintError'));
        }
        rows.set(key, row);
        return pick(row, def.keyPath);
      };
      return {
        get: async (key: unknown) => structuredClone(rows.get(encode(key))),
        getAll: async () => [...rows.entries()].sort(byKey).map(([, r]) => structuredClone(r)),
        put: (value: Row) => write(value, false),
        add: (value: Row) => write(value, true),
        index: (index: string) => ({
          get: async (key: unknown) => matching(index, key)[0],
          getAll: async (key: unknown) => matching(index, key),
        }),
      };
    };
    return {
      objectStore,
      abort() {
        if (status !== 'active') throw domError('Transaction finished', 'InvalidStateError');
        status = 'aborted';
      },
      get done(): Promise<void> {
        if (!done) {
          if (status === 'active' && mode === 'readwrite') state = working;
          done =
            status === 'aborted'
              ? Promise.reject(domError('Transaction aborted', 'AbortError'))
              : Promise.resolve();
          if (status === 'active') status = 'committed';
        }
        return done;
      },
    };
  }

  const db = {
    transaction,
    async put(name: string, value: Row) {
      const tx = transaction([name], 'readwrite');
      const key = await tx.objectStore(name).put(value);
      await tx.done;
      return key;
    },
    getAll: (name: string) => transaction([name]).objectStore(name).getAll(),
    close() {
      closed = true;
    },
  };
  memoryDbs.add(db);
  return db as unknown as GameDb;
}
