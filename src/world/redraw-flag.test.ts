import { describe, expect, it } from 'vitest';
import { RedrawFlag } from './redraw-flag';

describe('RedrawFlag', () => {
  it('is false until requested', () => {
    expect(new RedrawFlag().take()).toBe(false);
  });

  it('is true once per request, then false again', () => {
    const flag = new RedrawFlag();
    flag.request();
    expect(flag.take()).toBe(true);
    expect(flag.take()).toBe(false);
  });

  it('coalesces repeated requests into one frame', () => {
    const flag = new RedrawFlag();
    flag.request();
    flag.request();
    expect(flag.take()).toBe(true);
    expect(flag.take()).toBe(false);
  });
});
