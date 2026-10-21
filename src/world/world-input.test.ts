import { describe, expect, it, vi } from 'vitest';
import { attachWorldInput, type WorldInputTarget } from './world-input';

/** A canvas stand-in: real EventTarget dispatch, pointer fields set on plain events. */
function fakeCanvas() {
  const canvas = new EventTarget() as EventTarget & Record<string, unknown>;
  canvas.setPointerCapture = () => {};
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 });
  const fire = (type: string, fields: Record<string, number> = {}) => {
    const event = Object.assign(new Event(type, { cancelable: true }), fields);
    canvas.dispatchEvent(event);
    return event;
  };
  return { canvas: canvas as unknown as HTMLCanvasElement, fire };
}

function target(state: Partial<WorldInputTarget>): WorldInputTarget {
  return {
    active: true,
    paused: false,
    suspended: false,
    yaw: 0,
    pitch: 0.5,
    moveToScreen: vi.fn(),
    zoom: vi.fn(),
    ...state,
  };
}

const tap = (fire: ReturnType<typeof fakeCanvas>['fire']) => {
  fire('pointerdown', { clientX: 10, clientY: 10, pointerId: 1 });
  fire('pointerup', { clientX: 10, clientY: 10, pointerId: 1 });
};

describe('world input', () => {
  it('a tap walks and the wheel zooms while the world is playing', () => {
    const { canvas, fire } = fakeCanvas();
    const world = target({});
    attachWorldInput(canvas, world);
    tap(fire);
    expect(fire('wheel', { deltaY: 100 }).defaultPrevented).toBe(true);
    expect(world.moveToScreen).toHaveBeenCalledWith(10, 10);
    expect(world.zoom).toHaveBeenCalledTimes(1);
  });

  it('a suspended world ignores taps, drags and the wheel even when not paused', () => {
    // A dialog or the map closing while a level runs rewrites `paused` to false.
    const { canvas, fire } = fakeCanvas();
    const world = target({ suspended: true });
    attachWorldInput(canvas, world);
    tap(fire);
    fire('pointerdown', { clientX: 10, clientY: 10, pointerId: 2 });
    fire('pointermove', { clientX: 60, clientY: 40, pointerId: 2 });
    fire('wheel', { deltaY: 100 });
    expect(world.moveToScreen).not.toHaveBeenCalled();
    expect(world.zoom).not.toHaveBeenCalled();
    expect(world.yaw).toBe(0);
  });
});
