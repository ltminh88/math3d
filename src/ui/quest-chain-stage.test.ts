import { describe, expect, it } from 'vitest';
import { progressionState } from '../levels/shared/level-progression';
import { questStage } from './quest-chain-stage';

const done = (...ids: string[]) =>
  Object.fromEntries(ids.map((id) => [id, { completedAt: 1_700_000_000_000 }]));

describe('quest chain stage', () => {
  it('stays on the bridge quest until the bridge is crossed', () => {
    expect(questStage(progressionState(false, {}))).toBe('bridge');
    // A seeded level without the bridge never skips the first quest.
    expect(questStage(progressionState(false, done('field')))).toBe('bridge');
  });

  it('points at the field gate once the bridge quest is complete', () => {
    expect(questStage(progressionState(true, {}))).toBe('field');
    expect(questStage(progressionState(true, { field: { completedAt: 0 } }))).toBe('field');
  });

  it('points at the forest gate once the field is completed', () => {
    expect(questStage(progressionState(true, done('field')))).toBe('forest');
  });

  it('points at the city gate once the forest is completed', () => {
    expect(questStage(progressionState(true, done('field', 'forest')))).toBe('city');
  });

  it('points at the tower gate once the city is completed', () => {
    expect(questStage(progressionState(true, done('field', 'forest', 'city')))).toBe('tower');
  });

  it('ends on the closing card once the tower is completed', () => {
    expect(questStage(progressionState(true, done('field', 'forest', 'city', 'tower')))).toBe(
      'done',
    );
  });
});
