import { describe, it, expect } from 'vitest';
import { AccountSchema, AccountTypeSchema } from '@/schemas/accounts.js';

describe('AccountSchema', () => {
  describe('valid accounts', () => {
    it('should accept a valid checking account', () => {
      const account = {
        id: 'acc-1',
        name: 'Conta Corrente',
        type: 'checking',
        balance: 1000.0,
        currency: 'BRL',
        color: '#3B82F6',
        icon: 'bank',
        isActive: true,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = AccountSchema.safeParse(account);
      expect(result.success).toBe(true);
    });

    it('should accept a valid savings account', () => {
      const account = {
        id: 'acc-2',
        name: 'Poupança',
        type: 'savings',
        balance: 5000.0,
        currency: 'BRL',
        color: '#10B981',
        icon: 'piggy-bank',
        isActive: true,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = AccountSchema.safeParse(account);
      expect(result.success).toBe(true);
    });

    it('should accept a valid credit card account', () => {
      const account = {
        id: 'acc-3',
        name: 'Cartão de Crédito',
        type: 'credit',
        balance: -500.0,
        currency: 'BRL',
        color: '#EF4444',
        icon: 'credit-card',
        isActive: true,
        creditLimit: 2000.0,
        closingDay: 15,
        dueDay: 10,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = AccountSchema.safeParse(account);
      expect(result.success).toBe(true);
    });

    it('should accept a valid cash account', () => {
      const account = {
        id: 'acc-4',
        name: 'Dinheiro',
        type: 'cash',
        balance: 200.0,
        currency: 'BRL',
        color: '#F59E0B',
        icon: 'wallet',
        isActive: true,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = AccountSchema.safeParse(account);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid accounts', () => {
    it('should reject missing required fields', () => {
      const account = {
        name: 'Test',
      };
      const result = AccountSchema.safeParse(account);
      expect(result.success).toBe(false);
    });

    it('should reject invalid type', () => {
      const account = {
        id: 'acc-1',
        name: 'Test',
        type: 'invalid',
        balance: 0,
        currency: 'BRL',
        color: '#000000',
        icon: 'bank',
        isActive: true,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = AccountSchema.safeParse(account);
      expect(result.success).toBe(false);
    });

    it('should reject invalid currency', () => {
      const account = {
        id: 'acc-1',
        name: 'Test',
        type: 'checking',
        balance: 0,
        currency: 'INVALID',
        color: '#000000',
        icon: 'bank',
        isActive: true,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = AccountSchema.safeParse(account);
      expect(result.success).toBe(false);
    });

    it('should reject invalid color format', () => {
      const account = {
        id: 'acc-1',
        name: 'Test',
        type: 'checking',
        balance: 0,
        currency: 'BRL',
        color: 'invalid-color',
        icon: 'bank',
        isActive: true,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = AccountSchema.safeParse(account);
      expect(result.success).toBe(false);
    });

    it('should reject credit card without credit limit', () => {
      const account = {
        id: 'acc-1',
        name: 'Cartão',
        type: 'credit',
        balance: -100,
        currency: 'BRL',
        color: '#EF4444',
        icon: 'credit-card',
        isActive: true,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = AccountSchema.safeParse(account);
      expect(result.success).toBe(false);
    });
  });
});

describe('AccountTypeSchema', () => {
  it('should accept valid types', () => {
    expect(AccountTypeSchema.safeParse('checking').success).toBe(true);
    expect(AccountTypeSchema.safeParse('savings').success).toBe(true);
    expect(AccountTypeSchema.safeParse('credit').success).toBe(true);
    expect(AccountTypeSchema.safeParse('cash').success).toBe(true);
    expect(AccountTypeSchema.safeParse('investment').success).toBe(true);
  });

  it('should reject invalid types', () => {
    expect(AccountTypeSchema.safeParse('invalid').success).toBe(false);
  });
});
