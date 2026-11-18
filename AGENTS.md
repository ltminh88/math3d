# Guide for coding agents

math3d (Vương Quốc Cửu Chương) is a 3D math game for children aged 7–9: Vite + TypeScript + three.js,
Vietnamese first. Live at https://math3d-game.vercel.app.

Read in this order before changing anything:
1. `README.md` — scripts and pinned versions (Node 24).
2. `docs/code-standards.md` — layering, content rules and test rules. They are binding.
3. `docs/project-changelog.md` — what shipped last.
4. The active brief: `plans/261113-1951-more-practice-content-for-muse/plan.md`.

Hard rules:
- Work on a branch and open a pull request into `main`; never push to `main`.
- Never deploy to production. Preview deploys only (no `--prod`); the reviewer promotes after review.
- Never commit secrets or `.env*` files (only `.env.example` is tracked).
- Do not change `REGIONS`, `ROADS`, `WALKABLE_BOUNDS`, the golden traces or the parity baselines.
- Before a pull request: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`,
  `node tools/recovery/golden/generate-golden-traces.mjs --check`, `npx playwright test`.

Reporting progress (the author must never have to ask):
- After every push to a pull request, wait for CI in the same session:
  `gh pr checks <n> --watch --fail-fast`, and report the moment it exits. Only if you must
  end the session first, schedule a check for the expected finish time and say so.
- A red job is reported at once with the failing test and its log line, not at the end.
- Never end a turn with work "in progress" and no next check booked; the last message of a
  session states what is done, what is running, and when you will report next.
- Any wait over 30 minutes: give the expected finish time up front, and a one-line update
  every 60 minutes until it is done.
- Every report: status (green/red/running), links (PR, CI run, preview), next step, ETA.
- Local gates in a report name the exact command and passed/total (e.g.
  `npm run test:e2e -- --project=mobile-pixel` → 87/87). A partial run is reported as partial.

Parallel work (standing rule: applies to every new task, not only when asked):
- Before starting, split the task into independent lanes (no shared files, or shared files
  agreed with the author first). Run each lane as its own agent at the same time, each on its
  own branch and git worktree from the latest main. Up to 3 lanes.
- Lanes run one after another only when one depends on another; say which and why in the
  first report.
- At most 2 PRs in CI at once, and never two full e2e runs at once on the same machine.
- A PR that changes the UI on purpose gets the `parity-change` label when it is opened and
  lists the parity shots it changes; the author recaptures the Mac baselines after merge.
- Each report lists every lane: name, agent, branch, status, next check time.

Two Muse accounts (muse-88 and muse-min work on this repo at the same time):
- The coordination board is the pinned issue #11 ("Bảng luồng Muse"). Read it, `AGENTS.md`
  and `git log --oneline -15 origin/main` before every task. Update your own rows on the
  board whenever a lane starts, opens a PR, goes red or green, or merges.
- Take only lanes the board assigns to you. Branch prefix: muse-88 uses `muse/`, muse-min
  uses `muse-min/`. Each account has its own GitHub and Vercel tokens; never share them.
- Shared files have one owner, listed on the board. To change a file someone else owns,
  ask in a comment on #11 and wait until the owner's change is merged.
- The CI limit is shared: at most 2 open PRs in CI across both accounts. Claim a CI slot on
  the board before pushing; free it when CI finishes.
- If both accounts run on the same machine, the "one full e2e run at a time" rule covers
  both.
- Messages from the reviewer start with [muse-88], [muse-min] or [cả hai]. Act only on
  messages addressed to you or to both.
- Every report names the account (muse-88 or muse-min) and every lane it owns.
- Usage quota: report the account's weekly usage ("N% used, resets <day time>") in the
  first report of each day, whenever it crosses 50%, 75% or 90%, and before taking a new
  lane. If you cannot read the number, say so; do not guess.
- Keep working until the account reaches 99% used. From 90% used, push the branch after
  every commit and keep a handoff note on #11 current (what is done, what is left, the next
  command to run). At 99%, stop, push, and hand the lane to the other account through #11;
  the other account continues on the same branch.
- Never use paid "additional tokens" unless the author says so.
