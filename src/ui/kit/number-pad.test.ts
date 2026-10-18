import { describe, expect, it } from 'vitest';
import { applyPadKey, padKeyFromKeyboard, padShouldHandleKey } from './number-pad';

describe('applyPadKey', () => {
  it('appends digits up to the limit and ignores extras', () => {
    let state = { digits: '', submit: false };
    for (const key of ['1', '2', '3', '4'] as const) state = applyPadKey(state.digits, key, 3);
    expect(state.digits).toBe('123');
  });

  it('avoids leading zeros', () => {
    expect(applyPadKey('0', '5', 3).digits).toBe('5');
    expect(applyPadKey('', '0', 3).digits).toBe('0');
  });

  it('erases and submits only when something is entered', () => {
    expect(applyPadKey('12', 'erase', 3).digits).toBe('1');
    expect(applyPadKey('', 'erase', 3).digits).toBe('');
    expect(applyPadKey('', 'ok', 3).submit).toBe(false);
    expect(applyPadKey('18', 'ok', 3).submit).toBe(true);
  });
});

describe('padKeyFromKeyboard', () => {
  it('maps digits, Backspace and Enter; ignores the rest', () => {
    expect(padKeyFromKeyboard('7')).toBe('7');
    expect(padKeyFromKeyboard('Backspace')).toBe('erase');
    expect(padKeyFromKeyboard('Enter')).toBe('ok');
    expect(padKeyFromKeyboard('a')).toBeNull();
    expect(padKeyFromKeyboard('10')).toBeNull();
  });
});

describe('padShouldHandleKey', () => {
  const base = {
    padHasFocus: false,
    activeInput: false,
    focusOnOtherControl: false,
    targetIsButton: false,
    key: '5',
  };

  it('ignores keys when neither focused nor the active input', () => {
    expect(padShouldHandleKey(base)).toBe(false);
  });

  it('takes keys while focus is inside, but leaves Enter to a focused pad button', () => {
    expect(padShouldHandleKey({ ...base, padHasFocus: true, targetIsButton: true })).toBe(true);
    expect(
      padShouldHandleKey({ ...base, padHasFocus: true, targetIsButton: true, key: 'Enter' }),
    ).toBe(false);
  });

  it('as active input, yields to any other focused control', () => {
    expect(padShouldHandleKey({ ...base, activeInput: true })).toBe(true);
    expect(padShouldHandleKey({ ...base, activeInput: true, focusOnOtherControl: true })).toBe(
      false,
    );
  });
});
