// Test-only: the checks every time item must pass, whatever its skill.
import { expect } from 'vitest';
import type { SkillTier } from '../learning/skill-tiers';
import type { ReasoningStep } from '../reasoning/reasoning-types';
import { firstWeekday } from './calendar-math';
import { TIME_SCENE_FREE_SKILLS } from './time-item-for-skill';
import { MAX_ELAPSED_MIN, YEARS } from './time-ranges';
import type { TimeItem } from './time-scene-types';
import { allNumbers, faceMinutes } from './time-test-oracles';

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
export function sweepItem(item: TimeItem, skillId: string, tier: SkillTier, seed: number): void {
  const where = `${skillId} t${tier} #${seed}`;
  expect(item.skillId).toBe(skillId);
  expect(item.tier).toBe(tier);
  expect(item.steps.length).toBeGreaterThan(0);
  // Scene-free skills carry no scene (they render in the shared dialog today); picture
  // skills always carry one, with a layout hint of at least 16 px per unit.
  if (TIME_SCENE_FREE_SKILLS.includes(skillId)) expect(item.scene, where).toBeUndefined();
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
  if (scene?.kind === 'clock') {
    expect(scene.h, where).toBeGreaterThanOrEqual(1);
    expect(scene.h, where).toBeLessThanOrEqual(12);
    expect(scene.m, where).toBeGreaterThanOrEqual(0);
    expect(scene.m, where).toBeLessThanOrEqual(59);
    if (scene.roman !== undefined) expect(typeof scene.roman, where).toBe('boolean');
    if (scene.endH !== undefined || scene.endM !== undefined) {
      expect(scene.endH, where).toBeDefined();
      expect(scene.endM, where).toBeDefined();
      const start = faceMinutes(scene.h, scene.m);
      const endRaw = faceMinutes(scene.endH ?? 1, scene.endM ?? 0);
      // The end clock may pass 12 (11:55 -> 1:55 is +120, not -600).
      const end = endRaw <= start ? endRaw + 720 : endRaw;
      expect(end, where).toBeGreaterThan(start);
      expect(end - start, where).toBeLessThanOrEqual(MAX_ELAPSED_MIN);
    }
  } else if (scene?.kind === 'month-calendar') {
    expect(YEARS as readonly number[], where).toContain(scene.year);
    expect(scene.month, where).toBeGreaterThanOrEqual(1);
    expect(scene.month, where).toBeLessThanOrEqual(12);
    expect(scene.firstWeekday, where).toBeGreaterThanOrEqual(0);
    expect(scene.firstWeekday, where).toBeLessThanOrEqual(6);
    expect(scene.firstWeekday, where).toBe(firstWeekday(scene.year, scene.month));
  }
}
