# Phase 02 — Inbox issues, protocol, Muse loop prompt

## Context links
- Parent: [plan.md](plan.md) · Board: issue #11 · Memory: two-muse-accounts

## Overview
- Date: 2026-11-23 · Priority: P1 · Status: pending · Review: pending
- Two GitHub issues as inboxes + a protocol the Muses follow + the loop prompt the user pastes once per Muse tab.

## Key insights
- Muse self-loop verified: background `sleep 300` returns control automatically.
- Muses already read/write issue #11; same `gh` access works for new issues.
- Repo is public → every inbox comment is public.

## Requirements
- Issues: "Hộp thư muse-88", "Hộp thư muse-min" (label `relay`), protocol in the issue body (bodies are stable; comment pinning not relied on).
- Message format: first line `[from→to] <TYPE> #<seq>`; TYPE ∈ TASK, REPORT, QUESTION, ACK, HANDOFF, BLOCKED.
- Every TASK/QUESTION gets an `ACK #<seq>` from the receiver within one loop tick.
- Muse report = same content they give the user today (PR, head sha, CI run, quota %).
- Quota rule unchanged (90% push each commit; 99% WIP + "Bàn giao" on #11).
- #11 stays the board (status table, handoffs); inboxes carry conversation.

## Architecture
Muse loop (each tick):
1. If mid-task → continue work; only at a checkpoint (commit pushed / CI started / CI finished / blocked) read inbox.
2. Read comments newer than last seen; ACK; act.
3. Post REPORT at each checkpoint.
4. Idle with nothing assigned → `sleep 600` in background, then re-check. Waiting on CI → `sleep 300`.
5. Stop looping when quota ≥ 99% (after handoff) or inbox says `STOP`.

## Related code files
- Create: `plans/261123-1754-muse-relay-automation/muse-loop-prompt.md` (text user pastes into each Muse tab).
- No `src/` changes.

## Implementation steps
1. Create label `relay` and the two issues (as ltminh88) with protocol body.
2. Write `muse-loop-prompt.md` (parameterized by Muse name; Vietnamese; includes rules above + copyright + no-prod-deploy).
3. Post one line on #11 pointing to the inboxes.

## Todo list
- [ ] label + 2 inbox issues
- [ ] protocol text
- [ ] muse-loop-prompt.md
- [ ] pointer on #11

## Success criteria
- A Muse given only the loop prompt can find its inbox, ACK a TASK, and report without the user relaying.

## Risk assessment
- Muse misses a message → seq numbers + ACK make gaps visible; reviewer re-pings after 2 ticks.
- Muse loops forever burning quota → idle sleep 10 min, stop at 99%.

## Security considerations
- No tokens, credentials, personal data, or textbook content in comments.

## Next steps
- Phase 04 tests this on muse-min.
