// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';
import { afterEach, describe, expect, it, vi } from 'vitest';

const retired = [
  'components/admin/admin-auth-guard.tsx',
  'components/admin/admin-layout.tsx',
  'components/admin/admin-membership-dashboard.tsx',
  'components/admin/membership-analytics-reporting.tsx',
  'components/admin/membership-analytics.tsx',
  'components/admin/membership-details-modal.tsx',
  'components/admin/membership-lifecycle-management.tsx',
  'components/admin/membership-management.tsx',
  'components/admin/membership-search.tsx',
  'lib/services/admin-membership-service.ts',
];
const commands = {
  'deploy:validate': 'scripts/deploy-membership-system.js',
  'setup:shopify:metafields': 'scripts/setup-shopify-metafields.js',
  'setup:shopify:webhooks': 'scripts/setup-shopify-webhooks.js',
};
const root = process.cwd();
const read = (name: string) => fs.readFileSync(path.join(root, name), 'utf8');
function codeFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? codeFiles(full) : /\.[cm]?[jt]sx?$/.test(entry.name) ? [full] : [];
  });
}

describe('retired custom membership administration', () => {
  it.each(retired)('does not retain %s', name => {
    expect(fs.existsSync(path.join(root, name))).toBe(false);
  });

  it('has no imports, re-exports, require calls or mock targets for retired modules', () => {
    const stems = new Set(retired.map(name => path.join(root, name).replace(/\.[^.]+$/, '')));
    const references: string[] = [];
    for (const directory of ['app', 'components', 'hooks', 'lib', 'src', 'scripts', '__tests__']) {
      for (const file of codeFiles(path.join(root, directory))) {
        const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
        function visit(node: ts.Node) {
          let spec: ts.Node | undefined;
          if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) spec = node.moduleSpecifier;
          if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) spec = node.moduleReference.expression;
          if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) spec = node.argument.literal;
          if (ts.isCallExpression(node) && (
            node.expression.kind === ts.SyntaxKind.ImportKeyword ||
            (ts.isIdentifier(node.expression) && node.expression.text === 'require') ||
            (ts.isPropertyAccessExpression(node.expression) && ['mock', 'doMock'].includes(node.expression.name.text))
          )) spec = node.arguments[0];
          if (spec && ts.isStringLiteralLike(spec)) {
            const value = spec.text;
            const resolved = value.startsWith('@/') ? path.join(root, value.slice(2)) :
              value.startsWith('.') ? path.resolve(path.dirname(file), value) : null;
            if (resolved && stems.has(resolved.replace(/\.[cm]?[jt]sx?$/, ''))) references.push(`${path.relative(root, file)} -> ${value}`);
          }
          ts.forEachChild(node, visit);
        }
        visit(source);
      }
    }
    expect(references).toEqual([]);
  });

  it('does not offer the former public-password or local-storage admin gate in application code', () => {
    const hits = ['app', 'components', 'hooks', 'lib', 'src'].flatMap(directory =>
      codeFiles(path.join(root, directory)).filter(file => /NEXT_PUBLIC_ADMIN_PASSWORD|atp_admin_auth/.test(fs.readFileSync(file, 'utf8')))
    );
    expect(hits).toEqual([]);
  });
});

describe('retired setup and deployment commands fail without merchant side effects', () => {
  for (const [alias, script] of Object.entries(commands)) {
    it(`${alias} retains a direct compatibility entry point with no credential, network or file access`, () => {
      const blocked = vi.fn(() => { throw new Error('Retired command attempted a side effect'); });
      const error = vi.fn();
      const processDouble = {
        exitCode: 0,
        get env(): never { return blocked() as never; },
        exit: blocked,
      };
      vm.runInNewContext(read(script), {
        process: processDouble, console: { error }, require: blocked,
        fetch: blocked, setTimeout: blocked, setInterval: blocked,
      }, { timeout: 1000, filename: script });
      expect(processDouble.exitCode).toBe(1);
      expect(blocked).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0]?.[0]).toContain('RETIRED:');
      expect(error.mock.calls[0]?.[0]).toContain('No changes were made.');
      expect(error.mock.calls[0]?.[0]).toContain('not a deployment or health check');
    });

    it(`${alias} exits nonzero in an actual Node process with only dummy credentials`, () => {
      const result = spawnSync(process.execPath, [path.join(root, script)], {
        encoding: 'utf8', timeout: 5000,
        env: { SHOPIFY_STORE_DOMAIN: 'unused.invalid', SHOPIFY_ADMIN_ACCESS_TOKEN: 'test-only-not-a-token', NEXT_PUBLIC_SITE_URL: 'https://unused.invalid' },
      });
      expect(result.error).toBeUndefined();
      expect(result.status).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stderr).toContain('RETIRED:');
      expect(result.stderr).not.toContain('test-only-not-a-token');
      expect(JSON.parse(read('package.json')).scripts[alias]).toBe(`node ${script}`);
    });
  }

  it('removes commands for absent maintenance scripts and the stopped health endpoint', () => {
    const scripts = JSON.parse(read('package.json')).scripts;
    for (const name of [
      'validate:membership-data', 'cleanup:expired-sessions', 'archive:old-memberships',
      'update:membership-stats', 'analyze:performance', 'optimize:cache', 'review:rate-limits',
      'export:membership-data', 'import:membership-data', 'verify:membership-data',
      'sync:shopify-data', 'health:check',
    ]) expect(scripts).not.toHaveProperty(name);
    for (const command of Object.values(scripts) as string[]) {
      for (const match of command.matchAll(/\b(?:node|tsx)\s+(scripts\/[^\s]+\.[jt]s)\b/g)) {
        expect(fs.existsSync(path.join(root, match[1]!)), command).toBe(true);
      }
    }
  });
});

const notFound = vi.hoisted(() => vi.fn(() => { throw new Error('TEST_NOT_FOUND'); }));
vi.mock('next/navigation', () => ({ notFound }));
import RetiredAdminPage from '@/app/[locale]/admin/membership/page';
import * as lifecycle from '@/app/api/admin/membership/lifecycle/route';
import * as paid from '@/app/api/webhooks/shopify/orders/paid/route';
import * as customerUpdate from '@/app/api/webhooks/shopify/customers/update/route';
import * as health from '@/app/api/monitoring/membership/health/route';

afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });
describe('retained stopped routes do not reopen legacy administration', () => {
  it('keeps the admin page unavailable', () => {
    expect(() => RetiredAdminPage()).toThrow('TEST_NOT_FOUND');
    expect(notFound).toHaveBeenCalledTimes(1);
  });
  for (const [name, routes] of Object.entries({ lifecycle, paid, customerUpdate, health })) {
    it.each(['GET', 'POST'] as const)(`${name} %s stays a non-mutating 404`, async method => {
      const fetch = vi.fn(() => { throw new Error('Unexpected merchant request'); });
      vi.stubGlobal('fetch', fetch);
      const response = await routes[method]();
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: 'Not found' });
      expect(response.headers.get('set-cookie')).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
    });
  }
});
