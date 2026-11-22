// Phase 25a (issue #46): shared level zoom — pinch ratio → factor, clamping, wheel,
// buttons, reset. Pure math + state, no DOM: the DOM wiring (attachLevelZoom) is
// covered by the forest-zoom e2e spec.
import { describe, expect, it, vi } from 'vitest';
import {
  buttonZoomFactor,
  clampZoomFactor,
  LevelZoom,
  MAX_ZOOM,
  MIN_ZOOM,
  pinchZoomFactor,
  wheelZoomFactor,
  ZOOM_BUTTON_STEP,
} from './level-zoom';

describe('clampZoomFactor', () => {
  it('keeps 0.6×–1.6× of the auto-fit distance', () => {
    expect(clampZoomFactor(0.5)).toBe(MIN_ZOOM);
    expect(clampZoomFactor(0.6)).toBe(0.6);
    expect(clampZoomFactor(1)).toBe(1);
    expect(clampZoomFactor(1.6)).toBe(1.6);
    expect(clampZoomFactor(2)).toBe(MAX_ZOOM);
  });
});

describe('pinchZoomFactor', () => {
  it('spreading fingers zooms in (factor down), closing them zooms out (factor up)', () => {
    expect(pinchZoomFactor(1, 100, 200)).toBe(0.6); // 0.5 clamped to the floor
    expect(pinchZoomFactor(1, 100, 125)).toBe(0.8);
    expect(pinchZoomFactor(1, 100, 100)).toBe(1);
    expect(pinchZoomFactor(1, 100, 80)).toBe(1.25);
    expect(pinchZoomFactor(1, 100, 50)).toBe(1.6); // 2 clamped to the ceiling
  });

  it('scales from the factor the gesture started at', () => {
    expect(pinchZoomFactor(0.8, 100, 200)).toBe(0.6);
    expect(pinchZoomFactor(1.25, 200, 100)).toBe(1.6);
  });
});

describe('wheelZoomFactor', () => {
  it('scroll up zooms in, scroll down zooms out, both clamp', () => {
    expect(wheelZoomFactor(1, -120)).toBeLessThan(1);
    expect(wheelZoomFactor(1, 120)).toBeGreaterThan(1);
    expect(wheelZoomFactor(1.6, 120)).toBe(1.6);
    expect(wheelZoomFactor(0.6, -120)).toBe(0.6);
  });
});

describe('buttonZoomFactor', () => {
  it('steps by 1.25× and clamps at both ends', () => {
    expect(buttonZoomFactor(1, 'in')).toBeCloseTo(1 / ZOOM_BUTTON_STEP);
    expect(buttonZoomFactor(1, 'out')).toBeCloseTo(ZOOM_BUTTON_STEP);
    expect(buttonZoomFactor(0.6, 'in')).toBe(0.6);
    expect(buttonZoomFactor(1.6, 'out')).toBe(1.6);
  });
});

describe('LevelZoom', () => {
  it('starts at 1× and follows a pinch from the gesture start', () => {
    const zoom = new LevelZoom();
    expect(zoom.factor).toBe(1);
    zoom.beginPinch(100);
    zoom.movePinch(125);
    expect(zoom.factor).toBe(0.8);
    zoom.movePinch(200);
    expect(zoom.factor).toBe(0.6);
    zoom.endPinch();
    zoom.movePinch(100);
    expect(zoom.factor).toBe(0.6);
  });

  it('wheel and buttons move the factor, reset returns to 1×', () => {
    const onChange = vi.fn();
    const zoom = new LevelZoom(onChange);
    zoom.wheel(-120);
    expect(zoom.factor).toBeLessThan(1);
    zoom.step('out');
    const afterOut = zoom.factor;
    expect(afterOut).toBeGreaterThan(1);
    zoom.reset();
    expect(zoom.factor).toBe(1);
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it('does not notify when the factor does not change', () => {
    const onChange = vi.fn();
    const zoom = new LevelZoom(onChange);
    zoom.step('in');
    zoom.step('in');
    zoom.step('in');
    expect(zoom.factor).toBe(0.6);
    const calls = onChange.mock.calls.length;
    zoom.step('in');
    expect(onChange.mock.calls.length).toBe(calls);
  });
});
