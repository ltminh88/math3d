import { describe, expect, it } from 'vitest';
import { clearRequestedStage, requestStage, takeRequestedStage } from './level-stage-override';

describe('stage override', () => {
  it('is consumed only by the run of the level it names', () => {
    requestStage('field', 3);
    expect(takeRequestedStage('field', 6)).toBe(3);
    expect(takeRequestedStage('field', 6)).toBeUndefined();
  });

  it('is dropped when another level is entered instead', () => {
    requestStage('field', 3);
    expect(takeRequestedStage('cave', 5)).toBeUndefined();
    expect(takeRequestedStage('field', 6)).toBeUndefined();
  });

  it('is cleared when the map closes without playing', () => {
    requestStage('field', 3);
    clearRequestedStage();
    expect(takeRequestedStage('field', 6)).toBeUndefined();
  });

  it('rejects a stage outside the level', () => {
    requestStage('field', 0);
    expect(takeRequestedStage('field', 6)).toBeUndefined();
    requestStage('field', 7);
    expect(takeRequestedStage('field', 6)).toBeUndefined();
  });

  it('a newer request replaces the pending one', () => {
    requestStage('field', 2);
    requestStage('field', 4);
    expect(takeRequestedStage('field', 6)).toBe(4);
    expect(takeRequestedStage('field', 6)).toBeUndefined();
  });
});
