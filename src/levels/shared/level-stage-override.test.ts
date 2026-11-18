import { describe, expect, it } from 'vitest';
import { requestStage, takeRequestedStage } from './level-stage-override';

describe('stage override', () => {
  it('hands the requested stage to the next run, then clears itself', () => {
    requestStage(3);
    expect(takeRequestedStage(6)).toBe(3);
    expect(takeRequestedStage(6)).toBeUndefined();
  });

  it('rejects a stage outside the level', () => {
    requestStage(0);
    expect(takeRequestedStage(5)).toBeUndefined();
    requestStage(6);
    expect(takeRequestedStage(5)).toBeUndefined();
  });

  it('a stale request never leaks into a later run', () => {
    requestStage(2);
    expect(takeRequestedStage(6)).toBe(2);
    requestStage(4);
    expect(takeRequestedStage(6)).toBe(4);
    expect(takeRequestedStage(6)).toBeUndefined();
  });
});
