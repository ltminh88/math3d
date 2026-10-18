# Phase 08: Supabase backend (schema, RLS, RPCs, auth config, pgTAP)

## Context links
- [plan.md](./plan.md) · [research 02 §1, §2, §3, §6](research/researcher-02-supabase-auth-sync-report.md)
- Depends on: [phase 01](./phase-01-scaffold-tooling-pwa-i18n.md) (Supabase CLI devDep)
- Parallel with: 02, 03 (G1). **Safety-critical: full pgTAP suite every run.**

## Overview
- Date: 2026-10-18
- Description: Local-first Supabase project in git (production = user-created **Free** project; URL + publishable key via env only): tables, RLS default-deny, write-through-RPC for progress, idempotent `sync_batch`, child profile + consent RPCs, picture-password hash column, export/delete, auth config (Google + email/password, email confirmation, password policy; **no OTP / magic link**), pgTAP tests, generated TS types.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed

## Key Insights
- Children are never auth users. Parent auth = Google OAuth or email/password; parent signs in once per child device; session persists.
- Picture password is a profile-switch guard on shared devices, **not a credential**: 9 pictures, 3 ordered taps = 504 combos, trivially brute-forceable from the hash. Store only `v1$<salt hex>$<sha256 hex>` (computed client-side, verified locally/offline). Parent-only write; never readable by other parents (RLS).
- Counters additive, box LWW by newest `seen_at`, stars/score max, wallet delta clamped >= 0. Batch PK = idempotency key, insert + apply in one transaction -> exactly-once.
- Child profile + consent created atomically by RPC so no child row exists without a consent record.
- Free tier: pauses after 7 days without activity, 500 MB DB, 50k MAU, no backups. Mitigation: weekly GitHub Actions keep-alive calling a harmless `health_ping()` RPC (mitigation, not a guarantee); client treats unreachable cloud as offline (09). Session-level batches only; per-attempt logging stays out (DB budget).
- `auth.uid()` wrapped in `(select auth.uid())` in policies; security definer fns: `set search_path = ''`, schema-qualified names, ownership check first, `revoke execute from public, anon`.

## Requirements
- Tables: `owned_cosmetics(child_id, cosmetic_id, acquired_at, pk(child_id, cosmetic_id))`, `child_profiles(id, parent_id, nickname, avatar_id, picture_password_hash null, settings jsonb, settings_updated_at, created_at)`, `fact_stats`, `level_progress`, `wallet`, `sync_batches`, `parent_consents(id, parent_id, child_id, policy_version, scope text[], granted_at, revoked_at)`.
- Constraints: nickname regex `^[\p{L}0-9 _-]{1,16}$`; fact_key `^(mul|div):[0-9]{1,3}[x/][0-9]{1,3}$` (matches `src/learning/fact-key.ts`); hash `^v1\$[0-9a-f]{32}\$[0-9a-f]{64}$`; cosmetic_id `^[a-z0-9-]{1,40}$`; box 1-5; correct <= attempts.
- RPCs (security definer, `authenticated` only): `create_child_profile(nickname, avatar_id, policy_version, scope)`, `update_child_profile(child_id, nickname?, avatar_id?, settings?)`, `set_picture_password(child_id, hash null)` (null = remove/reset), `delete_child_profile(child_id)`, `sync_batch(p_batch jsonb)`, `export_my_data()` (json of parent's children, stats, cosmetics, consents). `health_ping()` (security invoker, `select 1`, granted to anon; touches no data) for keep-alive.
- `sync_batch` validation: payload <= 64 KB, <= 300 facts, per-fact `a <= 500`, `0 <= ms/a <= 60000`, `c <= a`, xp delta <= 2000, coins delta in [-500, 500], `v = 1`, <= 20 cosmetic ids (inserted `on conflict do nothing`; server has no price catalog -> trusts client prices, wallet clamp >= 0 bounds abuse); rate limit > 20 batches/min/child -> error. Returns fresh child snapshot.
- Edge Function `delete-account`: verifies caller JWT, `auth.admin.deleteUser(uid)` with service role (cascade wipes data).
- Auth config (`supabase/config.toml`): email provider with `enable_confirmations = true`, password min length 10 + `required_characters` letters+digits, secure password change; Google provider via env (`SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID/SECRET`); `site_url` + redirect allow-list (localhost, preview, prod); vi email templates for confirm-signup and reset-password (no OTP template); auth rate limits set.

## Architecture
```
supabase/
  config.toml
  migrations/<cli-ts>_create_core_tables.sql
  migrations/<cli-ts>_enable_rls_policies.sql
  migrations/<cli-ts>_profile_consent_password_rpcs.sql
  migrations/<cli-ts>_sync_batch_rpc.sql
  migrations/<cli-ts>_export_data_rpc.sql
  functions/delete-account/index.ts
  templates/confirm-signup-vi.html  reset-password-vi.html
  tests/rls-cross-parent-isolation.test.sql
  tests/child-profile-consent-rpc.test.sql
  tests/picture-password-rpc.test.sql
  tests/sync-batch-idempotency.test.sql
  tests/sync-batch-validation-and-rate-limit.test.sql
  tests/export-and-cascade-delete.test.sql
  tests/anon-role-denied.test.sql
  tests/owned-cosmetics-sync.test.sql
.github/workflows/supabase-keep-alive.yml   weekly cron + manual dispatch: POST /rest/v1/rpc/health_ping with publishable key from repo secrets
src/sync/supabase-database-types.ts   (generated by `npm run db:types`; owned here, read-only for 09)
```
Policies: `child_profiles` select/update/delete where `parent_id = (select auth.uid())`, no insert policy (RPC only); `fact_stats`, `level_progress`, `wallet`, `sync_batches`, `parent_consents`, `owned_cosmetics` select via `public.owns_child(child_id)`, no write policies.

## Related code files
Create: all files above. Modify: none. Delete: none.

## Implementation Steps
1. `npx supabase init` (config only), set auth config above; `npm run db:start`.
2. Migrations via `supabase migration new <name>` (CLI timestamps), in order listed.
3. pgTAP tests: create two parents in `auth.users` inside the test txn, switch with `set local role authenticated` + `request.jwt.claims`; cover every RPC and policy for owner, other parent, anon.
4. Edge Function `delete-account` + local test via `supabase functions serve` (curl with/without JWT).
5. `npm run db:types` -> commit generated file.
5b. Keep-alive workflow; document required repo secrets (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`) — never service_role.
6. Rollback drill: `npm run db:reset` from scratch passes all tests.

## Todo list
- [ ] init + auth config (Google, email/password, confirmations, password policy, no OTP)
- [ ] tables + constraints
- [ ] RLS policies + `owns_child`
- [ ] profile/consent/picture-password RPCs
- [ ] `sync_batch` RPC
- [ ] export RPC + delete-account function
- [ ] pgTAP suite
- [ ] generated types
- [ ] owned_cosmetics + health_ping + keep-alive workflow

## Success Criteria
- `npm run db:reset && npm run db:test` exit 0, all pgTAP files pass.
- Parent B cannot select, update, delete, sync, set picture password or export for parent A's child (each asserted).
- Same `sync_batch` sent twice -> counters applied once.
- Anon role: zero rows readable, every RPC denied except `health_ping`.
- Keep-alive workflow succeeds via manual dispatch against the user's Free project.
- Child row cannot be created without a consent row (direct insert denied; RPC creates both).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| RLS hole via security definer fn | M | H | ownership check first line, pgTAP per fn for other-parent + anon |
| Validation too strict rejects real batches | M | M | 09 integration test sends realistic batches; error codes surfaced, batch kept in outbox |
| Picture hash mistaken for security | M | M | documented in code comment + docs; real security = parent session + RLS |
| Free tier pause | M | M | weekly keep-alive (not guaranteed); client offline mode; outbox survives until project resumed |
| Free tier no backups | M | H | accepted for MVP (plan Q6); data partially recoverable from device outboxes; export RPC |
| 500 MB DB limit | L | M | ~1-2 MB/child/yr; no per-attempt log |
Rollback: local `db:reset`; production is untouched until 10. Post-launch: forward-only fix migrations.

## Security Considerations
- service_role only in Edge Function env, never in client or repo.
- No PII beyond parent email (auth) and child nickname; no IP/UA in consent rows.
- Password policy + email confirmation; (leaked-password protection is Pro-only: not available on Free).

## Next steps
- 09 builds the client on these RPCs and types.
