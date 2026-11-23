# Phase 03 — Reviewer loop + escalation rules

## Context links
- Parent: [plan.md](plan.md) · Depends: phase 01 scripts, phase 02 inboxes

## Overview
- Date: 2026-11-23 · Priority: P1 · Status: pending · Review: pending
- The `/loop` prompt this session runs, plus the written rule of what is decided alone vs asked on Telegram.

## Key insights
- `/loop` dynamic uses ScheduleWakeup (60–3600s). Cache TTL 1h → any delay fine.
- Reviewer duties already well defined: review PR, merge with `--match-head-commit`, gates on main, parity recapture, update #11.

## Requirements
Each tick:
1. `tg-poll.sh` → apply answers to open Qn.
2. Read both inboxes since last seen; ACK.
3. Check open PRs / CI runs / main CI.
4. Act (table below); write TASK/REPLY comments.
5. Daily summary once per day (21:00) via `tg-send.sh`.
6. ScheduleWakeup: 600–900s if a CI run or Muse task is in flight, 1800s idle.

| Decide alone | Ask user (tg-ask, then wait) |
|---|---|
| Merge green PR after review | Prod deploy (needs "deploy đi") |
| Parity recapture + commit | Lesson-content / pedagogy choice |
| Assign next phase from plan | Irreversible action (delete branch, force push, close issue unmerged) |
| Quota handoff between Muses | Muse stuck after 2 attempts |
| Flaky CI rerun once | Main CI red, cause unknown |

- While a Qn is open, keep doing independent work; never act on the blocked item.
- No answer in 12h → re-ask once, then include in daily summary.

## Architecture
- Prompt text stored at `plans/261123-1754-muse-relay-automation/reviewer-loop-prompt.md`; user starts with `/loop <that prompt>`.
- State: `.relay/state.json` (`inbox_seen`, open Qn).

## Related code files
- Create: `reviewer-loop-prompt.md`. Update memory: relay workflow + escalation table.

## Implementation steps
1. Write `reviewer-loop-prompt.md` (steps + table + hard rules from plan.md).
2. Write daily-summary template (merged PRs, open PRs, Muse quota, open Qn, prod vs main gap).
3. Dry run one tick manually with no Muse activity.

## Todo list
- [ ] reviewer-loop-prompt.md
- [ ] summary template
- [ ] dry-run tick
- [ ] memory entry

## Success criteria
- One manual tick: polls Telegram, reads inboxes, reports "nothing to do", schedules next wake, no prompts for the secret file.

## Risk assessment
- Session closed / laptop asleep → loop stops silently; daily summary absence is the signal. Mention to user.
- Over-messaging → only escalation cases + one summary per day.

## Security considerations
- Telegram answers only change state for the Qn they reply to; "deploy đi" accepted only as reply to a deploy Qn.

## Next steps
- Phase 04.
