import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { applyRenameMap } from './apply-rename-map';

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), 'rename-map-'));
  mkdirSync(join(root, 'legacy/shims'), { recursive: true });
  writeFileSync(
    join(root, 'legacy/legacy-save.js'),
    [
      'const Ga = () => ({ version: 1 });',
      'function Ym(i) { const e = Ga(); return i ? e : null; }',
      'function Km(i) { return i + 1; }',
      'export { Ga, Ym };',
      '',
    ].join('\n'),
  );
  writeFileSync(join(root, 'legacy/shims/save.js'), "export * from '../legacy-save.js';\n");
  writeFileSync(
    join(root, 'legacy/legacy-ui.js'),
    "import { Ga } from './shims/save.js';\nlet ie = Ga();\nexport { ie };\n",
  );
  return root;
}

const read = (root: string, f: string) => readFileSync(join(root, 'legacy', f), 'utf8');

describe('applyRenameMap', () => {
  it('renames only the binding in the named scope and follows imports through shims', () => {
    const root = fixture();
    applyRenameMap(
      {
        file: 'legacy/legacy-save.js',
        renames: [
          { scopePath: '', from: 'Ga', to: 'createDefaultSave' },
          { scopePath: 'Ym', from: 'i', to: 'raw' },
        ],
      },
      root,
      false,
    );
    const save = read(root, 'legacy-save.js');
    expect(save).toContain(
      'function Ym(raw) { const e = createDefaultSave(); return raw ? e : null; }',
    );
    expect(save).toContain('function Km(i) { return i + 1; }'); // same spelling, other scope
    expect(read(root, 'legacy-ui.js')).toContain('let ie = createDefaultSave();');
  });

  it('dry run leaves files untouched', () => {
    const root = fixture();
    const before = read(root, 'legacy-save.js');
    const res = applyRenameMap(
      { file: 'legacy/legacy-save.js', renames: [{ scopePath: '', from: 'Ym', to: 'parseSave' }] },
      root,
      true,
    );
    expect(res[0]?.references).toBe(1); // the export specifier
    expect(read(root, 'legacy-save.js')).toBe(before);
  });

  it('refuses names that already exist in the scope and unknown declarations', () => {
    const root = fixture();
    const map = (from: string, to: string, scopePath = 'Ym') => ({
      file: 'legacy/legacy-save.js',
      renames: [{ scopePath, from, to }],
    });
    expect(() => applyRenameMap(map('i', 'e'), root, true)).toThrow(/already used/);
    expect(() => applyRenameMap(map('zz', 'q'), root, true)).toThrow(/matched 0/);
    expect(() => applyRenameMap(map('i', '1bad'), root, true)).toThrow(/invalid identifier/);
  });
});
