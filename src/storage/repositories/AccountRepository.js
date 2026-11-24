/**
 * Account repository for managing financial accounts
 * Extends BaseRepository with account-specific queries
 *
 * Called by:
 * - src/state/store.js (state management)
 * - src/features/accounts/*.js (account features)
 *
 * Uses:
 * - src/storage/idb.js for database operations
 * - src/schemas/accounts.js for validation (AccountSchema, CreateAccountSchema, UpdateAccountSchema)
 * - src/storage/repositories/BaseRepository.js
 *
 * No existing file serves the same purpose - this is the first account repository implementation
 * User instruction: "ok pode implementar todos este abaixo" - implement Phase 1.2 Storage Layer
 */
import { BaseRepository } from './BaseRepository.js';
import { STORES } from '../idb.js';
import { AccountSchema, CreateAccountSchema, UpdateAccountSchema } from '../../schemas/accounts.js';

/**
 * Account types
 * @readonly
 * @enum {string}
 */
export const AccountType = {
  CHECKING: 'checking',
  SAVINGS: 'savings',
  CREDIT: 'credit',
  CASH: 'cash',
  INVESTMENT: 'investment',
};

/**
 * Account repository class
 */
export class AccountRepository extends BaseRepository {
  constructor() {
    super(STORES.ACCOUNTS, AccountSchema);
  }

  /**
   * Get all active accounts
   * @returns {Promise<Array>}
   */
  async findActive() {
    return this.findByIndex('isActive', true);
  }

  /**
   * Get accounts by type
   * @param {string} type - Account type
   * @returns {Promise<Array>}
   */
  async findByType(type) {
    return this.findByIndex('type', type);
  }

  /**
   * Get accounts by type and active status
   * @param {string} type - Account type
   * @param {boolean} isActive - Active status
   * @returns {Promise<Array>}
   */
  async findByTypeAndActive(type, isActive) {
    const accounts = await this.findByType(type);
    return accounts.filter(acc => acc.isActive === isActive);
  }

  /**
   * Create a new account
   * @param {Object} data - Account data
   * @param {string} data.name - Account name
   * @param {string} data.type - Account type
   * @param {number} [data.balance=0] - Initial balance
   * @param {string} [data.currency='BRL'] - Currency code
   * @param {string} [data.color] - UI color
   * @param {string} [data.icon] - UI icon
   * @param {boolean} [data.isActive=true] - Active status
   * @param {string} [data.description] - Description
   * @returns {Promise<string>} ID of created account
   */
  async create(data) {
    const accountData = {
      ...data,
      balance: data.balance ?? 0,
      currency: data.currency ?? 'BRL',
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return super.create(accountData);
  }

  /**
   * Update account balance
   * @param {string} id - Account ID
   * @param {number} balance - New balance
   * @returns {Promise<string>} ID of updated account
   */
  async updateBalance(id, balance) {
    return this.update(id, { balance, updatedAt: new Date().toISOString() });
  }

  /**
   * Adjust account balance by amount
   * @param {string} id - Account ID
   * @param {number} amount - Amount to add/subtract
   * @returns {Promise<string>} ID of updated account
   */
  async adjustBalance(id, amount) {
    const account = await this.findById(id);
    if (!account) {
      throw new Error(`Account with id ${id} not found`);
    }
    return this.updateBalance(id, account.balance + amount);
  }

  /**
   * Toggle account active status
   * @param {string} id - Account ID
   * @returns {Promise<string>} ID of updated account
   */
  async toggleActive(id) {
    const account = await this.findById(id);
    if (!account) {
      throw new Error(`Account with id ${id} not found`);
    }
    return this.update(id, { isActive: !account.isActive });
  }

  /**
   * Validate account data
   * @param {Object} data - Account data
   * @returns {Object} Validated data
   */
  validate(data) {
    return CreateAccountSchema.parse(data);
  }

  /**
   * Validate update data
   * @param {Object} data - Update data
   * @returns {Object} Validated data
   */
  validateUpdate(data) {
    return UpdateAccountSchema.parse(data);
  }
}

export default new AccountRepository();
