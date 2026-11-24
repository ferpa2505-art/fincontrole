/**
 * Transaction repository for managing financial transactions
 * Extends BaseRepository with transaction-specific queries
 *
 * Called by:
 * - src/state/store.js (state management)
 * - src/features/transactions/*.js (transaction features)
 *
 * Uses:
 * - src/storage/idb.js for database operations
 * - src/schemas/transactions.js for validation (TransactionSchema, CreateTransactionSchema, UpdateTransactionSchema)
 * - src/storage/repositories/BaseRepository.js
 *
 * No existing file serves the same purpose - this is the first transaction repository implementation
 * User instruction: "ok pode implementar todos este abaixo" - implement Phase 1.2 Storage Layer
 */
import { BaseRepository } from './BaseRepository.js';
import { STORES } from '../idb.js';
import {
  TransactionSchema,
  CreateTransactionSchema,
  UpdateTransactionSchema,
} from '../../schemas/transactions.js';

/**
 * Transaction types
 * @readonly
 * @enum {string}
 */
export const TransactionType = {
  INCOME: 'income',
  EXPENSE: 'expense',
  TRANSFER: 'transfer',
};

/**
 * Recurrence rules
 * @readonly
 * @enum {string}
 */
export const RecurrenceRule = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
};

/**
 * Transaction repository class
 */
export class TransactionRepository extends BaseRepository {
  constructor() {
    super(STORES.TRANSACTIONS, TransactionSchema);
  }

  /**
   * Get transactions by account ID
   * @param {string} accountId - Account ID
   * @returns {Promise<Array>}
   */
  async findByAccount(accountId) {
    return this.findByIndex('accountId', accountId);
  }

  /**
   * Get transactions by category ID
   * @param {string} categoryId - Category ID
   * @returns {Promise<Array>}
   */
  async findByCategory(categoryId) {
    return this.findByIndex('categoryId', categoryId);
  }

  /**
   * Get transactions by date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Array>}
   */
  async findByDateRange(startDate, endDate) {
    const allTransactions = await this.findAll();
    return allTransactions.filter(t => t.date >= startDate && t.date <= endDate);
  }

  /**
   * Get transactions by type
   * @param {string} type - Transaction type (income/expense/transfer)
   * @returns {Promise<Array>}
   */
  async findByType(type) {
    return this.findByIndex('type', type);
  }

  /**
   * Get transactions by account and date range
   * @param {string} accountId - Account ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Array>}
   */
  async findByAccountAndDateRange(accountId, startDate, endDate) {
    const transactions = await this.findByAccount(accountId);
    return transactions.filter(t => t.date >= startDate && t.date <= endDate);
  }

  /**
   * Get transactions by account, type, and date range
   * @param {string} accountId - Account ID
   * @param {string} type - Transaction type
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Array>}
   */
  async findByAccountTypeAndDateRange(accountId, type, startDate, endDate) {
    const transactions = await this.findByAccount(accountId);
    return transactions.filter(t => t.type === type && t.date >= startDate && t.date <= endDate);
  }

  /**
   * Get recurring transactions
   * @returns {Promise<Array>}
   */
  async findRecurring() {
    const allTransactions = await this.findAll();
    return allTransactions.filter(t => t.isRecurring === true);
  }

  /**
   * Create a new transaction
   * @param {Object} data - Transaction data
   * @param {string} data.type - Transaction type (income/expense/transfer)
   * @param {number} data.amount - Transaction amount
   * @param {string} data.description - Description
   * @param {string} data.date - Date (YYYY-MM-DD)
   * @param {string} data.accountId - Account ID
   * @param {string} [data.categoryId] - Category ID (required for income/expense)
   * @param {string} [data.destinationAccountId] - Destination account ID (required for transfer)
   * @param {boolean} [data.isRecurring=false] - Is recurring
   * @param {string} [data.recurrenceRule] - Recurrence rule
   * @param {string} [data.recurrenceEndDate] - Recurrence end date
   * @returns {Promise<string>} ID of created transaction
   */
  async create(data) {
    const transactionData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return super.create(transactionData);
  }

  /**
   * Create an income transaction
   * @param {Object} data - Transaction data
   * @returns {Promise<string>} ID of created transaction
   */
  async createIncome(data) {
    return this.create({ ...data, type: TransactionType.INCOME });
  }

  /**
   * Create an expense transaction
   * @param {Object} data - Transaction data
   * @returns {Promise<string>} ID of created transaction
   */
  async createExpense(data) {
    return this.create({ ...data, type: TransactionType.EXPENSE });
  }

  /**
   * Create a transfer transaction
   * @param {Object} data - Transaction data
   * @returns {Promise<string>} ID of created transaction
   */
  async createTransfer(data) {
    return this.create({ ...data, type: TransactionType.TRANSFER });
  }

  /**
   * Get total amount for transactions matching criteria
   * @param {Object} criteria - Filter criteria
   * @param {string} [criteria.accountId] - Account ID
   * @param {string} [criteria.type] - Transaction type
   * @param {string} [criteria.startDate] - Start date
   * @param {string} [criteria.endDate] - End date
   * @returns {Promise<number>} Total amount
   */
  async getTotalAmount(criteria = {}) {
    let transactions = await this.findAll();

    if (criteria.accountId) {
      transactions = transactions.filter(t => t.accountId === criteria.accountId);
    }
    if (criteria.type) {
      transactions = transactions.filter(t => t.type === criteria.type);
    }
    if (criteria.startDate) {
      transactions = transactions.filter(t => t.date >= criteria.startDate);
    }
    if (criteria.endDate) {
      transactions = transactions.filter(t => t.date <= criteria.endDate);
    }

    return transactions.reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Get balance summary for an account
   * @param {string} accountId - Account ID
   * @returns {Promise<Object>} Balance summary { income, expense, balance }
   */
  async getAccountSummary(accountId) {
    const transactions = await this.findByAccount(accountId);
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  }

  /**
   * Validate transaction data
   * @param {Object} data - Transaction data
   * @returns {Object} Validated data
   */
  validate(data) {
    return CreateTransactionSchema.parse(data);
  }

  /**
   * Validate update data
   * @param {Object} data - Update data
   * @returns {Object} Validated data
   */
  validateUpdate(data) {
    return UpdateTransactionSchema.parse(data);
  }
}

export default new TransactionRepository();
