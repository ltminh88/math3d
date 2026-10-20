import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSettingsStore, SETTINGS_STORAGE_KEY } from '../store/settings-store';
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

describe('setLanguage / initLanguage (one settings source)', () => {
  it('updates <html lang>, persists in the settings store, and notifies listeners', () => {
    const doc = { documentElement: { lang: '' } };
    const storage = memoryStorage();
    const settings = createSettingsStore(storage);
    const seen: string[] = [];
    const off = onLanguageChange((l) => seen.push(l));
    setLanguage('en', doc, settings);
    off();
    expect(JSON.parse(storage.data.get(SETTINGS_STORAGE_KEY) ?? '{}').lang).toBe('en');
    setLanguage('vi', doc, settings);
    expect(doc.documentElement.lang).toBe('vi');
    expect(settings.get().lang).toBe('vi');
    expect(seen).toEqual(['en']);
  });

  it('initLanguage applies the stored setting without writing', () => {
    const doc = { documentElement: { lang: '' } };
    const storage = memoryStorage({ [SETTINGS_STORAGE_KEY]: JSON.stringify({ lang: 'en' }) });
    expect(initLanguage(doc, createSettingsStore(storage))).toBe('en');
    expect(doc.documentElement.lang).toBe('en');
    expect(tt('hello', { name: 'Kid' })).toBe('Hello Kid');
    expect(storage.data.size).toBe(1);
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
    const settings = createSettingsStore(broken);
    expect(initLanguage(undefined, settings)).toBe('vi');
    expect(() => setLanguage('en', undefined, settings)).not.toThrow();
    expect(settings.get().lang).toBe('en');
  });
});
