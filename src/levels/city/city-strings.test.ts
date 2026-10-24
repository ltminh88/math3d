import { afterEach, describe, expect, it } from 'vitest';
import { defineStrings, setLanguage } from '../../i18n/i18n';
import { cityStrings } from './city-strings';

const ts = cityStrings(defineStrings);
// 8 floors of 7 windows: the round asks for 56, so no running text may show it.
const ALL_LIT = { floors: 8, total: 8, n: 8, windows: 56 };

afterEach(() => setLanguage('vi'));

describe('city windows round texts', () => {
  for (const lang of ['vi', 'en'] as const) {
    it(`count only lit floors, never the window total (${lang})`, () => {
      setLanguage(lang);
      for (const key of ['litCount', 'floorLit'] as const) {
        const text = ts(key, ALL_LIT);
        expect(text).not.toContain('56');
        expect(text).not.toMatch(/\{\w+\}/);
      }
      expect(ts('litCount', { floors: 3, total: 9 })).toContain('3/9');
    });
  }

  it('reads "3/9 tầng sáng" in Vietnamese', () => {
    expect(ts('litCount', { floors: 3, total: 9 })).toBe('3/9 tầng sáng');
  });
});
