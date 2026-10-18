// Splits recovered/formatted/game-styles.css into section files under src/styles/game/
// whose in-order concatenation is byte-identical to the source (sha256 checked), plus
// game-styles-index.css that @imports them in order.
//
// usage: tsx tools/recovery/split-legacy-styles.ts [--check]
//   --check  only verify that the committed section files still concatenate to the source.
//
// One section (13) is a single 334-line `@media (max-width: 700px)` block. It stays whole on
// purpose: splitting it would change bytes, and byte parity wins until phase 09.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SOURCE = 'recovered/formatted/game-styles.css';
const OUT_DIR = 'src/styles/game';
const INDEX = 'game-styles-index.css';

/** [first line (1-based, inclusive), file name]; each section runs to the next start. */
const SECTIONS: Array<[number, string]> = [
  [1, '01-base-tokens-and-reset.css'],
  [98, '02-game-shell-loading-topbar.css'],
  [263, '03-area-label-and-welcome-intro.css'],
  [427, '04-welcome-actions-caption-footer.css'],
  [530, '05-hud-player-card-and-quest.css'],
  [727, '06-quest-collapse-minimap-world-labels.css'],
  [912, '07-controls-toolbar-interact.css'],
  [1036, '08-world-map-overlay.css'],
  [1205, '09-dialog-book-and-answers.css'],
  [1372, '10-reward-feedback-hints-grid.css'],
  [1529, '11-settings-help-completion.css'],
  [1622, '12-touch-controls-and-height-queries.css'],
  [1753, '13-responsive-max-width-700.css'],
  [2087, '14-short-landscape-and-reduced-motion.css'],
];

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export function splitStyles(source: string): Array<[string, string]> {
  // Keep line terminators so concatenation reproduces the source exactly.
  const lines = source.match(/[^\n]*\n|[^\n]+$/g) ?? [];
  return SECTIONS.map(([start, name], i) => {
    const prev = lines[start - 2]?.trimEnd();
    const first = lines[start - 1] ?? '';
    if (start > 1 && (/^\s/.test(first) || (prev !== '}' && prev !== ''))) {
      throw new Error(`line ${start} is not a top-level rule boundary (${name})`);
    }
    const end = SECTIONS[i + 1]?.[0] ?? lines.length + 1;
    return [name, lines.slice(start - 1, end - 1).join('')];
  });
}

function concatFromIndex(): string {
  const index = readFileSync(join(OUT_DIR, INDEX), 'utf8');
  const files = [...index.matchAll(/@import "\.\/([^"]+)";/g)].map((m) => m[1] as string);
  return files.map((f) => readFileSync(join(OUT_DIR, f), 'utf8')).join('');
}

const source = readFileSync(SOURCE, 'utf8');
if (!process.argv.includes('--check')) {
  const parts = splitStyles(source);
  for (const [name, css] of parts) writeFileSync(join(OUT_DIR, name), css);
  const header = '/* Recovered game styles, split mechanically; order matters. */\n';
  writeFileSync(
    join(OUT_DIR, INDEX),
    `${header}${parts.map(([name]) => `@import "./${name}";`).join('\n')}\n`,
  );
}
const ok = sha256(concatFromIndex()) === sha256(source);
console.log(`styles sha256 ${ok ? 'EQUAL' : 'DIFFERENT'}: ${sha256(source)}`);
if (!ok) process.exit(1);
