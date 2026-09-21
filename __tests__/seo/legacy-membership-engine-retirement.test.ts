// @vitest-environment node
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import retired from '../__mocks__/retired-membership-files.json';

const root = process.cwd();
const removed = new Set([...retired.code, ...retired.tests].map(file => path.resolve(root, file)));
const removedDirectories = new Set<string>();
for (const file of removed) {
  for (let dir = path.dirname(file); dir.startsWith(root); dir = path.dirname(dir)) {
    removedDirectories.add(dir);
    if (dir === root) break;
  }
}
function sourceFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(file) : /\.[cm]?[jt]sx?$/.test(entry.name) ? [file] : [];
  });
}

describe('custom membership engine retirement; current storefront remains separate', () => {
  it('removes the audited implementation island, not similarly named shared types', () => {
    expect(retired.code).toHaveLength(41);
    for (const file of retired.code) expect(existsSync(file), file).toBe(false);
    for (const file of ['lib/constants/membership.ts', 'lib/types/membership.ts', 'lib/utils/membership-i18n.ts']) {
      expect(existsSync(file), file).toBe(true);
    }
  });

  it('retires only the named tests dedicated to removed implementations', () => {
    expect(retired.tests).toHaveLength(13);
    for (const file of retired.tests) expect(existsSync(file), file).toBe(false);
  });

  it('has no imports, re-exports, requires, type imports or stale mocks of retired files', () => {
    // Virtual existence allows the resolver to detect missing directory-index imports too.
    const host: ts.ModuleResolutionHost = {
      ...ts.sys,
      fileExists: file => removed.has(path.resolve(file)) || ts.sys.fileExists(file),
      directoryExists: dir => removedDirectories.has(path.resolve(dir)) || ts.sys.directoryExists(dir),
      readFile: file => removed.has(path.resolve(file)) ? '' : ts.sys.readFile(file),
    };
    const read = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile);
    expect(read.error).toBeUndefined();
    const config = ts.parseJsonConfigFileContent(read.config, ts.sys, root);
    const violations: string[] = [];
    const files = ['app', 'components', 'hooks', 'lib', 'src', 'scripts', '__tests__'].flatMap(sourceFiles);
    for (const file of files) {
      const ast = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
      function visit(node: ts.Node) {
        let spec: ts.Node | undefined;
        if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) spec = node.moduleSpecifier;
        if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) spec = node.moduleReference.expression;
        if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) spec = node.argument.literal;
        if (ts.isCallExpression(node)) {
          if (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require')) spec = node.arguments[0];
          if (ts.isPropertyAccessExpression(node.expression) && ['vi', 'jest'].includes(node.expression.expression.getText(ast)) && ['mock', 'doMock', 'unmock', 'doUnmock', 'importActual', 'importMock'].includes(node.expression.name.text)) spec = node.arguments[0];
        }
        if (spec && ts.isStringLiteralLike(spec)) {
          const resolved = ts.resolveModuleName(spec.text, path.resolve(file), config.options, host).resolvedModule;
          if (resolved && removed.has(path.resolve(resolved.resolvedFileName))) violations.push(`${file}: ${spec.text}`);
        }
        ts.forEachChild(node, visit);
      }
      visit(ast);
    }
    expect(violations).toEqual([]);
  });

  it('retains the actual OAuth, Appstle, session-bound status, pricing and cart entry points', () => {
    for (const file of [
      'hooks/use-customer-oauth.ts', 'hooks/use-membership.ts', 'hooks/use-storefront-membership-pricing.ts',
      'lib/shopify/customer-account-oauth.ts', 'lib/shopify/appstle-membership.ts',
      'lib/shopify/membership-entitlement.ts', 'lib/shopify/membership-purchase.ts',
      'app/api/membership/status/route.ts', 'app/[locale]/account/membership/page.tsx',
      'components/cart/actions.ts', 'components/cart/cart-context.tsx',
      'components/membership/member-pricing.tsx', 'components/membership/membership-badge.tsx',
    ]) expect(existsSync(file), file).toBe(true);
  });

  it('keeps retired cron endpoints dependency-free and unable to restart jobs', () => {
    for (const cadence of ['daily', 'hourly', 'weekly']) {
      const file = `app/api/cron/membership/${cadence}/route.ts`;
      const text = readFileSync(file, 'utf8');
      const ast = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
      const imports: string[] = [];
      const calls: string[] = [];
      function visit(node: ts.Node) {
        if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier)) imports.push(node.moduleSpecifier.text);
        if (ts.isCallExpression(node)) calls.push(node.expression.getText(ast));
        ts.forEachChild(node, visit);
      }
      visit(ast);
      expect(imports).toEqual(['next/server']);
      expect(calls).toEqual(['NextResponse.json', 'NextResponse.json']);
      expect(text).toContain('status: 404');
    }
  });
});
