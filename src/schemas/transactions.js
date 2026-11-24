import { z } from 'zod';

/**
 * Transaction type enumeration
 * @readonly
 * @enum {string}
 */
export const TransactionTypeSchema = z.enum(['income', 'expense', 'transfer']);

/**
 * Recurrence rule enumeration
 * @readonly
 * @enum {string}
 */
export const RecurrenceRuleSchema = z.enum(['daily', 'weekly', 'monthly', 'yearly']);

// Date regex pattern for YYYY-MM-DD
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const isoDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;

/**
 * Base transaction schema with common fields
 */
const BaseTransactionSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  type: TransactionTypeSchema,
  amount: z.number().positive('Valor deve ser positivo'),
  description: z.string().min(1, 'Descrição é obrigatória').max(200, 'Descrição muito longa'),
  date: z.string().regex(datePattern, 'Data deve estar no formato YYYY-MM-DD'),
  accountId: z.string().min(1, 'Conta é obrigatória'),
  categoryId: z.string().nullable(),
  createdAt: z.string().regex(isoDateTimePattern, 'Data de criação inválida'),
  updatedAt: z.string().regex(isoDateTimePattern, 'Data de atualização inválida'),
});

/**
 * Income/Expense transaction schema
 */
const IncomeExpenseTransactionSchema = BaseTransactionSchema.extend({
  type: z.enum(['income', 'expense']),
  categoryId: z.string().min(1, 'Categoria é obrigatória para receitas/despesas'),
  isRecurring: z.boolean().default(false),
  recurrenceRule: RecurrenceRuleSchema.optional(),
  recurrenceEndDate: z.string().regex(datePattern, 'Data de fim inválida').optional().nullable(),
});

/**
 * Transfer transaction schema
 */
const TransferTransactionSchema = BaseTransactionSchema.extend({
  type: z.literal('transfer'),
  categoryId: z.null(),
  destinationAccountId: z.string().min(1, 'Conta de destino é obrigatória para transferências'),
  isRecurring: z.boolean().default(false),
  recurrenceRule: RecurrenceRuleSchema.optional(),
  recurrenceEndDate: z.string().regex(datePattern, 'Data de fim inválida').optional().nullable(),
});

/**
 * Union of all transaction types
 */
export const TransactionSchema = z.discriminatedUnion('type', [
  IncomeExpenseTransactionSchema,
  TransferTransactionSchema,
]);

/**
 * Schema for creating a new transaction (without id, createdAt, updatedAt)
 * Built from base schemas since discriminatedUnion doesn't support .omit()
 */
const BaseCreateTransactionSchema = BaseTransactionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const CreateIncomeExpenseTransactionSchema = BaseCreateTransactionSchema.extend({
  type: z.enum(['income', 'expense']),
  categoryId: z.string().min(1, 'Categoria é obrigatória para receitas/despesas'),
  isRecurring: z.boolean().default(false),
  recurrenceRule: RecurrenceRuleSchema.optional(),
  recurrenceEndDate: z.string().regex(datePattern, 'Data de fim inválida').optional().nullable(),
});

const CreateTransferTransactionSchema = BaseCreateTransactionSchema.extend({
  type: z.literal('transfer'),
  categoryId: z.null(),
  destinationAccountId: z.string().min(1, 'Conta de destino é obrigatória para transferências'),
  isRecurring: z.boolean().default(false),
  recurrenceRule: RecurrenceRuleSchema.optional(),
  recurrenceEndDate: z.string().regex(datePattern, 'Data de fim inválida').optional().nullable(),
});

export const CreateTransactionSchema = z.discriminatedUnion('type', [
  CreateIncomeExpenseTransactionSchema,
  CreateTransferTransactionSchema,
]);

/**
 * Schema for updating a transaction (all fields optional except id)
 * Uses a regular object schema since discriminatedUnion doesn't work well for partial updates
 */
export const UpdateTransactionSchema = BaseTransactionSchema.partial().required({ id: true });

/**
 * Type inference from schemas
 * @typedef {z.infer<typeof TransactionSchema>} Transaction
 * @typedef {z.infer<typeof TransactionTypeSchema>} TransactionType
 * @typedef {z.infer<typeof CreateTransactionSchema>} CreateTransaction
 * @typedef {z.infer<typeof UpdateTransactionSchema>} UpdateTransaction
 */
