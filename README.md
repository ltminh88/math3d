# math3d – Vương Quốc Cửu Chương

3D low-poly web/PWA math game for kids 7-9 (multiplication tables; guide NPC "VLM"). Vanilla Three.js + Vite + TypeScript, DOM overlay UI, Vietnamese (default) + English, self-hosted fonts (works offline).

Recovered from the production bundle of the original game (ex "Math AI Game 3D", math.aigame3d.com) with pixel/behavior parity, then renamed — see `docs/recovery-notes.md`.

## Requirements
- Node 24 (`.nvmrc`)
- Supabase CLI + Docker only for the backend phases (`db:*` scripts)

## Scripts
| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck + production build (PWA service worker included) |
| `npm run build:test` | Build in `test` mode (used by Playwright) |
| `npm run preview` | Serve `dist/` |
| `npm run typecheck` | `tsc --noEmit` (TypeScript 7) |
| `npm run lint` / `format` | Biome check / format |
| `npm test` | Vitest unit tests (`src/**/*.test.ts`) |
| `npm run test:e2e` | Playwright e2e (`tests/e2e`), desktop + mobile projects |
| `npm run test:parity` | Seeded SwiftShader parity: test build vs `tests/parity/baselines/local` (~30 min, Mac-specific baselines) |
| `npm run parity:baselines` | Regenerate the local parity baselines (intended visual changes only) |
| `npm run test:parity:live` | Archived gate vs the live-site baselines; valid only at tag `recovered-r180` |
| `npm run db:start` / `db:reset` / `db:test` / `db:types` | Local Supabase helpers |
| `npm run icons` | Regenerate PWA icons from `public/icons/icon.svg` |

First e2e/parity run needs `npx playwright install chromium`.

## Environment
Copy `.env.example` to a local env file (git-ignored). Leave `VITE_ENABLE_CLOUD` empty for a guest-only, fully offline game. Only the Supabase **publishable** key ever goes in client env; the service_role key never enters this repo.

## Pinned versions
three 0.186.1 (recovered on 0.180.0, bumped in phase 10), vite 8.3.4, vite-plugin-pwa 2.0.0, @supabase/supabase-js 2.118.0, vitest 5.0.5, @playwright/test 1.64.1, typescript 7.0.2 — all verified on npm at install (2026-10-18). `@types/three` is 0.186.0 (no 0.186.1 published). Lighting is retuned to the r180 look in `src/world/world-lighting-tuning.ts`.

See `docs/code-standards.md` for conventions and `plans/` for the implementation plan.
