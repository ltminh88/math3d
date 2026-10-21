// Keeps the world in step with the store: one mesh per filled slot, attached to VLM, the player
// or the village decor slot. A slot whose item changed drops its old mesh (geometry disposed;
// the shared material stays), so equip/unequip cycles never leak GPU geometry. Nothing is built
// while nothing is equipped, so the world is untouched then.
import type { Mesh, Object3D } from 'three';
import { VILLAGE_DECOR_SLOT } from '../config/regions';
import type { GameSnapshot } from '../store/progress-repository';
import {
  type AnchorPoint,
  type CharacterAnchors,
  GUIDE_ANCHORS,
  PLAYER_ANCHORS,
} from '../world/characters-milo-avatar';
import type { ObstacleCircle } from '../world/world-build-context';
import type { WorldPublicApi } from '../world/world-public-api';
import { COSMETIC_SLOTS, type CosmeticItem, type CosmeticSlot } from './cosmetic-catalog';
import { equippedItem } from './shop-purchase-flow';
import { partsMesh } from './vertex-color-parts';

/** Collision circle of a placed decoration (all fit inside it). */
const DECOR_RADIUS = 1.1;

interface Worn {
  readonly item: CosmeticItem;
  readonly mesh: Mesh;
  readonly obstacle?: ObstacleCircle;
}

export class EquippedCosmeticsApplier {
  private readonly worn = new Map<CosmeticSlot, Worn>();

  constructor(private readonly world: WorldPublicApi) {}

  apply(snapshot: GameSnapshot): void {
    for (const slot of COSMETIC_SLOTS) {
      const item = equippedItem(snapshot, slot);
      const current = this.worn.get(slot);
      if (current?.item === item) continue;
      if (current) this.detach(slot, current);
      if (item) this.attach(slot, item);
    }
  }

  /** The mesh worn in `slot` (tests and the debug hook read the scene through it). */
  meshIn(slot: CosmeticSlot): Mesh | undefined {
    return this.worn.get(slot)?.mesh;
  }

  private mount(slot: CosmeticSlot, item: CosmeticItem): { parent: Object3D; at: AnchorPoint } {
    if (slot === 'village-decor' || item.anchor === 'ground') {
      const [x, z] = VILLAGE_DECOR_SLOT.position;
      return { parent: this.world.scene, at: [x, 0, z] };
    }
    const anchors: CharacterAnchors = slot === 'vlm-outfit' ? GUIDE_ANCHORS : PLAYER_ANCHORS;
    const parent = slot === 'vlm-outfit' ? this.world.milo : this.world.player;
    return { parent, at: anchors[item.anchor] };
  }

  private attach(slot: CosmeticSlot, item: CosmeticItem): void {
    const { parent, at } = this.mount(slot, item);
    const mesh = partsMesh(`cosmetic:${item.id}`, item.buildParts());
    mesh.position.set(...at);
    if (parent === this.world.scene) mesh.rotation.y = VILLAGE_DECOR_SLOT.facing;
    mesh.userData.cosmeticSlot = slot;
    parent.add(mesh);
    let obstacle: ObstacleCircle | undefined;
    if (slot === 'village-decor') {
      obstacle = { x: at[0], z: at[2], radius: DECOR_RADIUS };
      this.world.obstacles.push(obstacle);
    }
    this.worn.set(slot, { item, mesh, obstacle });
  }

  private detach(slot: CosmeticSlot, worn: Worn): void {
    worn.mesh.removeFromParent();
    worn.mesh.geometry.dispose();
    if (worn.obstacle) {
      const index = this.world.obstacles.indexOf(worn.obstacle);
      if (index >= 0) this.world.obstacles.splice(index, 1);
    }
    this.worn.delete(slot);
  }
}
