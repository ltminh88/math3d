# Phase 03: Learning core and local store

## Context links
- [plan.md](./plan.md) · [research 01 §7 pedagogy, §6 testing](research/researcher-01-threejs-game-architecture-report.md) · [research 02 §2 schema, §3 sync, §4 guest](research/researcher-02-supabase-auth-sync-report.md)
- Depends on: [phase 01](./phase-01-scaffold-tooling-pwa-i18n.md)

## Overview
- Date: 2026-10-18
- Description: Pure-TS learning engine (fact keys, question generator, distractor classes, Leitner 5-box with latency, session planner, hint ladder, scoring, progression) and the versioned IndexedDB store (profiles, fact stats, level progress, wallet, meta, outbox) whose shapes match the server schema of phase 08.
- Priority: P1
- Implementation status: done (95f966f)
- Review status: not reviewed

## Key Insights
- Zero `three`/DOM imports -> trivially unit-testable with seeded RNG (`mulberry32`).
- Fact keys are a cross-system contract shared with phase 08 regex: `mul:{min}x{max}` (commutative pair pooled for mastery; question may show either order), `div:{dividend}/{divisor}`. Allow up to 3 digits (`div:100/10`). Contract lives in `fact-key.ts` and is copied verbatim into the SQL check in 08.
- VN grade-2 convention: "2 x 3" = 2 taken 3 times. Generator emits `{groupSize, groupCount}` and the expression `groupSize x groupCount`; the swapped expression is never offered as a distractor in equal-groups questions (it is not wrong math).
- Leitner box is not additive -> sync uses newest `lastSeen`; counters (attempts, correct, totalMs) are additive -> store totals, never averages.
- Session-based intervals (kids play irregularly): box1 every session, box2 every 2nd, box3 every 4th, box4 every 8th, box5 rare check (1 in 16).
- Region unlock = previous level completed once (confirmed 2026-10-18). Mastery drives question choice and stars, not gating.

## Requirements
- Distractors: pick 2-3 from different classes (neighbour, operation confusion, digit swap/off-by-ten, cross-table hard pair, same-ones-digit, personal error bank); unique, != answer, 1..100, >=1 distractor shares a factor with the question; answer position uniform.
- Leitner: first-try correct w/o hint and < 8 s -> box+1; correct with hint -> stay; wrong -> box-1 (floor 1); < 3 s correct sets `fluent`. Last 3 wrong answers kept per fact (`errs`).
- Session planner: ~60% due/weak, ~30% new (max 3 new/session), ~10% mastered check; restricted to the level's tables; interleave tables once >= 2 known.
- Hint ladder rungs: 1 encourage/re-read, 2 show model, 3 skip-count animation, 4 related known fact / inverse multiplication, 5 worked answer + requeue (counts wrong). Auto-offer after 1st wrong or 10 s idle; cap 3 attempts.
- Scoring: +10 XP first-try correct, +5 with hint, +5 coins per correct; stars: 3 = >=90% first-try & <=1 hint, 2 = >=70%, 1 = completed.
- Store: versioned schema (`schemaVersion: 1`) with migration runner; `commitSession(delta)` atomically updates facts/levels/wallet and appends one outbox record; emits `session-committed`. Settings (lang, sound, volume, readAloud, reducedMotion, qualityTier) in localStorage with try/catch.
- Cosmetics: `purchaseCosmetic(id, price)` atomically debits coins (reject if insufficient), adds to `ownedCosmetics`, appends outbox record; `equipCosmetic(slot, id)` stored in profile settings. Store never knows prices' meaning; catalog lives in 04 `src/shop/**`.
- Guest profile auto-created on first launch (`kind: 'guest'`, uuid).

## Architecture
```
src/learning/
  seeded-rng.ts             mulberry32 + shuffle/pick helpers
  fact-key.ts               build/parse/validate keys (FACT_KEY_PATTERN exported)
  curriculum-tables.ts      level -> tables, fluency order 2,5,10 > 3,4 > 6-9
  distractor-classes.ts     6 generator fns
  hard-pairs.ts             known confusions (6x7/6x8, 7x8/6x9, ...)
  distractor-picker.ts      class mixing + guessability checks
  question-types.ts         Question union: equal-groups | array | numeric | expression-choice | share | fact-family
  question-generator.ts     fact + representation (CRA by box: box1-2 concrete, 3+ symbolic)
  leitner-box.ts            applyAttempt(stat, attempt) -> stat
  session-planner.ts        planSession(stats, tables, sessionNo, rng) -> FactKey[]
  hint-ladder.ts            state machine: next rung, penalties
  scoring.ts                xp/coins/stars
  progression.ts            unlocked regions from level progress
  session-recorder.ts       collects attempts -> SessionDelta (sync-payload shaped)
src/store/
  save-schema.ts            Profile{id,kind,remoteChildId?,nickname,avatarId,picturePasswordHash?,unlockFailures,lockedUntil?}, FactStat{attempts,correct,totalMs,box,lastSeenSession,lastSeenAt,streak,fluent,errs}, LevelProgress, Wallet, OutboxItem
  save-migrations.ts        ordered migrations
  idb-database.ts           openDB('number-stone-quest', 1): profiles, factStats[profileId+key], levelProgress, wallet, ownedCosmetics[profileId+cosmeticId], meta, outbox
  profile-repository.ts     guest bootstrap, active profile
  progress-repository.ts    read/apply SessionDelta
  game-store.ts             in-memory snapshot + subscribe + commitSession + purchaseCosmetic/equipCosmetic + events
  settings-store.ts         localStorage settings
```
SessionDelta (also the outbox payload, `v: 1`): `{batchId, profileId, clientTs, v, facts: {key: {a, c, ms, box, seenAt}}, levels: {id: {stars, bestScore}}, xp, coins, cosmetics?: string[]}` (coins negative on purchase; `cosmetics` = newly owned ids).

## Related code files
Create: all files above; tests co-located: `seeded-rng.test.ts`, `fact-key.test.ts`, `distractor-picker.test.ts`, `question-generator.test.ts`, `leitner-box.test.ts`, `session-planner.test.ts`, `hint-ladder.test.ts`, `scoring.test.ts`, `progression.test.ts`, `session-recorder.test.ts`, `src/store/game-store.test.ts`, `src/store/save-migrations.test.ts` (use `fake-indexeddb/auto`).
Modify: none. Delete: none.

## Implementation Steps
1. RNG + fact keys (+ exhaustive tests over all 2..10 x 1..10 facts and inverse divisions).
2. Distractor classes + picker; property loop over every fact: invariants above + position histogram roughly uniform (chi-square-lite tolerance).
3. Question generator per representation; CRA switch by box.
4. Leitner, session planner (injected `sessionNo`, clock), hint ladder, scoring, progression.
5. Session recorder -> SessionDelta.
6. Store: schema, idb open + migrations, repositories, `commitSession` in one idb transaction (facts + levels + wallet + outbox), events.
7. Settings store with private-mode fallback (in-memory).

## Todo list
- [ ] rng, fact keys
- [ ] distractors + guessability property tests
- [ ] question generator (CRA)
- [ ] leitner, planner, hint ladder, scoring, progression
- [ ] session recorder
- [ ] idb schema, migrations, repositories, game store
- [ ] settings store

## Success Criteria
- `npm test` green; `src/learning/**` + `src/store/**` have no import of `three` or DOM globals (Biome rule or grep in CI).
- For every fact: no distractor equals answer, all unique, all in range; answer never systematically the max/min (test asserts < 40% for each extreme across all facts).
- `purchaseCosmetic` with insufficient coins changes nothing; success debits once and emits one outbox item (test).
- `commitSession` is atomic: simulated failure mid-transaction leaves store unchanged and no outbox record (test).
- Reload (new idb connection) returns identical snapshot.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Fact-key drift between client and SQL | M | H | single exported pattern; 08 copies it; 09 integration test sends every key shape |
| Leitner too harsh/too slow for kids | M | M | thresholds are constants in one file; playtest in 10 |
| idb blocked (private mode, old Safari) | L | M | in-memory fallback + toast "progress will not be saved" |
| Schema change later breaks saves | M | H | migration runner from v1; test migrating fixture saves |
Rollback: revert; no consumers until 04.

## Security Considerations
- No PII locally beyond nickname (guest has none). Outbox stores only counters and ids.

## Next steps
- 04 consumes learning + store; 09 consumes outbox + `session-committed`.
