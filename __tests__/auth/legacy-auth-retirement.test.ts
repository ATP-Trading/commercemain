// @vitest-environment node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const root = process.cwd();
const retiredFiles = [
  'hooks/use-customer.ts',
  'lib/auth-utils.ts',
  'lib/shopify/customer-account.ts',
  'lib/shopify/customer-account-server.ts',
];
const retiredModules = retiredFiles.map(file => resolve(root, file).replace(/\.ts$/, ''));
const boundary = vi.hoisted(() => ({ cookies: vi.fn(), headers: vi.fn() }));
vi.mock('next/headers', () => boundary);

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(file);
    return /\.[cm]?[jt]sx?$/.test(entry.name) && !/\.(test|spec)\.[cm]?[jt]sx?$/.test(entry.name) ? [file] : [];
  });
}

const runtimeSources = [
  ...['app', 'components', 'hooks', 'lib', 'src'].flatMap(directory => sourceFiles(resolve(root, directory))),
  ...readdirSync(root).filter(file => /\.[cm]?[jt]sx?$/.test(file)).map(file => resolve(root, file)),
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Unexpected network access in legacy auth test')));
});
afterEach(() => vi.unstubAllGlobals());

describe('Legacy authentication retirement', () => {
  it.each(retiredFiles)('does not retain the obsolete %s implementation', file => {
    expect(existsSync(resolve(root, file))).toBe(false);
  });

  it('has no runtime imports or re-exports of the retired modules', () => {
    const offenders: string[] = [];
    expect(runtimeSources.length).toBeGreaterThan(0);
    for (const file of runtimeSources) {
      const { importedFiles } = ts.preProcessFile(readFileSync(file, 'utf8'), true, true);
      for (const imported of importedFiles) {
        const specifier = imported.fileName;
        const absolute = specifier.startsWith('@/') ? resolve(root, specifier.slice(2))
          : specifier.startsWith('.') ? resolve(dirname(file), specifier) : null;
        if (!absolute) continue;
        const normalized = /\.[cm]?[jt]sx?$/.test(absolute) ? absolute.slice(0, -extname(absolute).length) : absolute;
        if (retiredModules.includes(normalized)) offenders.push(`${relative(root, file)}: ${specifier}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('does not call the retired hook or password-auth endpoints from runtime code', () => {
    const offenders = runtimeSources.filter(file => {
      const source = readFileSync(file, 'utf8');
      return /\buseCustomer\s*\(/.test(source) || /\/api\/customer\/(login|logout|register|password-reset)(?:[\s'"`?#]|$)/.test(source);
    }).map(file => relative(root, file));
    expect(offenders).toEqual([]);
  });

  it('does not call the retired legacy customer API helpers', () => {
    const retiredHelpers = new Set([
      'customerAccountFetch', 'createCustomerServer', 'createCustomerAccessTokenServer',
      'deleteCustomerAccessTokenServer', 'getCustomerServer', 'updateCustomerServer',
      'recoverCustomerPasswordServer',
    ]);
    const offenders: string[] = [];
    for (const file of runtimeSources) {
      const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
      function visit(node: ts.Node): void {
        if (ts.isCallExpression(node)) {
          const name = ts.isIdentifier(node.expression) ? node.expression.text
            : ts.isPropertyAccessExpression(node.expression) ? node.expression.name.text : null;
          if (name && retiredHelpers.has(name)) {
            const line = source.getLineAndCharacterOfPosition(node.getStart()).line + 1;
            offenders.push(`${relative(root, file)}:${line}: ${name}`);
          }
        }
        ts.forEachChild(node, visit);
      }
      visit(source);
    }
    expect(offenders).toEqual([]);
  });
});

const compatibilityRoutes = [
  { name: 'login', load: () => import('@/app/api/customer/login/route'), redirect: '/auth/login' },
  { name: 'logout', load: () => import('@/app/api/customer/logout/route'), redirect: '/api/auth/logout' },
  { name: 'register', load: () => import('@/app/api/customer/register/route'), redirect: '/signup' },
  { name: 'password-reset', load: () => import('@/app/api/customer/password-reset/route'), redirect: '/auth/login' },
];

describe('Retired API compatibility responses', () => {
  it.each(compatibilityRoutes)('$name remains a non-mutating 410 response', async route => {
    const endpoint = await route.load();
    const response = await endpoint.POST();
    expect(response.status).toBe(410);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(response.headers.get('set-cookie')).toBeNull();
    expect(response.headers.get('location')).toBeNull();
    const body = await response.json();
    expect(body).toMatchObject({ error: expect.any(String), message: expect.any(String), redirect: route.redirect });
    expect(body.error.length).toBeGreaterThan(0);
    expect(body.message.length).toBeGreaterThan(0);
    expect(fetch).not.toHaveBeenCalled();
    expect(boundary.cookies).not.toHaveBeenCalled();
    expect(boundary.headers).not.toHaveBeenCalled();
  });
});
