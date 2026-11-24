import { z } from 'zod';

/**
 * Reminder type enumeration
 * @readonly
 * @enum {string}
 */
export const ReminderTypeSchema = z.enum(['income', 'expense', 'generic']);

/**
 * Reminder frequency enumeration
 * @readonly
 * @enum {string}
 */
export const ReminderFrequencySchema = z.enum(['once', 'daily', 'weekly', 'monthly', 'yearly']);

// Date regex pattern for YYYY-MM-DD
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Base reminder schema with common fields
 */
const BaseReminderSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
  description: z.string().max(500, 'Descrição muito longa').optional().nullable(),
  type: ReminderTypeSchema,
  date: z.string().regex(datePattern, 'Data deve estar no formato YYYY-MM-DD'),
  isActive: z.boolean().default(true),
  frequency: ReminderFrequencySchema,
  endDate: z.string().regex(datePattern, 'Data de fim inválida').optional().nullable(),
  createdAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, 'Data de criação inválida'),
  updatedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, 'Data de atualização inválida'),
});

/**
 * Financial reminder schema (income/expense with amount, account, category)
 */
const FinancialReminderSchema = BaseReminderSchema.extend({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Valor deve ser positivo'),
  accountId: z.string().min(1, 'Conta é obrigatória'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
});

/**
 * Generic reminder schema (no amount, account, category)
 */
const GenericReminderSchema = BaseReminderSchema.extend({
  type: z.literal('generic'),
  amount: z.undefined(),
  accountId: z.undefined(),
  categoryId: z.undefined(),
});

/**
 * Union of all reminder types
 */
export const ReminderSchema = z.discriminatedUnion('type', [
  FinancialReminderSchema,
  GenericReminderSchema,
]);

/**
 * Schema for creating a new reminder (without id, createdAt, updatedAt)
 * Built from base schemas since discriminatedUnion doesn't support .omit()
 */
const BaseCreateReminderSchema = BaseReminderSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const CreateFinancialReminderSchema = BaseCreateReminderSchema.extend({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Valor deve ser positivo'),
  accountId: z.string().min(1, 'Conta é obrigatória'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
});

const CreateGenericReminderSchema = BaseCreateReminderSchema.extend({
  type: z.literal('generic'),
  amount: z.undefined(),
  accountId: z.undefined(),
  categoryId: z.undefined(),
});

export const CreateReminderSchema = z.discriminatedUnion('type', [
  CreateFinancialReminderSchema,
  CreateGenericReminderSchema,
]);

/**
 * Schema for updating a reminder (all fields optional except id)
 * Uses a regular object schema since discriminatedUnion doesn't work well for partial updates
 */
export const UpdateReminderSchema = BaseReminderSchema.partial().required({ id: true });

/**
 * Type inference from schemas
 * @typedef {z.infer<typeof ReminderSchema>} Reminder
 * @typedef {z.infer<typeof ReminderTypeSchema>} ReminderType
 * @typedef {z.infer<typeof ReminderFrequencySchema>} ReminderFrequency
 * @typedef {z.infer<typeof CreateReminderSchema>} CreateReminder
 * @typedef {z.infer<typeof UpdateReminderSchema>} UpdateReminder
 */
