import { describe, expect, it } from 'vitest';
import type { DropZone } from './drop-zone';
import type { InteractionEvent } from './interaction-types';
import { TapSelectController } from './tap-select-controller';

const zone = (id: string, accepts = true): DropZone => ({
  id,
  center: { x: 0, z: 0 },
  shape: { kind: 'circle', radius: 1 },
  accepts: () => accepts,
});

function setup(zones: DropZone[] = [zone('z1'), zone('z2'), zone('no', false)]) {
  const events: InteractionEvent[] = [];
  const ctrl = new TapSelectController((e) => events.push(e));
  ctrl.setTargets(['a', 'b'], zones);
  return { ctrl, events };
}

describe('TapSelectController taps', () => {
  it('select item then zone emits tap-select and drop', () => {
    const { ctrl, events } = setup();
    ctrl.tapItem('a');
    ctrl.tapZone('z1');
    expect(events).toEqual([
      { type: 'tap-select', itemId: 'a', source: 'tap' },
      { type: 'drop', itemId: 'a', zoneId: 'z1', position: null, source: 'tap' },
      { type: 'tap-select', itemId: null, source: 'tap' },
    ]);
    expect(ctrl.getSelected()).toBeNull();
  });

  it('tapping the selected item again deselects; unknown ids are ignored', () => {
    const { ctrl } = setup();
    ctrl.tapItem('a');
    ctrl.tapItem('a');
    expect(ctrl.getSelected()).toBeNull();
    ctrl.tapItem('ghost');
    expect(ctrl.getSelected()).toBeNull();
  });

  it('a zone tap without a selection does nothing', () => {
    const { ctrl, events } = setup();
    ctrl.tapZone('z1');
    expect(events).toEqual([]);
  });

  it('drops the selection when its item disappears from the targets', () => {
    const { ctrl } = setup();
    ctrl.tapItem('a');
    ctrl.setTargets(['b'], []);
    expect(ctrl.getSelected()).toBeNull();
  });
});

describe('TapSelectController keyboard', () => {
  it('arrows cycle items, Enter selects, arrows cycle accepting zones only, Enter drops', () => {
    const { ctrl, events } = setup();
    expect(ctrl.handleKey('ArrowRight')).toBe(true); // focus a
    expect(ctrl.handleKey('ArrowDown')).toBe(true); // focus b
    expect(ctrl.handleKey('Enter')).toBe(true); // select b, focus first zone
    expect(ctrl.handleKey('ArrowRight')).toBe(true); // focus z2 ('no' is not accepted)
    expect(ctrl.handleKey('Enter')).toBe(true); // drop on z2
    const drop = events.find((e) => e.type === 'drop');
    expect(drop).toMatchObject({ itemId: 'b', zoneId: 'z2', source: 'keyboard' });
    expect(events.filter((e) => e.type === 'focus').at(-1)).toEqual({
      type: 'focus',
      kind: 'none',
      id: null,
    });
  });

  it('ArrowLeft starts from the last item, walks backwards and wraps', () => {
    const { ctrl, events } = setup();
    ctrl.handleKey('ArrowLeft');
    expect(events.at(-1)).toEqual({ type: 'focus', kind: 'item', id: 'b' });
    ctrl.handleKey('ArrowUp');
    expect(events.at(-1)).toEqual({ type: 'focus', kind: 'item', id: 'a' });
    ctrl.handleKey('ArrowLeft');
    expect(events.at(-1)).toEqual({ type: 'focus', kind: 'item', id: 'b' });
  });

  it('never consumes Tab, and leaves Enter/Space alone until a 3D item has keyboard focus', () => {
    const { ctrl, events } = setup();
    expect(ctrl.handleKey('Tab')).toBe(false);
    expect(ctrl.handleKey('Enter')).toBe(false);
    expect(ctrl.handleKey(' ')).toBe(false);
    expect(events).toEqual([]);
    ctrl.handleKey('ArrowRight');
    expect(ctrl.handleKey('Tab')).toBe(false);
    expect(ctrl.handleKey(' ')).toBe(true);
    expect(ctrl.getSelected()).toBe('a');
  });

  it('Escape deselects, then clears focus; unhandled keys are not consumed', () => {
    const { ctrl } = setup();
    ctrl.handleKey('ArrowRight');
    ctrl.handleKey('Enter');
    expect(ctrl.getSelected()).toBe('a');
    expect(ctrl.handleKey('Escape')).toBe(true);
    expect(ctrl.getSelected()).toBeNull();
    expect(ctrl.handleKey('Escape')).toBe(false);
    expect(ctrl.handleKey('x')).toBe(false);
  });

  it('Enter on a selection with no accepting zone ends it with a null drop', () => {
    const { ctrl, events } = setup([zone('no', false)]);
    ctrl.tapItem('a');
    ctrl.handleKey('Enter');
    expect(events.find((e) => e.type === 'drop')).toMatchObject({ itemId: 'a', zoneId: null });
  });
});
