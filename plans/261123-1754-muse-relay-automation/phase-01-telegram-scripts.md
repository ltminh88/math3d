# Phase 01 — Telegram scripts

## Context links
- Parent: [plan.md](plan.md)
- Env: `.env.relay` (repo root, gitignored via `.env.*`, mode 600)

## Overview
- Date: 2026-11-23 · Priority: P1 · Status: pending · Review: pending
- Three small bash scripts the reviewer loop calls to send, ask and read replies.

## Key insights
- Bot privacy mode ON is fine: in groups the bot still receives replies to its own messages and `/commands`.
- No webhook set → `getUpdates` long-poll works. Bot is dedicated to relay (old bot shared elsewhere was dropped).
- Group is a basic group; if upgraded to supergroup the API returns `migrate_to_chat_id` → script must report it, not crash.
- A local hook blocks commands that mention `.env.relay` directly; scripts load it internally, so loop commands never name the file. Verify in step 6.

## Requirements
- `tg-send.sh "<text>"` → send plain text to group; exit non-zero on failure; print only `ok message_id`.
- `tg-ask.sh "<question>"` → allocate next `Qn`, send `[Qn] <question>`, store `{n, message_id, asked_at, status:open}`.
- `tg-poll.sh` → fetch updates since stored offset; keep only allowed user + chat; match answer to `Qn` by `reply_to_message.message_id`, fallback text prefix `Qn:`; print JSON lines `{q, answer}`; advance offset; mark question answered.
- Token never in argv, stdout, stderr, logs. Text sent via `--data-urlencode`.
- Messages > 4000 chars split.

## Architecture
```
scripts/relay/
  lib-env.sh     # source .env.relay, fail if any var missing (prints var NAME only)
  tg-send.sh     # sendMessage
  tg-ask.sh      # sendMessage + register Qn
  tg-poll.sh     # getUpdates → answers
.relay/          # gitignored runtime state
  state.json     # {offset, next_q, questions:{...}, inbox_seen:{...}}
  log.txt        # redacted activity log
```
curl call: `printf 'url = "https://api.telegram.org/bot%s/%s"\n' "$TG_TOKEN" "$method" | curl -sS -K - --data-urlencode ...`

## Related code files
- Create: `scripts/relay/*.sh`. Modify: `.gitignore` (add `.relay/`).

## Implementation steps
1. Add `.relay/` to `.gitignore`; confirm with `git check-ignore`.
2. Write `lib-env.sh` (resolve repo root from script path, `set -a; . .env.relay`).
3. Write `tg-send.sh`, `tg-ask.sh`, `tg-poll.sh` (python3 for JSON; no jq dependency).
4. `shellcheck` all scripts.
5. Live test: send, ask Q1, user replies, poll returns answer; a message from another chat/user is ignored.
6. Run scripts from the loop context to confirm the secret-file hook does not prompt.
7. Grep test: `git grep -n "$(cut -c1-12 token)"` returns nothing; log file has no token.

## Todo list
- [ ] gitignore `.relay/`
- [ ] lib-env + 3 scripts
- [ ] shellcheck clean
- [ ] live round-trip test
- [ ] token-leak grep check

## Success criteria
- Round trip Q→reply→poll works; foreign senders ignored; no token anywhere on disk except `.env.relay`.

## Risk assessment
- Token leak via `set -x` or error output → never use `set -x`; curl `-sS` errors don't echo URL with `-K`.
- Offset lost → re-reads old answers; mitigated by `status:answered` check.

## Security considerations
- Auth = allowlist of user id + chat id. Treat answer text as a decision only for the open Qn it replies to.

## Next steps
- Phase 03 consumes these scripts.
