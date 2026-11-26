# Vercel Node function for POST /api/english-pack

Date 2026-11-26. Skill preflight: tkm:help run (returned generic router, no research skill needed); fell back to WebFetch. Budget was 5 tool calls, so only 3 doc pages fetched. Claims marked [VERIFIED] come from fetched docs; [MEMORY] from prior knowledge, NOT re-checked this run.

## Verdict (ranked)

1. **A. Zero-config `api/english-pack.mjs` inside the deploy folder, same command, no `--prebuilt`.** Simplest, one new file. Needs a 2-minute curl check (see Gotchas) that the raw source is not served.
2. **B. Build Output API v3 + `--prebuilt`.** Fallback if A leaks source or the project preset breaks. More moving parts, vercel.json no longer read.
3. C. Keep data out of function source (Blob/private store). Not asked, YAGNI unless A and B both fail.

## Q1. Zero-config detection (approach A)

- [VERIFIED] Vercel detects framework and applies defaults, overridable by project settings or vercel.json. https://vercel.com/docs/project-configuration
- [VERIFIED] Function name rules (Node): max 128 chars incl. extension, no spaces. https://vercel.com/docs/functions/limitations
- [MEMORY] Any file under `api/` in the deployed root is built by `@vercel/node` regardless of framework preset (Vite, Other). URL = path without extension: `api/english-pack.mjs` -> `/api/english-pack`. `.ts` also works (compiled by Vercel); `.mjs` avoids any TS/bundler concern and needs no package.json.
- Handler (Node, web-standard style, [MEMORY]): `export function POST(request) { ... return Response.json(...) }` or classic `export default (req, res) => ...`. Pick one; web style gives automatic 405 for other methods.
- **Preset risk.** `vercel deploy <dir>` uploads `<dir>` as project root. If dashboard preset is Vite with build command `vite build` / output `dist`, the remote build would run in a folder with no sources and fail. Today's flow works, so the project is almost certainly "Other" with empty build command. Do not change presets. Check once in Settings > Build and Deployment (not verifiable from here).
- **Source-served risk.** With "Other" and no build, the root is static. [MEMORY, unverified] `api/` files are claimed by the function builder and not exposed at `/api/english-pack.mjs`, but I found no doc page confirming. Because the data and passphrase gate live in that source, a leak = whole pack public. Mitigation: after deploy, `curl -i https://<domain>/api/english-pack.mjs` and `/api/english-pack`(GET) must NOT return source/data. If source returns, switch to B (functions dir is never in `static`).
- Also check: the SPA catch-all must not return index.html for `/api/*` (Q4).

## Q2. Build Output API v3 (approach B)

Doc index fetched (thin, details on sub-pages not fetched): https://vercel.com/docs/build-output-api . Sub-pages: /docs/build-output-api/configuration, /primitives, /features. Examples: https://github.com/vercel/examples/tree/main/build-output-api

[MEMORY] minimal layout, placed so that `<deploy-root>/.vercel/output` exists:

```
.vercel/output/
  config.json
  static/                         <- copy of dist (index.html, assets/...)
  functions/api/english-pack.func/
    .vc-config.json
    index.mjs                     <- handler + inlined JSON
```
config.json:
```json
{ "version": 3,
  "routes": [
    { "src": "/(.*)", "headers": { "X-Content-Type-Options": "nosniff" }, "continue": true },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ] }
```
.vc-config.json:
```json
{ "runtime": "nodejs22.x", "handler": "index.mjs", "launcherType": "Nodejs", "shouldAddHelpers": true }
```
- `{"handle":"filesystem"}` makes static files AND functions (path `/api/english-pack`) win over the later catch-all. Rewrites = routes with `src`/`dest`; headers = routes with `headers` + `"continue": true`. Order matters, first match wins.
- Run: `npx vercel@65.9.0 deploy --prebuilt --prod --yes` from a dir containing `.vercel/output` and a linked `.vercel/project.json` (or env `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`). Our current `deploy <path>` form with `--prebuilt`: unverified whether CLI looks for `<path>/.vercel/output`; safest is `cd` into the folder.

Gotchas (B):
- vercel.json is NOT read with `--prebuilt`; all headers/rewrites from public/vercel.json must be hand-translated to config.json routes (duplication, drift risk, violates DRY).
- Needs project link; `.preview/deploy` currently has none.
- Runtime string must be a supported Node version (`nodejs20.x`/`22.x`); stale versions get deprecated.
- Native deps built locally target your arch (docs warning, https://vercel.com/docs/build-output-api). Not relevant here, no deps.
- Handler file must exist at `handler` path; config typo gives deploy-time error.

## Q3. Hobby limits

All [VERIFIED] https://vercel.com/docs/functions/limitations (page dated 2026-08-24, Fluid compute assumed on by default):
- Request body: 4.5 MB default (20 MiB beta needs Pro 4 GB memory; irrelevant, our request is a tiny passphrase POST).
- Response body: 4.5 MB, except streamed responses. A few MB total split per request is OK; keep each response well under 4.5 MB (base64 images inflate 33%).
- Function bundle: 250 MB uncompressed. Inlined few MB is trivial. Docs warn large JSON/assets traced into function count toward size; fine here.
- Duration: Hobby 300 s default and max. Memory 2 GB / 1 vCPU.
- Env vars: normal project env vars are available at runtime via `process.env`; only AWS_* internals are hidden under Fluid. Set with `vercel env add ENGLISH_PACK_PASSPHRASE production` (scope to Production; redeploy after change). [MEMORY] total env size limit 64 KB; a passphrase is far below.
- Hobby is non-commercial use only [MEMORY]; fine for a personal game.

## Q4. Rewrite catch-all vs /api

- [MEMORY] vercel.json `rewrites` run after the filesystem check, so an existing function at `/api/english-pack` normally wins over `/(.*) -> /index.html`. Do not rely on it: legacy `routes`, a changed order, or a 404 under `/api/*` would silently return index.html with 200 (confusing errors, bad for POST).
- **Yes, exclude api.** Cheap and explicit:
```json
{ "rewrites": [ { "source": "/((?!api/).*)", "destination": "/index.html" } ] }
```
- Keep `headers` as is; if the headers source is `/(.*)`, they also apply to the function response (fine). Add `Cache-Control: no-store` in the function response so the gated JSON is not CDN-cached.
- Docs for rewrites/functions config: https://vercel.com/docs/project-configuration/vercel-json (linked from fetched page, not read).

## Recommended layout and command (approach A)

```
.preview/deploy/
  index.html, assets/...          (vite dist)
  vercel.json                     (from public/, rewrite source changed as above)
  api/english-pack.mjs            (generated at deploy time; handler + inlined pack)
```
Handler skeleton (generation step writes JSON in as a literal, never `fs.readFile`):
```js
import { timingSafeEqual } from 'node:crypto';
const PACK = /* inlined JSON literal */ {};
export async function POST(request) {
  const { pass } = await request.json().catch(() => ({}));
  const want = Buffer.from(process.env.ENGLISH_PACK_PASSPHRASE ?? '');
  const got = Buffer.from(String(pass ?? ''));
  const ok = want.length > 0 && want.length === got.length && timingSafeEqual(want, got);
  if (!ok) return new Response('forbidden', { status: 403 });
  return Response.json(PACK, { headers: { 'Cache-Control': 'no-store' } });
}
```
Command unchanged: `npx vercel@65.9.0 deploy .preview/deploy --prod --yes --project mathgame`

One-time setup: `npx vercel@65.9.0 env add ENGLISH_PACK_PASSPHRASE production --project mathgame` (from linked dir, or use dashboard).

Post-deploy checks (all required before trusting A):
1. `curl -i -X POST https://<domain>/api/english-pack -d '{"pass":"wrong"}'` -> 403.
2. correct pass -> 200 JSON.
3. `curl -i https://<domain>/api/english-pack.mjs` and GET `/api/english-pack` -> not source, not index.html, no data.
4. `curl -I https://<domain>/some/spa/route` -> still index.html.
5. Deploy log lists the function (Functions tab).
If 3 fails -> approach B.

Security notes: inlined pack is only gated, not encrypted; anyone with the passphrase or deploy access reads it. Passphrase over POST body (not query string) avoids URL logging. No rate limit on Hobby by default; consider Vercel Firewall rule if brute force matters [MEMORY].

## Confidence and limits
- Verified: Q3 limits only. Q1 detection, Q2 layout, Q4 rewrite order are from memory; these are well-known behaviors but the checks above are the real test.
- Only 3 sources (all vercel.com official, high credibility); key claims Q1/Q2/Q4 do not yet have 3 independent references.
- Adoption risk: zero-config Node functions are mature, low breaking-change risk. BOA v3 is stable, framework-author oriented, lower community coverage for hand-built use.

## Unresolved questions
1. Is `api/*.mjs` raw source reachable as a static file under the "Other" preset when deploying a dir? (empirical curl needed)
2. What is the current dashboard preset/build command/output dir for `mathgame`? Not readable from here.
3. Does `vercel deploy <path> --prebuilt` read `<path>/.vercel/output` or only cwd? Doc sub-page not fetched.
4. Exact rewrite-vs-filesystem order text in vercel.json docs (not fetched).
5. Is Fluid compute on for this existing project (affects only duration/memory defaults, not our need)?
