# Code standards

## Files and naming
- kebab-case file names that say what the file does (`game-store.ts`, not `utils.ts`).
- Keep code files under 200 lines; split by responsibility when they grow.
- TypeScript strict + `noUncheckedIndexedAccess`. Lint/format with Biome (`npm run lint`).

## Layering
- `src/learning/**` and `src/store/**` are pure logic: no `three`, no DOM imports. They must run under Vitest's node environment.
- `src/core/**` engine (renderer, loop, input, audio); `src/ui/**` DOM overlay; `src/scenes/**`, `src/levels/**` game content; `src/sync/**` Supabase.
- Cosmetics are visual only and never touch learning logic.
- Every drag interaction has a tap-select and a keyboard alternative (WCAG 2.5.7).

## Strings (i18n)
- Each module declares its own namespace: `const ts = defineStrings('bridge', { vi: {...}, en: {...} })`.
- `vi` is the source of truth; a missing `en` key fails typecheck.
- The game name and guide name ("VLM") live only in `src/i18n/common-strings.ts` (plus the static PWA manifest in `vite.config.ts`, keep in sync).

## Ownership by folder
Parallel work is split by folder (see the plan's "Parallel groups"). Levels self-register via `import.meta.glob`; `package.json` is only edited in phase 01 unless agreed otherwise.

## Tests
- Unit tests co-located as `*.test.ts` next to the code; run with `npm test`.
- E2E tests in `tests/e2e/*.spec.ts`; assert state (DOM, store) rather than pixels.
- A test must protect real behavior or a credible regression; no tests for trivia.

## Env and secrets
- Every `.env*` file is git-ignored except `.env.example`. Only the Supabase publishable key goes in client env.
