# Phase 14: Merge, full e2e, parity, staging, author review

## Context links
- [plan.md](plan.md) ("Done when" + "How to work" §2–§4), [phase-00-design.md](phase-00-design.md)
  (play-time estimate — measured by the author, not by e2e), phases 01–13.
- `tests/e2e/*` (the full suite, 4 projects: desktop-chromium,
  mobile-pixel, tablet-portrait, tablet-landscape), `playwright.config.ts`
- `tools/recovery/golden/generate-golden-traces.mjs --check`
- Chapter 2 phase 09 (the merge precedent: 9-stage e2e, parity,
  real-input playthrough, deploy, author review).

## Overview
- Priority P1. Status **not started**. Depends on all phases. Last.
  Effort **14 h** (branch `muse/merge-more-practice`, one PR).
- Merge the phase branches in order, run every gate, deploy the *merged*
  preview (never production), and put the game in front of the author on
  an iPad — **the author times the child playing the preview; that
  timing is the play-time measurement**. Nothing in this phase writes new
  game behaviour except fixes the gates find.

## Key Insights
- The full chain is now 44 runs, not 9 stages. The e2e must *not* walk
  the world 44 times: the chain spec seeds progress
  (`seedProgress`, `seedStageProgress`, `teleportToGate`) and plays one
  run per stage *kind* per level, plus a complete stage-1→stage-2→
  replay path for one level end to end. Coverage of every stage's
  content lives in the per-phase unit tests + per-level e2e specs; this
  phase's chain spec proves the *chain* (unlocks, gates, quest card,
  stars, migration) holds together.
- Parity is the reviewer's run (`npm run test:parity`, Mac-specific
  baselines) — this phase does **not** run it or touch its baselines
  (plan.md §2). What this phase *does* run is the golden check, which
  must be byte-identical: no phase in this work touches the world, so a
  golden diff here means a phase leaked a world change and must be
  reverted, not re-baselined.
- The play-time number is measured here, not re-asserted — **by the
  author timing the child on the staging preview**, not by any test
  run. E2e robots click many times faster than a child, so an
  e2e-derived median is unusable and no timing is attached to any test
  hook (PR #1 review, point 4). The author playthrough records the
  timed total; the phase-00 table is updated with that number. If the
  timed total is under 5 h, the city+tower 7th stage (phase 00
  contingency) is built here as a fix, not deferred.
- Staging is **not** the only deploy in this plan — every PR with code
  (phases 01–13) already shipped its own preview, so the author could
  let the child play each piece early (PR #1 review, point 1; `plan.md`
  §3). This phase's deploy is the *merged whole*: `npx vite build
  --outDir .preview/deploy --emptyOutDir` then
  `npx vercel@65.9.0 deploy .preview/deploy --yes --project mathgame`
  (**no `--prod`**, no alias, no domain commands), guest-only
  (`VITE_ENABLE_CLOUD` empty). The `VERCEL_TOKEN` comes from the author
  and is never written to a file in the repo.

## Requirements
- **Merge order**: 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 →
  11 → 12 → 13, one PR per phase into `main` (each under ~800 changed
  lines without tests, conventional commits), each green on the gates
  below before the next merges. This phase owns the merge conflicts
  (expected: `quest-chain.ts`, `guide-dialog.ts`, `level-types.ts`
  touched by several phases — resolve by keeping the phase-01 model +
  the latest strings).
- **Gates (every PR, pasted into the PR)**:
  `npm run lint` · `npm run typecheck` · `npm test` · `npm run build` ·
  `node tools/recovery/golden/generate-golden-traces.mjs --check` ·
  `E2E_PORT=4178 npx playwright test --workers=2` (4 projects).
  `npm run test:parity` is *not* run here.
- **Full-chain e2e** (`tests/e2e/full-chain-stages.spec.ts`, new):
  seeds a fresh profile, walks bridge → field S1 → … → cave S1 (unlock
  order), then field S2 and a replay, asserting at each step: gate
  status, quest-card stage, `stageStars`, chain advance. Plus the
  migration path (import a shipped M3D3 code → all stages open as
  designed). Plus the daily loop across faked days (already covered in
  phase 11 — re-run, not re-written).
- **Play-time measurement (author-timed)**: the author times the child
  playing the staging preview (one full stage per level, timed per
  level); the timed total is recorded in `reports/playtime-measured.md`
  and the phase-00 estimate table is updated with it. Daily sitting
  length is timed the same way (target 10–15 min for the day's items).
  No e2e timing is collected, and no timing is attached to any test
  hook.
- **Author playthrough**: preview URL on an iPad (tablet-landscape +
  portrait), real input (touch only): one full stage per level (8
  stages), one daily run, the sticker book. Record the playthrough with
  screenshots per level (same pattern as chapter 2's
  `reports/chapter2-playthrough/`), plus the author's verdict on the
  questions that matter most here: do the later stages feel like new
  practice or grinding, is the daily loop findable via VLM **and** the
  HUD button, and does the HUD button stay clear of the movement
  controls? Fixes from the review land as follow-up commits in this
  phase, not as a new plan.
- **Reports**: `reports/pool-counts.md` (final before/after),
  `reports/playtime-measured.md` (author-timed total + daily sitting),
  `reports/author-review.md` (verdict + fixes), parity re-baseline note
  listing the intentional visible changes (gate "Chặng n/m" text,
  celebration stage lines, quest-card stage sub-line + daily line +
  sticker-book button, HUD daily button, VLM daily entry) — the reviewer
  re-shoots those baselines; no other visual change is expected.

## Architecture
```
tests/e2e/full-chain-stages.spec.ts (new)
plans/261113-1951-more-practice-content-for-muse/reports/playtime-measured.md (new)
plans/261113-1951-more-practice-content-for-muse/reports/author-review.md (new)
```
No game code is *planned* in this phase; fixes found by the gates land
as small commits in the owning phase's folder.

## Related code files
- Modify: merge conflicts only; docs if the measured numbers move.
- Create: the chain spec + the two reports.
- Delete: none.

## Implementation Steps
1. Merge 01–13 in order, gates green per PR.
2. Write the full-chain e2e; run the whole suite on 4 projects
   (`E2E_PORT=4178`, `--workers=2`).
3. Author times the child on staging; record the timed total; build the
   7th stage for city + tower *only* if the timed total is under 5 h
   (the 7th stage is a data change in the two stage plans — see phases
   05/06 — never a lengthened run).
4. Preview deploy (the merged whole, no `--prod`); put the URL in the PR.
5. Author playthrough on iPad; record screenshots + verdict; fix what
   the review finds (wording, stage feel, daily findability, HUD
   placement).
6. Update `docs/project-changelog.md` with the final numbers; reviewer
   runs parity (re-shooting the intentional visible changes listed in
   this phase's Reports); reviewer promotes to production (never this
   phase).

## Todo list
- [ ] merge 01–13, gates green per PR
- [ ] full-chain e2e (44-run chain via seed hooks)
- [ ] author-timed play-through (+ 7th-stage contingency if under 5 h)
- [ ] preview deploy of the merged whole, URL in PR
- [ ] author playthrough on iPad + review report
- [ ] changelog final numbers

## Success Criteria
- The play-time goal is met **and timed by the author** (timed total
  ≥ 5 h, reported in `playtime-measured.md`); the daily loop works across
  faked days and times 10–15 min a sitting.
- All gates green; golden check byte-identical; reviewer's parity run
  passes (with the intentional visible changes re-shot); the author has
  played staging on an iPad.
- `docs/project-changelog.md` and `docs/code-standards.md` describe the
  new stages and daily practice.
- Production is deployed **only by the reviewer after review passes**
  (plan.md §4) — this phase never pushes to `main` directly and never
  runs a `--prod` deploy.

## Scope Contract
- Changed: merge integration, one chain e2e spec, measurement + review
  reports.
- Impacted: everything merged before it (fixes only).
- Will verify: the full gate list, the chain spec, the measured numbers,
  the author playthrough.
- Deliberately skipped: any new behaviour beyond review fixes; parity
  baselines (reviewer's run); production deploy.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| 44-run chain e2e is too slow/flaky on CI | M | H | Seed hooks, not world-walking; one run per stage kind; `--workers=2`; the chain spec is the *only* spec that walks the chain |
| Timed play time lands under 5 h | M | H | Committed contingency (city+tower 7th stage) is built here; the estimate is updated, not hidden |
| Author finds later stages grindy | H | H | That is the point of the iPad playthrough *before* production; stage formats are data (phases 03–10), so a format swap is a small fix |
| A phase's merge conflict silently drops a behaviour | M | H | Per-phase e2e re-run after each merge; the chain spec is the backstop |

## Security Considerations
- Preview deploy is guest-only (no Supabase env); `VERCEL_TOKEN` is
  never written to a file. No secrets in any report or screenshot.

## Next steps
- Reviewer: parity run + production promotion. Author: play staging.
