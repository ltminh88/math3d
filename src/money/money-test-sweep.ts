// Shared sweep checks for money items: shape, scenes, caps, options, and (for pick-notes)
// the greedy-free brute-force uniqueness of the minimal set.
import { expect } from 'vitest';
import type { SkillTier } from '../learning/skill-tiers';
import type { ReasoningStep } from '../reasoning/reasoning-types';
import { LETTERS } from './money-distractors';
import { isMoneySceneFreeSkill } from './money-item-for-skill';
import { DENOMINATIONS } from './money-ranges';
import type { MoneyItem } from './money-scene-types';
import {
  allNumbers,
  bruteForceMinNotes,
  correctLetters,
  notesOf,
  targetOfPick,
} from './money-test-oracles';

/** Largest number a child sees in a money item (a 500 000 note in recognize T3). */
const MONEY_CAP = 500000;

function checkOptions(step: ReasoningStep): void {
  if (step.kind !== 'choice' && step.kind !== 'multi') return;
  const labels = new Set<string>();
  const ids = new Set<string>();
  let correct = 0;
  for (const o of step.options) {
    expect(o.label.key.length).toBeGreaterThan(0);
    expect(labels.has(JSON.stringify(o.label))).toBe(false);
    labels.add(JSON.stringify(o.label));
    expect(ids.has(o.id)).toBe(false);
    ids.add(o.id);
    if (o.correct) correct++;
    else expect(o.misconception).toBeDefined();
  }
  if (step.kind === 'choice') {
    expect(step.options.length).toBeGreaterThanOrEqual(3);
    expect(step.options.length).toBeLessThanOrEqual(4);
    expect(correct).toBe(1);
  } else {
    expect(step.options.length).toBeGreaterThanOrEqual(3);
    expect(step.options.length).toBeLessThanOrEqual(5);
    expect(correct).toBeGreaterThanOrEqual(1);
  }
}

export function sweepItem(skillId: string, tier: SkillTier, item: MoneyItem): void {
  expect(item.skillId).toBe(skillId);
  expect(item.tier).toBe(tier);
  expect(item.steps.length).toBeGreaterThan(0);
  if (isMoneySceneFreeSkill(skillId)) {
    expect(item.scene).toBeUndefined();
  } else {
    expect(item.scene?.kind).toBe('notes');
    expect(item.scene?.minUnitPx).toBeGreaterThanOrEqual(16);
    const notes = item.scene?.kind === 'notes' ? item.scene.notes : [];
    expect(notes.length).toBeGreaterThanOrEqual(1);
    const labels = new Set<string>();
    for (const n of notes) {
      expect(DENOMINATIONS).toContain(n.value);
      if (n.label !== undefined) {
        expect(LETTERS).toContain(n.label);
        expect(labels.has(n.label)).toBe(false);
        labels.add(n.label);
      }
    }
  }
  for (const n of allNumbers(item)) {
    expect(Number.isInteger(n)).toBe(true);
    expect(n).toBeGreaterThanOrEqual(0);
    expect(n).toBeLessThanOrEqual(MONEY_CAP);
  }
  for (const w of item.work) {
    expect(Number.isInteger(w)).toBe(true);
    expect(w).toBeGreaterThanOrEqual(0);
    expect(w).toBeLessThanOrEqual(MONEY_CAP);
  }
  for (const step of item.steps) {
    if (step.kind === 'number') expect(Number.isInteger(step.answer)).toBe(true);
    checkOptions(step);
  }
  if (skillId === 'money-pick-notes') {
    const notes = notesOf(item);
    const target = targetOfPick(item);
    const picked = correctLetters(item).map((l) => notes[LETTERS.indexOf(l)] as number);
    expect(picked.reduce((a, b) => a + b, 0)).toBe(target);
    const { min, count } = bruteForceMinNotes(notes, target);
    expect(picked.length).toBe(min);
    expect(count).toBe(1);
  }
}
