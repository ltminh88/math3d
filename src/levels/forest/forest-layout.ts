// Where things stand in the forest clearing (ground plane x/z, camera looks towards -z): the
// fruit pile in front, friends in an arc behind it, or two rows of baskets when packing.
import type { GroundPoint } from '../../core/input/interaction-types';
import type { Spot } from './sharing-model';

export interface Point3 {
  x: number;
  y: number;
  z: number;
}

export const PILE_CENTER: GroundPoint = { x: 0, z: 2.7 };
/** Bear stands beside the baskets when packing. */
export const PACK_BEAR: GroundPoint = { x: -4.9, z: -0.9 };
export const FRUIT_Y = 0.32;
const FRIEND_SPACING = 2.3;
const FRIEND_Z = -1.1;
const BASKETS_PER_ROW = 5;
const BASKET_SPACING = 1.55;
const BASKET_ROWS_Z = [-1.7, 0.2] as const;

/** Centre of group `index` (friend or basket) out of `groups`. */
export function groupCenter(kind: 'share' | 'pack', index: number, groups: number): GroundPoint {
  if (kind === 'share') {
    return { x: (index - (groups - 1) / 2) * FRIEND_SPACING, z: FRIEND_Z };
  }
  const row = Math.floor(index / BASKETS_PER_ROW);
  const col = index % BASKETS_PER_ROW;
  return { x: (col - 2) * BASKET_SPACING + 0.6, z: BASKET_ROWS_Z[row] ?? 0 };
}

/** Friend stands behind its fruit spot. */
export const animalPosition = (center: GroundPoint): GroundPoint => ({
  x: center.x,
  z: center.z - 0.75,
});

/** Slot of the `slot`-th fruit inside a group: a 3-wide grid in front of a friend, a basket heap. */
function groupSlot(kind: 'share' | 'pack', center: GroundPoint, slot: number): Point3 {
  if (kind === 'share') {
    const col = slot % 3;
    const row = Math.floor(slot / 3);
    return { x: center.x + (col - 1) * 0.36, y: FRUIT_Y - 0.1, z: center.z + row * 0.34 };
  }
  const layer = Math.floor(slot / 3);
  const angle = (slot % 3) * ((Math.PI * 2) / 3) + layer;
  return {
    x: center.x + Math.cos(angle) * 0.16,
    y: 0.36 + layer * 0.2,
    z: center.z + Math.sin(angle) * 0.16,
  };
}

/** Golden-angle heap on the leaf mat. */
function pileSlot(slot: number): Point3 {
  const angle = slot * 2.4;
  const radius = 0.2 * Math.sqrt(slot + 0.5);
  return {
    x: PILE_CENTER.x + Math.cos(angle) * radius,
    y: FRUIT_Y + (slot < 6 ? 0 : 0.12),
    z: PILE_CENTER.z + Math.sin(angle) * radius * 0.8,
  };
}

/** Rest position of every fruit for the given spots (fruit keep their order inside a group). */
export function fruitPositions(
  kind: 'share' | 'pack',
  spots: readonly Spot[],
  groups: number,
): Point3[] {
  const used = new Map<Spot, number>();
  return spots.map((spot) => {
    const slot = used.get(spot) ?? 0;
    used.set(spot, slot + 1);
    return spot === 'pile'
      ? pileSlot(slot)
      : groupSlot(kind, groupCenter(kind, spot, groups), slot);
  });
}
