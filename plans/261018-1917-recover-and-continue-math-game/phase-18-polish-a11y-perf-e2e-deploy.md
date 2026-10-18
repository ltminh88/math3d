# Phase 18: Polish, accessibility, performance, full e2e, PWA, deploy (replace live site)

## Context links
- [plan.md](plan.md) · **Spec: [old phase 10](../261018-1803-vlm-math-game-mvp/phase-10-polish-a11y-perf-e2e-deploy.md)** (a11y, perf, e2e matrix, prod Supabase, CI, headers, docs, release checklist — valid unless changed below)
- Depends on: 14, 15, 17. Serial (G8), may touch any file. **Safety-critical (CI, release, deploy, prod auth): full suites.**

## Overview
- Date: 2026-10-18
- Description: Old 10 with deltas: the deploy REPLACES the live math.aigame3d.com, so cutover must keep existing players' localStorage on the same origin, and the PWA service worker is introduced for the first time.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed

## Deltas vs old phase 10
- Hosting: unknown current provider (plan Q1). Same origin `https://math.aigame3d.com` is mandatory — localStorage/idb are per-origin; a new domain would orphan every player's progress. If moving to Vercel: point DNS to Vercel only at cutover; keep old host deployable for DNS rollback.
- PWA: SW registration + update prompt UI (old 04 never built) added here: `registerType: 'prompt'`, toast in recovered style "Có bản mới – tải lại?". `sw.js`/manifest no-cache headers.
- Cutover checklist adds: (1) on staging/preview, load a real exported live save -> identical HUD (12 e2e already, repeat on real iPad Safari + Windows Chrome/Edge); (2) after DNS switch, open prod with a pre-existing live profile on a real device -> progress intact; (3) old keys still present.
- A11y: recovered UI audited too (dialogs focus trap/return, quiz keys 1-3 announced, joystick has keyboard alternative already). Fix only clear AA violations; visual changes to recovered screens need author OK.
- Perf targets as old 10, measured on recovered world + Field/Forest (lowPower path on iPad = mobile-pixel baseline class).
- Bundle: three r186 subpath imports; level modules lazy-loaded; `__game` and dev probe absent from `dist/`.
- CSP: no Google Fonts (self-hosted since 09); `connect-src 'self' https://<project>.supabase.co`; WebMCP needs no network.
- Playtest: kids 7-9 play Bridge -> Field -> Forest unaided (old 10 step 4).
- Docs: `docs/system-architecture.md` (recovered module map), `docs/development-roadmap.md`, `docs/project-changelog.md`, `docs/deployment-guide.md` (cutover + DNS rollback), update `docs/code-standards.md` (Milo/game name, `src/world`, `src/levels`, remove VLM).

## Key Insights
- Old site has no SW; first deploy installs one -> a bad SW is sticky. Ship SW with `skipWaiting` off + prompt, and keep a kill-switch `sw.js` (self-unregister) ready in the deployment guide.

## Requirements
- As old 10 + deltas.

## Architecture
- As old 10 (`vercel.json` or host equivalent, privacy pages, e2e specs `pwa-offline`, `scene-memory-leak`, `keyboard-only-playthrough`) + `src/ui/sw-update-prompt.ts`, `tests/e2e/legacy-origin-cutover.spec.ts` (preview URL smoke with injected live save).

## Related code files
- Create: above + docs. Modify: any file for fixes, `vite.config.ts`, `.github/workflows/ci.yml`, `docs/code-standards.md`, `README.md`. Delete: none.

## Implementation Steps
1. A11y audit + fixes (old 10 step 1).
2. Device perf pass (iPad 9th gen, Windows i5).
3. Bundle/precache budget; SW + update prompt; kill-switch prepared.
4. Kid playtest + top fixes.
5. Privacy pages -> counsel.
6. Supabase prod (old 10 step 6 + 16 deltas).
7. CI full matrix (lint, typecheck, unit, parity, db:test, integration, e2e); hosting project + env vars; preview deploy.
8. Cutover rehearsal on preview with real saves; DNS switch; post-switch checklist; monitor 48 h.
9. Docs via doc-writer.

## Todo list
- [ ] a11y + fixes
- [ ] perf pass
- [ ] bundle + SW + kill-switch
- [ ] playtest + fixes
- [ ] privacy pages
- [ ] Supabase prod
- [ ] CI + hosting + preview
- [ ] cutover rehearsal + DNS switch + checklist
- [ ] docs

## Success Criteria
- Old 10 criteria + real-device check: existing live-site player keeps XP/coins/bridge/language after cutover; `grep -r "__game\|fps-overlay\|fonts.googleapis" dist/` empty; Lighthouse PWA installable.

## Scope Contract
- Changed: CI, deploy, prod config, SW, fixes. Safety-critical -> every suite runs in full.
- Skipped: none.

## Risk Assessment
See old 10 table, plus:
| Risk | L | I | Countermove |
|---|---|---|---|
| Origin change orphans saves | L | H | same domain mandatory; checklist step |
| Sticky broken SW | L | H | prompt-based update + kill-switch sw.js |
| Old host access lost (cannot roll back DNS target) | M | M | resolve plan Q1 before step 8; keep static export of old `recovered/original/` deployable anywhere |
Rollback: DNS back to old host (or deploy `recovered/original/` statically); host instant rollback; `VITE_ENABLE_CLOUD` off.

## Security Considerations
- As old 10 (secrets in stores only, CSP + headers, no third-party SDKs, export/delete verified on prod).

## Next steps
- Post-MVP: City "Thành Phố Con Số", Tower "Tháp Toán Học", tables 6-9 deeper practice, parent dashboard.
