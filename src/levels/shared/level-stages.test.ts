import { describe, expect, it } from 'vitest';
import { nextStage, type StageProgress, stageStatus, stagesCompleted } from './level-stages';

describe('level stages', () => {
  const fresh = (stages = 6): StageProgress => ({ stages, stageStars: [] });
  const done1 = (stages = 6): StageProgress => ({ stages, stageStars: [2] });

  it('a fresh level has stage 1 open and the rest locked', () => {
    const p = fresh();
    expect(stageStatus(p, 1)).toBe('open');
    expect(stageStatus(p, 2)).toBe('locked');
    expect(stageStatus(p, 6)).toBe('locked');
    expect(nextStage(p)).toBe(1);
    expect(stagesCompleted(p)).toBe(0);
  });

  it('stage 1 done opens stage 2 only', () => {
    const p = done1();
    expect(stageStatus(p, 1)).toBe('completed');
    expect(stageStatus(p, 2)).toBe('open');
    expect(stageStatus(p, 3)).toBe('locked');
    expect(nextStage(p)).toBe(2);
    expect(stagesCompleted(p)).toBe(1);
  });

  it('a gap can never open the stage after it', () => {
    // Not reachable from real play (stages open in order), but the helper must not
    // let stage 3 open when stage 2 has 0 stars even if stage 1 is done.
    const p: StageProgress = { stages: 6, stageStars: [3, 0] };
    expect(stageStatus(p, 3)).toBe('locked');
    expect(nextStage(p)).toBe(2);
  });

  it('all stages done replays the last one', () => {
    const p: StageProgress = { stages: 5, stageStars: [1, 2, 3, 1, 2] };
    expect(stageStatus(p, 5)).toBe('completed');
    expect(nextStage(p)).toBe(5);
    expect(stagesCompleted(p)).toBe(5);
  });

  it('out-of-range stages are locked', () => {
    const p = fresh(1);
    expect(stageStatus(p, 0)).toBe('locked');
    expect(stageStatus(p, 2)).toBe('locked');
    expect(nextStage(p)).toBe(1);
  });

  it('a one-stage level behaves exactly as today', () => {
    const p = fresh(1);
    expect(stageStatus(p, 1)).toBe('open');
    const done: StageProgress = { stages: 1, stageStars: [3] };
    expect(stageStatus(done, 1)).toBe('completed');
    expect(nextStage(done)).toBe(1);
  });
});
