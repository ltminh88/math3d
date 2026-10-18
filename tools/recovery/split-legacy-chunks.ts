// Cuts the unminified app (one ES module) into per-group legacy chunks under src/legacy/.
//
// usage: tsx tools/recovery/split-legacy-chunks.ts <original-formatted.js> <unminified.js> <outDir>
//
// Group membership comes from the inventory line ranges of the ORIGINAL formatted app
// section: every top-level declarator there is tagged with its group by start line. In the
// unminified file each top-level statement takes the group of the names it declares; a
// statement that declares nothing (side-effect code) stays with the statement before it.
// Cross-group references become `import { x } from './shims/<group>.js'`; names a chunk
// owns and others read are exported. A write to another group's binding is an error, since
// imported ES bindings are read-only.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  type Identifier,
  Node,
  Project,
  type SourceFile,
  type Statement,
  SyntaxKind,
  ts,
} from 'ts-morph';
import { findFreeIdentifiers } from './strip-three';

export const GROUPS: Array<[number, string]> = [
  [1, 'config'],
  [155, 'world'],
  [1256, 'save'],
  [1335, 'quiz'],
  [1390, 'audio'],
  [1435, 'i18n'],
  [1674, 'map'],
  [1913, 'ui'],
  [2520, 'webmcp'],
];

const groupOfLine = (line: number) =>
  [...GROUPS].reverse().find(([start]) => line >= start)?.[1] ?? 'config';

function declaredNames(stmt: Statement): Identifier[] {
  if (Node.isVariableStatement(stmt)) {
    return stmt.getDeclarations().flatMap((d) => {
      const n = d.getNameNode();
      return Node.isIdentifier(n) ? [n] : n.getDescendantsOfKind(SyntaxKind.Identifier);
    });
  }
  if (Node.isFunctionDeclaration(stmt) || Node.isClassDeclaration(stmt)) {
    const n = stmt.getNameNode();
    return n ? [n] : [];
  }
  return [];
}

function load(project: Project, path: string): SourceFile {
  return project.createSourceFile(path, readFileSync(path, 'utf8'), { overwrite: true });
}

function isWrite(id: Identifier): boolean {
  const p = id.getParent();
  if (Node.isBinaryExpression(p) && p.getLeft() === id) {
    return (
      p.getOperatorToken().getKind() >= SyntaxKind.FirstAssignment &&
      p.getOperatorToken().getKind() <= SyntaxKind.LastAssignment
    );
  }
  return Node.isPrefixUnaryExpression(p) || Node.isPostfixUnaryExpression(p)
    ? [SyntaxKind.PlusPlusToken, SyntaxKind.MinusMinusToken].includes(p.getOperatorToken())
    : false;
}

export function splitLegacy(originalPath: string, unminifiedPath: string, outDir: string): void {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { allowJs: true, noEmit: true, target: ts.ScriptTarget.ES2022 },
  });
  const original = load(project, originalPath);
  const nameGroup = new Map<string, string>();
  for (const stmt of original.getStatements()) {
    for (const id of declaredNames(stmt))
      nameGroup.set(id.getText(), groupOfLine(id.getStartLineNumber()));
  }

  const src = load(project, unminifiedPath);
  const order = GROUPS.map(([, g]) => g);
  const owner = new Map<Node, string>(); // declaration identifier node -> group
  const chunks = new Map<string, Statement[]>(order.map((g) => [g, []]));
  const threeImports = new Map<string, string>(); // local name -> import line source
  let current = 'config';
  for (const stmt of src.getStatements()) {
    if (Node.isImportDeclaration(stmt)) {
      for (const spec of stmt.getNamedImports()) {
        threeImports.set(spec.getName(), stmt.getModuleSpecifierValue());
      }
      continue;
    }
    const names = declaredNames(stmt);
    const groups = new Set(names.map((n) => nameGroup.get(n.getText())).filter(Boolean));
    if (names.length && groups.size !== 1) {
      throw new Error(
        `cannot place statement at line ${stmt.getStartLineNumber()}: ${[...groups]}`,
      );
    }
    const g = (groups.values().next().value as string | undefined) ?? current;
    if (order.indexOf(g) < order.indexOf(current)) {
      throw new Error(
        `group order regressed at line ${stmt.getStartLineNumber()} (${current} -> ${g})`,
      );
    }
    current = g;
    chunks.get(g)?.push(stmt);
    for (const id of names) owner.set(id, g);
  }

  const imports = new Map<string, Map<string, Set<string>>>(order.map((g) => [g, new Map()]));
  const exportsOf = new Map<string, Set<string>>(order.map((g) => [g, new Set()]));
  const threeUsed = new Map<string, Set<string>>(order.map((g) => [g, new Set()]));
  for (const [g, stmts] of chunks) {
    for (const stmt of stmts) {
      for (const id of stmt.getDescendantsOfKind(SyntaxKind.Identifier)) {
        const parent = id.getParent();
        const symbol = Node.isShorthandPropertyAssignment(parent)
          ? parent.getValueSymbol() // `{ name }` refers to the variable, not the property
          : id.getSymbol();
        const decl = symbol?.getDeclarations()[0];
        if (!decl) continue;
        if (Node.isImportSpecifier(decl)) {
          threeUsed.get(g)?.add(decl.getName());
          continue;
        }
        const declId = (decl as Node & { getNameNode?: () => Node }).getNameNode?.();
        const from = declId ? owner.get(declId) : undefined;
        if (!from || from === g) continue;
        if (isWrite(id)) {
          throw new Error(
            `${g} writes ${id.getText()} owned by ${from} (line ${id.getStartLineNumber()})`,
          );
        }
        const byGroup = imports.get(g) as Map<string, Set<string>>;
        byGroup.set(from, (byGroup.get(from) ?? new Set()).add(id.getText()));
        exportsOf.get(from)?.add(id.getText());
      }
    }
  }

  mkdirSync(join(outDir, 'shims'), { recursive: true });
  for (const g of order) {
    const lines = [
      `// Legacy chunk "${g}" (recovered, mechanically split). Do not hand-edit; swap via shims/${g}.js.`,
    ];
    const bySource = new Map<string, string[]>();
    for (const name of [...(threeUsed.get(g) ?? [])].sort()) {
      const from = threeImports.get(name) as string;
      bySource.set(from, [...(bySource.get(from) ?? []), name]);
    }
    for (const [from, names] of bySource)
      lines.push(`import { ${names.join(', ')} } from '${from}';`);
    for (const dep of order) {
      const names = imports.get(g)?.get(dep);
      if (names) lines.push(`import { ${[...names].sort().join(', ')} } from './shims/${dep}.js';`);
    }
    lines.push('', ...(chunks.get(g) ?? []).map((s) => s.getText()));
    const exp = [...(exportsOf.get(g) ?? [])].sort();
    if (exp.length) lines.push('', `export { ${exp.join(', ')} };`);
    writeFileSync(join(outDir, `legacy-${g}.js`), `${lines.join('\n')}\n`);
    writeFileSync(
      join(outDir, 'shims', `${g}.js`),
      `// Shim for the "${g}" group: re-point this export to the recovered TS module when it lands.\nexport * from '../legacy-${g}.js';\n`,
    );
    console.log(`legacy-${g}.js: ${chunks.get(g)?.length} statements, exports ${exp.length}`);
  }
  verifyNoFreeIdentifiers(outDir, order);
}

/** Every chunk must resolve all its names through imports; a free id means a missed import. */
function verifyNoFreeIdentifiers(outDir: string, order: string[]): void {
  for (const g of order) {
    const code = readFileSync(join(outDir, `legacy-${g}.js`), 'utf8');
    const free = findFreeIdentifiers(code);
    if (free.length) throw new Error(`legacy-${g}.js has unresolved identifiers: ${free}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [originalPath, unminifiedPath, outDir] = process.argv.slice(2);
  if (!originalPath || !unminifiedPath || !outDir) {
    console.error('usage: split-legacy-chunks.ts <original-formatted.js> <unminified.js> <outDir>');
    process.exit(2);
  }
  splitLegacy(originalPath, unminifiedPath, outDir);
}
