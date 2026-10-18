---
title: "Hành Trình Đá Số (Number Stone Quest) math game MVP"
description: "3D low-poly web/PWA math game for kids 7-9: hub village with VLM guide, Bridge, Field and Forest levels, cosmetics shop, parent accounts with offline-first Supabase sync."
status: in-progress
priority: P2
effort: 128h
branch: main
tags: [feature, frontend, backend, database, auth, threejs, pwa, supabase]
blockedBy: []
blocks: []
created: 2026-10-18
---

# Hành Trình Đá Số (Number Stone Quest) MVP

Greenfield rebuild from ideas only (no original code, name or character). Game name and guide name ("VLM") live only in i18n strings. Vanilla Three.js + Vite + TS, DOM overlay UI, WebAudio synth + Web Speech read-aloud, vi (default) + en, PWA on Vercel. Parent accounts (Google + email/password) own child profiles (avatar + optional picture password); guest mode local-only; idb outbox + idempotent `sync_batch` RPC on Supabase Free.
Inputs: [brainstorm](../reports/brainstorm-261018-math-game-continuation.md) · [research 01 three.js](research/researcher-01-threejs-game-architecture-report.md) · [research 02 supabase](research/researcher-02-supabase-auth-sync-report.md)

## Phases
| Phase | Name | Status |
|-------|------|--------|
| 1 | [Scaffold, tooling, PWA, fonts, i18n](./phase-01-scaffold-tooling-pwa-i18n.md) | Done (569c3fe) |
| 2 | [Engine core, input, audio, read-aloud, UI kit, perf spike gate](./phase-02-engine-core-input-audio-ui-kit.md) | Pending |
| 3 | [Learning core and local store](./phase-03-learning-core-and-local-store.md) | Pending |
| 4 | [Hub, world map, VLM guide, story intro, cosmetics shop](./phase-04-hub-map-vlm-guide-story.md) | Pending |
| 5 | [Bridge level: equal groups, tables 2 and 5](./phase-05-bridge-level.md) | Pending |
| 6 | [Field level: arrays, commutativity, tables 3 and 4](./phase-06-field-level.md) | Pending |
| 7 | [Forest level: sharing, fact families](./phase-07-forest-level.md) | Pending |
| 8 | [Supabase backend: schema, RLS, RPC, pgTAP, keep-alive](./phase-08-supabase-backend.md) | Pending |
| 9 | [Parent auth, parent gate, child profiles with picture password, guest migration, sync](./phase-09-auth-profiles-sync-client.md) | Pending |
| 10 | [Polish, accessibility, perf, e2e, Vercel deploy](./phase-10-polish-a11y-perf-e2e-deploy.md) | Pending |

Effort (h) / depends on: 01 4/- · 02 17/01 · 03 10/01 · 04 21/02,03 · 05 12/04 · 06 12/04 · 07 12/04 · 08 9/01 · 09 17/03,04,08 · 10 14/05-09. Critical path 01>02>04>05..07>10 = 68h.

## Parallel groups and file ownership
- **G0**: 01 alone. Installs ALL dependencies + npm scripts, so no later phase edits `package.json`.
- **G1** (parallel): 02 `src/core/**`, `src/ui/kit/**`, `src/dev/**`, `bench.html` · 03 `src/learning/**`, `src/store/**` · 08 `supabase/**`, `src/sync/supabase-database-types.ts`, `.github/workflows/supabase-keep-alive.yml`.
- **G2**: 04 `src/app/**`, `src/scenes/**`, `src/characters/**`, `src/levels/shared/**`, `src/story/**`, `src/shop/**`, `src/main.ts`, `tests/e2e/helpers/**`, `tests/e2e/hub-*.spec.ts`, `tests/e2e/shop-*.spec.ts`.
- **G3** (parallel): 05 `src/levels/bridge/**` · 06 `src/levels/field/**` · 07 `src/levels/forest/**` (each + own `tests/e2e/<level>-*.spec.ts`) · 09 `src/sync/**` (minus generated types), `src/ui/account/**`, `tests/e2e/account-*.spec.ts`, `tests/integration/**`; edits `src/app/boot.ts`, `src/app/hub-menu.ts` (04 done; 05-07 never touch them).
- **G4**: 10 serial; may touch any file.
- Collision guards: levels self-register via `import.meta.glob('/src/levels/*/index.ts')`; strings per-module namespace (`defineStrings('bridge', {vi, en})`); idb schema (incl. `outbox`, `ownedCosmetics`) defined once in 03.

## Data flow
Input -> level round flow -> `learning/*` (pure) -> `game-store.commitSession(delta)` / `purchaseCosmetic()` -> IndexedDB -> (09) outbox -> `sync_batch` RPC -> Postgres; pull on login = server + unflushed outbox. Cloud unreachable (offline or paused Free project) = offline.

## Key dependencies
- Pinned exact (re-verify at install): three 0.186.1, vite 8.3.4, vite-plugin-pwa 2.0.0, @supabase/supabase-js 2.118.0, vitest 5.0.5, @playwright/test 1.64.1, typescript 7.0.2.
- Target devices: iPad 9th gen (iPadOS Safari, installed PWA) + Windows Core i5 (Chrome/Edge). Perf gate end of 02, recheck 04 and 10. Android/low-end out of MVP scope.
- Supabase CLI + Docker (08, 09). User creates the **Free** Supabase project and supplies URL + publishable key via env; service_role never committed. Google OAuth client, custom SMTP, Vercel project (10).
- Legal counsel review of consent/privacy copy before public launch; not blocking build.

## Cross-cutting rules
- Files <200 lines, kebab-case. `src/learning/**`, `src/store/**` import no `three`/DOM. Cosmetics are visual only, never touch learning logic.
- Every drag has tap-select and keyboard alternative (WCAG 2.5.7).
- Safety-critical (01 CI, 08, 09, 10 deploy): full test runs.
- Rollback: per-phase commits on `main`; `VITE_ENABLE_CLOUD` unset = guest-only game; migrations forward-only.

## Post-MVP (no phases)
City of Numbers (2-3 digit x 1 digit, remainders) · Math Tower (mixed review) · QR device pairing · teacher class codes · tables 6-9 · parent progress dashboard · per-attempt analytics log · app-store wrapper.

## Validation Log (2026-10-18)
- Auth -> parent Google + email/password (no OTP/magic link); parent gate; child avatar + picture password guard.
- Orientation -> landscape primary, portrait playable. Region unlock -> on finishing previous level.
- Coins -> cosmetics shop (VLM/avatar outfits, village decor), visual only (+5h, phase 04).
- Hosting -> Vercel (`vercel.json` SPA fallback, sw/manifest no-cache, branch previews).
- Name -> "Hành Trình Đá Số" / "Number Stone Quest"; guide "VLM"; i18n only.
- TTS -> in MVP: Web Speech, vi-VN voice only, hidden if absent, settings toggle (+3h, phase 02).
- Supabase -> Free only: weekly keep-alive workflow (mitigation, not guarantee); unreachable = offline; 500 MB / 50k MAU limits; no per-attempt log.
- Target devices → iPad 9th gen + Windows Core i5 (Chrome/Edge); low-end Android dropped; perf gate ≥55 fps, pixelRatio ≤2, antialias on.

## Unresolved questions
1. Division with remainder: excluded from MVP (assumed), deferred to City.
2. Notation: VN "2 x 3 = 2 taken 3 times"; Bridge accepts only groupSize x groupCount. Confirm with a grade-2 teacher.
3. Legal (Decree 13/2023, Law 91/2025): dual consent wording, DPIA, cross-border transfer (Supabase Singapore). Counsel.
4. VLM visual design; domain name.
5. Picture password: 3 ordered taps of 9 pictures, lockout 30 s doubling to 5 min; parent gate hold 3 s + adult arithmetic (assumed).
6. Supabase Free has no backups: accept, or add a scheduled `db dump` workflow later?
