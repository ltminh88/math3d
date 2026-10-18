# Phase 17: Parent auth, child profiles, guest migration, offline sync (client)

## Context links
- [plan.md](plan.md) · **Spec: [old phase 09 auth/profiles/sync client](../261018-1803-vlm-math-game-mvp/phase-09-auth-profiles-sync-client.md)** (auth flows, parent gate, picture password, outbox sync, guest migration, offline/unreachable handling, tests — valid unless changed below) · [phase 16](phase-16-supabase-backend.md) · [phase 12](phase-12-store-migration-and-learning-integration.md)
- Depends on: 13, 16. Parallel with: 14, 15 (G7). **Safety-critical: full unit + integration + e2e suites every run.**

## Overview
- Date: 2026-10-18
- Description: Old 09 implemented inside the recovered UI with the deltas below. Whole feature behind `VITE_ENABLE_CLOUD`.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed

## Prerequisites
- Docker running + `npm run db:start` (local Supabase, Mailpit) for integration/e2e.

## Deltas vs old phase 09
- Entry points: no `src/app/boot.ts` / `hub-menu.ts` (never built). Instead modify `src/main.ts` / `src/ui/bootstrap-game.ts` (cloud init + profile picker before world start) and `src/ui/settings-dialog.ts` (new "Phụ huynh" row -> parent gate). Must not touch `src/levels/**` (G7 collision).
- UI look: recovered dialog shell (`#dialog`, `dialog-content`, existing button/feedback classes) and fonts; account CSS in `src/ui/account/account-ui.css` using recovered color tokens. Avatars on profile picker = original boy/girl renders (canvas snapshot or SVG).
- Guest = the migrated legacy player from 12: guest migration batch includes bridge `progress`, wallet, all facts; legacy localStorage stays untouched.
- No cosmetics anywhere (decision 9); outbox items with `cosmetics` never produced.
- Language for emails/consent from settings-store (12).
- Remove "VLM" mentions in strings; guide = Milo.

## Key Insights
- See old 09 (PKCE, never sign out offline, picture password local guard + lockout, parent gate, outbox single-flight, crash-safe guest migration, Safari ITP mitigation `navigator.storage.persist()`).

## Requirements
- As old 09 + deltas.

## Architecture
- `src/sync/**` and `src/ui/account/**` file lists exactly as old 09 (minus cosmetics handling); tests as old 09 under `tests/integration/**`, `tests/e2e/account-*.spec.ts`.
- Modify: `src/main.ts`, `src/ui/bootstrap-game.ts`, `src/ui/settings-dialog.ts`. Read-only: `src/store/**`, `src/sync/supabase-database-types.ts`.

## Related code files
- Create: old 09 list. Modify: 3 files above. Delete: none.

## Implementation Steps
1. Old 09 steps 1-6 (client factory/auth, parent gate + panels, consent/profile, picture password, outbox/sync/merge, guest migration).
2. Wire boot (profile picker before world) + settings-dialog entry + sync badge in HUD corner (new element appended, no change to recovered HUD layout).
3. Integration test vs local Supabase (old 09 step 8) using real `SessionDelta` from store incl. bridge `progress` and `div:` keys.
4. E2E (old 09 step 9) with the recovered flow: legacy save injected -> play bridge -> parent signs up -> consent -> migrate -> second context sees XP/coins/bridge.

## Todo list
- [ ] auth service + listener (+tests)
- [ ] parent gate + panels
- [ ] consent + profiles
- [ ] picture password (+tests)
- [ ] outbox, sync engine, merge (+tests)
- [ ] guest migration (+crash tests)
- [ ] boot/settings wiring + badge
- [ ] integration test
- [ ] 3 e2e specs

## Success Criteria
- Old 09 criteria + build with `VITE_ENABLE_CLOUD` unset makes zero requests to supabase host and parity suite unchanged (cloud off = recovered game + 12/13 only).

## Scope Contract
- Changed: auth, sessions/tokens, sync (cross-service), boot. All safety-critical -> full unit + integration + e2e + parity.
- Skipped: none.

## Risk Assessment
See old 09 table, plus:
| Risk | L | I | Countermove |
|---|---|---|---|
| Profile picker breaks original first-run flow (welcome/avatar) | M | M | picker shown only when >= 1 cloud profile exists; guest path = original flow, parity covers it |
Rollback: unset `VITE_ENABLE_CLOUD` and redeploy.

## Security Considerations
- As old 09 (publishable key only, no PII in logs, re-auth for delete account, CSP connect-src set in 18).

## Next steps
- 18 real-device auth checks, prod Supabase.
