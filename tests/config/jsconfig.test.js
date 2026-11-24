import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('jsconfig.json configuration', () => {
  const jsconfigPath = resolve('C:/Users/ferpa/fincontrole/jsconfig.json');
  let jsconfig;

  beforeAll(() => {
    jsconfig = JSON.parse(readFileSync(jsconfigPath, 'utf-8'));
  });

  it('should exist and be valid JSON', () => {
    expect(jsconfig).toBeDefined();
  });

  it('should have compilerOptions', () => {
    expect(jsconfig.compilerOptions).toBeDefined();
  });

  it('should target ES2022 or later', () => {
    expect(jsconfig.compilerOptions.target).toBeDefined();
    expect(['ES2022', 'ES2023', 'ESNext'].includes(jsconfig.compilerOptions.target)).toBe(true);
  });

  it('should use ESNext module system', () => {
    expect(jsconfig.compilerOptions.module).toBe('ESNext');
  });

  it('should have moduleResolution set to bundler', () => {
    expect(jsconfig.compilerOptions.moduleResolution).toBe('bundler');
  });

  it('should enable checkJs for type checking', () => {
    expect(jsconfig.compilerOptions.checkJs).toBe(true);
  });

  it('should have path mappings for src aliases', () => {
    expect(jsconfig.compilerOptions.paths).toBeDefined();
    expect(jsconfig.compilerOptions.paths['@/*']).toContain('src/*');
    expect(jsconfig.compilerOptions.paths['@schemas/*']).toContain('src/schemas/*');
    expect(jsconfig.compilerOptions.paths['@utils/*']).toContain('src/utils/*');
    expect(jsconfig.compilerOptions.paths['@services/*']).toContain('src/services/*');
    expect(jsconfig.compilerOptions.paths['@components/*']).toContain('src/components/*');
    expect(jsconfig.compilerOptions.paths['@stores/*']).toContain('src/stores/*');
    expect(jsconfig.compilerOptions.paths['@types/*']).toContain('src/types/*');
  });

  it('should have baseUrl set to .', () => {
    expect(jsconfig.compilerOptions.baseUrl).toBe('.');
  });

  it('should enable strict type checking options', () => {
    expect(jsconfig.compilerOptions.strict).toBe(true);
    expect(jsconfig.compilerOptions.noImplicitAny).toBe(true);
    expect(jsconfig.compilerOptions.noImplicitReturns).toBe(true);
    expect(jsconfig.compilerOptions.noUnusedLocals).toBe(true);
    expect(jsconfig.compilerOptions.noUnusedParameters).toBe(true);
  });
});
