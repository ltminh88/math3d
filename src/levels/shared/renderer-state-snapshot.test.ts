import { ACESFilmicToneMapping, Color, NoToneMapping, Vector4, type WebGLRenderer } from 'three';
import { describe, expect, it } from 'vitest';
import { saveRendererState } from './renderer-state-snapshot';

/** The slice of WebGLRenderer the snapshot touches, backed by plain fields (no WebGL in node). */
function fakeRenderer() {
  const state = {
    clearColor: new Color(0x88ccff),
    clearAlpha: 1,
    pixelRatio: 1.75,
    target: null as unknown,
    viewport: new Vector4(0, 0, 800, 600),
    scissor: new Vector4(0, 0, 800, 600),
    scissorTest: false,
    pixelRatioCalls: 0,
  };
  const renderer = {
    autoClear: true,
    toneMapping: ACESFilmicToneMapping,
    toneMappingExposure: 1.1,
    outputColorSpace: 'srgb',
    localClippingEnabled: false,
    shadowMap: { enabled: true, type: 1, autoUpdate: true },
    getClearColor: (c: Color) => c.copy(state.clearColor),
    getClearAlpha: () => state.clearAlpha,
    setClearColor: (c: Color, a: number) => {
      state.clearColor.copy(c);
      state.clearAlpha = a;
    },
    getPixelRatio: () => state.pixelRatio,
    setPixelRatio: (r: number) => {
      state.pixelRatio = r;
      state.pixelRatioCalls++;
    },
    getRenderTarget: () => state.target,
    setRenderTarget: (t: unknown) => {
      state.target = t;
    },
    getViewport: (v: Vector4) => v.copy(state.viewport),
    setViewport: (v: Vector4) => state.viewport.copy(v),
    getScissor: (v: Vector4) => v.copy(state.scissor),
    setScissor: (v: Vector4) => state.scissor.copy(v),
    getScissorTest: () => state.scissorTest,
    setScissorTest: (on: boolean) => {
      state.scissorTest = on;
    },
  };
  return { renderer, state, asWebGl: renderer as unknown as WebGLRenderer };
}

describe('renderer state snapshot', () => {
  it('puts back everything a level changed', () => {
    const { renderer, state, asWebGl } = fakeRenderer();
    const restore = saveRendererState(asWebGl);
    renderer.setClearColor(new Color(0x000000), 0);
    Object.assign(renderer, {
      autoClear: false,
      toneMapping: NoToneMapping,
      toneMappingExposure: 3,
    });
    renderer.shadowMap.enabled = false;
    renderer.setPixelRatio(1);
    renderer.setRenderTarget({ target: 'offscreen' });
    renderer.setViewport(new Vector4(10, 10, 100, 100));
    renderer.setScissorTest(true);
    restore();
    expect(state.clearColor.getHex()).toBe(0x88ccff);
    expect(state.clearAlpha).toBe(1);
    expect(renderer).toMatchObject({
      autoClear: true,
      toneMapping: ACESFilmicToneMapping,
      toneMappingExposure: 1.1,
      shadowMap: { enabled: true, type: 1, autoUpdate: true },
    });
    expect(state.pixelRatio).toBe(1.75);
    expect(state.target).toBe(null);
    expect(state.viewport.toArray()).toEqual([0, 0, 800, 600]);
    expect(state.scissorTest).toBe(false);
  });

  it('leaves the pixel ratio (a drawing-buffer resize) alone when the level kept it', () => {
    const { state, asWebGl } = fakeRenderer();
    saveRendererState(asWebGl)();
    expect(state.pixelRatioCalls).toBe(0);
  });
});
