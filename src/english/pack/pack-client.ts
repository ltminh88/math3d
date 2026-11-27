// Pack client (Phase 3B): `POST /api/english-pack` per the Phase 0 contract.
// Sends nothing before the caller has a passphrase (the unlock dialog owns
// that). Every response passes `isEnglishPack()` before use; the passphrase
// travels only in the POST body, never in a URL or a log. Fake-fetch testable.
import {
  ENGLISH_PACK_ENDPOINT,
  type EnglishPackPart,
  isEnglishPack,
} from '../english-pack-contract';
import type { EnglishBookId } from '../english-types';
import type { EnglishPack } from '../english-types';

export type EnglishPackFetchError = 'bad-passphrase' | 'pack-unavailable' | 'offline' | 'malformed';

export type EnglishPackFetchResult =
  | { readonly ok: true; readonly pack: EnglishPack }
  | { readonly ok: false; readonly error: EnglishPackFetchError };

export interface FetchEnglishPackOptions {
  readonly part?: EnglishPackPart;
  readonly stage?: number;
  /** The book the pack is asked for (absent = `cec`). */
  readonly book?: EnglishBookId;
}

type FetchFn = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string; cache: string },
) => Promise<{ status: number; json: () => Promise<unknown> }>;

/** Fetch one pack part; `fetchFn` defaults to the browser `fetch`. */
export async function fetchEnglishPack(
  passphrase: string,
  options: FetchEnglishPackOptions = {},
  fetchFn: FetchFn = fetch as unknown as FetchFn,
): Promise<EnglishPackFetchResult> {
  let response: { status: number; json: () => Promise<unknown> };
  try {
    response = await fetchFn(ENGLISH_PACK_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        passphrase,
        part: options.part ?? 'items',
        ...(options.stage !== undefined ? { stage: options.stage } : {}),
        ...(options.book !== undefined ? { book: options.book } : {}),
      }),
      cache: 'no-store',
    });
  } catch {
    return { ok: false, error: 'offline' };
  }
  if (response.status === 401) return { ok: false, error: 'bad-passphrase' };
  if (response.status === 503) return { ok: false, error: 'pack-unavailable' };
  if (response.status !== 200) return { ok: false, error: 'pack-unavailable' };
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return { ok: false, error: 'malformed' };
  }
  if (typeof body === 'object' && body !== null && 'ok' in body) {
    const typed = body as { ok?: unknown; pack?: unknown; error?: unknown };
    if (typed.ok === false) {
      return {
        ok: false,
        error: typed.error === 'bad-passphrase' ? 'bad-passphrase' : 'pack-unavailable',
      };
    }
    if (typed.ok === true && isEnglishPack(typed.pack)) return { ok: true, pack: typed.pack };
    return { ok: false, error: 'malformed' };
  }
  if (isEnglishPack(body)) return { ok: true, pack: body };
  return { ok: false, error: 'malformed' };
}
