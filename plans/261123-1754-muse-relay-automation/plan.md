---
title: "Muse relay automation (GitHub inbox + Telegram)"
description: "Reviewer and both Muses talk through GitHub inbox issues; the user is asked only important questions via Telegram."
status: completed
priority: P2
effort: 7h (≈4h build + 3h long-run test)
branch: main
tags: [relay, automation, telegram, github, muse]
created: 2026-11-23
---

# Muse relay automation

Goal: stop the manual copy-paste between reviewer (this Claude Code session) and muse-88 / muse-min
(Chrome tabs). Messages flow through GitHub issues; the user only answers Telegram questions.

## Architecture (one line each)
- **Bus**: GitHub — one inbox issue per Muse; comments tagged `[reviewer→muse-x]` / `[muse-x→reviewer]`.
- **Reviewer loop**: `/loop` dynamic in this session; wakes 10–15 min while waiting CI, 30 min idle.
- **Muse loop**: each Muse self-loops with a background `sleep` (verified 2026-11-23), reads inbox only at checkpoints.
- **Human channel**: Telegram bot `@VLM_Vibe_Coding_bot` → user's group; scripts read `.env.relay` (gitignored, 600).
- **Muses never touch Telegram** — token only exists on this machine.

## Phases
| # | Phase | Effort | Status |
|---|-------|--------|--------|
| 01 | [Telegram scripts](phase-01-telegram-scripts.md) | 1.5h | done |
| 02 | [Inbox issues + protocol + Muse loop prompt](phase-02-inbox-protocol-and-muse-loop.md) | 1h | done |
| 03 | [Reviewer loop + escalation rules](phase-03-reviewer-loop-and-escalation.md) | 1h | done |
| 04 | [Long-run test on muse-min (2–3h)](phase-04-long-run-test-muse-min.md) | 3h wall | done (reports/relay-long-run-test.md) |
| 05 | [Cutover after #61 merges](phase-05-cutover.md) | 0.5h | done |

## Dependencies
- 01 → 03 (loop calls the scripts). 02 → 04. 03 → 04. 04 + #61 merged → 05.
- Phase 04 needs muse-min quota → after reset 2026-11-24 09:57.

## Hard rules (carry into every phase)
- Never print/log/commit `TG_TOKEN`; token stays out of argv (curl `-K -` from stdin).
- Accept Telegram input only if `from.id == TG_ALLOWED_USER_ID` AND `chat.id == TG_CHAT_ID`.
- Prod deploy only after the user's explicit "deploy đi" (Telegram reply counts). Muses preview only.
- Repo is public: no textbook content, no secrets, no personal data in inbox comments.
- Do not interrupt a Muse mid-task; inbox is read at checkpoints only.
- Workflow tool not used.

## Notes from build (2026-11-23)
- Scripts became Python (stdlib) instead of bash: no shellcheck on this Mac, and urllib keeps the token out of argv.
- Bot privacy mode must be DISABLED (plain group messages did not reach the bot); plain text answers the sole open Qn.
- Added `telegram-relay.py wait` (long-poll in background) → session wakes seconds after the user writes.
- Inboxes: #63 muse-88, #64 muse-min (pinned). Extra script `inbox-unread.py`.

## Unresolved questions
- Quiet hours for non-urgent Telegram (proposed 22:00–07:00, batched into morning summary)?
- Daily summary time (proposed 21:00)?
