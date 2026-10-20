# Phase 12: idb store, legacy save migration + save codes, learning-core integration (first gameplay change)

## Context links
- [plan.md](plan.md) · [old phase 03 store/learning API](../261018-1803-vlm-math-game-mvp/phase-03-learning-core-and-local-store.md) · [old plan handoff notes](../261018-1803-vlm-math-game-mvp/plan.md) · [inventory §4 save format](research/researcher-01-recovered-code-inventory.md)
- Depends on: 10, 11. Serial (G5).

## Overview
- Date: 2026-10-18
- Description: Make the existing `src/store/**` (idb + outbox) the source of truth, import legacy v1 progress (localStorage blob when present on this origin, or a pasted "save code"), add save-code export, unify settings/language, and replace the original picker/distractors/stats with `src/learning/**` (Leitner, session planner, distractor classes). Deliberate behavior change; parity suite switches from "identical" to "visuals identical except quiz content".
- Priority: P1
- Implementation status: done (tag phase-12)
- Review status: not reviewed

## Key Insights
- Store has no deployed users -> edit schema v1 in place (no extra migration step); rename `DB_NAME` 'number-stone-quest' -> 'math3d', settings key 'nsq.settings' -> 'math3d.settings'. Keep `ownedCosmetics` store + `purchaseCosmetic`/`equipCosmetic` untouched (shop = phase 19). Old-plan handoff W5 resolved here: ONE source for language + audio = `settings-store`; `i18n.ts` and recovered translator read it.
- Legacy import mapping (`aigame3d_multiplication_save` v1, parsed by recovered `parseSave` but WITHOUT the 30 cap — a migration-only option `{ cap: false }`):
  - avatar -> guest `Profile.avatarId` ('boy'|'girl'); xp, coins -> `Wallet`.
  - bridge 0..6, questAccepted, questComplete -> `LevelProgress{levelId:'bridge', progress, completedAt}` (+ new field `progress`); table, combo, started -> `meta`.
  - `questionStats["m{a}_{b}"]` -> `factStats[mul:{min}x{max}]` pooled (sum attempts/correct; `totalMs = responseTime x attempts`, approximation since original stores last time only; `lastSeenAt` = max).
  - Leitner box seed: id in `review` -> 1; else correct >= 3 and wrong == 0 -> 3; correct >= 1 -> 2; else 1.
  - `sound`, `music` -> settings; `aigame3d_language` -> settings.lang; `aigame3d_quest_collapsed` -> settings.questCollapsed.
  - Marker `meta.legacyImport = {v:1, at}`; idempotent; old keys NEVER deleted or written again (rollback to old site sees last pre-migration state).
- New origin (mathgame.vercel.app, decision 2026-10-18): localStorage is per-origin, so old-site players have NO local blob on the new domain. The localStorage importer stays (works for any v1 blob: same-origin previews, tests, a future old-domain bridge); the cross-origin path is a manual save code.
- Save code format: `M3D1-` + base64url(uncompressed compact JSON of SaveV1 minus defaults, keys shortened) + `-` + CRC32 (8 hex) of the payload. Version prefix allows `M3D2` later; checksum catches typos/truncation; max ~2 KB so it fits a chat message. Decode -> same `SaveV1` validator as the localStorage path -> same mapping. Export from the new game builds a SaveV1 from the store snapshot (avatar, xp, coins, bridge, table, quest flags, top facts) so one codec serves both directions. Code is progress, not a credential (no secrets inside).
- UI: start screen gets "Nhập mã lưu" (EN "Enter save code") -> textarea + confirm ("Ghi đè tiến độ hiện tại?" if store has progress); settings gets "Xuất mã lưu" -> code + copy button. Strings via `defineStrings`.
- Bridge reward rules are FROZEN (validated): +10 XP, +5 coins per correct, combo >= 3 bonus as original, 5 levels / bridge +1 per correct; `src/learning/scoring.ts` is not consulted for the bridge quiz and must not override these (unit test asserts bridge rewards equal original goldens).
- Quiz keeps the original 3-choice dialog, hint UI (3 levels) and rewards (+10 XP, +5 coins, bridge +1) — only content selection changes: `planSession` over the chosen table, `distractor-picker` for options, hints used fed to Leitner. 30-entry cap gone (idb).
- `commitSession` per answer batch: on dialog close or every 5 answers (idempotent `batchId`); `session-committed` may fire twice (handoff note).
- Boot must: catch `DbBlockedError` (close-other-tabs toast), toast when `store.persistent === false`, wire `onVersionChange`/`onTerminated` to reload prompt (handoff).

## Requirements
- Players with a live-site save see identical XP, coins, level, avatar, bridge state, language, quest-card state after first load of the new build.
- Corrupt/unknown-version legacy save -> same behavior as original (defaults) and no crash; import failure leaves old key untouched and retries next boot.
- Save code: export -> import round-trips to identical XP/coins/bridge/avatar/facts; corrupted char, truncated code, wrong prefix, bad checksum -> friendly error, store unchanged.
- WebMCP `read_adventure_progress` kept (validated); reads from store; exposed field names updated to store names (`xp`, `coins`, `level`, `bridgeProgress`, `avatarId`) and app name "math3d"; still read-only, no PII.

## Architecture
```
src/store/legacy-save-import.ts      map SaveV1 -> store records (pure mapping + one idb tx)
src/store/legacy-save-import.test.ts fixtures from tests/parity/golden (40 blobs) + 90-stat save
src/store/save-schema.ts             + LevelProgress.progress, meta keys; DB_NAME rename
src/store/settings-store.ts          + lang, questCollapsed, music; key rename
src/store/save-code-codec.ts         encode/decode M3D1 codes (base64url + CRC32), uses SaveV1 validator
src/store/save-code-codec.test.ts    round-trip, typo, truncation, prefix, checksum, oversize
src/store/store-to-save-v1.ts        snapshot -> SaveV1 for export
src/ui/save-code-dialog.ts           import (start screen) / export (settings) dialog + strings
src/i18n/i18n.ts                     language from settings-store
src/quiz/learning-quiz-adapter.ts    planSession/distractors -> {a, b, options[3]} for quiz dialog
src/ui/game-state.ts  src/ui/quiz-dialog.ts  src/ui/hud.ts   read/write via game-store snapshot
src/save/save-storage.ts             parseSave option {cap:false}; writeSave removed from runtime path
```

## Related code files
- Create: `legacy-save-import.ts` (+test), `learning-quiz-adapter.ts` (+test), `save-code-codec.ts` (+test), `store-to-save-v1.ts`, `save-code-dialog.ts`, `tests/e2e/legacy-save-code.spec.ts`. Modify: listed store/i18n/ui/save files, `src/ui/bootstrap-game.ts`, `src/ui/settings-dialog.ts` (export button), start screen, `src/webmcp/progress-tool.ts`. Delete: runtime use of recovered picker/stats (keep `src/quiz/*` golden-tested functions only if still imported; else delete with tests).

## Implementation Steps
1. Schema/settings edits + store tests updated (fake-indexeddb).
2. Legacy import mapping (pure) + tests incl. 90-stat save, garbage, version 2, missing keys, private-mode storage throwing.
3. Boot sequence: open store -> import once -> hydrate `gameState` -> UI. Handoff boot items.
4. Quiz adapter + quiz dialog wiring; HUD from store snapshot.
5. Save-code codec + export mapping + dialog (import on start screen, export in settings).
6. Update parity: quiz-content scenarios re-baselined (seeded RNG still deterministic); all other shots must stay identical.
7. E2E `tests/e2e/legacy-save-migration.spec.ts`: inject real captured live save (from 01 trace) into localStorage -> boot -> assert HUD values, bridge segments, language; reload -> same; old key unchanged. E2E `legacy-save-code.spec.ts`: encode the same captured save as a code -> fresh profile -> "Nhập mã lưu" -> identical HUD; export -> clear site data -> import -> identical.

## Todo list
- [x] schema + settings unification
- [x] legacy import (+ tests)
- [x] boot sequence + handoff items
- [x] quiz adapter + UI wiring (+ tests)
- [x] save-code codec + export + dialogs (+ tests)
- [x] bridge reward freeze test
- [x] parity re-baseline (quiz + new start/settings buttons + storage moved to IndexedDB)
- [x] migration e2e

## Success Criteria
- `npm test` green incl. import tests (every fixture: no throw, totals equal to source sums).
- `npm run test:e2e -- legacy-save-migration legacy-save-code` green; `npm run test:parity` green with only quiz-content scenarios re-baselined (listed in commit message).
- Distractor invariants from old 03 hold in UI (e2e samples 30 questions: 3 unique options, answer present).

## Scope Contract
- Changed: persistence, settings, quiz selection. Impacted: every save/load, language, HUD. Data mutation/migration = safety-critical -> full unit + e2e + parity suites.
- Skipped: none.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Player loses progress on migration | L | H | old key untouched; import idempotent; e2e with real live save |
| Double import (two tabs) | L | M | marker written in same tx as data; second tab sees marker |
| Mistyped / partial save code | M | M | CRC32 + version prefix; copy button on export; error never touches store |
| idb unavailable (Safari private) | M | M | memory fallback + toast; legacy key still read each boot (re-import into memory) |
Rollback: revert phase; old key still holds pre-migration progress -> recovered r186 build reads it again.

## Security Considerations
- Local only; no PII beyond avatar choice. Import (blob or code) validates every field (regex keys, clamps, size cap 4 KB before decode) before writing. Save codes are not secret; a forged code only grants local progress (server clamps in 16 still apply on sync).

## Next steps
- 13 region progression on `LevelProgress`; 16 adds `progress` column; 17 syncs.

## Implementation notes (2026-10-20)
- Store: `replaceProgress` writes an import/reset as a NEW active guest profile in one transaction
  (old rows stay, no delete needed); legacy import writes `meta.legacyImport` in the same tx.
  `questAccepted` -> `LevelProgress.acceptedAt`; game meta key `game:<profileId>`.
- Settings: `math3d.settings` is not written at boot; until the first write, legacy keys seed it.
- Quiz: recovered picker/stats retired (golden JSON kept; picker/stats vitest cases removed, 30-cap
  check moved to save golden as "legacy v1 compatibility"). 3-choice practice options rebalance
  the answer rank (pickDistractors alone would leave the answer in the middle every time).
- Boot: world + loading card stay synchronous (original timing); store hydration re-renders
  afterwards and flags `<html data-boot="ready">` (parity runner + e2e wait on it).
- Parity: every scenario re-baselined; see the phase-12 baseline commit for per-scenario causes.
  Canvas PNG + scene JSON changed only in `playthrough` (quiz content; spark positions follow the
  seeded RNG). Clock harness: animations adopted at interaction flush (book-welcome race).
- Deferred: imports/resets append no outbox item (phase 17 must sync a freshly imported profile
  wholesale); old orphaned guest profiles are not garbage-collected.
