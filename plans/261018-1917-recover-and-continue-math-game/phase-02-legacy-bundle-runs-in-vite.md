# Phase 02: Legacy bundle runs in Vite (strangler base)

## Context links
- [plan.md](plan.md) · [research 02 §1 pipeline](research/researcher-02-recovery-tooling-and-parity.md) · [inventory §1, §3](research/researcher-01-recovered-code-inventory.md) · [scout](reports/scout-01-current-repo-reuse-map.md)
- Old plan reuse: [old 01 tooling](../261018-1803-vlm-math-game-mvp/phase-01-scaffold-tooling-pwa-i18n.md) stays as-is except deltas below.
- Parallel with: 01 (G0); parity gate runs once 01 baselines exist.

## Overview
- Date: 2026-10-18
- Description: Make the original app code run from the repo with `three` imported from npm (0.180.0), split mechanically into ES-module chunks along inventory group boundaries, wired through per-group shims so later phases swap one group at a time. Recovery tooling (strip-three, unminify, rename-map applier) set up here.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed

## Key Insights
- Vendored three r180 + BufferGeometryUtils = `three-section.js`; app references minified class ids (map in inventory §2). Replace with named imports: `import { Vector3 as F, ... } from 'three'` and `mergeGeometries as Wm` from `three/addons/utils/BufferGeometryUtils.js` -> app code otherwise untouched.
- Unminify (wakaru) changes syntax only; run it, then parity-check before splitting, so a regression is attributable to one step.
- Class property/method names (`setBridge`, `resetCamera`, `onFrame`...) are not mangled -> stable API between chunks.
- UI section (1939-2519) shares ~12 module `let`s -> stays ONE chunk until 08. World class `$m` (155-1255) stays ONE chunk until 05/06.
- CSS split is mechanical: section files whose in-order concatenation is byte-identical to `game-styles.css` (hash check).
- Fonts: live loads Google Fonts Baloo 2 600/700/800 + Nunito 500-900. During parity keep the same Google link (identical glyphs); switch to self-hosted fontsource in 09. Repo `fonts.css` currently has only Baloo 600/800, Nunito 400/700 -> extend in 09.

## Requirements
- Deltas to old 01: `package.json` pins `three` 0.180.0 + `@types/three` 0.180.0 (temp), adds devDeps `ts-morph`, `@wakaru/cli`, `tsx` (exact versions verified at install). Name -> `math-ai-game-3d`.
- `index.html` = original structure (`<div id="app">`, theme-color #194f42, description, Google Fonts link, title "Math AI Game 3D - Vương Quốc Cửu Chương"); `favicon.svg` from `recovered/original/`.
- PWA manifest in `vite.config.ts`: name "Math AI Game 3D – Vương Quốc Cửu Chương", short_name "Cửu Chương", theme #194f42; SW registration NOT added yet (18). `common-strings.ts` appName/guide updated (Milo); "VLM" removed.
- Old `src/main.ts` boot stub replaced by `import './legacy/legacy-main.js'`; old engine files stay on disk but unimported (retired in 11). `bench.html` keeps working.
- Chunks: `legacy-config.js` (1-154), `legacy-world.js` (155-1255), `legacy-save.js` (1256-1334), `legacy-quiz.js` (1335-1389), `legacy-audio.js` (1390-1434), `legacy-i18n.js` (1435-1673), `legacy-map.js` (1674-1912), `legacy-ui.js` (1913-2519, incl. bootstrap), `legacy-webmcp.js` (2520-2548), `legacy-main.js` (imports CSS, ui).
- Each chunk imports other groups only via `src/legacy/shims/<group>.js` (initially `export * from '../legacy-<group>.js'`).
- Rename map tooling: `apply-rename-map.ts` takes `{file, scopePath, old -> new}` JSON, uses ts-morph `rename()` (scope-safe); never regex.

## Architecture
```
tools/recovery/strip-three.ts          rewrite minified three ids -> named imports (map from inventory §2, verify unverified ids by grep)
tools/recovery/unminify-app.sh         wakaru on game-app-section.js -> src/legacy/_unminified.js (temp)
tools/recovery/split-legacy-chunks.ts  cut by line ranges, add exports/imports via shims
tools/recovery/apply-rename-map.ts     ts-morph rename applier (used by 03-08)
src/legacy/legacy-*.js  src/legacy/shims/*.js
src/styles/game/*.css                  ~12 files (<200 lines each) + game-styles-index.css importing in order
tests/parity/local-parity.spec.ts      runs 01 scenarios against local build, compares to live baselines
```

## Related code files
- Create: above. Modify: `package.json`, `index.html`, `vite.config.ts`, `src/main.ts`, `src/i18n/common-strings.ts`, `tsconfig.json` + `biome.json` (exclude `src/legacy/**`); add `public/favicon.svg`. Delete: `src/styles/base-reset.css` import from main (file deleted in 11).

## Implementation Steps
1. Install pins/devDeps; verify unverified three ids (Vm, Wm, St, En, Ss, gn, ...) by grep in `three-section.js`.
2. `strip-three` on raw formatted app section -> run in Vite as one file -> parity gate (expect 0 diff).
3. wakaru unminify -> review diff -> parity gate.
4. Split into chunks + shims -> parity gate.
5. CSS split + hash check; index.html/manifest/favicon.
6. Write `local-parity.spec.ts` (screenshots + structural + DOM + localStorage trace) and npm script `test:parity` = `playwright test -c tests/parity/parity.config.ts` (02 owns package.json).
7. Commit + tag `recovery-p02`.

## Todo list
- [ ] pins + devDeps, id verification
- [ ] strip-three + first parity run
- [ ] unminify + parity
- [ ] chunks + shims + parity
- [ ] CSS split, html, manifest, favicon, strings
- [ ] parity spec + `test:parity` script
- [ ] rename-map applier (dry-run test on one chunk)

## Success Criteria
- `npm run build && npm run test:parity`: canvas shots maxDiffPixelRatio <= 0.002 (target 0), DOM shots <= 0.001, WebGL draw-call/triangle counts + scene-graph JSON equal, normalized DOM equal, localStorage trace equal, both projects.
- `cat src/styles/game/*.css` in index order == original CSS (sha256 equal).
- `npm run lint && npm run typecheck && npm test` green (legacy `.js` excluded from Biome/tsc via config).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| A minified three id mapped wrong | M | H | grep-verify every id; structural scene dump catches wrong geometry class (icosahedron vs sphere) |
| wakaru changes semantics (sequence exprs with RNG side effects) | L | H | parity gate right after; skip a transform if diff |
| Vite/esbuild reorders module eval (font/canvas init order) | L | M | single entry, chunks imported in original order; fonts.ready before world build if needed (only if live does same) |
Rollback: `git revert` to old boot stub; nothing else consumes legacy yet.

## Security Considerations
- No new runtime deps besides three pin. Dev tools run only on our own code. CSP unaffected yet (Google Fonts allowed until 09).

## Next steps
- 03/04 swap pure groups; 05-08 swap world/map/ui.
