// Pointer and wheel input on the world canvas: drag orbits the camera, a tap (no drag) walks to
// the tapped ground point, the wheel zooms. Ignored on the title screen and while paused.
import { type PerspectiveCamera, Plane, Raycaster, Vector2, Vector3 } from 'three';
import { clampPitch } from './camera-rig';

/** The world as seen by the pointer handlers. */
export interface WorldInputTarget {
  readonly active: boolean;
  readonly paused: boolean;
  yaw: number;
  pitch: number;
  moveToScreen(clientX: number, clientY: number): void;
  zoom(delta: number): void;
}

interface DragState {
  x: number;
  y: number;
  moved: boolean;
  id: number;
}

/** Wires the canvas listeners (they live as long as the canvas; never detached). */
export function attachWorldInput(canvas: HTMLCanvasElement, world: WorldInputTarget): void {
  let drag: DragState = { x: 0, y: 0, moved: false, id: -1 };
  canvas.addEventListener('pointerdown', (event) => {
    if (!(!world.active || world.paused)) {
      drag = { x: event.clientX, y: event.clientY, moved: false, id: event.pointerId };
      canvas.setPointerCapture(event.pointerId);
    }
  });
  canvas.addEventListener('pointermove', (event) => {
    if (drag.id !== event.pointerId || !world.active || world.paused) {
      return;
    }
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) {
      drag.moved = true;
    }
    world.yaw -= dx * 0.006;
    world.pitch = clampPitch(world.pitch + dy * 0.003);
    drag.x = event.clientX;
    drag.y = event.clientY;
  });
  canvas.addEventListener('pointerup', (event) => {
    if (drag.id === event.pointerId) {
      if (!drag.moved && !world.paused) {
        world.moveToScreen(event.clientX, event.clientY);
      }
      drag.id = -1;
    }
  });
  canvas.addEventListener('pointercancel', () => {
    drag.id = -1;
  });
  canvas.addEventListener(
    'wheel',
    (event) => {
      if (!(!world.active || world.paused)) {
        event.preventDefault();
        world.zoom(event.deltaY * 0.045);
      }
    },
    { passive: false },
  );
}

/** Ground point (y = 0) under a client-space position, or undefined when the ray misses. */
export function groundPointAt(
  canvas: HTMLCanvasElement,
  camera: PerspectiveCamera,
  clientX: number,
  clientY: number,
): Vector3 | undefined {
  const rect = canvas.getBoundingClientRect();
  const ndc = new Vector2(
    ((clientX - rect.left) / rect.width) * 2 - 1,
    (-(clientY - rect.top) / rect.height) * 2 + 1,
  );
  const raycaster = new Raycaster();
  raycaster.setFromCamera(ndc, camera);
  const hit = new Vector3();
  return raycaster.ray.intersectPlane(new Plane(new Vector3(0, 1, 0), 0), hit) ? hit : undefined;
}
