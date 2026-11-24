import { z } from 'zod';

/**
 * Account type enumeration
 * @readonly
 * @enum {string}
 */
export const AccountTypeSchema = z.enum(['checking', 'savings', 'credit', 'cash', 'investment']);

/**
 * Currency code enumeration (ISO 4217)
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
 * Hex color pattern
 */
const hexColorPattern = /^#[0-9A-Fa-f]{6}$/;

/**
 * Base account schema with common fields
 */
const BaseAccountSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome muito longo'),
  type: AccountTypeSchema,
  balance: z.number(),
  currency: CurrencySchema,
  color: z.string().regex(hexColorPattern, 'Cor deve ser um hex válido (#RRGGBB)'),
  icon: z.string().min(1, 'Ícone é obrigatório'),
  isActive: z.boolean().default(true),
  createdAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, 'Data de criação inválida'),
  updatedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, 'Data de atualização inválida'),
});

/**
 * Credit card account schema (requires credit limit and dates)
 */
const CreditAccountSchema = BaseAccountSchema.extend({
  type: z.literal('credit'),
  creditLimit: z.number().positive('Limite de crédito deve ser positivo'),
  closingDay: z.number().int().min(1).max(31, 'Dia de fechamento deve ser entre 1 e 31'),
  dueDay: z.number().int().min(1).max(31, 'Dia de vencimento deve ser entre 1 e 31'),
});

/**
 * Standard account schema (checking, savings, cash, investment)
 */
const StandardAccountSchema = BaseAccountSchema.extend({
  type: z.enum(['checking', 'savings', 'cash', 'investment']),
  creditLimit: z.undefined(),
  closingDay: z.undefined(),
  dueDay: z.undefined(),
});

/**
 * Union of all account types
 */
export const AccountSchema = z.discriminatedUnion('type', [
  CreditAccountSchema,
  StandardAccountSchema,
]);

/**
 * Schema for creating a new account (without id, createdAt, updatedAt)
 * Built from base schemas since discriminatedUnion doesn't support .omit()
 */
const BaseCreateAccountSchema = BaseAccountSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const CreateCreditAccountSchema = BaseCreateAccountSchema.extend({
  type: z.literal('credit'),
  creditLimit: z.number().positive('Limite de crédito deve ser positivo'),
  closingDay: z.number().int().min(1).max(31, 'Dia de fechamento deve ser entre 1 e 31'),
  dueDay: z.number().int().min(1).max(31, 'Dia de vencimento deve ser entre 1 e 31'),
});

const CreateStandardAccountSchema = BaseCreateAccountSchema.extend({
  type: z.enum(['checking', 'savings', 'cash', 'investment']),
  creditLimit: z.undefined(),
  closingDay: z.undefined(),
  dueDay: z.undefined(),
});

export const CreateAccountSchema = z.discriminatedUnion('type', [
  CreateCreditAccountSchema,
  CreateStandardAccountSchema,
]);

/**
 * Schema for updating an account (all fields optional except id)
 * Uses a regular object schema since discriminatedUnion doesn't work well for partial updates
 */
export const UpdateAccountSchema = BaseAccountSchema.partial().required({ id: true });

/**
 * Type inference from schemas
 * @typedef {z.infer<typeof AccountSchema>} Account
 * @typedef {z.infer<typeof AccountTypeSchema>} AccountType
 * @typedef {z.infer<typeof CurrencySchema>} Currency
 * @typedef {z.infer<typeof CreateAccountSchema>} CreateAccount
 * @typedef {z.infer<typeof UpdateAccountSchema>} UpdateAccount
 */
