import { describe, expect, it } from 'vitest';
import { progressionState } from '../levels/shared/level-progression';
import { QUEST_CHAPTERS, questChapter, questStage } from './quest-chain-stage';

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

  it('opens chapter 2 at the garden once the tower is completed', () => {
    expect(questStage(progressionState(true, done('field', 'forest', 'city', 'tower')))).toBe(
      'garden',
    );
  });

  it('walks chapter 2 garden → valley → workshop → cave, then the closing card', () => {
    const chapter1 = ['field', 'forest', 'city', 'tower'];
    expect(questStage(progressionState(true, done(...chapter1, 'garden')))).toBe('valley');
    expect(questStage(progressionState(true, done(...chapter1, 'garden', 'valley')))).toBe(
      'workshop',
    );
    const allButCave = [...chapter1, 'garden', 'valley', 'workshop'];
    expect(questStage(progressionState(true, done(...allButCave)))).toBe('cave');
    expect(questStage(progressionState(true, done(...allButCave, 'cave')))).toBe('done');
  });
});

describe('quest chapters', () => {
  it('splits the 9 stages into two rows of at most 5 cells', () => {
    expect(QUEST_CHAPTERS).toEqual([
      ['bridge', 'field', 'forest', 'city', 'tower'],
      ['garden', 'valley', 'workshop', 'cave'],
    ]);
  });

  it('places each stage in its chapter with the cells done before it', () => {
    expect(questChapter('bridge')).toEqual({ chapter: 1, stages: QUEST_CHAPTERS[0], done: 0 });
    expect(questChapter('city')).toEqual({ chapter: 1, stages: QUEST_CHAPTERS[0], done: 3 });
    expect(questChapter('tower')).toEqual({ chapter: 1, stages: QUEST_CHAPTERS[0], done: 4 });
    expect(questChapter('garden')).toEqual({ chapter: 2, stages: QUEST_CHAPTERS[1], done: 0 });
    expect(questChapter('cave')).toEqual({ chapter: 2, stages: QUEST_CHAPTERS[1], done: 3 });
    expect(questChapter('done')).toEqual({ chapter: 2, stages: QUEST_CHAPTERS[1], done: 4 });
  });
});
