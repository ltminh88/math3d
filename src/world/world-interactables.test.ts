import { describe, expect, it, vi } from 'vitest';
import { type Interactable, InteractableRegistry } from './world-interactables';

const item = (id: string, x: number, z: number, radius = 3, priority?: number): Interactable => ({
  id,
  position: { x, z },
  radius,
  priority,
  label: () => id,
  onInteract: vi.fn(),
});

describe('interactable registry', () => {
  it('finds nothing out of reach (strictly inside the radius, like nearMilo)', () => {
    const registry = new InteractableRegistry();
    registry.register(item('vlm', 0, 0, 3.1));
    expect(registry.nearest(3.1, 0)).toBeUndefined();
    expect(registry.nearest(3.09, 0)?.id).toBe('vlm');
  });

  it('the nearest interactable in reach wins', () => {
    const registry = new InteractableRegistry();
    registry.register(item('gate', 4, 0, 3));
    registry.register(item('stall', 0, 0, 3));
    expect(registry.nearest(1, 0)?.id).toBe('stall');
    expect(registry.nearest(3, 0)?.id).toBe('gate');
  });

  it('a near tie goes to the lower priority (VLM)', () => {
    const registry = new InteractableRegistry();
    registry.register(item('gate', 2.1, 0, 3));
    registry.register(item('vlm', -2, 0, 3, 0));
    expect(registry.nearest(0, 0)?.id).toBe('vlm');
    expect(registry.nearest(1, 0)?.id).toBe('gate');
  });

  it('unregister removes it; a duplicate id is refused', () => {
    const registry = new InteractableRegistry();
    const unregister = registry.register(item('gate', 0, 0));
    expect(() => registry.register(item('gate', 5, 5))).toThrow(/gate/);
    unregister();
    expect(registry.nearest(0, 0)).toBeUndefined();
    registry.register(item('gate', 0, 0));
    expect(registry.nearest(0, 0)?.id).toBe('gate');
  });
});
