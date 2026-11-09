// A tab left open across a deploy still runs the old build: its lazy level chunks (hashed names)
// are gone from the server, so `import()` fails with a 404. The fix is a page reload, which loads
// the new build (progress is already saved). The guard stops a reload loop when the chunk is
// really missing on the new build too.

const RELOAD_KEY = 'math3d:stale-build-reload-at';
/** A second chunk failure within this window after a reload is a real error, not a stale tab. */
const RELOAD_GUARD_MS = 60_000;

/** Chrome/Edge, Safari and Firefox wordings of a failed dynamic `import()`. */
const CHUNK_ERROR =
  /dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i;

export function isStaleChunkError(error: unknown): boolean {
  return error instanceof Error && CHUNK_ERROR.test(error.message);
}

/** Reloads the page once per guard window; false when a reload just happened (or no storage). */
export function reloadForNewBuild(
  storage: Pick<Storage, 'getItem' | 'setItem'> = sessionStorage,
  reload: () => void = () => location.reload(),
  now: number = Date.now(),
): boolean {
  try {
    const last = Number(storage.getItem(RELOAD_KEY) ?? 0);
    if (now - last < RELOAD_GUARD_MS) return false;
    storage.setItem(RELOAD_KEY, String(now));
  } catch {
    return false;
  }
  reload();
  return true;
}
