# Phase 09: Parent auth, parent gate, child profiles + picture password, guest migration, offline sync

## Context links
- [plan.md](./plan.md) · [research 02 §3-§6](research/researcher-02-supabase-auth-sync-report.md) · [phase 08](./phase-08-supabase-backend.md) · [phase 03 store](./phase-03-learning-core-and-local-store.md)
- Depends on: 03, 04, 08. Parallel with: 05, 06, 07. **Safety-critical: full unit + integration + e2e suites every run.**

## Overview
- Date: 2026-10-18
- Description: Parent signs in once on the child's device (Google OAuth or email/password, no OTP); session persists. Parent area (sign-in, profiles, picture passwords, settings, consent, export/delete, sign-out) behind a parent gate. Children pick their avatar on a profile picker, optionally confirm with a picture password. Guest progress migrates on sign-up. Offline-first outbox sync.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed

## Key Insights
- Whole feature behind `VITE_ENABLE_CLOUD`; unset -> guest-only game, no Supabase client created (also the deploy rollback switch).
- supabase-js: `persistSession`, `autoRefreshToken`, `flowType: 'pkce'` for Google redirect; `onAuthStateChange` registered once, never awaits Supabase calls inside (defer `setTimeout(0)`). Offline refresh failure must NOT sign out or wipe local data.
- Picture password = local profile-switch guard: hash `v1$salt$sha256(salt + 'p3|p7|p1')` via WebCrypto; verified offline against local copy (pulled from server); lockout after 3 fails: 30 s, doubling to 5 min; parent gate can bypass/reset. Not a credential.
- Parent gate (adult check, not security): hold button 3 s, then answer an adult arithmetic item (e.g. "47 + 38") from generated set; 2 wrong -> 30 s cooldown.
- Sync: outbox item per `session-committed`; flush on start, `online`, `visibilitychange:hidden`, after session, 60 s timer while queued; exponential backoff; delete outbox item only after RPC ack. Pull on sign-in/profile switch rebuilds local = server snapshot + unflushed outbox.
- Guest migration: after sign-up + consent, parent chooses which child gets guest progress -> one baseline batch with fresh `batchId` persisted before sending (crash-safe retry with same id) -> on ack mark guest migrated, then delete guest data.

## Requirements
- Sign-up / sign-in with email+password (confirmation email; "check your inbox" state; resend), Google button, password reset (email link opens reset form at `/#reset`), sign-out (keeps local data only if parent chooses; default clears cloud profiles from device).
- Consent screen: parent ticks policy (version from strings), child sees plain-language notice; stored via `create_child_profile`.
- Profile picker at launch when >= 1 cloud profile: avatar grid (min 96 px tiles) + guest tile; picture password pad (3x3 pictures, emoji-free SVG/low-poly icons for consistent rendering) when set.
- Parent area: manage profiles (nickname preset list + regex, avatar), set/reset/remove picture password, export data (download JSON), delete child, delete account (Edge Function), sign-out.
- Cloud unreachable (offline, DNS/5xx, paused Free project) is treated exactly like offline: child keeps playing locally, outbox retries with exponential backoff (max 15 min), no child-facing error; parent area shows a non-blocking banner "cloud not reachable since <time>".
- Errors: offline -> queue silently with small "will sync" badge; validation error from RPC -> keep item, mark poisoned after 5 tries, report count in parent area.

## Architecture
```
src/sync/
  supabase-client-factory.ts     lazy create when VITE_ENABLE_CLOUD
  parent-auth-service.ts         signUp, signInWithPassword, signInWithGoogle, resetPassword, signOut, session state
  auth-state-listener.ts         onAuthStateChange -> app events (deferred calls)
  child-profile-service.ts       create/update/delete, set picture password (RPCs)
  picture-password.ts            hash/verify (WebCrypto), lockout policy (pure parts)
  outbox-queue.ts                idb outbox read/ack/backoff/poison
  sync-engine.ts                 flush triggers, single-flight lock, ack handling
  server-snapshot-merge.ts       server rows + unflushed outbox -> local store
  guest-progress-migration.ts    baseline batch build + crash-safe state machine
  account-data-export.ts         export_my_data -> file download; delete-account call
src/ui/account/
  parent-gate.ts  parent-area-panel.ts  sign-in-panel.ts  sign-up-panel.ts  password-reset-panel.ts
  consent-screen.ts  child-profile-form.ts  profile-picker.ts  picture-password-pad.ts  picture-password-setup.ts
  sync-status-badge.ts  cloud-unreachable-banner.ts  account-strings.ts  account-ui.css
tests/integration/sync-against-local-supabase.test.ts   (vitest, needs `db:start`)
tests/e2e/account-guest-migration.spec.ts
tests/e2e/account-profile-picker-picture-password.spec.ts
tests/e2e/account-offline-sync.spec.ts
```
Modify: `src/app/boot.ts` (init cloud when flag set, show profile picker), `src/app/hub-menu.ts` (parent-area entry -> parent gate). Read-only: `src/sync/supabase-database-types.ts`, `src/store/*`.

## Related code files
Create: all above + unit tests `picture-password.test.ts`, `outbox-queue.test.ts`, `sync-engine.test.ts`, `server-snapshot-merge.test.ts`, `guest-progress-migration.test.ts`, `auth-state-listener.test.ts`, `parent-gate.test.ts` (pure question/cooldown logic).
Modify: `src/app/boot.ts`, `src/app/hub-menu.ts`. Delete: none.

## Implementation Steps
1. Client factory + auth service + listener; offline session behavior tests (refresh failure keeps session + data).
2. Parent gate + parent area shell; sign-in/up/reset panels; Google PKCE redirect back to app.
3. Consent screen + child profile form + profile service.
4. Picture password hash/verify/lockout (pure, tested) + pad + setup UI; local copy updated on pull.
5. Outbox queue, sync engine, snapshot merge (fake-indexeddb + mocked RPC transport for unit; real local Supabase for integration).
6. Guest migration state machine with crash points tested (kill after persist, after send, after ack).
7. Profile picker in boot; hub-menu entry; sync badge.
8. Integration test vs local Supabase: sign up via admin API in test setup, create child, send batch twice, assert counters once; every fact-key shape accepted.
9. E2E (local Supabase running, Mailpit for confirmation link): guest plays Bridge -> parent signs up + confirms -> consent -> migrate to new child -> second browser context signs in -> progress visible; picture password set -> wrong 3x -> lockout shown -> parent gate reset; offline play (context.setOffline) -> online -> server has batch.

## Todo list
- [ ] client factory, auth service, listener (+tests)
- [ ] parent gate + parent area + auth panels
- [ ] consent + profile form + service
- [ ] picture password logic + UI (+tests)
- [ ] outbox, sync engine, merge (+tests)
- [ ] guest migration (+crash tests)
- [ ] boot/profile picker/hub-menu wiring
- [ ] integration test
- [ ] 3 e2e specs

## Success Criteria
- All unit, integration and account e2e specs exit 0 against local Supabase.
- Build with `VITE_ENABLE_CLOUD` unset contains no Supabase network calls (e2e asserts no request to supabase host).
- Duplicate flush never double-counts; guest migration retried after simulated crash yields exactly one server batch.
- Paused/unreachable Supabase (e2e: route supabase host to 503) -> game plays, banner only in parent area, batch delivered after route restored.
- Offline launch with stored session shows profile picker and plays without sign-out.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Google redirect in installed PWA opens browser context | M | M | PKCE redirect to same origin; email/password always available as fallback; verify on iPad PWA + Windows Chrome/Edge in 10 |
| Session lost offline -> kid locked out | M | H | never sign out on refresh failure; play continues locally |
| Data loss during migration | L | H | delete guest only after ack; idempotent batch id persisted first |
| Kid guesses picture password | H | L | documented as guard only; lockout; real data protection is parent session + RLS |
| Parent gate beaten by older sibling | M | L | acceptable; destructive actions also require password re-entry (delete account) |
| Safari ITP deletes script-writable storage (IndexedDB) after 7 days without interaction when played in a Safari tab (installed home-screen PWA exempt) | M | H | request `navigator.storage.persist()`; parent area prompts "Add to Home Screen" on iPad Safari; nudge guests to sign in so progress is in the cloud; never delete local data before server ack |
Rollback: unset `VITE_ENABLE_CLOUD` and redeploy -> guest-only game; outbox keeps accumulating locally, flushes when re-enabled.

## Security Considerations
- Only publishable key in client; tokens in supabase-js storage; no PII in logs/console (child uuid only).
- Delete account requires recent password re-auth (or Google re-login) + parent gate.
- Picture hash never sent anywhere except own parent's RPC; salt random 16 bytes per set.
- CSP `connect-src` limited to Supabase project URL (set in 10).

## Next steps
- 10: real-device auth checks, privacy policy, production Supabase config.
