# Phase 02: New-family scaffolding + registries (the one shared-file phase)

## Context links
- [plan.md](plan.md) decision 7, [scout §1](scout/scout-01-integration-points.md)
- `src/learning/skill-catalog.ts:8-16,33-76`, `src/learning/sticker-book.ts:15-31,47+`, `src/ui/sticker-book-strings.ts`, `tools/practice/pool-counting.ts`
- `src/practice/item-for-skill.ts` (phase 00), `levels/shared/test-debug-hook.ts:135`, `levels/shared/reasoning-round-slot.ts:61`
- `docs/code-standards.md`

## Overview
P1. Effort 5h. Lane muse-min. Deps 00, 01. Branch `muse/family-scaffolding`. After this merges, family phases 07–15 touch only their own folder.

## Key Insights
- Shared files get edited once here with empty per-family slots: `SKILL_CATALOG = [...LEGACY, ...NUMBER_ENTRIES, ...ARITH_ENTRIES, ...]`. Ids are not order-indexed in save codes; `SHIPPED_IDS` test keeps the legacy prefix only.
- Sticker topics derive from family (`skillsOfFamily`) for new families → no per-skill edits later.
- Coverage test with an escape hatch derived from code, not a list: a practicable lesson passes if ≥1 skill has a generator, or all its skills belong to a family whose GENERATORS is still empty. Phase 21 removes the hatch.

## Requirements
- `SkillFamily` += `number | arithmetic | fraction | time | money | data`.
- Folders `src/numbers/`, `src/arithmetic/`, `src/fractions/`, `src/time/`, `src/money/`, `src/data/`, each with `<f>-skill-entries.ts` (empty array) and `<f>-item-for-skill.ts` (empty GENERATORS, `is<F>Skill`, throwing `<f>ItemForSkill`).
- Dispatcher consults all nine families; test hook + reasoning-round-slot use it.
- `PracticeScene = {readonly kind: string}` base type in `src/practice/practice-scene.ts`; items = `ReasoningItem & {scene?: PracticeScene}`.
- Sticker book: 6 new topic pages (vi/en titles: Số, Phép tính, Phân số, Thời gian, Tiền, Thống kê), empty until skills exist; empty pages hidden.
- `pool-counting.ts` iterates the dispatcher.
- `docs/code-standards.md`: new folders in layering; number ceiling per family (decision 8); scenes rule.
- `src/learning/lesson-coverage.test.ts` with escape hatch.

## Architecture
```
src/practice/{item-for-skill,practice-scene}.ts
src/<family>/{<family>-skill-entries,<family>-item-for-skill}.ts ×6
src/learning/skill-catalog.ts (concat), sticker-book.ts, ui/sticker-book-strings.ts
```

## Related code files
Ownership: files above + `tools/practice/pool-counting.ts`, `levels/shared/test-debug-hook.ts`, `levels/shared/reasoning-round-slot.ts`, `docs/code-standards.md`, `src/learning/lesson-coverage.test.ts`.

## Implementation Steps
1. RED: catalog test expects 9 families wired; coverage test; sticker test hides empty topics.
2. Scaffold folders + wiring; GREEN.
3. Gates: lint, typecheck, test, build, golden `--check`, e2e `sticker-book.spec.ts` (4 projects).

## Todo list
- [ ] family union + empty slots
- [ ] dispatcher/test hook/round slot
- [ ] sticker topics + strings
- [ ] pool counter, coverage test, docs

## Success Criteria
No behaviour change for players; sticker book e2e green; adding a skill = editing one family folder only.

## Risk Assessment
| Risk | Countermove |
|---|---|
| Conflict with 00/01 | rebase after both merge (deps) |
| Empty sticker pages show | hidden when topic has 0 skills (unit) |

## Security Considerations
None.

## Next steps
05, 07, 09, 12–15 start in parallel.
