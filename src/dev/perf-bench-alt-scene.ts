import { AmbientLight, BoxGeometry, DataTexture, Mesh, MeshBasicMaterial } from 'three';
import { fitCamera } from '../core/camera-fit';
import type { GameScene } from '../core/game-scene-contract';

/**
 * Throwaway scene whose geometry, material AND texture are all per-scene one-offs. Round trips
 * between this and the bench scene prove the disposer returns renderer.info.memory to baseline.
 */
export function createBenchAltScene(): GameScene {
  let cube: Mesh | null = null;
  return {
    id: 'alt',
    init(ctx) {
      const texture = new DataTexture(new Uint8Array([255, 200, 100, 255]), 1, 1);
      texture.needsUpdate = true;
      cube = new Mesh(new BoxGeometry(2, 2, 2), new MeshBasicMaterial({ map: texture }));
      ctx.scene.add(ctx.disposer.track(cube), ctx.disposer.track(new AmbientLight(0xffffff, 1)));
      const refit = (w: number, h: number) =>
        fitCamera(ctx.camera, { width: 4, depth: 4, height: 2 }, w / h);
      refit(ctx.renderer.domElement.clientWidth || 1, ctx.renderer.domElement.clientHeight || 1);
      ctx.onResize(refit);
    },
    update(dt) {
      if (!cube) return false;
      cube.rotation.y += dt;
      return true;
    },
    dispose() {
      cube = null;
    },
  };
}
