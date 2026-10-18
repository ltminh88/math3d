import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

type Corpus = { mapEntries: [string, string][]; entries: [string, string, string][] };

// Generated from the ORIGINAL translator by tools/recovery/golden/generate-golden-traces.mjs.
const corpus: Corpus = JSON.parse(
  readFileSync(new URL('../../tests/parity/golden/i18n-corpus.json', import.meta.url), 'utf8'),
);

function fakeStorage(initial: Record<string, string>) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  };
}

// The language is read once at module evaluation, so each case imports a fresh module.
async function loadTranslator(storage: unknown) {
  vi.resetModules();
  vi.stubGlobal('localStorage', storage);
  return import('./legacy-translator');
}

afterEach(() => vi.unstubAllGlobals());

describe('legacy translator vs original golden corpus', () => {
  it('keeps the original table entries and key order', async () => {
    const { LEGACY_TRANSLATIONS_EN } = await import('./legacy-translations-en');
    expect(Object.entries(LEGACY_TRANSLATIONS_EN)).toEqual(corpus.mapEntries);
  });

  it('matches original Cn and Ln for every corpus string in en', async () => {
    const t = await loadTranslator(fakeStorage({ aigame3d_language: 'en' }));
    expect(t.getLegacyLanguage()).toBe('en');
    expect(corpus.entries.length).toBeGreaterThan(1000);
    const mismatches = corpus.entries.filter(
      ([input, cn, ln]) => t.translateText(input) !== cn || t.translateLongText(input) !== ln,
    );
    expect(mismatches).toEqual([]);
  });

  it('is the identity in vi (default, unknown value, or storage failure)', async () => {
    const throwing = {
      getItem: () => {
        throw new Error('blocked');
      },
    };
    for (const storage of [fakeStorage({}), fakeStorage({ aigame3d_language: 'fr' }), throwing]) {
      const t = await loadTranslator(storage);
      expect(t.getLegacyLanguage()).toBe('vi');
      for (const [input] of corpus.entries) {
        expect(t.translateText(input)).toBe(input);
        expect(t.translateLongText(input)).toBe(input);
      }
    }
  });

  it('persists the language without reloading the current state', async () => {
    const storage = fakeStorage({});
    const t = await loadTranslator(storage);
    t.setLegacyLanguage('en');
    expect(storage.data.get('aigame3d_language')).toBe('en');
    expect(t.getLegacyLanguage()).toBe('en');
    expect(t.translateText('Đóng')).toBe('Close');
  });

  it('translates DOM text nodes (exact match) and aria-label/title only', async () => {
    const t = await loadTranslator(fakeStorage({ aigame3d_language: 'en' }));
    const texts = [{ nodeValue: 'Đóng' }, { nodeValue: ' Đóng ' }, { nodeValue: null }];
    const attrs = new Map([
      ['aria-label', 'Bản đồ'],
      ['title', 'Phóng to'],
    ]);
    const element = {
      getAttribute: (n: string) => attrs.get(n) ?? null,
      setAttribute: (n: string, v: string) => void attrs.set(n, v),
    };
    const root = { querySelectorAll: () => [element] };
    vi.stubGlobal('NodeFilter', { SHOW_TEXT: 4 });
    vi.stubGlobal('document', {
      createTreeWalker: (node: unknown, filter: number) => {
        expect([node, filter]).toEqual([root, 4]);
        let i = 0;
        return { nextNode: () => texts[i++] ?? null };
      },
    });
    t.translateDomTree(root as unknown as ParentNode & Node);
    expect(texts.map((n) => n.nodeValue)).toEqual(['Close', ' Đóng ', '']);
    expect([...attrs.values()]).toEqual(['Map', 'Zoom in']);
  });
});
