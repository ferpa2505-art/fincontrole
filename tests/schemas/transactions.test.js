import { describe, it, expect } from 'vitest';
import { TransactionSchema, TransactionTypeSchema } from '@/schemas/transactions.js';

describe('TransactionSchema', () => {
  describe('valid transactions', () => {
    it('should accept a valid income transaction', () => {
      const transaction = {
        id: 'txn-123',
        type: 'income',
        amount: 100.5,
        description: 'Salário',
        date: '2024-01-15',
        accountId: 'acc-1',
        categoryId: 'cat-1',
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z',
      };
      const result = TransactionSchema.safeParse(transaction);
      expect(result.success).toBe(true);
    });

    it('should accept a valid expense transaction', () => {
      const transaction = {
        id: 'txn-123',
        type: 'expense',
        amount: 50.0,
        description: 'Supermercado',
        date: '2024-01-15',
        accountId: 'acc-1',
        categoryId: 'cat-2',
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z',
      };
      const result = TransactionSchema.safeParse(transaction);
      expect(result.success).toBe(true);
    });

    it('should accept a valid transfer transaction', () => {
      const transaction = {
        id: 'txn-123',
        type: 'transfer',
        amount: 200.0,
        description: 'Transferência',
        date: '2024-01-15',
        accountId: 'acc-1',
        categoryId: null,
        destinationAccountId: 'acc-2',
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z',
      };
      const result = TransactionSchema.safeParse(transaction);
      expect(result.success).toBe(true);
    });

    it('should accept transaction with optional recurrence fields', () => {
      const transaction = {
        id: 'txn-123',
        type: 'expense',
        amount: 100.0,
        description: 'Aluguel',
        date: '2024-01-15',
        accountId: 'acc-1',
        categoryId: 'cat-3',
        isRecurring: true,
        recurrenceRule: 'monthly',
        recurrenceEndDate: '2024-12-31',
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z',
      };
      const result = TransactionSchema.safeParse(transaction);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid transactions', () => {
    it('should reject missing required fields', () => {
      const transaction = {
        type: 'income',
        amount: 100,
      };
      const result = TransactionSchema.safeParse(transaction);
      expect(result.success).toBe(false);
    });

    it('should reject invalid type', () => {
      const transaction = {
        id: 'txn-123',
        type: 'invalid',
        amount: 100,
        description: 'Test',
        date: '2024-01-15',
        accountId: 'acc-1',
        categoryId: 'cat-1',
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z',
      };
      const result = TransactionSchema.safeParse(transaction);
      expect(result.success).toBe(false);
    });

    it('should reject negative amount', () => {
      const transaction = {
        id: 'txn-123',
        type: 'income',
        amount: -100,
        description: 'Test',
        date: '2024-01-15',
        accountId: 'acc-1',
        categoryId: 'cat-1',
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z',
      };
      const result = TransactionSchema.safeParse(transaction);
      expect(result.success).toBe(false);
    });

    it('should reject zero amount', () => {
      const transaction = {
        id: 'txn-123',
        type: 'income',
        amount: 0,
        description: 'Test',
        date: '2024-01-15',
        accountId: 'acc-1',
        categoryId: 'cat-1',
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z',
      };
      const result = TransactionSchema.safeParse(transaction);
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format', () => {
      const transaction = {
        id: 'txn-123',
        type: 'income',
        amount: 100,
        description: 'Test',
        date: '15/01/2024',
        accountId: 'acc-1',
        categoryId: 'cat-1',
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z',
      };
      const result = TransactionSchema.safeParse(transaction);
      expect(result.success).toBe(false);
    });

    it('should reject transfer without destinationAccountId', () => {
      const transaction = {
        id: 'txn-123',
        type: 'transfer',
        amount: 100,
        description: 'Test',
        date: '2024-01-15',
        accountId: 'acc-1',
        categoryId: null,
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z',
      };
      const result = TransactionSchema.safeParse(transaction);
      expect(result.success).toBe(false);
    });
  });
});

describe('TransactionTypeSchema', () => {
  it('should accept valid types', () => {
    expect(TransactionTypeSchema.safeParse('income').success).toBe(true);
    expect(TransactionTypeSchema.safeParse('expense').success).toBe(true);
    expect(TransactionTypeSchema.safeParse('transfer').success).toBe(true);
  });

  it('should reject invalid types', () => {
    expect(TransactionTypeSchema.safeParse('invalid').success).toBe(false);
    expect(TransactionTypeSchema.safeParse('').success).toBe(false);
  });
});
