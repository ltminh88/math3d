// Keeps the world in step with the store: one mesh per worn item, attached to VLM, the
// player or its own village spot. A worn item that changed drops its old mesh (geometry
// disposed; the shared material stays), so equip/unequip cycles never leak GPU geometry.
// Nothing is built while nothing is equipped, so the world is untouched then.
import type { Mesh, Object3D } from 'three';
import { VILLAGE_DECOR_SLOT } from '../config/regions';
import type { GameSnapshot } from '../store/progress-repository';
import type { EquippedCosmetics } from '../store/save-schema';
import {
  type AnchorPoint,
  type CharacterAnchors,
  GUIDE_ANCHORS,
  PLAYER_ANCHORS,
} from '../world/characters-milo-avatar';
import type { ObstacleCircle } from '../world/world-build-context';
import type { WorldPublicApi } from '../world/world-public-api';
import { type CosmeticItem, cosmeticById } from './cosmetic-catalog';
import { equippedIds } from './equipped-cosmetics';
import { equippedOf } from './shop-purchase-flow';
import { partsMesh } from './vertex-color-parts';

/** Collision circle of a placed decoration (all fit inside it). */
const DECOR_RADIUS = 1.1;

interface Worn {
  readonly item: CosmeticItem;
  readonly mesh: Mesh;
  readonly obstacle?: ObstacleCircle;
}

/** Every worn item of a snapshot, in wear order (VLM spots, avatar spots, decor). */
const wornItems = (snapshot: GameSnapshot): CosmeticItem[] => {
  const equipped: EquippedCosmetics = equippedOf(snapshot);
  const items: CosmeticItem[] = [];
  for (const id of equippedIds(equipped)) {
    const item = cosmeticById(id);
    if (item) items.push(item);
  }
  return items;
};

export class EquippedCosmeticsApplier {
  private readonly worn = new Map<string, Worn>();

  constructor(private readonly world: WorldPublicApi) {}

  // No redraw request here: equipping while the shop dialog is open would pay one full 3D render per swap (shop:143 times out on tablet-portrait); the card flips immediately and the scene refreshes when the dialog closes.
  apply(snapshot: GameSnapshot): void {
    const wanted = new Map(wornItems(snapshot).map((item) => [item.id, item]));
    for (const [id, current] of [...this.worn]) {
      if (wanted.get(id) === current.item) continue;
      this.detach(id, current);
    }
    for (const item of wanted.values()) {
      if (!this.worn.has(item.id)) this.attach(item);
    }
  }

  /** The mesh of a worn item (tests and the debug hook read the scene through it). */
  meshOf(itemId: string): Mesh | undefined {
    return this.worn.get(itemId)?.mesh;
  }

  private mount(item: CosmeticItem): { parent: Object3D; at: AnchorPoint } {
    if (item.anchor === 'ground') {
      const [x, z] = item.spot ?? VILLAGE_DECOR_SLOT.position;
      return { parent: this.world.scene, at: [x, 0, z] };
    }
    const anchors: CharacterAnchors = item.slot === 'vlm-outfit' ? GUIDE_ANCHORS : PLAYER_ANCHORS;
    const parent = item.slot === 'vlm-outfit' ? this.world.milo : this.world.player;
    return { parent, at: anchors[item.anchor] };
  }

  private attach(item: CosmeticItem): void {
    const { parent, at } = this.mount(item);
    const mesh = partsMesh(`cosmetic:${item.id}`, item.buildParts());
    mesh.position.set(...at);
    if (parent === this.world.scene) mesh.rotation.y = VILLAGE_DECOR_SLOT.facing;
    mesh.userData.cosmeticSlot = item.slot;
    parent.add(mesh);
    let obstacle: ObstacleCircle | undefined;
    if (item.anchor === 'ground') {
      obstacle = { x: at[0], z: at[2], radius: DECOR_RADIUS };
      this.world.obstacles.push(obstacle);
    }
    this.worn.set(item.id, { item, mesh, obstacle });
  }

  private detach(id: string, worn: Worn): void {
    worn.mesh.removeFromParent();
    worn.mesh.geometry.dispose();
    if (worn.obstacle) {
      const index = this.world.obstacles.indexOf(worn.obstacle);
      if (index >= 0) this.world.obstacles.splice(index, 1);
    }
    this.worn.delete(id);
  }
}
