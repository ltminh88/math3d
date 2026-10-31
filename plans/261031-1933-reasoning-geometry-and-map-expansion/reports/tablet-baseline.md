# Tablet e2e baseline (phase 01, 2026-10-31)

Projects: `tablet-portrait` (834×1194) and `tablet-landscape` (1194×834), iPad Pro 11 viewport + UA, `deviceScaleFactor` 2, Chromium (SwiftShader WebGL), `hasTouch`, `isMobile`, coarse pointer. `E2E_PORT=4175`.
Machine note: another worktree ran e2e at the same time (load average 25-57 on 8 cores), so 30 s timeouts are not trustworthy on the first pass; every failure below was re-run with `--workers=1`.

## Run 1: existing suite before any phase-01 code (only the config change)
`--project=tablet-portrait --project=tablet-landscape`: **75 passed, 3 failed, 8 skipped** (20.6 min).

| Test | Portrait | Landscape | Serial re-run | Verdict / owner |
|---|---|---|---|---|
| `shop-purchase.spec.ts:135` HUD button: everything worn costs ≤ 6 draw calls; 10 swaps leak no geometry | ✘ | ✘ | ✘ both: portrait 221 > 220 draw calls (baseline + 7, budget + 6); landscape times out at 240 s (4.7 Mpx canvas on SwiftShader) | real tablet difference: the wider tablet frustum adds one draw call (budget too tight for this aspect) + landscape too slow for the 240 s budget. **Owner 03** (shell/world/shop; spec budget or tablet timeout) |
| `boot-smoke.spec.ts:43` store saves without crypto.randomUUID | ✓ | ✘ (30 s on `#play` click) | ✓ | machine load, not a bug |

Skipped by design (phone-only specs, they skip on non-phone viewports; and the full chain is desktop-only): `city-phone-layout` ×2, `field-phone-layout`, `full-chain` — per tablet project. **Gap:** no tablet layout spec exists yet for levels; owners 04 (old levels) and 09 (full chain on tablets).

## Touch / key-hint findings (code audit, not covered by specs)
| Where | Problem on `(pointer: coarse)` | Owner |
|---|---|---|
| `src/ui/quest-chain-strings.ts` `gateOpened…` copy | "Nhấn M để xem bản đồ nhé!" / "Press M to see the map!" shown on touch (enter hint is already coarse-aware, this one is not). Repro: tablet, finish the bridge → quest card text | 03 |
| `src/ui/book-help-dialogs.ts` help list | "nhấn E", "Nhấn M", "Space: nhảy", "Lăn chuột", "Esc" listed for every pointer. Repro: tablet → Sách → Hướng dẫn | 03 |
| `src/levels/field/field-strings.ts` `keysTip`, `toolsKeysTip`, `equationsTip` | keyboard tips (mũi tên/Enter, R, H, phím 1-4) appended to the HUD prompt on touch (`field-game.ts:84,103,112`). Repro: tablet → field level, first round | 04 |
| `src/levels/tower/tower-strings.ts` `guideChoice`, `cardName` | "Bấm phím 1, 2 hoặc 3 cũng được" guide and "(phím n)" in card names on touch. Repro: tablet → tower, a choice floor | 04 |

## Run 2: full suite after phase 01 (all four projects, `--workers=2`, then `--last-failed --workers=1`)
First pass 178 passed, 5 failed, 13 skipped (55 min, under load); serial re-run of the 5: 4 passed, 1 failed.

| Project | Passed | Failed | Skipped |
|---|---|---|---|
| desktop-chromium | 45 | 0 (4 boot-smoke/city-leak load timeouts passed serially) | 4 |
| mobile-pixel | 48 | 0 | 1 |
| tablet-portrait | 44 | 1 (`shop-purchase.spec.ts:135`, 221 > 220 draw calls, same as run 1) | 4 |
| tablet-landscape | 45 | 0 (shop spec passed this time: the run-1 failure was its 240 s timeout under load) | 4 |

The new `step-kit-touch.spec.ts` (5 skills solved by `tap()` + seedFactStats) passes on all four projects; the save-code specs pass with M3D3 export. The only remaining failure is the pre-existing tablet-portrait shop draw-call budget (owner 03).
