/**
 * Fact keys are a cross-system contract: phase 08 copies FACT_KEY_PATTERN_SOURCE verbatim into the SQL check.
 *   mul:{min}x{max}        commutative pair pooled for mastery (2x3 and 3x2 are the same fact)
 *   div:{dividend}/{divisor}
 * Numbers are 1-3 digits with no leading zero.
 */
export const FACT_KEY_PATTERN_SOURCE =
  '^(mul:[1-9][0-9]{0,2}x[1-9][0-9]{0,2}|div:[1-9][0-9]{0,2}/[1-9][0-9]{0,2})$';
export const FACT_KEY_PATTERN = new RegExp(FACT_KEY_PATTERN_SOURCE);

export type FactKey = string;

export type ParsedFact =
  | { op: 'mul'; min: number; max: number }
  | { op: 'div'; dividend: number; divisor: number };

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

/** Returns null for anything that is not a canonical key (wrong shape, unsorted mul, inexact division). */
export function parseFactKey(key: string): ParsedFact | null {
  if (!FACT_KEY_PATTERN.test(key)) return null;
  if (key.startsWith('mul:')) {
    const [min, max] = key.slice(4).split('x').map(Number) as [number, number];
    return min <= max ? { op: 'mul', min, max } : null;
  }
  const [dividend, divisor] = key.slice(4).split('/').map(Number) as [number, number];
  return dividend % divisor === 0 ? { op: 'div', dividend, divisor } : null;
}

export function isFactKey(key: string): boolean {
  return parseFactKey(key) !== null;
}
