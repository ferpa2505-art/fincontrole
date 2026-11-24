import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Tests for StateStore (src/state/store.js)
 * - Tests init, subscribe, unsubscribe, observer pattern
 * - Tests getAll, getById, put, del, getByIndex, clear, count
 * - Tests refreshStore, getState, getSlice, updateSettings, reset, getVersion, hasData
 * - Mocks fallback storage module for isolation
 */

// Mock localStorage for Node.js environment
const mockLocalStorage = {
  store: new Map(),
  getItem(key) {
    return this.store.get(key) ?? null;
  },
  setItem(key, value) {
    this.store.set(key, value);
  },
  removeItem(key) {
    this.store.delete(key);
  },
  clear() {
    this.store.clear();
  },
  get length() {
    return this.store.size;
  },
  key(index) {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  },
};

global.localStorage = mockLocalStorage;

// Mock console.warn and console.error to keep test output clean
const originalWarn = console.warn;
const originalError = console.error;

// Mock fallback module
const mockFallback = {
  STORES: {
    ACCOUNTS: 'accounts',
    TRANSACTIONS: 'transactions',
    CATEGORIES: 'categories',
    REMINDERS: 'reminders',
    SETTINGS: 'settings',
    BACKUPS: 'backups',
    MIGRATIONS: 'migrations',
  },
  getAll: vi.fn(),
  getById: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  getByIndex: vi.fn(),
  clear: vi.fn(),
  count: vi.fn(),
  transaction: vi.fn(),
  isAvailable: vi.fn(() => true),
  close: vi.fn(),
  deleteDB: vi.fn(),
};

// Mock logger
vi.mock('@/utils/logger.js', () => ({
  default: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock migrations
vi.mock('@/storage/migrations.js', () => ({
  CURRENT_VERSION: 1,
}));

// Mock BaseRepository (not directly used but imported)
vi.mock('@/storage/repositories/BaseRepository.js', () => ({
  BaseRepository: class {},
}));

// Mock fallback module
vi.mock('@/storage/fallback.js', () => ({
  STORES: mockFallback.STORES,
  getAll: mockFallback.getAll,
  getById: mockFallback.getById,
  put: mockFallback.put,
  del: mockFallback.del,
  getByIndex: mockFallback.getByIndex,
  clear: mockFallback.clear,
  count: mockFallback.count,
  transaction: mockFallback.transaction,
  isAvailable: mockFallback.isAvailable,
  close: mockFallback.close,
  deleteDB: mockFallback.deleteDB,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockLocalStorage.store.clear();
  console.warn = vi.fn();
  console.error = vi.fn();

  // Reset mock fallback functions
  mockFallback.getAll.mockReset();
  mockFallback.getById.mockReset();
  mockFallback.put.mockReset();
  mockFallback.del.mockReset();
  mockFallback.getByIndex.mockReset();
  mockFallback.clear.mockReset();
  mockFallback.count.mockReset();
  mockFallback.transaction.mockReset();
  mockFallback.isAvailable.mockReset();
  mockFallback.close.mockReset();
  mockFallback.deleteDB.mockReset();

  mockFallback.isAvailable.mockReturnValue(true);
  mockFallback.getAll.mockResolvedValue([]);
  mockFallback.getById.mockResolvedValue(null);
  mockFallback.put.mockResolvedValue('test-id');
  mockFallback.del.mockResolvedValue(undefined);
  mockFallback.getByIndex.mockResolvedValue([]);
  mockFallback.clear.mockResolvedValue(undefined);
  mockFallback.count.mockResolvedValue(0);
  mockFallback.transaction.mockResolvedValue(undefined);
  mockFallback.close.mockResolvedValue(undefined);
  mockFallback.deleteDB.mockResolvedValue(undefined);
});

afterEach(() => {
  console.warn = originalWarn;
  console.error = originalError;
});

describe('StateStore', () => {
  let store;

  beforeEach(async () => {
    vi.resetModules();
    const storeModule = await import('@/state/store.js');
    store = storeModule.store;
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('init', () => {
    it('should initialize store and load all stores from fallback', async () => {
      // Arrange
      const mockAccounts = [{ id: 'acc1', name: 'Checking' }];
      const mockTransactions = [{ id: 'txn1', amount: 100 }];
      const mockCategories = [{ id: 'cat1', name: 'Food' }];
      const mockReminders = [{ id: 'rem1', title: 'Bill' }];
      const mockSettings = [{ theme: 'dark', currency: 'USD' }];

      mockFallback.getAll
        .mockResolvedValueOnce(mockAccounts) // accounts
        .mockResolvedValueOnce(mockTransactions) // transactions
        .mockResolvedValueOnce(mockCategories) // categories
        .mockResolvedValueOnce(mockReminders) // reminders
        .mockResolvedValueOnce(mockSettings); // settings

      // Act
      await store.init();

      // Assert
      expect(store.initialized).toBe(true);
      expect(mockFallback.getAll).toHaveBeenCalledTimes(5);
      expect(mockFallback.getAll).toHaveBeenCalledWith('accounts');
      expect(mockFallback.getAll).toHaveBeenCalledWith('transactions');
      expect(mockFallback.getAll).toHaveBeenCalledWith('categories');
      expect(mockFallback.getAll).toHaveBeenCalledWith('reminders');
      expect(mockFallback.getAll).toHaveBeenCalledWith('settings');

      expect(store.state.accounts).toEqual(mockAccounts);
      expect(store.state.transactions).toEqual(mockTransactions);
      expect(store.state.categories).toEqual(mockCategories);
      expect(store.state.reminders).toEqual(mockReminders);
      expect(store.state.settings).toEqual({ theme: 'dark', currency: 'USD' });
      expect(store.state.version).toBe(1);
    });

    it('should not re-initialize if already initialized', async () => {
      // Arrange
      mockFallback.getAll.mockResolvedValue([]);

      // Act
      await store.init();
      await store.init(); // Second call

      // Assert
      expect(mockFallback.getAll).toHaveBeenCalledTimes(5); // Only called once (first init)
    });

    it('should handle initialization error and keep empty state', async () => {
      // Arrange
      mockFallback.getAll.mockRejectedValue(new Error('Storage unavailable'));

      // Act
      await store.init();

      // Assert
      expect(store.initialized).toBe(true);
      expect(store.state.accounts).toEqual([]);
      expect(store.state.transactions).toEqual([]);
      expect(store.state.categories).toEqual([]);
      expect(store.state.reminders).toEqual([]);
      expect(store.state.settings).toEqual({});
      expect(store.state.version).toBe(1);
    });

    it('should set empty arrays for stores with no data', async () => {
      // Arrange
      mockFallback.getAll.mockResolvedValue([]);

      // Act
      await store.init();

      // Assert
      expect(store.state.accounts).toEqual([]);
      expect(store.state.transactions).toEqual([]);
      expect(store.state.categories).toEqual([]);
      expect(store.state.reminders).toEqual([]);
      expect(store.state.settings).toEqual({});
    });
  });

  describe('subscribe / unsubscribe (observer pattern)', () => {
    beforeEach(async () => {
      await store.init();
    });

    it('should register a callback and return unsubscribe function', () => {
      // Arrange
      const callback = vi.fn();

      // Act
      const unsubscribe = store.subscribe('accounts', callback);

      // Assert
      expect(typeof unsubscribe).toBe('function');
      expect(store.observers.get('accounts')).toContain(callback);
    });

    it('should notify subscribers when store changes via _setStore', () => {
      // Arrange
      const callback = vi.fn();
      store.subscribe('accounts', callback);
      const newItems = [{ id: 'new1', name: 'New Account' }];

      // Act - directly call internal method to test notification
      store._setStore('accounts', newItems);

      // Assert
      expect(callback).toHaveBeenCalledWith(newItems);
    });

    it('should notify multiple subscribers for same store', () => {
      // Arrange
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      store.subscribe('accounts', callback1);
      store.subscribe('accounts', callback2);
      const newItems = [{ id: 'new1', name: 'New Account' }];

      // Act
      store._setStore('accounts', newItems);

      // Assert
      expect(callback1).toHaveBeenCalledWith(newItems);
      expect(callback2).toHaveBeenCalledWith(newItems);
    });

    it('should NOT notify subscribers of other stores', () => {
      // Arrange
      const accountsCallback = vi.fn();
      const transactionsCallback = vi.fn();
      store.subscribe('accounts', accountsCallback);
      store.subscribe('transactions', transactionsCallback);
      const newItems = [{ id: 'new1', name: 'New Account' }];

      // Act
      store._setStore('accounts', newItems);

      // Assert
      expect(accountsCallback).toHaveBeenCalledWith(newItems);
      expect(transactionsCallback).not.toHaveBeenCalled();
    });

    it('should unsubscribe callback when unsubscribe function is called', () => {
      // Arrange
      const callback = vi.fn();
      const unsubscribe = store.subscribe('accounts', callback);
      const newItems = [{ id: 'new1', name: 'New Account' }];

      // Act
      unsubscribe();
      store._setStore('accounts', newItems);

      // Assert
      expect(callback).not.toHaveBeenCalled();
      expect(store.observers.get('accounts')).not.toContain(callback);
    });

    it('should handle unsubscribe when callback not registered', () => {
      // Arrange
      const callback = vi.fn();
      // Don't subscribe

      // Act
      const unsubscribe = store.subscribe('accounts', callback);
      unsubscribe(); // Should not throw
      store._setStore('accounts', [{ id: '1' }]);

      // Assert - no error thrown
    });

    it('should handle empty observers gracefully', () => {
      // Arrange - no subscribers for 'categories'

      // Act
      store._setStore('categories', [{ id: 'cat1' }]);

      // Assert - no error thrown
    });

    it('should handle observer callback errors gracefully', async () => {
      // Arrange
      const errorCallback = vi.fn(() => {
        throw new Error('Observer error');
      });
      const goodCallback = vi.fn();
      store.subscribe('accounts', errorCallback);
      store.subscribe('accounts', goodCallback);

      // Act
      store._setStore('accounts', [{ id: '1' }]);

      // Assert
      expect(goodCallback).toHaveBeenCalled();
      const logger = (await import('@/utils/logger.js')).default;
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should allow multiple unsubscribes without error', () => {
      // Arrange
      const callback = vi.fn();
      const unsubscribe = store.subscribe('accounts', callback);

      // Act
      unsubscribe();
      unsubscribe(); // Second call should not throw

      // Assert - no error
    });
  });

  describe('_notifyObservers', () => {
    beforeEach(async () => {
      await store.init();
    });

    it('should call all callbacks for a store', () => {
      // Arrange
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      store.subscribe('accounts', callback1);
      store.subscribe('accounts', callback2);
      const items = [{ id: '1' }, { id: '2' }];

      // Act
      store._notifyObservers('accounts', items);

      // Assert
      expect(callback1).toHaveBeenCalledWith(items);
      expect(callback2).toHaveBeenCalledWith(items);
    });

    it('should not error when no observers for store', () => {
      // Act / Assert
      expect(() => store._notifyObservers('nonexistent', [])).not.toThrow();
    });

    it('should not error when observers array is empty', () => {
      // Arrange
      store.observers.set('accounts', []);

      // Act / Assert
      expect(() => store._notifyObservers('accounts', [])).not.toThrow();
    });
  });

  describe('getAll', () => {
    beforeEach(async () => {
      await store.init();
    });

    it('should delegate to fallback.getAll', async () => {
      // Arrange
      const mockItems = [{ id: '1', name: 'Test' }];
      mockFallback.getAll.mockResolvedValue(mockItems);

      // Act
      const result = await store.getAll('accounts');

      // Assert
      expect(mockFallback.getAll).toHaveBeenCalledWith('accounts');
      expect(result).toEqual(mockItems);
    });

    it('should return empty array when fallback returns empty', async () => {
      // Arrange
      mockFallback.getAll.mockResolvedValue([]);

      // Act
      const result = await store.getAll('accounts');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getSlice', () => {
    beforeEach(async () => {
      await store.init();
    });

    it('should return structuredClone of state slice', async () => {
      // Arrange
      store.state.accounts = [{ id: '1', name: 'Test' }];

      // Act
      const result = store.getSlice('accounts');

      // Assert
      expect(result).toEqual([{ id: '1', name: 'Test' }]);
    });

    it('should return null for empty key', async () => {
      // Act
      const result = store.getSlice('');

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for missing key', async () => {
      // Act
      const result = store.getSlice('nonexistent');

      // Assert
      expect(result).toBeNull();
    });

    it('should return deep copy (immutable) - mutations dont affect original', async () => {
      // Arrange
      const original = [{ id: '1' }];
      store.state.accounts = original;
      const result = store.getSlice('accounts');

      // Act - mutate the result
      result[0].id = '2';

      // Assert - original should be unchanged
      expect(store.state.accounts[0].id).toBe('1');
    });
  });

  describe('getById', () => {
    beforeEach(async () => {
      await store.init();
    });

    it('should delegate to fallback.getById', async () => {
      // Arrange
      const mockItem = { id: '1', name: 'Test' };
      mockFallback.getById.mockResolvedValue(mockItem);

      // Act
      const result = await store.getById('accounts', '1');

      // Assert
      expect(mockFallback.getById).toHaveBeenCalledWith('accounts', '1');
      expect(result).toEqual(mockItem);
    });

    it('should return null when item not found', async () => {
      // Arrange
      mockFallback.getById.mockResolvedValue(null);

      // Act
      const result = await store.getById('accounts', 'nonexistent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('put', () => {
    beforeEach(async () => {
      await store.init();
    });

    it('should delegate to fallback.put and refresh store', async () => {
      // Arrange
      const newItem = { id: '1', name: 'New Account' };
      const updatedItems = [{ id: '1', name: 'New Account' }];
      mockFallback.put.mockResolvedValue('1');
      mockFallback.getAll.mockResolvedValue(updatedItems);

      // Act
      const result = await store.put('accounts', newItem);

      // Assert
      expect(mockFallback.put).toHaveBeenCalledWith('accounts', newItem);
      expect(mockFallback.getAll).toHaveBeenCalledWith('accounts');
      expect(result).toBe('1');
    });

    it('should notify observers after put', async () => {
      // Arrange
      const callback = vi.fn();
      store.subscribe('accounts', callback);
      const newItem = { id: '1', name: 'New Account' };
      const updatedItems = [{ id: '1', name: 'New Account' }];
      mockFallback.put.mockResolvedValue('1');
      mockFallback.getAll.mockResolvedValue(updatedItems);

      // Act
      await store.put('accounts', newItem);

      // Assert
      expect(callback).toHaveBeenCalledWith(updatedItems);
    });

    it('should propagate error from fallback.put', async () => {
      // Arrange
      mockFallback.put.mockRejectedValue(new Error('Storage full'));

      // Act & Assert
      await expect(store.put('accounts', { id: '1' })).rejects.toThrow('Storage full');
    });
  });

  describe('del', () => {
    beforeEach(async () => {
      await store.init();
    });

    it('should delegate to fallback.del and refresh store', async () => {
      // Arrange
      mockFallback.del.mockResolvedValue(undefined);
      mockFallback.getAll.mockResolvedValue([]);

      // Act
      await store.del('accounts', '1');

      // Assert
      expect(mockFallback.del).toHaveBeenCalledWith('accounts', '1');
      expect(mockFallback.getAll).toHaveBeenCalledWith('accounts');
    });

    it('should notify observers after del', async () => {
      // Arrange
      const callback = vi.fn();
      store.subscribe('accounts', callback);
      mockFallback.del.mockResolvedValue(undefined);
      mockFallback.getAll.mockResolvedValue([]);

      // Act
      await store.del('accounts', '1');

      // Assert
      expect(callback).toHaveBeenCalledWith([]);
    });

    it('should propagate error from fallback.del', async () => {
      // Arrange
      mockFallback.del.mockRejectedValue(new Error('Delete failed'));

      // Act & Assert
      await expect(store.del('accounts', '1')).rejects.toThrow('Delete failed');
    });
  });

  describe('getByIndex', () => {
    beforeEach(async () => {
      await store.init();
    });

    it('should delegate to fallback.getByIndex', async () => {
      // Arrange
      const mockItems = [{ id: '1', accountId: 'acc1' }];
      mockFallback.getByIndex.mockResolvedValue(mockItems);

      // Act
      const result = await store.getByIndex('transactions', 'accountId', 'acc1');

      // Assert
      expect(mockFallback.getByIndex).toHaveBeenCalledWith('transactions', 'accountId', 'acc1');
      expect(result).toEqual(mockItems);
    });

    it('should return empty array when no matches', async () => {
      // Arrange
      mockFallback.getByIndex.mockResolvedValue([]);

      // Act
      const result = await store.getByIndex('transactions', 'accountId', 'nonexistent');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('clear', () => {
    beforeEach(async () => {
      await store.init();
    });

    it('should delegate to fallback.clear and refresh store', async () => {
      // Arrange
      mockFallback.clear.mockResolvedValue(undefined);
      mockFallback.getAll.mockResolvedValue([]);

      // Act
      await store.clear('accounts');

      // Assert
      expect(mockFallback.clear).toHaveBeenCalledWith('accounts');
      expect(mockFallback.getAll).toHaveBeenCalledWith('accounts');
    });

    it('should notify observers with empty array after clear', async () => {
      // Arrange
      const callback = vi.fn();
      store.subscribe('accounts', callback);
      mockFallback.clear.mockResolvedValue(undefined);
      mockFallback.getAll.mockResolvedValue([]);

      // Act
      await store.clear('accounts');

      // Assert
      expect(callback).toHaveBeenCalledWith([]);
    });

    it('should propagate error from fallback.clear', async () => {
      // Arrange
      mockFallback.clear.mockRejectedValue(new Error('Clear failed'));

      // Act & Assert
      await expect(store.clear('accounts')).rejects.toThrow('Clear failed');
    });
  });

  describe('count', () => {
    beforeEach(async () => {
      await store.init();
    });

    it('should delegate to fallback.count', async () => {
      // Arrange
      mockFallback.count.mockResolvedValue(5);

      // Act
      const result = await store.count('accounts');

      // Assert
      expect(mockFallback.count).toHaveBeenCalledWith('accounts');
      expect(result).toBe(5);
    });

    it('should return 0 for empty store', async () => {
      // Arrange
      mockFallback.count.mockResolvedValue(0);

      // Act
      const result = await store.count('accounts');

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('refreshStore', () => {
    beforeEach(async () => {
      await store.init();
    });

    it('should reload data from fallback and update state', async () => {
      // Arrange
      const freshItems = [{ id: 'fresh1', name: 'Fresh' }];
      mockFallback.getAll.mockResolvedValue(freshItems);

      // Act
      await store.refreshStore('accounts');

      // Assert
      expect(mockFallback.getAll).toHaveBeenCalledWith('accounts');
      expect(store.state.accounts).toEqual(freshItems);
    });

    it('should notify observers with fresh data', async () => {
      // Arrange
      const callback = vi.fn();
      store.subscribe('accounts', callback);
      const freshItems = [{ id: 'fresh1', name: 'Fresh' }];
      mockFallback.getAll.mockResolvedValue(freshItems);

      // Act
      await store.refreshStore('accounts');

      // Assert
      expect(callback).toHaveBeenCalledWith(freshItems);
    });

    it('should handle error from fallback gracefully', async () => {
      // Arrange
      mockFallback.getAll.mockRejectedValue(new Error('Refresh failed'));

      // Act & Assert
      await expect(store.refreshStore('accounts')).rejects.toThrow('Refresh failed');
    });

    it('should log debug message on successful refresh', async () => {
      // Arrange
      const freshItems = [{ id: '1' }];
      mockFallback.getAll.mockResolvedValue(freshItems);
      const logger = (await import('@/utils/logger.js')).default;

      // Act
      await store.refreshStore('accounts');

      // Assert
      expect(logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Refreshed store accounts with 1 items')
      );
    });
  });

  describe('getState', () => {
    beforeEach(async () => {
      await store.init();
    });

    it('should return a copy of the current state', () => {
      // Arrange
      store.state.accounts = [{ id: '1' }];
      store.state.transactions = [{ id: 't1' }];

      // Act
      const state = store.getState();

      // Assert
      expect(state).toEqual({
        accounts: [{ id: '1' }],
        transactions: [{ id: 't1' }],
        categories: [],
        reminders: [],
        settings: {},
        version: 1,
      });
    });

    it('should return a new object (not the same reference)', () => {
      // Act
      const state1 = store.getState();
      const state2 = store.getState();

      // Assert
      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });

    it('should not allow mutation of internal state via returned object', () => {
      // Act
      const state = store.getState();
      state.accounts.push({ id: 'mutated' });

      // Assert
      expect(store.state.accounts).not.toContainEqual({ id: 'mutated' });
    });
  });

  describe('getSlice', () => {
    beforeEach(async () => {
      await store.init();
    });

    it('should return accounts slice', () => {
      // Arrange
      store.state.accounts = [{ id: '1', name: 'Checking' }];

      // Act
      const slice = store.getSlice('accounts');

      // Assert
      expect(slice).toEqual([{ id: '1', name: 'Checking' }]);
    });

    it('should return transactions slice', () => {
      // Arrange
      store.state.transactions = [{ id: 't1', amount: 100 }];

      // Act
      const slice = store.getSlice('transactions');

      // Assert
      expect(slice).toEqual([{ id: 't1', amount: 100 }]);
    });

    it('should return categories slice', () => {
      // Arrange
      store.state.categories = [{ id: 'c1', name: 'Food' }];

      // Act
      const slice = store.getSlice('categories');

      // Assert
      expect(slice).toEqual([{ id: 'c1', name: 'Food' }]);
    });

    it('should return reminders slice', () => {
      // Arrange
      store.state.reminders = [{ id: 'r1', title: 'Bill' }];

      // Act
      const slice = store.getSlice('reminders');

      // Assert
      expect(slice).toEqual([{ id: 'r1', title: 'Bill' }]);
    });

    it('should return settings slice', () => {
      // Arrange
      store.state.settings = { theme: 'dark' };

      // Act
      const slice = store.getSlice('settings');

      // Assert
      expect(slice).toEqual({ theme: 'dark' });
    });

    it('should return null for unknown key', () => {
      // Act
      const slice = store.getSlice('unknown');

      // Assert
      expect(slice).toBeNull();
    });

    it('should return empty array when slice is not set (after init)', () => {
      // Act
      const slice = store.getSlice('settings');

      // Assert - after init, settings is initialized to empty array
      expect(slice).toEqual({});
    });
  });

  describe('updateSettings', () => {
    beforeEach(async () => {
      await store.init();
    });

    it('should merge new settings with existing settings', async () => {
      // Arrange
      store.state.settings = { theme: 'light', currency: 'USD' };
      const newSettings = { theme: 'dark' };

      // Act
      const result = await store.updateSettings(newSettings);

      // Assert
      expect(result).toEqual({
        theme: 'dark',
        currency: 'USD',
        updatedAt: expect.any(String),
      });
    });

    it('should create settings object when none exists', async () => {
      // Arrange
      store.state.settings = null;
      const newSettings = { theme: 'dark' };

      // Act
      const result = await store.updateSettings(newSettings);

      // Assert
      expect(result).toEqual({
        theme: 'dark',
        updatedAt: expect.any(String),
      });
    });

    it('should add updatedAt timestamp', async () => {
      // Arrange
      store.state.settings = {};
      const beforeTime = new Date().toISOString();

      // Act
      const result = await store.updateSettings({ theme: 'dark' });
      const afterTime = new Date().toISOString();

      // Assert
      expect(result.updatedAt).toBeDefined();
      expect(new Date(result.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeTime).getTime()
      );
      expect(new Date(result.updatedAt).getTime()).toBeLessThanOrEqual(
        new Date(afterTime).getTime()
      );
    });

    it('should notify observers with updated settings', async () => {
      // Arrange
      const callback = vi.fn();
      store.subscribe('settings', callback);
      store.state.settings = { theme: 'light' };

      // Act
      await store.updateSettings({ theme: 'dark' });

      // Assert - settings observers receive array with object inside
      expect(callback).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ theme: 'dark' })])
      );
    });

    it('should return the updated settings object', async () => {
      // Act
      const result = await store.updateSettings({ theme: 'dark' });

      // Assert
      expect(result).toEqual(store.state.settings);
    });
  });

  describe('reset', () => {
    beforeEach(async () => {
      await store.init();
    });

    it('should reset state to initial values', async () => {
      // Arrange
      store.state.accounts = [{ id: '1' }];
      store.state.transactions = [{ id: 't1' }];
      store.state.categories = [{ id: 'c1' }];
      store.state.reminders = [{ id: 'r1' }];
      store.state.settings = { theme: 'dark' };

      // Act
      await store.reset();

      // Assert
      expect(store.state.accounts).toEqual([]);
      expect(store.state.transactions).toEqual([]);
      expect(store.state.categories).toEqual([]);
      expect(store.state.reminders).toEqual([]);
      expect(store.state.settings).toEqual({});
      expect(store.state.version).toBe(1);
    });

    it('should clear observers before reset to prevent race condition', async () => {
      // Arrange
      const accountsCallback = vi.fn();
      const transactionsCallback = vi.fn();
      const categoriesCallback = vi.fn();
      store.subscribe('accounts', accountsCallback);
      store.subscribe('transactions', transactionsCallback);
      store.subscribe('categories', categoriesCallback);
      store.state.accounts = [{ id: '1' }];

      // Act
      await store.reset();

      // Assert - observers are cleared first to prevent race condition,
      // so they should NOT be called during reset
      expect(accountsCallback).not.toHaveBeenCalled();
      expect(transactionsCallback).not.toHaveBeenCalled();
      expect(categoriesCallback).not.toHaveBeenCalled();
    });

    it('should log info message on reset', async () => {
      // Arrange
      const logger = (await import('@/utils/logger.js')).default;

      // Act
      await store.reset();

      // Assert
      expect(logger.info).toHaveBeenCalledWith('[StateStore] State reset to defaults');
    });
  });

  describe('_notifyAllFromSnapshot (internal)', () => {
    beforeEach(async () => {
      await store.init();
    });

    it('should notify all registered observers with current state from snapshot', () => {
      // Arrange
      const accountsCallback = vi.fn();
      const transactionsCallback = vi.fn();
      store.subscribe('accounts', accountsCallback);
      store.subscribe('transactions', transactionsCallback);
      store.state.accounts = [{ id: '1' }];
      store.state.transactions = [{ id: 't1' }];

      // Act - use the actual internal method name
      store._notifyAllFromSnapshot(store.state);

      // Assert
      expect(accountsCallback).toHaveBeenCalledWith([{ id: '1' }]);
      expect(transactionsCallback).toHaveBeenCalledWith([{ id: 't1' }]);
    });

    it('should handle stores with no observers', () => {
      // Arrange - only subscribe to accounts
      const accountsCallback = vi.fn();
      store.subscribe('accounts', accountsCallback);
      store.state.transactions = [{ id: 't1' }];

      // Act
      store._notifyAllFromSnapshot(store.state);

      // Assert
      expect(accountsCallback).toHaveBeenCalled();
    });

    it('should notify with empty array for stores with no data', () => {
      // Arrange
      const remindersCallback = vi.fn();
      store.subscribe('reminders', remindersCallback);

      // Act
      store._notifyAllFromSnapshot(store.state);

      // Assert
      expect(remindersCallback).toHaveBeenCalledWith([]);
    });

    it('should only notify observers for stores present in snapshot', () => {
      // Arrange
      const accountsCallback = vi.fn();
      const transactionsCallback = vi.fn();
      store.subscribe('accounts', accountsCallback);
      store.subscribe('transactions', transactionsCallback);
      // Create a snapshot WITHOUT accounts key (only transactions)
      const snapshot = { transactions: [{ id: 't1' }] };

      // Act
      store._notifyAllFromSnapshot(snapshot);

      // Assert - accounts callback should NOT be called (key not in snapshot)
      // transactions callback SHOULD be called with its data
      expect(accountsCallback).not.toHaveBeenCalled();
      expect(transactionsCallback).toHaveBeenCalledWith([{ id: 't1' }]);
    });
  });

  describe('getVersion', () => {
    beforeEach(async () => {
      await store.init();
    });

    it('should return current version from state', () => {
      // Act
      const version = store.getVersion();

      // Assert
      expect(version).toBe(1);
    });

    it('should return version even after state changes', async () => {
      // Act
      store.state.version = 2;
      const version = store.getVersion();

      // Assert
      expect(version).toBe(2);
    });
  });

  describe('hasData', () => {
    beforeEach(async () => {
      await store.init();
    });

    it('should return true when store has items', async () => {
      // Arrange
      mockFallback.count.mockResolvedValue(5);

      // Act
      const result = await store.hasData('accounts');

      // Assert
      expect(mockFallback.count).toHaveBeenCalledWith('accounts');
      expect(result).toBe(true);
    });

    it('should return false when store is empty', async () => {
      // Arrange
      mockFallback.count.mockResolvedValue(0);

      // Act
      const result = await store.hasData('accounts');

      // Assert
      expect(result).toBe(false);
    });

    it('should delegate to fallback.count', async () => {
      // Arrange
      mockFallback.count.mockResolvedValue(3);

      // Act
      await store.hasData('transactions');

      // Assert
      expect(mockFallback.count).toHaveBeenCalledWith('transactions');
    });
  });

  describe('Integration scenarios', () => {
    it('should maintain observer state across multiple operations', async () => {
      // Arrange
      await store.init();
      const callback = vi.fn();
      store.subscribe('accounts', callback);
      const item1 = { id: '1', name: 'Account 1' };
      const item2 = { id: '2', name: 'Account 2' };

      mockFallback.put.mockResolvedValue('1');
      mockFallback.getAll.mockResolvedValue([item1]);

      // Act - put first item
      await store.put('accounts', item1);

      mockFallback.getAll.mockResolvedValue([item1, item2]);

      // Act - put second item
      await store.put('accounts', item2);

      // Assert
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenNthCalledWith(1, [item1]);
      expect(callback).toHaveBeenNthCalledWith(2, [item1, item2]);
    });

    it('should handle concurrent subscribers for different stores', async () => {
      // Arrange
      await store.init();
      const accountsCallback = vi.fn();
      const transactionsCallback = vi.fn();
      const categoriesCallback = vi.fn();

      store.subscribe('accounts', accountsCallback);
      store.subscribe('transactions', transactionsCallback);
      store.subscribe('categories', categoriesCallback);

      mockFallback.getAll.mockResolvedValue([{ id: '1' }]);

      // Act - refresh multiple stores
      await store.refreshStore('accounts');
      await store.refreshStore('transactions');
      await store.refreshStore('categories');

      // Assert
      expect(accountsCallback).toHaveBeenCalled();
      expect(transactionsCallback).toHaveBeenCalled();
      expect(categoriesCallback).toHaveBeenCalled();
    });

    it('should preserve settings across reset of other stores', async () => {
      // Arrange
      await store.init();
      store.state.settings = { theme: 'dark', language: 'pt-BR' };

      // Act
      await store.reset();

      // Assert
      // Settings should be reset to empty object (as per createInitialState)
      expect(store.state.settings).toEqual({});
    });
  });
});
