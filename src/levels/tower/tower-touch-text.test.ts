import { describe, expect, it } from 'vitest';
import { defineStrings } from '../../i18n/i18n';
import { towerStrings } from './tower-strings';
import { answerCardName, choiceGuide } from './tower-touch-text';

// Tablet audit (phase 01 report): a choice floor told touch players "Bấm phím 1, 2 hoặc 3" and
// named the cards "(phím n)". Coarse pointers get no key hints; a keyboard still does.
describe('tower texts on touch screens', () => {
  const ts = towerStrings(defineStrings);

  it('the choice guide names keys only for a fine pointer', () => {
    expect(choiceGuide(ts, true)).not.toMatch(/phím|key/i);
    expect(choiceGuide(ts, false)).toMatch(/phím 1, 2 hoặc 3/);
  });

  it('answer card names drop "(phím n)" on touch', () => {
    expect(answerCardName(ts, '42', 2, true)).toBe('42');
    expect(answerCardName(ts, '42', 2, false)).toBe('42 (phím 2)');
  });
});
