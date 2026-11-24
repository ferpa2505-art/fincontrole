/**
 * Reminder repository for managing financial reminders
 * Extends BaseRepository with reminder-specific queries
 *
 * Called by:
 * - src/state/store.js (state management)
 * - src/features/reminders/*.js (reminder features)
 *
 * Uses:
 * - src/storage/idb.js for database operations
 * - src/schemas/reminders.js for validation (ReminderSchema, CreateReminderSchema, UpdateReminderSchema)
 * - src/storage/repositories/BaseRepository.js
 *
 * No existing file serves the same purpose - this is the first reminder repository implementation
 * User instruction: "ok pode implementar todos este abaixo" - implement Phase 1.2 Storage Layer
 */
import { BaseRepository } from './BaseRepository.js';
import { STORES } from '../idb.js';
import {
  ReminderSchema,
  CreateReminderSchema,
  UpdateReminderSchema,
} from '../../schemas/reminders.js';

/**
 * Reminder types
 * @readonly
 * @enum {string}
 */
export const ReminderType = {
  INCOME: 'income',
  EXPENSE: 'expense',
  GENERIC: 'generic',
};

/**
 * Reminder frequencies
 * @readonly
 * @enum {string}
 */
export const ReminderFrequency = {
  ONCE: 'once',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
};

/**
 * Reminder repository class
 */
export class ReminderRepository extends BaseRepository {
  constructor() {
    super(STORES.REMINDERS, ReminderSchema);
  }

  /**
   * Get all active reminders
   * @returns {Promise<Array>}
   */
  async findActive() {
    return this.findByIndex('isActive', true);
  }

  /**
   * Get reminders by account ID
   * @param {string} accountId - Account ID
   * @returns {Promise<Array>}
   */
  async findByAccount(accountId) {
    return this.findByIndex('accountId', accountId);
  }

  /**
   * Get reminders by category ID
   * @param {string} categoryId - Category ID
   * @returns {Promise<Array>}
   */
  async findByCategory(categoryId) {
    return this.findByIndex('categoryId', categoryId);
  }

  /**
   * Get reminders by type
   * @param {string} type - Reminder type
   * @returns {Promise<Array>}
   */
  async findByType(type) {
    return this.findByIndex('type', type);
  }

  /**
   * Get reminders by date
   * @param {string} date - Date (YYYY-MM-DD)
   * @returns {Promise<Array>}
   */
  async findByDate(date) {
    return this.findByIndex('date', date);
  }

  /**
   * Get reminders due on or before a date
   * @param {string} date - Date (YYYY-MM-DD)
   * @returns {Promise<Array>}
   */
  async findDueOnOrBefore(date) {
    const activeReminders = await this.findActive();
    return activeReminders.filter(r => r.date <= date);
  }

  /**
   * Get upcoming reminders within days
   * @param {number} days - Number of days to look ahead
   * @returns {Promise<Array>}
   */
  async findUpcoming(days = 7) {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const activeReminders = await this.findActive();
    return activeReminders.filter(r => r.date >= today && r.date <= futureDateStr);
  }

  /**
   * Get financial reminders (income/expense)
   * @returns {Promise<Array>}
   */
  async findFinancial() {
    const allReminders = await this.findAll();
    return allReminders.filter(
      r => r.type === ReminderType.INCOME || r.type === ReminderType.EXPENSE
    );
  }

  /**
   * Get generic reminders
   * @returns {Promise<Array>}
   */
  async findGeneric() {
    return this.findByType(ReminderType.GENERIC);
  }

  /**
   * Create a new reminder
   * @param {Object} data - Reminder data
   * @param {string} data.title - Reminder title
   * @param {string} data.type - Reminder type (income/expense/generic)
   * @param {string} data.date - Date (YYYY-MM-DD)
   * @param {string} data.frequency - Frequency (once/daily/weekly/monthly/yearly)
   * @param {string} [data.description] - Description
   * @param {number} [data.amount] - Amount (required for financial)
   * @param {string} [data.accountId] - Account ID (required for financial)
   * @param {string} [data.categoryId] - Category ID (required for financial)
   * @param {string} [data.endDate] - End date for recurring
   * @param {boolean} [data.isActive=true] - Active status
   * @returns {Promise<string>} ID of created reminder
   */
  async create(data) {
    const reminderData = {
      ...data,
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return super.create(reminderData);
  }

  /**
   * Create a financial reminder (income/expense)
   * @param {Object} data - Reminder data
   * @param {string} data.type - 'income' or 'expense'
   * @returns {Promise<string>} ID of created reminder
   */
  async createFinancial(data) {
    return this.create({
      ...data,
      type: data.type,
      amount: data.amount,
      accountId: data.accountId,
      categoryId: data.categoryId,
    });
  }

  /**
   * Create a generic reminder
   * @param {Object} data - Reminder data
   * @returns {Promise<string>} ID of created reminder
   */
  async createGeneric(data) {
    return this.create({
      ...data,
      type: ReminderType.GENERIC,
      amount: undefined,
      accountId: undefined,
      categoryId: undefined,
    });
  }

  /**
   * Toggle reminder active status
   * @param {string} id - Reminder ID
   * @returns {Promise<string>} ID of updated reminder
   */
  async toggleActive(id) {
    const reminder = await this.findById(id);
    if (!reminder) {
      throw new Error(`Reminder with id ${id} not found`);
    }
    return this.update(id, { isActive: !reminder.isActive });
  }

  /**
   * Get reminders that should trigger today
   * @returns {Promise<Array>}
   */
  async findTodaysReminders() {
    const today = new Date().toISOString().split('T')[0];
    return this.findByDate(today);
  }

  /**
   * Validate reminder data
   * @param {Object} data - Reminder data
   * @returns {Object} Validated data
   */
  validate(data) {
    return CreateReminderSchema.parse(data);
  }

  /**
   * Validate update data
   * @param {Object} data - Update data
   * @returns {Object} Validated data
   */
  validateUpdate(data) {
    return UpdateReminderSchema.parse(data);
  }
}

export default new ReminderRepository();
