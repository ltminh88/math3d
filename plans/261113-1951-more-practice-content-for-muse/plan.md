---
title: More practice — longer play from the same world (brief for Muse)
description: A child finishes the whole game in about one hour. Add much more practice per level and a daily loop, reusing the existing generators and scenes. Work is done by the external agent Muse and reviewed before production.
status: pending
priority: P1
effort: to be estimated by Muse in step 0
branch: muse/* (pull requests into main)
tags: [learning, practice, levels, content, replay, muse]
created: 2026-11-13
relatesTo: plans/261031-1933-reasoning-geometry-and-map-expansion/
---

# More practice (brief for Muse)

## Problem (author, 2026-11-13)
The author's child finished everything in about **1 hour**. The game has the bridge quiz plus 8 levels,
each played once: field 5 rounds, forest 5, city 5, tower 7, garden 6, valley 6, workshop 6, cave 7
(47 rounds in total). After the cave there is nothing left to do. **Each topic needs far more practice.**

## Goal
- First play-through of fresh content: **at least 5 hours** (measure it: rounds × median seconds per round
  from the e2e runs, and state the estimate in the pull request).
- After that: a reason to come back every day (10–15 minutes), driven by the Leitner boxes already stored.
- One sitting stays short: a run is still 5–8 rounds. More practice means **more runs**, not longer runs.

## Read first (in this order)
1. `README.md` — scripts, versions.
2. `docs/code-standards.md` — layering, content rules, test rules. **These are binding.**
3. `docs/project-changelog.md` — what shipped last.
4. `src/learning/` (Leitner planner, `skill-catalog.ts`, `skill-tiers.ts`, recorder, scoring).
5. `src/reasoning/`, `src/geometry/`, `src/measurement/` — the seeded item generators (pure, no DOM/three).
6. `src/levels/shared/` (level host, gates, progression, `step-miss-budget.ts`) and one level end to end,
   e.g. `src/levels/garden/` with `tests/e2e/garden-level.spec.ts`.
7. `plans/261031-1933-reasoning-geometry-and-map-expansion/plan.md` — how chapter 2 was built and decided.

## Directions to design (ranked; Muse proposes the final shape in step 0)
1. **Stages inside each level** ("Chặng 1 · 2 · 3"). Re-entering a gate plays the next stage: other skills of
   the same topic, a higher tier, new scene dressing where cheap. The quest chain still unlocks after stage 1,
   so nobody is blocked. 8 levels × 3 stages turns 8 runs into 24.
2. **Daily practice with VLM** ("Luyện tập hôm nay"): about 10 items that are due in the Leitner boxes, mixed
   over everything learned so far, playable every day, small coin reward, a streak shown kindly (no penalty).
3. **Wider item pools.** Check every generator for how many distinct items it can produce per tier under the
   ≤100 rule; add story templates, shapes and contexts where a child would see repeats within three runs.
   Report the counts before and after.
4. **Mastery goals**: a sticker page per topic, earned when a skill reaches box 4 or higher, so replaying has
   a visible purpose. Cosmetic only (see the `shop/` rule).

## Out of scope
- New regions, roads or 3D worlds; anything that changes `REGIONS`, `ROADS`, `WALKABLE_BOUNDS` or the golden traces.
- Supabase, accounts, sync. New npm dependencies (ask first).
- Changing a shipped save-code format. New progress fields need a new `M3D<n>` and old codes must still load.
- Numbers above 100, unit conversions other than cm↔mm, hints that show the answer from rung 2 up.

## Rules that reviewers will check
- Child-facing text in Vietnamese for ages 7–9 (`vi` is the source, `en` required), SGK Toán 3 Kết nối tri thức wording.
- Every step playable by touch on phone and tablet, targets ≥44 px, no keyboard needed.
- ≤60 draw calls per level, no memory growth across enter/exit (see the `*-level-leak.spec.ts` tests).
- Code files under 200 lines, kebab-case names, pure logic stays free of `three` and DOM.
- A new behaviour gets the smallest test that would fail without it; a bug fix gets a test that fails first.
- Existing saves keep working: a child who already finished the cave must see the new stages as open, not lose stars.

## How to work
0. **Design first.** Open one pull request that only adds `phase-*.md` files in this folder: the chosen
   design, phases, effort, risks, and the play-time estimate. Wait for review before writing code.
1. One branch per phase, named `muse/<phase-slug>`, one pull request per phase into `main`, small enough
   to review (aim under ~800 changed lines without tests). Conventional commits.
2. Before every pull request run and paste the results:
   `npm run lint` · `npm run typecheck` · `npm test` · `npm run build` ·
   `node tools/recovery/golden/generate-golden-traces.mjs --check` ·
   `E2E_PORT=4178 npx playwright test --workers=2` (4 projects: desktop, phone, tablet portrait/landscape).
   `npm run test:parity` uses Mac-specific baselines; do not run it or change its baselines — the reviewer runs it.
3. **Staging only.** Deploy a preview of the branch and put its URL in the pull request:
   `npx vite build --outDir .preview/deploy --emptyOutDir` then
   `npx vercel@65.9.0 deploy .preview/deploy --yes --project mathgame` (**no `--prod`**, no alias, no domain
   commands). The Vercel token comes from the author as `VERCEL_TOKEN`; never write it to a file in the repo.
   Build without Supabase env (leave `VITE_ENABLE_CLOUD` empty): staging is guest-only.
4. Production (`https://math3d-game.vercel.app`) is deployed **only by the reviewer after the review passes
   and the author has tried the staging URL.** Never push to `main` directly.
5. Never commit secrets or any `.env*` file except `.env.example`.

## Done when
- The play-time goal is met and measured, the daily loop works across days (test with a faked clock).
- All gates above are green, the reviewer's parity run passes, the author has played staging on an iPad.
- `docs/project-changelog.md` and `docs/code-standards.md` describe the new stages and daily practice.

## Open questions for the author (answer in the design pull request)
- Is "3 stages per level" the right amount, or should the tables-heavy levels (field, forest, city) get more?
- Should the daily practice be reachable before the tower is finished?
