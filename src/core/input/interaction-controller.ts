import type { Camera } from 'three';
import { DragController } from './drag-controller';
import { type DropZone, findSnapZone, MIN_SNAP_RADIUS } from './drop-zone';
import type { InteractionEvent } from './interaction-types';
import { shouldIgnoreSceneKey } from './keyboard-target-guard';
import type { PointerInput } from './pointer-input';
import { type Pickable, RaycastPicker } from './raycast-picker';
import { TapSelectController } from './tap-select-controller';
import { TypedEmitter } from './typed-emitter';

/**
 * Facade a scene talks to: register pickables + drop zones, listen to uniform events.
 * Drag, tap-select and keyboard all produce the same drop/pick vocabulary.
 */
export class InteractionController {
  readonly events = new TypedEmitter<InteractionEvent>();
  private readonly picker = new RaycastPicker();
  private readonly tapSelect: TapSelectController;
  private readonly drag: DragController;
  private zones: readonly DropZone[] = [];
  private pickables: readonly Pickable[] = [];
  private planeY = 0;
  private snapRadius = MIN_SNAP_RADIUS;
  private readonly unsubscribePointer: () => void;
  private readonly abortKeys = new AbortController();

  constructor(input: PointerInput, camera: Camera, keyTarget?: EventTarget) {
    const emit = (event: InteractionEvent) => this.events.emit(event);
    this.tapSelect = new TapSelectController(emit);
    this.drag = new DragController({
      camera,
      picker: this.picker,
      getZones: () => this.zones,
      getPlaneY: () => this.planeY,
      getSnapRadius: () => this.snapRadius,
      canDrag: (id) => this.pickables.some((p) => p.id === id),
      emit,
      onTap: ({ itemId, ground }) => {
        if (itemId !== null) {
          this.tapSelect.tapItem(itemId, 'tap');
          return;
        }
        const selected = this.tapSelect.getSelected();
        if (selected === null || ground === null) return;
        const zone = findSnapZone(this.zones, ground, selected, this.snapRadius);
        this.tapSelect.tapZone(zone?.id ?? null, 'tap');
      },
    });
    this.unsubscribePointer = input.events.on((info) => this.drag.handle(info));
    keyTarget?.addEventListener('keydown', (e) => this.onKey(e as KeyboardEvent, keyTarget), {
      signal: this.abortKeys.signal,
    });
  }

  /**
   * Arrow keys walk 3D targets, Enter/Space pick/drop, Escape cancels. Tab is never consumed and
   * keys aimed at DOM controls (number pad, buttons, inputs) are left to them.
   */
  private onKey(event: KeyboardEvent, keyTarget: EventTarget): void {
    const active = (keyTarget as Partial<Document>).activeElement ?? null;
    if (shouldIgnoreSceneKey(event, active)) return;
    if (this.tapSelect.handleKey(event.key)) event.preventDefault();
  }

  /** Items that can be dragged/selected. Placed items should be removed from this list. */
  setPickables(pickables: readonly Pickable[]): void {
    this.pickables = pickables;
    this.picker.set(pickables);
    this.tapSelect.setTargets(
      pickables.map((p) => p.id),
      this.zones,
    );
  }

  setZones(zones: readonly DropZone[]): void {
    this.zones = zones;
    this.tapSelect.setTargets(
      this.pickables.map((p) => p.id),
      zones,
    );
  }

  setPlaneY(y: number): void {
    this.planeY = y;
  }

  setSnapRadius(radius: number): void {
    this.snapRadius = Math.max(radius, MIN_SNAP_RADIUS);
  }

  /** Called between scenes: forget everything registered by the previous scene. */
  reset(): void {
    this.zones = [];
    this.pickables = [];
    this.picker.clear();
    this.tapSelect.reset();
    this.drag.reset();
    this.planeY = 0;
    this.snapRadius = MIN_SNAP_RADIUS;
  }

  dispose(): void {
    this.unsubscribePointer();
    this.abortKeys.abort();
    this.events.clear();
  }
}
