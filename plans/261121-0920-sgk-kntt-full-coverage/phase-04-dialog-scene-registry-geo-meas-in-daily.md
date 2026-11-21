# Phase 04: Dialog scene registry + geo/meas back in daily

## Context links
- [plan.md](plan.md), [phase-00](phase-00-daily-practice-crash-hotfix-and-dispatcher.md)
- `src/geometry/geo-scene-types.ts` (SceneBody kinds), `src/levels/workshop/workshop-shape-svg.ts`, `src/levels/valley/valley-board-views.ts`
- `src/ui/daily-skill-item.ts`, `src/ui/kit/step-card.ts`

## Overview
P1. Effort 6h. Lane muse-88. Deps 00. Branch `muse/dialog-scenes-core`.
Gives the dialog (daily + lesson mode) a picture area that draws an item's plain-data `scene` as SVG. Renderers self-register, so later families add one file each.

## Key Insights
- Registry via `import.meta.glob('./scenes/*-scene-svg.ts', {eager: true})` — each module exports `{kinds: string[], render(scene): SVGElement}`. No shared list to edit.
- Reuse workshop/valley 2D SVG/DOM views where they are already DOM (ruler, shapes, balance); 3D-only views (solids) get a simple isometric SVG or stay filtered.
- `dialogRenderable(item)` (phase 00) becomes: no scene, or registry has `scene.kind`. Skills still without a renderer stay filtered — never a blank picture.

## Requirements
- `src/ui/dialog-scenes/dialog-scene-registry.ts` (glob, `renderScene`, `hasSceneRenderer`).
- Geo + meas renderers covering every `SceneBody` kind used by catalog skills (split files <200 lines: `geometry-shapes-scene-svg.ts`, `geometry-circle-angle-scene-svg.ts`, `measurement-instruments-scene-svg.ts`, …).
- Step card host shows picture above steps; fits phone portrait (max-height ~40vh, scroll steps), no pinch needed; labels ≥14 px.
- Unit (jsdom/happy-dom if present, else node DOM-free test of the registry map): every geo/meas skill × tier sample → `hasSceneRenderer` true.

## Architecture
```
src/ui/dialog-scenes/dialog-scene-registry.ts
src/ui/dialog-scenes/scenes/*-scene-svg.ts
src/ui/daily-skill-item.ts (mod: mount picture)
src/practice/item-for-skill.ts (mod: renderable predicate takes a lookup)
src/styles/dialog-scene.css
```

## Related code files
Ownership: `src/ui/dialog-scenes/**`, `src/ui/daily-skill-item.ts`, `src/practice/item-for-skill.ts`, `src/styles/dialog-scene.css`, `tests/e2e/daily-practice.spec.ts`.

## Implementation Steps
1. RED e2e: seeded `sk:meas-ruler-read` + `sk:geo-midpoint` → daily item shows `svg.dialog-scene` and is answerable by tap (4 projects).
2. Registry + renderers; lift filter for covered kinds; GREEN.
3. Screenshots phone/tablet in PR; gates; preview.

## Todo list
- [ ] registry + glob
- [ ] geo renderers
- [ ] meas renderers
- [ ] e2e + screenshots

## Success Criteria
Every geo/meas skill appears in daily with a correct picture; no scene item without renderer is ever planned.

## Risk Assessment
| Risk | Countermove |
|---|---|
| Picture + pad overflow on phone | max-height + scrollable steps; phone e2e checks answer button in viewport |
| Drift from level visuals | reuse level SVG helpers, not copies |

## Security Considerations
SVG built with DOM APIs, no `innerHTML` from data strings.

## Next steps
06 reuses the host; 16/17 add family renderers.
