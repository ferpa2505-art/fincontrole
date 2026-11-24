import { z } from 'zod';

/**
 * Theme enumeration
 * @readonly
 * @enum {string}
 */
export const ThemeSchema = z.enum(['light', 'dark', 'system', 'high-contrast']);

/**
 * Language enumeration
 * @readonly
 * @enum {string}
 */
export const LanguageSchema = z.enum(['pt-BR', 'es-ES', 'en-US']);

/**
 * Currency enumeration (ISO 4217)
 * @readonly
 * @enum {string}
 */
export const CurrencySchema = z.enum([
  'BRL',
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CAD',
  'AUD',
  'CHF',
  'CNY',
]);

/**
 * Backup frequency enumeration
 * @readonly
 * @enum {string}
 */
export const BackupFrequencySchema = z.enum(['manual', 'daily', 'weekly', 'monthly']);

/**
 * Time format pattern (HH:MM 24-hour)
 */
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Date format pattern
 */
const dateFormatPattern = /^(DD\/MM\/YYYY|MM\/DD\/YYYY|YYYY-MM-DD)$/;

/**
 * Number format (locale) pattern
 */
const numberFormatPattern = /^[a-z]{2}-[A-Z]{2}$/;

/**
 * Settings schema
 */
export const SettingsSchema = z.object({
  theme: ThemeSchema,
  language: LanguageSchema,
  currency: CurrencySchema,
  dateFormat: z.string().regex(dateFormatPattern, 'Formato de data inválido'),
  numberFormat: z.string().regex(numberFormatPattern, 'Formato de número inválido'),
  notificationsEnabled: z.boolean().default(false),
  dailyReminderEnabled: z.boolean().default(false),
  dailyReminderTime: z.string().regex(timePattern, 'Horário deve estar no formato HH:MM'),
  biometricEnabled: z.boolean().default(false),
  autoBackupEnabled: z.boolean().default(false),
  backupFrequency: BackupFrequencySchema,
  showBalanceOnHome: z.boolean().default(true),
  compactMode: z.boolean().default(false),
  firstDayOfWeek: z
    .number()
    .int()
    .min(0)
    .max(6, 'Primeiro dia da semana deve ser entre 0 (domingo) e 6 (sábado)'),
  createdAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, 'Data de criação inválida'),
  updatedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, 'Data de atualização inválida'),
});

/**
 * Schema for creating default settings (without createdAt, updatedAt)
 */
export const CreateSettingsSchema = SettingsSchema.omit({
  createdAt: true,
  updatedAt: true,
});

/**
 * Schema for updating settings (all fields optional)
 */
export const UpdateSettingsSchema = SettingsSchema.partial();

/**
 * Type inference from schemas
 * @typedef {z.infer<typeof SettingsSchema>} Settings
 * @typedef {z.infer<typeof ThemeSchema>} Theme
 * @typedef {z.infer<typeof LanguageSchema>} Language
 * @typedef {z.infer<typeof CurrencySchema>} Currency
 * @typedef {z.infer<typeof BackupFrequencySchema>} BackupFrequency
 * @typedef {z.infer<typeof CreateSettingsSchema>} CreateSettings
 * @typedef {z.infer<typeof UpdateSettingsSchema>} UpdateSettings
 */
