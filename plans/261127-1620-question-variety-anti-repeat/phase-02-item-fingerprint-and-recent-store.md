# Phase 2: item fingerprint + recent-item store

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 1](phase-01-repeat-meter-and-baseline.md) (signature code moves from tools to src)
- Research: [baseline](research/researcher-01-repeat-causes-baseline.md) §5
- Reuse: `src/learning/learning-types.ts` (`FactStat`, `FactLocalState`), `session-recorder.ts`
  (158, bug bank write at L96–102), `src/store/progress-repository.ts` (202, local merge L126–160),
  `src/learning/leitner-box.ts` (`LEITNER.bugsKept` pattern), `seeded-rng.ts`

## Overview
- Date: 2026-11-27
- Description: a 32-bit fingerprint per shown item, a bounded per-skill list of recent
  fingerprints kept device-only on `FactStat`, and a pure `drawFreshItem` that re-rolls (bounded)
  when the candidate was seen recently. No call site uses it yet (Phase 3/4 wire it).
- Priority: P1
- Implementation status: pending
- Review status: not reviewed
- Owner: Lane B, muse-min (shared-contract edit; announce on #11 before claiming)
- Effort: 0.75d

## Key Insights
- Per-profile already = per `factStats`; `sk:<id>` keys exist for every skill. A field
  `seen?: number[]` sits next to `bugs`/`recent`: device-only, never in a save code, never synced,
  so no save-code version, no Supabase change.
- Recording "seen" is **not** an attempt: it must not touch `attempts`, `correct`, `box`,
  `streak` or the bug bank. R79 stays exactly as is.
- Determinism: `drawFreshItem` returns the first candidate when it is not in `seen` → with an
  empty list it consumes the rng exactly like `itemForSkill` → golden traces and parity unchanged.

## Requirements
- Functional
  - `src/practice/item-fingerprint.ts`: `itemSignature` (moved from `tools/practice/pool-counting.ts`,
    which re-imports it) + `itemFingerprint(item): number` (FNV-1a 32-bit of the signature).
  - `learning-types.ts`: `FactStat.seen?: number[]`, `FactLocalState.seen?: number[]` (append only).
  - `leitner-box.ts` or new `recent-items.ts`: `RECENT_ITEMS_KEPT = 24` (Q1), `rememberSeen(stat, fp)`
    → new stat with `seen` de-duplicated, newest last, sliced to the cap.
  - `session-recorder.ts`: an answered skill item records its fingerprint into `seen`, after
    the existing attempt/bug logic, for every outcome (right, wrong, choice bug).
  - `progress-repository.ts`: carry `seen` through the local merge like `bugs`; extract the
    local-merge block into `progress-local-merge.ts` so the file drops under 200 lines.
  - `src/practice/fresh-item-draw.ts`: `drawFreshItem(id, rng, tier, seen, maxTries = 8)` → first
    candidate whose fingerprint ∉ `seen` and ∉ the run's `shownThisRun`; if all tries hit, return
    the least-recently-seen candidate (never loops, never throws for tiny pools).
- Non-functional: pure; each new file < 80 lines; no change in behaviour until wired.

## Architecture
`itemForSkill` → candidate → `itemFingerprint` → in `seen ∪ shownThisRun`? retry : accept.
Answer recorded → `session-recorder` → `rememberSeen` → `FactStat.seen` → IDB via the existing
local-state path. Save code / sync payload untouched (fields are device-only by contract).

## Related code files
- Create: `src/practice/item-fingerprint.ts`, `fresh-item-draw.ts`, `src/learning/recent-items.ts`,
  `src/store/progress-local-merge.ts` (+ tests for each)
- Modify: `learning-types.ts`, `session-recorder.ts`, `progress-repository.ts`,
  `tools/practice/pool-counting.ts` (import moved function)
- Delete: none

## Implementation Steps
1. Branch `muse-min/recent-items`. Move signature + fingerprint; pool-counter tests still green.
2. Type append; `rememberSeen` with cap test.
3. Recorder write + tests: right / wrong / choice-bug each add `seen`, and a choice bug still
   adds no attempt and no box move (R79 regression test).
4. Repository carry-through + split; save-code round-trip test proves `seen` is not encoded.
5. `drawFreshItem` tests: empty seen → identical item and identical rng state to `itemForSkill`;
   seeded `seen` → different item; pool of 1 → returns it after `maxTries`.
6. Gates; PR (no `parity-change`).

## Todo list
- [ ] Fingerprint moved + added
- [ ] `seen` type + cap helper
- [ ] Recorder write, R79 regression
- [ ] Repository carry + split < 200 lines
- [ ] Fresh draw + rng-identity test
- [ ] Gates green, PR

## Success Criteria
- All existing golden/save-code tests pass unchanged; `seen` survives reload in an IDB test.
- `drawFreshItem` with empty `seen` is bit-identical to `itemForSkill` (item + next rng value).

## Risk Assessment
- Store growth: 24 × ~300 skill keys × number ≈ small; capped. Mitigation: cap constant + test.
- Cross-tab merge picks one tab's `seen`. Acceptable (worst case: one extra repeat).

## Security Considerations
- Device-only data, no PII; fingerprints are hashes of public question text. Never sent to Supabase.

## Next steps
- Phase 3 (lesson + daily) and Phase 4 (levels) wire `drawFreshItem` in.
