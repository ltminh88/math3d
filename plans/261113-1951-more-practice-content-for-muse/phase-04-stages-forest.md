# Phase 04: Stages — forest (Rừng Nhân Chia)

## Context links
- [plan.md](plan.md), [phase-00-design.md](phase-00-design.md) (stage table, no-time-pressure rule),
  [phase-01-measure-pools-stage-model-and-save-code-m3d4.md](phase-01-measure-pools-stage-model-and-save-code-m3d4.md)
  (stage model, `level-stages.ts`, host `ctx.stage`)
- `src/levels/forest/*` (`forest-round-flow.ts`, `forest-remainder-round.ts`,
  `forest-fact-variety.ts`), `src/levels/shared/level-stages.ts`
- `src/levels/shared/reasoning-round-panel.ts`,
  `reasoning-round-slot.ts` (shared reasoning-round framework),
  `src/ui/kit/*` (step kit)
- `tests/e2e/forest-level.spec.ts`, `tests/e2e/forest-level-leak.spec.ts`

## Overview
- Priority P1. Status **not started**. Depends on 01 (stage model).
  Effort **8 h** (branch `muse/stages-forest`, one PR into `main`).
- Give the forest 6 stages (6 runs, 30 fresh rounds). Stage 1 is the
  current run, unchanged; the chain still unlocks after stage 1. One
  level, one PR (PR #1 review, point 3). This is the lightest of the
  chapter-1 stage phases: every stage-2–6 format already exists in the
  forest or in the shared reasoning-round framework — the work is
  promotion and wiring, not new round types.

## Stage table — question type already exists, or new
Verified against the code. "ĐÃ CÓ" names the file; "MỚI" names what is
built and how it reuses the shared framework (PR #1 review, point 2).

| Stage | Content (5 rounds) | Type | File / reuse |
|---|---|---|---|
| S1 | Sharing, packing, fact families (exact division, tables 2–5) | ĐÃ CÓ | `forest-round-flow.ts` (`share \| pack \| family`) — stage 1 is today's run |
| S2 | Remainders as regular rounds (quotient, then remainder; round-up "cần mấy giỏ?") | ĐÃ CÓ | `forest-remainder-round.ts` (`div-rem-floor`, `div-rem-ceil` on the step kit) — today the last round once divisions are known; here a regular round kind. No new UI. |
| S3 | Fact families (×/÷ inverse) emphasis | ĐÃ CÓ | `forest-round-flow.ts` (`family`, `familyEquations`) — emphasis only |
| S4 | Word problems — sharing in context | **MỚI (đấu nối)** | Reuses the shared reasoning-round framework: `mountReasoningRound` + step kit. Skills: `wp-divide-then-add`, `wp-more-less-then-total` (division contexts). No forest-specific panel. |
| S5 | Symbolic pack, no fruit dealing | ĐÃ CÓ | `forest-round-flow.ts`: a fact is symbolic once its box ≥ `SYMBOLIC_BOX` or the dividend exceeds `CONCRETE_MAX_FRUIT` — the mechanism already exists; S5 plans symbolic rounds. "Faster" = the dealing step is skipped, **not** a time limit (see the rule below). |
| S6 | Mastery — mixed 2–5 | ĐÃ CÓ | `forest-round-flow.ts` + `forest-remainder-round.ts` |

## Key Insights
- Division builds on multiplication: the forest already varies its facts
  (`forest-fact-variety.ts`) and already switches concrete → symbolic by
  box. Stages ride those two mechanisms; the stage plan
  (`forest-stage-plan.ts`, pure, seeded) only chooses *which* kinds the
  run emphasises.
- The remainder round is the clearest example of the reuse rule: it
  already exists as a step-kit round at the end of a run. Promoting it to
  a regular S2 round is a planning change (`planForestRun`), not a UI
  change — the panel, hints and recording are untouched.

## No time pressure (rule)
No countdown timer, no penalty for a slow answer, no copy that hurries the
child — in any stage, including S5. "Nhanh hơn" in S5 means the fruit
dealing is skipped (symbolic rounds); it never means a time limit.

## Requirements
- **Stage plan** (`src/levels/forest/forest-stage-plan.ts`, pure, seeded):
  stage → kind mix + skill list; round count = the level's `rounds` (5).
  Tiers come from the Leitner box, never from the stage number.
- **S2 remainders**: the remainder round becomes a regular round kind in
  S2 (planning change only).
- **S4 word problems**: mount the shared reasoning round with the S4
  skill list; no forest-specific panel.
- **Stage dressing, cheap only**: inside the forest's own diorama builder
  (different animal friends from `animal-friend-factory.ts` per stage).
  No world-scatter change, ≤ 60 draw calls, leak spec per stage.
- **Gate + celebration**: next uncompleted stage (`nextStage`); gate
  pop-panel and celebration name the stage ("Chặng 2/6") in `vi` + `en`;
  replays keep best stars, pay per-question rewards only.
- **Tests**: unit tests for `forest-stage-plan.ts` (stage → kinds, no
  kind twice in a row where avoidable, every number ≤ 100); e2e on all 4
  projects playing stage 1 *and* one later stage via `seedStageProgress`,
  asserting `stageStars`, gate text, ≤ 60 draw calls; leak spec extended
  to a later stage. Touch: ≥ 44 px, tap-only, no key hints on coarse
  pointers.
- **Preview deploy**: preview of this branch (no `--prod`) with its URL
  in the pull request.

## Visible changes in the world outside the levels
- Gate pop-panel for the forest gate: "Chặng {n}/6" + next-stage line.
- Forest celebration card: stage stars line.
- Nothing else in the world changes. The parity reviewer re-shoots the
  forest gate pop-panel and the celebration card; these are intentional.

## Architecture
```
src/levels/forest/forest-stage-plan.ts (new, pure)
src/levels/forest/index.ts (mod: stages: 6)
src/levels/forest/forest-round-flow.ts (mod: stage kind mix)
src/levels/forest/forest-remainder-round.ts (mod: S2 regular slot)
src/levels/forest/forest-scene.ts (mod: accept ctx.stage)
src/levels/forest/forest-strings.ts (mod: "Chặng {n}/6" vi/en)
src/levels/forest/forest-celebration.ts (mod: stage stars line)
tests/e2e/forest-level.spec.ts (mod: stage coverage)
tests/e2e/forest-level-leak.spec.ts (mod: later stage)
```
Files < 200 lines, kebab-case.

## Related code files
- Modify: the forest folder + its e2e specs listed above.
- Create: `forest-stage-plan.ts` (+ co-located test).
- Delete: none.

## Implementation Steps
1. RED stage-plan tests (S1 identical to today's rounds for a fixed seed);
   GREEN.
2. S2 remainder promotion (planning only); S4 reasoning-round wiring.
3. Gate text + celebration stage line; replay path.
4. Leak spec for a later stage; draw-call check per stage.
5. Lint, typecheck, unit, build, golden `--check`, e2e on 4 projects,
   preview deploy + URL in PR.

## Todo list
- [ ] forest stage plan (S1 parity test first)
- [ ] S2 remainder promotion
- [ ] S4 word-problem wiring (shared reasoning round)
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
- Changed: the forest folder + its e2e specs.
- Impacted: gate pop-panel text, celebration card, `stageStars` writes.
- Will verify: unit (stage plan), e2e (4 projects, incl. leak), golden
  check, preview playthrough by the author.
- Deliberately skipped: other levels (phases 03, 05–10), daily (11),
  stickers (12), quest-card changes beyond the stage line (13), any
  world/scatter change, any new round type (none is needed here).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Stage 1 accidentally changes | M | H | S1 parity unit test; existing e2e untouched for S1 |
| S2 remainders too hard too early (a fresh box-1 child) | M | M | Remainder rounds follow the same mastery gate as today (`reasoningSlot`: 3+ facts at box 3+ or the skill seen before); S2 of a fresh profile plans the rounds it can play and fills the rest with share/pack/family |
| S5 symbolic rounds feel like a different game | L | M | Symbolic mode already exists in the forest; S5 only plans more of it, with the same panel |

## Security Considerations
- None: no input parsing, no save-code change, no network.

## Next steps
- 05 (city) after this lands; 13 integrates the gate/quest text; 14 runs
  the full 44-run chain e2e.
