import { describe, expect, it } from 'vitest';
import {
  divKey,
  FACT_KEY_PATTERN,
  FACT_KEY_PATTERN_SOURCE,
  isFactKey,
  isSkillKey,
  mulKey,
  parseFactKey,
  parseKey,
  skillKey,
} from './fact-key';

describe('fact-key', () => {
  it('round-trips every 2..10 x 1..10 multiplication and its inverse division', () => {
    for (let a = 2; a <= 10; a++) {
      for (let b = 1; b <= 10; b++) {
        const mul = mulKey(a, b);
        expect(mul).toBe(mulKey(b, a));
        expect(FACT_KEY_PATTERN.test(mul)).toBe(true);
        expect(parseFactKey(mul)).toEqual({ op: 'mul', min: Math.min(a, b), max: Math.max(a, b) });
        const div = divKey(a * b, a);
        expect(parseFactKey(div)).toEqual({ op: 'div', dividend: a * b, divisor: a });
      }
    }
  });

  it('supports 3-digit operands', () => {
    expect(divKey(100, 10)).toBe('div:100/10');
    expect(isFactKey('div:100/10')).toBe(true);
  });

  it('rejects malformed, unsorted and inexact keys', () => {
    for (const bad of [
      '',
      'mul:3x2',
      'mul:0x5',
      'mul:1000x2',
      'div:7/2',
      'div:6/0',
      'add:1x2',
      'mul:2x3 ',
      'mul:02x3',
    ]) {
      expect(isFactKey(bad), bad).toBe(false);
    }
  });

  it('constructors throw on invalid input', () => {
    expect(() => divKey(7, 2)).toThrow();
    expect(() => mulKey(0, 3)).toThrow();
    expect(() => mulKey(2.5, 3)).toThrow();
  });

  it('skill keys: sk:<catalog id> only, mul/div branches of the pattern unchanged', () => {
    expect(FACT_KEY_PATTERN_SOURCE).toBe(
      '^(mul:[1-9][0-9]{0,2}x[1-9][0-9]{0,2}|div:[1-9][0-9]{0,2}/[1-9][0-9]{0,2}|sk:[a-z][a-z0-9-]{1,38})$',
    );
    expect(skillKey('expr-brackets')).toBe('sk:expr-brackets');
    expect(isFactKey('sk:expr-brackets')).toBe(true);
    expect(isSkillKey('sk:expr-brackets')).toBe(true);
    expect(isSkillKey('mul:2x3')).toBe(false);
    expect(parseKey('sk:div-rem-ceil')).toEqual({ op: 'skill', id: 'div-rem-ceil' });
    expect(parseKey('mul:2x3')).toEqual({ op: 'mul', min: 2, max: 3 });
    // Arithmetic callers (quiz, tower, generator) keep their mul|div-only contract.
    expect(parseFactKey('sk:expr-brackets')).toBeNull();
    for (const bad of [
      'sk:unknown-skill',
      'sk:',
      'sk:Expr',
      'sk:expr-brackets ',
      'skill:expr-order',
    ])
      expect(isFactKey(bad), bad).toBe(false);
    expect(() => skillKey('not-a-skill')).toThrow();
  });
});
