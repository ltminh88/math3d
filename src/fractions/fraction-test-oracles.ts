// Test-only helpers (imported by *.test.ts): recompute fraction facts from a scene's raw data
// (parts, shaded indices, marked objects), independently from the generators.
import { numbersOfItem } from '../reasoning/reasoning-test-oracles';
import type { ReasoningStep } from '../reasoning/reasoning-types';
import type { FractionItem, FractionShapeBody, FractionShapeScene } from './fraction-scene-types';

/** The numeric value of a step: the number answer, or the correct number-choice's value
 * (fraction and word choices carry no single number). */
export function stepValue(step: ReasoningStep | undefined): number {
  if (step?.kind === 'number') return step.answer;
  if (step?.kind === 'choice') {
    const correct = step.options.find((o) => o.correct);
    if (correct?.label.key === 'num') return Number(correct.label.params?.n);
  }
  throw new Error('step has no numeric value');
}

export const lastValue = (item: FractionItem): number => stepValue(item.steps.at(-1));

/** A shape body shows 1/n exactly when its parts are equal, one is shaded, and it has n
 * parts. An unequal-parts body shows no unit fraction at all. */
export function showsUnitBody(body: FractionShapeBody, n: number): boolean {
  return body.equal && body.shaded.length === 1 && body.parts === n;
}

/** Shaded parts / total parts of a fraction-shape scene. */
export function shadedOf(scene: FractionShapeScene): [number, number] {
  return [scene.shaded.length, scene.parts];
}

/** A fraction-shape scene shows 1/n exactly when its parts are equal, one is shaded, and it
 * has n parts. An unequal-parts scene shows no unit fraction at all. */
export function showsUnit(scene: FractionShapeScene, n: number): boolean {
  return showsUnitBody(scene, n);
}

/** Recompute every number of an item (story, steps, work, scene data) for the cap check. */
export function allNumbers(item: FractionItem): number[] {
  const out = [...numbersOfItem(item)];
  const scene = item.scene;
  if (!scene) return out;
  if (scene.kind === 'fraction-shape') {
    out.push(scene.parts, ...scene.shaded, ...(scene.sizes ?? []));
    if (scene.cols !== undefined) out.push(scene.cols);
  } else if (scene.kind === 'fraction-set') {
    out.push(scene.count, ...scene.marked, scene.cols);
  } else {
    for (const f of scene.figures) {
      out.push(f.parts, ...f.shaded, ...(f.sizes ?? []));
      if (f.cols !== undefined) out.push(f.cols);
    }
  }
  return out;
}
