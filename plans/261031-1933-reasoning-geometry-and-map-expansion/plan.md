---
title: Reasoning, geometry and map expansion (chapter 2)
description: Harder KNTT-style reasoning in the bridge quiz and 4 levels, adaptive by Leitner box; 3 new map regions (geometry valley, measurement workshop, puzzle cave) plus a garden level; 9-stage quest chain; full touch play on phones and tablets.
status: in-progress
priority: P1
effort: ~126h
branch: main
tags: [learning, reasoning, geometry, measurement, map, levels, kntt, touch, tablet]
created: 2026-10-31
blockedBy: []
relatesTo: plans/261024-1515-city-and-tower-levels/
---

# Chapter 2: lập luận, hình học, đo lường + mở rộng bản đồ

Quest chain: bridge → field → forest → city → tower → **garden → valley → workshop → cave** → done. Content follows SGK Toán 3 Kết nối tri thức (GDPT 2018), for 7–9 year olds.

## Decisions (author, 2026-10-31)
- Reasoning items: 2-step word problems; unknowns, patterns, expressions with brackets; division with remainder in context, choose-all-correct, true/false + fix/explain; difficulty rises with the skill's Leitner box.
- One reasoning round kind in bridge quiz, field, forest, city, tower (gated by mastery, gameplay kept).
- New regions: Thung Lũng Hình Học (`valley`), Xưởng Đo Đạc (`workshop`), Hang Đố Vui (`cave`); level for Khu Vườn Bên Sông (`garden`).
- Architecture (controller): `REGIONS`/`ROADS`/`WALKABLE_BOUNDS` byte-equal (goldens); expansion regions/roads in a post-scatter list; skill keys `sk:<id>` from a fixed catalog; save code `M3D3`; pure seeded generators.

## Phases
| # | Phase | Effort | Depends | Status |
|---|---|---|---|---|
| 01 | [Skill keys, reasoning generators, tiers, M3D3, step kit, tablet e2e project](phase-01-skill-keys-reasoning-generators-and-save-code-m3d3.md) | 18h | – | Done (merged) |
| 02 | [Geometry + measurement generators (pure), KNTT verification](phase-02-geometry-and-measurement-generators.md) | 10h | 01 catalog commit | Done (merged) |
| 03 | [Map expansion: regions, roads, gates, scenery, map/HUD, quest chain, shell touch audit](phase-03-map-expansion-regions-gates-and-quest-chain.md) | 18h | – | Done (merged) |
| 04 | [Reasoning rounds in bridge quiz + field/forest/city/tower; touch fixes there](phase-04-reasoning-rounds-in-bridge-quiz-and-levels.md) | 14h | 01 | Pending |
| 05 | [Garden level "Khu Vườn Quy Luật"](phase-05-garden-level.md) | 12h | 01, 03 | Pending |
| 06 | [Geometry valley level "Thung Lũng Hình Học"](phase-06-geometry-valley-level.md) | 15h | 01, 02, 03 | Pending |
| 07 | [Measurement workshop level "Xưởng Đo Đạc"](phase-07-measurement-workshop-level.md) | 15h | 01, 02, 03 | Pending |
| 08 | [Puzzle cave level "Hang Đố Vui"](phase-08-puzzle-cave-level.md) | 12h | 01, 02, 03 | Pending |
| 09 | [Merge, 9-stage e2e, parity, real-input playthrough, deploy, author review](phase-09-merge-e2e-parity-deploy-and-author-review.md) | 12h | all | Pending |

## Dependencies and parallel groups (ownership by folder)
- Group A (parallel): 01 → `src/learning/**`, `src/reasoning/**`, `src/store/**`, `src/ui/kit/**`, `levels/shared/test-debug-hook.ts`, `playwright.config.ts`, `package.json`. 03 → `src/config/expansion-*`, `level-gate-config.ts`, `src/world/**`, `src/map/**`, `src/ui/quest-chain*`, HUD area label, `levels/shared/level-progression.ts` + `level-host-ports.ts`, `src/ui/book-help-*`. 02 starts once 01 lands `src/learning/skill-catalog.ts` → owns `src/geometry/**`, `src/measurement/**`.
- Group B (parallel, after A): 04 → `src/quiz/**`, `src/ui/quiz-*`, `src/levels/{field,forest,city,tower}/**`; 05–08 → own `src/levels/<id>/**` + `tests/e2e/<id>-*`. Registry refuses a level without its gate, so 05–08 need 03's `LEVEL_GATES`.
- 09 last. Worktrees per phase; own `E2E_PORT` (4180/4190 reserved for the author preview).

## Touch & tablet (cross-cutting, author 2026-10-31)
- Everything playable on phone **and tablet** touch screens with no keyboard. Every key has an on-screen path: E → `#interact` button / tap the gate; digits/Enter → kit number pad; H → hint button; arrows/R (rotate) → on-screen buttons; drag → tap-select (WCAG 2.5.7).
- e2e projects: `desktop-chromium`, `mobile-pixel`, new `tablet-portrait` + `tablet-landscape` (iPad Pro 11 viewport, Chromium, `hasTouch`, `isMobile`, coarse pointer) added in 01. Every level phase runs desktop + phone + both tablet projects; touch specs use `tap()` only.
- Each phase's Success Criteria: no step requires a keyboard; targets ≥44 px; no "nhấn E"/key hints on `(pointer: coarse)`; layouts checked at tablet portrait + landscape.
- Parity stays on its 2 recovered projects (no tablet baselines; never compare across machines).

## Constraints carried over
- Goldens byte-identical (`generate-golden-traces.mjs --check`); new world objects reshuffle seeded quiz content (three UUIDs draw `Math.random`) → attributed re-baselines (03 world, 09 final).
- Each level: own chunk, ≤60 draw calls, 10-cycle leak spec with settled baseline, test hook in test builds only, no `openDialog`, keys on `document` with `ctx.disposer.signal`.
- Files <200 lines, kebab-case; `learning/`, `reasoning/`, `geometry/`, `measurement/`, `store/` pure (no three/DOM). Never change a shipped save format.

## Out of scope
- Supabase sync/accounts (SQL check pattern only documented), new cosmetics, CTST/Cánh diều content, numbers above 100 (author cap).

## Author answers (2026-10-31)
- Chapter 2 (garden → valley → workshop → cave) opens only after the tower: one 9-stage chain.
- **Numbers ≤100 everywhere**: every number in a prompt, every intermediate result and every answer ≤100 (all tiers, all levels, measurement too). Tiers raise reasoning (steps, brackets, distractors), not number size. Conversions that need 1000 (kg↔g, l↔ml, m↔mm) are out; cm↔mm (1 cm = 10 mm) stays.
- Garden = "Khu Vườn Quy Luật": number patterns, find the unknown, expressions with brackets.
- Quest card: two chapters, one row of ≤5 cells per chapter + "Chương n · k/m" label.

## Still defaults (author may override at review)
- Rounds per level 6/6/6/7; at most 1 reasoning round per run in old levels.
- Region placement: valley north-east bank, workshop south-east bank, cave west bank (final coords from 03's probe).
- "Hình vuông cũng là hình chữ nhật" in choose-all only if KNTT wording confirms (02 verifies).
