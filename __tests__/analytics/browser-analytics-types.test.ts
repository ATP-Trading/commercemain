import { resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const declarationPath = resolve(process.cwd(), 'lib/types/browser-analytics.d.ts');
const fixturePath = resolve(process.cwd(), '__tests__/analytics/browser-analytics-fixture.ts');
const guardedConsumer = `
export {};
if (typeof window !== 'undefined' && window.gtag) {
  window.gtag('event', 'view_cart', { custom_parameter_locale: 'ar' });
}
`;

function checkTypes(source: string, includeSharedDeclaration: boolean) {
  const options: ts.CompilerOptions = {
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    lib: ['lib.es2020.d.ts', 'lib.dom.d.ts'],
    // Isolate the shared declaration from component files and ambient test types.
    types: [],
  };
  const host = ts.createCompilerHost(options);
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (fileName, languageVersion, onError, shouldCreateNewSourceFile) =>
    resolve(fileName) === fixturePath
      ? ts.createSourceFile(fileName, source, languageVersion, true)
      : getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
  const rootNames = includeSharedDeclaration
    ? [fixturePath, declarationPath]
    : [fixturePath];
  return ts.getPreEmitDiagnostics(ts.createProgram(rootNames, options, host));
}

const summarize = (diagnostics: readonly ts.Diagnostic[]) =>
  diagnostics.map(diagnostic => ({
    code: diagnostic.code,
    message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
  }));

describe('Shared browser analytics types', () => {
  it('reproduces TS2339 when the shared declaration is absent', () => {
    const errors = checkTypes(guardedConsumer, false);
    expect(errors).toHaveLength(2);
    expect(errors.every(error => error.code === 2339)).toBe(true);
  });

  it('types cart analytics without importing any membership component', () => {
    expect(summarize(checkTypes(guardedConsumer, true))).toEqual([]);
  });

  it('keeps gtag optional, so callers must guard against it being absent', () => {
    const errors = checkTypes("export {}; window.gtag('event', 'view_cart', {});", true);
    expect(errors).toHaveLength(1);
    expect(errors[0]?.code).toBe(2722);
  });
});
