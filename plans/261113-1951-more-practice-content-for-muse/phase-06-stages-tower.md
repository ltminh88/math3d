# Phase 06: Stages — tower (Tháp Toán Học)

## Context links
- [plan.md](plan.md), [phase-00-design.md](phase-00-design.md) (stage table, no-time-pressure rule),
  [phase-01-measure-pools-stage-model-and-save-code-m3d4.md](phase-01-measure-pools-stage-model-and-save-code-m3d4.md)
  (stage model, `level-stages.ts`, host `ctx.stage`)
- `src/levels/tower/*` (`tower-question-formats.ts`,
  `tower-expression-floor.ts`, `tower-round-flow.ts`),
  `src/levels/shared/level-stages.ts`
- `src/levels/shared/reasoning-round-panel.ts`,
  `reasoning-round-slot.ts` (shared reasoning-round framework),
  `src/ui/kit/*` (step kit)
- `tests/e2e/tower-level.spec.ts`, `tests/e2e/tower-level-leak.spec.ts`

## Overview
- Priority P1. Status **not started**. Depends on 01 (stage model).
  Effort **9 h** (branch `muse/stages-tower`, one PR into `main`).
- Give the tower 6 stages (6 runs, 42 fresh rounds). Stage 1 is the
  current run, unchanged; the chain still unlocks after stage 1 — and the
  tower is the gate to chapter 2, so stage 1's unlock behaviour is the
  most safety-critical stage 1 in the plan. One level, one PR (PR #1
  review, point 3). Tower is a contingency level for the play-time goal
  (a 7th stage is added here if the author's timed playthrough on staging
  comes in under 5 h — see phase 00); its stage plan is written so a 7th
  stage is a data change.

## Stage table — question type already exists, or new
Verified against the code. "ĐÃ CÓ" names the file; "MỚI" names what is
built and how it reuses the shared framework (PR #1 review, point 2).

| Stage | Content (7 floors) | Type | File / reuse |
|---|---|---|---|
| S1 | Mixed ×/÷ over tables 2–9, weak facts first; formats rotate | ĐÃ CÓ | `tower-question-formats.ts` (`choice \| pad \| missing \| family \| truefalse`) + `tower-round-flow.ts` — stage 1 is today's run |
| S2 | Expression floors | ĐÃ CÓ | `tower-expression-floor.ts` (skills `expr-brackets`, `expr-order`, `tf-explain`, via `mountReasoningRound`) — today the top floor once facts are known; here a regular floor kind |
| S3 | True/false floors | ĐÃ CÓ | `tower-question-formats.ts` (`truefalse`: claim judged, then the result on the pad) — emphasis only |
| S4 | Word-problem floors | **MỚI (đấu nối)** | Reuses the shared reasoning-round framework: `mountReasoningRound` + step kit. Skills: `wp-times-then-add`, `wp-divide-then-add`, `wp-more-less-then-total`. No tower-specific panel. |
| S5 | Remainder floors | **MỚI (đấu nối)** | Reuses the shared reasoning-round framework: `mountReasoningRound` + step kit. Skills: `div-rem-floor`, `div-rem-ceil`. No new tower format is invented — the remainder is a reasoning skill, so it is asked as a reasoning floor. |
| S6 | Mastery climb — all tables 2–9, tier 3 where earned | ĐÃ CÓ | `tower-round-flow.ts` + `tower-expression-floor.ts` |

## Key Insights
- The tower already has the widest format rotation in the game (five
  formats) and its reasoning floor already exists. Stages 2–3 are
  emphasis changes; S4/S5 are the same wiring as each other (shared
  reasoning round, different skill list) and the same wiring city S4/S5
  uses — the second level to use it pays far less than the first.
- The tower's first-completion bonus and its role as the chapter-2 gate
  make stage-1 parity a hard requirement, not a nice-to-have: a stage-1
  regression here would lock a child out of chapter 2. The S1 parity
  test and the existing full-chain e2e are both gates for this phase.

## No time pressure (rule)
No countdown timer, no penalty for a slow answer, no copy that hurries the
child — in any stage. The tower already states this in its own code
(`tower-round-flow.ts`: "no timer, no lives"); stages keep it.

## Requirements
- **Stage plan** (`src/levels/tower/tower-stage-plan.ts`, pure, seeded):
  stage → format mix + skill list; floor count = the level's `rounds`
  (7). Tiers come from the Leitner box, never from the stage number.
- **S2 expression floors**: the expression floor becomes a regular floor
  kind in S2 (planning change only).
- **S4/S5 word problems + remainders**: mount the shared reasoning round
  with the stage's skill list; no tower-specific panel.
- **Stage dressing, cheap only**: inside the tower's own diorama builder
  (floor banners per stage). No world-scatter change, ≤ 60 draw calls,
  leak spec per stage.
- **Gate + celebration**: next uncompleted stage; gate pop-panel and
  celebration name the stage ("Chặng 2/6") in `vi` + `en`; replays keep
  best stars, pay per-question rewards only. Stage 1 completion still
  opens the garden gate exactly as today.
- **Tests**: unit tests for `tower-stage-plan.ts` (stage → formats, no
  format twice in a row, every number ≤ 100); e2e on all 4 projects
  playing stage 1 *and* one later stage via `seedStageProgress`,
  asserting `stageStars`, gate text, garden gate unlocked after stage 1,
  ≤ 60 draw calls; leak spec extended to a later stage. Touch: ≥ 44 px,
  tap-only, no key hints on coarse pointers.
- **Preview deploy**: preview of this branch (no `--prod`) with its URL
  in the pull request.

## Visible changes in the world outside the levels
- Gate pop-panel for the tower gate: "Chặng {n}/6" + next-stage line.
- Tower celebration card: stage stars line.
- Nothing else in the world changes. The parity reviewer re-shoots the
  tower gate pop-panel and the celebration card; these are intentional.

## Architecture
```
src/levels/tower/tower-stage-plan.ts (new, pure)
src/levels/tower/index.ts (mod: stages: 6)
src/levels/tower/tower-round-flow.ts (mod: stage format mix)
src/levels/tower/tower-expression-floor.ts (mod: S2 regular slot, S4/S5 skill lists)
src/levels/tower/tower-scene.ts (mod: accept ctx.stage)
src/levels/tower/tower-strings.ts (mod: "Chặng {n}/6" vi/en)
src/levels/tower/tower-celebration.ts (mod: stage stars line)
tests/e2e/tower-level.spec.ts (mod: stage coverage)
tests/e2e/tower-level-leak.spec.ts (mod: later stage)
```
Files < 200 lines, kebab-case.

## Related code files
- Modify: the tower folder + its e2e specs listed above.
- Create: `tower-stage-plan.ts` (+ co-located test).
- Delete: none.

## Implementation Steps
1. RED stage-plan tests (S1 identical to today's floors for a fixed seed);
   GREEN.
2. S2 expression-floor promotion (planning only); S4/S5 reasoning-round
   wiring (one wiring, two skill lists).
3. Gate text + celebration stage line; replay path; verify the garden gate
   still opens after stage 1 (existing chain e2e).
4. Leak spec for a later stage; draw-call check per stage.
5. Lint, typecheck, unit, build, golden `--check`, e2e on 4 projects,
   preview deploy + URL in PR.

## Todo list
- [ ] tower stage plan (S1 parity test first)
- [ ] S2 expression-floor promotion
- [ ] S4/S5 word-problem + remainder wiring (shared reasoning round)
- [ ] gate / celebration stage text + replay; garden gate check
- [ ] e2e + leak, 4 projects
- [ ] preview deploy + URL in PR

## Success Criteria
- Stage 1 is behaviour-identical to today for a fixed seed, and the
  garden gate opens after stage 1 exactly as today.
- Stages 2–6 play end to end on all 4 projects by tap alone; `stageStars`
  recorded; replays keep best stars.
- ≤ 60 draw calls per stage; no memory growth across enter/exit of any
  stage; every number ≤ 100.
- No countdown, no slow-answer penalty, no hurrying copy in any stage.
- Changed lines under ~800 without tests; PR carries a preview URL.

## Scope Contract
- Changed: the tower folder + its e2e specs.
- Impacted: gate pop-panel text, celebration card, `stageStars` writes,
  the chapter-2 gate (stage 1 only, behaviour unchanged).
- Will verify: unit (stage plan), e2e (4 projects, incl. leak + chain),
  golden check, preview playthrough by the author.
- Deliberately skipped: other levels (phases 03–05, 07–10), daily (11),
  stickers (12), quest-card changes beyond the stage line (13), any
  world/scatter change, any new tower format for remainders (shared
  reasoning floor instead), the 7th stage itself (phase 14 only if the
  timed playthrough triggers it).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Stage 1 accidentally changes → chapter 2 locked | M | H | S1 parity unit test + existing chain e2e (garden gate after tower) both gate this PR |
| S4/S5 reasoning floors feel detached from the climb | M | M | The reasoning floor already exists as the top floor; S4/S5 use the same mount, same panel, same celebration path |
| 7 floors × 6 stages is the longest grind in the plan | M | M | Format rotation is the variety; author playthrough on the preview judges it |

## Security Considerations
- None: no input parsing, no save-code change, no network.

## Next steps
- 07 (garden) after this lands; 13 integrates the gate/quest text; 14
  runs the full 44-run chain e2e and owns the 7th-stage contingency.
