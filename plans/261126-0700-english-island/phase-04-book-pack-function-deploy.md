# Phase 4: book pack function and deploy

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 3B](phase-03b-speech-and-pack-client.md)
- Research: [researcher-02-vercel-function-report.md](research/researcher-02-vercel-function-report.md)
- Docs: `docs/deployment-guide.md`, `public/vercel.json`, `vite.config.ts`

## Overview
- Date: 2026-11-26
- Description: build the pack from the local `English /` folder, emit a passphrase-gated
  Vercel function into the deploy folder, adjust rewrites and SW, verify on a preview.
- Priority: P2
- Implementation status: pending
- Review status: n/a (reviewer-owned)
- Owner: reviewer only (Muses never open `English /`)
- Effort: 1d

## Key Insights
- Primary: zero-config `api/english-pack.mjs` emitted into `.preview/deploy/`; same deploy
  command, no `--prebuilt`.
- Fallback: Build Output API v3 with `--prebuilt` (layout in research 02). `vercel.json` is
  ignored there, so headers and rewrites move into `config.json`.
- Hobby limits: 4.5 MB per request and per response, 250 MB bundle, 300 s.
- The pack is inlined as a JSON literal; base64 images add ~33%, so images are split per stage.

## Requirements
- Functional
  - Handler `export function POST(request)`; compares the passphrase with `timingSafeEqual`
    against `process.env.ENGLISH_PACK_PASSPHRASE`; 401/403 after a delay on mismatch; 503 when
    the env var is missing; every response `no-store`.
  - Parts per contract: `items`, `images` per stage; each response < 4.5 MB.
  - `public/vercel.json` rewrite source becomes `/((?!api/).*)`.
  - `vite.config.ts`: `navigateFallbackDenylist: [/^\/api\//]`.
- Non-functional: no body logging; no pack string in any static file.

## Architecture
- `English /pack-src/` → `build-pack.mjs` → `English /pack.json` (local only)
  → `emit-pack-function.mjs .preview/deploy` → `api/english-pack.mjs` (handler + literal)
  → `vercel deploy .preview/deploy` → function at `/api/english-pack`.
- `pack-handler.ts` is committed and holds our code only, never pack data.

## Related code files
- Create
  - `tools/english-pack/pack-handler.ts` (new) + test (new)
  - `tools/english-pack/build-pack.mjs` (new)
  - `tools/english-pack/emit-pack-function.mjs` (new): fails if a static file holds pack strings
  - `tools/english-pack/check-overlap.mjs` (new): fails if a repo sentence equals a pack sentence
- Modify: `public/vercel.json`, `vite.config.ts`, deploy command (in `docs/deployment-guide.md`, Phase 5)
- Never commit: `English /**`, generated `api/english-pack.mjs`

## Implementation Steps
1. **Mandatory first:** preview-deploy a dummy pack, then check with curl (bypass header):
   - wrong passphrase → 401/403;
   - right passphrase → 200;
   - `GET /api/english-pack.mjs` does not leak source;
   - SPA routes still serve `index.html`;
   - the function appears in the deploy log.
   Also confirm the `mathgame` framework preset is "Other" with no build command.
   Any failure → switch to the Build Output API fallback.
2. Write `pack-handler.ts` (timing-safe compare, delay, `no-store`, no logging); unit-test it.
3. Write `build-pack.mjs` and `check-overlap.mjs`; run overlap against Phase 2A content.
4. Write `emit-pack-function.mjs` with the static-leak scan.
5. Update `public/vercel.json` and `vite.config.ts`.
6. `ENGLISH_PACK_PASSPHRASE` (Production scope): the author sets it on Vercel themself (decided
   2026-11-27, Q10). Book picture crops ARE included in the pack (Q10), compressed WebP, split per
   stage so each response stays < 4.5 MB.
7. Deploy command: `npx tsc --noEmit && npx vite build --outDir .preview/deploy --emptyOutDir
   && node tools/english-pack/check-overlap.mjs && node tools/english-pack/emit-pack-function.mjs
   .preview/deploy && npx vercel@65.9.0 deploy .preview/deploy ...` (flags unchanged).

## Todo list
- [ ] Dummy-pack preview + 5 curl checks + preset check
- [ ] `pack-handler.ts` + test
- [ ] `build-pack.mjs`, `check-overlap.mjs`
- [ ] `emit-pack-function.mjs` with leak scan
- [ ] `vercel.json` rewrite, SW denylist
- [ ] Env var set
- [ ] Real deploy, curl checks repeated

## Success Criteria
- curl: 401/403 without or with a wrong passphrase, 200 with the right one.
- No static URL exposes the pack; SW precache has no `api/`; pack works offline after unlock.

## Risk Assessment
- Source served as a static file under approach A. Mitigation: step 1 curl; fallback B.
- Response > 4.5 MB. Mitigation: per-stage image parts, size assert in the emitter.
- Brute force (no rate limit on Hobby). Mitigation: failure delay; optional firewall rule.

## Security Considerations
- Pack is gated, not encrypted: anyone with the passphrase or deploy access can read it.
- Passphrase only in env and POST body; never in the repo, URL or logs.

## Next steps
- Phase 5 documents the pack step and env var.
