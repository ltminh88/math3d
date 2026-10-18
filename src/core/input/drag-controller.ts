import type { Camera } from 'three';
import { type DropZone, findSnapZone } from './drop-zone';
import type { GroundPoint, InteractionEvent } from './interaction-types';
import type { PointerEventInfo } from './pointer-input';
import { projectToGround, type RaycastPicker } from './raycast-picker';

export interface DragConfig {
  camera: Camera;
  picker: RaycastPicker;
  getZones: () => readonly DropZone[];
  getPlaneY: () => number;
  getSnapRadius: () => number;
  canDrag: (itemId: string) => boolean;
  emit: (event: InteractionEvent) => void;
  /** A press that never moved: itemId is the pressed pickable (if any), ground the tap point. */
  onTap: (tap: { itemId: string | null; ground: GroundPoint | null }) => void;
  /** Pointer travel (CSS px) that turns a press into a drag. */
  slopPx?: number;
}

type State =
  | { kind: 'idle' }
  | { kind: 'pressed'; itemId: string | null; x: number; y: number }
  | { kind: 'dragging'; itemId: string };

/** Press -> (tap | drag). Pointer capture lives in PointerInput; pointercancel aborts the drag. */
export class DragController {
  private state: State = { kind: 'idle' };

  constructor(private readonly config: DragConfig) {}

  handle(info: PointerEventInfo): void {
    switch (info.phase) {
      case 'down':
        this.onDown(info);
        break;
      case 'move':
        this.onMove(info);
        break;
      case 'up':
        this.onUp(info);
        break;
      case 'cancel':
        this.onCancel();
        break;
    }
  }

  private ground(info: PointerEventInfo): GroundPoint | null {
    return projectToGround(info.ndc, this.config.camera, this.config.getPlaneY());
  }

  private onDown(info: PointerEventInfo): void {
    const hit = this.config.picker.pick(info.ndc, this.config.camera);
    const itemId = hit !== null && this.config.canDrag(hit) ? hit : null;
    this.state = { kind: 'pressed', itemId, x: info.clientX, y: info.clientY };
  }

  private onMove(info: PointerEventInfo): void {
    const state = this.state;
    if (state.kind === 'pressed') {
      const slop = this.config.slopPx ?? 10;
      if (Math.hypot(info.clientX - state.x, info.clientY - state.y) < slop) return;
      if (state.itemId === null) {
        this.state = { kind: 'idle' };
        return;
      }
      this.state = { kind: 'dragging', itemId: state.itemId };
      this.config.emit({ type: 'pick', itemId: state.itemId, source: 'drag' });
      this.emitMove(state.itemId, info);
    } else if (state.kind === 'dragging') {
      this.emitMove(state.itemId, info);
    }
  }

  private emitMove(itemId: string, info: PointerEventInfo): void {
    const position = this.ground(info);
    if (!position) return;
    const zone = findSnapZone(
      this.config.getZones(),
      position,
      itemId,
      this.config.getSnapRadius(),
    );
    this.config.emit({ type: 'drag-move', itemId, position, zoneId: zone?.id ?? null });
  }

  private onUp(info: PointerEventInfo): void {
    const state = this.state;
    this.state = { kind: 'idle' };
    if (state.kind === 'pressed') {
      this.config.onTap({ itemId: state.itemId, ground: this.ground(info) });
    } else if (state.kind === 'dragging') {
      const position = this.ground(info);
      const zone = position
        ? findSnapZone(this.config.getZones(), position, state.itemId, this.config.getSnapRadius())
        : null;
      this.config.emit({
        type: 'drop',
        itemId: state.itemId,
        zoneId: zone?.id ?? null,
        position,
        source: 'drag',
      });
    }
  }

  private onCancel(): void {
    const state = this.state;
    this.state = { kind: 'idle' };
    if (state.kind === 'dragging') this.config.emit({ type: 'cancel', itemId: state.itemId });
  }

  reset(): void {
    this.state = { kind: 'idle' };
  }
}
