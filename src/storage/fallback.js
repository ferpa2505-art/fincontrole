/**
 * localStorage fallback for IndexedDB
 * Provides the same API surface as idb.js using localStorage
 * Used when IndexedDB is unavailable (private browsing, old browsers, quota exceeded)
 *
 * Called by:
 * - src/storage/idb.js (when isAvailable() returns false)
 * - src/state/store.js (state management initialization)
 *
 * Data schemas (from src/schemas/):
 * - accounts.js: AccountSchema, CreateAccountSchema, UpdateAccountSchema
 * - transactions.js: TransactionSchema, CreateTransactionSchema, UpdateTransactionSchema
 * - categories.js: CategorySchema, CreateCategorySchema, UpdateCategorySchema
 * - reminders.js: ReminderSchema, CreateReminderSchema, UpdateReminderSchema
 * - settings.js: SettingsSchema, CreateSettingsSchema, UpdateSettingsSchema
 *
 * No existing file serves the same purpose - this is the first localStorage fallback implementation
 * User instruction: "ok pode implementar todos este abaixo" - implement Phase 1.2 Storage Layer
 */
import logger from '../utils/logger.js';

// Store names (must match STORES in idb.js)
export const STORES = {
  ACCOUNTS: 'accounts',
  TRANSACTIONS: 'transactions',
  CATEGORIES: 'categories',
  REMINDERS: 'reminders',
  SETTINGS: 'settings',
  BACKUPS: 'backups',
  MIGRATIONS: 'migrations',
};

// Prefix for all localStorage keys
const STORAGE_PREFIX = 'fincontrole_';

/**
 * Get the localStorage key for a store
 * @param {string} storeName - Store name
 * @returns {string} localStorage key
 */
function getStoreKey(storeName) {
  return `${STORAGE_PREFIX}${storeName}`;
}

/**
 * Get the localStorage key for an index
 * @param {string} storeName - Store name
 * @param {string} indexName - Index name
 * @param {*} value - Index value
 * @returns {string} localStorage key
 */
function getIndexKey(storeName, indexName, value) {
  // For primitive values, use the value directly to avoid JSON.stringify quotes
  // For objects/arrays, use JSON.stringify
  const stringValue =
    typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
      ? String(value)
      : JSON.stringify(value);
  return `${STORAGE_PREFIX}${storeName}_index_${indexName}_${stringValue}`;
}

/**
 * Read all data from a store
 * @param {string} storeName - Store name
 * @returns {Array} Array of items
 */
function readStore(storeName) {
  try {
    const data = localStorage.getItem(getStoreKey(storeName));
    return data ? JSON.parse(data) : [];
  } catch (e) {
    logger.warn(`[Fallback] Failed to read store ${storeName}:`, e);
    return [];
  }
}

/**
 * Write all data to a store
 * @param {string} storeName - Store name
 * @param {Array} data - Data to write
 */
function writeStore(storeName, data) {
  try {
    localStorage.setItem(getStoreKey(storeName), JSON.stringify(data));
  } catch (e) {
    logger.error(`[Fallback] Failed to write store ${storeName}:`, e);
    throw new Error(`Storage quota exceeded for ${storeName}`);
  }
}

/**
 * Update index for a store
 * @param {string} storeName - Store name
 * @param {string} indexName - Index name
 * @param {*} value - Index value
 * @param {Array} items - Items to index
 */
function updateIndex(storeName, indexName, value, items) {
  try {
    const key = getIndexKey(storeName, indexName, value);
    // items are already pre-filtered for this value, just use them directly
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    logger.warn(`[Fallback] Failed to update index ${indexName} for ${storeName}:`, e);
  }
}

/**
 * Rebuild all indexes for a store
 * @param {string} storeName - Store name
 * @param {Array} items - Items to index
 */
function rebuildIndexes(storeName, items) {
  const indexNames = {
    [STORES.TRANSACTIONS]: ['accountId', 'categoryId', 'date', 'type'],
    [STORES.REMINDERS]: ['accountId', 'categoryId', 'date', 'isActive'],
    [STORES.ACCOUNTS]: ['type', 'isActive'],
    [STORES.CATEGORIES]: ['type', 'isActive'],
  };

  const indexes = indexNames[storeName] || [];
  for (const indexName of indexes) {
    const grouped = items.reduce((acc, item) => {
      const value = item[indexName];
      if (value !== undefined && value !== null) {
        // Use a key that preserves the original type for proper lookup
        const key =
          typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
            ? value
            : JSON.stringify(value);
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
      }
      return acc;
    }, {});

    for (const [value, matchingItems] of Object.entries(grouped)) {
      // Need to parse back the original value type for updateIndex
      // Object.keys always returns strings, so we need to handle booleans specially
      let originalValue = value;
      if (value === 'true') originalValue = true;
      else if (value === 'false') originalValue = false;
      else if (!isNaN(value) && value !== '') originalValue = Number(value);
      updateIndex(storeName, indexName, originalValue, matchingItems);
    }
  }
}

/**
 * Get all items from a store
 * @param {string} storeName - Name of the store
 * @returns {Promise<Array>} Array of items
 */
export async function getAll(storeName) {
  return readStore(storeName);
}

/**
 * Get an item by its ID
 * @param {string} storeName - Name of the store
 * @param {string} id - Item ID
 * @returns {Promise<Object|null>} Item or null if not found
 */
export async function getById(storeName, id) {
  const items = readStore(storeName);
  return items.find(item => item.id === id) ?? null;
}

/**
 * Add or update an item
 * @param {string} storeName - Name of the store
 * @param {Object} item - Item to store
 * @returns {Promise<string>} ID of the stored item
 */
export async function put(storeName, item) {
  const items = readStore(storeName);
  const existingIndex = items.findIndex(i => i.id === item.id);

  if (existingIndex >= 0) {
    items[existingIndex] = { ...item, updatedAt: new Date().toISOString() };
  } else {
    items.push({
      ...item,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  writeStore(storeName, items);
  rebuildIndexes(storeName, items);

  return item.id;
}

/**
 * Delete an item by ID
 * @param {string} storeName - Name of the store
 * @param {string} id - Item ID
 * @returns {Promise<void>}
 */
export async function del(storeName, id) {
  const items = readStore(storeName);
  const filtered = items.filter(item => item.id !== id);

  if (filtered.length === items.length) {
    return; // Item not found, no-op
  }

  writeStore(storeName, filtered);
  rebuildIndexes(storeName, filtered);
}

/**
 * Get items by index
 * @param {string} storeName - Name of the store
 * @param {string} indexName - Name of the index
 * @param {*} value - Value to query
 * @returns {Promise<Array>} Array of matching items
 */
export async function getByIndex(storeName, indexName, value) {
  try {
    const key = getIndexKey(storeName, indexName, value);
    const data = localStorage.getItem(key);
    // If index exists but is empty array, return it
    if (data !== null) {
      return data ? JSON.parse(data) : [];
    }
    // Index key not found (null), fall back to scanning store
    const items = readStore(storeName);
    return items.filter(item => item[indexName] === value);
  } catch (e) {
    logger.warn(`[Fallback] Failed to read index ${indexName} for ${storeName}:`, e);
    // Fallback to scanning all items
    const items = readStore(storeName);
    return items.filter(item => item[indexName] === value);
  }
}

/**
 * Clear all items in a store
 * @param {string} storeName - Name of the store
 * @returns {Promise<void>}
 */
export async function clear(storeName) {
  writeStore(storeName, []);

  // Clear indexes
  const indexNames = {
    [STORES.TRANSACTIONS]: ['accountId', 'categoryId', 'date', 'type'],
    [STORES.REMINDERS]: ['accountId', 'categoryId', 'date', 'isActive'],
    [STORES.ACCOUNTS]: ['type', 'isActive'],
    [STORES.CATEGORIES]: ['type', 'isActive'],
  };

  const indexes = indexNames[storeName] || [];
  for (const indexName of indexes) {
    try {
      // Find and remove all index keys for this store/index
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${STORAGE_PREFIX}${storeName}_index_${indexName}_`)) {
          keysToRemove.push(key);
        }
      }
      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      logger.warn(`[Fallback] Failed to clear index ${indexName} for ${storeName}:`, e);
    }
  }
}

/**
 * Count items in a store
 * @param {string} storeName - Name of the store
 * @returns {Promise<number>} Number of items
 */
export async function count(storeName) {
  const items = readStore(storeName);
  return items.length;
}

/**
 * Execute multiple operations in a transaction-like batch
 * @param {Array<Object>} operations - Array of operations
 * @param {string} operations[].store - Store name
 * @param {string} operations[].type - Operation type: 'put' | 'delete'
 * @param {Object} operations[].data - Data for put operations
 * @param {string} operations[].id - ID for delete operations
 * @returns {Promise<void>}
 */
export async function transaction(operations) {
  // Group operations by store
  const operationsByStore = operations.reduce((acc, op) => {
    if (!acc[op.store]) acc[op.store] = [];
    acc[op.store].push(op);
    return acc;
  }, {});

  // Apply all operations per store
  for (const [storeName, ops] of Object.entries(operationsByStore)) {
    const items = readStore(storeName);

    for (const op of ops) {
      if (op.type === 'put') {
        const existingIndex = items.findIndex(i => i.id === op.data.id);
        if (existingIndex >= 0) {
          items[existingIndex] = { ...op.data, updatedAt: new Date().toISOString() };
        } else {
          items.push({
            ...op.data,
            createdAt: op.data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } else if (op.type === 'delete') {
        const index = items.findIndex(i => i.id === op.id);
        if (index >= 0) {
          items.splice(index, 1);
        }
      }
    }

    writeStore(storeName, items);
    rebuildIndexes(storeName, items);
  }
}

/**
 * Check if localStorage is available
 * @returns {boolean}
 */
export function isAvailable() {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Close the fallback (no-op for localStorage)
 */
export function close() {
  // No-op for localStorage
}

/**
 * Delete all fincontrole data from localStorage
 * @returns {Promise<void>}
 */
export async function deleteDB() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  for (const key of keysToRemove) {
    localStorage.removeItem(key);
  }
}

export default {
  getAll,
  getById,
  put,
  del,
  getByIndex,
  clear,
  count,
  transaction,
  isAvailable,
  close,
  deleteDB,
  STORES,
};
