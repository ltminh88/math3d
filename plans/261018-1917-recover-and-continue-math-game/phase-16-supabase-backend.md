# Phase 16: Supabase backend (schema, RLS, RPCs, auth config, pgTAP)

## Context links
- [plan.md](plan.md) · **Spec: [old phase 08 Supabase backend](../261018-1803-vlm-math-game-mvp/phase-08-supabase-backend.md)** (tables, RLS, RPCs, `sync_batch` validation, auth config, pgTAP list, keep-alive — all valid unless changed below) · [phase 12 store shape](phase-12-store-migration-and-learning-integration.md)
- Depends on: 12 (final `SessionDelta`/`LevelProgress` shape). Parallel with: 13 (G6). **Safety-critical: full pgTAP suite every run.**

## Overview
- Date: 2026-10-18
- Description: Old 08 implemented with the deltas below. Local-first Supabase project in `supabase/`; production = user-created Free project.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed

## Prerequisites
- Docker Desktop installed and RUNNING on the dev Mac (`docker info` exit 0) — currently not running; `supabase start` fails without it.
- Supabase CLI (already pinned devDep 2.121.0).

## Deltas vs old phase 08
- `level_progress` + column `progress smallint not null default 0 check (progress between 0 and 100)` (bridge segments 0..6 today); `sync_batch` applies `progress` as max().
- Child profile `avatar_id` constraint: `^(boy|girl|[a-z0-9-]{1,40})$` (original avatars kept).
- Child `settings jsonb` carries `table`, `combo` only if needed for cross-device resume (decide: store `table` only; combo is per-session, local).
- **Dropped (decision 9)**: `owned_cosmetics` table, cosmetics in `sync_batch` (`cosmetics` key rejected if present), `tests/owned-cosmetics-sync.test.sql`. Wallet delta still clamped >= 0, coins delta range [0, 500] per batch (earn-only).
- Level ids constrained: `^(bridge|field|forest|city|tower)$`.
- Email templates branded "Math AI Game 3D – Vương Quốc Cửu Chương" (vi), not "Hành Trình Đá Số".
- `site_url` / redirect allow-list: localhost, preview pattern, `https://math.aigame3d.com` (prod host decision pending — plan Q1).
- Fact-key regex copied from `src/learning/fact-key.ts` `FACT_KEY_PATTERN_SOURCE` (unchanged contract).

## Key Insights
- See old 08 (children never auth users, picture-password hash is a guard not a credential, idempotent batch PK, security definer hygiene, Free-tier pause + keep-alive).

## Requirements
- As old 08 + deltas.

## Architecture
- As old 08 `supabase/**` tree minus cosmetics; migrations created with `supabase migration new` in order: core tables, RLS, profile/consent/password RPCs, sync_batch, export.
- `src/sync/supabase-database-types.ts` generated (`npm run db:types`), read-only for 17.

## Related code files
- Create: `supabase/**`, `src/sync/supabase-database-types.ts`, `.github/workflows/supabase-keep-alive.yml`. Modify: none. Delete: none.

## Implementation Steps
1. Start Docker; `npx supabase init`; auth config (old 08 step 1 + deltas).
2. Migrations (old 08 step 2 + `progress`, constraints, no cosmetics).
3. pgTAP suite (old 08 list minus cosmetics, plus `level-progress-max-merge.test.sql`, `sync-batch-rejects-cosmetics.test.sql`).
4. Edge Function `delete-account`; local curl test.
5. Generate types; keep-alive workflow (secrets `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` only).
6. Rollback drill `npm run db:reset && npm run db:test`.

## Todo list
- [ ] Docker running, init + auth config
- [ ] tables + constraints (+ progress)
- [ ] RLS + `owns_child`
- [ ] RPCs (profile/consent/password, sync_batch, export)
- [ ] pgTAP suite
- [ ] delete-account function
- [ ] types + keep-alive

## Success Criteria
- Old 08 criteria (minus cosmetics) + `progress` merges as max under duplicate/out-of-order batches; batch with `cosmetics` key rejected.
- `npm run db:reset && npm run db:test` exit 0.

## Scope Contract
- Changed: DB schema, RLS, RPCs, auth config, CI workflow. All safety-critical -> full pgTAP suite + type generation check every run.
- Skipped: client code (untouched).

## Risk Assessment
See old 08 table, plus:
| Risk | L | I | Countermove |
|---|---|---|---|
| Docker unavailable on Mac blocks phase | M | M | start early; fallback: run pgTAP in GitHub Actions only (slower loop) |
| Schema drifts from store shape | M | H | 17 integration test sends real `SessionDelta` from store |
Rollback: local `db:reset`; prod untouched until 18.

## Security Considerations
- As old 08: service_role only in Edge Function env; RLS default-deny; anon only `health_ping`.

## Next steps
- 17 client; 18 prod project setup.
