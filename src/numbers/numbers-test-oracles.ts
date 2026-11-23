// Test-only helpers (imported by *.test.ts): recompute number facts independently from the
// generators — a Vietnamese-words parser, place-value digits, step values and scene numbers.
import type { PracticeItem } from '../practice/practice-scene';
import { evalExpr, numbersOfItem } from '../reasoning/reasoning-test-oracles';
import type { PromptRef, ReasoningItem, ReasoningStep } from '../reasoning/reasoning-types';
import type { NumberScene } from './numbers-scene-types';

const ONES: Record<string, number> = {
  một: 1,
  hai: 2,
  ba: 3,
  bốn: 4,
  năm: 5,
  sáu: 6,
  bảy: 7,
  tám: 8,
  chín: 9,
  mốt: 1,
  tư: 4,
  lăm: 5,
};

/** Tens + ones after "trăm" / "lẻ" / on their own: "lẻ một", "mười lăm", "hai mươi mốt". */
function readTensOnes(text: string): number {
  if (text === '') return 0;
  if (text.startsWith('lẻ ')) return ONES[text.slice(3)] ?? 0;
  if (text.startsWith('mười')) {
    const rest = text.slice('mười'.length).trim();
    return 10 + (rest === '' ? 0 : (ONES[rest] ?? 0));
  }
  const mươiIdx = text.indexOf(' mươi');
  if (mươiIdx !== -1) {
    const t = ONES[text.slice(0, mươiIdx)] ?? 0;
    const rest = text.slice(mươiIdx + ' mươi'.length).trim();
    return t * 10 + (rest === '' ? 0 : (ONES[rest] ?? 0));
  }
  return ONES[text] ?? 0;
}

/** A 1–999 group: "một trăm lẻ năm", "mười lăm", "hai mươi mốt", "năm". */
function readBelowThousand(text: string): number {
  let n = 0;
  let rest = text;
  const hundredIdx = rest.indexOf(' trăm');
  if (hundredIdx !== -1) {
    n += (ONES[rest.slice(0, hundredIdx)] ?? 0) * 100;
    rest = rest.slice(hundredIdx + ' trăm'.length).trim();
  }
  return n + readTensOnes(rest);
}

/** The units group after "nghìn": "không trăm lẻ một" or a plain below-thousand read. */
function readUnitsGroup(text: string): number {
  if (text.startsWith('không trăm')) return readTensOnes(text.slice('không trăm'.length).trim());
  return readBelowThousand(text);
}

/** Parses the canonical words numberToVietnameseWords produces (test-only oracle). */
export function wordsToNumber(words: string): number {
  if (words === 'không') return 0;
  if (words.endsWith(' nghìn')) return readBelowThousand(words.slice(0, -' nghìn'.length)) * 1000;
  const idx = words.indexOf(' nghìn ');
  if (idx === -1) return readBelowThousand(words);
  return (
    readBelowThousand(words.slice(0, idx)) * 1000 +
    readUnitsGroup(words.slice(idx + ' nghìn '.length))
  );
}

const PLACE_DIV: Record<string, number> = {
  ones: 1,
  tens: 10,
  hundreds: 100,
  thousands: 1000,
  tenThousands: 10000,
};

/** The digit of `n` at a place ('i:hundreds' from a prompt param, or 'hundreds'). */
export function digitAtPlace(n: number, place: string): number {
  const div = PLACE_DIV[place.replace(/^i:/, '')];
  if (div === undefined) throw new Error(`unknown place ${place}`);
  return Math.floor(n / div) % 10;
}

/**
 * Rounding, recomputed from the digit just below the place (5 rounds up) — independent
 * of the generator's `roundTo`, which divides and rounds. `place` is 'tens' /
 * 'hundreds' / 'thousands' / 'tenThousands', with an optional 'i:' prefix.
 */
export function roundToOracle(n: number, place: string): number {
  const div = PLACE_DIV[place.replace(/^i:/, '')];
  if (div === undefined || div < 10) throw new Error(`unknown rounding place ${place}`);
  const below = Math.floor(n / (div / 10)) % 10;
  const base = Math.floor(n / div) * div;
  return below >= 5 ? base + div : base;
}

/** Hand table: every Roman numeral I..XX (phase 08 oracle, independent of the converter). */
export const ROMAN_TABLE: Readonly<Record<string, number>> = Object.freeze({
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
  VIII: 8,
  IX: 9,
  X: 10,
  XI: 11,
  XII: 12,
  XIII: 13,
  XIV: 14,
  XV: 15,
  XVI: 16,
  XVII: 17,
  XVIII: 18,
  XIX: 19,
  XX: 20,
});

/** The value of a Roman numeral from the hand table (throws for anything outside I..XX). */
export function romanToNumberOracle(roman: string): number {
  const v = ROMAN_TABLE[roman];
  if (v === undefined) throw new Error(`unknown roman ${roman}`);
  return v;
}

/** The correct option's label of a choice / multi step. */
export function correctLabel(step: ReasoningStep): PromptRef {
  if (step.kind !== 'choice' && step.kind !== 'multi') throw new Error('step has no options');
  const found = step.options.find((o) => o.correct);
  if (!found) throw new Error('no correct option');
  return found.label;
}

/** The numeric value of a number step, or of a choice step (num / words / expr labels). */
export function stepNumber(step: ReasoningStep): number {
  if (step.kind === 'number') return step.answer;
  const label = correctLabel(step);
  if (label.key === 'num') return Number(label.params?.n);
  if (label.key === 'wordsText') return wordsToNumber(String(label.params?.w));
  if (label.key === 'expr') return evalExpr(String(label.params?.text));
  throw new Error(`step has no numeric value: ${label.key}`);
}

/** The numeric values of an item's steps, in order (number / choice steps only). */
export const stepValues = (item: ReasoningItem): number[] => item.steps.map(stepNumber);

/** The sign of a sign-choice step ('>' | '<' | '='). */
export function stepSign(step: ReasoningStep): string {
  const label = correctLabel(step);
  if (label.key === 'signGt') return '>';
  if (label.key === 'signLt') return '<';
  if (label.key === 'signEq') return '=';
  throw new Error(`step has no sign: ${label.key}`);
}

/** Every number carried by an item's scene: place-value blocks, number-line marks. */
export function sceneNumbers(item: PracticeItem): number[] {
  const scene = item.scene as NumberScene | undefined;
  if (!scene) return [];
  if (scene.kind === 'place-value') return scene.columns.map((c) => c.blocks);
  if (scene.kind === 'number-line') return [...scene.marks];
  return [];
}

/** Every number of an item: story, steps, work and scene. */
export const allNumbers = (item: PracticeItem): number[] => [
  ...numbersOfItem(item),
  ...sceneNumbers(item),
];
