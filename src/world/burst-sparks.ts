// Celebration sparks: 20 small spheres flung upwards that fall, shrink and vanish after 1.2 s.
// Velocities use Math.random (seeded in parity runs), so the draw order is kept exactly.
import { type Mesh, type Scene, Vector3 } from 'three';
import type { WorldBuildContext } from './world-build-context';
import { addSphere, colorAt } from './world-primitives';

const SPARK_COLORS: readonly number[] = [0xffd164, 0xfff4c7, 0x7dd4b5];

export interface Spark {
  mesh: Mesh;
  life: number;
  velocity: Vector3;
}

export function spawnSparkBurst(ctx: WorldBuildContext, sparks: Spark[], at: Vector3): void {
  for (let index = 0; index < 20; index++) {
    const color = colorAt(SPARK_COLORS, index % 3);
    const mesh = addSphere(ctx, ctx.scene, at.x, at.y, at.z, 0.09, color);
    mesh.castShadow = false;
    sparks.push({
      mesh,
      life: 1.2,
      velocity: new Vector3(
        (Math.random() - 0.5) * 5,
        3 + Math.random() * 3,
        (Math.random() - 0.5) * 5,
      ),
    });
  }
}

/** Moves every spark by `dt`; dead ones leave the scene and free their geometry. */
export function updateSparks(scene: Scene, sparks: Spark[], dt: number): void {
  for (let index = sparks.length - 1; index >= 0; index--) {
    const spark = sparks[index];
    if (!spark) continue;
    spark.life -= dt;
    spark.velocity.y -= dt * 6;
    spark.mesh.position.addScaledVector(spark.velocity, dt);
    spark.mesh.scale.setScalar(Math.max(0, spark.life));
    if (spark.life <= 0) {
      scene.remove(spark.mesh);
      spark.mesh.geometry.dispose();
      sparks.splice(index, 1);
    }
  }
}
