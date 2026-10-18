// Rewrites the recovered app section so it imports three from npm instead of relying on
// the vendored, minified three r180 that preceded it in the production bundle.
//
// usage: tsx tools/recovery/strip-three.ts <app-section.js> <three-section.js> <out.js>
//
// Steps: (1) find every free identifier of the app section (TypeScript "cannot find name"
// diagnostics with DOM + ES2022 libs), (2) require the set to equal THREE_ID_MAP exactly,
// (3) verify each entry's marker inside its minified definition, (4) prepend named
// imports aliased to the minified ids. The app code itself is copied byte-for-byte.

import { readFileSync, writeFileSync } from 'node:fs';
import { Project, ts } from 'ts-morph';
import { THREE_ID_MAP } from './strip-three-id-map';

const CANNOT_FIND_NAME = new Set([2304, 2552, 2582]);

export function findFreeIdentifiers(code: string): string[] {
  const project = new Project({
    useInMemoryFileSystem: false,
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      allowJs: true,
      checkJs: true,
      noEmit: true,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
    },
  });
  const sf = project.createSourceFile('__free_ids__.js', code, { overwrite: true });
  const names = new Set<string>();
  for (const d of project.getPreEmitDiagnostics()) {
    if (!CANNOT_FIND_NAME.has(d.getCode())) continue;
    const start = d.getStart();
    const len = d.getLength();
    if (start === undefined || len === undefined) continue;
    names.add(sf.getFullText().slice(start, start + len));
  }
  return [...names].sort();
}

function definitionExtent(lines: string[], id: string): string {
  const esc = id.replace(/\$/g, '\\$');
  const top = new RegExp(`^(class|function|const|let|var) ${esc}\\b`);
  const listed = new RegExp(`^\\s+${esc} = `);
  let start = lines.findIndex((l) => top.test(l));
  if (start < 0) start = lines.findIndex((l) => listed.test(l));
  if (start < 0) throw new Error(`definition of ${id} not found in three section`);
  if (listed.test(lines[start] ?? '')) return lines[start] ?? '';
  let end = start + 1;
  while (end < lines.length && !/^(class|function|const|let|var) /.test(lines[end] ?? '')) end++;
  return lines.slice(start, end).join('\n');
}

export function verifyThreeIds(threeSource: string, ids: string[]): void {
  const lines = threeSource.split('\n');
  if (!/const Ea = '180'/.test(threeSource)) throw new Error('three section is not r180');
  for (const id of ids) {
    const entry = THREE_ID_MAP[id];
    if (!entry) throw new Error(`no mapping for free identifier ${id}`);
    if (!definitionExtent(lines, id).includes(entry.marker)) {
      throw new Error(`marker "${entry.marker}" not found in definition of ${id} (${entry.name})`);
    }
  }
}

export function buildImports(ids: string[]): string {
  const bySource = new Map<string, string[]>();
  for (const id of ids) {
    const entry = THREE_ID_MAP[id];
    if (!entry) throw new Error(`no mapping for ${id}`);
    const from = entry.from ?? 'three';
    const specs = bySource.get(from) ?? [];
    specs.push(entry.name === id ? id : `${entry.name} as ${id}`);
    bySource.set(from, specs);
  }
  return [...bySource]
    .map(([from, specs]) => `import {\n  ${specs.sort().join(',\n  ')},\n} from '${from}';`)
    .join('\n');
}

export function stripThree(appSource: string, threeSource: string): string {
  const free = findFreeIdentifiers(appSource);
  const mapped = Object.keys(THREE_ID_MAP).sort();
  const missing = free.filter((id) => !THREE_ID_MAP[id]);
  const unused = mapped.filter((id) => !free.includes(id));
  if (missing.length || unused.length) {
    throw new Error(`free ids mismatch; unmapped: [${missing}] unused map entries: [${unused}]`);
  }
  verifyThreeIds(threeSource, free);
  return `${buildImports(free)}\n${appSource}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [appPath, threePath, outPath] = process.argv.slice(2);
  if (!appPath || !threePath || !outPath) {
    console.error('usage: strip-three.ts <app-section.js> <three-section.js> <out.js>');
    process.exit(2);
  }
  const out = stripThree(readFileSync(appPath, 'utf8'), readFileSync(threePath, 'utf8'));
  writeFileSync(outPath, out);
  console.log(`strip-three: ${Object.keys(THREE_ID_MAP).length} ids verified -> ${outPath}`);
}
