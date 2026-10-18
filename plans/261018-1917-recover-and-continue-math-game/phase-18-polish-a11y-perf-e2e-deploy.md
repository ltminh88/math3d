# Phase 18: Polish, accessibility, performance, full e2e, PWA, deploy to Vercel (mathgame.vercel.app)

## Context links
- [plan.md](plan.md) · **Spec: [old phase 10](../261018-1803-vlm-math-game-mvp/phase-10-polish-a11y-perf-e2e-deploy.md)** (a11y, perf, e2e matrix, prod Supabase, CI, headers, docs, release checklist — valid unless changed below)
- Depends on: 14, 15, 17, 19. Serial (G8), may touch any file. **Safety-critical (CI, release, deploy, prod auth): full suites.**

## Overview
- Date: 2026-10-18
- Description: Old 10 with deltas: deploy "math3d" to Vercel at the NEW domain `mathgame.vercel.app` (decided 2026-10-18); math.aigame3d.com is left as is (see plan Q1 for the old-domain options). Old-site progress moves only via save code (12). The PWA service worker is introduced for the first time.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed

## Deltas vs old phase 10
- Hosting: Vercel (old 10 spec): Git integration, preview per branch/PR, prod on `main`; `vercel.json` SPA fallback rewrite (non-file paths -> `/index.html`), `/sw.js` + `/manifest.webmanifest` `Cache-Control: no-cache`, `/assets/*` immutable, CSP + security headers. Project name `mathgame` -> check `mathgame.vercel.app` is free when creating the project; if taken try `math3d`, then `math3d-game` and update 16 `site_url`/redirects + docs. No DNS work.
- Progress carry-over: origin differs, so localStorage does NOT transfer. Players use "Nhập mã lưu" (12). Getting a code out of the old site needs a change on math.aigame3d.com -> only if the user still controls it (plan Q1: (a) redeploy recovered legacy build `recovered/original/` + export-code page there, ~3h extra, not in total; (b) redirect old domain to new and accept progress loss; (c) do nothing).
- PWA: SW registration + update prompt UI (old 04 never built) added here: `registerType: 'prompt'`, toast in recovered style "Có bản mới – tải lại?". `sw.js`/manifest no-cache headers.
- Launch checklist adds: (1) on preview, import a save code built from a real live save -> identical HUD (12 e2e already; repeat on real iPad Safari + Windows Chrome/Edge); (2) on prod, export -> clear site data -> import -> identical; (3) PWA installs with name "math3d".
- A11y: recovered UI audited too (dialogs focus trap/return, quiz keys 1-3 announced, joystick has keyboard alternative already). Fix only clear AA violations; visual changes to recovered screens need author OK.
- Perf targets as old 10, measured on recovered world + Field/Forest (lowPower path on iPad = mobile-pixel baseline class).
- Shop (19) included in a11y/perf passes; shop panel keyboard + screen-reader reachable.
- Bundle: three r186 subpath imports; level modules lazy-loaded; `__game` and dev probe absent from `dist/`.
- CSP: no Google Fonts (self-hosted since 09); `connect-src 'self' https://<project>.supabase.co`; WebMCP needs no network.
- Playtest: kids 7-9 play Bridge -> Field -> Forest unaided (old 10 step 4).
- Docs: `docs/system-architecture.md` (recovered module map), `docs/development-roadmap.md`, `docs/project-changelog.md`, `docs/deployment-guide.md` (Vercel project, domain, rollback, SW kill-switch, save-code support note), update `docs/code-standards.md` (names math3d/VLM, `src/world`, `src/levels`, `src/shop`).

## Key Insights
- Old site has no SW; first deploy installs one -> a bad SW is sticky. Ship SW with `skipWaiting` off + prompt, and keep a kill-switch `sw.js` (self-unregister) ready in the deployment guide.

## Requirements
- As old 10 + deltas.

## Architecture
- As old 10 (`vercel.json`, privacy pages, e2e specs `pwa-offline`, `scene-memory-leak`, `keyboard-only-playthrough`) + `src/ui/sw-update-prompt.ts`, `tests/e2e/preview-save-code-smoke.spec.ts` (preview URL: import code from real live save -> HUD equal).

## Related code files
- Create: above + docs. Modify: any file for fixes, `vite.config.ts`, `.github/workflows/ci.yml`, `docs/code-standards.md`, `README.md`. Delete: none.

## Implementation Steps
1. A11y audit + fixes (old 10 step 1).
2. Device perf pass (iPad 9th gen, Windows i5).
3. Bundle/precache budget; SW + update prompt; kill-switch prepared.
4. Kid playtest + top fixes.
5. Privacy pages -> counsel.
6. Supabase prod (old 10 step 6 + 16 deltas).
7. CI full matrix (lint, typecheck, unit, parity, db:test, integration, e2e); Vercel project (check `mathgame.vercel.app` availability, fallback name) + env vars + `vercel.json`; preview deploy.
8. Launch rehearsal on preview with real save codes; promote to prod; launch checklist; monitor 48 h. Old domain action per plan Q1 answer.
9. Docs via doc-writer.

## Todo list
- [ ] a11y + fixes
- [ ] perf pass
- [ ] bundle + SW + kill-switch
- [ ] playtest + fixes
- [ ] privacy pages
- [ ] Supabase prod
- [ ] CI + Vercel project (domain check) + vercel.json + preview
- [ ] launch rehearsal + prod promote + checklist
- [ ] docs

## Success Criteria
- Old 10 criteria + real-device check: a live-site save imported by code shows the same XP/coins/bridge on prod; `curl -I https://mathgame.vercel.app/sw.js` shows `no-cache`; deep link reload returns the app (SPA fallback); `grep -r "__game\|fps-overlay\|fonts.googleapis" dist/` empty; Lighthouse PWA installable.

## Scope Contract
- Changed: CI, deploy, prod config, SW, fixes. Safety-critical -> every suite runs in full.
- Skipped: none.

## Risk Assessment
See old 10 table, plus:
| Risk | L | I | Countermove |
|---|---|---|---|
| Players lose old-site progress (new origin) | H | M | save-code import; old-domain export per Q1 (a); announce in game + to known players |
| `mathgame.vercel.app` taken | M | L | fallback project name; update 16 redirects before prod auth |
| Sticky broken SW | L | H | prompt-based update + kill-switch sw.js |
Rollback: Vercel instant rollback to previous deployment; old site untouched throughout; `VITE_ENABLE_CLOUD` off.

## Security Considerations
- As old 10 (secrets in stores only, CSP + headers, no third-party SDKs, export/delete verified on prod).

## Next steps
- Post-MVP: City "Thành Phố Con Số", Tower "Tháp Toán Học", tables 6-9 deeper practice, parent dashboard.
