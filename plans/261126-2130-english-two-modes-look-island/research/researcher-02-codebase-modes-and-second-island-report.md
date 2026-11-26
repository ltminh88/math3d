# Researcher 02 — modes entry + second (Look 1) island: codebase facts

Read-only scan, 2026-11-26. Builds on `plans/reports/brainstorm-261126-english-two-modes.md`.

## A. Second island placement

### How `island` was added (the pattern to copy)
| Piece | File:line | Note |
|---|---|---|
| Region id union + entry | `src/config/expansion-regions.ts:10`, `:86-103` | centre [-6,13], 12x10, `unlock:'bridge'`. Header `:4-7`: never feeds REGIONS / scatter `isBlocked` / `regionAtPoint` → golden safe |
| Road (same index as region) | `src/config/expansion-roads.ts:37-42` | `[-8,1]→[-8,8]`; order must match EXPANSION_REGIONS (`:4-5`) |
| Signpost board | `src/config/expansion-signposts.ts:45` | board on `west-bridgehead` |
| Region strings | `src/config/expansion-region-strings.ts:24-26, 45-47` | vi + en name/subtitle/blurb |
| Builder | `src/world/regions/island-region-builder.ts:43-60` | water ring r5.5 + sand r4 + plank bridge + 3 palms + flag, collision via `blockAt` |
| Bake | `src/world/expansion-world-builder.ts:64` | baked into the SAME 3 meshes (`:2-9`) → **+0 world draw calls** for a new region |
| Ground pad | `src/world/expansion-road-builder.ts:13` | loops EXPANSION_REGIONS → pad automatic |
| Scatter clearing | `src/world/expansion-scatter-clearing.ts` (inTreeZone/inRockZone/inFlowerZone) | uses `expansionRegionAt` + `nearExpansionRoad` → automatic, draws no RNG |
| Gate | `src/config/level-gate-config.ts:20-32` (levelId union), `:133-140` | `{levelId:'island', position:[-8,10], requires:'bridge', sign:'A B C'}` |
| Guard tests | `src/config/expansion-region-lookup.test.ts:35` (ordered id list), `:62-76` (road starts ON an original ROADS segment, ends inside its region), `:82-97` (areaAt) | must extend `:35` list |

Golden stays byte-identical as long as REGIONS / ROADS / WALKABLE_BOUNDS (`src/config/world-constants.ts:37-48`) are untouched — the island precedent proves it.

### Free walkable ground (west bank x −47.8..1.8, z −41.8..41.8 after margin 2.2)
Occupied on west bank: village footprint (-13,0) 34x40 → x −30..4, z −20..20 (overlap test only guards non-village regions, `expansion-regions.ts:86-89`); island x −12..0, z 8..18; cave x −39..−25, z 26..38; market x −38..−26, z −34..−26; gazebo mound (-40,18) r5.5 (`src/world/west-bank-builder.ts:54-58`). Original roads `src/config/roads.ts`: village road `(-10,-14)→(-10,6)`, west road `(-17.5,1)→(-33,-1)→(-36,-7)`, `(-33,-1)→(-40,14)`.

| # | Centre / size | Footprint | Road (start on original road) | Pros / cons |
|---|---|---|---|---|
| **L1 (recommended)** | **[-12, 31]**, 12x10 | x −18..−6, z 26..36 | `[-17.5,1]→[-17.5,24]→[-13,27]` (start = west-road end point) | Pairs with CEC island (both south of the bridge road, "two islands"); 8 m gap to CEC island, 7 m to cave. Road passes through SW village quarter — **probe needed** for village props in x −19..−16, z 2..24 |
| L2 | [-12, -32], 12x10 | x −18..−6, z −37..−27 | `[-10,-14]→[-10,-27]` (extends village road north end) | Cleanest road (straight, between windmill (-15,-14) and houses (-4,-11)); far from CEC island; near world-edge mountains — probe needed |

Both: no REGIONS/ROADS/WALKABLE_BOUNDS change. 1A's "footprint probe" is documented only as a comment (`expansion-regions.ts:85-89`, `island-region-builder.ts:3-7`); no probe script found — the evidence is the gate-placement e2e (`tests/e2e/level-gate.spec.ts`) + lookup test. Re-run both + golden `--check`.

Draw calls: world +0 (baked); one new signpost board lands in the existing atlas mesh (+0). The Look level's own diorama is its own scene/chunk (`src/levels/island/index.ts:16` lazy `import('./island-scene')`); no per-level draw-call budget constant/test found in `src` — clone island diorama counts.

## B. Mode entry

- Welcome wiring: `src/ui/menu-language-start.ts:64` `#play` → `whenStoreReady('play', startAdventure)`. `startAdventure` (`:19-40`) sets `world.active=true`, hides `#welcome`, shows HUD, toast. `returnToMenu` (`:42-56`, called from `src/ui/settings-dialog.ts:33,72` "Về menu") sets `world.active=false`, shows welcome.
- New: second button (e.g. `#play-english`) → `startEnglishHome()` which does NOT set `world.active`; shows a DOM English home; card click → `enterLevelFromMap('island', n)` (`src/levels/shared/level-gates.ts:128-139`, skips gate lock check by design — only needs `host` + `connectedStore()`).
- appSettings: `src/store/settings-store.ts:4-26` (`Settings`, `DEFAULT_SETTINGS`), key `math3d.settings` (`:28`), migration = `sanitizeSettings` (`:45-58`) — field-wise fallback to default, no version. Add `playMode: 'game' | 'english'` (default `'game'`) + one sanitize line → old devices migrate for free. Device-level, no save-code bump.
- Exit path: level host suspends world on enter (`src/levels/shared/level-host.ts:74`) and calls `ports.world.resume()` on exit/abort (`:92`, `:159`); ports bind `world` directly (`src/levels/shared/level-host-ports.ts:120-137`). Exit-run UI back button → `exit({completed:false})` (`level-host-ports.ts:70`). **Change:** add an exit-target hook to `LevelHostPorts` (e.g. `afterExit()` or wrap `world` port): in English mode `resume()` must keep `world.active=false` and re-show the English home + refresh stars. Cover all 3 exit paths: normal exit `:84-92`, start failure `:100`, loop crash `:135`/`:159`.
- Can world stay unloaded? **No, not fully:** host renders on `world.renderer` (`level-host-ports.ts:123`, "one renderer, one WebGL context", `level-host.ts:3`), and `getWorld()` is a boot-time object (`src/ui/game-state.ts:86`). World can stay **inactive** (built but not ticking/rendered) — cost = initial build only. Making the world build lazy is a separate, larger refactor (not needed).

## C. Engine per-book split (CEC-specific today)

| CEC-specific | File:line |
|---|---|
| `ENGLISH_LETTER_BLOCKS` a-d…y-z | `src/english/english-types.ts:7` |
| Skill id list (41 `en-*`) built from blocks/topics/patterns | `src/english/english-skill-entries.ts:9-19`; sticker labels `src/ui/sticker-book-strings.ts:295-334` |
| Pack stages fixed `[1..8]` | `src/english/english-pack-contract.ts:15` |
| Pack storage single key `'current'` | `src/english/pack/pack-storage.ts:42` |
| Stage plan 8 stages / names | `src/levels/island/island-stage-plan.ts:1-25` |
| Level def `id/regionId:'island'` | `src/levels/island/index.ts:7-16` |
| Content seed | `src/english/content/seed-unit-1.ts`, `audio-map.ts` |
| Run hard-wired to island shell, 420 lines | `src/ui/english/english-run.ts:1,44` |
| Test hook commits `levelId:'island'` | `src/ui/english/english-test-hook.ts:52,76` |
| Strings namespace `english-island` / `tei` | `src/ui/english/english-strings.ts:6` (keep shared) |

Minimal descriptor (one file, e.g. `src/english/english-books.ts`):
```ts
interface EnglishBook { id: 'cec'|'look'; levelId: 'island'|'look'; stages: number;
  stageNames: readonly string[]; skillIds: readonly SkillId[]; seed: SeedContent;
  packKey: string /* 'current' for cec (back-compat), 'look' */ }
```
`island/index.ts` + a new `levels/look/index.ts` both pass their book to `startEnglishRun`; pack contract gains optional `book` (absent = cec).

Save-code impact:
- `M3D3_LEVELS` gains `'look'` (`src/store/save-code-v3-payload.ts:21-34`, island precedent `:5`) — export still latest version, no bump.
- `MAX_STAGE_STARS = 8` (`src/store/save-code-v4-payload.ts:32`, `save-code-v5-payload.ts:27`) → **Look must have ≤ 8 stages** or a decoder change.
- Skill grammar `[a-z][a-z0-9-]{1,38}` (`src/learning/skill-catalog.ts:27`) accepts `en-look-u1-words` etc.; append to SKILL_CATALOG, never reorder (`save-code-v3-skills.ts:8-15`).
- Other unions to extend: `LevelGate.levelId` (`level-gate-config.ts:20-32`), `ExpansionRegionId` (`expansion-regions.ts:10`).

## Unresolved questions
1. L1 vs L2: probe village props along x≈−17.5, z 2..24 (L1 road) — any house/fence/tree circle there? Needs a quick in-game/e2e probe.
2. Does `world.resume()` re-activate input/loop when `world.active` is false? Not read (WorldPublicApi impl) — decides whether a port wrapper suffices.
3. Look 1 unit count → stage count must be ≤ 8 (else MAX_STAGE_STARS decoder change).
4. Look diorama: clone island diorama (lighthouse variant) or new? No draw-call budget test exists to enforce a number.
5. English home in mode 1: CEC only (per decision) — confirm Look stays normal-play only.
