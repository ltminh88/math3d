// The equation behind an unknown item (group 1, R35), recovered from the item itself:
// the bare form parses story.params.text ("? + 1 = 10", "? − 3 = 4 × 5"); the word
// problems name their form in the story key and carry the numbers as params.
import type { PromptRef } from '../reasoning/reasoning-types';

export type UnknownForm =
  | { op: 'add'; a: number; s: number }
  | { op: 'subMinuend'; s: number; a: number }
  | { op: 'subFirst'; a: number; r: number }
  | { op: 'mul'; n: number; p: number }
  | { op: 'divBoxes'; p: number; q: number }
  | { op: 'divShare'; n: number; q: number }
  | { op: 'sub3'; a: number; b: number; c: number }
  | { op: 'mul3'; n: number; a: number; b: number };

const num = (p: PromptRef['params'], key: string): number | undefined => {
  const v = p?.[key];
  return typeof v === 'number' ? v : undefined;
};

/** Captured numbers of `re` on `text`, or null when it does not match. */
function capture(text: string, re: RegExp): number[] | null {
  const m = re.exec(text);
  if (!m) return null;
  const out: number[] = [];
  for (let i = 1; i < m.length; i++) {
    const v = m[i];
    if (v === undefined) return null;
    out.push(Number(v));
  }
  return out;
}

/** Bare equation: the text is the equation itself ("? + 1 = 10", "? − 3 = 4 × 5"). */
function parseBareEquation(text: string): UnknownForm | null {
  const sub3 = capture(text, /^\? − (\d+) = (\d+) × (\d+)$/);
  if (sub3) return { op: 'sub3', a: sub3[0] as number, b: sub3[1] as number, c: sub3[2] as number };
  const mul3 = capture(text, /^\? × (\d+) = (\d+) \+ (\d+)$/);
  if (mul3) return { op: 'mul3', n: mul3[0] as number, a: mul3[1] as number, b: mul3[2] as number };
  const add1 = capture(text, /^\? \+ (\d+) = (\d+)$/);
  if (add1) return { op: 'add', a: add1[0] as number, s: add1[1] as number };
  const add2 = capture(text, /^(\d+) \+ \? = (\d+)$/);
  if (add2) return { op: 'add', a: add2[0] as number, s: add2[1] as number };
  const subMin = capture(text, /^(\d+) − \? = (\d+)$/);
  if (subMin) return { op: 'subMinuend', s: subMin[0] as number, a: subMin[1] as number };
  const subFirst = capture(text, /^\? − (\d+) = (\d+)$/);
  if (subFirst) return { op: 'subFirst', a: subFirst[0] as number, r: subFirst[1] as number };
  const mul1 = capture(text, /^\? × (\d+) = (\d+)$/);
  if (mul1) return { op: 'mul', n: mul1[0] as number, p: mul1[1] as number };
  const mul2 = capture(text, /^(\d+) × \? = (\d+)$/);
  if (mul2) return { op: 'mul', n: mul2[0] as number, p: mul2[1] as number };
  const divBoxes = capture(text, /^(\d+) : \? = (\d+)$/);
  if (divBoxes) return { op: 'divBoxes', p: divBoxes[0] as number, q: divBoxes[1] as number };
  const divShare = capture(text, /^\? : (\d+) = (\d+)$/);
  if (divShare) return { op: 'divShare', n: divShare[0] as number, q: divShare[1] as number };
  return null;
}

/** Word problems: the story key names the form, the numbers are params. */
function parseWordProblem(story: PromptRef): UnknownForm | null {
  const p = story.params;
  const pair = (...keys: string[]): number[] | null => {
    const out: number[] = [];
    for (const key of keys) {
      const v = num(p, key);
      if (v === undefined) return null;
      out.push(v);
    }
    return out;
  };
  switch (story.key) {
    case 'unknownWpAddFirst':
    case 'unknownWpAddSecond': {
      const [a, s] = pair('a', 's') ?? [];
      return a === undefined || s === undefined ? null : { op: 'add', a, s };
    }
    case 'unknownWpSubSecond': {
      const [a, s] = pair('a', 's') ?? [];
      return a === undefined || s === undefined ? null : { op: 'subMinuend', s, a };
    }
    case 'unknownWpSubFirst': {
      const [a, b] = pair('a', 'b') ?? [];
      return a === undefined || b === undefined ? null : { op: 'subFirst', a, r: b };
    }
    case 'unknownWpSubPack': {
      const [a, b, c] = pair('a', 'b', 'c') ?? [];
      return a === undefined || b === undefined || c === undefined ? null : { op: 'sub3', a, b, c };
    }
    case 'unknownWpMulBoxes':
    case 'unknownWpMulEach': {
      const [nn, pp] = pair('n', 'p') ?? [];
      return nn === undefined || pp === undefined ? null : { op: 'mul', n: nn, p: pp };
    }
    case 'unknownWpDivBoxes': {
      const [pp, q] = pair('p', 'q') ?? [];
      return pp === undefined || q === undefined ? null : { op: 'divBoxes', p: pp, q };
    }
    case 'unknownWpDivShare': {
      const [nn, q] = pair('n', 'q') ?? [];
      return nn === undefined || q === undefined ? null : { op: 'divShare', n: nn, q };
    }
    case 'unknownWpMulSum': {
      const [a, b, nn] = pair('a', 'b', 'n') ?? [];
      return a === undefined || b === undefined || nn === undefined
        ? null
        : { op: 'mul3', n: nn, a, b };
    }
    default:
      return null;
  }
}

export function parseUnknown(skillId: string, story: PromptRef): UnknownForm | null {
  if (skillId.endsWith('-wp')) return parseWordProblem(story);
  const text = story.params?.text;
  return typeof text === 'string' ? parseBareEquation(text) : null;
}
