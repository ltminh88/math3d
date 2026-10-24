# Phase 01: Gates, progression and quest chain for city/tower

## Context links
- [plan.md](plan.md)
- [old phase 13 level host](../261018-1917-recover-and-continue-math-game/phase-13-level-host-and-region-progression.md) (Implementation notes and Review fixes)
- Code: `src/config/regions.ts` (`LEVEL_GATES`, `GateRequirement`, `COMING_SOON_REGIONS`), `src/levels/shared/level-progression.ts`, `level-gates.ts`, `level-host-strings.ts`, `level-registry.ts`, `test-debug-hook.ts`, `src/ui/quest-chain-stage.ts`, `quest-chain.ts`, `quest-chain-strings.ts`, `guide-dialog.ts`, `map-overlay.ts`, `world-labels.ts`

## Overview
- Priority: P1. Status: pending. Blocks 02 and 03.
- Make the shared layer ready for two more levels so that 02 and 03 only add their own folders.

## Key Insights
- `GateRequirement = 'bridge' | 'field' | null` and `LevelGate.levelId: 'field' | 'forest'` are closed unions. Widen them to `'forest' | 'city'` and `'city' | 'tower'`.
- The registry validates each level folder against its gate, so the gates must land before the levels. A gate without a level shows "Sắp ra mắt" (coming-soon status), so after this phase alone city/tower still look "coming soon", now on a real gate.
- `COMING_SOON_REGIONS` currently badges city/tower labels and the map. Once a gate exists, the gate status takes over. Empty the set, or drop it if nothing else uses it.
- Quest stages are `bridge | field | forest | done`. Add `city | tower`.
- City centre (57, 20) size 18; tower centre (57, -22) size 14. Gates go at the road end facing the default camera, like field/forest. Confirm the position with a screenshot and the e2e "no obstacle overlaps a gate" check.
- Helpers duplicated between field and forest (vertex-colour baking) may move to `src/levels/shared/` now, so city/tower do not copy them a third time. Keep the move mechanical; field/forest e2e must stay green.

## Requirements
- Gates: `city` (requires `forest`, sign e.g. "7 × 8") and `tower` (requires `city`, sign e.g. "56 : 7").
- Locked-reason strings: "Hoàn thành Rừng Nhân Chia để mở", "Hoàn thành Thành Phố Con Số để mở" (vi), typed en.
- Quest card stages `city` and `tower` (same pattern as field/forest: eyebrow "NHIỆM VỤ TIẾP THEO", title, directions to the ✨ gate, progress line, reward). The step row grows to 5 cells: Cây cầu / Cánh Đồng / Khu Rừng / Thành Phố / Tháp.
- Closing card updated: all five stages done; no "Sắp ra mắt" line.
- VLM post-bridge line points to the next open gate for every stage.
- `__game.seedProgress` accepts `completedLevels` including `city`, so the 02/03 e2e can seed.

## Architecture
Data only plus unions: `LEVEL_GATES` drives gate building, labels, interactables and progression. Quest chain reads `progressionState`. No new modules beyond an optional shared baking helper.

## Related code files
- Modify: the files listed in Context links; `tests/e2e/level-gate.spec.ts`, `tests/e2e/quest-chain.spec.ts`; unit tests for progression, the registry and quest stage.
- Create: optionally `src/levels/shared/bake-vertex-colored-geometry.ts` (moved).
- Delete: optionally `COMING_SOON_REGIONS` if unused.

## Implementation Steps
1. Widen the unions; add the two `LEVEL_GATES` entries; append the obstacles after scatter.
2. Progression and gate status unit tests, RED first: city locked until forest, tower until city.
3. Quest stages `city`/`tower` plus strings; closing card; VLM line; tests.
4. Retire the coming-soon badges (labels and map), replaced by gate status.
5. Optionally move the shared baking helper and update the imports in field/forest.
6. e2e: gate locks and reasons, quest card through all stages (seeded), no obstacle overlap, map has no "Sắp ra mắt".
7. Full gates plus parity re-baseline (new gate meshes and labels, quiz reshuffle), with per-artifact attribution.

## Todo list
- [ ] unions + gates + obstacles
- [ ] progression/gate tests
- [ ] quest stages + strings + VLM line
- [ ] remove coming-soon badges
- [ ] (opt) shared baking helper
- [ ] e2e updates
- [ ] parity re-baseline + tag `city-tower-p01`

## Success Criteria
- lint (no new warnings), typecheck, unit, build, full e2e green; parity 20/20 after an attributed re-baseline; golden `--check` byte-identical.
- With no city/tower folders, the gates show "Sắp ra mắt" and progression is correct.

## Scope Contract
- Changed: shared gate/progression/quest code, world gates.
- Impacted: every world shot (new meshes), HUD after the quest, map.
- Will verify: unit, full e2e, full parity, golden.
- Skipped: none (shared contract).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Gate overlaps scatter or a road prop | M | M | Obstacles appended; e2e overlap check; screenshot |
| Parity churn from the quiz reshuffle | H | L | Expected; attribute it in the commit body |
| Moving the helper breaks field/forest | L | M | Mechanical move; their e2e must stay green |

## Security Considerations
- None (local only).

## Next steps
- 02 and 03 in parallel.
