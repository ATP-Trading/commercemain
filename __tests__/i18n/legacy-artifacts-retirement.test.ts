// @vitest-environment node
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const removed = [
  'components/membership/atp-membership-dashboard.tsx',
  'src/i18n/types.ts',
  'src/i18n/lingui-types.d.ts',
  'types/lingui.d.ts',
  'lingui.config.ts',
  'src/locales/ar/messages.js',
  'src/locales/ar/messages.po',
  'src/locales/ar/messages_hero.po',
  'src/locales/en/messages.js',
  'src/locales/en/messages.po',
];
const banned = new Set(removed.map(file => resolve(root, file).replace(/\.[cm]?[jt]sx?$/, '')));
function sources(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap(item => {
    if (item.isSymbolicLink()) return [];
    const file = join(dir, item.name);
    return item.isDirectory() ? sources(file) : /\.[cm]?[jt]sx?$/.test(item.name) ? [file] : [];
  });
}

describe('Retired legacy translation artifacts and orphan dashboard', () => {
  it.each(removed)('does not retain %s', file => expect(existsSync(resolve(root, file))).toBe(false));
  it('has no imports or ambient stubs for the retired engine or removed modules', () => {
    const files = [
      ...['app', 'components', 'hooks', 'lib', 'src', 'types', '__tests__', 'scripts'].flatMap(dir => sources(resolve(root, dir))),
      ...readdirSync(root).filter(file => /\.[cm]?[jt]sx?$/.test(file)).map(file => resolve(root, file)),
    ];
    const failures: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      for (const item of ts.preProcessFile(text, true, true).importedFiles) {
        const name = item.fileName;
        const target = name.startsWith('@/') ? resolve(root, name.slice(2)) : name.startsWith('.') ? resolve(dirname(file), name) : null;
        if (name.startsWith('@lingui/') || (target && banned.has(target.replace(/\.[cm]?[jt]sx?$/, '')))) failures.push(`${relative(root, file)}: ${name}`);
      }
      const ast = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
      function visit(node: ts.Node) {
        if (ts.isModuleDeclaration(node) && ts.isStringLiteral(node.name) && node.name.text.startsWith('@lingui/')) failures.push(`${relative(root, file)}: ambient ${node.name.text}`);
        ts.forEachChild(node, visit);
      }
      visit(ast);
    }
    expect(files.length).toBeGreaterThan(0);
    expect(failures).toEqual([]);
  });
  it('preserves the shared Tamara custom-element contract', () => {
    const text = readFileSync(resolve(root, 'global.d.ts'), 'utf8');
    expect(text).toContain('"tamara-widget": {');
    for (const field of ['id?: string;', 'type?: string;', 'amount?: string;', 'config?: string;', '"inline-type"?: string;', 'children?: ReactNode;']) expect(text).toContain(field);
    expect(existsSync(resolve(root, 'types/tamara-widget.d.ts'))).toBe(true);
  });
  it('keeps current translation catalogs and account membership route available', () => {
    for (const file of ['messages/en.json', 'messages/ar.json', 'src/i18n/routing.ts', 'src/i18n/request.ts', 'src/i18n/navigation.ts', 'app/[locale]/account/membership/page.tsx']) expect(existsSync(resolve(root, file))).toBe(true);
    expect(readFileSync(resolve(root, 'tsconfig.json'), 'utf8')).not.toContain('src/i18n/lingui-types.d.ts');
  });
});
