/** Ground-plane position (x, z); the game plays on a flat playfield. */
export interface GroundPoint {
  x: number;
  z: number;
}

export type InteractionSource = 'drag' | 'tap' | 'keyboard';

/** Events every scene receives, identical for mouse, touch, pen and keyboard. */
export type InteractionEvent =
  | { type: 'pick'; itemId: string; source: 'drag' }
  | { type: 'drag-move'; itemId: string; position: GroundPoint; zoneId: string | null }
  | {
      type: 'drop';
      itemId: string;
      zoneId: string | null;
      position: GroundPoint | null;
      source: InteractionSource;
    }
  | { type: 'cancel'; itemId: string }
  /** Selection changed through tap or keyboard (itemId null = deselected). */
  | { type: 'tap-select'; itemId: string | null; source: 'tap' | 'keyboard' }
  /** Keyboard focus moved (id null = nothing focused). */
  | { type: 'focus'; kind: 'item' | 'zone' | 'none'; id: string | null };
