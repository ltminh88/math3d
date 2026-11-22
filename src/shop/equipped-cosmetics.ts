// Multi-equip model (phase 23): the pure reducer over EquippedCosmetics plus the
// migration from the old slot -> id map. Pure logic only (no three, no DOM) so the
// save-code decoder and the store migration can use it too. Ownership is NOT checked
// here — the shop flow checks it before calling wearItem.

import type { CharacterAnchor, EquippedCosmetics } from '../store/save-schema';
import type { CosmeticAnchor, CosmeticOwner } from './cosmetic-anchors';
import { PLACEMENT_BY_ID } from './cosmetic-anchors';
import type { CosmeticItem } from './cosmetic-catalog';

export type { EquippedCosmetics };

const ownerOfSlot = (slot: CosmeticItem['slot']): CosmeticOwner =>
  slot === 'village-decor' ? 'decor' : slot === 'vlm-outfit' ? 'vlm' : 'avatar';

/** Wear `item`: same-spot items are replaced, decor is appended once. */
export function wearItem(
  equipped: EquippedCosmetics,
  item: Pick<CosmeticItem, 'id' | 'slot' | 'anchor'>,
): EquippedCosmetics {
  if (item.anchor === 'ground') {
    if (equipped.decor.includes(item.id)) return equipped;
    return { ...equipped, decor: [...equipped.decor, item.id] };
  }
  const owner = ownerOfSlot(item.slot);
  if (owner === 'decor') return equipped; // a decor item always hangs from the ground anchor
  const spots = equipped[owner];
  const anchor = item.anchor as CharacterAnchor;
  if (spots[anchor] === item.id) return equipped;
  return { ...equipped, [owner]: { ...spots, [anchor]: item.id } };
}

/** Take `item` off (a no-op when it is not worn). */
export function unwearItem(
  equipped: EquippedCosmetics,
  item: Pick<CosmeticItem, 'id' | 'slot' | 'anchor'>,
): EquippedCosmetics {
  if (item.anchor === 'ground') {
    if (!equipped.decor.includes(item.id)) return equipped;
    return { ...equipped, decor: equipped.decor.filter((id) => id !== item.id) };
  }
  const owner = ownerOfSlot(item.slot);
  if (owner === 'decor') return equipped; // a decor item always hangs from the ground anchor
  const spots = equipped[owner];
  const anchor = item.anchor as CharacterAnchor;
  if (spots[anchor] !== item.id) return equipped;
  const { [anchor]: _removed, ...rest } = spots;
  return { ...equipped, [owner]: rest };
}

export const isEquipped = (
  equipped: EquippedCosmetics,
  item: Pick<CosmeticItem, 'id' | 'slot' | 'anchor'>,
): boolean => {
  if (item.anchor === 'ground') return equipped.decor.includes(item.id);
  const owner = ownerOfSlot(item.slot);
  if (owner === 'decor') return false;
  return equipped[owner][item.anchor as CharacterAnchor] === item.id;
};

/** Every worn id, VLM spots first, then avatar spots, then decor. */
export const equippedIds = (equipped: EquippedCosmetics): readonly string[] => [
  ...Object.values(equipped.vlm),
  ...Object.values(equipped.avatar),
  ...equipped.decor,
];

/**
 * Old slot -> id map (M3D5 and earlier, and v1 profiles) to the multi-equip model.
 * The unequipped sentinel ('none'), unknown ids and ids in the wrong slot are dropped
 * — the same items stay worn, nothing else does.
 */
export function migrateEquippedV1(old: Record<string, string>): EquippedCosmetics {
  let next: EquippedCosmetics = {
    vlm: {},
    avatar: {},
    decor: [],
  };
  for (const [slot, id] of Object.entries(old)) {
    if (id === 'none') continue;
    const placement = PLACEMENT_BY_ID[id];
    if (!placement) continue;
    const owner: CosmeticOwner =
      slot === 'vlm-outfit' ? 'vlm' : slot === 'avatar-outfit' ? 'avatar' : 'decor';
    if (placement.owner !== owner) continue;
    if (placement.anchor === 'ground') {
      if (!next.decor.includes(id)) next = { ...next, decor: [...next.decor, id] };
    } else if (owner === 'vlm') {
      next = { ...next, vlm: { ...next.vlm, [placement.anchor]: id } };
    } else if (owner === 'avatar') {
      next = { ...next, avatar: { ...next.avatar, [placement.anchor]: id } };
    }
  }
  return next;
}

/** True when `value` already has the phase-23 shape (a v2 profile read back). */
export const isEquippedV2 = (value: unknown): value is EquippedCosmetics =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  typeof (value as { vlm?: unknown }).vlm === 'object' &&
  typeof (value as { avatar?: unknown }).avatar === 'object' &&
  Array.isArray((value as { decor?: unknown }).decor);

export type { CharacterAnchor, CosmeticAnchor };
