// Things the player can interact with when standing next to them (VLM, level gates, later the
// shop stall of phase 19): the `#interact` button and the E key act on the nearest one in reach.

/** Distances closer than this count as a tie; the lower `priority` (VLM: 0) then wins. */
export const INTERACT_TIE_DISTANCE = 0.25;
const DEFAULT_PRIORITY = 1;

export interface Interactable {
  /** Unique id ('vlm', 'gate:field', 'shop-stall'). */
  readonly id: string;
  /** Ground-plane anchor (x, z) the reach is measured from. */
  readonly position: { readonly x: number; readonly z: number };
  /** Reach: the player must stand strictly closer than this. */
  readonly radius: number;
  /** Lower wins a near tie; default 1 (VLM registers 0). */
  readonly priority?: number;
  /** Interact-button text in the current language (read each time the target changes). */
  label(): string;
  onInteract(): void;
}

export class InteractableRegistry {
  private readonly items = new Map<string, Interactable>();

  /** Adds `item`; returns its unregister function. Ids must be unique. */
  register(item: Interactable): () => void {
    if (this.items.has(item.id)) throw new Error(`Interactable "${item.id}" is already registered`);
    this.items.set(item.id, item);
    return () => {
      if (this.items.get(item.id) === item) this.items.delete(item.id);
    };
  }

  /** The interactable in reach of (x, z) closest to it, or undefined. */
  nearest(x: number, z: number): Interactable | undefined {
    let best: Interactable | undefined;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const item of this.items.values()) {
      const distance = Math.hypot(x - item.position.x, z - item.position.z);
      if (distance >= item.radius) continue;
      const tie = Math.abs(distance - bestDistance) < INTERACT_TIE_DISTANCE;
      const wins = tie
        ? (item.priority ?? DEFAULT_PRIORITY) < (best?.priority ?? DEFAULT_PRIORITY)
        : distance < bestDistance;
      if (wins) {
        best = item;
        bestDistance = distance;
      }
    }
    return best;
  }
}
