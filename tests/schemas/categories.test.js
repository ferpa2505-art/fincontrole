import { describe, it, expect } from 'vitest';
import { CategorySchema, CategoryTypeSchema } from '@/schemas/categories.js';

describe('CategorySchema', () => {
  describe('valid categories', () => {
    it('should accept a valid income category', () => {
      const category = {
        id: 'cat-1',
        name: 'Salário',
        type: 'income',
        color: '#10B981',
        icon: 'briefcase',
        isDefault: false,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = CategorySchema.safeParse(category);
      expect(result.success).toBe(true);
    });

    it('should accept a valid expense category', () => {
      const category = {
        id: 'cat-2',
        name: 'Alimentação',
        type: 'expense',
        color: '#EF4444',
        icon: 'utensils',
        isDefault: true,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = CategorySchema.safeParse(category);
      expect(result.success).toBe(true);
    });

    it('should accept category with parent category', () => {
      const category = {
        id: 'cat-3',
        name: 'Supermercado',
        type: 'expense',
        color: '#EF4444',
        icon: 'shopping-cart',
        parentId: 'cat-2',
        isDefault: false,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = CategorySchema.safeParse(category);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid categories', () => {
    it('should reject missing required fields', () => {
      const category = {
        name: 'Test',
      };
      const result = CategorySchema.safeParse(category);
      expect(result.success).toBe(false);
    });

    it('should reject invalid type', () => {
      const category = {
        id: 'cat-1',
        name: 'Test',
        type: 'invalid',
        color: '#000000',
        icon: 'tag',
        isDefault: false,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = CategorySchema.safeParse(category);
      expect(result.success).toBe(false);
    });

    it('should reject invalid color format', () => {
      const category = {
        id: 'cat-1',
        name: 'Test',
        type: 'expense',
        color: 'invalid',
        icon: 'tag',
        isDefault: false,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = CategorySchema.safeParse(category);
      expect(result.success).toBe(false);
    });
  });
});

describe('CategoryTypeSchema', () => {
  it('should accept valid types', () => {
    expect(CategoryTypeSchema.safeParse('income').success).toBe(true);
    expect(CategoryTypeSchema.safeParse('expense').success).toBe(true);
  });

  it('should reject invalid types', () => {
    expect(CategoryTypeSchema.safeParse('transfer').success).toBe(false);
    expect(CategoryTypeSchema.safeParse('invalid').success).toBe(false);
  });
});
