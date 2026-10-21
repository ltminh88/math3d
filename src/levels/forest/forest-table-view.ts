// The sharing table in 3D: which friends stand where, the fruit and baskets for a sharing state,
// the drop zones that go with it and the count chips. Owns no rules (see sharing-model.ts).
import type { Group, Material, Mesh } from 'three';
import type { DropZone } from '../../core/input/drop-zone';
import type { GroundPoint } from '../../core/input/interaction-types';
import { type AnimalKind, createAnimalFriend } from './animal-friend-factory';
import type { CountLabel } from './forest-count-labels';
import {
  animalPosition,
  fruitPositions,
  groupCenter,
  PACK_BEAR,
  PILE_CENTER,
} from './forest-layout';
import { ANIMAL_NAME_KEYS, type ForestStrings } from './forest-strings';
import { ForestProps, fruitIndexOf } from './fruit-pile';
import { canMove, countsOf, type SharingState, type Spot, visibleGroups } from './sharing-model';

export type TableKind = 'share' | 'pack';

export const zoneSpot = (zoneId: string): Spot =>
  zoneId === 'pile' ? 'pile' : Number(zoneId.slice('group:'.length));

export class ForestTableView {
  readonly props: ForestProps;
  private readonly animals = new Map<AnimalKind, Mesh>();
  private kind: TableKind = 'share';
  private hop = 0;

  constructor(
    root: Group,
    material: Material,
    private readonly ts: ForestStrings,
    private readonly reducedMotion: boolean,
  ) {
    this.props = new ForestProps(root, reducedMotion);
    for (const kind of ANIMAL_NAME_KEYS) {
      const mesh = createAnimalFriend(kind, material);
      mesh.visible = false;
      this.animals.set(kind, mesh);
      root.add(mesh);
    }
  }

  /** Friends taking part: the first `groups` friends when sharing, Bear alone when packing. */
  private placeAnimals(kind: TableKind, groups: number): void {
    for (const mesh of this.animals.values()) mesh.visible = false;
    if (kind === 'pack') {
      const bear = this.animals.get('bear');
      if (bear) Object.assign(bear, { visible: true }).position.set(PACK_BEAR.x, 0, PACK_BEAR.z);
      return;
    }
    ANIMAL_NAME_KEYS.slice(0, groups).forEach((name, i) => {
      const mesh = this.animals.get(name);
      if (!mesh) return;
      const at = animalPosition(groupCenter('share', i, groups));
      mesh.visible = true;
      mesh.position.set(at.x, 0, at.z);
    });
  }

  /** Half-width of the scene the camera must show for this table. */
  extent(kind: TableKind, groups: number): number {
    return kind === 'pack' ? 5.8 : Math.max(3.2, ((groups - 1) / 2) * 2.3 + 1.2);
  }

  /** Lays out a round's table; `snap` places fruit at once (new round). */
  show(kind: TableKind, state: SharingState, snap: boolean, withFruit = true): void {
    this.kind = kind;
    this.placeAnimals(kind, kind === 'share' ? state.groups : 1);
    this.props.setFruit(withFruit ? fruitPositions(kind, state.spots, state.groups) : [], snap);
    this.props.setBaskets(kind === 'pack' ? visibleGroups(state) : 0, state.groups);
  }

  zones(state: SharingState): DropZone[] {
    const accepts = (spot: Spot) => (itemId: string) => canMove(state, fruitIndexOf(itemId), spot);
    const groups: DropZone[] = Array.from({ length: visibleGroups(state) }, (_, i) => ({
      id: `group:${i}`,
      center: groupCenter(this.kind, i, state.groups),
      shape: { kind: 'circle', radius: this.kind === 'share' ? 0.95 : 0.6 },
      accepts: accepts(i),
    }));
    return [
      ...groups,
      {
        id: 'pile',
        center: PILE_CENTER,
        shape: { kind: 'circle', radius: 1.1 },
        accepts: accepts('pile'),
      },
    ];
  }

  zoneCenter(zoneId: string, state: SharingState): GroundPoint {
    const spot = zoneSpot(zoneId);
    return spot === 'pile' ? PILE_CENTER : groupCenter(this.kind, spot, state.groups);
  }

  labels(state: SharingState): CountLabel[] {
    const counts = countsOf(state);
    return counts.slice(0, visibleGroups(state)).map((count, i) => {
      const center = groupCenter(this.kind, i, state.groups);
      const name = ANIMAL_NAME_KEYS[i] ?? 'bear';
      const ariaLabel =
        this.kind === 'share'
          ? this.ts('animalCount', { name: this.ts(name), count })
          : this.ts('basketCount', { n: i + 1, count });
      const anchor = this.kind === 'share' ? animalPosition(center) : center;
      return { anchor, height: this.kind === 'share' ? 2 : 1.1, text: String(count), ariaLabel };
    });
  }

  /** Friends hop for joy (no motion when reduced motion is on). */
  celebrate(): void {
    this.hop = this.reducedMotion ? 0 : 1;
  }

  update(dt: number, time: number): void {
    this.props.update(dt);
    if (this.hop <= 0) return;
    let i = 0;
    for (const mesh of this.animals.values()) {
      if (mesh.visible) mesh.position.y = Math.abs(Math.sin(time * 6 + i)) * 0.35;
      i += 1;
    }
  }
}
