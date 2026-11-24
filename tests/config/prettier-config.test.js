import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('.prettierrc configuration', () => {
  const prettierPath = resolve('C:/Users/ferpa/fincontrole/.prettierrc');
  let prettierConfig;

  beforeAll(() => {
    prettierConfig = JSON.parse(readFileSync(prettierPath, 'utf-8'));
  });

  it('should exist and be valid JSON', () => {
    expect(prettierConfig).toBeDefined();
  });

  it('should use single quotes', () => {
    expect(prettierConfig.singleQuote).toBe(true);
  });

  it('should use trailing commas', () => {
    expect(prettierConfig.trailingComma).toBe('es5');
  });

  it('should use 2 spaces for indentation', () => {
    expect(prettierConfig.tabWidth).toBe(2);
    expect(prettierConfig.useTabs).toBe(false);
  });

  it('should have print width of 100', () => {
    expect(prettierConfig.printWidth).toBe(100);
  });

  it('should use semicolons', () => {
    expect(prettierConfig.semi).toBe(true);
  });

  it('should use bracket spacing', () => {
    expect(prettierConfig.bracketSpacing).toBe(true);
  });

  it('should not use arrow parens for single params', () => {
    expect(prettierConfig.arrowParens).toBe('avoid');
  });

  it('should have end of line lf', () => {
    expect(prettierConfig.endOfLine).toBe('lf');
  });
});
