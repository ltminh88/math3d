# Phase 04: Recover audio synth and i18n translator

## Context links
- [plan.md](plan.md) · [inventory §1 lines 1390-1673; §6 i18n risks](research/researcher-01-recovered-code-inventory.md) · [scout: i18n, audio reuse](reports/scout-01-current-repo-reuse-map.md)
- Depends on: 01, 02. Parallel with: 03 (G1).

## Overview
- Date: 2026-10-18
- Description: Recover the WebAudio synth (`ng`) and the VI->EN translation system (`jl` map ~185 entries, `Cn`, `Ln` long-text translator, `Wa` DOM tree translator) as TS modules with identical output.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed

## Key Insights
- Translation is VI-source text rewritten in DOM after `innerHTML`; `Ln` does length-sorted substring replacement + regex for hint sentences -> order-dependent, easy to regress. Golden: translate every VI string seen in the template/dialogs + generated hint sentences, compare to original output.
- Language key `aigame3d_language` ('vi' default | 'en'); toggle writes key then `location.reload()`. Keep as-is during parity (migration into repo i18n in 12).
- Repo `src/i18n/i18n.ts` (`defineStrings`, key `nsq.language`) is NOT used by recovered UI yet; new files are prefixed `legacy-`/named distinctly to avoid ownership collision with 12.
- Audio: synth parameters (frequencies, durations, gains, music loop) verbatim. Old-engine `audio-gesture-unlock` is not wired here (parity); evaluated in 11/18.

## Requirements
- `translateText(vi)`, `translateLongText(vi)`, `translateDomTree(root)` output identical to original for golden corpus.
- Synth API names unchanged for callers (`unlock`, `correct`, `hint`, `jump`, `celebrate`, music on/off); recorded call trace (stubbed AudioContext from 01) identical for the playthrough.

## Architecture
```
src/i18n/legacy-translations-en.ts   VI->EN map (data, may exceed 200 lines: data-only exception, or split a-m / n-z)
src/i18n/legacy-translator.ts        language key read, translateText, translateLongText, translateDomTree
src/audio/synth-audio.ts             WebAudio tone/correct/hint/jump/celebrate/music loop
src/legacy/shims/{audio,i18n}.js
src/i18n/legacy-translator.golden.test.ts   corpus from tests/parity/golden/i18n-corpus.json (generated in this phase with the 01 harness)
```

## Related code files
- Create: above. Modify: 2 shims; `tools/recovery/golden/generate-golden-traces.mjs` (add i18n corpus; 01 is done, ownership passes here). Delete: `legacy-audio.js`, `legacy-i18n.js`.

## Implementation Steps
1. Rename maps for audio + i18n clusters; apply; move to TS.
2. Generate i18n corpus golden from original functions (template strings, dialog strings, hint sentences for all facts).
3. Golden test; synth call-trace test in parity spec (EN scenario + playthrough).
4. Swap shims, delete chunks, parity run. Commit + tag `recovery-p04`.

## Todo list
- [ ] rename maps
- [ ] translations data + translator (+ golden)
- [ ] synth module
- [ ] shims swapped, parity green

## Success Criteria
- `npm test -- src/i18n/legacy-translator` green on full corpus.
- `npm run test:parity`: EN scenarios pixel thresholds of 02 met; audio call trace equal.

## Scope Contract
- Changed: audio + translator modules. Impacted: UI chunk text, sounds.
- Will verify: golden corpus (unit) + EN/VI parity scenarios + audio trace.
- Skipped: repo `i18n.ts` tests (untouched).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Substring sort order differs (stable sort, locale compare) | M | M | copy sort comparator verbatim; corpus test |
| Regex with Unicode flags altered by unminify | L | M | corpus covers every hint sentence form |
Rollback: restore shims to legacy chunks from tag `recovery-p02`.

## Security Considerations
- `translateDomTree` writes text nodes only (no innerHTML) — keep it that way.

## Next steps
- 08 UI consumes translator; 12 migrates language key into repo i18n settings.
