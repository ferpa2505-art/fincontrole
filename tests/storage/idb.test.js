import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Tests for IDB wrapper (src/storage/idb.js)
 * - Tests openDB, getAll, getById, put, delete, getByIndex, clear, count, transaction, close, isAvailable
 * - No existing test file for this module - this is the first creation
 * - User instruction: "ok pode implementar todos este abaixo" - implement Phase 1.2 Storage Layer
 */

// Mock IndexedDB and IDBRequest for Node.js environment
class MockIDBRequest {
  constructor() {
    this.onsuccess = null;
    this.onerror = null;
    this.onupgradeneeded = null;
    this.result = null;
    this.error = null;
    this.readyState = 'pending';
    this._listeners = {};
  }

  addEventListener(type, listener) {
    if (!this._listeners[type]) {
      this._listeners[type] = [];
    }
    this._listeners[type].push(listener);
  }

  removeEventListener(type, listener) {
    if (this._listeners[type]) {
      this._listeners[type] = this._listeners[type].filter(l => l !== listener);
    }
  }

  dispatchEvent(event) {
    const type = event.type;
    if (this._listeners[type]) {
      this._listeners[type].forEach(listener => listener(event));
    }
    // Also call the on* handler if present
    const handler = this[`on${type}`];
    if (handler) {
      handler(event);
    }
    return true;
  }
}

class MockIDBTransaction {
  constructor() {
    this.objectStoreNames = [];
    this.mode = 'readonly';
    this.oncomplete = null;
    this.onerror = null;
    this.onabort = null;
  }
}

class MockIDBDatabase {
  constructor() {
    this.objectStoreNames = {
      contains: vi.fn().mockReturnValue(false),
    };
    this.version = 1;
    this.onclose = null;
    this.onerror = null;
  }
}

class MockIDBIndex {
  constructor() {
    this.name = '';
    this.objectStore = null;
    this.keyPath = '';
    this.multiEntry = false;
    this.unique = false;
  }
}

class MockIDBObjectStore {
  constructor() {
    this.name = '';
    this.keyPath = '';
    this.indexNames = [];
    this.transaction = null;
  }
}

class MockIDBCursor {
  constructor() {
    this.source = null;
    this.direction = 'next';
    this.key = null;
    this.primaryKey = null;
    this.value = null;
  }
}

global.IDBRequest = MockIDBRequest;
global.IDBTransaction = MockIDBTransaction;
global.IDBDatabase = MockIDBDatabase;
global.IDBIndex = MockIDBIndex;
global.IDBObjectStore = MockIDBObjectStore;
global.IDBCursor = MockIDBCursor;

// Mock IndexedDB for testing
const mockIDB = {
  databases: new Map(),
  open: vi.fn(),
  deleteDatabase: vi.fn(),
};

global.indexedDB = mockIDB;

describe('IDB Wrapper', () => {
  let idb;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    mockIDB.databases.clear();
    // Import after mocking
    idb = await import('@/storage/idb.js');
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('openDB', () => {
    it('should open database with correct name and version', async () => {
      const mockDB = {
        objectStoreNames: { contains: vi.fn().mockReturnValue(false) },
        createObjectStore: vi.fn().mockReturnValue({
          createIndex: vi.fn(),
        }),
        close: vi.fn(),
        transaction: vi.fn().mockReturnValue({
          objectStore: vi.fn().mockReturnValue({
            put: vi.fn().mockReturnValue({ onsuccess: null, onerror: null }),
            get: vi.fn().mockReturnValue({ onsuccess: null, onerror: null }),
            getAll: vi.fn().mockReturnValue({ onsuccess: null, onerror: null }),
            delete: vi.fn().mockReturnValue({ onsuccess: null, onerror: null }),
            index: vi.fn().mockReturnValue({
              getAll: vi.fn().mockReturnValue({ onsuccess: null, onerror: null }),
            }),
            openCursor: vi.fn().mockReturnValue({ onsuccess: null, onerror: null }),
          }),
        }),
      };

      mockIDB.open.mockImplementation(() => {
        const request = new MockIDBRequest();
        request.result = mockDB;
        setTimeout(() => {
          const event = { target: { result: mockDB } };
          request.dispatchEvent({ type: 'success', target: event.target });
          request.onsuccess?.(event);
        }, 0);
        return request;
      });

      const db = await idb.openDB();
      expect(db).toBeDefined();
      expect(mockIDB.open).toHaveBeenCalledWith('fincontrole', 1);
    });

    it('should create object stores on upgrade', async () => {
      const mockStores = {};
      const mockDB = {
        objectStoreNames: { contains: vi.fn().mockReturnValue(false) },
        createObjectStore: vi.fn(name => {
          mockStores[name] = {
            createIndex: vi.fn(),
          };
          return mockStores[name];
        }),
        close: vi.fn(),
        transaction: vi.fn(),
      };

      mockIDB.open.mockImplementation(() => {
        const request = new MockIDBRequest();
        request.result = mockDB;
        setTimeout(() => {
          const upgradeEvent = { target: { result: mockDB }, oldVersion: 0, newVersion: 1 };
          request.dispatchEvent({
            type: 'upgradeneeded',
            target: upgradeEvent.target,
            oldVersion: 0,
            newVersion: 1,
          });
          request.onupgradeneeded?.(upgradeEvent);

          const successEvent = { target: { result: mockDB } };
          request.dispatchEvent({ type: 'success', target: successEvent.target });
          request.onsuccess?.(successEvent);
        }, 0);
        return request;
      });

      await idb.openDB();

      // Check all required stores are created
      expect(mockDB.createObjectStore).toHaveBeenCalledWith('accounts', { keyPath: 'id' });
      expect(mockDB.createObjectStore).toHaveBeenCalledWith('transactions', { keyPath: 'id' });
      expect(mockDB.createObjectStore).toHaveBeenCalledWith('categories', { keyPath: 'id' });
      expect(mockDB.createObjectStore).toHaveBeenCalledWith('reminders', { keyPath: 'id' });
      expect(mockDB.createObjectStore).toHaveBeenCalledWith('settings', { keyPath: 'id' });
      expect(mockDB.createObjectStore).toHaveBeenCalledWith('backups', { keyPath: 'id' });
      expect(mockDB.createObjectStore).toHaveBeenCalledWith('migrations', { keyPath: 'version' });
    });

    it('should handle database open errors', async () => {
      mockIDB.open.mockImplementation(() => {
        const request = new MockIDBRequest();
        request.result = null;
        setTimeout(() => {
          const error = new Error('Failed to open');
          request.error = error;
          const errorEvent = { target: { error }, type: 'error' };
          request.dispatchEvent(errorEvent);
          request.onerror?.(errorEvent);
        }, 0);
        return request;
      });

      await expect(idb.openDB()).rejects.toThrow('Failed to open');
    });
  });

  describe('getAll', () => {
    it('should return all items from a store', async () => {
      const mockItems = [
        { id: '1', name: 'Test' },
        { id: '2', name: 'Test2' },
      ];
      const mockStore = {
        getAll: vi.fn().mockResolvedValue(mockItems),
      };
      const mockDB = {
        transaction: vi.fn().mockReturnValue({
          objectStore: vi.fn().mockReturnValue(mockStore),
        }),
      };

      // Set up the module's internal DB reference
      idb.setDBForTesting(mockDB);

      const result = await idb.getAll('accounts');
      expect(result).toEqual(mockItems);
      expect(mockDB.transaction).toHaveBeenCalledWith('accounts');
    });

    it('should handle getAll errors', async () => {
      const mockStore = {
        getAll: vi.fn().mockRejectedValue(new Error('Get all failed')),
      };
      const mockDB = {
        transaction: vi.fn().mockReturnValue({
          objectStore: vi.fn().mockReturnValue(mockStore),
        }),
      };

      idb.setDBForTesting(mockDB);

      await expect(idb.getAll('accounts')).rejects.toThrow('Get all failed');
    });
  });

  describe('getById', () => {
    it('should return item by id', async () => {
      const mockItem = { id: '1', name: 'Test' };
      const mockStore = {
        get: vi.fn().mockResolvedValue(mockItem),
      };
      const mockDB = {
        transaction: vi.fn().mockReturnValue({
          objectStore: vi.fn().mockReturnValue(mockStore),
        }),
      };

      idb.setDBForTesting(mockDB);

      const result = await idb.getById('accounts', '1');
      expect(result).toEqual(mockItem);
    });

    it('should return null for non-existent id', async () => {
      const mockStore = {
        get: vi.fn().mockResolvedValue(undefined),
      };
      const mockDB = {
        transaction: vi.fn().mockReturnValue({
          objectStore: vi.fn().mockReturnValue(mockStore),
        }),
      };

      idb.setDBForTesting(mockDB);

      const result = await idb.getById('accounts', 'nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('put', () => {
    it('should add or update an item', async () => {
      const mockItem = { id: '1', name: 'Test' };
      const mockStore = {
        put: vi.fn().mockResolvedValue('1'),
      };
      const mockDB = {
        transaction: vi.fn().mockReturnValue({
          objectStore: vi.fn().mockReturnValue(mockStore),
        }),
      };

      idb.setDBForTesting(mockDB);

      const result = await idb.put('accounts', mockItem);
      expect(result).toBe('1');
      expect(mockDB.transaction).toHaveBeenCalledWith('accounts', 'readwrite');
    });
  });

  describe('del', () => {
    it('should delete an item by id', async () => {
      const mockStore = {
        delete: vi.fn().mockResolvedValue(undefined),
      };
      const mockDB = {
        transaction: vi.fn().mockReturnValue({
          objectStore: vi.fn().mockReturnValue(mockStore),
        }),
      };

      idb.setDBForTesting(mockDB);

      await idb.del('accounts', '1');
      expect(mockDB.transaction).toHaveBeenCalledWith('accounts', 'readwrite');
    });
  });

  describe('getByIndex', () => {
    it('should query items by index', async () => {
      const mockItems = [
        { id: '1', accountId: 'acc1' },
        { id: '2', accountId: 'acc1' },
      ];
      const mockIndex = {
        getAll: vi.fn().mockResolvedValue(mockItems),
      };
      const mockStore = {
        index: vi.fn().mockReturnValue(mockIndex),
      };
      const mockDB = {
        transaction: vi.fn().mockReturnValue({
          objectStore: vi.fn().mockReturnValue(mockStore),
        }),
      };

      idb.setDBForTesting(mockDB);

      const result = await idb.getByIndex('transactions', 'accountId', 'acc1');
      expect(result).toEqual(mockItems);
    });
  });

  describe('clear', () => {
    it('should clear all items in a store', async () => {
      const mockStore = {
        clear: vi.fn().mockResolvedValue(undefined),
      };
      const mockDB = {
        transaction: vi.fn().mockReturnValue({
          objectStore: vi.fn().mockReturnValue(mockStore),
        }),
      };

      idb.setDBForTesting(mockDB);

      await idb.clear('accounts');
      expect(mockDB.transaction).toHaveBeenCalledWith('accounts', 'readwrite');
    });
  });

  describe('count', () => {
    it('should return count of items in a store', async () => {
      const mockStore = {
        count: vi.fn().mockResolvedValue(5),
      };
      const mockDB = {
        transaction: vi.fn().mockReturnValue({
          objectStore: vi.fn().mockReturnValue(mockStore),
        }),
      };

      idb.setDBForTesting(mockDB);

      const result = await idb.count('accounts');
      expect(result).toBe(5);
    });
  });

  describe('transaction', () => {
    it('should execute multiple operations in a transaction', async () => {
      const mockStore = {
        put: vi.fn().mockResolvedValue('1'),
        delete: vi.fn().mockResolvedValue(undefined),
      };
      const mockTx = {
        objectStore: vi.fn().mockReturnValue(mockStore),
        done: Promise.resolve(),
      };
      const mockDB = {
        transaction: vi.fn().mockReturnValue(mockTx),
      };

      idb.setDBForTesting(mockDB);

      const operations = [
        { store: 'accounts', type: 'put', data: { id: '1', name: 'Test' } },
        { store: 'accounts', type: 'delete', id: '2' },
      ];

      await idb.transaction(operations);
      expect(mockDB.transaction).toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('should close the database connection', async () => {
      const mockDB = { close: vi.fn() };
      idb.setDBForTesting(mockDB);

      idb.close();
      expect(mockDB.close).toHaveBeenCalled();
    });
  });

  describe('isAvailable', () => {
    it('should return true when IndexedDB is available', () => {
      expect(idb.isAvailable()).toBe(true);
    });

    it('should return false when IndexedDB is not available', () => {
      const originalIDB = global.indexedDB;
      global.indexedDB = undefined;
      expect(idb.isAvailable()).toBe(false);
      global.indexedDB = originalIDB;
    });
  });
});
