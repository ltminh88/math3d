# Parity re-baseline, phase 03 (map expansion)

Date 2026-11-01. Branch `feat/ch2-p03-map-expansion`. Machine: the same Mac + Chromium 156 SwiftShader as every earlier local baseline. Command: `npm run parity:baselines`, then `npm run test:parity` twice (determinism).

## Before the re-baseline
`npm run test:parity`: 20/20 scenarios failed (all 10 × 2 projects; every scenario shows the world).
Every differing file was attributed with a diff script (capture vs committed baseline, per key; html diffed after removing the 4 new gate labels). 118 shot/scene JSON files differ (59 per project); every changed PNG (61 canvas, 76 DOM) belongs to a shot whose JSON also changed and is attributed below. Trace JSON (`*.trace.json`: storage, audio calls) are unchanged in every scenario.

| Change | Files | Cause (commit) |
|---|---|---|
| `scene.json` (26, every scene dump) | identical delta in every dump: `Group:level-gate-{garden,valley,workshop,cave} +1` each; gate frames/padlocks now baked (`Mesh:frame +8`, `Mesh:padlock +8`, −20 primitive meshes, −8 box/cylinder/icosahedron geometries, −4 torus); `Mesh:expansion-ground/-scenery/-glow +1`; `MeshBasicMaterial +1`; scatter instance matrices/counts (scatter cleared off the 3 footprints and roads) | 0eb0b55 world, a4d5bc2 gates |
| `renderInfo` (26) | draw calls −8 (start view, e.g. 210 → 202 mobile) or +4 (views that see the new scenery, 265 → 269); textures +2/+4 (new gate signs); triangles −8.5k…−13.5k (scatter removed) | 0eb0b55 |
| `html`: only the 4 new gate labels | 54 shots | `#gate-{garden,valley,workshop,cave}-label` from `LEVEL_GATES` (a4d5bc2) |
| `html`: map panel | 15 shots (`menus` map shots) | 3 new region buttons (valley/workshop/cave) in `#map-regions` (4ffa7d4) |
| `html`: bridge quiz question/options | 18 shots (`playthrough`, `bridge-*`) | quiz content reshuffle: the new gates/scenery create three objects after the world, and three draws `Math.random` for each UUID, so the seeded stream the quiz uses later shifts (known, plan constraint) |
| `html`: quest card chain row | 4 shots (`playthrough` after the bridge, both projects) | `#quest-chapter` "Chương 1 · 1/5" label + `chain-row` class (52c4586) |
| `gl`, `cssHash` (92 each) | follow from the canvas/DOM changes above (draw-call counters, computed-style hash over the changed DOM) | — |
| canvas PNG (61) | new scenery, roads, baked gates, cleared scatter in view; minimap shows the expansion layer | 0eb0b55, 4ffa7d4 |
| DOM PNG (76) | gate labels, map panel buttons, minimap/map canvas expansion pass, quiz text, quest label | as above |
| `capture-meta.json` (2) | capture date + duration only | — |

No diff was left unexplained. The help dialog's touch text and the hidden E/M key badges (coarse pointer only) do not show up: no parity scenario captures them under a coarse pointer.

## After the re-baseline
- `npm run test:parity`: see final gate counts in the phase file (expected 20/20).
- Goldens: `node tools/recovery/golden/generate-golden-traces.mjs --check` byte-identical (REGIONS, ROADS, WALKABLE_BOUNDS untouched).
