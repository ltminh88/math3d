// Shared by the city and tower leak specs: the world's renderer memory once its camera has
// settled. On the phone the follow camera keeps bringing world objects into view (uploaded on
// first sight) for many frames after a teleport, which is not a level leak. Counted in frames,
// since SwiftShader under load draws slowly.
import type { Page } from '@playwright/test';

export interface RendererMemory {
  geometries: number;
  textures: number;
}

export const rendererMemory = (page: Page): Promise<RendererMemory> =>
  page.evaluate(() => window.__game?.memory() ?? { geometries: -1, textures: -1 });

/** Memory after 40 frames, read until it holds for four reads in a row. */
export async function settledMemory(page: Page): Promise<RendererMemory> {
  const afterFrames = () =>
    page.evaluate(
      () =>
        new Promise<RendererMemory>((resolve) => {
          let left = 40;
          const tick = () => {
            left -= 1;
            if (left > 0) requestAnimationFrame(tick);
            else resolve(window.__game?.memory() ?? { geometries: -1, textures: -1 });
          };
          requestAnimationFrame(tick);
        }),
    );
  const same = (a: RendererMemory, b: RendererMemory) =>
    a.geometries === b.geometries && a.textures === b.textures;
  let last = await afterFrames();
  for (let stable = 0, i = 0; stable < 4 && i < 40; i++) {
    const now = await afterFrames();
    stable = same(now, last) ? stable + 1 : 0;
    last = now;
  }
  return last;
}
