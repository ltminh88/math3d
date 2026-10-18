// Parity init script (page.addInitScript({ path })). Runs before any page script, on live and
// local builds alike. Seed comes from window.__PARITY_SEED__ (set by an earlier init script).
// - Math.random  -> mulberry32(seed)  (algorithm copied from tools/recovery/golden/seeded-random.mjs)
// - AudioContext -> silent stub that records synth calls in window.__parityAudio
// - WebGL draw*  -> per-bucket draw-call/triangle counter in window.__parityGl
// - localStorage -> every setItem/removeItem/clear appended to window.__parityStorage
(() => {
  const seed = (window.__PARITY_SEED__ ?? 20261018) >>> 0;
  let a = seed;
  Math.random = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // --- audio stub -------------------------------------------------------------------------
  const audio = [];
  window.__parityAudio = audio;
  const param = (owner, name) => ({
    value: 0,
    setValueAtTime: (v, t) => audio.push([owner, `${name}.set`, v, t]),
    linearRampToValueAtTime: (v, t) => audio.push([owner, `${name}.lin`, v, t]),
    exponentialRampToValueAtTime: (v, t) => audio.push([owner, `${name}.exp`, v, t]),
  });
  class ParityAudioContext {
    currentTime = 0;
    state = 'running';
    destination = { kind: 'destination' };
    resume() {
      audio.push(['ctx', 'resume']);
      return Promise.resolve();
    }
    createOscillator() {
      const osc = { type: 'sine', connect() {} };
      const freq = param('osc', 'frequency');
      Object.defineProperty(freq, 'value', {
        get: () => freq._v,
        set: (v) => {
          freq._v = v;
          audio.push(['osc', 'frequency', v]);
        },
      });
      osc.frequency = freq;
      osc.start = (t) => audio.push(['osc', 'start', t]);
      osc.stop = (t) => audio.push(['osc', 'stop', t]);
      return osc;
    }
    createGain() {
      return { gain: param('gain', 'gain'), connect() {} };
    }
  }
  window.AudioContext = ParityAudioContext;
  window.webkitAudioContext = ParityAudioContext;

  // --- WebGL draw counter -----------------------------------------------------------------
  const gl = {
    calls: 0,
    triangles: 0,
    reset() {
      gl.calls = 0;
      gl.triangles = 0;
    },
  };
  window.__parityGl = gl;
  const TRIANGLES = 4;
  const count = (mode, n, instances = 1) => {
    gl.calls++;
    if (mode === TRIANGLES) gl.triangles += (n / 3) * instances;
  };
  for (const Ctx of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
    if (!Ctx) continue;
    const p = Ctx.prototype;
    const wrap = (name, fn) => {
      const orig = p[name];
      if (!orig) return;
      p[name] = function (...args) {
        fn(...args);
        return orig.apply(this, args);
      };
    };
    wrap('drawArrays', (mode, _first, n) => count(mode, n));
    wrap('drawElements', (mode, n) => count(mode, n));
    wrap('drawArraysInstanced', (mode, _first, n, inst) => count(mode, n, inst));
    wrap('drawElementsInstanced', (mode, n, _type, _off, inst) => count(mode, n, inst));
  }

  // --- localStorage write log ---------------------------------------------------------------
  const writes = [];
  window.__parityStorage = writes;
  const sp = Storage.prototype;
  const origSet = sp.setItem;
  const origRemove = sp.removeItem;
  const origClear = sp.clear;
  sp.setItem = function (k, v) {
    if (this === window.localStorage) writes.push(['set', String(k), String(v)]);
    return origSet.call(this, k, v);
  };
  sp.removeItem = function (k) {
    if (this === window.localStorage) writes.push(['remove', String(k)]);
    return origRemove.call(this, k);
  };
  sp.clear = function () {
    if (this === window.localStorage) writes.push(['clear']);
    return origClear.call(this);
  };
})();
