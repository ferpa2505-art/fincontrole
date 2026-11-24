import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('vitest.config.js configuration', () => {
  const vitestPath = resolve('C:/Users/ferpa/fincontrole/vitest.config.js');
  let vitestConfig;

  beforeAll(() => {
    vitestConfig = readFileSync(vitestPath, 'utf-8');
  });

  it('should exist and be a valid ES module config', () => {
    expect(vitestConfig).toContain('export default');
  });

  it('should use jsdom environment', () => {
    expect(vitestConfig).toContain('environment');
    expect(vitestConfig).toContain('jsdom');
  });

  it('should include coverage with @vitest/coverage-v8', () => {
    expect(vitestConfig).toContain('coverage');
    expect(vitestConfig).toContain('@vitest/coverage-v8');
  });

  it('should have 80% coverage thresholds', () => {
    expect(vitestConfig).toContain('lines');
    expect(vitestConfig).toContain('80');
    expect(vitestConfig).toContain('branches');
    expect(vitestConfig).toContain('functions');
    expect(vitestConfig).toContain('statements');
  });

  it('should include globals', () => {
    expect(vitestConfig).toContain('globals');
  });

  it('should configure test files pattern', () => {
    expect(vitestConfig).toContain('include');
    expect(vitestConfig).toContain('tests/**/*.test.js');
  });

  it('should set up environment for PWA testing', () => {
    expect(vitestConfig).toContain('setupFiles');
  });
});
