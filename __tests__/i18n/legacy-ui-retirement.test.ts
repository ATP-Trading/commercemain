// @vitest-environment node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const retiredFiles = [
  'components/membership/membership-analytics-dashboard.tsx',
  'components/membership/membership-notifications.tsx',
  'components/search/predictive-search.tsx',
  'components/test/I18nTest.tsx',
  'components/ui/localized-currency.tsx',
  'src/i18n/I18nErrorBoundary.tsx',
  'src/i18n/I18nReady.tsx',
  'src/i18n/safe-translate.ts',
];
const withoutExtension = (file: string) => file.slice(0, -extname(file).length);
const retiredModules = new Set(retiredFiles.map(file => withoutExtension(resolve(root, file))));

function sourceFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    // Do not follow symlinks or descend into generated/vendor directories.
    if (entry.isSymbolicLink() || ['node_modules', '.git', '.next'].includes(entry.name)) return [];
    const file = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(file);
    return /\.[cm]?[jt]sx?$/.test(entry.name) ? [file] : [];
  });
}

const sources = [
  ...['app', 'components', 'hooks', 'lib', 'src', 'scripts', '__tests__', 'types', '.github']
    .flatMap(directory => sourceFiles(resolve(root, directory))),
  ...readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isFile() && /\.[cm]?[jt]sx?$/.test(entry.name))
    .map(entry => resolve(root, entry.name)),
];

describe('Unused legacy translation UI retirement', () => {
  it.each(retiredFiles)('removes only the retired %s implementation', file => {
    expect(existsSync(resolve(root, file))).toBe(false);
  });

  it('leaves no imports or re-exports in application code, tests or scripts', () => {
    const offenders: string[] = [];
    expect(sources.length).toBeGreaterThan(0);
    for (const file of sources) {
      const { importedFiles } = ts.preProcessFile(readFileSync(file, 'utf8'), true, true);
      for (const imported of importedFiles) {
        const specifier = imported.fileName;
        const absolute = specifier.startsWith('@/') ? resolve(root, specifier.slice(2))
          : specifier.startsWith('.') ? resolve(dirname(file), specifier) : null;
        if (!absolute) continue;
        const normalized = /\.[cm]?[jt]sx?$/.test(absolute) ? withoutExtension(absolute) : absolute;
        if (retiredModules.has(normalized)) offenders.push(`${relative(root, file)}: ${specifier}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
