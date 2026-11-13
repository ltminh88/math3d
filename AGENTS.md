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
