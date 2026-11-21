// Shared sweep checks for data items: shape, scenes, caps, options, and (for chance)
// the enumerated verdict from the scene.
import { expect } from 'vitest';
import type { SkillTier } from '../learning/skill-tiers';
import type { ReasoningStep } from '../reasoning/reasoning-types';
import { COLOURS, DATA_CAP } from './data-ranges';
import type { DataItem } from './data-scene-types';
import {
  allNumbers,
  type BagEvent,
  bagOf,
  type DiceEvent,
  diceOf,
  stepLabel,
  tableOf,
  tallyOf,
  verdictOfBag,
  verdictOfDice,
} from './data-test-oracles';
import { groupOfHeaders } from './data-topics';

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
  expect(step.options.length).toBeGreaterThanOrEqual(3);
  expect(step.options.length).toBeLessThanOrEqual(4);
  expect(correct).toBe(1);
}

function checkTable(item: DataItem): void {
  const table = tableOf(item);
  expect(table.headers.length).toBeGreaterThanOrEqual(3);
  expect(table.headers.length).toBeLessThanOrEqual(5);
  expect(table.rows.length).toBeGreaterThanOrEqual(1);
  expect(table.rows.length).toBeLessThanOrEqual(3);
  for (const h of table.headers) expect(h.startsWith('i:') || h.startsWith('l:')).toBe(true);
  // Review #41: every table is one coherent topic — all headers in a single group.
  expect(groupOfHeaders(table.headers)).toBeDefined();
  // The Nam/Nữ/Cả lớp table only ever uses the 'likes' group (activities children
  // can like, choose or join — never animals).
  if ((table.rowLabels ?? []).includes('l:row_boys'))
    expect(groupOfHeaders(table.headers)).toBe('likes');
  for (const row of table.rows) {
    expect(row.length).toBe(table.headers.length);
    for (const cell of row) {
      if (cell === null) continue;
      expect(Number.isInteger(cell)).toBe(true);
      expect(cell).toBeGreaterThanOrEqual(0);
      expect(cell).toBeLessThanOrEqual(DATA_CAP);
    }
  }
  if (table.rowLabels) expect(table.rowLabels.length).toBe(table.rows.length);
  if (table.hiddenCell) {
    const { row, col } = table.hiddenCell;
    expect(table.rows[row]?.[col]).toBe(null);
  } else {
    for (const row of table.rows) for (const cell of row) expect(cell).not.toBe(null);
  }
}

export function sweepItem(skillId: string, tier: SkillTier, item: DataItem): void {
  expect(item.skillId).toBe(skillId);
  expect(item.tier).toBe(tier);
  expect(item.steps.length).toBeGreaterThan(0);
  // Every data skill needs its picture: no data skill is scene-free.
  expect(item.scene).toBeDefined();
  expect(item.scene?.minUnitPx).toBeGreaterThanOrEqual(16);
  const kind = item.scene?.kind;
  if (kind === 'data-table') checkTable(item);
  if (kind === 'tally') {
    const marks = tallyOf(item);
    expect(marks.length).toBeGreaterThanOrEqual(6);
    expect(marks.length).toBeLessThanOrEqual(30);
  }
  if (kind === 'bag') {
    const bag = bagOf(item);
    expect(bag.items.length).toBeGreaterThanOrEqual(1);
    expect(bag.items.length).toBeLessThanOrEqual(4);
    expect(bag.pick).toBeGreaterThanOrEqual(1);
    expect(bag.pick).toBeLessThanOrEqual(2);
    let total = 0;
    for (const b of bag.items) {
      expect(COLOURS).toContain(b.colour);
      expect(b.count).toBeGreaterThanOrEqual(0);
      total += b.count;
    }
    expect(total).toBeGreaterThanOrEqual(2);
    expect(total).toBeLessThanOrEqual(20);
  }
  if (kind === 'dice') {
    const dice = diceOf(item);
    expect(dice.up).toBeGreaterThanOrEqual(1);
    expect(dice.up).toBeLessThanOrEqual(6);
    if (dice.other !== undefined) {
      expect(dice.other).toBeGreaterThanOrEqual(1);
      expect(dice.other).toBeLessThanOrEqual(6);
      expect(dice.other).not.toBe(dice.up);
    }
    for (const h of dice.hidden ?? []) {
      expect(h).toBeGreaterThanOrEqual(1);
      expect(h).toBeLessThanOrEqual(6);
      expect(h).not.toBe(dice.up);
    }
  }
  for (const n of allNumbers(item)) {
    expect(Number.isInteger(n)).toBe(true);
    expect(n).toBeGreaterThanOrEqual(0);
    expect(n).toBeLessThanOrEqual(DATA_CAP);
  }
  for (const w of item.work) {
    expect(Number.isInteger(w)).toBe(true);
    expect(w).toBeGreaterThanOrEqual(0);
    expect(w).toBeLessThanOrEqual(DATA_CAP);
  }
  for (const step of item.steps) {
    if (step.kind === 'number') expect(Number.isInteger(step.answer)).toBe(true);
    checkOptions(step);
  }
  // Chance verdicts are re-derived from the scene by enumeration, never trusted.
  if (skillId === 'chance-bag') {
    const bag = bagOf(item);
    const step = item.steps[0];
    const prompt = step?.prompt;
    const event: BagEvent =
      prompt?.key === 'bagEventOne'
        ? { kind: 'one', colour: String(prompt.params?.colour).slice(2) }
        : prompt?.key === 'bagEventTwo'
          ? { kind: 'two', colour: String(prompt.params?.colour).slice(2) }
          : {
              kind: 'mixed',
              colour1: String(prompt?.params?.colour1).slice(2),
              colour2: String(prompt?.params?.colour2).slice(2),
            };
    expect(stepLabel(step)).toBe(`chance_${verdictOfBag(bag.items, bag.pick, event)}`);
  }
  if (skillId === 'chance-dice') {
    const step = item.steps[0];
    const prompt = step?.prompt;
    const event: DiceEvent =
      prompt?.key === 'diceEventAll'
        ? { kind: 'all' }
        : { kind: 'face', face: Number(prompt?.params?.face) };
    expect(stepLabel(step)).toBe(`chance_${verdictOfDice(event)}`);
  }
}
