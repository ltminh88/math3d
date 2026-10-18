// Applies a reviewed rename map to recovered legacy code with ts-morph's language-service
// rename (scope-safe: follows bindings, never text). Used by phases 03-08.
//
// usage: tsx tools/recovery/apply-rename-map.ts <map.json> [--dry-run]
//
// map.json:
// {
//   "file": "src/legacy/legacy-save.js",
//   "renames": [
//     { "scopePath": "", "from": "Ga", "to": "createDefaultSave" },   // top-level binding
//     { "scopePath": "Ym", "from": "i", "to": "raw" },               // param/local of Ym
//     { "scopePath": "$m.scatter", "from": "t", "to": "nextRandom" } // local in a method
//   ]
// }
// scopePath = dot-joined names of the enclosing named functions/classes/methods/variables
// of the declaration ("" for module scope). Every other legacy chunk is loaded too, so a
// renamed export is renamed in the chunks importing it through the shims.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { type Identifier, Node, Project, type SourceFile, ts } from 'ts-morph';

export type RenameEntry = { scopePath: string; from: string; to: string };
export type RenameMap = { file: string; renames: RenameEntry[] };
export type RenameResult = { entry: RenameEntry; references: number };

const IDENT = /^[A-Za-z_$][\w$]*$/;

function scopeNameOf(node: Node): string | undefined {
  if (
    Node.isFunctionDeclaration(node) ||
    Node.isClassDeclaration(node) ||
    Node.isMethodDeclaration(node) ||
    Node.isGetAccessorDeclaration(node) ||
    Node.isSetAccessorDeclaration(node) ||
    Node.isVariableDeclaration(node) ||
    Node.isPropertyDeclaration(node)
  ) {
    return node.getName();
  }
  if (Node.isConstructorDeclaration(node)) return 'constructor';
  return undefined;
}

/** Dot path of named ancestors, excluding the declaration that owns `id` itself. */
export function scopePathOf(id: Identifier): string {
  const owner = id.getParent();
  const names: string[] = [];
  for (const anc of id.getAncestors()) {
    if (anc === owner) continue;
    const name = scopeNameOf(anc);
    if (name) names.unshift(name);
  }
  return names.join('.');
}

function isDeclarationName(id: Identifier): boolean {
  const p = id.getParent();
  return (
    (Node.isVariableDeclaration(p) ||
      Node.isFunctionDeclaration(p) ||
      Node.isClassDeclaration(p) ||
      Node.isParameterDeclaration(p) ||
      Node.isBindingElement(p)) &&
    p.getNameNode() === id
  );
}

function findDeclaration(sf: SourceFile, entry: RenameEntry): Identifier {
  const matches = sf
    .getDescendantsOfKind(ts.SyntaxKind.Identifier)
    .filter((id) => id.getText() === entry.from && isDeclarationName(id))
    .filter((id) => scopePathOf(id) === entry.scopePath);
  if (matches.length !== 1) {
    throw new Error(
      `${entry.scopePath || '<module>'}:${entry.from} matched ${matches.length} declarations (need 1)`,
    );
  }
  return matches[0] as Identifier;
}

function assertNoCollision(decl: Identifier, to: string): void {
  // Conservative: refuse if `to` is already spelled anywhere inside the declaring scope.
  const container =
    decl.getFirstAncestor((a) => Node.isFunctionLikeDeclaration(a) || Node.isClassDeclaration(a)) ??
    decl.getSourceFile();
  const clash = container
    .getDescendantsOfKind(ts.SyntaxKind.Identifier)
    .find((id) => id.getText() === to);
  if (clash) throw new Error(`"${to}" already used in scope (line ${clash.getStartLineNumber()})`);
}

export function applyRenameMap(map: RenameMap, root: string, dryRun: boolean): RenameResult[] {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { allowJs: true, noEmit: true, target: ts.ScriptTarget.ES2022 },
  });
  const target = join(root, map.file);
  project.addSourceFilesAtPaths([join(dirname(target), '**/*.js'), target]);
  const sf = project.getSourceFileOrThrow(target);
  const results: RenameResult[] = [];
  for (const entry of map.renames) {
    if (!IDENT.test(entry.to)) throw new Error(`invalid identifier "${entry.to}"`);
    const decl = findDeclaration(sf, entry);
    assertNoCollision(decl, entry.to);
    const references = decl.findReferencesAsNodes().length;
    decl.rename(entry.to);
    results.push({ entry, references });
  }
  if (!dryRun) project.saveSync();
  return results;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const mapPath = process.argv[2];
  if (!mapPath) {
    console.error('usage: apply-rename-map.ts <map.json> [--dry-run]');
    process.exit(2);
  }
  const dryRun = process.argv.includes('--dry-run');
  const map = JSON.parse(readFileSync(mapPath, 'utf8')) as RenameMap;
  for (const { entry, references } of applyRenameMap(map, process.cwd(), dryRun)) {
    console.log(
      `${entry.scopePath || '<module>'}: ${entry.from} -> ${entry.to} (${references} refs)`,
    );
  }
  console.log(dryRun ? 'dry run: nothing written' : 'saved');
}
