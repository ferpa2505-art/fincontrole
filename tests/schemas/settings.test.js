import { describe, it, expect } from 'vitest';
import { SettingsSchema, ThemeSchema, LanguageSchema, CurrencySchema } from '@/schemas/settings.js';

describe('SettingsSchema', () => {
  describe('valid settings', () => {
    it('should accept complete valid settings', () => {
      const settings = {
        theme: 'dark',
        language: 'pt-BR',
        currency: 'BRL',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'pt-BR',
        notificationsEnabled: true,
        dailyReminderEnabled: true,
        dailyReminderTime: '09:00',
        biometricEnabled: false,
        autoBackupEnabled: true,
        backupFrequency: 'weekly',
        showBalanceOnHome: true,
        compactMode: false,
        firstDayOfWeek: 0,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = SettingsSchema.safeParse(settings);
      expect(result.success).toBe(true);
    });

    it('should accept minimal valid settings', () => {
      const settings = {
        theme: 'light',
        language: 'en-US',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        numberFormat: 'en-US',
        notificationsEnabled: false,
        dailyReminderEnabled: false,
        dailyReminderTime: '08:00',
        biometricEnabled: false,
        autoBackupEnabled: false,
        backupFrequency: 'manual',
        showBalanceOnHome: true,
        compactMode: false,
        firstDayOfWeek: 0,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = SettingsSchema.safeParse(settings);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid settings', () => {
    it('should reject invalid theme', () => {
      const settings = {
        theme: 'invalid',
        language: 'pt-BR',
        currency: 'BRL',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'pt-BR',
        notificationsEnabled: true,
        dailyReminderEnabled: true,
        dailyReminderTime: '09:00',
        biometricEnabled: false,
        autoBackupEnabled: true,
        backupFrequency: 'weekly',
        showBalanceOnHome: true,
        compactMode: false,
        firstDayOfWeek: 0,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = SettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });

    it('should reject invalid language', () => {
      const settings = {
        theme: 'light',
        language: 'invalid',
        currency: 'BRL',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'pt-BR',
        notificationsEnabled: true,
        dailyReminderEnabled: true,
        dailyReminderTime: '09:00',
        biometricEnabled: false,
        autoBackupEnabled: true,
        backupFrequency: 'weekly',
        showBalanceOnHome: true,
        compactMode: false,
        firstDayOfWeek: 0,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = SettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });

    it('should reject invalid currency', () => {
      const settings = {
        theme: 'light',
        language: 'pt-BR',
        currency: 'INVALID',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'pt-BR',
        notificationsEnabled: true,
        dailyReminderEnabled: true,
        dailyReminderTime: '09:00',
        biometricEnabled: false,
        autoBackupEnabled: true,
        backupFrequency: 'weekly',
        showBalanceOnHome: true,
        compactMode: false,
        firstDayOfWeek: 0,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = SettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });

    it('should reject invalid time format', () => {
      const settings = {
        theme: 'light',
        language: 'pt-BR',
        currency: 'BRL',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'pt-BR',
        notificationsEnabled: true,
        dailyReminderEnabled: true,
        dailyReminderTime: '25:00',
        biometricEnabled: false,
        autoBackupEnabled: true,
        backupFrequency: 'weekly',
        showBalanceOnHome: true,
        compactMode: false,
        firstDayOfWeek: 0,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = SettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });

    it('should reject invalid backup frequency', () => {
      const settings = {
        theme: 'light',
        language: 'pt-BR',
        currency: 'BRL',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'pt-BR',
        notificationsEnabled: true,
        dailyReminderEnabled: true,
        dailyReminderTime: '09:00',
        biometricEnabled: false,
        autoBackupEnabled: true,
        backupFrequency: 'invalid',
        showBalanceOnHome: true,
        compactMode: false,
        firstDayOfWeek: 0,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = SettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });

    it('should reject invalid first day of week', () => {
      const settings = {
        theme: 'light',
        language: 'pt-BR',
        currency: 'BRL',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'pt-BR',
        notificationsEnabled: true,
        dailyReminderEnabled: true,
        dailyReminderTime: '09:00',
        biometricEnabled: false,
        autoBackupEnabled: true,
        backupFrequency: 'weekly',
        showBalanceOnHome: true,
        compactMode: false,
        firstDayOfWeek: 7,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
      };
      const result = SettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });
  });
});

describe('ThemeSchema', () => {
  it('should accept valid themes', () => {
    expect(ThemeSchema.safeParse('light').success).toBe(true);
    expect(ThemeSchema.safeParse('dark').success).toBe(true);
    expect(ThemeSchema.safeParse('system').success).toBe(true);
    expect(ThemeSchema.safeParse('high-contrast').success).toBe(true);
  });

  it('should reject invalid themes', () => {
    expect(ThemeSchema.safeParse('invalid').success).toBe(false);
  });
});

describe('LanguageSchema', () => {
  it('should accept valid languages', () => {
    expect(LanguageSchema.safeParse('pt-BR').success).toBe(true);
    expect(LanguageSchema.safeParse('es-ES').success).toBe(true);
    expect(LanguageSchema.safeParse('en-US').success).toBe(true);
  });

  it('should reject invalid languages', () => {
    expect(LanguageSchema.safeParse('invalid').success).toBe(false);
  });
});

describe('CurrencySchema', () => {
  it('should accept valid currencies', () => {
    expect(CurrencySchema.safeParse('BRL').success).toBe(true);
    expect(CurrencySchema.safeParse('USD').success).toBe(true);
    expect(CurrencySchema.safeParse('EUR').success).toBe(true);
  });

  it('should reject invalid currencies', () => {
    expect(CurrencySchema.safeParse('INVALID').success).toBe(false);
  });
});
