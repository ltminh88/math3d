// Level panels (celebration cards, the field speech bubble) open with the shared `pop` keyframe,
// which animates `transform`. A panel that centres itself with `transform: translate(...)` loses
// that offset while the pop runs and then jumps into place (chapter-2 playthrough: the forest card
// started half off-screen on a phone). Panels that run `pop` centre with `translate` instead.
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const levelsDir = new URL('..', import.meta.url);

/** Every CSS rule body (selector + declarations) of the level folders, flattened. */
function levelCssRules(): { file: string; selector: string; body: string }[] {
  const rules: { file: string; selector: string; body: string }[] = [];
  for (const level of readdirSync(levelsDir, { withFileTypes: true })) {
    if (!level.isDirectory()) continue;
    const dir = new URL(`${level.name}/`, levelsDir);
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.css'))) {
      const css = readFileSync(new URL(file, dir), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        rules.push({
          file: `${level.name}/${file}`,
          selector: (m[1] ?? '').trim(),
          body: m[2] ?? '',
        });
      }
    }
  }
  return rules;
}

describe('level panels that open with pop', () => {
  it('never position with transform on a selector that runs the pop keyframe', () => {
    const rules = levelCssRules();
    const popSelectors = new Set(
      rules.filter((r) => /animation:\s*pop\b/.test(r.body)).map((r) => r.selector),
    );
    expect(popSelectors.size).toBeGreaterThan(0);
    const offenders = rules
      .filter(
        (r) => popSelectors.has(r.selector) && /(^|[;\s])transform:\s*(?!\s|none)/.test(r.body),
      )
      .map((r) => `${r.file} ${r.selector}`);
    expect(offenders).toEqual([]);
  });
});
