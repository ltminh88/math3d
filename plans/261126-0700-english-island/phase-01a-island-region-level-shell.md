# Phase 1A: island region, level shell, gate, map

## Context links
- Parent: [plan.md](plan.md)
- Depends on: Phase 0 only for the final wiring step (runs in parallel with it)
- Docs: `docs/code-standards.md` (chapter-2/3 expansion pattern, stage model), `AGENTS.md`
- Reference code: `src/world/regions/numberfort-region-builder.ts`, `src/levels/numberfort/`

## Overview
- Date: 2026-11-26
- Description: twelfth region `island` (🏝️), its gate after the bridge, map entry, level shell
  with 8 stages × 8 rounds, save-code support.
- Priority: P2
- Implementation status: assigned (message R52, branch `muse/english-island-region`)
- Review status: not reviewed
- Owner: Lane A, muse-88
- Effort: 1d

## Key Insights
- Order: region, map and gate work first; once Phase 0 merges, rebase and wire
  `startEnglishRun` into the level shell.
- Expansion pattern: `expansion-*` config, a baked region builder, scatter clearing after the
  pass. `REGIONS`, `ROADS` and `WALKABLE_BOUNDS` stay untouched; golden stays byte-identical.
- Side region: it is not part of the math quest chain. Touch `src/ui/quest-chain*.ts` only if
  the author asks.
- `tables: [2]` is a required field with no meaning here; comment it as numberfort does.

## Requirements
- Functional
  - Baked islet (pond ring, sand, palms, plank bridge) on walkable ground, placed with the
    free-ground probe.
  - Gate: `requires: 'bridge'`, `stages: 8`, `rounds: 8`.
  - Level shell loads its scene through dynamic `import()` (own chunk) and calls
    `startEnglishRun(port)`.
  - Save code keeps `island` in a round trip.
- Non-functional: draw calls ≤ 60; main chunk unchanged within 2 kB; all touch targets ≥ 44 px.

## Architecture
- Gate config → level host → `levels/island/index.ts` (`LevelDefinition`, self-registered via
  `import.meta.glob`) → scene chunk → `startEnglishRun` (Lane B owns the run internals).
- World: `expansion-world-builder.ts` adds the island builder; scatter clearing removes props
  under the islet.

## Related code files
- Modify
  - `src/config/expansion-regions.ts`, `expansion-roads.ts`, `expansion-signposts.ts`,
    `expansion-region-strings.ts`
  - `src/config/level-gate-config.ts`
  - `src/world/expansion-world-builder.ts`, `src/world/expansion-scatter-clearing.ts`
    (+ its test)
  - `src/levels/shared/level-host-strings.ts`
  - `src/store/save-code-v3-payload.ts` (`M3D3_LEVELS`)
  - `tests/e2e/level-draw-calls.spec.ts`, `tests/e2e/chapter3-regions.spec.ts` (or a new region spec)
  - `src/ui/quest-chain*.ts`: only if the author wants the island in the chain
- Create
  - `src/world/regions/island-region-builder.ts` (new)
  - `src/levels/island/**` (new)
  - `tests/e2e/island-level.spec.ts` (new), `tests/e2e/island-level-leak.spec.ts` (new)
- Delete: none

## Implementation Steps
1. Read board #11 and recent main; claim the lane.
2. Add the region, road, signpost and strings to the `expansion-*` config.
3. Build the baked islet; place it with the free-ground probe; extend scatter clearing.
4. Add the gate (`requires: 'bridge'`, 8 stages, 8 rounds, commented `tables: [2]`).
5. Create `src/levels/island/` (definition, scene chunk, test hook) with a placeholder run.
6. Add `island` to `M3D3_LEVELS`; extend the save-code round-trip test.
7. Write the e2e specs (gate opens after bridge, enter/exit, no leak, draw calls ≤ 60).
8. After Phase 0 merges: rebase, replace the placeholder with `startEnglishRun(port)`.
9. Run all gates; open PR with label `parity-change` listing the changed shots.

## Todo list
- [ ] Expansion config + strings
- [ ] Island region builder + scatter clearing
- [ ] Gate after bridge
- [ ] Level shell chunk + test hook
- [ ] Save code `island`
- [ ] E2E: level, leak, draw calls, region
- [ ] Rebase on Phase 0, wire `startEnglishRun`
- [ ] PR with `parity-change`

## Success Criteria
- Golden `--check` and `REGIONS` tests untouched and green; draw calls ≤ 60.
- Gate opens only after the bridge; island playable by tap on all 4 Playwright projects.
- Save-code round trip keeps `island`.

## Risk Assessment
- Islet overlaps scatter or roads. Mitigation: free-ground probe + clearing test.
- Rebase conflict with Phase 0 on `english-run.ts`. Mitigation: 1A only imports it, never edits it.
- Parity shots change. Mitigation: `parity-change` label; reviewer recaptures in Phase 5.

## Security Considerations
- None beyond the usual: no secrets, no pack access.

## Next steps
- Phase 2A (own content) on the same lane; Phase 5 parity after 1A and 1B merge.
