// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { createChecks, main, runChecks } from '../../scripts/run-comprehensive-tests';

const emptyFiles = [
  '__tests__/components/enhanced-member-pricing.test.tsx',
  '__tests__/components/membership-renewal-system.test.tsx',
  '__tests__/membership/membership-i18n.test.tsx',
  '__tests__/services/admin-membership-service.test.ts',
  'lib/utils/membership-i18n.test.ts',
];

describe('truthful verification entry points', () => {
  it.each(emptyFiles)('removes the zero-assertion placeholder %s instead of skipping it', file => {
    expect(fs.existsSync(file)).toBe(false);
  });
  it('preserves the separate Playwright suite without loading it as Vitest', () => {
    const config = fs.readFileSync('vitest.config.ts', 'utf8');
    expect(config).toContain("exclude: [...configDefaults.exclude, '__tests__/e2e/**']");
    expect(fs.existsSync('__tests__/e2e/storefront-guest-routes.spec.ts')).toBe(true);
    expect(config).not.toContain('passWithNoTests');
  });
  it('makes lint independently runnable without relaxing the old rules', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    expect(pkg.scripts.lint).toBe('eslint . --no-fix');
    const config = fs.readFileSync('eslint.config.mjs', 'utf8');
    expect(config).toContain("compat.extends('next/core-web-vitals', 'next/typescript')");
    expect(config).not.toMatch(/rules\s*:/);
    expect(fs.existsSync('.eslintrc.json')).toBe(false);
  });
  it('runs one unfiltered Vitest command, not duplicate shell-glob subsets', () => {
    expect(createChecks().map(c => c.name)).toHaveLength(3);
    expect(createChecks()[2]?.args).toEqual(['run']);
    expect(createChecks(true)).toHaveLength(4);
  });
  it('reports failures and still executes every requested check', () => {
    const execute = vi.fn().mockReturnValueOnce({ status: 1 }).mockReturnValue({ status: 0 });
    const report = runChecks(createChecks(), execute);
    expect(execute).toHaveBeenCalledTimes(3);
    expect(report.exitCode).toBe(1);
    expect(report.results.map(r => r.exitCode)).toEqual([1, 0, 0]);
  });
  it('does not turn a terminated process into success', () => {
    expect(runChecks(createChecks(), () => ({ status: null })).exitCode).toBe(1);
  });
  it('does not turn an execution exception into success', () => {
    expect(runChecks(createChecks(), () => { throw new Error('start failed'); }).exitCode).toBe(1);
  });
  it('requires a nonempty set of checks', () => {
    expect(runChecks([], () => ({ status: 0 })).exitCode).toBe(1);
  });
  it('returns zero only when every requested check passes', () => {
    expect(runChecks(createChecks(), () => ({ status: 0 })).exitCode).toBe(0);
  });
  it('does not execute browser checks without an explicit target', () => {
    vi.stubEnv('TEST_BASE_URL', '');
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    try { expect(main(['--browser'])).toBe(1); }
    finally { log.mockRestore(); vi.unstubAllEnvs(); }
  });
  it('keeps all ordinary test commands free of literal shell glob filters', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    for (const name of ['test:components', 'test:accessibility', 'test:membership', 'test:webhooks']) {
      expect(pkg.scripts[name]).not.toContain('**');
    }
    expect(path.basename(createChecks()[0]!.file)).toBe('eslint.js');
  });
});
