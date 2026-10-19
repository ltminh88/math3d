// Test-only helper: reads a golden trace produced from the ORIGINAL bundle (tests/parity/golden).
import { readFileSync } from 'node:fs';

export function loadGoldenTrace<T>(fileName: string): T {
  const url = new URL(`../../tests/parity/golden/${fileName}`, import.meta.url);
  return JSON.parse(readFileSync(url, 'utf8')) as T;
}

/** Same mulberry32 the golden generator seeds the original functions with. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Phase 09 rename (app "math3d", guide "VLM"). Golden traces stay the untouched ORIGINAL capture;
// tests pass expected values through the same rename the source got, so nothing else may drift.
const PRODUCT_RENAMES: ReadonlyArray<readonly [RegExp, string]> = [
  [/Math AI Game 3D/g, 'math3d'],
  [/(?<![A-Za-z])(?:Milo|MILO)(?![A-Za-z])/g, 'VLM'],
];

export function applyProductRename(text: string): string {
  return PRODUCT_RENAMES.reduce((acc, [from, to]) => acc.replace(from, to), text);
}
