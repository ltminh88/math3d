# Recovered code inventory: game-app-section.js (2548 lines)
Skill note: `tkm:help` activated; no research/docs skill applicable (single local source) -> Read/Grep only. Source = one file read fully; THREE ids confirmed by grep on three-section.js. Names below: minified id -> proposed name.

## 1. Inventory (line ranges in game-app-section.js)
| Lines | Item | Responsibility |
|---|---|---|
| 1-13 | `Ha,Kl,yt,Sa,Qe,kr,fe` | tables [2..10]; SAVE_KEY; BRIDGE_SEGMENTS=6; XP thresholds [0,100,250,450,700]; river {4,10,bridge 3.4}; level fn (1+count thresholds<=xp, max 5); walkable bounds fe (west -50..4, east 10..70, z +-44, margin 2.2) |
| 14-93 | `Dt` | 6 regions (village, garden, meadow, forest, city, tower): VI name/blurb/subtitle, world#, center, size, labelHeight, color, icon, unlock 'start'/'bridge' |
| 94-133 | `Wr` | road polylines (9) used by terrain, scatter exclusion, minimap |
| 134-154 | `Xm,Di,qm,Cs,Ps` | region-at-point; isUnlocked(region,questComplete); sky top 0x74BFE6 / horizon 0xD4EEEC colors (ints 7651302/13954796); region by id |
| 155-236 | `$m` ctor | renderer (PCFSoft shadows, ACES 1.12, fog 150..560, hemi+sun, lowPower = matchMedia(<=900px or coarse)), builds world in fixed order, pointer drag-rotate / tap-to-move / wheel zoom |
| 237-281 | `$m` fields | camera (fov48, yaw .57, pitch .95, dist 42), state, hooks onFrame/onJump/onSceneClick |
| 282-329 | material/mesh/box/sphere/cylinder/block/regionGroup/sign | primitives + material cache (by color) + canvas-texture signs (Baloo 2 font) + obstacle registry |
| 330-354 | createSky, groundHeight | gradient ShaderMaterial dome; outer-hill height fn |
| 355-439 | terrain, road | 2400^2 plane 200x200 vertex-colored flat-shaded; river, ripples(60), plaza, roads |
| 440-539 | house, tree, village, garden | village buildings/windmill/18 trees/signpost; garden fence, beds |
| 540-684 | mathMeadow, forest, city, tower | region props, signs ("x /", "2x3", "/3", numbers, "x / + -"), floaters |
| 685-741 | westBank | pond, cabin, hills (outer 6 spheres) |
| 742-879 | scatter | seeded(1337) LCG: trees (150/230), outer-hill trees (450/900), InstancedMesh trunks/crowns/cones, 70 rocks, flowers/grass (700/1300) |
| 880-913 | createPlayer, createMilo, setAvatar | NPC Milo (hat, beacon userData) and avatar boy/girl (shirt color, ponytail) |
| 914-936 | createBridge, setBridge | 6 segments, visibility by progress, drop-in animation + burst |
| 937-990 | decorate | seeded(91) clouds (22), distant mountains (18) |
| 991-1038 | mergeStatic | merges static meshes per material+castShadow via mergeGeometries (Wm) |
| 1039-1141 | resize/floorHeight/jump/zoom/clearInput/resetCamera/moveToScreen/nearMilo/canMove/movement | controls: WASD/arrows + joystick vector, tap-to-move raycast onto y=0 plane, speed 6.5, jump v6.5 g18, collision circles, bridge gating (|z|<1.25 once built) |
| 1142-1188 | burst, project, heading, updateShadows | sparks (Math.random), world->screen projection for DOM labels, shadow box follow |
| 1189-1255 | animate, dispose | per-frame camera lerp, windmill/clouds/floaters/ripples/sparks, onFrame(nearMilo, overBridgeEast x>12&&|z|<4, fps), idle orbit |
| 1256-1334 | `Ga,Gn,Ym,Km,Zm` | default save, int clamp, parse+validate, load, save (try/catch) |
| 1335-1389 | `jm,ll,Jm,Qm,eg,tg` | shuffle; question builder; picker (review queue 70%); answer check; stats update; hint text ladder |
| 1390-1434 | `ng` | WebAudio synth: tone/correct/hint/jump/celebrate/music loop |
| 1435-1673 | `Zl,lr,jl,ig,Va,rg,Cn,Ln,Wa` | language key, VI->EN map `jl` (~185 entries), translate fn Cn, long-text translate Ln (substring sort + regex for hint sentences), DOM tree translate Wa |
| 1674-1912 | `ag,og,Jl,lg,cg,hg,Ql` | minimap/world-map canvas 2D renderer, seeded decor (23, 7), view transform, hit-test, locked regions |
| 1913-1938 | `cl,Xe,Y` | SVG icon set, icon fn, getElementById |
| 1939-2000 | globals + template | `ie`=save state, `xt`=audio, `_e`=world; innerHTML of whole UI into #app |
| 2001-2086 | In,Xt,fl,_n,nc | toast, persist wrapper, bump anim, HUD refresh (level/xp/quest/labels), quest collapse |
| 2087-2183 | Jn,cr,language,ug,pl,Yr,Xr | dialog open/close, EN/VI toggle (reload), start/menu, Milo dialog, quiz dialog |
| 2184-2239 | ic,dg,fg | hint ladder render (levels 1-3), reward pop, answer handling (+10xp +5 coins, bridge+1, combo) |
| 2240-2319 | $a,pg,Ti | multiplication book, help, settings (+reset), button wiring |
| 2320-2394 | rc,sc,ac,oc,Ya,Ka,Kr | minimap tick, map overlay, region list/detail, click hit-test |
| 2395-2471 | keydown/keyup/blur/visibility, joystick, Ls, cc | input, DOM label projection, area-change toast |
| 2472-2519 | bootstrap try/catch | create world, hooks, quest-complete trigger (+50xp +10 coins when bridge=6 and x>12), WebGL-failure fallback (#loading innerHTML) |
| 2520-2548 | `document.modelContext` | WebMCP tool `read_adventure_progress` (read-only) |

## 2. Resolved minified -> THREE (grep-confirmed in three-section.js)
F=Vector3 (1238), We=Vector2 (660), Zh=CanvasTexture (7510), nu=DirectionalLight (8425), Qh=HemisphereLight (8227), ru=Clock (8447), su=Raycaster (8478), Na=Fog (7133), Tn=Plane (7336), fr=MathUtils (634).
Geometry: **Oa=DodecahedronGeometry** (rocks), **Yi=IcosahedronGeometry** (all "spheres", detail passed: 1 for sphere(), 0 for flowers/rocks), **Ba=OctahedronGeometry** (tower floating gems; prelim said Plane = wrong), Li=PlaneGeometry, $i=ConeGeometry (extends CylinderGeometry; note `new $i(r,h,7)` = radialSegments 7), tr=CylinderGeometry, Ni=BoxGeometry, za=SphereGeometry (sky), or=PolyhedronGeometry.
Constants: _l=2 PCFSoftShadowMap, xl=4 ACESFilmicToneMapping, Ut='srgb' SRGBColorSpace, Lt=1 BackSide, tn=2 DoubleSide.
Not re-verified (kept prelim): St=Mesh, En=InstancedMesh, ut=Group, Mt=Object3D, Ss=MeshStandardMaterial, gn=ShaderMaterial, ke=Color, kt=BufferAttribute, Jt=BufferGeometry, Wt=PerspectiveCamera, Vm=WebGLRenderer, Wh=Scene, Wm=mergeGeometries.
IMPORTANT: "sphere" is an ICOSAHEDRON detail 1 (80 faces), not SphereGeometry. Must stay so for visual parity.

## 3. DOM/CSS coupling
index.html needs only `#app` (whole UI is innerHTML built at 1958-2000) + fonts Baloo 2/Nunito (canvas signs use font string, load order matters).
Ids in template (required): world, loading, area-label/-icon/-name/-sub, language, sound, settings, welcome, boy, girl, play, learn-welcome, world-caption, hud, avatar-face, player-name, level, xp-fill, xp-text, wallet, coins, quest-card/-toggle/-title/-body/-copy/-steps/-progress, minimap, minimap-canvas, milo-label, bridge-label, bridge-count, {garden,meadow,forest,city,tower}-label (generated from Dt), zoom-in/out, open-map, learn, help, interact, touch-controls, joystick, joystick-knob, jump, world-map, map-canvas, close-map, map-regions, map-detail, toast, menu-footer, dialog, close-dialog, dialog-content.
Dialog-injected ids: accept-quest, hint, hint-area, feedback, next-question, practice-table, practice-all, understood, toggle-sound/-music, save-now, return-menu, reset-progress, confirm-reset, cancel-reset, keep-playing.
Classes toggled/set: body.playing; quest-card.collapsed; .locked (region labels, .map-region); .near (milo-label); .arrive (area-label, reflow trick); .bump (wallet, xp-fill); answer .correct/.incorrect (+disabled); feedback className `feedback success|gentle`; `.reward-pop` (self-removing on animationend); `.known` (book cells); `.done` (quest step); [aria-pressed], [aria-checked], [hidden] heavily. Selectors queried: .answer, [data-table], [data-region], data-value. Dialog `Xa` kind: milo|quiz|book|help|settings|reset|complete (quiz uses keys 1-3).

## 4. Save format (backward compat)
localStorage `aigame3d_multiplication_save` = JSON `{version:1, xp, coins, bridge(0-6), questAccepted, questComplete, avatar:'boy'|'girl', table(0|2..10), sound, music, combo, questionStats:{"m{a}_{b}":{attempts,correct,wrong,responseTime(ms),lastAnsweredAt(ISO)}}, review:["m{a}_{b}"], started}`.
Validation (Ym): version must === 1 else FULL RESET to defaults; ints clamped 0..1e7 (bridge<=6, combo<=1e4); questAccepted = true||bridge>0; questComplete only if bridge===6; stat/review keys must match `^m([2-9]|10)_([1-9]|10)$`; attempts recomputed = correct+wrong; **only first 30 questionStats entries and 30 review ids kept** (quirk: 90 possible; later entries silently dropped on load - keep for parity or fix knowingly); review deduped.
Other keys: `aigame3d_language` ('vi' default | 'en'), `aigame3d_quest_collapsed` ('1'|'0'). Language toggle writes key then location.reload().
Persist triggers: Xt() after answers, avatar, settings, accept quest, start; write failure -> one-time toast. No cloud/Supabase in this bundle.
Rules: correct = +10 XP +5 coins (+bridge if mode bridge); wrong adds id to review; correct with 0 hints removes from review; combo++/reset; completion +50 XP +10 coins on crossing bridge east (x>12,|z|<4). Hint ladder Yn 0..3 (1 groups, 2 repeated addition, 3 shows answer); wrong answer also bumps Yn. Picker: 70% from review (filtered to chosen table, not same as last), else uniform over table x 1..10 excluding last. Options = {b, b-1|b+2(b=1), b+1|b-2(b=10)} x a, shuffled.

## 5. Proposed TS module split (src/, kebab-case, each <200 lines)
Order = dependency order (build/verify top-down; each leaf swappable into the monolith first).
1. `config/world-constants.ts` (1-13, 151-154) + `config/regions.ts` (14-93,134-150,154) + `config/roads.ts` (94-133)
2. `save/save-types.ts`+`save/save-storage.ts` (1256-1334) ; `game/xp-levels.ts` (kr, Sa)
3. `quiz/question-generator.ts` (1335-1366), `quiz/answer-stats.ts` (1367-1382), `quiz/hint-text.ts` (1383-1389)
4. `audio/synth-audio.ts` (1390-1434)
5. `i18n/translations-en.ts` (1437-1623, data ~190 lines), `i18n/i18n.ts` (1435-1436,1624-1673)
6. `world/world-primitives.ts` (282-329), `world/sky.ts` (330-345), `world/terrain.ts` (346-439), `world/props-house-tree.ts` (440-479), `world/regions/village-garden.ts` (480-539), `world/regions/meadow-forest.ts` (540-615), `world/regions/city-tower.ts` (616-684), `world/west-bank.ts` (685-741), `world/scatter.ts` (742-879), `world/characters.ts` (880-913), `world/bridge.ts` (914-936), `world/decorate.ts` (937-990), `world/merge-static.ts` (991-1038)
7. `world/player-controller.ts` (1045-1141 minus camera), `world/camera-rig.ts` (1039-1044,1059-1066,1157-1188, camera part of 1189-1251), `world/world-input.ts` (204-235, 1068-1089), `world/world.ts` (155-203,237-281, loop 1189-1255; orchestrator, composition not one 1100-line class)
8. `map/map-decor.ts` (1674-1722), `map/map-render.ts` (1723-1912), `map/map-overlay.ts` (2320-2394)
9. `ui/icons.ts` (1913-1938), `ui/dom-template.ts` (1958-2000), `ui/game-state.ts` (1939-1957 globals -> single store), `ui/hud.ts` (2001-2086), `ui/dialog.ts` (2087-2102), `ui/milo-dialog.ts`, `ui/quiz-dialog.ts` (2164-2239), `ui/book-dialog.ts` (2240-2265), `ui/help-dialog.ts`, `ui/settings-dialog.ts` (2275-2319), `ui/keyboard-joystick.ts` (2395-2444), `ui/world-labels.ts` (2445-2471)
10. `main.ts` (2472-2519, 2103-2140), `webmcp-tool.ts` (2520-2548)
Incremental path: Vite+TS project, keep original blob as `legacy/app.js` until step 6; swap modules 1-5 first (pure, unit-testable with golden JSON for save + seeded quiz), then UI, last world (visual diff via screenshots at fixed camera).

## 6. Hot spots / risks
- Single-scope closures: UI code (1939-2519) shares ~12 mutable module `let`s (ie, _e, jn, Kt, Yn, ya, ba, Xa, Dn, Ei, bi, ec, ul, dl). Replace with one `gameState` object carefully; `ie = Ga()` reassigned on reset (2302), so don't destructure/alias.
- Event order: `_n()` HUD refresh is called ad hoc after mutations; HUD labels depend on `Wa` DOM translation (text-node rewriting) - language = full reload, so i18n must run after innerHTML. Ln substring replace is order-dependent (length-sorted); easy to regress.
- Pixel parity: constructor build order matters (materials map insertion, obstacles list consumed by scatter), mergeStatic output depends on traversal order. Seeded LCG (Park-Miller, 16807) seeds: scatter 1337, decorate 91, minimap 23 and 7. `lowPower` (matchMedia) changes counts (150/230, 450/900, 700/1300) and shadow map 1024/2048 -> layout differs by device class; replicate exactly.
- `Math.random` only in gameplay (shuffle, picker, burst sparks) - safe to inject RNG; layout never uses it. Floating-point order in scatter (e.g. `t()` call order inside conditions, short-circuit side effects on RNG!) must be preserved verbatim: calls inside `||` chains consume RNG conditionally.
- Magic numbers everywhere (speeds, offsets, colors as decimal ints). Convert to hex only mechanically (e.g. 16773326 = 0xFFF0CE); never retune.
- Icosahedron-as-sphere, cone via CylinderGeometry subclass, flatShading terrain, normalBias 0.045/bias -3e-4: wrong class => visible difference.
- Camera uses setViewOffset when idle on wide screens; sky follows camera; `updateShadows` follows target.
- Bug-like quirks to preserve or fix consciously: 30-entry stat cap; `Ps('forest')` excluded from scatter exclusion; `onFrame` throttled every 2nd frame; event `blur` auto-opens settings; `_e.setBridge(0)` on reset does not clear obstacles.
- Saved data compat is the only user-facing contract; protect with tests on `Ym`.

## Unresolved questions
- Exact hex of unverified ids (Vm, Wm, St, En...) were not re-grepped; confirm before codegen.
- Is original CSS 1:1 with classes above (game-styles.css not read; check for classes referenced only in CSS)?
- Should 30-entry cap on questionStats be fixed (risk: none to old saves) or kept?
- Any server/analytics endpoints in the wider bundle (this section has none)? Share three-section/other chunks if any exist.
- Target: stay vanilla DOM or move to framework? (affects module split in step 9.)
