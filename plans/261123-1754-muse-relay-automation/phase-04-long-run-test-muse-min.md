# Phase 04 — Long-run test on muse-min (2–3h)

## Context links
- Parent: [plan.md](plan.md) · Depends: phases 01–03

## Overview
- Date: 2026-11-23 · Priority: P1 · Status: pending · Review: pending
- Run the full relay with muse-min only, while muse-88 stays on manual relay.
- Earliest start: after muse-min quota reset 2026-11-24 09:57.

## Key insights
- muse-88 is busy with #61; keeping it manual isolates risk.

## Requirements
- Test task for muse-min: one small, real, low-risk task through the full cycle (TASK → ACK → branch → PR → CI → REPORT → merge).
  Candidate: a docs/test-only piece of phase 21 prep that does not overlap #61 files.
- Scenarios to observe:
  1. Normal TASK/ACK/REPORT.
  2. Muse idle loop (≥ 2 idle ticks, quota impact measured).
  3. Telegram Q round-trip (one harmless test question).
  4. Reviewer missed-ACK re-ping.

## Implementation steps
1. User pastes muse-loop-prompt into muse-min tab; user starts reviewer `/loop`.
2. Reviewer posts TASK #1 in muse-min inbox.
3. Observe 2–3h; log timeline in `reports/relay-long-run-test.md`.
4. Measure muse-min quota used by idle ticks.

## Todo list
- [ ] start both loops
- [ ] TASK cycle completes without user copy-paste
- [ ] idle quota cost measured
- [ ] test Qn answered via Telegram
- [ ] report written

## Success criteria
- Zero manual relays during the window; no missed message; idle cost acceptable (target < 2% quota/hour).

## Risk assessment
- Muse loop drifts or stops → note tick timestamps; adjust sleep durations / prompt.

## Security considerations
- Check inbox comments and log for any leaked secret before closing test.

## Next steps
- Phase 05 after #61 merged.
