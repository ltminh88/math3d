import { isSkillId, SKILL_ID_PATTERN_SOURCE } from './skill-catalog';

/**
 * Fact keys are a cross-system contract: phase 08 copies FACT_KEY_PATTERN_SOURCE verbatim into the SQL check.
 *   mul:{min}x{max}        commutative pair pooled for mastery (2x3 and 3x2 are the same fact)
 *   div:{dividend}/{divisor}
 *   sk:{skill id}          a non-table skill from the append-only catalog (skill-catalog.ts)
 * Numbers are 1-3 digits with no leading zero. The pattern only checks the shape; a valid key
 * also needs a catalog id (`isFactKey`). The mul/div branches never change: extend by alternation.
 */
export const FACT_KEY_PATTERN_SOURCE = `^(mul:[1-9][0-9]{0,2}x[1-9][0-9]{0,2}|div:[1-9][0-9]{0,2}/[1-9][0-9]{0,2}|sk:${SKILL_ID_PATTERN_SOURCE})$`;
export const FACT_KEY_PATTERN = new RegExp(FACT_KEY_PATTERN_SOURCE);

export type FactKey = string;

export type ParsedFact =
  | { op: 'mul'; min: number; max: number }
  | { op: 'div'; dividend: number; divisor: number };

export type ParsedKey = ParsedFact | { op: 'skill'; id: string };

const SKILL_PREFIX = 'sk:';

const MAX_OPERAND = 999;

function validOperand(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= MAX_OPERAND;
}

export function mulKey(a: number, b: number): FactKey {
  if (!validOperand(a) || !validOperand(b))
    throw new Error(`mulKey: operands out of range (${a}, ${b})`);
  return `mul:${Math.min(a, b)}x${Math.max(a, b)}`;
}

export function divKey(dividend: number, divisor: number): FactKey {
  if (!validOperand(dividend) || !validOperand(divisor)) {
    throw new Error(`divKey: operands out of range (${dividend}, ${divisor})`);
  }
  if (dividend % divisor !== 0)
    throw new Error(`divKey: ${dividend} is not divisible by ${divisor}`);
  return `div:${dividend}/${divisor}`;
}

export function skillKey(id: string): FactKey {
  if (!isSkillId(id)) throw new Error(`skillKey: not a catalog skill "${id}"`);
  return `${SKILL_PREFIX}${id}`;
}

export function isSkillKey(key: string): boolean {
  return key.startsWith(SKILL_PREFIX) && FACT_KEY_PATTERN.test(key) && isSkillId(key.slice(3));
}

/**
 * Arithmetic facts only: null for skill keys and anything that is not a canonical key (wrong
 * shape, unsorted mul, inexact division). Table-based callers rely on mul|div here.
 */
export function parseFactKey(key: string): ParsedFact | null {
  if (!FACT_KEY_PATTERN.test(key) || key.startsWith(SKILL_PREFIX)) return null;
  if (key.startsWith('mul:')) {
    const [min, max] = key.slice(4).split('x').map(Number) as [number, number];
    return min <= max ? { op: 'mul', min, max } : null;
  }
  const [dividend, divisor] = key.slice(4).split('/').map(Number) as [number, number];
  return dividend % divisor === 0 ? { op: 'div', dividend, divisor } : null;
}

/** Any valid key: an arithmetic fact or a catalog skill. */
export function parseKey(key: string): ParsedKey | null {
  if (isSkillKey(key)) return { op: 'skill', id: key.slice(SKILL_PREFIX.length) };
  return parseFactKey(key);
}

export function isFactKey(key: string): boolean {
  return parseKey(key) !== null;
}
