# Phase 05: Stages — city (Thành Phố Con Số)

## Context links
- [plan.md](plan.md), [phase-00-design.md](phase-00-design.md) (stage table, no-time-pressure rule),
  [phase-01-measure-pools-stage-model-and-save-code-m3d4.md](phase-01-measure-pools-stage-model-and-save-code-m3d4.md)
  (stage model, `level-stages.ts`, host `ctx.stage`)
- `src/levels/city/*` (`city-round-flow.ts`, `city-compare-round.ts`),
  `src/levels/shared/level-stages.ts`
- `src/levels/shared/reasoning-round-panel.ts`,
  `reasoning-round-slot.ts` (shared reasoning-round framework),
  `src/ui/kit/*` (step kit)
- `tests/e2e/city-level.spec.ts`, `tests/e2e/city-level-leak.spec.ts`

## Overview
- Priority P1. Status **not started**. Depends on 01 (stage model).
  Effort **10 h** (branch `muse/stages-city`, one PR into `main`).
- Give the city 6 stages (6 runs, 30 fresh rounds). Stage 1 is the
  current run, unchanged; the chain still unlocks after stage 1. One
  level, one PR (PR #1 review, point 3). City is a contingency level for
  the play-time goal (a 7th stage is added here if the author's timed
  playthrough on staging comes in under 5 h — see phase 00), so its
  stage plan is written so a 7th stage is a data change, not a redesign.

## Stage table — question type already exists, or new
Verified against the code. "ĐÃ CÓ" names the file; "MỚI" names what is
built and how it reuses the shared framework (PR #1 review, point 2).

| Stage | Content (5 rounds) | Type | File / reuse |
|---|---|---|---|
| S1 | Parcel delivery, lighting windows, reverse delivery | ĐÃ CÓ | `city-round-flow.ts` (`deliver \| windows \| reverse`) — stage 1 is today's run |
| S2 | Reverse delivery emphasis | ĐÃ CÓ | `city-round-flow.ts` (`reverse`, box ≥ 3) — emphasis only |
| S3 | Compare rounds ("gấp mấy lần?", missing number) | ĐÃ CÓ | `city-compare-round.ts` (skills `wp-times-compare`, `unknown-mul-div`, via `mountReasoningRound`) — today the last round once tables are known; here a regular round kind. No new UI. |
| S4 | Word problems, tables 6–9 | **MỚI (đấu nối)** | Reuses the shared reasoning-round framework: `mountReasoningRound` + step kit. Skills: `wp-times-then-add`, `wp-unit-then-times`, `wp-times-compare`. No city-specific panel. |
| S5 | Two-step delivery (× then +/−, small, ≤ 100) | **MỚI (đấu nối)** | A two-step word problem (`wp-times-then-add`) mounted through the shared reasoning-round panel + step kit, with the city's eyebrow/title only. **No city-specific two-step panel is built** — the step kit is the UI. |
| S6 | Mastery — mixed 6–9 | ĐÃ CÓ | `city-round-flow.ts` + `city-compare-round.ts` |

## Key Insights
- The city's three round kinds already rotate by box
  (`city-round-flow.ts`: reverse from box 3, deliver/windows otherwise),
  and its reasoning round already exists as a compare puzzle. Stages 2–3
  are therefore emphasis changes; only S4/S5 are new wirings, and both
  are the same wiring (shared reasoning round with a different skill
  list), so S5 costs little once S4 exists.
- The 7th-stage contingency lives in the stage plan as data: the plan
  maps stage → skill list, so adding S7 (mixed 6–9, tier 3 where earned)
  is one more table row plus strings — recorded here so phase 14 does not
  have to redesign it under time pressure.

## No time pressure (rule)
No countdown timer, no penalty for a slow answer, no copy that hurries the
child — in any stage. A two-step delivery round takes as long as it takes;
the step kit has no timer.

## Requirements
- **Stage plan** (`src/levels/city/city-stage-plan.ts`, pure, seeded):
  stage → kind mix + skill list; round count = the level's `rounds` (5).
  Tiers come from the Leitner box, never from the stage number.
- **S3 compare**: the compare round becomes a regular round kind in S3
  (planning change only).
- **S4/S5 word problems**: mount the shared reasoning round with the
  stage's skill list; city dressing is the eyebrow/title only.
- **Stage dressing, cheap only**: inside the city's own diorama builder
  (day/dusk window lights per stage). No world-scatter change, ≤ 60 draw
  calls, leak spec per stage.
- **Gate + celebration**: next uncompleted stage; gate pop-panel and
  celebration name the stage ("Chặng 2/6") in `vi` + `en`; replays keep
  best stars, pay per-question rewards only.
- **Tests**: unit tests for `city-stage-plan.ts` (stage → kinds, every
  number ≤ 100, deterministic per seed); e2e on all 4 projects playing
  stage 1 *and* one later stage via `seedStageProgress`, asserting
  `stageStars`, gate text, ≤ 60 draw calls; leak spec extended to a later
  stage. Touch: ≥ 44 px, tap-only, no key hints on coarse pointers.
- **Preview deploy**: preview of this branch (no `--prod`) with its URL
  in the pull request.

## Visible changes in the world outside the levels
- Gate pop-panel for the city gate: "Chặng {n}/6" + next-stage line.
- City celebration card: stage stars line.
- Nothing else in the world changes. The parity reviewer re-shoots the
  city gate pop-panel and the celebration card; these are intentional.

## Architecture
```
src/levels/city/city-stage-plan.ts (new, pure)
src/levels/city/index.ts (mod: stages: 6)
src/levels/city/city-round-flow.ts (mod: stage kind mix)
src/levels/city/city-compare-round.ts (mod: S3 regular slot, S4/S5 skill lists)
src/levels/city/city-scene.ts (mod: accept ctx.stage)
src/levels/city/city-strings.ts (mod: "Chặng {n}/6" vi/en)
src/levels/city/city-celebration.ts (mod: stage stars line)
tests/e2e/city-level.spec.ts (mod: stage coverage)
tests/e2e/city-level-leak.spec.ts (mod: later stage)
```
Files < 200 lines, kebab-case.

## Related code files
- Modify: the city folder + its e2e specs listed above.
- Create: `city-stage-plan.ts` (+ co-located test).
- Delete: none.

## Implementation Steps
1. RED stage-plan tests (S1 identical to today's rounds for a fixed seed);
   GREEN.
2. S3 compare promotion (planning only); S4/S5 reasoning-round wiring
   (one wiring, two skill lists).
3. Gate text + celebration stage line; replay path.
4. Leak spec for a later stage; draw-call check per stage.
5. Lint, typecheck, unit, build, golden `--check`, e2e on 4 projects,
   preview deploy + URL in PR.

## Todo list
- [ ] city stage plan (S1 parity test first)
- [ ] S3 compare promotion
- [ ] S4/S5 word-problem wiring (shared reasoning round)
- [ ] gate / celebration stage text + replay
- [ ] e2e + leak, 4 projects
- [ ] preview deploy + URL in PR

## Success Criteria
- Stage 1 is behaviour-identical to today for a fixed seed.
- Stages 2–6 play end to end on all 4 projects by tap alone; `stageStars`
  recorded; replays keep best stars.
- ≤ 60 draw calls per stage; no memory growth across enter/exit of any
  stage; every number ≤ 100.
- No countdown, no slow-answer penalty, no hurrying copy in any stage.
- Changed lines under ~800 without tests; PR carries a preview URL.

## Scope Contract
- Changed: the city folder + its e2e specs.
- Impacted: gate pop-panel text, celebration card, `stageStars` writes.
- Will verify: unit (stage plan), e2e (4 projects, incl. leak), golden
  check, preview playthrough by the author.
- Deliberately skipped: other levels (phases 03, 04, 06–10), daily (11),
  stickers (12), quest-card changes beyond the stage line (13), any
  world/scatter change, any city-specific two-step panel (shared step kit
  instead), the 7th stage itself (phase 14 only if the timed playthrough
  triggers it).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Stage 1 accidentally changes | M | H | S1 parity unit test; existing e2e untouched for S1 |
| S5 two-step rounds too hard for tables 6–9 at box 1 | M | M | S5 word problems follow the reasoning-round mastery gate (`reasoningSlot`); a fresh profile's S5 plans the two-step rounds it can play and fills the rest with delivery rounds |
| City on phones: 10-floor building framing (known QA fix M-5) regresses with a new stage | L | M | The stage changes no camera code; the city phone framing e2e re-runs per stage |

## Security Considerations
- None: no input parsing, no save-code change, no network.

## Next steps
- 06 (tower) after this lands; 13 integrates the gate/quest text; 14 runs
  the full 44-run chain e2e and owns the 7th-stage contingency.
