import { describe, expect, it } from 'vitest';
import { progressionState } from '../levels/shared/level-progression';
import { QUEST_CHAPTERS, questChapter, questStage, questStageLine } from './quest-chain-stage';

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

  it('walks chapter 2 garden → valley → workshop → cave, then chapter 3', () => {
    const chapter1 = ['field', 'forest', 'city', 'tower'];
    expect(questStage(progressionState(true, done(...chapter1, 'garden')))).toBe('valley');
    expect(questStage(progressionState(true, done(...chapter1, 'garden', 'valley')))).toBe(
      'workshop',
    );
    const allButCave = [...chapter1, 'garden', 'valley', 'workshop'];
    expect(questStage(progressionState(true, done(...allButCave)))).toBe('cave');
    const allButMarket = [...allButCave, 'cave'];
    expect(questStage(progressionState(true, done(...allButMarket)))).toBe('market');
    expect(questStage(progressionState(true, done(...allButMarket, 'market')))).toBe('numberfort');
    expect(questStage(progressionState(true, done(...allButMarket, 'market', 'numberfort')))).toBe(
      'done',
    );
  });

  it('an old save that finished the cave points at the market, not the closing card', () => {
    // Before chapter 3, finishing the cave was 'done'; the save must now lead onward.
    const throughCave = [
      'field',
      'forest',
      'city',
      'tower',
      'garden',
      'valley',
      'workshop',
      'cave',
    ];
    expect(questStage(progressionState(true, done(...throughCave)))).toBe('market');
    expect(questStage(progressionState(true, done(...throughCave)))).not.toBe('done');
  });
});

describe('quest stage line', () => {
  it('shows nothing for a one-stage level', () => {
    expect(questStageLine(1, [3])).toBeNull();
  });

  it('starts a fresh level at stage 1 with 0 stars', () => {
    expect(questStageLine(6, [])).toEqual({ n: 1, m: 6, stars: 0, max: 18 });
  });

  it('names the next stage and the stars earned so far', () => {
    expect(questStageLine(6, [2])).toEqual({ n: 2, m: 6, stars: 2, max: 18 });
    expect(questStageLine(6, [2, 3])).toEqual({ n: 3, m: 6, stars: 5, max: 18 });
  });

  it('treats a missing stage entry as 0 stars', () => {
    expect(questStageLine(5, [2, 1])).toEqual({ n: 3, m: 5, stars: 3, max: 15 });
  });

  it('reports all-done once every stage has a star', () => {
    expect(questStageLine(5, [2, 1, 3, 2, 1])).toBe('all-done');
  });
});

describe('quest chapters', () => {
  it('splits the 11 stages into three rows of at most 5 cells', () => {
    expect(QUEST_CHAPTERS).toEqual([
      ['bridge', 'field', 'forest', 'city', 'tower'],
      ['garden', 'valley', 'workshop', 'cave'],
      ['market', 'numberfort'],
    ]);
  });

  it('places each stage in its chapter with the cells done before it', () => {
    expect(questChapter('bridge')).toEqual({ chapter: 1, stages: QUEST_CHAPTERS[0], done: 0 });
    expect(questChapter('city')).toEqual({ chapter: 1, stages: QUEST_CHAPTERS[0], done: 3 });
    expect(questChapter('tower')).toEqual({ chapter: 1, stages: QUEST_CHAPTERS[0], done: 4 });
    expect(questChapter('garden')).toEqual({ chapter: 2, stages: QUEST_CHAPTERS[1], done: 0 });
    expect(questChapter('cave')).toEqual({ chapter: 2, stages: QUEST_CHAPTERS[1], done: 3 });
    expect(questChapter('market')).toEqual({ chapter: 3, stages: QUEST_CHAPTERS[2], done: 0 });
    expect(questChapter('numberfort')).toEqual({
      chapter: 3,
      stages: QUEST_CHAPTERS[2],
      done: 1,
    });
    expect(questChapter('done')).toEqual({ chapter: 3, stages: QUEST_CHAPTERS[2], done: 2 });
  });
});
