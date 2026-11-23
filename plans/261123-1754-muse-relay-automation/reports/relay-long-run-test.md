# Relay long-run test — 2026-11-23 18:55 → 24/11 00:05

Ran with muse-88 (TASK R1/R2/R5) and, from 21:15, muse-min (TASK R1) in parallel. Reviewer on `/loop` dynamic.

## Timeline (key events)
| Time | Event |
|---|---|
| 18:55 | Reviewer loop on; TASK R1 → #63 |
| 18:58 | muse-88 ACK + REPORT (3 min after paste) |
| 19:31 | PR #65 opened; review found B7 used grade-3 skills → TASK R2 |
| 19:31–20:29 | **No ACK for 58 min** — muse-88 watched CI via a sub-agent, never treated "waiting" as a checkpoint |
| 20:29 | User pasted "read inbox on every CI check" → ACK within minutes |
| 20:31 | Protocol v2: R/M ids (no `#n` autolinks), PING type, inbox on every CI check |
| 20:43 | muse-88 ACK M5 in new format |
| 21:15 | muse-min started: ACK + REPORT in new format on first try |
| 21:18 | PR #66 (muse-min) opened — 3 min after task |
| 22:10 | #65 merged (12/12); TASK R5 → muse-88 |
| 22:32 | #66 merged; STOP → muse-min |
| 22:11–00:05+ | **muse-88 silent on R5** (no ACK, no branch, PING ignored) — loop most likely died after REPORT M6 |

## Results
- Zero manual relays for the actual work: 2 PRs reviewed, 1 change request, 2 merges, 1 STOP — all through inboxes.
- Telegram: ask/poll/wait round trip verified; `wait` wakes the reviewer within seconds; daily summary sent 21:02.
- Two Muses in parallel: no CI slot clash (2 PRs = limit), no file overlap.

## Problems found → fixes
1. Muse did not read inbox while waiting on CI → rule: every CI / sub-agent check reads inbox (done, v2).
2. `#n` message ids autolinked to issues → R/M ids (done, v2).
3. Loop died after a REPORT → **confirmed by muse-88 (06:10)**: it treated "waiting for reviewer to merge" as done, ended the turn with no background sleep. Fix: rule 5 (every turn ends with a background `sleep`) + explicit "waiting on reviewer is not done" (v3.1). muse-88 resumed R5 with sleep armed.
4. Startup cost: muse-min went 93% → 95% just reading protocol + first messages. Consider a shorter protocol body.
5. Reviewer can't detect a dead Muse loop except by silence; PING after 2 ticks is the only signal.

## Open
- Confirm v3 rule keeps muse-88 alive across a full task (needs user to restart muse-88 loop).
- Muse idle-loop quota cost not measured yet (no idle period long enough).
