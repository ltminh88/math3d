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
