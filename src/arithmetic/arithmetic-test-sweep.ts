// Test-only: the checks every arithmetic item must pass, whatever its skill.
// Arithmetic is scene-free (phase 09: no scene needed, works in dialog immediately).
import { expect } from 'vitest';
import type { SkillTier } from '../learning/skill-tiers';
import type { PracticeItem } from '../practice/practice-scene';
import type { ReasoningStep } from '../reasoning/reasoning-types';
import { rangeCapOfSkill } from './arithmetic-ranges';
import { allNumbers } from './arithmetic-test-oracles';

function checkStep(step: ReasoningStep, where: string): void {
  if (step.kind === 'number') {
    expect(Number.isInteger(step.answer), `${where} integer answer`).toBe(true);
    expect(step.answer, `${where} non-negative answer`).toBeGreaterThanOrEqual(0);
    return;
  }
  if (step.kind === 'choice') {
    // A choice step offers ≥ 2 distinct options with exactly one correct.
    expect(step.options.length, `${where} options`).toBeGreaterThanOrEqual(2);
    expect(step.options.filter((o) => o.correct).length, `${where} one correct`).toBe(1);
    const labels = step.options.map((o) => JSON.stringify(o.label));
    expect(new Set(labels).size, `${where} distinct options`).toBe(labels.length);
    return;
  }
  if (step.kind === 'verdict') {
    // A verdict step shows a full worked equation in its statement; when false it
    // must carry the fix (the right value), never a bare "Sai".
    expect(step.statement.key, `${where} stmtEq statement`).toBe('stmtEq');
    if (!step.answer) {
      expect(step.fix, `${where} fix present`).toBeDefined();
      expect(Number.isInteger(step.fix?.answer), `${where} integer fix`).toBe(true);
    }
    return;
  }
  if (step.kind === 'match') {
    // A match step pairs each left with exactly one right: equal lengths
    // (2–4 pairs), pairs a permutation, distinct right labels.
    expect(step.left.length, `${where} lefts`).toBeGreaterThanOrEqual(2);
    expect(step.left.length, `${where} lefts`).toBeLessThanOrEqual(4);
    expect(step.right.length, `${where} equal sides`).toBe(step.left.length);
    expect(step.pairs.length, `${where} pairs`).toBe(step.left.length);
    expect(
      [...step.pairs].sort((a, b) => a - b),
      `${where} pairs permutation`,
    ).toEqual(step.left.map((_, i) => i));
    const labels = step.right.map((o) => JSON.stringify(o.label));
    expect(new Set(labels).size, `${where} distinct right labels`).toBe(labels.length);
    return;
  }
  throw new Error(`${where}: arithmetic has no ${step.kind} steps`);
}

/** Shape, range and step checks shared by all arithmetic generator sweeps. */
export function sweepArithmeticItem(
  item: PracticeItem,
  skillId: string,
  tier: SkillTier,
  seed: number,
): void {
  const where = `${skillId} t${tier} #${seed}`;
  expect(item.skillId).toBe(skillId);
  expect(item.tier).toBe(tier);
  // Three arithmetic items carry a scene: add-sub-number-line (its number-line
  // picture), add-sub-column and add-sub-find-error T2+ (their column-calc
  // picture, boost 2A); every other arithmetic item is scene-free.
  if (item.scene !== undefined) {
    expect(['add-sub-number-line', 'add-sub-column', 'add-sub-find-error']).toContain(skillId);
    expect(item.scene.kind, where).toBe(
      skillId === 'add-sub-number-line' ? 'number-line' : 'column-calc',
    );
  }
  expect(item.steps.length, where).toBeGreaterThanOrEqual(1);
  // div-2d-1d-wp T3 is the one three-step form (full boxes → leftover → boxes
  // needed); add-sub-bar-model-wp is the other (bar → operation → number pad);
  // add-sub-column plays up to five steps (three digits + two carry choices, boost
  // 2A); every other arithmetic item has at most two steps.
  expect(item.steps.length, where).toBeLessThanOrEqual(
    skillId === 'add-sub-column'
      ? 5
      : (skillId === 'div-2d-1d-wp' && tier === 3) || skillId === 'add-sub-bar-model-wp'
        ? 3
        : 2,
  );
  const cap = rangeCapOfSkill(skillId, tier);
  for (const n of allNumbers(item)) {
    expect(Number.isInteger(n), `${where}: ${n}`).toBe(true);
    expect(n >= 0 && n <= cap, `${where}: ${n} > ${cap}`).toBe(true);
  }
  for (const step of item.steps) checkStep(step, where);
}
