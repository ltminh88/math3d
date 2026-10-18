# Phase 01: Capture live baselines and golden traces

## Context links
- [plan.md](plan.md) · [research 02 §3 parity](research/researcher-02-recovery-tooling-and-parity.md) · [inventory §4 save, §6 risks](research/researcher-01-recovered-code-inventory.md)
- Parallel with: 02 (G0). Blocks the parity gate of 02-10.

## Overview
- Date: 2026-10-18
- Description: Freeze the oracle before it changes: seeded, time-controlled Playwright captures of the live site (screenshots, DOM, renderer stats, localStorage traces) plus golden JSON traces of pure logic produced by running the ORIGINAL minified functions in node.
- Priority: P1 (do first; live site may change or vanish)
- Implementation status: pending
- Review status: not reviewed

## Key Insights
- World layout is deterministic: Park-Miller LCG (16807) seeds 1337 scatter, 91 decorate, 23/7 minimap. `Math.random` only in gameplay (shuffle, picker, burst sparks) -> seed it via `addInitScript` (mulberry32) on BOTH live and local runs.
- Loop uses `THREE.Clock.getDelta()` (performance.now) capped 0.05 s -> `page.clock.install()` + `runFor(16.667*n)` gives frame-exact states. Fallback: init-script override of `performance.now`/`requestAnimationFrame` with `window.__step(n)`.
- `lowPower = matchMedia(max-width:900px or pointer:coarse)` switches counts (150/230 trees, 450/900, 700/1300) and shadow map 1024/2048 -> two baseline sets: `desktop-chromium` 1280x720 (lowPower false) and `mobile-pixel` (lowPower true).
- Pure functions (save parse `Ym`, picker `Qm`, question builder `Jm`, stats `tg`, hint `Yn`, level `Sa`, region-at-point `Xm`, LCG) are closure-free -> extract by line range from `game-app-section.js` into a throwaway node harness; output = golden JSON. No dependency on the live site for these.
- AudioContext stubbed (records synth calls) so audio is traceable without pixels.

## Requirements
- Screenshot scenarios per project (canvas element + DOM overlay separately, masked canvas for DOM shots): welcome menu; avatar boy/girl; first play frame; idle camera at t=2s/6s/12s (idle orbit); minimap; world map open + region detail; Milo dialog; quiz dialog with hint levels 1-3; correct + wrong feedback; book; help; settings; reset confirm; bridge 0/3/6 segments; quest complete; EN language.
- Structural captures per scenario: WebGL draw calls + triangles (counter hook), scene-graph dump (type, name, position rounded 1e-4, material color/roughness/flatShading), normalized `#app` outerHTML, computed CSS hash.
- three is bundled (no global prototype to hook). Pixels + DOM + localStorage come from the live site; draw-call/triangle counts via init-script wrap of WebGL `drawElements/drawArrays(Instanced)` (works on live). Scene-graph dump comes from `recovered/original/` served locally (`npx serve`) with ONE injected line exposing the world instance as `window.__parity` (copy in `tools/recovery/oracle-site/`, original files untouched); first verify its pixels equal the live baselines (proves the local oracle = live).
- Golden traces: save parse for 40 fixture blobs (valid, version 2, garbage, >30 stats, bad keys, bridge 7); 500-step picker/question sequence per seed (3 seeds x tables 0,2..10); stats update sequence; hint ladder text; level thresholds; region-at-point grid; LCG first 1000 per seed.
- localStorage trace: scripted playthrough (accept quest -> 6 correct + 2 wrong -> cross bridge) recording every key write.
- Baselines committed under `tests/parity/baselines/live/<project>/`; capture metadata (date, Chromium build, OS, viewport) in `capture-meta.json`.

## Architecture
```
tools/recovery/
  capture-live-baselines.mjs        Playwright script (not a test): seeds, clock, scenarios -> PNG/JSON
  capture-parity-hooks.js          addInitScript: mulberry32 Math.random, AudioContext stub, WebGL draw-call counter
  oracle-site/                     copy of recovered/original + 1-line `window.__parity` patch (structural oracle)
  extract-original-pure-functions.mjs  slices line ranges -> golden/original-pure-harness.cjs
  golden/generate-golden-traces.mjs writes tests/parity/golden/*.json
tests/parity/
  baselines/live/{desktop-chromium,mobile-pixel}/*.png|*.json
  golden/*.json
  scenarios/parity-scenarios.ts    shared scenario list (used again by local parity specs in 02+)
  parity.config.ts                 Playwright config for parity (SwiftShader, dpr 1, fixed viewport)
```

## Related code files
- Create: files above (plain `.mjs`, run with node; no package.json edit). Modify: none (uses existing `@playwright/test`). Delete: none.

## Implementation Steps
1. Write `capture-parity-hooks.js` + oracle-site copy; verify on live that seeded runs produce identical screenshots twice in a row (determinism check).
2. Write `parity-scenarios.ts` driving the real UI (ids from inventory §3); include clock stepping per scenario.
3. Capture live baselines for both projects; run twice, diff = 0 required (else find nondeterminism: fonts loading, rAF, sparks).
4. Wait for `document.fonts.ready` before every shot (canvas signs use Baloo 2).
5. Extract pure functions, run golden generator; spot-check 5 traces by hand against live behavior.
6. Record localStorage playthrough trace.
7. Commit baselines + traces + meta; tag `recovery-p01`.

## Todo list
- [ ] parity hooks + determinism check on live
- [ ] scenario list
- [ ] live baselines desktop + mobile (2 identical runs)
- [ ] pure-function harness + golden traces
- [ ] localStorage playthrough trace
- [ ] commit + tag

## Success Criteria
- `node tools/recovery/capture-live-baselines.mjs --verify` reruns against live: 0 diff pixels vs committed baselines (both projects).
- `tests/parity/golden/` holds traces listed above; generator rerun is byte-identical.
- `capture-meta.json` records Chromium version; parity runs must use the same version (pinned Playwright 1.64.1).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Live nondeterminism (font swap, sparks, GC timing) | M | H | fonts.ready, seeded RNG, clock install; mask sparks if needed |
| Live site changes before capture | L | H | do this phase first; also archive `recovered/original/` (already on disk) |
| SwiftShader output differs across machines | M | M | capture and compare on the same Mac + Chromium build; CI uses its own re-captured local-vs-local baselines only after 09 |
| Line-range extraction picks wrong function bounds | L | M | harness asserts function names/arity; golden spot-check vs live |
Rollback: delete `tests/parity/**`, `tools/recovery/capture-*`; nothing depends on it at runtime.

## Security Considerations
- Read-only against live site; no credentials. Harness runs only our own downloaded code (`node -I` style isolation not needed: it is our bundle).

## Next steps
- 02 consumes scenarios + baselines for its parity gate; 03/04 consume golden traces.
