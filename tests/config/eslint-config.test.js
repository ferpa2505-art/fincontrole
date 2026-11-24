import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('eslint.config.js configuration', () => {
  const eslintPath = resolve('C:/Users/ferpa/fincontrole/eslint.config.js');
  let eslintConfig;

  beforeAll(() => {
    eslintConfig = readFileSync(eslintPath, 'utf-8');
  });

  it('should exist and be a valid ES module config', () => {
    expect(eslintConfig).toContain('export default');
  });

  it('should use @eslint/js for recommended rules', () => {
    expect(eslintConfig).toContain('@eslint/js');
    expect(eslintConfig).toContain('js.configs.recommended');
  });

  it('should configure for ES modules', () => {
    expect(eslintConfig).toContain('ecmaVersion');
    expect(eslintConfig).toContain('sourceType');
  });

  it('should include globals for browser and node', () => {
    expect(eslintConfig).toContain('globals');
    expect(eslintConfig).toContain('browser');
    expect(eslintConfig).toContain('node');
  });

  it('should have rules for console.log prevention', () => {
    expect(eslintConfig).toContain('no-console');
  });

  it('should have strict JS rules configured', () => {
    expect(eslintConfig).toContain('no-var');
    expect(eslintConfig).toContain('prefer-const');
    expect(eslintConfig).toContain('eqeqeq');
  });

  it('should ignore dist and node_modules', () => {
    expect(eslintConfig).toContain('ignores');
    expect(eslintConfig).toContain('dist');
    expect(eslintConfig).toContain('node_modules');
  });
});
