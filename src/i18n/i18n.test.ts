import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  defineStrings,
  detectLanguage,
  initLanguage,
  onLanguageChange,
  setLanguage,
  t,
} from './i18n';

const tt = defineStrings('test', {
  vi: { hello: 'Xin chào {name}', count: '{n} viên đá', onlyVi: 'Chỉ có tiếng Việt' },
  en: { hello: 'Hello {name}', count: '{n} stones', onlyVi: '' },
});

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    data,
  };
}

afterEach(() => setLanguage('vi'));

describe('lookup', () => {
  it('returns the vi string by default with interpolation', () => {
    expect(tt('hello', { name: 'Bé' })).toBe('Xin chào Bé');
    expect(t('test.count', { n: 3 })).toBe('3 viên đá');
  });

  it('switches language', () => {
    setLanguage('en');
    expect(tt('hello', { name: 'Kid' })).toBe('Hello Kid');
  });

  it('keeps unknown placeholders intact', () => {
    expect(tt('hello')).toBe('Xin chào {name}');
  });

  it('returns the key for a missing key or namespace', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(t('test.nope')).toBe('test.nope');
    expect(t('ghost.key')).toBe('ghost.key');
    warn.mockRestore();
  });

  it('allows an empty translation (not treated as missing)', () => {
    setLanguage('en');
    expect(tt('onlyVi')).toBe('');
  });
});

describe('language detection', () => {
  it('prefers a valid stored value', () => {
    expect(detectLanguage('en', 'vi-VN')).toBe('en');
  });
  it('ignores an invalid stored value', () => {
    expect(detectLanguage('fr', 'en-US')).toBe('en');
  });
  it('uses navigator language, defaulting to vi', () => {
    expect(detectLanguage(null, 'vi-VN')).toBe('vi');
    expect(detectLanguage(null, 'en-GB')).toBe('en');
    expect(detectLanguage(null, 'ja-JP')).toBe('vi');
    expect(detectLanguage(null, undefined)).toBe('vi');
  });
});

describe('setLanguage / initLanguage', () => {
  it('updates <html lang>, persists, and notifies listeners', () => {
    const doc = { documentElement: { lang: '' } };
    const storage = memoryStorage();
    const seen: string[] = [];
    const off = onLanguageChange((l) => seen.push(l));
    setLanguage('en', doc, storage);
    off();
    setLanguage('vi', doc, storage);
    expect(doc.documentElement.lang).toBe('vi');
    expect(storage.data.get('nsq.language')).toBe('vi');
    expect(seen).toEqual(['en']);
  });

  it('initLanguage reads storage first', () => {
    const doc = { documentElement: { lang: '' } };
    expect(initLanguage(doc, memoryStorage({ 'nsq.language': 'en' }), 'vi-VN')).toBe('en');
    expect(doc.documentElement.lang).toBe('en');
  });

  it('survives a throwing storage', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(initLanguage(undefined, broken, 'en-US')).toBe('en');
    expect(() => setLanguage('vi', undefined, broken)).not.toThrow();
  });
});
