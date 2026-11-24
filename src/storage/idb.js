/**
 * IndexedDB wrapper for fincontrole
 * Provides a promise-based API for IndexedDB operations
 * Uses the 'idb' library internally
 *
 * Called by:
 * - src/storage/repositories/*.js (repository classes for accounts, transactions, categories, reminders, settings)
 * - src/storage/migrations.js (migration system)
 * - src/storage/fallback.js (localStorage fallback)
 * - Future: State management layer (src/state/store.js)
 *
 * Data schemas (from src/schemas/):
 * - accounts.js: AccountSchema, CreateAccountSchema, UpdateAccountSchema
 * - transactions.js: TransactionSchema, CreateTransactionSchema, UpdateTransactionSchema
 * - categories.js: CategorySchema, CreateCategorySchema, UpdateCategorySchema
 * - reminders.js: ReminderSchema, CreateReminderSchema, UpdateReminderSchema
 * - settings.js: SettingsSchema, CreateSettingsSchema, UpdateSettingsSchema
 *
 * No existing file serves the same purpose - this is the first storage layer implementation
 * User instruction: "ok pode implementar todos este abaixo" - implement Phase 1.2 Storage Layer
 */

import { openDB as idbOpenDB, deleteDB as idbDeleteDB } from 'idb';

// Database configuration
const DB_NAME = 'fincontrole';
const DB_VERSION = 1;

// Store names
export const STORES = {
  ACCOUNTS: 'accounts',
  TRANSACTIONS: 'transactions',
  CATEGORIES: 'categories',
  REMINDERS: 'reminders',
  SETTINGS: 'settings',
  BACKUPS: 'backups',
  MIGRATIONS: 'migrations',
};

// Index definitions
const INDEXES = {
  [STORES.TRANSACTIONS]: ['accountId', 'categoryId', 'date', 'type'],
  [STORES.REMINDERS]: ['accountId', 'categoryId', 'date', 'isActive'],
  [STORES.ACCOUNTS]: ['type', 'isActive'],
  [STORES.CATEGORIES]: ['type', 'isActive'],
};

let dbInstance = null;

/**
 * Open the IndexedDB database
 * @returns {Promise<IDBDatabase>} Database instance
 */
export async function openDB() {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await idbOpenDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create object stores
      const accountsStore = db.createObjectStore(STORES.ACCOUNTS, { keyPath: 'id' });
      accountsStore.createIndex('type', 'type');
      accountsStore.createIndex('isActive', 'isActive');

      const transactionsStore = db.createObjectStore(STORES.TRANSACTIONS, { keyPath: 'id' });
      transactionsStore.createIndex('accountId', 'accountId');
      transactionsStore.createIndex('categoryId', 'categoryId');
      transactionsStore.createIndex('date', 'date');
      transactionsStore.createIndex('type', 'type');

      const categoriesStore = db.createObjectStore(STORES.CATEGORIES, { keyPath: 'id' });
      categoriesStore.createIndex('type', 'type');
      categoriesStore.createIndex('isActive', 'isActive');

      const remindersStore = db.createObjectStore(STORES.REMINDERS, { keyPath: 'id' });
      remindersStore.createIndex('accountId', 'accountId');
      remindersStore.createIndex('categoryId', 'categoryId');
      remindersStore.createIndex('date', 'date');
      remindersStore.createIndex('isActive', 'isActive');

      db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
      db.createObjectStore(STORES.BACKUPS, { keyPath: 'id' });
      db.createObjectStore(STORES.MIGRATIONS, { keyPath: 'version' });
    },
  });

  return dbInstance;
}

/**
 * Get all items from a store
 * @param {string} storeName - Name of the store
 * @returns {Promise<Array>} Array of items
 */
export async function getAll(storeName) {
  const db = await openDB();
  return db.transaction(storeName).objectStore(storeName).getAll();
}

/**
 * Get an item by its ID
 * @param {string} storeName - Name of the store
 * @param {string} id - Item ID
 * @returns {Promise<Object|null>} Item or null if not found
 */
export async function getById(storeName, id) {
  const db = await openDB();
  const result = await db.transaction(storeName).objectStore(storeName).get(id);
  return result ?? null;
}

/**
 * Add or update an item
 * @param {string} storeName - Name of the store
 * @param {Object} item - Item to store
 * @returns {Promise<string>} ID of the stored item
 */
export async function put(storeName, item) {
  const db = await openDB();
  return db.transaction(storeName, 'readwrite').objectStore(storeName).put(item);
}

/**
 * Delete an item by ID
 * @param {string} storeName - Name of the store
 * @param {string} id - Item ID
 * @returns {Promise<void>}
 */
export async function del(storeName, id) {
  const db = await openDB();
  return db.transaction(storeName, 'readwrite').objectStore(storeName).delete(id);
}

/**
 * Get items by index
 * @param {string} storeName - Name of the store
 * @param {string} indexName - Name of the index
 * @param {*} value - Value to query
 * @returns {Promise<Array>} Array of matching items
 */
export async function getByIndex(storeName, indexName, value) {
  const db = await openDB();
  return db.transaction(storeName).objectStore(storeName).index(indexName).getAll(value);
}

/**
 * Clear all items in a store
 * @param {string} storeName - Name of the store
 * @returns {Promise<void>}
 */
export async function clear(storeName) {
  const db = await openDB();
  return db.transaction(storeName, 'readwrite').objectStore(storeName).clear();
}

/**
 * Count items in a store
 * @param {string} storeName - Name of the store
 * @returns {Promise<number>} Number of items
 */
export async function count(storeName) {
  const db = await openDB();
  return db.transaction(storeName).objectStore(storeName).count();
}

/**
 * Execute multiple operations in a transaction
 * @param {Array<Object>} operations - Array of operations
 * @param {string} operations[].store - Store name
 * @param {string} operations[].type - Operation type: 'put' | 'delete'
 * @param {Object} operations[].data - Data for put operations
 * @param {string} operations[].id - ID for delete operations
 * @returns {Promise<void>}
 */
export async function transaction(operations) {
  const db = await openDB();

  const storeNames = [...new Set(operations.map(op => op.store))];
  const tx = db.transaction(storeNames, 'readwrite');

  for (const op of operations) {
    const store = tx.objectStore(op.store);
    if (op.type === 'put') {
      store.put(op.data);
    } else if (op.type === 'delete') {
      store.delete(op.id);
    }
  }

  return tx.done;
}

/**
 * Close the database connection
 */
export function close() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Check if IndexedDB is available
 * @returns {boolean}
 */
export function isAvailable() {
  return typeof indexedDB !== 'undefined';
}

/**
 * Set database instance for testing
 * @param {IDBDatabase} db - Mock database instance
 */
export function setDBForTesting(db) {
  dbInstance = db;
}

/**
 * Delete the database
 * @returns {Promise<void>}
 */
export async function deleteDB() {
  close();
  return idbDeleteDB(DB_NAME);
}
