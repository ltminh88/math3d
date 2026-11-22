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
  expect(item.scene, where).toBeUndefined();
  expect(item.steps.length, where).toBeGreaterThanOrEqual(1);
  // div-2d-1d-wp T3 is the one three-step form (full boxes → leftover → boxes
  // needed); every other arithmetic item has at most two steps.
  expect(item.steps.length, where).toBeLessThanOrEqual(
    skillId === 'div-2d-1d-wp' && tier === 3 ? 3 : 2,
  );
  const cap = rangeCapOfSkill(skillId, tier);
  for (const n of allNumbers(item)) {
    expect(Number.isInteger(n), `${where}: ${n}`).toBe(true);
    expect(n >= 0 && n <= cap, `${where}: ${n} > ${cap}`).toBe(true);
  }
  for (const step of item.steps) checkStep(step, where);
}
