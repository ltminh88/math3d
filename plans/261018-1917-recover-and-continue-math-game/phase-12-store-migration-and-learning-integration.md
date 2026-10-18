# Phase 12: idb store, legacy save migration, learning-core integration (first gameplay change)

## Context links
- [plan.md](plan.md) · [old phase 03 store/learning API](../261018-1803-vlm-math-game-mvp/phase-03-learning-core-and-local-store.md) · [old plan handoff notes](../261018-1803-vlm-math-game-mvp/plan.md) · [inventory §4 save format](research/researcher-01-recovered-code-inventory.md)
- Depends on: 10, 11. Serial (G5).

## Overview
- Date: 2026-10-18
- Description: Make the existing `src/store/**` (idb + outbox) the source of truth, import existing players' localStorage progress once, unify settings/language, and replace the original picker/distractors/stats with `src/learning/**` (Leitner, session planner, distractor classes). Deliberate behavior change; parity suite switches from "identical" to "visuals identical except quiz content".
- Priority: P1
- Implementation status: pending
- Review status: not reviewed

## Key Insights
- Store has no deployed users -> edit schema v1 in place (no extra migration step); rename `DB_NAME` 'number-stone-quest' -> 'math-ai-game-3d', settings key 'nsq.settings' -> 'aigame3d.settings'. Old-plan handoff W5 resolved here: ONE source for language + audio = `settings-store`; `i18n.ts` and recovered translator read it.
- Legacy import mapping (`aigame3d_multiplication_save` v1, parsed by recovered `parseSave` but WITHOUT the 30 cap — a migration-only option `{ cap: false }`):
  - avatar -> guest `Profile.avatarId` ('boy'|'girl'); xp, coins -> `Wallet`.
  - bridge 0..6, questAccepted, questComplete -> `LevelProgress{levelId:'bridge', progress, completedAt}` (+ new field `progress`); table, combo, started -> `meta`.
  - `questionStats["m{a}_{b}"]` -> `factStats[mul:{min}x{max}]` pooled (sum attempts/correct; `totalMs = responseTime x attempts`, approximation since original stores last time only; `lastSeenAt` = max).
  - Leitner box seed: id in `review` -> 1; else correct >= 3 and wrong == 0 -> 3; correct >= 1 -> 2; else 1.
  - `sound`, `music` -> settings; `aigame3d_language` -> settings.lang; `aigame3d_quest_collapsed` -> settings.questCollapsed.
  - Marker `meta.legacyImport = {v:1, at}`; idempotent; old keys NEVER deleted or written again (rollback to old site sees last pre-migration state).
- Quiz keeps the original 3-choice dialog, hint UI (3 levels) and rewards (+10 XP, +5 coins, bridge +1) — only content selection changes: `planSession` over the chosen table, `distractor-picker` for options, hints used fed to Leitner. 30-entry cap gone (idb).
- `commitSession` per answer batch: on dialog close or every 5 answers (idempotent `batchId`); `session-committed` may fire twice (handoff note).
- Boot must: catch `DbBlockedError` (close-other-tabs toast), toast when `store.persistent === false`, wire `onVersionChange`/`onTerminated` to reload prompt (handoff).

## Requirements
- Players with a live-site save see identical XP, coins, level, avatar, bridge state, language, quest-card state after first load of the new build.
- Corrupt/unknown-version legacy save -> same behavior as original (defaults) and no crash; import failure leaves old key untouched and retries next boot.
- WebMCP progress tool reads from store.

## Architecture
```
src/store/legacy-save-import.ts      map SaveV1 -> store records (pure mapping + one idb tx)
src/store/legacy-save-import.test.ts fixtures from tests/parity/golden (40 blobs) + 90-stat save
src/store/save-schema.ts             + LevelProgress.progress, meta keys; DB_NAME rename
src/store/settings-store.ts          + lang, questCollapsed, music; key rename
src/i18n/i18n.ts                     language from settings-store
src/quiz/learning-quiz-adapter.ts    planSession/distractors -> {a, b, options[3]} for quiz dialog
src/ui/game-state.ts  src/ui/quiz-dialog.ts  src/ui/hud.ts   read/write via game-store snapshot
src/save/save-storage.ts             parseSave option {cap:false}; writeSave removed from runtime path
```

## Related code files
- Create: `legacy-save-import.ts` (+test), `learning-quiz-adapter.ts` (+test). Modify: listed store/i18n/ui/save files, `src/ui/bootstrap-game.ts`, `src/webmcp/progress-tool.ts`. Delete: runtime use of recovered picker/stats (keep `src/quiz/*` golden-tested functions only if still imported; else delete with tests).

## Implementation Steps
1. Schema/settings edits + store tests updated (fake-indexeddb).
2. Legacy import mapping (pure) + tests incl. 90-stat save, garbage, version 2, missing keys, private-mode storage throwing.
3. Boot sequence: open store -> import once -> hydrate `gameState` -> UI. Handoff boot items.
4. Quiz adapter + quiz dialog wiring; HUD from store snapshot.
5. Update parity: quiz-content scenarios re-baselined (seeded RNG still deterministic); all other shots must stay identical.
6. E2E `tests/e2e/legacy-save-migration.spec.ts`: inject real captured live save (from 01 trace) into localStorage -> boot -> assert HUD values, bridge segments, language; reload -> same; old key unchanged.

## Todo list
- [ ] schema + settings unification
- [ ] legacy import (+ tests)
- [ ] boot sequence + handoff items
- [ ] quiz adapter + UI wiring (+ tests)
- [ ] parity re-baseline (quiz only)
- [ ] migration e2e

## Success Criteria
- `npm test` green incl. import tests (every fixture: no throw, totals equal to source sums).
- `npm run test:e2e -- legacy-save-migration` green; `npm run test:parity` green with only quiz-content scenarios re-baselined (listed in commit message).
- Distractor invariants from old 03 hold in UI (e2e samples 30 questions: 3 unique options, answer present).

## Scope Contract
- Changed: persistence, settings, quiz selection. Impacted: every save/load, language, HUD. Data mutation/migration = safety-critical -> full unit + e2e + parity suites.
- Skipped: none.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Player loses progress on migration | L | H | old key untouched; import idempotent; e2e with real live save |
| Double import (two tabs) | L | M | marker written in same tx as data; second tab sees marker |
| idb unavailable (Safari private) | M | M | memory fallback + toast; legacy key still read each boot (re-import into memory) |
Rollback: revert phase; old key still holds pre-migration progress -> recovered r186 build reads it again.

## Security Considerations
- Local only; no PII beyond avatar choice. Import validates every field (regex keys, clamps) before writing.

## Next steps
- 13 region progression on `LevelProgress`; 16 adds `progress` column; 17 syncs.
