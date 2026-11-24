/**
 * Base repository class for IndexedDB operations
 * Provides common CRUD operations using the IDB wrapper
 *
 * Called by:
 * - src/storage/repositories/AccountRepository.js
 * - src/storage/repositories/TransactionRepository.js
 * - src/storage/repositories/CategoryRepository.js
 * - src/storage/repositories/ReminderRepository.js
 * - src/storage/repositories/SettingsRepository.js
 *
 * Uses:
 * - src/storage/idb.js for database operations (getAll, getById, put, del, getByIndex, count, transaction)
 * - src/schemas/*.js for validation (AccountSchema, TransactionSchema, CategorySchema, ReminderSchema, SettingsSchema)
 *
 * No existing file serves the same purpose - this is the first repository implementation
 * User instruction: "ok pode implementar todos este abaixo" - implement Phase 1.2 Storage Layer
 */
import {
  openDB,
  getAll,
  getById,
  put,
  del,
  getByIndex,
  count,
  transaction,
  close,
} from '../idb.js';
import { STORES } from '../idb.js';

/**
 * Base repository with common CRUD operations
 * @template T - Entity type
 * @template CreateT - Create DTO type
 * @template UpdateT - Update DTO type
 */
export class BaseRepository {
  /**
   * @param {string} storeName - Name of the IndexedDB store
   * @param {import('zod').ZodSchema} schema - Zod schema for validation
   */
  constructor(storeName, schema) {
    this.storeName = storeName;
    this.schema = schema;
  }

  /**
   * Get all entities
   * @returns {Promise<Array<T>>}
   */
  async findAll() {
    return getAll(this.storeName);
  }

  /**
   * Get entity by ID
   * @param {string} id - Entity ID
   * @returns {Promise<T|null>}
   */
  async findById(id) {
    return getById(this.storeName, id);
  }

  /**
   * Create a new entity
   * @param {CreateT} data - Entity data
   * @returns {Promise<string>} ID of created entity
   */
  async create(data) {
    const validated = this.schema.parse(data);
    return put(this.storeName, validated);
  }

  /**
   * Update an existing entity
   * @param {string} id - Entity ID
   * @param {UpdateT} data - Updated data
   * @returns {Promise<string>} ID of updated entity
   */
  async update(id, data) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`${this.storeName} with id ${id} not found`);
    }
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    const validated = this.schema.parse(updated);
    return put(this.storeName, validated);
  }

  /**
   * Delete an entity by ID
   * @param {string} id - Entity ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    return del(this.storeName, id);
  }

  /**
   * Find entities by index
   * @param {string} indexName - Index name
   * @param {*} value - Value to query
   * @returns {Promise<Array<T>>}
   */
  async findByIndex(indexName, value) {
    return getByIndex(this.storeName, indexName, value);
  }

  /**
   * Count total entities
   * @returns {Promise<number>}
   */
  async count() {
    return count(this.storeName);
  }

  /**
   * Execute multiple operations in a transaction
   * @param {Array<{store: string, type: 'put'|'delete', data?: Object, id?: string}>} operations
   * @returns {Promise<void>}
   */
  async transaction(operations) {
    return transaction(operations);
  }
}

export default BaseRepository;
