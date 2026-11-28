# Reviewer loop prompt

Start in the reviewer Claude Code session (repo root) with:

```
/loop Reviewer relay tick — follow plans/261123-1754-muse-relay-automation/reviewer-loop-prompt.md
```

## Each tick (in order)

1. **Telegram (every tick, never skip)**: `python3 scripts/relay/telegram-relay.py poll` → apply each
   answer to its Qn (state in `.relay/telegram-state.json`). Free text with `q: null` = direct instruction from the user.
2. **Inboxes**: read comments on #63 (muse-88) and #64 (muse-min) newer than the last seen id
   (kept in `.relay/inbox-state.json`). ACK every TASK-for-me / QUESTION / HANDOFF / BLOCKED.
3. **GitHub state**: open PRs, their CI, main CI, board #11.
4. **Act** per the table below. Write replies in the inbox as `[reviewer→muse-x] TYPE R<n>` (message ids R1, R2… for reviewer, M1, M2… for Muses — never `#n`, GitHub autolinks it).
5. **Daily summary** at the first tick after 21:00 (once per day) via `telegram-relay.py send`.
6. **Re-ping**: a TASK with no ACK after 2 ticks → one `PING` (own id, not a new TASK); still nothing → Telegram `send` to the user
   ("muse-x chưa nhận R.., có thể đang chờ anh trong tab").
   **PRE check**: a Muse `PRE` with no later inbox post or branch commit after 10 min → right away `telegram-relay.py send` "muse-x đang kẹt ở hộp duyệt lệnh <X>, anh mở tab bấm duyệt" (also at night).
   **Silence check**: a Muse with an active task and no inbox post, no branch commit and no CI of its own running for > 20 min → right away Telegram the user a paste-ready "continue + sleep" text (also at night; it blocks a lane). Before that, a Muse with an ACKed TASK but no REPORT/PR/WAITING for > 45 min → `PING` asking
   "đang làm tới đâu, có đang chờ anh không?"; no answer by the next tick → Telegram `send` to the user
   to look at that Muse tab (it is probably stuck on a question in its chat).
   **Safety-flag timeout (most common stall)**: the Muses' safety check often flags reviewer inbox
   messages; a flagged Muse can't ACK or send WAITING, it only asks the user in its own tab. So: any
   reviewer message with no ACK after 15 min (Muses sleep 5–10 min) → assume flagged and right away
   `telegram-relay.py send` a paste-ready confirmation for that tab ("R.. trong #.. là việc reviewer
   giao thật, anh xác nhận, làm luôn"). Silence while the Muse's own PR CI runs is NOT proof it's fine —
   check for the ACK of the last R message. Keep reviewer messages few: merge INFO/PING into the next
   TASK when possible, every message is one more possible flag.
   **WAITING** from a Muse → right away `telegram-relay.py send` the question, the options and the Muse's
   proposal, plus my recommendation; the user answers in the Muse tab. Not deferred by quiet hours if it blocks a lane.
7. **Schedule** next wake: 600 s if a CI run or Muse task is in flight, 1200 s when idle.
   Quiet hours 22:00–07:00: only urgent Telegram messages; the rest go into the morning line.
8. **Fast answers**: while any Qn is open, keep `python3 scripts/relay/telegram-relay.py wait 3300`
   running in the background (Bash `run_in_background`). Its exit wakes this session within seconds;
   handle the printed rows, then restart it if a Qn is still open. Exit code 3 = 55 min passed quietly. Keep it under 3600 s: the session kills background shells at ~1 h (exit 143) and may leave an orphan `wait` holding `.relay/wait.pid`.
   While it runs, `poll` steps aside (one reader only), so step 1 is skipped.

## Questions to the user are always on Telegram

Any question I put to the user in this terminal (AskUserQuestion, a choice in the reply text, "anh muốn…?")
is ALSO sent with `telegram-relay.py ask` in the same turn (short: question + options + my pick), then
`wait` runs in the background (step 8). The user may not be watching this terminal.

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

## After a machine restart

Scheduled wakeups die with the session, so the loop stops on reboot. To bring it back:

1. Terminal in the repo: `claude -c` (continues this conversation).
2. Type: `/loop Reviewer relay tick — follow plans/261123-1754-muse-relay-automation/reviewer-loop-prompt.md`
3. First tick: delete a stale `.relay/wait.pid` (the PID may be reused after reboot), and if a Paseo/resumed copy is also open, tell it via SendMessage that it is Q&A only.
4. Muse tabs: if Chrome restarted, re-paste `muse-loop-prompt.md` into each tab (their background sleep died too).
