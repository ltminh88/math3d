#!/usr/bin/env bash
# Regenerates src/legacy/legacy-<group>.js + shims from the recovered production bundle.
#
#   1. strip-three: vendored three r180 ids -> named imports from npm `three` (ids verified)
#   2. wakaru --level minimal: syntax-only unminify (!0 -> true, sequence exprs split, ...)
#      `minimal` keeps every app identifier; renames belong to rename maps (phases 03-08).
#   3. biome format, then split-legacy-chunks by inventory line ranges.
#
# Intermediates go to a temp dir (pass KEEP_WORK=1 to keep and print it).
# usage: bash tools/recovery/unminify-app.sh [outDir=src/legacy]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="${1:-$ROOT/src/legacy}"
APP="$ROOT/recovered/formatted/game-app-section.js"
THREE="$ROOT/recovered/formatted/three-section.js"
WORK="$(mktemp -d)"
[[ "${KEEP_WORK:-0}" == "1" ]] || trap 'rm -rf "$WORK"' EXIT

cd "$ROOT"
npx tsx tools/recovery/strip-three.ts "$APP" "$THREE" "$WORK/stripped.js"
npx wakaru "$WORK/stripped.js" -o "$WORK/unminified.js" --level minimal --force
npx biome format --stdin-file-path=unminified.js < "$WORK/unminified.js" > "$WORK/unminified-formatted.js"
npx tsx tools/recovery/split-legacy-chunks.ts "$APP" "$WORK/unminified-formatted.js" "$OUT"
[[ "${KEEP_WORK:-0}" == "1" ]] && echo "work dir: $WORK"
echo "legacy chunks written to $OUT"
