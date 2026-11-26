# Phase 3: Look island region, level shell, gate, map

## Context links
- Parent: [plan.md](plan.md)
- Depends on: Phase 2 (lane order only); final wiring needs Phase 1 (shared English level scene,
  `ENGLISH_BOOKS.look`). Region/gate/map part runs in parallel with Phase 1.
- Research: [researcher-02](research/researcher-02-codebase-modes-and-second-island-report.md) §A
- Pattern: parent [Phase 1A](../261126-0700-english-island/phase-01a-island-region-level-shell.md)

## Overview
- Date: 2026-11-26
- Description: thirteenth region `look` (second islet, own look: lighthouse + flag) on existing
  walkable ground, its road, signpost board, strings, gate after the bridge, map entry, level
  shell `levels/look/` (8 stages × 8 rounds), save-code support.
- Priority: P2
- Implementation status: pending
- Owner: muse-88 (may move to muse-min via #11 if quota is short)
- Effort: 1.5d

## Key Insights
- Copy the `island` pattern exactly (table in researcher-02 §A): expansion config, baked builder
  into the same 3 meshes (+0 world draw calls), automatic pad + scatter clearing, gate after
  scatter. `REGIONS`, `ROADS`, `WALKABLE_BOUNDS` untouched → golden byte-identical.
- Site L1 (recommended, Q3): centre [-12, 31], 12×10 (x −18..−6, z 26..36); road
  `[-17.5,1]→[-17.5,24]→[-13,27]` starts on the west-road end. Probe village props on
  x −19..−16, z 2..24 first. Fallback L2: [-12, -32], road `[-10,-14]→[-10,-27]`.
- `expansion-roads.ts` order must match `EXPANSION_REGIONS`; the lookup test lists ids in order.
- Mode 1 lists CEC only: the English home must not show `look`.

## Requirements
- Functional
  - Region `look` in `ExpansionRegionId`, `EXPANSION_REGIONS` (unlock `'bridge'`), road, signpost
    board on `west-bridgehead`, vi/en strings ("Đảo Look" name, subtitle, blurb).
  - `look-region-builder.ts`: water ring + sand + plank bridge + small lighthouse + flag, collision
    via `blockAt`; visibly different from the CEC islet.
  - Gate `{levelId:'look', requires:'bridge', stages: 8, rounds: 8, sign:'Look'}`, commented
    `tables: [2]` like island.
  - `levels/look/index.ts` (`LevelDefinition`, self-registered) + `look-scene.ts` (own chunk,
    calls `english-level-scene` with `ENGLISH_BOOKS.look`) + `look-diorama-builder.ts` +
    `look-strings.ts` + `look-stage-plan.ts` (8 stage names from Q1).
  - `M3D3_LEVELS` gains `'look'`; round-trip test.
- Non-functional: draw calls ≤ 60 in the world and in the Look diorama; main chunk within 2 kB;
  targets ≥ 44 px.

## Architecture
- Gate config → level host → `levels/look/index.ts` → `look-scene.ts` chunk →
  `levels/shared/english-level-scene.ts` (Phase 1) → `startEnglishRun({book: look, ...})`.
- World: `expansion-world-builder.ts` bakes the Look builder next to the island one.

## Related code files
- Modify: `src/config/expansion-regions.ts`, `expansion-roads.ts`, `expansion-signposts.ts`,
  `expansion-region-strings.ts`, `expansion-region-lookup.test.ts` (`:35` id list),
  `src/config/level-gate-config.ts`, `src/world/expansion-world-builder.ts`,
  `src/levels/shared/level-host-strings.ts`, `src/store/save-code-v3-payload.ts` (+ test),
  `tests/e2e/level-gate.spec.ts`, `tests/e2e/level-draw-calls.spec.ts`
- Create: `src/world/regions/look-region-builder.ts`, `src/levels/look/**`,
  `tests/e2e/look-level.spec.ts`
- Do not touch: `english-run*`, `english-books.ts` (Phase 1), content files (Phase 4),
  `menu-language-start.ts` / English home (Phase 2)
- Delete: none

## Implementation Steps
1. Claim on #11; branch `muse/english-look-island` from latest main.
2. Probe L1: e2e/debug check that no village prop circle intersects the road corridor and the
   footprint; record the result in the PR. Fail → L2.
3. Expansion config + strings + lookup test; road starts on an original road segment.
4. Builder baked into the shared meshes; scatter clearing test covers the new footprint.
5. Gate + map entry + host strings; `M3D3_LEVELS` + round trip.
6. Level shell with a placeholder run until Phase 1 merges; then rebase and call the shared scene.
7. E2E: gate locked before bridge, opens after; enter/exit by tap; draw calls ≤ 60; region visible
   on the map; English-mode home does not list `look`.
8. Gates incl. golden `--check`; PR `parity-change` (world/map shots near the islets).

## Todo list
- [ ] Site probe L1 (fallback L2)
- [ ] Expansion config, road, signpost, strings, lookup test
- [ ] Baked Look islet + scatter clearing
- [ ] Gate, map, host strings
- [ ] `M3D3_LEVELS` `look` + round trip
- [ ] Level shell; wire shared scene after Phase 1
- [ ] E2E + PR `parity-change`

## Success Criteria
- Golden `--check` byte-identical; REGIONS tests untouched and green.
- `look` gate opens only after the bridge; playable by tap on 4 projects.
- Save code round trip keeps `look`; world draw calls unchanged.

## Risk Assessment
- Road crosses village props (L1). Mitigation: probe first, L2 fallback.
- Rebase vs Phase 1 on the scene. Mitigation: shell only imports the shared scene, never edits it.
- Two similar islets confuse the child. Mitigation: lighthouse + different sign + Vietnamese name.

## Security Considerations
- None: no secrets, no pack access.

## Next steps
- Phase 4 content plays in this shell; Phase 7 recaptures parity.
