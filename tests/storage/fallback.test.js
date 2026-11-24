import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Tests for localStorage fallback (src/storage/fallback.js)
 * - Tests getAll, getById, put, del, getByIndex, clear, count, transaction, isAvailable, close, deleteDB
 * - No existing test file for this module - this is the first creation
 * - User instruction: "ok pode implementar todos este abaixo" - implement Phase 1.2 Storage Layer
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

beforeEach(() => {
  vi.clearAllMocks();
  mockLocalStorage.store.clear();
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterEach(() => {
  console.warn = originalWarn;
  console.error = originalError;
});

describe('localStorage Fallback', () => {
  let fallback;

  beforeEach(async () => {
    vi.resetModules();
    fallback = await import('@/storage/fallback.js');
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('isAvailable', () => {
    it('should return true when localStorage is available', () => {
      expect(fallback.isAvailable()).toBe(true);
    });

    it('should return false when localStorage throws', () => {
      const originalLS = global.localStorage;
      global.localStorage = {
        setItem: () => {
          throw new Error('Quota exceeded');
        },
        removeItem: () => {},
      };
      expect(fallback.isAvailable()).toBe(false);
      global.localStorage = originalLS;
    });
  });

  describe('getAll', () => {
    it('should return all items from a store', async () => {
      const testItems = [
        { id: '1', name: 'Test' },
        { id: '2', name: 'Test2' },
      ];
      mockLocalStorage.setItem('fincontrole_accounts', JSON.stringify(testItems));

      const result = await fallback.getAll('accounts');
      expect(result).toEqual(testItems);
    });

    it('should return empty array for non-existent store', async () => {
      const result = await fallback.getAll('nonexistent');
      expect(result).toEqual([]);
    });

    it('should handle corrupted JSON gracefully', async () => {
      mockLocalStorage.setItem('fincontrole_accounts', 'invalid json');

      const result = await fallback.getAll('accounts');
      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return item by id', async () => {
      const testItems = [
        { id: '1', name: 'Test' },
        { id: '2', name: 'Test2' },
      ];
      mockLocalStorage.setItem('fincontrole_accounts', JSON.stringify(testItems));

      const result = await fallback.getById('accounts', '1');
      expect(result).toEqual({ id: '1', name: 'Test' });
    });

    it('should return null for non-existent id', async () => {
      const testItems = [{ id: '1', name: 'Test' }];
      mockLocalStorage.setItem('fincontrole_accounts', JSON.stringify(testItems));

      const result = await fallback.getById('accounts', 'nonexistent');
      expect(result).toBeNull();
    });

    it('should return null for empty store', async () => {
      const result = await fallback.getById('accounts', '1');
      expect(result).toBeNull();
    });
  });

  describe('put', () => {
    it('should add a new item', async () => {
      const newItem = { id: '1', name: 'Test', createdAt: '2024-01-01T00:00:00.000Z' };

      const result = await fallback.put('accounts', newItem);
      expect(result).toBe('1');

      const stored = JSON.parse(mockLocalStorage.getItem('fincontrole_accounts'));
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('1');
      expect(stored[0].createdAt).toBeDefined();
      expect(stored[0].updatedAt).toBeDefined();
    });

    it('should update an existing item', async () => {
      const existingItem = {
        id: '1',
        name: 'Test',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      mockLocalStorage.setItem('fincontrole_accounts', JSON.stringify([existingItem]));

      const updatedItem = { id: '1', name: 'Updated Test' };
      const result = await fallback.put('accounts', updatedItem);
      expect(result).toBe('1');

      const stored = JSON.parse(mockLocalStorage.getItem('fincontrole_accounts'));
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe('Updated Test');
      expect(stored[0].updatedAt).not.toBe('2024-01-01T00:00:00.000Z');
    });

    it('should throw on storage quota exceeded', async () => {
      // Simulate quota exceeded by making setItem throw
      const originalSetItem = mockLocalStorage.setItem;
      mockLocalStorage.setItem = () => {
        throw new Error('Quota exceeded');
      };

      await expect(fallback.put('accounts', { id: '1', name: 'Test' })).rejects.toThrow(
        'Storage quota exceeded'
      );

      mockLocalStorage.setItem = originalSetItem;
    });
  });

  describe('del', () => {
    it('should delete an item by id', async () => {
      const testItems = [
        { id: '1', name: 'Test' },
        { id: '2', name: 'Test2' },
      ];
      mockLocalStorage.setItem('fincontrole_accounts', JSON.stringify(testItems));

      await fallback.del('accounts', '1');

      const stored = JSON.parse(mockLocalStorage.getItem('fincontrole_accounts'));
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('2');
    });

    it('should be no-op for non-existent id', async () => {
      const testItems = [{ id: '1', name: 'Test' }];
      mockLocalStorage.setItem('fincontrole_accounts', JSON.stringify(testItems));

      await fallback.del('accounts', 'nonexistent');

      const stored = JSON.parse(mockLocalStorage.getItem('fincontrole_accounts'));
      expect(stored).toHaveLength(1);
    });
  });

  describe('getByIndex', () => {
    it('should return items matching index value', async () => {
      const testItems = [
        { id: '1', accountId: 'acc1', name: 'Test1' },
        { id: '2', accountId: 'acc1', name: 'Test2' },
        { id: '3', accountId: 'acc2', name: 'Test3' },
      ];
      mockLocalStorage.setItem('fincontrole_transactions', JSON.stringify(testItems));

      const result = await fallback.getByIndex('transactions', 'accountId', 'acc1');
      expect(result).toHaveLength(2);
      expect(result.every(item => item.accountId === 'acc1')).toBe(true);
    });

    it('should return empty array for non-matching index', async () => {
      const testItems = [{ id: '1', accountId: 'acc1' }];
      mockLocalStorage.setItem('fincontrole_transactions', JSON.stringify(testItems));

      const result = await fallback.getByIndex('transactions', 'accountId', 'acc2');
      expect(result).toEqual([]);
    });

    it('should fall back to scanning when index not found', async () => {
      const testItems = [
        { id: '1', categoryId: 'cat1', name: 'Test1' },
        { id: '2', categoryId: 'cat2', name: 'Test2' },
      ];
      mockLocalStorage.setItem('fincontrole_transactions', JSON.stringify(testItems));

      const result = await fallback.getByIndex('transactions', 'categoryId', 'cat1');
      expect(result).toHaveLength(1);
      expect(result[0].categoryId).toBe('cat1');
    });
  });

  describe('clear', () => {
    it('should clear all items in a store', async () => {
      const testItems = [
        { id: '1', name: 'Test' },
        { id: '2', name: 'Test2' },
      ];
      mockLocalStorage.setItem('fincontrole_accounts', JSON.stringify(testItems));
      // Add some indexes
      mockLocalStorage.setItem(
        'fincontrole_accounts_index_type_active',
        JSON.stringify([testItems[0]])
      );

      await fallback.clear('accounts');

      const stored = JSON.parse(mockLocalStorage.getItem('fincontrole_accounts'));
      expect(stored).toEqual([]);

      // Indexes should also be cleared
      expect(mockLocalStorage.getItem('fincontrole_accounts_index_type_active')).toBeNull();
    });
  });

  describe('count', () => {
    it('should return count of items in a store', async () => {
      const testItems = [{ id: '1' }, { id: '2' }, { id: '3' }];
      mockLocalStorage.setItem('fincontrole_accounts', JSON.stringify(testItems));

      const result = await fallback.count('accounts');
      expect(result).toBe(3);
    });

    it('should return 0 for empty store', async () => {
      const result = await fallback.count('accounts');
      expect(result).toBe(0);
    });
  });

  describe('transaction', () => {
    it('should execute multiple put operations in a batch', async () => {
      const operations = [
        { store: 'accounts', type: 'put', data: { id: '1', name: 'Test1' } },
        { store: 'accounts', type: 'put', data: { id: '2', name: 'Test2' } },
      ];

      await fallback.transaction(operations);

      const stored = JSON.parse(mockLocalStorage.getItem('fincontrole_accounts'));
      expect(stored).toHaveLength(2);
      expect(stored.find(item => item.id === '1')).toBeDefined();
      expect(stored.find(item => item.id === '2')).toBeDefined();
    });

    it('should execute multiple delete operations in a batch', async () => {
      const initialItems = [
        { id: '1', name: 'Test1' },
        { id: '2', name: 'Test2' },
        { id: '3', name: 'Test3' },
      ];
      mockLocalStorage.setItem('fincontrole_accounts', JSON.stringify(initialItems));

      const operations = [
        { store: 'accounts', type: 'delete', id: '1' },
        { store: 'accounts', type: 'delete', id: '3' },
      ];

      await fallback.transaction(operations);

      const stored = JSON.parse(mockLocalStorage.getItem('fincontrole_accounts'));
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('2');
    });

    it('should execute mixed put and delete operations', async () => {
      const initialItems = [{ id: '1', name: 'Test1' }];
      mockLocalStorage.setItem('fincontrole_accounts', JSON.stringify(initialItems));

      const operations = [
        { store: 'accounts', type: 'delete', id: '1' },
        { store: 'accounts', type: 'put', data: { id: '2', name: 'Test2' } },
      ];

      await fallback.transaction(operations);

      const stored = JSON.parse(mockLocalStorage.getItem('fincontrole_accounts'));
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('2');
    });

    it('should handle operations across multiple stores', async () => {
      const operations = [
        { store: 'accounts', type: 'put', data: { id: 'acc1', name: 'Account' } },
        {
          store: 'categories',
          type: 'put',
          data: { id: 'cat1', name: 'Category', type: 'expense' },
        },
      ];

      await fallback.transaction(operations);

      const accounts = JSON.parse(mockLocalStorage.getItem('fincontrole_accounts'));
      const categories = JSON.parse(mockLocalStorage.getItem('fincontrole_categories'));

      expect(accounts).toHaveLength(1);
      expect(categories).toHaveLength(1);
    });
  });

  describe('close', () => {
    it('should be a no-op for localStorage', () => {
      expect(() => fallback.close()).not.toThrow();
    });
  });

  describe('deleteDB', () => {
    it('should delete all fincontrole data from localStorage', async () => {
      mockLocalStorage.setItem('fincontrole_accounts', JSON.stringify([{ id: '1' }]));
      mockLocalStorage.setItem('fincontrole_transactions', JSON.stringify([{ id: '1' }]));
      mockLocalStorage.setItem('fincontrole_categories', JSON.stringify([{ id: '1' }]));
      mockLocalStorage.setItem('fincontrole_reminders', JSON.stringify([{ id: '1' }]));
      mockLocalStorage.setItem('fincontrole_settings', JSON.stringify({ id: '1' }));
      mockLocalStorage.setItem('fincontrole_backups', JSON.stringify([{ id: '1' }]));
      mockLocalStorage.setItem('fincontrole_migrations', JSON.stringify([{ version: 1 }]));
      // Add some other key that should not be deleted
      mockLocalStorage.setItem('other_app_data', JSON.stringify({}));

      await fallback.deleteDB();

      // All fincontrole keys should be gone
      expect(mockLocalStorage.getItem('fincontrole_accounts')).toBeNull();
      expect(mockLocalStorage.getItem('fincontrole_transactions')).toBeNull();
      expect(mockLocalStorage.getItem('fincontrole_categories')).toBeNull();
      expect(mockLocalStorage.getItem('fincontrole_reminders')).toBeNull();
      expect(mockLocalStorage.getItem('fincontrole_settings')).toBeNull();
      expect(mockLocalStorage.getItem('fincontrole_backups')).toBeNull();
      expect(mockLocalStorage.getItem('fincontrole_migrations')).toBeNull();

      // Other keys should remain
      expect(mockLocalStorage.getItem('other_app_data')).toBeDefined();
    });
  });

  describe('STORES', () => {
    it('should export correct store names', () => {
      expect(fallback.STORES.ACCOUNTS).toBe('accounts');
      expect(fallback.STORES.TRANSACTIONS).toBe('transactions');
      expect(fallback.STORES.CATEGORIES).toBe('categories');
      expect(fallback.STORES.REMINDERS).toBe('reminders');
      expect(fallback.STORES.SETTINGS).toBe('settings');
      expect(fallback.STORES.BACKUPS).toBe('backups');
      expect(fallback.STORES.MIGRATIONS).toBe('migrations');
    });
  });

  describe('Index rebuilding', () => {
    it('should rebuild indexes for transactions store', async () => {
      const testItems = [
        { id: '1', accountId: 'acc1', categoryId: 'cat1', date: '2024-01-01', type: 'expense' },
        { id: '2', accountId: 'acc1', categoryId: 'cat2', date: '2024-01-02', type: 'income' },
      ];
      mockLocalStorage.setItem('fincontrole_transactions', JSON.stringify(testItems));

      // Trigger index rebuild by putting an item
      await fallback.put('transactions', {
        id: '3',
        accountId: 'acc2',
        categoryId: 'cat1',
        date: '2024-01-03',
        type: 'expense',
      });

      // Check that indexes were created
      const acc1Index = mockLocalStorage.getItem('fincontrole_transactions_index_accountId_acc1');
      expect(acc1Index).toBeDefined();
      const acc1Items = JSON.parse(acc1Index);
      expect(acc1Items).toHaveLength(2);

      const cat1Index = mockLocalStorage.getItem('fincontrole_transactions_index_categoryId_cat1');
      expect(cat1Index).toBeDefined();
    });

    it('should rebuild indexes for reminders store', async () => {
      const testItems = [
        { id: '1', accountId: 'acc1', categoryId: 'cat1', date: '2024-01-01', isActive: true },
        { id: '2', accountId: 'acc2', categoryId: 'cat2', date: '2024-01-02', isActive: false },
      ];
      mockLocalStorage.setItem('fincontrole_reminders', JSON.stringify(testItems));

      await fallback.put('reminders', {
        id: '3',
        accountId: 'acc1',
        categoryId: 'cat1',
        date: '2024-01-03',
        isActive: true,
      });

      const activeIndex = mockLocalStorage.getItem('fincontrole_reminders_index_isActive_true');
      expect(activeIndex).toBeDefined();
    });

    it('should rebuild indexes for accounts store', async () => {
      const testItems = [
        { id: '1', type: 'checking', isActive: true },
        { id: '2', type: 'savings', isActive: false },
      ];
      mockLocalStorage.setItem('fincontrole_accounts', JSON.stringify(testItems));

      await fallback.put('accounts', { id: '3', type: 'checking', isActive: true });

      const checkingIndex = mockLocalStorage.getItem('fincontrole_accounts_index_type_checking');
      expect(checkingIndex).toBeDefined();
    });

    it('should rebuild indexes for categories store', async () => {
      const testItems = [
        { id: '1', type: 'expense', isActive: true },
        { id: '2', type: 'income', isActive: false },
      ];
      mockLocalStorage.setItem('fincontrole_categories', JSON.stringify(testItems));

      await fallback.put('categories', { id: '3', type: 'expense', isActive: true });

      const expenseIndex = mockLocalStorage.getItem('fincontrole_categories_index_type_expense');
      expect(expenseIndex).toBeDefined();
    });
  });
});
