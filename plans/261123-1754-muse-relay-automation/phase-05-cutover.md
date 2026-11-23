# Phase 05 — Cutover after #61 merges

## Context links
- Parent: [plan.md](plan.md) · Depends: phase 04 passed, PR #61 merged

## Overview
- Date: 2026-11-23 · Priority: P2 · Status: pending · Review: pending
- Move muse-88 onto the relay; manual copy-paste ends.

## Requirements
- muse-88 gets the loop prompt only between tasks (never mid-task).
- Post on #11: "từ giờ dùng hộp thư"; user stops pasting.
- Commit scripts + plan + prompts (no secrets; `git status` checked, `.env.relay` and `.relay/` absent from diff).

## Implementation steps
1. Confirm #61 merged + parity recaptured.
2. Paste loop prompt into muse-88 tab.
3. Commit `scripts/relay/`, `.gitignore`, plan files (as ltminh88, run lint/tsc/vitest first per main rules).
4. Update memory (`two-muse-accounts` + new relay entry).
5. Send first daily summary.

## Todo list
- [ ] muse-88 switched
- [ ] commit + push
- [ ] memory updated
- [ ] first summary sent

## Success criteria
- 24h with both Muses on relay, user only touched Telegram.

## Risk assessment
- Rollback = user resumes manual relay; inbox history keeps context.

## Security considerations
- Final token-leak grep over the commit before push.

## Next steps
- Optional later: GitHub Actions notifier (option E) if the local loop proves unreliable.
