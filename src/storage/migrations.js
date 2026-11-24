/**
 * Database migration system for IndexedDB
 * Handles schema versioning and data migrations between versions
 *
 * Called by:
 * - src/storage/idb.js (during database upgrade)
 * - src/state/store.js (on app initialization)
 *
 * Uses:
 * - src/storage/idb.js for database operations
 * - src/schemas/*.js for validation
 *
 * No existing file serves the same purpose - this is the first migration system implementation
 * User instruction: "ok pode implementar todos este abaixo" - implement Phase 1.2 Storage Layer
 */
import { openDB, put, getById, getAll, del, STORES, DB_VERSION } from './idb.js';
import logger from '../utils/logger.js';

/**
 * Current database version
 * @type {number}
 */
export const CURRENT_VERSION = DB_VERSION;

/**
 * Migration registry - maps version numbers to migration functions
 * Each migration function receives the database and should return a promise
 * @type {Object<number, Function>}
 */
export const migrations = {
  /**
   * Version 1: Initial schema
   * Creates all stores and indexes (handled by idb.js upgrade function)
   * @param {IDBDatabase} db - Database instance
   * @returns {Promise<void>}
   */
  1: async db => {
    // Initial schema is created in idb.js upgrade function
    // This migration just marks version 1 as applied
    logger.info('[Migrations] Version 1: Initial schema applied');
  },

  /**
   * Version 2: Example - Add new index to transactions
   * @param {IDBDatabase} db - Database instance
   * @returns {Promise<void>}
   */
  // 2: async (db) => {
  //   if (!db.objectStoreNames.contains(STORES.TRANSACTIONS)) return
  //   const tx = db.transaction(STORES.TRANSACTIONS, 'readwrite')
  //   const store = tx.objectStore(STORES.TRANSACTIONS)
  //   if (!store.indexNames.contains('description')) {
  //     store.createIndex('description', 'description')
  //   }
  //   console.log('[Migrations] Version 2: Added description index to transactions')
  // },

  /**
   * Version 3: Example - Add backup store
   * @param {IDBDatabase} db - Database instance
   * @returns {Promise<void>}
   */
  // 3: async (db) => {
  //   if (!db.objectStoreNames.contains(STORES.BACKUPS)) {
  //     const tx = db.transaction(STORES.BACKUPS, 'readwrite')
  //     tx.objectStore(STORES.BACKUPS).createIndex('createdAt', 'createdAt')
  //   }
  //   console.log('[Migrations] Version 3: Added backups store with createdAt index')
  // }
};

/**
 * Run all pending migrations
 * @param {IDBDatabase} db - Database instance
 * @param {number} currentVersion - Current database version
 * @returns {Promise<void>}
 */
export async function runMigrations(db, currentVersion) {
  const targetVersion = CURRENT_VERSION;

  if (currentVersion >= targetVersion) {
    logger.info('[Migrations] Database is up to date');
    return;
  }

  logger.info(`[Migrations] Running migrations from v${currentVersion} to v${targetVersion}`);

  for (let version = currentVersion + 1; version <= targetVersion; version++) {
    const migration = migrations[version];
    if (migration) {
      logger.info(`[Migrations] Applying version ${version}`);
      await migration(db);
      // Record migration as applied
      await recordMigration(version);
    } else {
      logger.warn(`[Migrations] No migration function for version ${version}`);
    }
  }

  logger.info('[Migrations] All migrations completed');
}

/**
 * Record a migration as applied
 * @param {number} version - Migration version
 * @returns {Promise<void>}
 */
async function recordMigration(version) {
  const db = await openDB();
  const tx = db.transaction(STORES.MIGRATIONS, 'readwrite');
  const store = tx.objectStore(STORES.MIGRATIONS);
  store.put({ version, appliedAt: new Date().toISOString() });
  await tx.done;
}

/**
 * Get applied migrations
 * @returns {Promise<Array>}
 */
export async function getAppliedMigrations() {
  const db = await openDB();
  const tx = db.transaction(STORES.MIGRATIONS, 'readonly');
  const store = tx.objectStore(STORES.MIGRATIONS);
  const result = await store.getAll();
  await tx.done;
  return result;
}

/**
 * Check if a specific migration was applied
 * @param {number} version - Migration version
 * @returns {Promise<boolean>}
 */
export async function isMigrationApplied(version) {
  const db = await openDB();
  const tx = db.transaction(STORES.MIGRATIONS, 'readonly');
  const store = tx.objectStore(STORES.MIGRATIONS);
  const result = await store.get(version);
  await tx.done;
  return !!result;
}

/**
 * Reset migration history (for testing)
 * @returns {Promise<void>}
 */
export async function resetMigrations() {
  const db = await openDB();
  const tx = db.transaction(STORES.MIGRATIONS, 'readwrite');
  const store = tx.objectStore(STORES.MIGRATIONS);
  store.clear();
  await tx.done;
}

/**
 * Initialize migration tracking store
 * Called during database upgrade
 * @param {IDBDatabase} db - Database instance
 * @returns {Promise<void>}
 */
export async function initMigrationStore(db) {
  if (!db.objectStoreNames.contains(STORES.MIGRATIONS)) {
    db.createObjectStore(STORES.MIGRATIONS, { keyPath: 'version' });
  }
}

/**
 * Create a backup before running migrations
 * @returns {Promise<string>} Backup ID
 */
export async function createPreMigrationBackup() {
  const backupId = `pre-migration-${Date.now()}`;
  const data = {};

  const stores = Object.values(STORES).filter(s => s !== STORES.MIGRATIONS && s !== STORES.BACKUPS);

  for (const storeName of stores) {
    data[storeName] = await getAll(storeName);
  }

  await put(STORES.BACKUPS, {
    id: backupId,
    type: 'pre-migration',
    data,
    createdAt: new Date().toISOString(),
    version: CURRENT_VERSION,
  });

  return backupId;
}

/**
 * Restore from a backup
 * @param {string} backupId - Backup ID
 * @returns {Promise<void>}
 */
export async function restoreFromBackup(backupId) {
  const backup = await getById(STORES.BACKUPS, backupId);
  if (!backup) {
    throw new Error(`Backup ${backupId} not found`);
  }

  const stores = Object.keys(backup.data).filter(
    s => s !== STORES.MIGRATIONS && s !== STORES.BACKUPS
  );

  for (const storeName of stores) {
    await clearStore(storeName);
    for (const item of backup.data[storeName]) {
      await put(storeName, item);
    }
  }
}

/**
 * Clear a store
 * @param {string} storeName - Store name
 * @returns {Promise<void>}
 */
async function clearStore(storeName) {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  store.clear();
  await tx.done;
}

/**
 * List all backups
 * @returns {Promise<Array>}
 */
export async function listBackups() {
  return getAll(STORES.BACKUPS);
}

/**
 * Delete a backup
 * @param {string} backupId - Backup ID
 * @returns {Promise<void>}
 */
export async function deleteBackup(backupId) {
  await del(STORES.BACKUPS, backupId);
}

export default {
  migrations,
  runMigrations,
  getAppliedMigrations,
  isMigrationApplied,
  resetMigrations,
  initMigrationStore,
  createPreMigrationBackup,
  restoreFromBackup,
  listBackups,
  deleteBackup,
  CURRENT_VERSION,
};
