# Phase 03: Save code M3D5 — one lenient bump for all future ids/levels

## Context links
- [plan.md](plan.md) decision 5
- `src/store/save-code-codec.ts:26,117-128`, `save-code-v4-payload.ts`, `save-code-v3-skills.ts:44,71-79`, `save-code-v3-payload.ts:20-30`
- `docs/recovery-notes.md` (never change a shipped version)

## Overview
P1, safety-critical (data/save format) → full save-code test suite. Effort 4h. Lane muse-min. No deps. Branch `muse/save-code-m3d5`. **Must merge before any production deploy containing ids from 07+ or levels from 19/20.**

## Key Insights
- M3D3/M3D4 reject codes with unknown ids. Under that rule each family PR would need its own version → ~10 versions to decode forever.
- Lenient decode: a *well-formed* tuple whose id matches `SKILL_ID_PATTERN` but is not in the catalog is dropped; a malformed one still rejects. Same for level ids in `k`/`t`. Old v4 clients reject M3D5 (version check) — acceptable, PWA stale-build reload updates them.
- Cost: a typo'd id would drop silently → guard with a round-trip test over the *whole* catalog + all level ids.

## Requirements
- `save-code-v5-payload.ts` (copy v4 shape, same keys), lenient skill/level decoding, `MAX_SKILL_TUPLES = 512` constant instead of `SKILL_CATALOG.length`.
- `SAVE_CODE_VERSION = 5`; decode '1'..'5'; v1–v4 decoding byte-for-byte unchanged (existing fixtures).
- Shipped M3D4 fixture still decodes; new M3D5 fixture frozen in test.

## Architecture
`src/store/save-code-v5-payload.ts` (new), `save-code-v5-skills-lenient.ts` (new, wraps v3 tuple parser), codec mod, tests.

## Related code files
Ownership: `src/store/save-code-*` only.

## Implementation Steps
1. RED: M3D5 code with an unknown well-formed id `zz-future-skill` imports, other stats intact; malformed tuple rejects; unknown level id dropped; full-catalog round-trip; v4 fixture still decodes; v4 code with unknown id still rejects (format frozen).
2. Implement; GREEN. Run `save-code*` tests, `save-storage.golden`, e2e save-code specs (4 projects).

## Todo list
- [ ] RED tests
- [ ] v5 payload + lenient skills/levels
- [ ] codec bump
- [ ] e2e save-code specs

## Success Criteria
Exports are M3D5; all old fixtures decode as before; unknown future ids skipped.

## Risk Assessment
| Risk | Countermove |
|---|---|
| Silent drop of real progress | full round-trip test; drop only pattern-valid unknown ids |
| Code length grows past 16 KB with ~100 more skills | measure max code size in test (all skills attempted) and assert < `MAX_SAVE_CODE_CHARS` |

## Security Considerations
Untrusted input: keep strict type/range checks per field; cap tuple count before iterating.

## Next steps
Unblocks production deploys of 07+ and 19/20.
