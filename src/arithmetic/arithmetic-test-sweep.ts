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
  // add-sub-number-line is the one arithmetic item with a scene (its number-line
  // picture); every other arithmetic item is scene-free.
  if (item.scene !== undefined) {
    expect(skillId, where).toBe('add-sub-number-line');
    expect(item.scene.kind, where).toBe('number-line');
  }
  expect(item.steps.length, where).toBeGreaterThanOrEqual(1);
  // div-2d-1d-wp T3 is the one three-step form (full boxes → leftover → boxes
  // needed); add-sub-bar-model-wp is the other (bar → operation → number pad);
  // every other arithmetic item has at most two steps.
  expect(item.steps.length, where).toBeLessThanOrEqual(
    (skillId === 'div-2d-1d-wp' && tier === 3) || skillId === 'add-sub-bar-model-wp' ? 3 : 2,
  );
  const cap = rangeCapOfSkill(skillId, tier);
  for (const n of allNumbers(item)) {
    expect(Number.isInteger(n), `${where}: ${n}`).toBe(true);
    expect(n >= 0 && n <= cap, `${where}: ${n} > ${cap}`).toBe(true);
  }
  for (const step of item.steps) checkStep(step, where);
}
