---
title: "Recover Math AI Game 3D (Vương Quốc Cửu Chương), rename to math3d and continue development"
description: "Recover the lost source of math.aigame3d.com from the prod bundle into modular TS with pixel/behavior parity, then rename to math3d, add save migration/codes, learning core, Field + Forest levels, cosmetics shop, parent accounts, Supabase sync, Vercel deploy."
status: pending
priority: P2
effort: 174h
branch: main
tags: [recovery, refactor, frontend, threejs, pwa, backend, database, auth, supabase]
created: 2026-10-18
---

# Recover + continue Math AI Game 3D

Part A (01-11): strangler recovery of `recovered/formatted/game-app-section.js` (2548 lines) + `game-styles.css` on three 0.180.0, gated by golden traces, structural checks and seeded screenshots vs committed live baselines; then bump to 0.186.1 and retire old-plan engine code. Rename to "math3d"/VLM right after the parity gate (09). Part B (12-19): idb store + save migration/codes + learning core, Field/Forest levels, cosmetics shop, Supabase + parent accounts, deploy to Vercel at `mathgame.vercel.app` (old site untouched).
Supersedes [261018-1803-vlm-math-game-mvp](../261018-1803-vlm-math-game-mvp/plan.md) (its 01 tooling and 03 learning/store are reused; 06-10 reused as specs with deltas). Inputs: [inventory](research/researcher-01-recovered-code-inventory.md) · [tooling + parity](research/researcher-02-recovery-tooling-and-parity.md) · [repo reuse map](reports/scout-01-current-repo-reuse-map.md)

## Phases
| Phase | Name | Status |
|-------|------|--------|
| 01 | [Capture live baselines + golden traces](phase-01-capture-live-baselines-and-golden-traces.md) | Pending |
| 02 | [Legacy bundle runs in Vite (strangler base)](phase-02-legacy-bundle-runs-in-vite.md) | Pending |
| 03 | [Recover config, save, xp, quiz](phase-03-recover-config-save-quiz-modules.md) | Pending |
| 04 | [Recover audio + i18n](phase-04-recover-audio-and-i18n-modules.md) | Pending |
| 05 | [Recover world static builders](phase-05-recover-world-static-builders.md) | Pending |
| 06 | [Recover scatter, characters, controls, world orchestrator](phase-06-recover-world-scatter-characters-controls.md) | Pending |
| 07 | [Recover minimap + world map renderer](phase-07-recover-minimap-and-world-map.md) | Pending |
| 08 | [Recover UI, dialogs, HUD, main](phase-08-recover-ui-dialogs-hud-and-main.md) | Pending |
| 09 | [Parity sign-off + legacy removal + rename math3d/VLM](phase-09-parity-signoff-and-legacy-removal.md) | Pending |
| 10 | [three r186 bump + retune to r180 look](phase-10-three-r186-bump-and-rebaseline.md) | Pending |
| 11 | [Retire old engine code](phase-11-retire-old-engine-code.md) | Pending |
| 12 | [Store, save migration + save codes, learning integration](phase-12-store-migration-and-learning-integration.md) | Pending |
| 13 | [Level host + region progression](phase-13-level-host-and-region-progression.md) | Pending |
| 14 | [Field level (meadow)](phase-14-field-level-in-meadow.md) | Pending |
| 15 | [Forest level](phase-15-forest-level.md) | Pending |
| 16 | [Supabase backend](phase-16-supabase-backend.md) | Pending |
| 17 | [Parent auth, profiles, sync client](phase-17-parent-auth-profiles-sync-client.md) | Pending |
| 18 | [Polish, a11y, perf, e2e, Vercel deploy](phase-18-polish-a11y-perf-e2e-deploy.md) | Pending |
| 19 | [Cosmetics shop in village](phase-19-cosmetics-shop-in-village.md) (runs in G7) | Pending |

Effort (h) / depends: 01 7/- · 02 9/- (gate needs 01) · 03 7/01,02 · 04 5/01,02 · 05 10/03 · 06 12/05 · 07 5/03 · 08 14/03,04 · 09 6/06,07,08 · 10 6/09 · 11 3/09 · 12 15/10,11 · 13 7/12 · 14 12/13 · 15 12/13 · 16 8/12 · 17 16/13,16 · 19 6/13 · 18 14/14,15,17,19. Critical path 02>03>05>06>09>10>12>16>17>18 = 103h.

## Parallel groups + file ownership
- **G0** 01 ∥ 02. 01: `tests/parity/**`, `tools/recovery/capture-*`, `tools/recovery/golden/**`. 02: `package.json` (only 02 and 10 edit it), `index.html`, `vite.config.ts`, `src/main.ts`, `src/legacy/**`, `src/styles/game/**`, `tools/recovery/{strip-three,unminify,split-legacy,apply-rename-map}*`, `src/i18n/common-strings.ts`, `tsconfig.json`, `biome.json`, `public/favicon.svg`.
- **G1** 03 ∥ 04. 03: `src/config/**`, `src/save/**`, `src/game/**`, `src/quiz/**`, shims `src/legacy/shims/{config,save,quiz}.js`. 04: `src/audio/**`, `src/i18n/legacy-*`, shims `{audio,i18n}.js`.
- **G2** (05>06) ∥ 07 ∥ 08. 05/06: `src/world/**`, shim `world.js`, `legacy-world.js`. 07: `src/map/**`, shim `map.js`, golden generator (04 done). 08: `src/ui/*.ts` (not `kit/`), `src/webmcp/**`, `src/main.ts`, shim `ui.js`, `legacy-ui.js`.
- **G3** 09 serial (any file; rename after sign-off). **G4** 10 ∥ 11. 10: `package.json`, `src/world/**`, `tests/parity/baselines/**`. 11: `src/core/**`, `src/ui/kit/**`, `src/dev/**`, `bench.html`, `vite.config.ts`.
- **G5** 12 serial: `src/store/**`, `src/learning/**`, `src/quiz/**`, `src/save/**`, `src/i18n/i18n.ts`, `src/ui/**` (non-kit) as needed, `src/webmcp/**`, `tests/e2e/legacy-*`.
- **G6** 13 ∥ 16. 13: `src/levels/shared/**`, `src/config/regions.ts`, `src/world/world.ts`, `src/ui/world-labels.ts`, `src/ui/guide-dialog.ts`, `src/map/**`. 16: `supabase/**`, `src/sync/supabase-database-types.ts`, `.github/workflows/supabase-keep-alive.yml`.
- **G7** 14 ∥ 15 ∥ 17 ∥ 19. 14: `src/levels/field/**`, `tests/e2e/field-*`. 15: `src/levels/forest/**`, `tests/e2e/forest-*`. 17: `src/sync/**` (minus types), `src/ui/account/**`, `src/ui/settings-dialog.ts`, `src/ui/bootstrap-game.ts`, `src/main.ts`, `tests/integration/**`, `tests/e2e/account-*`. 19: `src/shop/**`, `src/world/characters.ts`, `src/config/regions.ts`, `src/ui/hud.ts`, `tests/e2e/shop-*`, stall parity shots.
- **G8** 18 serial. Guards: levels self-register via `import.meta.glob`; legacy chunks import other groups only through `src/legacy/shims/*.js`, so a swap edits one shim, never another phase's chunk.

## Data flow
Recovery: live site -> baselines/traces (01) -> legacy chunks (02) -> TS modules swapped in via shims (03-08) -> parity suite gates every swap. Runtime (B): input -> world/level -> `src/learning/*` -> `game-store.commitSession` -> IndexedDB -> outbox -> `sync_batch` RPC -> Postgres. First boot: localStorage `aigame3d_*` (if on this origin) or pasted save code `M3D1-…` -> one-time import -> idb (old keys kept read-only).

## Decisions (validated 2026-10-18)
1. Target: modular TS, kebab-case, files <200 lines, vanilla DOM, behavior + visual parity with live site.
2. Identity: app "math3d", guide NPC "VLM" (ex-Milo); avatars "Nhà thám hiểm"/"Nhà khám phá" kept. Rename in 09 after parity sign-off (01-08 keep original strings), then re-baseline. Names only in i18n, title/meta, PWA manifest, favicon text.
3. Recover on three 0.180.0 until parity green; bump to 0.186.1 in 10 and retune lighting/materials to the r180 look (2h, author approves).
4. Progress: v1 localStorage importer kept + versioned, checksummed save code (import "Nhập mã lưu", export in settings). New origin -> no automatic carry-over from math.aigame3d.com (Q1). Bridge rewards frozen (+10 XP, +5 coins, combo >= 3, 5 levels).
5. Learning changes (Leitner, distractors, new interactions, 30-entry stats cap fix) only in 12+, never in parity phases.
6. Old-plan engine (`src/core/**`, `src/ui/kit/**`, `src/dev/**`): keep reusable parts from scout list, retire rest in 11; one engine only.
7. Old plan 261018-1803 = superseded (old files untouched).
8. (planner) Recovered VI->EN DOM translator stays for recovered UI; new code uses `defineStrings`. Language switch keeps reload.
9. Cosmetics shop YES (19, visual only, existing store API); 16/17 keep `owned_cosmetics` + sync. 10. Hosting: Vercel, `mathgame.vercel.app` (fallback name if taken). 11. WebMCP `read_adventure_progress` kept.

## Rollback
Commit + tag per phase (`recovery-pNN`); any swap reverts by restoring its shim to the legacy chunk. Deploy: Vercel instant rollback; old site never touched. `VITE_ENABLE_CLOUD` unset = local-only game. Supabase migrations forward-only.

## Validation Log (2026-10-18)
- Q naming? -> A: app "math3d", Milo -> "VLM"; rename after 09 parity sign-off, re-baseline.
- Q hosting? -> A: Vercel, new domain `mathgame.vercel.app`; save codes for carry-over.
- Q r186 look? -> A: retune to r180 (2h timebox, author approves screenshots).
- Q bridge rewards? -> A: keep original; `scoring.ts` must not override.
- Q WebMCP tool? -> A: keep, update exposed names.
- Q cosmetics shop? -> A: yes (~+6h) -> phase 19; keep `owned_cosmetics` in 16/17.

## Unresolved questions
1. Old domain math.aigame3d.com (needs host/DNS control): (a) redeploy recovered build + "export save code" page (~3h, not in total); (b) redirect to new domain, accept progress loss; (c) do nothing?
2. Division notation `:` vs `÷`, remainder exclusion, legal/consent review: carried from old plan Q1-Q3.
3. Docker Desktop must run on dev Mac for 16/17 (Supabase local) — install/start when?
