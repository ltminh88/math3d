// Builds the VI->EN translation golden (tests/parity/golden/i18n-corpus.json) by running the
// ORIGINAL translator block (Zl..Wa, lines 1435-1673 of the formatted bundle) in a vm with the
// language forced to 'en'. Corpus = every string literal / template quasi of the bundle, every
// template with its expressions filled, every hint sentence, and the composed UI strings that
// the original feeds to Ln (hint area, answer feedback, XP label).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { parse } from 'acorn';
import { mulberry32 } from './seeded-random.mjs';

const FIRST = 1435;
const LAST = 1673;
const HEAD = "const Zl = 'aigame3d_language';";
const NEXT = "const sg = '#194f42';";

function loadOriginalTranslator(sourceLines) {
  if (
    sourceLines[FIRST - 1] !== HEAD ||
    sourceLines[LAST - 1] !== '}' ||
    sourceLines[LAST] !== NEXT
  ) {
    throw new Error(`i18n block ${FIRST}-${LAST} drifted`);
  }
  const code = `${sourceLines.slice(FIRST - 1, LAST).join('\n')}\nmodule.exports = { jl, Cn, Ln, Va };`;
  const sandbox = {
    module: { exports: {} },
    localStorage: { getItem: () => 'en', setItem: () => {} },
  };
  vm.runInNewContext(code, sandbox, { filename: 'original-i18n-block.js' });
  const t = sandbox.module.exports;
  if (t.Va() !== 'en') throw new Error('original translator did not switch to en');
  return t;
}

// All string literals, template quasis and templates with every `${…}` replaced by '7'.
function bundleStrings(source) {
  const out = [];
  const visit = (node) => {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!node || typeof node.type !== 'string') return;
    if (node.type === 'Literal' && typeof node.value === 'string') out.push(node.value);
    if (node.type === 'TemplateLiteral') {
      const parts = node.quasis.map((q) => q.value.cooked ?? '');
      out.push(...parts, parts.join('7'));
    }
    for (const [key, child] of Object.entries(node)) {
      if (key !== 'type' && child && typeof child === 'object') visit(child);
    }
  };
  visit(parse(source, { ecmaVersion: 'latest', sourceType: 'module' }));
  return out;
}

// Inputs composed exactly like the original UI does before calling Ln (ic, fg, _n).
function composedStrings(harness) {
  const rng = mulberry32(5);
  const out = [];
  for (const a of harness.Ha) {
    for (let b = 1; b <= 10; b++) {
      const q = harness.ll(a, b, 'practice', rng);
      const stones = Array.from(
        { length: a },
        () => `<div class="stone-group">${'<i></i>'.repeat(b)}</div>`,
      );
      for (const lvl of [1, 2, 3]) {
        const hint = harness.tg(q, lvl);
        out.push(hint);
        out.push(
          `<p>${hint}</p><div class="stone-groups" aria-label="${a} nhóm, mỗi nhóm có ${b} viên đá">${stones.join('')}</div>`,
        );
      }
      const base = `✓ Chính xác! ${a} × ${b} = ${q.answer}. +10 XP · +5 xu`;
      out.push(base, `${base} · Combo ${a}!`);
    }
  }
  for (const xp of [0, 35, 120, 999]) out.push(`${xp} XP · Cấp cao nhất`, `${xp} / 100 XP`);
  return out;
}

export function buildI18nCorpus(harness, sourcePath) {
  const source = readFileSync(sourcePath, 'utf8');
  const original = loadOriginalTranslator(source.split('\n'));
  const mapEntries = JSON.parse(JSON.stringify(Object.entries(original.jl)));
  const inputs = [...mapEntries.flat(), ...bundleStrings(source), ...composedStrings(harness)];
  const unique = [...new Set(inputs)].filter((s) => /\p{L}/u.test(s));
  return {
    legend: 'entries: [input, Cn(input), Ln(input)] with language=en; vi is identity',
    mapEntries,
    entries: unique.map((s) => [s, original.Cn(s), original.Ln(s)]),
  };
}

export const ORIGINAL_SOURCE = join('recovered', 'formatted', 'game-app-section.js');
