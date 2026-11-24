/**
 * Category repository for managing transaction categories
 * Extends BaseRepository with category-specific queries
 *
 * Called by:
 * - src/state/store.js (state management)
 * - src/features/categories/*.js (category features)
 *
 * Uses:
 * - src/storage/idb.js for database operations
 * - src/schemas/categories.js for validation (CategorySchema, CreateCategorySchema, UpdateCategorySchema)
 * - src/storage/repositories/BaseRepository.js
 *
 * No existing file serves the same purpose - this is the first category repository implementation
 * User instruction: "ok pode implementar todos este abaixo" - implement Phase 1.2 Storage Layer
 */
import { BaseRepository } from './BaseRepository.js';
import { STORES } from '../idb.js';
import {
  CategorySchema,
  CreateCategorySchema,
  UpdateCategorySchema,
} from '../../schemas/categories.js';

/**
 * Category types
 * @readonly
 * @enum {string}
 */
export const CategoryType = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

/**
 * Category repository class
 */
export class CategoryRepository extends BaseRepository {
  constructor() {
    super(STORES.CATEGORIES, CategorySchema);
  }

  /**
   * Get all active categories
   * @returns {Promise<Array>}
   */
  async findActive() {
    return this.findByIndex('isActive', true);
  }

  /**
   * Get categories by type
   * @param {string} type - Category type (income/expense)
   * @returns {Promise<Array>}
   */
  async findByType(type) {
    return this.findByIndex('type', type);
  }

  /**
   * Get active categories by type
   * @param {string} type - Category type
   * @returns {Promise<Array>}
   */
  async findActiveByType(type) {
    const categories = await this.findByType(type);
    return categories.filter(c => c.isActive === true);
  }

  /**
   * Get income categories
   * @returns {Promise<Array>}
   */
  async findIncomeCategories() {
    return this.findActiveByType(CategoryType.INCOME);
  }

  /**
   * Get expense categories
   * @returns {Promise<Array>}
   */
  async findExpenseCategories() {
    return this.findActiveByType(CategoryType.EXPENSE);
  }

  /**
   * Create a new category
   * @param {Object} data - Category data
   * @param {string} data.name - Category name
   * @param {string} data.type - Category type (income/expense)
   * @param {string} [data.color] - UI color
   * @param {string} [data.icon] - UI icon
   * @param {boolean} [data.isActive=true] - Active status
   * @param {string} [data.parentId] - Parent category ID (for subcategories)
   * @returns {Promise<string>} ID of created category
   */
  async create(data) {
    const categoryData = {
      ...data,
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return super.create(categoryData);
  }

  /**
   * Toggle category active status
   * @param {string} id - Category ID
   * @returns {Promise<string>} ID of updated category
   */
  async toggleActive(id) {
    const category = await this.findById(id);
    if (!category) {
      throw new Error(`Category with id ${id} not found`);
    }
    return this.update(id, { isActive: !category.isActive });
  }

  /**
   * Get subcategories for a parent category
   * @param {string} parentId - Parent category ID
   * @returns {Promise<Array>}
   */
  async findSubcategories(parentId) {
    const allCategories = await this.findAll();
    return allCategories.filter(c => c.parentId === parentId);
  }

  /**
   * Get category tree (parent categories with their subcategories)
   * @param {string} type - Category type
   * @returns {Promise<Array>}
   */
  async getCategoryTree(type) {
    const allCategories = await this.findByType(type);
    const parents = allCategories.filter(c => !c.parentId);
    const children = allCategories.filter(c => c.parentId);

    return parents.map(parent => ({
      ...parent,
      subcategories: children.filter(c => c.parentId === parent.id),
    }));
  }

  /**
   * Validate category data
   * @param {Object} data - Category data
   * @returns {Object} Validated data
   */
  validate(data) {
    return CreateCategorySchema.parse(data);
  }

  /**
   * Validate update data
   * @param {Object} data - Update data
   * @returns {Object} Validated data
   */
  validateUpdate(data) {
    return UpdateCategorySchema.parse(data);
  }
}

export default new CategoryRepository();
