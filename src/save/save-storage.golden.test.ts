import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadGoldenTrace } from '../config/load-golden-trace-for-tests';
import { SAVE_KEY } from '../config/world-constants';
import { defaultSave, loadSave, parseSave, writeSave } from './save-storage';

interface SaveFixture {
  name: string;
  input: string | null;
  output: unknown;
}

describe('parseSave golden traces', () => {
  const fixtures = loadGoldenTrace<SaveFixture[]>('save-parse.json');

  it('covers all 40 original fixtures', () => {
    expect(fixtures).toHaveLength(40);
  });

  it.each(fixtures.map((f) => [f.name, f] as const))('%s', (_name, fixture) => {
    const parsed = parseSave(fixture.input);
    expect(parsed).toEqual(fixture.output);
    // Same JSON bytes (key order included) as the original would write back.
    expect(JSON.stringify(parsed)).toBe(JSON.stringify(fixture.output));
  });
});

describe('loadSave / writeSave', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('round-trips through localStorage under the original key', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    });
    const save = { ...defaultSave(), xp: 120, review: ['m7_8'] };
    expect(writeSave(save)).toBe(true);
    expect(store.get(SAVE_KEY)).toBe(JSON.stringify(save));
    expect(loadSave()).toEqual(save);
  });

  it('falls back safely when storage throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('quota');
      },
    });
    expect(loadSave()).toEqual(defaultSave());
    expect(writeSave(defaultSave())).toBe(false);
  });
});
