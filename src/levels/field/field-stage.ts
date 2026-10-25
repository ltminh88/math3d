// Scene, lights and camera of the field level, tuned like the world (sky horizon colour, fog,
// hemisphere fill + shadow-casting sun). The renderer's global state is never touched: the sky is
// the scene background. The camera frames the plot as large as the canvas area the HUD leaves
// free allows (measured, so phone cells stay finger-sized; QA M-5).
import {
  Box3,
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  Vector3,
} from 'three';
import { SKY_HORIZON_COLOR } from '../../config/world-constants';
import { WORLD_LIGHTING } from '../../world/world-lighting-tuning';

const FOV = 40;
const ELEVATION = (54 * Math.PI) / 180;
/** Phones (portrait or short landscape) look down more steeply: rows as far apart as cells. */
const STEEP_ELEVATION = (70 * Math.PI) / 180;
/** Gap kept between the framed plot and the canvas edges or the HUD (CSS px). */
const EDGE_PX = 12;
/** Room under the plot's front edge for the equation label hanging below it (CSS px). */
const LABEL_PX = 56;

/** Canvas size and the CSS px the HUD covers on each side (measured from the DOM). */
export interface FieldViewport {
  width: number;
  height: number;
  top: number;
  bottom: number;
  right: number;
}

export interface FieldStage {
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  /**
   * Frames `box` as large as the free canvas allows. A plot (`plot`) keeps room below it for its
   * equation label and is seen more steeply on phones; the celebration's meadow is not.
   */
  fit(view: FieldViewport, box: Box3, plot: boolean): void;
  /** Frees the sun's shadow map (a render target the scene disposer never reaches; QA M-3). */
  dispose(): void;
}

/** A plot's bounding box: cells, row stakes + basket on the left/front, flowers up to ~1 u. */
export const plotBox = (x: number, z: number): Box3 =>
  new Box3(new Vector3(-x - 1.2, 0, -z - 0.4), new Vector3(x + 0.4, 1, z + 1.3));

export function createFieldStage(lowPower: boolean): FieldStage {
  const scene = new Scene();
  scene.background = new Color(SKY_HORIZON_COLOR);
  scene.fog = new Fog(SKY_HORIZON_COLOR, 40, 90);
  scene.add(
    new HemisphereLight(
      WORLD_LIGHTING.hemisphereSky,
      WORLD_LIGHTING.hemisphereGround,
      WORLD_LIGHTING.hemisphereIntensity,
    ),
  );
  const sun = new DirectionalLight(WORLD_LIGHTING.sunColor, WORLD_LIGHTING.sunIntensity);
  sun.position.set(-10, 18, 9);
  sun.castShadow = true;
  const size = lowPower ? 512 : 1024;
  sun.shadow.mapSize.set(size, size);
  sun.shadow.normalBias = 0.045;
  sun.shadow.bias = -0.0003;
  sun.shadow.radius = WORLD_LIGHTING.shadowRadius;
  Object.assign(sun.shadow.camera, {
    left: -17,
    right: 17,
    top: 17,
    bottom: -17,
    near: 1,
    far: 60,
  });
  sun.shadow.camera.updateProjectionMatrix();
  scene.add(sun, sun.target);
  const camera = new PerspectiveCamera(FOV, 1, 0.5, 120);
  const corner = new Vector3();

  let elevation = ELEVATION;
  const place = (target: Vector3, distance: number) => {
    camera.position.set(
      target.x,
      target.y + Math.sin(elevation) * distance,
      target.z + Math.cos(elevation) * distance,
    );
    camera.lookAt(target);
    camera.updateMatrixWorld();
  };

  return {
    scene,
    camera,
    fit(view, box, plot) {
      const { width, height } = view;
      if (width <= 0 || height <= 0) return;
      const free = {
        left: EDGE_PX,
        right: Math.max(width - view.right - EDGE_PX, width * 0.4),
        top: view.top + EDGE_PX,
        bottom: Math.max(
          height - view.bottom - EDGE_PX - (plot ? LABEL_PX : 0),
          view.top + height * 0.25,
        ),
      };
      camera.aspect = width / height;
      const phone = width <= height * 1.05 || height < 500;
      elevation = plot && phone ? STEEP_ELEVATION : ELEVATION;
      const centerX = (free.left + free.right) / 2;
      const centerY = (free.top + free.bottom) / 2;
      camera.setViewOffset(width, height, width / 2 - centerX, height / 2 - centerY, width, height);
      camera.updateProjectionMatrix();
      const target = box.getCenter(new Vector3());
      const fits = (distance: number): boolean => {
        place(target, distance);
        for (let i = 0; i < 8; i++) {
          corner.set(
            i & 1 ? box.max.x : box.min.x,
            i & 2 ? box.max.y : box.min.y,
            i & 4 ? box.max.z : box.min.z,
          );
          const p = corner.project(camera);
          const x = ((p.x + 1) / 2) * width;
          const y = ((1 - p.y) / 2) * height;
          if (x < free.left || x > free.right || y < free.top || y > free.bottom) return false;
        }
        return true;
      };
      // Closest camera that still shows the whole box (the fit only loosens with distance).
      let near = 4;
      let far = 120;
      for (let i = 0; i < 28; i++) {
        const mid = (near + far) / 2;
        if (fits(mid)) far = mid;
        else near = mid;
      }
      place(target, far);
    },
    dispose: () => sun.shadow.dispose(),
  };
}

/** What the HUD covers of the canvas: speech line on top, panel below (portrait) or right. */
export function measureFieldViewport(
  canvas: HTMLElement,
  hud: { speech: HTMLElement; panel: HTMLElement },
  width: number,
  height: number,
): FieldViewport {
  const area = canvas.getBoundingClientRect();
  const speech = hud.speech.getBoundingClientRect();
  const panel = hud.panel.getBoundingClientRect();
  const below = panel.width > area.width * 0.6;
  return {
    width,
    height,
    top: Math.max(0, speech.bottom - area.top),
    bottom: below ? Math.max(0, area.bottom - panel.top) : 0,
    right: below ? 0 : Math.max(0, area.right - panel.left),
  };
}
