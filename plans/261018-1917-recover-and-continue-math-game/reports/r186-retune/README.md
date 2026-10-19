# three r180 -> r186 retune: screenshots for author sign-off

Date: 2026-10-19. three 0.180.0 -> 0.186.1, @types/three 0.180.0 -> 0.186.0.

Status: **approved by the author 2026-10-19**; local baselines regenerated on r186 (tag `recovery-p10`).

## Files
- `*--side-by-side.png`: r180 baseline on the left, r186 retuned on the right (the set the author approved). The separate r180 / untuned / retuned / diff-x16 PNGs (22 MB) were not committed; the r180 canvases stay reachable at tag `renamed-math3d`.
- `metrics-before.txt` / `metrics-after.txt`: all 92 canvas shots (46 desktop + 46 mobile) vs r180; columns exact-byte ratio, mean abs delta, share > 8 levels, mean luma delta

Shots: desktop welcome t0, bridge-0 play, bridge-6 play, playthrough bridge-built, walk-to-bridge settled, mobile welcome t0.

## Retune (one file: `src/world/world-lighting-tuning.ts`)
- Hemisphere 2.6 -> 2.6 x 1.027, sun 3.2 -> 3.2 x 1.027. r181+ removes the Fresnel share from diffuse light, so r186 rendered about 1.3 sRGB levels **darker**, not brighter. A per-pixel least-squares fit (separate hemisphere and sun gains, each RGB channel) landed on the same ~2.7 % for both lights, so one shared factor.
- Shadow radius 1 -> 1.5. r186 has a 5-tap noise-rotated PCF instead of the old 3x3 PCFSoft. Radius 1.5 cut pixels off by more than 8 levels by 10x (radius 2 was worse).
- Exposure, roughness and colours stay the same. The sky dome is tone-mapped, so changing exposure would have shifted it.

## Canvas diff vs r180 (mean of 92 shots)
| | exact ratio (any byte differs) | mean abs delta (0-255) | pixels off by > 8 | mean luma delta |
|---|---|---|---|---|
| r186 untuned | 0.9962 | 1.54 | 0.52 % | -1.30 |
| r186 retuned | 0.3841 | 0.24 | 0.03 % | -0.01 |

Per shot (exact ratio / mean abs, before -> after):
| shot | untuned | retuned |
|---|---|---|
| desktop welcome t0 | 0.9967 / 1.62 | 0.4429 / 0.28 |
| desktop bridge-0 play | 0.9976 / 1.56 | 0.4136 / 0.25 |
| desktop bridge-6 play | 0.9976 / 1.56 | 0.4200 / 0.25 |
| desktop playthrough bridge-built | 0.9976 / 1.54 | 0.4027 / 0.24 |
| desktop walk-to-bridge settled | 0.9978 / 1.53 | 0.3653 / 0.22 |
| mobile welcome t0 | 0.9920 / 1.63 | 0.4086 / 0.30 |

What is left is mostly ±1 rounding plus the dithered shadow edges. No retune can reach exact pixels, because the BRDF and the shadow filter are different code now. The plan's "canvas <= 0.05" bound only holds for "pixels off by > 8", not for exact-byte ratio.

## Other differences vs the r180 baselines (all explained; re-baselined)
- `renderInfo` in every scene dump: r186 resets `renderer.info` **before** the shadow pass (r180 reset it after), so calls and triangles now count shadow-pass draws too (bridge-0: 138 -> 242 calls). `textures` +2 = DFG LUT + shadow DepthTexture. Geometry count is unchanged (222).
- `html` in every shot JSON: three writes `data-engine="three.js r186"` on the canvas.
- Light `intensity` values in scene dumps (retune).
- Playthrough only (storage, storageWrites, cssHash, quiz DOM PNGs, spark positions): r186 makes extra textures, and each texture takes 4 `Math.random()` calls for its UUID. That shifts the seeded parity RNG, so the first quiz question changes (m2_8 -> m8_1). This is harness-only; real players get unseeded random anyway.
- Movement is unaffected. The walk-to-bridge and tap-to-milo scene dumps match r180 apart from renderInfo (Clock -> Timer keeps dt).
- DOM PNGs outside the playthrough match within the known noise. menus--map-open has 5 px, the known keyframe noise.
- Zero three deprecation warnings in the console (desktop + mobile, play + walk).
