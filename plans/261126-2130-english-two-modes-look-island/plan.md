---
title: "Hai chế độ Tiếng Anh + đảo Look 1"
description: "Mode 1 'Tiếng Anh lớp 1' (English home, CEC only, no 3D walk) + a second English island `look` for the Look 1 book in normal play"
status: pending
priority: P2
effort: 7d
branch: main
tags: [english, mode, region, level, content, pack]
created: 2026-11-26
---

# Hai chế độ Tiếng Anh + đảo Look 1

Welcome gets two big buttons: "Chơi game" (today's game) and "Tiếng Anh lớp 1" (an English home
page → CEC stage → island scene → back home). Normal play gains a second island, level id `look`,
for the Look 1 book. One shared progress. Every PR passes the AGENTS.md gates (lint, typecheck,
vitest, build, golden `--check`, Playwright on 4 projects, `tap()` only, targets ≥ 44 px).

## Phases
| # | Phase | Lane / owner | Depends | Effort | Status |
|---|---|---|---|---|---|
| 1 | [Engine per-book split](phase-01-engine-per-book-split.md) | muse-min | parent 2A (#85) merged | 1d | pending |
| 2 | [Mode select + English home](phase-02-mode-select-english-home.md) | muse-88 | — (parallel with 1) | 1.5d | pending |
| 3 | [Look island region + level shell](phase-03-look-island-region-level-shell.md) | muse-88 | 2 (lane order); wiring needs 1 | 1.5d | pending |
| 4 | [Look own content, skills, stickers](phase-04-look-own-content-skills-stickers.md) | muse-min | 1; e2e needs 3; parent 6 | 1.5d | pending |
| 5 | [Look audio clips](phase-05-look-audio-clips.md) | muse-88 | 4, parent 2C | 0.5d | pending |
| 6 | [Per-book pack function](phase-06-per-book-pack-function.md) | reviewer | 1, parent 4 | 0.75d | pending |
| 7 | [Parity + docs](phase-07-parity-and-docs.md) | reviewer | 2, 3 (docs after 4–6) | 0.25d | pending |

Lane muse-min: parent 2A → **1** → parent 6 (now book-aware) → **4**.
Lane muse-88: parent 2C → **2** → **3** → **5** (quota tight until 27/11 20:37; 3 may move to
muse-min via #11 if muse-88 is short). Reviewer: parent 4 → **6**, **7**.
Parallel: 1 ∥ 2; 3's region/gate/map part ∥ 1 (rebase to wire the shared scene, as 1A did).

## Author decisions (fixed)
- **Mode 1 "Tiếng Anh lớp 1":** own English home, world never activated; CEC book only; exit
  from the island scene returns to the home. Mode chosen at the welcome every time, last choice
  pre-selected (`appSettings.playMode`, device-level, no save-code change); "Về menu" switches.
- **Shared progress:** `levelProgress.island`, stickers and `sk:en-*` are the same in both modes.
- **Normal play:** everything as today + CEC island + a separate `look` island on existing
  walkable ground, expansion-region pattern, golden byte-identical. Both gates `requires: 'bridge'`.
- **Repo public:** own content only; Look book text verbatim only in the local pack.
- **Spelling per book:** CEC British, Look 1 American (to confirm, Q2).
- Out of scope: per-child profiles, Look in mode 1, Supabase.

## Key risks
- **Exit target:** start failure, loop crash and abort must land on the English home, never on a
  dead/inactive world (Phase 2 e2e covers all 3 host exit paths).
- **Collisions:** `english-run.ts` touched by 2A → Phase 1 waits for #85; `sticker-book-strings.ts`
  owned by parent Phase 6 → Phase 4 follows it in the same lane; `audio-map.ts` owned by 2C's
  generator → Look gets its own generated `audio-map-look.ts`.
- **Save codes:** `MAX_STAGE_STARS = 8` → Look stays at 8 stages (Q1); `look` joins
  `M3D3_LEVELS`; `en-look-*` appended to the catalog, never reordered.
- **Golden / draw calls:** new region baked into the existing meshes (+0 draw calls); road
  probe for site L1 before building.
- **Copyright:** Muses never open `English /`; `check-overlap.mjs` per book before each deploy.

## Research
- [Brainstorm + author decisions](../reports/brainstorm-261126-english-two-modes.md)
- [Look 1 book survey](research/researcher-01-look1-book-report.md)
- [Codebase: modes + second island](research/researcher-02-codebase-modes-and-second-island-report.md)
- Parent plan: [English Island](../261126-0700-english-island/plan.md)

## Unresolved questions (validation, recommended answer in bold)
1. Look has Starter + 12 units but the save code caps stages at 8. → **8 stages: Starter, U1–2,
   U3–4, U5–6, U7–8, U9–10, U11–12, full review** (mirrors the book's review-every-2-units; no
   M3D7). Alternative: 13 stages + M3D7 decoder bump (+0.5d, more risk).
2. Look spelling? → **American, as its book** (color, favorite, mom); CEC stays British. Each
   island is consistent inside itself; Vietnamese UI copy is unaffected.
3. Look island site? → **L1 [-12, 31]** (pairs with the CEC island, road from the west-road end),
   after a prop probe on x −19..−16, z 2..24; fallback **L2 [-12, -32]**.
4. Parent Phase 6 (English in daily practice) order? → **Start after Phase 1**, so it reads
   skills per book once; Look skills join daily only when the `look` gate is open.
5. Look item scope for a grade-1 child? → **Tap only: 2–3-choice picks with audio, tile ordering
   ≤ 4 tiles, question prompt shown above fill/order items; core words + patterns + phonics;
   reading-extra words only in the review stage.** No typing.
6. Look stickers? → **Own "Look 1" sticker page** (one sticker per unit skill pair), separate
   from the CEC page.
