import { afterEach, describe, expect, it, vi } from 'vitest';

// QA m-9: "Rừng Nhân Chia" is the division level, so English must not call it a multiplication
// forest — in the legacy table output, in defineStrings namespaces, and in the DOM shell.
const enStorage = () => {
  const data = new Map([['math3d.settings', JSON.stringify({ lang: 'en' })]]);
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  };
};

async function loadEn() {
  vi.resetModules();
  vi.stubGlobal('localStorage', enStorage());
  return {
    legacy: await import('./legacy-translator'),
    i18n: await import('./i18n'),
    padded: await import('./translate-padded-text-nodes'),
  };
}

afterEach(() => vi.unstubAllGlobals());

describe('English term overrides', () => {
  it('names the forest "Sharing Forest" everywhere in English', async () => {
    const { legacy, i18n } = await loadEn();
    expect(legacy.translateText('Rừng Nhân Chia')).toBe('Sharing Forest');
    expect(legacy.translateLongText('<b>Rừng Nhân Chia</b>')).toBe('<b>Sharing Forest</b>');
    const ts = i18n.defineStrings('override-probe', {
      vi: { gate: 'Cổng Rừng Nhân Chia' },
      en: { gate: 'Finish the Multiplication Forest to open' },
    });
    expect(ts('gate')).toBe('Finish the Sharing Forest to open');
  });

  it('translates padded shell text nodes and keeps their whitespace', async () => {
    const { padded } = await loadEn();
    const nodes = [
      { nodeValue: ' MỘT CUỘC PHIÊU LƯU NHỎ' },
      { nodeValue: ' Khám phá bảng cửu chương' },
      { nodeValue: '  ' },
      { nodeValue: ' không có trong bảng ' },
    ];
    vi.stubGlobal('NodeFilter', { SHOW_TEXT: 4 });
    vi.stubGlobal('document', {
      createTreeWalker: () => {
        let i = 0;
        return { nextNode: () => nodes[i++] ?? null };
      },
    });
    padded.translatePaddedTextNodes({} as ParentNode & Node);
    expect(nodes.map((n) => n.nodeValue)).toEqual([
      ' A SMALL ADVENTURE',
      ' Explore multiplication tables',
      '  ',
      ' không có trong bảng ',
    ]);
  });
});
