import { TypedEmitter } from './typed-emitter';

export type PointerPhase = 'down' | 'move' | 'up' | 'cancel';

export interface PointerEventInfo {
  phase: PointerPhase;
  pointerId: number;
  pointerType: string;
  clientX: number;
  clientY: number;
  /** Normalized device coordinates (-1..1, y up) relative to the target element. */
  ndc: { x: number; y: number };
}

export function clientToNdc(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
): { x: number; y: number } {
  if (rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 };
  return {
    x: ((clientX - rect.left) / rect.width) * 2 - 1,
    y: -(((clientY - rect.top) / rect.height) * 2 - 1),
  };
}

/**
 * Unified pointer stream for mouse/touch/pen. Only the primary pointer is tracked, so a second
 * finger never hijacks a drag. Mouse hover moves are forwarded; touch/pen moves only while pressed.
 */
export class PointerInput {
  readonly events = new TypedEmitter<PointerEventInfo>();
  private activeId: number | null = null;
  private readonly abort = new AbortController();

  constructor(private readonly target: HTMLElement) {
    target.style.touchAction = 'none';
    const options = { signal: this.abort.signal };
    target.addEventListener('pointerdown', (e) => this.onDown(e), options);
    target.addEventListener('pointermove', (e) => this.onMove(e), options);
    target.addEventListener('pointerup', (e) => this.onEnd(e, 'up'), options);
    target.addEventListener('pointercancel', (e) => this.onEnd(e, 'cancel'), options);
    // Capture lost without up/cancel (element removed, iOS system gesture): end the stream.
    target.addEventListener('lostpointercapture', (e) => this.onEnd(e, 'cancel'), options);
  }

  private info(e: PointerEvent, phase: PointerPhase): PointerEventInfo {
    return {
      phase,
      pointerId: e.pointerId,
      pointerType: e.pointerType,
      clientX: e.clientX,
      clientY: e.clientY,
      ndc: clientToNdc(e.clientX, e.clientY, this.target.getBoundingClientRect()),
    };
  }

  private onDown(e: PointerEvent): void {
    if (!e.isPrimary || this.activeId !== null) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    this.activeId = e.pointerId;
    try {
      this.target.setPointerCapture(e.pointerId);
    } catch {
      // Capture can fail for synthetic or already-released pointers; the stream still works.
    }
    this.events.emit(this.info(e, 'down'));
  }

  private onMove(e: PointerEvent): void {
    if (!e.isPrimary) return;
    if (this.activeId === e.pointerId || (this.activeId === null && e.pointerType === 'mouse')) {
      this.events.emit(this.info(e, 'move'));
    }
  }

  private onEnd(e: PointerEvent, phase: 'up' | 'cancel'): void {
    if (this.activeId !== e.pointerId) return;
    this.activeId = null;
    this.events.emit(this.info(e, phase));
  }

  /** Forget the active pointer (between scenes) so a stuck stream can never block new presses. */
  reset(): void {
    if (this.activeId === null) return;
    try {
      if (this.target.hasPointerCapture(this.activeId)) {
        this.target.releasePointerCapture(this.activeId);
      }
    } catch {
      // Already released.
    }
    this.activeId = null;
  }

  dispose(): void {
    this.abort.abort();
    this.events.clear();
  }
}
