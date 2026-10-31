// Test-only: the checks every geometry / measurement item must pass, whatever its skill.
import { expect } from 'vitest';
import type { SkillTier } from '../learning/skill-tiers';
import type { ReasoningStep } from '../reasoning/reasoning-types';
import type { GeoItem } from './geo-scene-types';
import { allNumbers } from './geometry-test-oracles';

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

/** Shape, number cap, unit-step and layout-hint checks shared by all generator sweeps. */
export function sweepItem(item: GeoItem, skillId: string, tier: SkillTier, seed: number): void {
  const where = `${skillId} t${tier} #${seed}`;
  expect(item.skillId).toBe(skillId);
  expect(item.tier).toBe(tier);
  expect(item.steps.length).toBeGreaterThan(0);
  expect(item.scene.minUnitPx).toBeGreaterThanOrEqual(16);
  for (const n of allNumbers(item)) {
    expect(Number.isInteger(n), `${where}: ${n}`).toBe(true);
    expect(n >= 0 && n <= 100, `${where}: ${n}`).toBe(true);
  }
  for (const step of item.steps) checkOptions(step, where);
  // A unit step offers units only, and the right one is the item's unit.
  for (const step of item.steps)
    if (step.kind === 'choice' && step.prompt.key === 'pickUnit')
      expect(step.options.find((o) => o.correct)?.label.key, where).toBe(`u_${item.unit}`);
}
