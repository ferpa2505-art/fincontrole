/**
 * Global reactive state store for fincontrole PWA
 * Connects repositories with observer pattern for state management
 *
 * Called by:
 * - src/router/index.js (client-side routing)
 * - src/i18n/index.js (internationalization)
 * - Feature modules (future)
 *
 * Architecture:
 * - Central state object with reactive getters
 * - Observer pattern via EventEmitter
 * - Memory cache for performance
 * - Integrates with IndexedDB and localStorage fallback
 */

import logger from '../utils/logger.js';
import { CURRENT_VERSION } from '../storage/migrations.js';
import {
  STORES,
  getAll as fallbackGetAll,
  getById as fallbackGetById,
  put as fallbackPut,
  del as fallbackDel,
  getByIndex as fallbackGetByIndex,
  clear as fallbackClear,
  count as fallbackCount,
} from '../storage/fallback.js';

/**
 * Application state structure
 * @typedef {Object} AppState
 * @property {Array} accounts - Accounts data
 * @property {Array} transactions - Transactions data
 * @property {Array} categories - Categories data
 * @property {Array} reminders - Reminders data
 * @property {Object} settings - App settings
 * @property {number} version - Database version
 */

/**
 * Create the initial state object from repositories
 * @returns {AppState} Initial state
 */
function createInitialState() {
  return {
    accounts: [],
    transactions: [],
    categories: [],
    reminders: [],
    settings: {},
    version: CURRENT_VERSION,
  };
}

/**
 * State Store class with observer pattern
 * Manages global reactive state and notifies subscribers of changes
 */
class StateStore {
  constructor() {
    this.state = createInitialState();
    this.observers = new Map(); // storeName -> Array of callbacks
    this.initialized = false;
    logger.info('[StateStore] Initializing state store');
  }

  /**
   * Initialize the store - load data from IndexedDB or localStorage fallback
   * @returns {Promise<void>}
   */
  async init() {
    if (this.initialized) {
      logger.debug('[StateStore] Already initialized');
      return;
    }

    logger.info('[StateStore] Initializing from storage layer');
    this.initialized = true;

    try {
      // Load all store data from repositories via fallback
      const stores = [
        STORES.ACCOUNTS,
        STORES.TRANSACTIONS,
        STORES.CATEGORIES,
        STORES.REMINDERS,
        STORES.SETTINGS,
      ];

      for (const storeName of stores) {
        const items = await fallbackGetAll(storeName);
        this._setStore(storeName, items);
      }

      logger.info('[StateStore] Initialized with data from storage');
    } catch (error) {
      logger.error('[StateStore] Failed to initialize:', error);
      // Keep empty state as fallback
      this.state = createInitialState();
    }
  }

  /**
   * Internal method to set store data and notify observers
   * @param {string} storeName - Name of the store
   * @param {Array} items - Items to store
   * @private
   */
  _setStore(storeName, items) {
    // Normalize settings to object (not array) for consistency
    if (storeName === STORES.SETTINGS) {
      this.state[storeName] = Array.isArray(items) && items.length > 0 ? items[0] : {};
    } else {
      this.state[storeName] = items;
    }
    this._notifyObservers(storeName, items);
  }

  /**
   * Subscribe to state changes for a specific store
   * @param {string} storeName - Name of the store to observe
   * @param {Function} callback - Callback function receiving new items array
   * @returns {Function} Unsubscribe function
   */
  subscribe(storeName, callback) {
    if (!this.observers.has(storeName)) {
      this.observers.set(storeName, []);
    }
    this.observers.get(storeName).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.observers.get(storeName);
      if (callbacks) {
        this.observers.set(
          storeName,
          callbacks.filter(c => c !== callback)
        );
      }
    };
  }

  /**
   * Notify all observers for a store
   * @param {string} storeName - Name of the store
   * @param {Array} items - New items array
   * @private
   */
  _notifyObservers(storeName, items) {
    const callbacks = this.observers.get(storeName);
    if (callbacks && callbacks.length > 0) {
      callbacks.forEach(callback => {
        try {
          callback(items);
        } catch (error) {
          logger.warn(`[StateStore] Observer error for ${storeName}:`, error);
        }
      });
    }
  }

  /**
   * Get all items from a store
   * @param {string} storeName - Name of the store
   * @returns {Promise<Array>} Array of items
   */
  async getAll(storeName) {
    return fallbackGetAll(storeName);
  }

  /**
   * Get an item by ID from a store
   * @param {string} storeName - Name of the store
   * @param {string} id - Item ID
   * @returns {Promise<Object|null>} Item or null
   */
  async getById(storeName, id) {
    return fallbackGetById(storeName, id);
  }

  /**
   * Add or update an item in a store
   * @param {string} storeName - Name of the store
   * @param {Object} item - Item to store
   * @returns {Promise<string>} ID of the stored item
   */
  async put(storeName, item) {
    const result = await fallbackPut(storeName, item);
    // Refresh state from storage after put
    await this.refreshStore(storeName);
    return result;
  }

  /**
   * Delete an item by ID from a store
   * @param {string} storeName - Name of the store
   * @param {string} id - Item ID
   * @returns {Promise<void>}
   */
  async del(storeName, id) {
    await fallbackDel(storeName, id);
    // Refresh state from storage after del
    await this.refreshStore(storeName);
  }

  /**
   * Get items by index from a store
   * @param {string} storeName - Name of the store
   * @param {string} indexName - Index name
   * @param {*} value - Value to query
   * @returns {Promise<Array>} Array of matching items
   */
  async getByIndex(storeName, indexName, value) {
    return fallbackGetByIndex(storeName, indexName, value);
  }

  /**
   * Clear all items in a store
   * @param {string} storeName - Name of the store
   * @returns {Promise<void>}
   */
  async clear(storeName) {
    await fallbackClear(storeName);
    // Refresh state from storage after clear
    await this.refreshStore(storeName);
  }

  /**
   * Count items in a store
   * @param {string} storeName - Name of the store
   * @returns {Promise<number>} Number of items
   */
  async count(storeName) {
    return fallbackCount(storeName);
  }

  /**
   * Refresh state from storage for a specific store
   * @param {string} storeName - Name of the store to refresh
   * @returns {Promise<void>}
   */
  async refreshStore(storeName) {
    const items = await fallbackGetAll(storeName);
    this.state[storeName] = items;
    this._notifyObservers(storeName, items);
    logger.debug(`[StateStore] Refreshed store ${storeName} with ${items.length} items`);
  }

  /**
   * Get the current application state
   * @returns {AppState} Current state object (deep copy)
   */
  getState() {
    return structuredClone(this.state);
  }

  /**
   * Get a specific slice of state
   * @param {string} key - State key (accounts, transactions, categories, reminders, settings)
   * @returns {Object|null} State slice or null
   */
  getSlice(key) {
    return key ? structuredClone(this.state[key]) || null : null;
  }

  /**
   * Update settings specifically
   * @param {Object} newSettings - New settings object
   * @returns {Promise<Object>} Updated settings
   */
  async updateSettings(newSettings) {
    const current = this.state.settings || {};
    const updated = {
      ...current,
      ...newSettings,
      updatedAt: new Date().toISOString(),
    };
    this.state.settings = updated;
    // Notify observers with array for consistency with other stores
    this._notifyObservers(STORES.SETTINGS, [updated]);
    logger.info('[StateStore] Settings updated');
    return updated;
  }

  /**
   * Reset state to defaults
   * @returns {Promise<void>}
   */
  async reset() {
    // Clear observers FIRST to prevent any notifications during reset
    this.observers.clear();
    // Reset state to defaults
    this.state = createInitialState();
    logger.info('[StateStore] State reset to defaults');
  }

  /**
   * Notify all observers across all stores from a snapshot
   * @param {Object} snapshot - State snapshot to notify with
   * @private
   */
  _notifyAllFromSnapshot(snapshot) {
    for (const storeName of Object.keys(snapshot)) {
      const items = snapshot[storeName] || [];
      this._notifyObservers(storeName, items);
    }
  }

  /**
   * Get the current database version
   * @returns {number}
   */
  getVersion() {
    return this.state.version;
  }

  /**
   * Check if store has data
   * @param {string} storeName - Name of the store
   * @returns {boolean}
   */
  async hasData(storeName) {
    const items = await fallbackCount(storeName);
    return items > 0;
  }
}

// Export singleton instance
export const store = new StateStore();

export default store;
