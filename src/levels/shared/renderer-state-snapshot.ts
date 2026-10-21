// The renderer is the world's: a level that changes its global state (clear colour, tone mapping,
// shadows, pixel ratio, render target, viewport...) must not leak it into the world after exit.
// The host snapshots that state on enter and puts it back on exit, as a safety net; levels should
// still leave the renderer alone (see LevelContext.renderer).
import { Color, Vector4, type WebGLRenderer } from 'three';

/** Captures the renderer's global state now; the returned function restores it. */
export function saveRendererState(renderer: WebGLRenderer): () => void {
  const clearColor = renderer.getClearColor(new Color());
  const clearAlpha = renderer.getClearAlpha();
  const { autoClear, toneMapping, toneMappingExposure, outputColorSpace, localClippingEnabled } =
    renderer;
  const { enabled: shadows, type: shadowType, autoUpdate: shadowAutoUpdate } = renderer.shadowMap;
  const pixelRatio = renderer.getPixelRatio();
  const target = renderer.getRenderTarget();
  const viewport = renderer.getViewport(new Vector4());
  const scissor = renderer.getScissor(new Vector4());
  const scissorTest = renderer.getScissorTest();
  return () => {
    renderer.setRenderTarget(target);
    renderer.setClearColor(clearColor, clearAlpha);
    Object.assign(renderer, {
      autoClear,
      toneMapping,
      toneMappingExposure,
      outputColorSpace,
      localClippingEnabled,
    });
    Object.assign(renderer.shadowMap, {
      enabled: shadows,
      type: shadowType,
      autoUpdate: shadowAutoUpdate,
    });
    // setPixelRatio resizes the drawing buffer: only when a level actually changed it.
    if (renderer.getPixelRatio() !== pixelRatio) renderer.setPixelRatio(pixelRatio);
    renderer.setViewport(viewport);
    renderer.setScissor(scissor);
    renderer.setScissorTest(scissorTest);
  };
}
