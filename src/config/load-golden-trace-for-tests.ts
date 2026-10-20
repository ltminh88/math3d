// Test-only helper: reads a golden trace produced from the ORIGINAL bundle (tests/parity/golden).
import { readFileSync } from 'node:fs';

export function loadGoldenTrace<T>(fileName: string): T {
  const url = new URL(`../../tests/parity/golden/${fileName}`, import.meta.url);
  return JSON.parse(readFileSync(url, 'utf8')) as T;
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
