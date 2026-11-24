import { describe, it, expect } from 'vitest';
import { ReminderSchema, ReminderFrequencySchema } from '@/schemas/reminders.js';

describe('ReminderSchema', () => {
  describe('valid reminders', () => {
    it('should accept a valid one-time reminder', () => {
      const reminder = {
        id: 'rem-1',
        title: 'Pagar conta de luz',
        description: 'Conta de luz do mês',
        amount: 150.0,
        type: 'expense',
        date: '2024-01-20',
        accountId: 'acc-1',
        categoryId: 'cat-1',
        isActive: true,
        frequency: 'once',
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = ReminderSchema.safeParse(reminder);
      expect(result.success).toBe(true);
    });

    it('should accept a valid monthly reminder', () => {
      const reminder = {
        id: 'rem-2',
        title: 'Aluguel',
        description: 'Aluguel mensal',
        amount: 1200.0,
        type: 'expense',
        date: '2024-01-05',
        accountId: 'acc-1',
        categoryId: 'cat-2',
        isActive: true,
        frequency: 'monthly',
        endDate: '2024-12-31',
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = ReminderSchema.safeParse(reminder);
      expect(result.success).toBe(true);
    });

    it('should accept reminder without amount (generic reminder)', () => {
      const reminder = {
        id: 'rem-3',
        title: 'Reunião com contador',
        description: 'Levar documentos',
        type: 'generic',
        date: '2024-01-15',
        isActive: true,
        frequency: 'once',
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = ReminderSchema.safeParse(reminder);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid reminders', () => {
    it('should reject missing required fields', () => {
      const reminder = {
        title: 'Test',
      };
      const result = ReminderSchema.safeParse(reminder);
      expect(result.success).toBe(false);
    });

    it('should reject invalid frequency', () => {
      const reminder = {
        id: 'rem-1',
        title: 'Test',
        type: 'expense',
        date: '2024-01-15',
        isActive: true,
        frequency: 'invalid',
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = ReminderSchema.safeParse(reminder);
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format', () => {
      const reminder = {
        id: 'rem-1',
        title: 'Test',
        type: 'expense',
        date: '15/01/2024',
        isActive: true,
        frequency: 'once',
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = ReminderSchema.safeParse(reminder);
      expect(result.success).toBe(false);
    });

    it('should reject reminder with amount when type is generic', () => {
      const reminder = {
        id: 'rem-1',
        title: 'Test',
        type: 'generic',
        amount: 100,
        date: '2024-01-15',
        isActive: true,
        frequency: 'once',
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = ReminderSchema.safeParse(reminder);
      expect(result.success).toBe(false);
    });
  });
});

describe('ReminderFrequencySchema', () => {
  it('should accept valid frequencies', () => {
    expect(ReminderFrequencySchema.safeParse('once').success).toBe(true);
    expect(ReminderFrequencySchema.safeParse('daily').success).toBe(true);
    expect(ReminderFrequencySchema.safeParse('weekly').success).toBe(true);
    expect(ReminderFrequencySchema.safeParse('monthly').success).toBe(true);
    expect(ReminderFrequencySchema.safeParse('yearly').success).toBe(true);
  });

  it('should reject invalid frequencies', () => {
    expect(ReminderFrequencySchema.safeParse('invalid').success).toBe(false);
  });
});
