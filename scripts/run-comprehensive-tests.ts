#!/usr/bin/env tsx
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type Check = { name: string; file: string; args: string[] };
export type Result = { name: string; exitCode: number; error?: string };
export type Execute = (check: Check) => { status: number | null; error?: Error };

export function createChecks(browser = false): Check[] {
  const checks: Check[] = [
    { name: 'ESLint (original rule policy)', file: 'node_modules/eslint/bin/eslint.js', args: ['.', '--no-fix'] },
    { name: 'TypeScript', file: 'node_modules/typescript/bin/tsc', args: ['--noEmit', '--incremental', 'false'] },
    { name: 'All default Vitest tests (not browser tests)', file: 'node_modules/vitest/vitest.mjs', args: ['run'] },
  ];
  if (browser) checks.push({ name: 'Guest SSR browser smoke only', file: 'node_modules/@playwright/test/cli.js', args: ['test'] });
  return checks;
}

export function runChecks(checks: Check[], execute: Execute): { results: Result[]; exitCode: number } {
  if (checks.length === 0) return { results: [], exitCode: 1 };
  const results = checks.map(check => {
    try {
      const result = execute(check);
      return { name: check.name, exitCode: result.error ? 1 : (result.status ?? 1), ...(result.error ? { error: result.error.message } : {}) };
    } catch (error) {
      return { name: check.name, exitCode: 1, error: error instanceof Error ? error.message : String(error) };
    }
  });
  return { results, exitCode: results.some(result => result.exitCode !== 0) ? 1 : 0 };
}

export function main(args = process.argv.slice(2)): number {
  if (args.some(arg => arg !== '--browser')) {
    console.error('Usage: tsx scripts/run-comprehensive-tests.ts [--browser]');
    return 1;
  }
  const browser = args.includes('--browser');
  if (browser && !process.env.TEST_BASE_URL) {
    console.error('Browser smoke NOT RUN: explicitly set TEST_BASE_URL to the authorized test deployment.');
    return 1;
  }
  const report = runChecks(createChecks(browser), check => {
    console.log(`\nRunning ${check.name}`);
    return spawnSync(process.execPath, [path.resolve(check.file), ...check.args], {
      stdio: 'inherit', shell: false, timeout: browser ? 600_000 : 300_000,
      env: { ...process.env, CI: 'true', NEXT_TELEMETRY_DISABLED: '1' },
    });
  });
  for (const result of report.results) console.log(`${result.exitCode === 0 ? 'PASS' : 'FAIL'}: ${result.name}${result.error ? `: ${result.error}` : ''}`);
  if (!browser) console.log('Browser smoke NOT RUN. Real OAuth sessions, membership discounts and checkout transactions are not certified by this command.');
  else console.log('Browser scope is guest server-rendered pages only; no real account, member entitlement, interactive cart or checkout certification.');
  return report.exitCode;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main();
