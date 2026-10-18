# Phase 10: Polish, accessibility, performance, full e2e, deploy

## Context links
- [plan.md](./plan.md) · [research 01 §3-§6](research/researcher-01-threejs-game-architecture-report.md) · [research 02 §5 ops](research/researcher-02-supabase-auth-sync-report.md)
- Depends on: 05, 06, 07, 09. Serial (G4). **Safety-critical (CI, release, deploy, prod auth config): full suites.**

## Overview
- Date: 2026-10-18
- Description: Accessibility and reduced-motion pass, real-device perf pass, bundle/precache budget, full e2e matrix incl. offline PWA, kid playtest, privacy page, production Supabase setup, CI extension, static deploy on Vercel, project docs.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed

## Key Insights
- Vercel (confirmed): Git integration gives preview deploys per branch/PR and prod on `main`; `vercel.json` carries SPA fallback + headers. `sw.js` and `manifest.webmanifest` must be `Cache-Control: no-cache` or PWA updates stall; hashed `/assets/*` immutable.
- Supabase stays on Free (confirmed): pause after 7 days idle mitigated by 08 keep-alive + offline-first client; no backups accepted (plan Q6).
- Legal copy is a draft for counsel; launch to public waits for counsel, closed playtest does not.

## Requirements
- A11y: every interaction reachable by keyboard; tap targets >= 56 px; aria-live feedback; correctness never by colour alone; focus visible; `prefers-reduced-motion` + in-game toggle honoured in all scenes; contrast AA for text.
- Perf: each level >= 55 fps avg on iPad 9th gen + Windows Core i5; initial JS <= 300 KB gzip; precache <= 1.5 MB; first load < 3 s on throttled 4G (Lighthouse mobile).
- E2E matrix (desktop-chromium + mobile-pixel; webkit smoke): boot, hub, 3 levels, account specs, offline reload after install (SW), language switch, 10x hub<->level leak check.
- Production: user-created Supabase Free project (Singapore), migrations pushed, Google OAuth prod client, custom SMTP (confirm + reset emails; default SMTP too rate-limited), redirect URLs incl. Vercel preview pattern, auth rate limits, optional Turnstile on sign-up. URL + publishable key supplied by user as Vercel env vars.
- Deploy: CI on PR (lint, typecheck, unit, `db:test`, e2e); Vercel Git integration deploys previews per branch and prod from `main`.

## Architecture
```
.github/workflows/ci.yml          extend: supabase start + db:test + integration + e2e
vercel.json                       rewrites: all non-file paths -> /index.html; headers: /sw.js + /manifest.webmanifest no-cache, /assets/* `public, max-age=31536000, immutable`, global CSP (script-src 'self'; connect-src 'self' https://<project>.supabase.co; img-src 'self' data:; ...), X-Content-Type-Options, Referrer-Policy, Permissions-Policy
public/privacy-vi.html  public/privacy-en.html   draft policy + data deletion/export instructions
tests/e2e/pwa-offline.spec.ts  tests/e2e/scene-memory-leak.spec.ts  tests/e2e/keyboard-only-playthrough.spec.ts
docs/system-architecture.md  docs/development-roadmap.md  docs/project-changelog.md  docs/deployment-guide.md
```

## Related code files
Create: files above. Modify: any `src/**` for fixes found (serial phase, no ownership conflicts); `README.md`; `docs/code-standards.md`. Delete: none.

## Implementation Steps
1. A11y audit (keyboard-only playthrough spec, axe on DOM overlay via `@axe-core/playwright` (installed in 01)) -> fixes.
2. Device perf pass on all scenes; tune tiers; record in `reports/perf-spike-report.md`.
3. Bundle analysis (`vite build` report), trim imports (`three` subpath imports), verify `__game` and `bench` absent from `dist/`.
4. Playtest with 3-5 kids aged 7-9 (Bridge + Field without adult help); log issues; fix top items.
5. Privacy pages (vi/en) + consent policy version bump if text changes; send to counsel.
6. Supabase prod (user-created Free project): `supabase link`, `db push`, set secrets, deploy `delete-account`, auth config, SMTP, Google client.
7. CI workflow; Vercel project linked to repo (framework Vite, output `dist`), env vars per environment (`VITE_ENABLE_CLOUD`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`), `vercel.json`; confirm preview URL works for a branch.
8. Docs via doc-writer: architecture, roadmap (post-MVP list), changelog, deployment guide (incl. rollback steps).
9. Release checklist run on prod URL: install PWA on iPad (Add to Home Screen) + Windows Edge/Chrome, offline play, sign-up/sign-in (password + Google), sync between two devices.

## Todo list
- [ ] a11y audit + fixes + keyboard e2e
- [ ] device perf pass
- [ ] bundle/precache budget + debug code absent
- [ ] kid playtest + fixes
- [ ] privacy pages -> counsel
- [ ] Supabase prod setup
- [ ] CI workflow + Vercel project + vercel.json
- [ ] docs
- [ ] prod release checklist

## Success Criteria
- Full CI green on `main`; deploy workflow publishes; prod URL passes release checklist on real iPad 9th gen + Windows Core i5.
- Lighthouse mobile: PWA installable, perf >= 80, a11y >= 95.
- >= 3 of 5 kids finish Bridge + Field unaided; observed blockers logged.
- `grep -r "__game\|perf-bench" dist/` returns nothing.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Counsel requires changes (consent, data region) | M | H | launch behind closed playtest; consent policy versioned so re-consent possible |
| Google OAuth consent screen verification delay | M | M | email/password works independently; submit early |
| CSP blocks supabase or fonts | M | M | verify CSP on a Vercel preview deploy (console errors) before prod |
| WebKit e2e flaky with WebGL | M | L | webkit = smoke only; real iPhone in checklist |
Rollback: Vercel "Instant Rollback" / promote previous deployment; cloud features off via `VITE_ENABLE_CLOUD` rebuild; DB forward-only fix migrations.

## Security Considerations
- Secrets only in GitHub/Vercel/Supabase secret stores; service_role only in Edge Function.
- CSP + security headers; no third-party analytics/ads SDKs.
- Data export + deletion verified on prod with a test parent.

## Next steps
- Post-MVP backlog (plan.md): City, Tower, QR pairing, class codes, tables 6-9, parent dashboard, recorded voice packs.
