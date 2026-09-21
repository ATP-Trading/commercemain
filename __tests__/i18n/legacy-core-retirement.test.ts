// @vitest-environment node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const retired = [
  'src/i18n/LinguiClientProvider.tsx',
  'src/i18n/dev-tools.ts',
  'src/i18n/index.ts',
  'src/i18n/message-utils.ts',
  'src/i18n/server.ts',
  'src/i18n/useSafeLingui.ts',
  'src/i18n/navigation-server.ts',
];
const modulePaths = new Set(retired.map(file => resolve(root, file).replace(/\.[cm]?[jt]sx?$/, '')));

function sources(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.isSymbolicLink()) return [];
    const file = join(directory, entry.name);
    return entry.isDirectory() ? sources(file) : /\.[cm]?[jt]sx?$/.test(entry.name) ? [file] : [];
  });
}

describe('Retired translation runtime boundary', () => {
  it.each(retired)('does not retain %s', file => {
    expect(existsSync(resolve(root, file))).toBe(false);
  });

  it('has no remaining imports or re-exports, including test and script consumers', () => {
    const files = [
      ...['app', 'components', 'hooks', 'lib', 'src', 'types', '__tests__', 'scripts'].flatMap(dir => sources(resolve(root, dir))),
      ...readdirSync(root).filter(file => /\.[cm]?[jt]sx?$/.test(file)).map(file => resolve(root, file)),
    ];
    expect(files.length).toBeGreaterThan(0);
    const offenders: string[] = [];
    for (const file of files) {
      const { importedFiles } = ts.preProcessFile(readFileSync(file, 'utf8'), true, true);
      for (const imported of importedFiles) {
        const name = imported.fileName;
        const absolute = name.startsWith('@/') ? resolve(root, name.slice(2)) : name.startsWith('.') ? resolve(dirname(file), name) : null;
        if (!absolute) continue;
        const normalized = /\.[cm]?[jt]sx?$/.test(absolute) ? absolute.slice(0, -extname(absolute).length) : absolute;
        if (modulePaths.has(normalized) || modulePaths.has(join(normalized, 'index'))) {
          offenders.push(`${relative(root, file)}: ${name}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
