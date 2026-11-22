// Shared level zoom (phase 25, issue #46): two-finger pinch, mouse wheel, and in-level
// +/− buttons scale the camera distance around the level's auto-fit distance. One finger
// is never touched: taps and drags belong to the level's own input, and a pinch that
// starts mid-drag cancels that drag through onPinchStart (so a pinch can never drop
// an item into a zone by accident).
export const MIN_ZOOM = 0.6;
export const MAX_ZOOM = 1.6;
export const ZOOM_BUTTON_STEP = 1.25;

/** Zoom factor: 1 is the auto-fit distance, below 1 is closer, above 1 is further. */
export const clampZoomFactor = (factor: number): number =>
  Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, factor));

/** Pinch ratio → factor: fingers apart zooms in (factor down), together zooms out. */
export const pinchZoomFactor = (
  startFactor: number,
  startDistance: number,
  currentDistance: number,
): number => clampZoomFactor((startFactor * startDistance) / currentDistance);

/** Wheel: scroll up zooms in, scroll down zooms out (same sense as the world map). */
export const wheelZoomFactor = (factor: number, deltaY: number): number =>
  clampZoomFactor(factor * Math.exp(deltaY * 0.001));

export const buttonZoomFactor = (factor: number, direction: 'in' | 'out'): number =>
  clampZoomFactor(factor * (direction === 'in' ? 1 / ZOOM_BUTTON_STEP : ZOOM_BUTTON_STEP));

export class LevelZoom {
  private factorValue = 1;
  private pinch: { startDistance: number; startFactor: number } | null = null;

  constructor(private readonly onChange?: (factor: number) => void) {}

  get factor(): number {
    return this.factorValue;
  }

  /** Back to the auto-fit distance (a new round starts unzoomed). */
  reset(): void {
    this.pinch = null;
    this.setFactor(1);
  }

  beginPinch(distance: number): void {
    this.pinch = { startDistance: distance, startFactor: this.factorValue };
  }

  movePinch(distance: number): void {
    if (!this.pinch) return;
    this.setFactor(pinchZoomFactor(this.pinch.startFactor, this.pinch.startDistance, distance));
  }

  endPinch(): void {
    this.pinch = null;
  }

  wheel(deltaY: number): void {
    this.setFactor(wheelZoomFactor(this.factorValue, deltaY));
  }

  step(direction: 'in' | 'out'): void {
    this.setFactor(buttonZoomFactor(this.factorValue, direction));
  }

  private setFactor(factor: number): void {
    const next = clampZoomFactor(factor);
    if (next === this.factorValue) return;
    this.factorValue = next;
    this.onChange?.(next);
  }
}

export interface LevelZoomOptions {
  /** Buttons live here (the level's overlay root). Defaults to the canvas parent. */
  container?: HTMLElement;
  /** Called with the new factor whenever it changes. */
  onFactor: (factor: number) => void;
  /** A pinch just started (a second finger went down): cancel any in-progress drag. */
  onPinchStart?: () => void;
  zoomInLabel?: string;
  zoomOutLabel?: string;
}

export interface LevelZoomHandle {
  readonly zoom: LevelZoom;
  dispose(): void;
}

/**
 * Wires pinch + wheel on the canvas and +/− buttons in the overlay. Only the second
 * finger activates the pinch; single-pointer input is left entirely alone.
 */
export function attachLevelZoom(canvas: HTMLElement, options: LevelZoomOptions): LevelZoomHandle {
  const group = document.createElement('div');
  group.className = 'level-zoom';
  const makeButton = (label: string, text: string, className: string): HTMLButtonElement => {
    const node = document.createElement('button');
    node.type = 'button';
    node.className = `level-zoom__button ${className}`;
    node.textContent = text;
    node.setAttribute('aria-label', label);
    return node;
  };
  const zoomIn = makeButton(options.zoomInLabel ?? 'Phóng to', '+', 'level-zoom__in');
  const zoomOut = makeButton(options.zoomOutLabel ?? 'Thu nhỏ', '−', 'level-zoom__out');
  group.append(zoomIn, zoomOut);
  (options.container ?? canvas.parentElement ?? document.body).append(group);

  const updateButtons = (factor: number): void => {
    zoomIn.disabled = factor <= MIN_ZOOM;
    zoomOut.disabled = factor >= MAX_ZOOM;
  };
  const zoom = new LevelZoom((factor) => {
    updateButtons(factor);
    options.onFactor(factor);
  });
  updateButtons(zoom.factor);

  const pointers = new Map<number, { x: number; y: number }>();
  const abort = new AbortController();
  const signal = { signal: abort.signal };
  const pinchDistance = (): number => {
    const points = [...pointers.values()];
    const a = points[0];
    const b = points[1];
    if (!a || !b) return 0;
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  canvas.addEventListener(
    'pointerdown',
    (event) => {
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 2) {
        zoom.beginPinch(pinchDistance());
        options.onPinchStart?.();
        try {
          canvas.setPointerCapture(event.pointerId);
        } catch {
          // Synthetic or already-released pointers; the stream still works.
        }
      }
    },
    signal,
  );
  canvas.addEventListener(
    'pointermove',
    (event) => {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 2) zoom.movePinch(pinchDistance());
    },
    signal,
  );
  const endPointer = (event: PointerEvent): void => {
    if (!pointers.has(event.pointerId)) return;
    pointers.delete(event.pointerId);
    if (pointers.size < 2) zoom.endPinch();
  };
  canvas.addEventListener('pointerup', endPointer, signal);
  canvas.addEventListener('pointercancel', endPointer, signal);
  canvas.addEventListener('lostpointercapture', endPointer, signal);
  canvas.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      zoom.wheel(event.deltaY);
    },
    { ...signal, passive: false },
  );
  zoomIn.addEventListener('click', () => zoom.step('in'), signal);
  zoomOut.addEventListener('click', () => zoom.step('out'), signal);

  return {
    zoom,
    dispose(): void {
      abort.abort();
      group.remove();
    },
  };
}
