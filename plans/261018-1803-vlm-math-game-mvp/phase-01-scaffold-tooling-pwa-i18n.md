# Phase 01: Scaffold, tooling, PWA, fonts, i18n

## Context links
- [plan.md](./plan.md) · [research 01 §1, §4, §5, §6](research/researcher-01-threejs-game-architecture-report.md)
- Brainstorm decisions: [brainstorm §Quyết định](../reports/brainstorm-261018-math-game-continuation.md)

## Overview
- Date: 2026-10-18
- Description: git init, Vite 8 + TS 7 project, Biome lint/format, Vitest, Playwright, vite-plugin-pwa manifest, self-hosted fonts, tiny namespaced i18n, base CI. Installs every dependency the MVP needs so later parallel phases never edit `package.json`.
- Priority: P1 (blocks all)
- Implementation status: done (569c3fe)
- Review status: not reviewed

## Key Insights
- `three` ships breaking changes per release: pin exact, `@types/three` matching minor.
- TS 7 is the native (Go) compiler: typescript-eslint support may lag -> use **Biome** for lint+format (no dependency on the TS compiler API). Typecheck with `tsc --noEmit`.
- Vite 8 needs Node `^20.19 || >=22.12`; pin Node 24 LTS in `.nvmrc` + `engines`.
- Fonts must be self-hosted (offline PWA). Fontsource per-subset CSS: import only `vietnamese` + `latin`, weights in use (Baloo 2: 600/800; Nunito: 400/700).
- i18n by namespace (`defineStrings(ns, {vi, en})`) lets later phases add strings in their own files -> zero locale-file collisions.

## Requirements
- Functional: `npm run dev` shows a page titled from i18n (vi default) with Vietnamese diacritics rendered in Baloo 2; language toggle helper sets `<html lang>`.
- Functional: `npm run build && npm run preview` serves an installable PWA manifest (static name "Hành Trình Đá Số", short_name "Đá Số" — manifest is the one place the name is duplicated, keep in sync with `common-strings.ts`; lang vi, icons 192/512/maskable).
- Non-functional: all scripts exist up front: `dev`, `build`, `build:test` (`vite build --mode test`), `preview`, `typecheck`, `lint`, `format`, `test`, `test:e2e`, `db:start`, `db:reset`, `db:test`, `db:types`.

## Architecture
```
learning_game/
  index.html            root entry (lang="vi", #app canvas host, #ui overlay root)
  src/main.ts           boot stub: fonts, i18n init, html lang (04 replaces body with app/boot.ts call)
  src/i18n/i18n.ts      t(key, params), defineStrings(ns, table), setLanguage, detectLanguage
  src/i18n/common-strings.ts   ns 'common': appName vi "Hành Trình Đá Số" / en "Number Stone Quest", guideName "VLM", language names
  src/styles/fonts.css  fontsource subset imports
  vite.config.ts        VitePWA(generateSW, registerType 'prompt'), test config
```
- i18n: `vi` table is source of truth (`as const`); `en` typed `Record<keyof typeof vi, string>` per namespace so a missing en key fails typecheck. Lookup `ns.key`; missing key -> returns key + console.warn in dev only. Language: stored setting > `navigator.language` startsWith 'vi' > 'vi'.
- PWA: generateSW, `registerType: 'prompt'`, `globPatterns ['**/*.{js,css,html,woff2,png,svg}']`, `navigateFallback: 'index.html'`, `display: 'fullscreen'`, `orientation: 'landscape'` preference; portrait remains playable (no hard lock). SW registration UI is phase 04.

## Related code files
Create:
- `.nvmrc`, `package.json`, `package-lock.json`, `tsconfig.json`, `biome.json`, `vite.config.ts`, `playwright.config.ts`, `index.html`
- `src/main.ts`, `src/vite-env.d.ts`, `src/i18n/i18n.ts`, `src/i18n/i18n.test.ts`, `src/i18n/common-strings.ts`, `src/styles/fonts.css`, `src/styles/base-reset.css`
- `public/icons/icon.svg` (simple low-poly mark, hand-written SVG) + generated `pwa-192.png`, `pwa-512.png`, `maskable-512.png`, `apple-touch-icon.png` (via `@vite-pwa/assets-generator`)
- `tests/e2e/boot-smoke.spec.ts`
- `.github/workflows/ci.yml` (Node 24: `npm ci`, lint, typecheck, test, build)
- `.env.example` (`VITE_ENABLE_CLOUD=`, `VITE_SUPABASE_URL=`, `VITE_SUPABASE_PUBLISHABLE_KEY=`)
- `README.md`, `docs/code-standards.md` (file size, naming, layering rule, ownership-by-folder, test placement `*.test.ts` co-located, e2e in `tests/e2e`)
Modify: `.gitignore` (keep tkm block; add `node_modules`, `dist`, `dev-dist`, `.env*` except `.env.example`, `playwright-report`, `test-results`, `supabase/.temp`, `supabase/.branches`).
Delete: none.

## Implementation Steps
1. `git init -b main`; first commit = `.gitignore` + existing `.claude` per user preference (check `.gitignore` excludes kit-managed paths).
2. `npm view <pkg> version` for every pinned dep; if a pinned version disappeared, take latest patch of same minor and note it in README.
3. Install exact (`--save-exact`): runtime `three@0.186.1`, `@supabase/supabase-js@2.118.0`, `idb` (latest 8.x), `@fontsource/baloo-2`, `@fontsource/nunito`; dev `vite@8.3.4`, `vite-plugin-pwa@2.0.0`, `typescript@7.0.2`, `@types/three@0.186.x`, `vitest@5.0.5`, `fake-indexeddb`, `@playwright/test@1.64.1`, `@axe-core/playwright`, `@biomejs/biome`, `supabase` (CLI), `@vite-pwa/assets-generator`.
4. `tsconfig.json`: `strict`, `noUncheckedIndexedAccess`, `moduleResolution: bundler`, `types: ["vite/client", "vite-plugin-pwa/client"]`, path alias none (KISS).
5. Write `i18n.ts` (<120 lines) + tests: lookup, params `{n}` interpolation, fallback, missing-key behavior, language detection, `<html lang>` update (tested via injected document-like object; no DOM env needed).
6. `index.html`: `<div id="app">`, `<div id="ui" aria-live region container>`, noscript message vi/en, `<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">`, theme-color.
7. `vite.config.ts`: PWA plugin config above; `test: { environment: 'node', include: ['src/**/*.test.ts'] }`.
8. `playwright.config.ts`: projects `desktop-chromium` and `mobile-pixel` (hasTouch); `webServer` runs `npm run build:test && npm run preview -- --port 4173`; Chromium args `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`.
9. Boot smoke e2e: page loads, title is "Hành Trình Đá Số", `html[lang=vi]`, manifest link present.
10. CI workflow; verify locally: `npm run lint && npm run typecheck && npm test && npm run build`.

## Todo list
- [x] git init on main, first commit
- [x] verify + pin versions, install all deps
- [x] tsconfig, biome, vite, vitest, playwright configs
- [x] i18n module + tests
- [x] fonts + base CSS + index.html
- [x] PWA manifest + icons
- [x] boot smoke e2e
- [x] CI workflow, README, docs/code-standards.md, .env.example

## Success Criteria
- `npm run lint`, `typecheck`, `test`, `build`, `test:e2e` all exit 0.
- Lighthouse (Chrome devtools) on `preview`: "installable" passes; offline reload of `preview` works after first visit.
- Network tab on reload shows zero requests to fonts.googleapis.com / gstatic.
- Diacritic test string "Chia đều cho các bạn thỏ · Ầ Ẫ Ợ Ữ Ỵ" renders in Baloo 2 (screenshot check by eye).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Pinned version unpublished / peer conflict (vite-plugin-pwa 2.0 vs vite 8.3) | L | M | `npm view ... peerDependencies` before install; fallback latest compatible patch |
| TS 7 tooling gaps (Vitest/Vite type plugins) | M | M | Vite/Vitest transpile without tsc; only `tsc --noEmit` depends on TS 7; fallback pin TS 6.x if blocking |
| SwiftShader WebGL missing in CI | M | M | ANGLE swiftshader flags; e2e asserts state not pixels |
Rollback: delete repo dir contents except `.claude/`, `plans/` (nothing depends on it yet).

## Security Considerations
- `.env*` ignored; only `.env.example` committed. No secrets in CI yet.
- Supabase publishable key is public by design; service_role key never enters the repo or client env.

## Next steps
- Unblocks 02, 03, 08 (run in parallel).
