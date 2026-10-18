# Researcher-02: Supabase auth + offline sync for kids' math PWA

Date 2026-10-18. Cap: 5 tool calls -> only 2 pages fetched live. Tags: [F] fetched this run, [K] from prior knowledge, verify before build.
Skill preflight: tkm:help activated; no deeper skill (research/search-docs) used due to call cap.

## Sources
- [F] https://supabase.com/pricing (Free limits)
- [F] https://supabase.com/docs/guides/auth/auth-anonymous (anon auth, linking, limits)
- [K] https://supabase.com/docs/guides/database/postgres/row-level-security ; /guides/auth/sessions ; /guides/auth/passwordless-login/auth-email-otp ; /guides/local-development ; /guides/database/functions (security definer)
- [K] Decree 13/2023/ND-CP (Art. 20 children's data), Law 91/2025/QH15 Personal Data Protection (eff. 2026-01-01); COPPA 16 CFR 312
- Credibility: Supabase docs = official, high. Legal = knowledge only, needs lawyer.

## 1. Account model (ranked)
| Rank | Option | Pros | Cons |
|---|---|---|---|
| 1 | Parent account (email OTP code + Google) owning N child_profiles rows; child is NOT an auth user | No child email/credential; consent sits on parent; one login for siblings; simplest RLS (`parent_id = auth.uid()`) | Parent must act before sync; kid can't self-recover |
| 2 | Anonymous auth then `updateUser(email)` / `linkIdentity(google)` | Cloud sync before signup | [F] default 30 req/h per IP (shared school NAT breaks it), anon users bloat DB, no auto cleanup, captcha strongly advised, manual linking must be enabled; kids' data held with no consent |
| 3 | Class codes (teacher) | Classroom adoption | Needs teacher role, roster, moderation. Post-MVP (YAGNI) |

Call: Option 1 + local-only guest (sec 4). Skip anon auth for MVP.
- Use 6-digit OTP code entry, NOT magic link, as primary: on iOS the link opens Safari, not the installed PWA (separate storage) -> session lands in wrong context [K]. Email template must include `{{ .Token }}`. Google OAuth as second button (Gmail dominant in VN).
- Default Supabase SMTP is tightly rate limited [K]; configure custom SMTP (Resend/Brevo) before launch.
- Child PIN: optional, only gates switching profiles / parent zone on shared device. It is UX, not security. Hash server-side (pgcrypto `crypt`) or keep device-local; never plaintext.

### Legal (verify with counsel) [K]
- Decree 13/2023: children = under 16; processing needs parent/guardian consent, and child's own consent when 7+ (our users 7-9 -> collect both: parent ticks, child sees plain-language notice). Law 91/2025 (eff. 2026) keeps/raises child protections.
- Decree 13 also expects: impact assessment dossier (DPIA) filed with MPS/A05 within 60 days of processing start; cross-border transfer dossier if data leaves VN (Supabase region Singapore = offshore). Flag to owner.
- COPPA (if any US users): verifiable parental consent under 13; email-plus acceptable-ish only when no disclosure to third parties. Design to it anyway.
- Minimal data: parent email; child nickname (preset list or restricted regex, no real names), avatar id, optional age band/grade (not birthdate). NO photo, location, phone, device fingerprint, ads, third-party analytics SDKs.
- Consent record: table `parent_consents(id, parent_id, child_id, policy_version, scope text[], granted_at, revoked_at)`; store version + timestamp, skip IP/UA. Provide delete-account + export. Parent deletion needs Edge Function with service role (`auth.admin.deleteUser`); client cannot delete itself. FK `on delete cascade` wipes everything.

## 2. Schema (Postgres, all in `public`, RLS on)
```sql
create table child_profiles(
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users on delete cascade,
  nickname text not null check (nickname ~ '^[\p{L}0-9 _-]{1,16}$'),
  avatar text not null, pin_hash text,
  settings jsonb not null default '{}', settings_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now());
create index on child_profiles(parent_id);

create table fact_stats(              -- ~300 rows/child max (mul + div tables)
  child_id uuid references child_profiles on delete cascade,
  fact_key text check (fact_key ~ '^(mul|div):[0-9]{1,2}[x/][0-9]{1,2}$'),
  attempts int not null default 0, correct int not null default 0,
  total_ms bigint not null default 0,  -- avg = total_ms/attempts (sum merges, avg doesn't)
  box smallint not null default 1 check (box between 1 and 5),
  last_seen timestamptz,
  primary key(child_id, fact_key),
  check (correct between 0 and attempts));

create table level_progress(child_id uuid references child_profiles on delete cascade,
  level_id text, stars smallint check (stars between 0 and 3), best_score int,
  updated_at timestamptz default now(), primary key(child_id, level_id));  -- merge: max()

create table wallet(child_id uuid primary key references child_profiles on delete cascade,
  xp bigint not null default 0 check (xp>=0), coins bigint not null default 0 check (coins>=0));

create table sync_batches(            -- append-only; PK = idempotency key
  id uuid primary key, child_id uuid not null references child_profiles on delete cascade,
  client_ts timestamptz not null, payload jsonb not null, received_at timestamptz default now());
create index on sync_batches(child_id, received_at desc);
```
- Event log decision: store per-SESSION batch (about 1 KB), not per-attempt. Per-attempt rows ~ 20k/kid/month would eat the 500 MB Free DB fast [F limit]. Add per-attempt log later only if analytics needs it (YAGNI); prune with pg_cron if so.
- Leitner `box` is not commutative: server takes box from the batch with newest `last_seen` (LWW per fact).
- RLS (wrap `auth.uid()` in `(select ...)` so it is evaluated once per query [K]):
```sql
create function owns_child(c uuid) returns boolean language sql stable security definer set search_path='' as
$$ select exists(select 1 from public.child_profiles where id=c and parent_id=(select auth.uid())) $$;
alter table child_profiles enable row level security;
create policy cp_all on child_profiles for all to authenticated
  using (parent_id=(select auth.uid())) with check (parent_id=(select auth.uid()));
-- fact_stats, level_progress, wallet, sync_batches: SELECT only via owns_child(child_id);
-- no INSERT/UPDATE policy -> writes only through RPC sync_batch()
```
- Anon role: no policies = no access. If anon sign-in ever added, add restrictive policy on `(select auth.jwt()->>'is_anonymous')::boolean is not true` [F].

## 3. Offline-first sync
Design (KISS): local state = server snapshot + pending deltas. Counters are additive, so no real conflicts.
1. Play reads/writes IndexedDB (`idb`, ~1 KB lib). localStorage too small/sync-blocking; fine only for tiny settings.
2. Each finished session -> one outbox item `{batch_id: crypto.randomUUID(), child_id, client_ts, facts:{key:{a,c,ms,box,seen}}, level:{...}, xp, coins, settings?}`.
3. Flush triggers: `online` event, `visibilitychange->hidden`, app start, after session end, 60s timer while queued. Do NOT rely on Background Sync API (no Safari/iOS) [K].
4. RPC `sync_batch(p_batch jsonb)` security definer: verify `owns_child`; `insert into sync_batches ... on conflict (id) do nothing`; if row inserted, apply: `attempts = attempts + d`, `correct = correct + d`, `total_ms = total_ms + d`, `last_seen = greatest`, box by newest seen, `level stars/score = greatest`, wallet `+ delta`. Same txn -> exactly-once; retries safe. Returns fresh rows for that child.
5. Pull: on login/profile switch, select all fact_stats (<= ~300 rows) - no cursor needed. Rebuild local = server + unflushed outbox.
6. Settings: LWW using server `now()` at write (client clocks lie); acceptable, settings are trivial.
7. Coins spent = negative delta in same batch; clamp >=0 server-side.

| Option | Perf | Complexity | Maintenance/risk | Verdict |
|---|---|---|---|---|
| supabase-js + idb + 1 RPC | ample (tiny data) | low, ~150 LOC | none extra | **1. Use** |
| PowerSync | great | needs separate service + sync rules + SQLite WASM | vendor dep, free tier limits [K] | 2. Revisit if data grows/multi-writer |
| RxDB (+supabase replication) | good | schema/RxJS stack, some plugins paid [K] | bundle weight | 3 |
| ElectricSQL | read-sync only; writes need own API | medium | rewrote architecture at v1 (breaking history) [K] | 4 |
Why not a library: single writer per child, additive counters, <1 MB data per kid. Library = YAGNI.

## 4. Guest mode
- No account: a local child `guest` (uuid in IndexedDB) with identical local schema + outbox. Zero network calls, zero PII, no consent needed.
- Soft prompt after N sessions: "ask a parent to save progress".
- Migration after parent signs in + consent: create child_profile -> upload guest state as ONE baseline batch with fresh uuid (aggregate of local counters) -> on RPC ack, store `{guest->child_id}` map and mark migrated; delete guest data only after ack (crash-safe; retry reuses same batch id).
- Same device, several kids: guest data maps to whichever child the parent picks (UI step); extra kids start fresh.
- Cleaner than anon auth: no phantom users, no IP rate-limit, no DB bloat.

## 5. supabase-js v2 + ops
- `createClient(url, key, {auth:{persistSession:true, autoRefreshToken:true, detectSessionInUrl:true}})`. Session in localStorage by default; PWA ok. Offline: `getSession()` reads local copy; treat as signed in; a failed refresh offline must NOT wipe local progress or log out.
- Flow: OTP = `signInWithOtp({email})` then `verifyOtp({email, token, type:'email'})` (no redirect/PKCE needed). Google = `signInWithOAuth` ; set `flowType:'pkce'` for the redirect path (default may be implicit in browser client - verify) and `exchangeCodeForSession`. [K]
- `onAuthStateChange`: register once at boot; events INITIAL_SESSION / SIGNED_IN / TOKEN_REFRESHED / SIGNED_OUT. Do not `await` other supabase calls inside the callback (known deadlock); defer with `setTimeout(0)`. [K]
- Keys: publishable/anon key is public by design; never ship service_role. New `sb_publishable_` key naming rolling out, legacy anon still works [K].
- CLI: `supabase init`, `supabase start` (Docker), `supabase migration new x`, `supabase db reset`, `supabase link` + `supabase db push`, `supabase gen types typescript --local`, `supabase test db` (pgTAP; use it to test RLS). Migrations in git = source of truth.
- Free tier [F]: 50k MAU; 500 MB DB (shared CPU/500 MB RAM); 5 GB egress; 1 GB storage; 2 active projects; **pauses after 1 week inactivity**; logs 1 day; auth audit logs 1 hour. [K] no backups on Free.
- Risk: school holidays -> project pauses -> sync fails (local-first hides it, but login breaks). Move to Pro (about $25/mo) before public launch; do not rely on keep-alive pings. Region: Singapore (nearest VN).
- MAU scale: 50k MAU not binding; DB 500 MB: ~1-2 MB/child/yr with design above -> fine for thousands.

## 6. Security
- RLS on EVERY table, default-deny; write-only-through-RPC for stats. Pgtap test: parent B cannot select/call RPC for parent A's child.
- security definer rules: `set search_path = ''`, schema-qualify all names, ownership check on `auth.uid()` first line, `revoke execute ... from public, anon; grant to authenticated`. Keep function in `public` only if needed; consider private schema + thin wrapper.
- Server validation (RPC + CHECK): batch payload <= 64 KB, <= 300 fact entries, `a` <= 500, `ms/a` between 0 and 60000, `c<=a`, box 1-5, xp/coin delta caps per batch, fact_key regex. No leaderboard in MVP -> cheat resistance only needs sanity, not anti-fraud.
- Rate limit: PostgREST has none per user. In RPC reject if > N batches/min (count recent `sync_batches`); Auth has dashboard limits for OTP/email. Turnstile/captcha on OTP send [F recommends for anon; same logic applies].
- No PII in logs: never log email/nickname in console, Sentry (scrub), or analytics; Supabase retains 1 day logs. Use child uuid only.
- Nickname free text is an abuse + PII vector -> preset list or strict regex + profanity filter (vi/en).
- Account deletion + export endpoints = legal requirement (Decree 13 data-subject rights) [K].

## Final ranked call
1. Parent account (email OTP code + Google) + child_profiles rows; guest local-only.
2. supabase-js + idb outbox + single idempotent `sync_batch` RPC (additive counters, LWW settings). No sync library.
3. Session-level append-only `sync_batches`, not per-attempt log.
4. Pro plan before launch; custom SMTP; Singapore region.

## Limits of this research
Only pricing + anon-auth docs fetched live. PKCE default, SMTP limits, key naming, Decree 13/Law 91 details, PowerSync/RxDB/Electric status are from memory, unverified. No benchmark of RPC latency from VN.

## Unresolved questions
1. Does counsel confirm child-7+ dual consent wording and whether DPIA + cross-border dossier apply to a free educational app?
2. Hosting region/offshore transfer acceptable, or must data stay in VN (then Supabase self-host)?
3. Is a teacher/class feature in scope within 6 months (changes RLS to roles)?
4. Need leaderboards/shared rewards (would force anti-cheat + moderation)?
5. Verify supabase-js default flowType and current default-SMTP rate limit.
6. Child PIN: needed at all, or parent-zone gate only (math question gate)?
