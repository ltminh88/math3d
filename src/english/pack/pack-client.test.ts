// Pack client branches (Phase 3B): 200 + valid pack, 200 malformed, 401,
// 503, offline (fetch throws), and the `{ok:false}` envelope.
import { describe, expect, it, vi } from 'vitest';
import { SYNTHETIC_PACK } from '../fixtures/synthetic-pack';
import { fetchEnglishPack } from './pack-client';

type FakeResponse = { status: number; json: () => Promise<unknown> };

const respond = (status: number, body: unknown): FakeResponse => ({
  status,
  json: async () => body,
});

describe('fetchEnglishPack', () => {
  it('returns the pack on 200 with a valid pack body', async () => {
    const fetchFn = vi.fn().mockResolvedValue(respond(200, { ok: true, pack: SYNTHETIC_PACK }));
    const result = await fetchEnglishPack('gia-dinh', {}, fetchFn);
    expect(result).toEqual({ ok: true, pack: SYNTHETIC_PACK });
    const [url, init] = fetchFn.mock.calls[0] as [string, Record<string, unknown>];
    expect(url).toBe('/api/english-pack');
    expect(init.method).toBe('POST');
    expect(init.cache).toBe('no-store');
    expect(init.body as string).toContain('"passphrase":"gia-dinh"');
    expect(url).not.toContain('gia-dinh');
  });

  it('accepts a bare pack body on 200', async () => {
    const fetchFn = vi.fn().mockResolvedValue(respond(200, SYNTHETIC_PACK));
    expect(await fetchEnglishPack('x', {}, fetchFn)).toEqual({ ok: true, pack: SYNTHETIC_PACK });
  });

  it('maps 401 to bad-passphrase', async () => {
    const fetchFn = vi.fn().mockResolvedValue(respond(401, { ok: false, error: 'bad-passphrase' }));
    expect(await fetchEnglishPack('sai', {}, fetchFn)).toEqual({
      ok: false,
      error: 'bad-passphrase',
    });
  });

  it('maps 503 to pack-unavailable', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValue(respond(503, { ok: false, error: 'pack-unavailable' }));
    expect(await fetchEnglishPack('x', {}, fetchFn)).toEqual({
      ok: false,
      error: 'pack-unavailable',
    });
  });

  it('maps a thrown fetch to offline', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('network down'));
    expect(await fetchEnglishPack('x', {}, fetchFn)).toEqual({ ok: false, error: 'offline' });
  });

  it('maps a 200 with an invalid pack to malformed', async () => {
    const fetchFn = vi.fn().mockResolvedValue(respond(200, { ok: true, pack: { version: 2 } }));
    expect(await fetchEnglishPack('x', {}, fetchFn)).toEqual({ ok: false, error: 'malformed' });
  });

  it('maps unparseable JSON to malformed', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => {
        throw new Error('bad json');
      },
    });
    expect(await fetchEnglishPack('x', {}, fetchFn)).toEqual({ ok: false, error: 'malformed' });
  });

  it('sends the stage when asked', async () => {
    const fetchFn = vi.fn().mockResolvedValue(respond(200, { ok: true, pack: SYNTHETIC_PACK }));
    await fetchEnglishPack('x', { stage: 3 }, fetchFn);
    expect(fetchFn.mock.calls[0]?.[1].body as string).toContain('"stage":3');
  });

  it('sends the book when asked', async () => {
    const fetchFn = vi.fn().mockResolvedValue(respond(200, { ok: true, pack: SYNTHETIC_PACK }));
    await fetchEnglishPack('x', { book: 'look' }, fetchFn);
    expect(fetchFn.mock.calls[0]?.[1].body as string).toContain('"book":"look"');
  });
});
