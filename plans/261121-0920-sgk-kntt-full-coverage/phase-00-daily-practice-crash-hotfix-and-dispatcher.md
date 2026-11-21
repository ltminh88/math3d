# Phase 00: Daily-practice crash hotfix + cross-family dispatcher

## Context links
- [plan.md](plan.md), [scout §0](scout/scout-01-integration-points.md)
- `src/learning/daily-planner.ts:50-52` (learned pool includes `sk:geo-*`, `sk:meas-*`)
- `src/ui/daily-practice.ts:130-133`, `src/ui/daily-skill-item.ts:29-36` → `reasoningItemForSkill` throws (`src/reasoning/reasoning-item-for-skill.ts:52-54`)
- `src/levels/cave/cave-chamber-formats.ts:78,151-153` (existing ad-hoc dispatch, `startsWith('meas-')` hack)
- `tests/e2e/daily-practice.spec.ts`

## Overview
P0, independent, ship first. Effort 3h. Lane muse-88. Branch `muse/daily-crash-hotfix`.
A child who played valley/workshop gets `sk:geo-*`/`sk:meas-*` in daily → throw → daily dead. Fix with one dispatcher + a "renderable in dialog" filter.

## Key Insights
- `GeoItem` extends `ReasoningItem` with a `scene` that only valley/workshop 3D/DOM views draw. The dialog step card shows only story/steps → a geo item without its picture is unanswerable. So: dispatcher fixes the throw; daily *skips* scene items until phase 04 adds dialog renderers. Skipped = not planned, Leitner stats untouched.
- Planner is pure and must stay unaware of UI; pass a predicate `isPlannable(skillId)` into the planner (or filter the pool at the UI call site) — prefer the call-site filter (no planner signature change).

## Requirements
- `src/practice/item-for-skill.ts` (pure): `itemForSkill(id, rng, tier): ReasoningItem` dispatching reasoning → geometry → measurement by `is*Skill`; throws only for unknown ids. `familyOfSkill(id)` uses `skillEntry(id).family` (no prefix hacks).
- `dialogRenderable(item | id)`: false when the item has a `scene` (until phase 04 registers renderers).
- Daily: filter learned `sk:` keys to dialog-renderable skills before planning; empty-after-filter → same "fewer items" behaviour (no top-up).
- Cave uses `itemForSkill` (remove `startsWith('meas-')`).

## Architecture
```
src/practice/item-for-skill.ts (new, pure)
src/practice/item-for-skill.test.ts (new)
src/ui/daily-skill-item.ts (mod: use itemForSkill)
src/ui/daily-practice.ts (mod: filter pool)
src/levels/cave/cave-chamber-formats.ts (mod: use dispatcher)
tests/e2e/daily-practice.spec.ts (mod: seeded geo/meas stats)
```

## Related code files
Ownership: `src/practice/**`, `src/ui/daily-skill-item.ts`, `src/ui/daily-practice.ts`, `src/levels/cave/cave-chamber-formats.ts`, `tests/e2e/daily-practice.spec.ts`. Create/modify as above; delete none.

## Implementation Steps
1. RED e2e: `seedProgress` with field done + `sk:geo-midpoint`, `sk:meas-gram` attempts>0 → open daily via HUD → assert dialog shows item 1 and no page error (`page.on('pageerror')`). Must fail on `main`.
2. RED unit: `itemForSkill` for one id per family returns item; unknown id throws; every catalog id resolves.
3. Implement dispatcher + filter; switch cave; GREEN.
4. lint, typecheck, test, build, golden `--check`, e2e (4 projects). Preview deploy.

## Todo list
- [ ] RED e2e + unit
- [ ] dispatcher + renderable filter
- [ ] cave switch
- [ ] gates + preview URL

## Success Criteria
- Daily opens with geo/meas stats on all 4 projects, no page error; cave behaviour unchanged (cave tests green).
- Every catalog id dispatches (unit).

## Risk Assessment
| Risk | Countermove |
|---|---|
| Filter hides geo/meas from daily for days | Phase 04 re-enables; acceptable vs crash |
| Cave RNG order changes | Dispatcher calls the same generator with same rng → identical items; cave unit tests pin it |

## Security Considerations
None (local progress only).

## Next steps
04 adds dialog scene renderers and lifts the filter; 02 routes `test-debug-hook.ts:135` and `reasoning-round-slot.ts:61` through the dispatcher.
