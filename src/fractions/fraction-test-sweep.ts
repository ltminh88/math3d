// Test-only: the checks every fraction item must pass, whatever its skill.
import { expect } from 'vitest';
import type { SkillTier } from '../learning/skill-tiers';
import type { ReasoningStep } from '../reasoning/reasoning-types';
import { FRACTION_SCENE_FREE_SKILLS } from './fraction-item-for-skill';
import type { FractionItem } from './fraction-scene-types';
import { allNumbers } from './fraction-test-oracles';

function checkOptions(step: ReasoningStep, where: string): void {
  if (step.kind !== 'choice' && step.kind !== 'multi') return;
  const labels = step.options.map((o) => JSON.stringify(o.label));
  expect(new Set(labels).size, `${where} unique labels`).toBe(labels.length);
  expect(new Set(step.options.map((o) => o.id)).size).toBe(step.options.length);
  for (const o of step.options) if (!o.correct) expect(o.misconception, where).toBeDefined();
  const correct = step.options.filter((o) => o.correct).length;
  if (step.kind === 'choice') {
    expect(step.options.length, where).toBeGreaterThanOrEqual(3);
    expect(step.options.length, where).toBeLessThanOrEqual(4);
    expect(correct, where).toBe(1);
  } else {
    expect(step.options.length, where).toBe(4);
    expect(correct, where).toBeGreaterThanOrEqual(1);
  }
}

/** Shape, number cap and scene checks shared by all generator sweeps. */
export function sweepItem(
  item: FractionItem,
  skillId: string,
  tier: SkillTier,
  seed: number,
): void {
  const where = `${skillId} t${tier} #${seed}`;
  expect(item.skillId).toBe(skillId);
  expect(item.tier).toBe(tier);
  expect(item.steps.length).toBeGreaterThan(0);
  // Scene-free skills carry no scene (they render in the shared dialog today); picture
  // skills always carry one, with a layout hint of at least 16 px per part.
  if (FRACTION_SCENE_FREE_SKILLS.includes(skillId)) expect(item.scene, where).toBeUndefined();
  else {
    expect(item.scene, where).toBeDefined();
    expect(item.scene?.minUnitPx, where).toBeGreaterThanOrEqual(16);
  }
  for (const n of allNumbers(item)) {
    expect(Number.isInteger(n), `${where}: ${n}`).toBe(true);
    expect(n >= 0 && n <= 100, `${where}: ${n}`).toBe(true);
  }
  for (const step of item.steps) checkOptions(step, where);
  const scene = item.scene;
  if (scene?.kind === 'fraction-shape') {
    expect(scene.parts, where).toBeGreaterThanOrEqual(2);
    expect(scene.parts, where).toBeLessThanOrEqual(9);
    expect(scene.shaded.length, where).toBe(1);
    for (const i of scene.shaded) expect(i, where).toBeLessThan(scene.parts);
    if (scene.sizes) expect(scene.sizes.length, where).toBe(scene.parts);
    if (scene.cols !== undefined) expect(scene.parts % scene.cols, where).toBe(0);
  } else if (scene?.kind === 'fraction-set') {
    expect(scene.count, where).toBeGreaterThanOrEqual(2);
    expect(scene.count, where).toBeLessThanOrEqual(45);
    expect(scene.marked.length, where).toBeGreaterThan(0);
    for (const i of scene.marked) expect(i, where).toBeLessThan(scene.count);
  } else if (scene?.kind === 'fraction-pick') {
    expect(scene.figures.length, where).toBeGreaterThanOrEqual(3);
    expect(scene.figures.length, where).toBeLessThanOrEqual(4);
    expect(new Set(scene.figures.map((f) => f.label)).size, where).toBe(scene.figures.length);
    for (const f of scene.figures) {
      expect(f.parts, where).toBeGreaterThanOrEqual(2);
      expect(f.parts, where).toBeLessThanOrEqual(9);
      for (const i of f.shaded) expect(i, where).toBeLessThan(f.parts);
      if (f.sizes) expect(f.sizes.length, where).toBe(f.parts);
      if (f.cols !== undefined) expect(f.parts % f.cols, where).toBe(0);
    }
  }
}
