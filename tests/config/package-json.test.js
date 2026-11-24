import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('package.json configuration', () => {
  const packagePath = resolve('C:/Users/ferpa/fincontrole/package.json');
  let packageJson;

  beforeAll(() => {
    packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
  });

  it('should exist and be valid JSON', () => {
    expect(packageJson).toBeDefined();
    expect(packageJson.name).toBe('fincontrole');
    expect(packageJson.version).toBeDefined();
    expect(packageJson.type).toBe('module');
  });

  it('should have required runtime dependencies', () => {
    const deps = packageJson.dependencies || {};
    expect(deps.idb).toBeDefined();
    expect(deps.zod).toBeDefined();
    // chart.js is dynamically imported, so it's optional as runtime dep
  });

  it('should have required dev dependencies', () => {
    const devDeps = packageJson.devDependencies || {};
    expect(devDeps.eslint).toBeDefined();
    expect(devDeps['@eslint/js']).toBeDefined();
    expect(devDeps.prettier).toBeDefined();
    expect(devDeps.vitest).toBeDefined();
    expect(devDeps['@vitest/coverage-v8']).toBeDefined();
    expect(devDeps.jsdom).toBeDefined();
    expect(devDeps.globals).toBeDefined();
    expect(devDeps.vite).toBeDefined();
  });

  it('should have test script configured', () => {
    const scripts = packageJson.scripts || {};
    expect(scripts.test).toBeDefined();
    expect(scripts['test:coverage']).toBeDefined();
  });

  it('should have lint and format scripts', () => {
    const scripts = packageJson.scripts || {};
    expect(scripts.lint).toBeDefined();
    expect(scripts.format).toBeDefined();
  });

  it('should have build script for production', () => {
    const scripts = packageJson.scripts || {};
    expect(scripts.build).toBeDefined();
  });
});
