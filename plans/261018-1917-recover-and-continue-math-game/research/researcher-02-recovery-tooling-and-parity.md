# Research 02: bundle recovery tooling, three r180->r186, parity verification

Skill preflight: tkm:help run; tkm:research / search-docs not separately activated (call budget 5). Fallback to WebFetch/WebSearch.
Source weight: three.js wiki Migration Guide = official (high). Tool facts = READMEs via search aggregator (medium; licenses NOT verified). Playwright options partly from memory (flagged).

## 1. Deminification tooling

| Tool | Does | Does not | Fit for 2.5k lines |
|---|---|---|---|
| webcrack (j4k0xb) | deobfuscate obfuscator.io-style, unpack webpack/browserify | no LLM naming; Rollup output not its target | Low. Bundle is plain minified, not obfuscated |
| wakaru (pionxzh) | unminify Terser/Babel/SWC output: restore `!0`->`true`, sequence exprs, `void 0`, arrow/let/destructuring, template strings; module split | no semantic renaming; says not a deobfuscator | HIGH as step 1 (syntax normalization) |
| humanify (jehna) | LLM proposes names, AST rewrite (oxc, v3 Rust binary) keeps structure; 1 LLM call/identifier; OpenAI/Anthropic/OpenRouter/Ollama | cost scales with size; names unreliable w/o domain context; no module split | Medium. OK for first-pass names on locals only |
| ts-morph / jscodeshift | scripted rename-by-scope, codemods, split into modules | no inference | HIGH as rename applier (rename map JSON -> ts-morph `rename()` is scope-safe) |
| manual + LLM-assisted | human/LLM reads function clusters, writes names with game knowledge | slow if unstructured | HIGH, this is the real work |

Licensing: webcrack, wakaru, humanify believed MIT-ish; unverified here. Irrelevant for output (tools transform own code; no tool code shipped). Check before any redistribution of tool.

Key judgment: at 2.5k lines, humanify's per-identifier calls are cheap but its value is low: minified names lose domain meaning, and a rename that is plausible-but-wrong is worse than `a`. LLM-assisted manual recovery (agent reads a function cluster, with game context + live-site behavior, proposes a rename map, human reviews diff) is more reliable. Use tools for mechanical parts only.

Recommended pipeline (ranked):
1. Strip vendored three: identify r180 chunk (match by `REVISION="180"`), replace with `import * as THREE from 'three'` (pin 0.180.0 first). Use `import {X}` named mapping: bundle's minified three class aliases (e.g. `new Xe.BoxGeometry`) -> resolve by constructor `.name`/string tags. Leaves ~2.5k app lines.
2. wakaru unminify on app code only (CLI `@wakaru/cli`), review diff once.
3. Cluster by feature: audio synth, geometry builders, scene/lights, UI/DOM, question gen, save/state, game loop. Manual+LLM per cluster -> `rename-map.json` per cluster ({scope-path: {old:new}}).
4. Apply with ts-morph (rename symbol = scope-safe, updates all refs). Never regex-rename.
5. Split into TS modules (<200 lines each per repo rules), add types incrementally (`strict` after parity green).
6. Optional: humanify on remaining unnamed locals ONLY if time; review output.
Reject: webcrack (no benefit), humanify as sole tool.
Preserve constants verbatim (colors, positions, magic numbers, Math.random call ORDER, DOM strings, CSS) - parity depends on them. Extract CSS/HTML strings and inline styles as-is.

## 2. three.js r180 -> r186 (migration guide, mrdoob/three.js wiki)
Guide recommends upgrading in <=10-release steps (deprecation warnings last ~10).

Entries affecting this game:
- 180->181: PBR indirect specular recomputed, better energy conservation, rough materials (roughness>0.5) render brighter; PMREM reflections improved. => MeshStandardMaterial/MeshPhysical LOOKS different. Biggest visual-parity risk. Fix: retune roughness/envMap/light intensity, or accept and re-baseline.
- 181->182: `PCFSoftShadowMap` deprecated for WebGLRenderer; use `PCFShadowMap` (now soft too). Affects `renderer.shadowMap.type`. Shadow edge look may shift; warning only. (r186: removed from WebGPURenderer only.)
- 182->183: `Clock` deprecated -> `Timer` (warn only; swap at end). Sky gamma removed (n/a unless Sky used). WebGPU shadow bias changes (n/a on WebGL).
- 183->184: background/environment rotation now matches object rotation (affects only if scene.backgroundRotation / environmentRotation used). New `renderer.state.pixelStorei()` for raw pixelStorei (CanvasTexture upload only if custom).
- 184->185: `inverseTransformDirection()` GLSL fn deprecated -> `transformNormalByInverseViewMatrix` / `transformDirectionByInverseViewMatrix` (matters only for custom ShaderMaterial/onBeforeCompile using it; deprecation, not removal). `Object3D.updateWorldMatrix()` honors `matrixWorldNeedsUpdate`: if code sets `matrixAutoUpdate=false` and edits `.matrix` directly, set `matrixWorldNeedsUpdate=true` (static decor/InstancedMesh parents). `Matrix3.translate/scale/rotate` deprecated.
- 185->186: `Object3D.dispose()` added; custom subclasses with `dispose()` must call `super.dispose()`. `BufferGeometryUtils.toTrianglesDrawMode()` no longer clones (n/a to mergeGeometries). `Source` -> `TextureSource` (rarely touched).
- No entries in r181-r186 (as read) for: `outputColorSpace`, `toneMapping`, InstancedMesh API, CanvasTexture, `mergeGeometries`, PolyhedronGeometry, HemisphereLight/DirectionalLight shadow API. Absence = no documented breaking change, but guide is not a render-diff list; lighting/PBR changes (181) alter pixels without API change.
- Tail 14k chars of the guide page unread (likely older versions).

Decision (ranked):
1. RECOMMENDED: recover on three 0.180.0 first (exact pin; package versions from the bundle's REVISION), reach parity green vs live site, commit, THEN bump to 0.186.1 and re-baseline only the diffs explained by r181 PBR/shadow changes. Reason: isolates recovery bugs from engine changes; live site is r180 so it is the only oracle. Cost: one extra install + bump step; trivial.
2. Straight to r186: risk that PBR diffs mask real recovery bugs; no oracle match. Reject.
Bump checklist: grep `PCFSoftShadowMap`, `new THREE.Clock`, `inverseTransformDirection`, `matrixAutoUpdate = false`, `onBeforeCompile`, `.dispose` subclasses; compare screenshots with looser tolerance on lit materials; check console deprecation warnings = 0.

## 3. Parity verification

Layered, cheapest first:
A. Pure-logic golden trace (highest value, deterministic, no GPU). Extract question gen / scoring / save-load into pure modules with injected `rng` and `storage`. Run the ORIGINAL bundle's logic under node/jsdom or in Playwright page with seeded Math.random, record trace JSON: sequence of {seed, level, question, answers, correct, score, saved localStorage blob} for N=200+ steps. Vitest asserts recovered module output == golden trace (`toEqual`). Capture traces from the live site (page.evaluate driving via real UI/clicks + `page.addInitScript` seeded RNG), and from original bundle locally. Also snapshot raw localStorage keys/values (migration compatibility with existing user saves is a contract).
B. Deterministic visuals via Playwright vs live site:
 - `addInitScript`: replace `Math.random` with mulberry32(seed). Also seed `crypto.getRandomValues` if used. Must apply to BOTH live and recovered runs; RNG call ORDER must match, hence do not reorder init code.
 - Time: `page.clock.install({time})` + `clock.runFor/pauseAt` (Playwright >=1.45; memory, not verified here) controls Date/rAF/timers, giving frame-exact states. Fallback: addInitScript override of `performance.now`, `Date.now`, `requestAnimationFrame` with manual `window.__step(n)`. Game must have fixed-dt or dt-from-clock for this to be exact; if it uses real dt, step with fixed 16.667ms.
 - Web Audio: stub AudioContext (no pixels; assert synth parameter calls via trace instead).
 - Renderer: chromium with SwiftShader (`--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`); set fixed viewport + deviceScaleFactor=1; `preserveDrawingBuffer` not needed for page screenshot. Run live-vs-local on the SAME machine/browser build: cross-machine SwiftShader is near-deterministic but not guaranteed (Playwright docs: rendering varies by OS, version, hardware; keep baselines per platform).
 - Hover: `page.mouse.move(-1,-1)` before shot (Playwright docs). Hide volatile DOM via `stylePath`.
 - Compare: take PNGs from live and local, feed `expect(localShot).toMatchSnapshot` against live-captured baseline stored in repo (baseline = live site, captured once, committed), not live-at-test-time (network flake).
 - Tolerances (starting values, tune empirically): `threshold` 0.2 default (docs); r180 recovery: `maxDiffPixelRatio` 0.001-0.005 (expect ~0 with seeded rng, same engine); r186 bump: 0.02-0.05 on 3D canvas shots, tight (0.002) on DOM-overlay-only shots by masking canvas / separate element screenshots. `maxDiffPixels` documented; `maxDiffPixelRatio`, `mask`, `animations:'disabled'` from memory, verify.
 - Scenarios: title, each question type state, correct/wrong feedback, score/save screens, N camera/time points of idle animation. Screenshot canvas element and DOM separately.
C. Structural checks: DOM snapshot (`outerHTML` normalised) vs live; extracted CSS identical; count of draw calls / `renderer.info.render.calls`, triangles, geometries, instances vs live (cheap, catches missing meshes with no pixel noise); scene graph dump (names, positions, material params) as JSON golden.
D. Manual play-through once at the end; fix list.

Ranked effort/value: A > C > B(DOM) > B(canvas) > D.

## Limits
- Licenses unverified (no fetch of repos). webcrack/wakaru/humanify accuracy benchmarks not found.
- Did not inspect actual bundle: tool choice depends on whether three is tree-shaken/mangled (aliases) and whether game uses Clock/dt, onBeforeCompile, custom GLSL.
- Guide's last 14k chars unread; Playwright clock/maxDiffPixelRatio/mask specifics not fetched.
- Live site may change/remove; capture baselines and traces immediately.
- Bun/Vite 8, TS 7, vitest 5, Playwright 1.64.1 behavior not researched.

## Unresolved questions
1. Does game use real `dt` (Clock) or fixed step? Decides time-control approach.
2. Does live site persist saves in localStorage/IndexedDB/server (Supabase mentioned in memory)? Trace must cover it.
3. Is the app code using custom GLSL via ShaderMaterial or onBeforeCompile (r185 GLSL deprecation)?
4. Is Math.random used at render-time (particles) beyond question gen? Affects seed strategy.
5. Acceptable visual drift after r186 bump (user sign-off on PBR brightening)?

**Status:** DONE_WITH_CONCERNS
**Summary:**
- Pipeline: strip vendored three, wakaru on app code, LLM-assisted manual rename maps applied via ts-morph; skip webcrack, humanify optional.
- Recover on three 0.180.0 first, then bump to 0.186.1; main visual risk is r181 PBR energy-conservation change plus r182 PCFSoftShadowMap deprecation.
- Parity: golden-trace of pure logic first, then seeded Playwright/SwiftShader screenshots vs committed live baselines; tolerances need empirical tuning.
**Concerns:** licenses and some Playwright options unverified.
