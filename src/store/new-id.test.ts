import { afterEach, describe, expect, it, vi } from 'vitest';
import { newId } from './new-id';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('newId', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('builds distinct v4 UUIDs without crypto.randomUUID (plain-http LAN)', () => {
    vi.stubGlobal('crypto', { getRandomValues: crypto.getRandomValues.bind(crypto) });
    const ids = new Set(Array.from({ length: 50 }, () => newId()));
    expect(ids.size).toBe(50);
    for (const id of ids) expect(id).toMatch(UUID_V4);
  });

  it('uses crypto.randomUUID when the context has it', () => {
    expect(newId()).toMatch(UUID_V4);
  });
});
