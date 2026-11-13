# Phase 08: Merge, full e2e, parity, staging, author review

## Context links
- [plan.md](plan.md) ("Done when" + "How to work" §2–§4), [phase-00-design.md](phase-00-design.md)
  (play-time estimate to re-measure), phases 01–07.
- `tests/e2e/*` (the full suite, 4 projects: desktop-chromium,
  mobile-pixel, tablet-portrait, tablet-landscape), `playwright.config.ts`
- `tools/recovery/golden/generate-golden-traces.mjs --check`
- Chapter 2 phase 09 (the merge precedent: 9-stage e2e, parity,
  real-input playthrough, deploy, author review).

## Overview
- Priority P1. Status **not started**. Depends on all phases. Last.
- Merge the phase branches in order, run every gate, re-measure the
  play-time estimate with real runs, deploy a *preview* (never
  production), and put the game in front of the author on an iPad.
  Nothing in this phase writes new game behaviour except fixes the gates
  find.

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
- The play-time number is re-measured here, not re-asserted: the
  instrumented round timings from phase 01 are collected across the
  full-chain e2e, the median per round kind is recomputed, and the
  phase-00 table is updated with the measured number. If the measured
  total is under 5 h, the city+tower 7th stage (phase 00 contingency)
  is built here as a fix, not deferred.
- Staging is the only deploy in this whole plan, and it is a preview:
  `npx vite build --outDir .preview/deploy --emptyOutDir` then
  `npx vercel@65.9.0 deploy .preview/deploy --yes --project mathgame`
  (**no `--prod`**, no alias, no domain commands), guest-only
  (`VITE_ENABLE_CLOUD` empty). The `VERCEL_TOKEN` comes from the author
  and is never written to a file in the repo.

## Requirements
- **Merge order**: 01 → 02 → 03 → 04 → 05 → 06 → 07, one PR per phase
  into `main` (each under ~800 changed lines without tests, conventional
  commits), each green on the gates below before the next merges. This
  phase owns the merge conflicts (expected: `quest-chain.ts`,
  `guide-dialog.ts`, `level-types.ts` touched by several phases —
  resolve by keeping the phase-01 model + the latest strings).
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
  phase 05 — re-run, not re-written).
- **Play-time re-measurement**: collect instrumented round durations
  from the chain run; recompute median s/round by kind and overall;
  update the phase-00 estimate table with the measured total. Daily
  sitting length is measured too (target 10–15 min for 10 items).
- **Author playthrough**: preview URL on an iPad (tablet-landscape +
  portrait), real input (touch only): one full stage per level (8
  stages), one daily run, the sticker book. Record the playthrough with
  screenshots per level (same pattern as chapter 2's
  `reports/chapter2-playthrough/`), plus the author's verdict on the
  two questions that matter most here: do the later stages feel like
  new practice or grinding, and is the daily loop findable via VLM?
  Fixes from the review land as follow-up commits in this phase, not as
  a new plan.
- **Reports**: `reports/pool-counts.md` (final before/after),
  `reports/playtime-measured.md` (measured median + total + daily
  sitting), `reports/author-review.md` (verdict + fixes), parity
  re-baseline note *only* if the reviewer attributes one (none expected:
  no visual change).

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
1. Merge 01–07 in order, gates green per PR.
2. Write the full-chain e2e; run the whole suite on 4 projects
   (`E2E_PORT=4178`, `--workers=2`).
3. Collect round timings; recompute the estimate; build the 7th stage
   for city + tower *only* if the measured total is under 5 h.
4. Preview deploy (staging only, no `--prod`); put the URL in the PR.
5. Author playthrough on iPad; record screenshots + verdict; fix what
   the review finds (wording, stage feel, daily findability).
6. Update `docs/project-changelog.md` with the final numbers; reviewer
   runs parity; reviewer promotes to production (never this phase).

## Todo list
- [ ] merge 01–07, gates green per PR
- [ ] full-chain e2e (44-run chain via seed hooks)
- [ ] play-time re-measurement (+ 7th-stage contingency if under 5 h)
- [ ] preview deploy, URL in PR
- [ ] author playthrough on iPad + review report
- [ ] changelog final numbers

## Success Criteria
- The play-time goal is met **and measured** (rounds × measured median
  s/round ≥ 5 h, reported in `playtime-measured.md`); the daily loop
  works across faked days and measures 10–15 min a sitting.
- All gates green; golden check byte-identical; reviewer's parity run
  passes; the author has played staging on an iPad.
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
| Measured play time lands under 5 h | M | H | Committed contingency (city+tower 7th stage) is built here; the estimate is updated, not hidden |
| Author finds later stages grindy | H | H | That is the point of the iPad playthrough *before* production; stage formats are data (phase 03/04), so a format swap is a small fix |
| A phase's merge conflict silently drops a behaviour | M | H | Per-phase e2e re-run after each merge; the chain spec is the backstop |

## Security Considerations
- Preview deploy is guest-only (no Supabase env); `VERCEL_TOKEN` is
  never written to a file. No secrets in any report or screenshot.

## Next steps
- Reviewer: parity run + production promotion. Author: play staging.
