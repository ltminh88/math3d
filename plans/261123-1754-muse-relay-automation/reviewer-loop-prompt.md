# Reviewer loop prompt

Start in the reviewer Claude Code session (repo root) with:

```
/loop Reviewer relay tick — follow plans/261123-1754-muse-relay-automation/reviewer-loop-prompt.md
```

## Each tick (in order)

1. **Telegram**: `python3 scripts/relay/telegram-relay.py poll` → apply each answer to its Qn
   (state in `.relay/telegram-state.json`). Free text with `q: null` = direct instruction from the user.
2. **Inboxes**: read comments on #63 (muse-88) and #64 (muse-min) newer than the last seen id
   (kept in `.relay/inbox-state.json`). ACK every TASK-for-me / QUESTION / HANDOFF / BLOCKED.
3. **GitHub state**: open PRs, their CI, main CI, board #11.
4. **Act** per the table below. Write replies in the inbox as `[reviewer→muse-x] TYPE R<n>` (message ids R1, R2… for reviewer, M1, M2… for Muses — never `#n`, GitHub autolinks it).
5. **Daily summary** at the first tick after 21:00 (once per day) via `telegram-relay.py send`.
6. **Re-ping**: a TASK with no ACK after 2 ticks → one `PING` (own id, not a new TASK); still nothing → note in summary.
7. **Schedule** next wake: 600–900 s if a CI run or Muse task is in flight, 1800 s when idle.
   Quiet hours 22:00–07:00: only urgent Telegram messages; the rest go into the morning line.
8. **Fast answers**: while any Qn is open, keep `python3 scripts/relay/telegram-relay.py wait 3600`
   running in the background (Bash `run_in_background`). Its exit wakes this session within seconds;
   handle the printed rows, then restart it if a Qn is still open. Exit code 3 = an hour passed quietly.
   While it runs, `poll` steps aside (one reader only), so step 1 is skipped.

## Decide alone vs ask the user

| Decide alone | Ask via `telegram-relay.py ask` |
|---|---|
| Review + merge green PR (`--match-head-commit <full sha>`) | Prod deploy — act only on a reply to that Qn saying "deploy đi" |
| Gates on main, parity recapture + commit | Lesson content / pedagogy choice |
| Assign next phase from the active plan | Irreversible: delete branches, force push, close unmerged PR, rewrite history |
| Quota handoff between Muses | A Muse BLOCKED after 2 attempts and the fix is not obvious |
| Rerun an obviously flaky CI job once | Main CI red with unknown cause |
| Answer Muse technical questions | Anything spending money or touching accounts |

While a Qn is open, keep doing independent work; never act on the item it blocks.
No answer within 12 h → ask once more, then carry it in the daily summary.

## Daily summary template

```
📋 Tóm tắt {date}
• Đã gộp: #.. (…)
• Đang chạy: #.. (CI …), muse-88 …%, muse-min …%
• Main: {sha} — prod: {bundle} ({n} PR chưa deploy)
• Câu hỏi chờ anh: Q.. …
• Việc tiếp theo: …
```

## Hard rules

- Never print, log or commit `TG_TOKEN`; never name `.env.relay` in a shell command (the script reads it).
- Push as ltminh88 with the established author/credential flags; commits end with the Co-Authored-By line.
- Repo public: no textbook content, secrets or personal data in comments.
- Never interrupt a Muse mid-task; messages wait in the inbox.
- Prod deploy command and verification as in memory `vercel-deploy`; only after "deploy đi".
