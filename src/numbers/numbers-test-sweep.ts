// Test-only: the checks every numbers item must pass, whatever its skill.
import { expect } from 'vitest';
import type { SkillTier } from '../learning/skill-tiers';
import type { PracticeItem } from '../practice/practice-scene';
import type { ReasoningStep } from '../reasoning/reasoning-types';
import { rangeOfSkill } from './numbers-ranges';
import { allNumbers } from './numbers-test-oracles';

/**
 * Which skills carry a scene from tier 2 up (tier 1 is always scene-free, so every skill
 * stays in the daily dialog at tier 1; the scene skills drop out at tier 2/3 until the
 * phase-16 renderers land — the daily filter settles this per (skill, tier) from one
 * fixed-seed sample, so scene attachment must be deterministic per (skill, tier), never
 * drawn by the item rng).
 */
export const SCENE_SKILLS: Readonly<Record<string, 'place-value' | 'number-line'>> = {
  'num-place-value-1000': 'place-value',
  'num-place-value-10000': 'place-value',
  'num-sequence-1000': 'number-line',
};

function checkOptions(step: ReasoningStep, where: string): void {
  if (step.kind !== 'choice' && step.kind !== 'multi') return;
  const labels = step.options.map((o) => JSON.stringify(o.label));
  expect(new Set(labels).size, `${where} unique labels`).toBe(labels.length);
  expect(new Set(step.options.map((o) => o.id)).size).toBe(step.options.length);
  for (const o of step.options) if (!o.correct) expect(o.misconception, where).toBeDefined();
  const correct = step.options.filter((o) => o.correct).length;
  if (step.kind === 'choice') {
    // Order steps shrink as numbers are picked (4 → 3 → 2 options); every other choice
    // step has 3–4 options. Exactly one correct either way.
    expect(step.options.length, where).toBeGreaterThanOrEqual(2);
    expect(step.options.length, where).toBeLessThanOrEqual(4);
    expect(correct, where).toBe(1);
  } else {
    expect(step.options.length, where).toBe(4);
    expect(correct, where).toBeGreaterThanOrEqual(1);
  }
}

/** Shape, range, scene-rule and option checks shared by all numbers generator sweeps. */
export function sweepNumberItem(
  item: PracticeItem,
  skillId: string,
  tier: SkillTier,
  seed: number,
): void {
  const where = `${skillId} t${tier} #${seed}`;
  expect(item.skillId).toBe(skillId);
  expect(item.tier).toBe(tier);
  expect(item.steps.length).toBeGreaterThan(0);
  const wantScene = tier > 1 ? SCENE_SKILLS[skillId] : undefined;
  if (wantScene) expect(item.scene?.kind, where).toBe(wantScene);
  else expect(item.scene, where).toBeUndefined();
  const range = rangeOfSkill(skillId);
  for (const n of allNumbers(item)) {
    expect(Number.isInteger(n), `${where}: ${n}`).toBe(true);
    expect(n >= 0 && n <= range, `${where}: ${n} > ${range}`).toBe(true);
  }
  for (const step of item.steps) checkOptions(step, where);
}
