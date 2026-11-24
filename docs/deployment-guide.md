# Deployment guide — math3d (Vương Quốc Cửu Chương)

Live site: https://math3d-game.vercel.app (Vercel project `mathgame`).
Preview deploys only from pull requests — never `--prod`. The reviewer promotes
a preview to production after review.

## Preview deploys

The deploy helper is `~/workspace/custom-connectors/custom.vercel/bin/vercel.py`
(connector `custom.vercel`; the token stays in the Secure Vault, never in a file):

```sh
npx vite build --outDir preview/deploy --emptyOutDir
python3 ~/workspace/custom-connectors/custom.vercel/bin/vercel.py deploy --dir preview/deploy --project mathgame
python3 ~/workspace/custom-connectors/custom.vercel/bin/vercel.py get-deployment --id <deployment-id>
```

Wait for the deployment to reach READY, then put its URL in the pull request.
Delete the local `preview/` directory afterwards (it makes `biome check .` fail on
minified files). Do not use `npx vercel` directly (no token in the shell) and never
ask for the author's Vercel login session — it carries production rights.

Preview deployments sit behind Vercel Deployment Protection (a login wall): an
unauthenticated `curl` returns 302. Use the protection-bypass header from the
project settings (or the reviewer's session) when checking headers with `curl`.

## Headers and SPA fallback (`public/vercel.json`)

`vercel.json` lives in `public/` so the build copies it to the root of the deployed
folder (`dist/vercel.json`). It does three things:

- `/sw.js` and `/manifest.webmanifest` — `Cache-Control: no-cache`, so the browser
  always revalidates the worker and the manifest and a new build is noticed.
- `/assets/*` — `Cache-Control: public, max-age=31536000, immutable`. Vite hashes
  every asset filename, so a changed file gets a new name and the old one stays
  valid forever.
- SPA fallback — every path that is not a real file (`sw.js`, the manifest,
  `/assets/*`, `/icons/*`, `favicon.svg`) rewrites to `/index.html`, so a deep
  link reload returns the app instead of a 404. Static files always win over the
  rewrite (Vercel serves filesystem matches first).

Check on a preview deploy:

```sh
curl -I <preview-url>/sw.js                 # Cache-Control: no-cache
curl -I <preview-url>/manifest.webmanifest  # Cache-Control: no-cache
curl -I <preview-url>/assets/index-<hash>.js # Cache-Control: ... immutable
curl -I <preview-url>/khong-co-trang-nay    # 200, content-type: text/html
```

## Service worker and the update prompt

The app ships a service worker (VitePWA, `generateSW`, `registerType: 'prompt'`;
see `vite.config.ts`). It precaches the app shell — about 1.6 MB (84 entries,
measured at the phase-18 build) — so the game loads with the network off after
one online visit. Registration is in `src/ui/sw-update-prompt.ts`:

- `skipWaiting` is OFF on purpose: a new build never swaps itself in under a
  playing child. When the waiting worker reports a new version, a game-style
  toast appears — "Có bản mới – tải lại?" — with two big (56 px) buttons:
  **Tải lại** activates the new worker and reloads; **Để sau** hides the toast
  until the next page load, when the still-waiting worker reports itself again.
  `clientsClaim` is ON in the workbox options (see `vite.config.ts`): without it
  the activated worker never takes control of the open page, so tapping
  **Tải lại** would leave the old build on screen. The claim only happens on
  activation, which only the prompt triggers, so it never swaps a build under
  a playing child.
- Registration happens only on production builds. In dev there is no `sw.js` to
  register, and in test builds (`vite build --mode test`, what e2e uses) it stays
  off so the other e2e specs never run under a worker. The offline e2e spec opts
  in explicitly by loading `/?pwa=1` — see `tests/e2e/pwa-offline.spec.ts`.
- The browser only checks for a new worker on navigation when it has not checked
  in the last 24 h (measured: no check fired in 3 minutes of reloads right after
  an install, headed or headless, while an explicit `registration.update()` found
  the new worker at once). So `registerServiceWorker` also asks explicitly on
  every load (`onRegisteredSW` → `registration.update()`, failures ignored): the
  toast appears on the first load after a deploy instead of a day later. The
  check is one small `no-cache` fetch of `sw.js` per load.
- The update flow is verified by hand with `tools/pwa/manual-update-check.mjs`
  (two local builds served in turn, one persistent browser profile): load the old
  build, build the new one, reload — the toast appears, tapping **Tải lại** shows
  the new build with progress intact. It is a manual script, not part of CI.

## Rollback

Two layers, in order:

1. **Vercel instant rollback** — redeploy the previous good deployment from the
   Vercel dashboard (Deployments → ⋯ → Redeploy) or promote it. This fixes a bad
   app build. It does NOT remove a service worker already installed on a device:
   the old worker keeps serving its precache until the browser notices a new
   `/sw.js`.
2. **Service-worker kill-switch** — if the installed worker itself is bad
   (serves a broken shell, or never updates), deploy `tools/pwa/kill-switch-sw.js`
   AS `/sw.js` (a one-off deployment whose only root file is that script, same
   origin and scope). Every visit installs it; it unregisters itself, deletes
   every cache, and reloads the page once. After that no worker remains, so
   deploy the normal build again to put the good worker back (or leave the game
   worker-less until a fixed build is ready). The kill-switch file must never stay
   deployed and never be added to `public/` — it lives in `tools/` for that reason.

## Save codes and origins

Progress does NOT move across origins: localStorage stays on the old domain.
Players carry progress with **Nhập mã lưu** (save codes, `M3D6`): export on the
old site, import on the new one. A fresh import shows identical XP/coins/bridge
— the preview launch checklist repeats this on a real device before promoting.
