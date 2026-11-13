# Phase 07: Quest card / HUD / migration / docs

## Context links
- [plan.md](plan.md), [phase-00-design.md](phase-00-design.md),
  [phase-03-stages-chapter-1-field-forest-city-tower.md](phase-03-stages-chapter-1-field-forest-city-tower.md),
  [phase-04-stages-chapter-2-garden-valley-workshop-cave.md](phase-04-stages-chapter-2-garden-valley-workshop-cave.md),
  [phase-05-daily-practice-with-vlm.md](phase-05-daily-practice-with-vlm.md),
  [phase-06-sticker-book-mastery.md](phase-06-sticker-book-mastery.md)
- `src/ui/quest-chain.ts`, `quest-chain-stage.ts`
  (`QUEST_CHAPTERS`: 2 chapters, ≤ 5 cells per chapter, "Chương n · k/m"),
  `quest-chain-strings.ts`
- `src/ui/hud.ts`, `src/ui/game-state.ts`, `src/ui/progress-sync.ts`
- `src/levels/shared/level-gates.ts`, `level-progression.ts`
  (`gateStatus`: locked / coming-soon / open / completed)
- `docs/code-standards.md`, `docs/project-changelog.md`
  (both must describe the new stages + daily practice when this phase lands)

## Overview
- Priority P1. Status **not started**. Depends on 03–06 (it integrates
  what they built; it builds no stage, daily or sticker behaviour itself).
- One integration phase: the quest card learns about stages, the HUD
  stays uncluttered, existing saves are verified end to end, and the docs
  describe the new world. Small by design — if it grows past ~800 lines,
  it splits by surface (quest card first, docs last).

## Key Insights
- The quest chain's unit is still the *level*, not the stage: the chain
  advances when stage 1 completes, exactly as today. Stages are shown
  *inside* the current level's card (a sub-line), not as new chain cells
  — the chain row is capped at 5 cells per chapter for a 412 px phone,
  and 44 stage cells would not fit and would confuse the "what do I do
  next" question. The card's job is "next step"; the gate's job is "which
  stage".
- A gate that is `completed` today must never *look* locked or finished
  after this change: it is "completed · Chặng 1/6" with the next stage
  open. The `gateStatus` return values do not change (`locked` /
  `coming-soon` / `open` / `completed`); what changes is the *copy* for
  `completed` (it now names the next stage) and a new `stage` field on
  the gate's pop-panel data.
- Docs are a deliverable of this phase, not an afterthought in phase 08:
  `code-standards.md` must describe the stage model, the daily planner
  and the sticker derivation (so the next agent does not re-invent them),
  and `project-changelog.md` must record the behaviour change for
  existing players (stage 1 inherits stars; daily unlock; M3D4).

## Requirements
- **Quest card**: the current level's card gains a sub-line "Chặng {n}/{m}
  · {stars} sao" (from `stageStars`) and, once all stages of a level are
  done, "Đã qua hết các chặng!". The chapter row ("Chương n · k/m") and
  its ≤ 5 cells are unchanged. The daily reminder line (phase 05) and the
  sticker-book button (phase 06) are finalised here for copy and
  placement — one line each, no new HUD chrome.
- **Gate pop-panel**: shows the next stage ("Chặng 2/6 — Vào chơi") and,
  for a fully completed level, "Chơi lại chặng…" (replay picker for
  completed stages, tap list, ≥ 44 px rows). Replaying a stage never
  re-locks anything and never re-pays the first-completion bonus.
- **HUD**: no new permanent HUD element. Daily + stickers live behind
  the quest card / VLM, per phases 05/06. If the author asked in the
  design review for a HUD daily button, *that* is built here (one
  button, ≥ 44 px, hidden while a level runs) — otherwise explicitly not
  built. Record the decision in this phase file's Implementation notes.
- **Migration verification (end to end, not just unit)**: a scripted
  check (e2e) that imports a shipped M3D3 code for a profile that
  finished the cave, then asserts: every level shows stage 1 complete
  with its old stars, stages 2+ open at 0, the quest card shows the
  closing card, the cave gate offers stage 2, and daily practice is
  unlocked with a pool drawn from the imported stats. A second check:
  a fresh profile sees stage 1 of field open and daily locked.
- **Docs**: `docs/code-standards.md` gains: the stage model
  (`stages`, `stageStars`, `level-stages.ts`, stage-1 inheritance,
  first-completion bonus on stage 1 only), the daily planner + streak
  rules, the sticker derivation rule + the `shop/` non-import rule
  restated for stickers. `docs/project-changelog.md` gains a dated entry
  for this work (stages, daily, stickers, M3D4, migration behaviour).
- **Tests**: e2e for the quest-card sub-line + gate replay picker on all
  4 projects (tap only on touch); the two migration e2e checks above;
  unit tests for the quest-card stage line (pure `quest-chain-stage.ts`
  helpers). No new test infrastructure.

## Architecture
```
src/ui/quest-chain.ts (mod: stage sub-line)
src/ui/quest-chain-stage.ts (mod: stage-aware helpers, pure)
src/ui/quest-chain-strings.ts (mod: stage lines vi/en)
src/levels/shared/level-gates.ts (mod: pop-panel stage data — verify file)
src/ui/hud.ts (mod ONLY if the author asked for a HUD daily button)
docs/code-standards.md (mod)
docs/project-changelog.md (mod)
tests/e2e/quest-chain-stages.spec.ts (new)
tests/e2e/save-migration-m3d3-to-m3d4.spec.ts (new)
```
Files < 200 lines, kebab-case. No world, level-scene or store change in
this phase.

## Related code files
- Modify: files above.
- Create: the two e2e specs.
- Delete: none.

## Implementation Steps
1. Quest-card stage sub-line + gate pop-panel stage text (strings vi/en);
   replay picker for completed stages.
2. HUD decision (build the button only if the design review asked for it;
   record the decision either way).
3. Migration e2e checks (M3D3 import → stages; fresh profile → daily
   locked).
4. Docs (`code-standards.md`, `project-changelog.md`).
5. Lint, typecheck, unit, build, golden `--check`, e2e on 4 projects.

## Todo list
- [ ] quest-card stage sub-line
- [ ] gate pop-panel + replay picker
- [ ] HUD daily button decision (build or record "not built")
- [ ] migration e2e (M3D3 import + fresh profile)
- [ ] docs

## Success Criteria
- A returning player (finished cave, M3D3 code) loses nothing and sees
  the new stages as open; a fresh player sees the intended unlock order.
- Quest card still fits a 412 px phone; chain row still ≤ 5 cells.
- Docs describe the stage model, daily and stickers well enough that a
  new agent could extend them without re-reading the code.
- No HUD clutter added without an explicit author decision.

## Scope Contract
- Changed: quest card, gate pop-panel, docs, two e2e specs (+ HUD button
  only on author request).
- Impacted: every surface that names a level's completion.
- Will verify: e2e (4 projects), migration e2e, golden check.
- Deliberately skipped: any stage/daily/sticker behaviour change (those
  phases own their behaviour; this phase only integrates and documents),
  any visual/world change.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| "Completed" gates read as "done forever" | M | H | Copy names the next stage explicitly; migration e2e asserts the gate offers stage 2 |
| Quest card overflows on phones with the extra lines | M | M | Sub-line is one line; e2e screenshots on phone + tablet portrait (assert no clipping, as chapter 2 did for quest cells) |
| Docs drift from the code (stage rules described wrong) | M | M | Docs quote the pure helpers' names; the reviewer checks docs against `level-stages.ts` |

## Security Considerations
- None: display + docs only; the migration e2e uses a shipped test code,
  never a real player's code.

## Next steps
- 08 (merge, full e2e, parity, staging, author review).
