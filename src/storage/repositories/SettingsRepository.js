/**
 * Settings repository for managing application settings
 * Extends BaseRepository with settings-specific queries
 *
 * Called by:
 * - src/state/store.js (state management)
 * - src/features/settings/*.js (settings features)
 *
 * Uses:
 * - src/storage/idb.js for database operations
 * - src/schemas/settings.js for validation (SettingsSchema, CreateSettingsSchema, UpdateSettingsSchema)
 * - src/storage/repositories/BaseRepository.js
 *
 * No existing file serves the same purpose - this is the first settings repository implementation
 * User instruction: "ok pode implementar todos este abaixo" - implement Phase 1.2 Storage Layer
 */
import { BaseRepository } from './BaseRepository.js';
import { STORES } from '../idb.js';
import {
  SettingsSchema,
  CreateSettingsSchema,
  UpdateSettingsSchema,
} from '../../schemas/settings.js';

/**
 * Default settings singleton key
 * @type {string}
 */
const SETTINGS_KEY = 'app-settings';

/**
 * Default settings values
 * @type {Object}
 */
export const DEFAULT_SETTINGS = {
  theme: 'system',
  language: 'pt-BR',
  currency: 'BRL',
  dateFormat: 'DD/MM/YYYY',
  numberFormat: 'pt-BR',
  notificationsEnabled: false,
  dailyReminderEnabled: false,
  dailyReminderTime: '09:00',
  biometricEnabled: false,
  autoBackupEnabled: false,
  backupFrequency: 'manual',
  showBalanceOnHome: true,
  compactMode: false,
  firstDayOfWeek: 0,
};

/**
 * Settings repository class
 * Manages a single settings record (singleton pattern)
 */
export class SettingsRepository extends BaseRepository {
  constructor() {
    super(STORES.SETTINGS, SettingsSchema);
  }

  /**
   * Get settings (creates defaults if not exists)
   * @returns {Promise<Object>} Settings object
   */
  async getSettings() {
    let settings = await this.findById(SETTINGS_KEY);
    if (!settings) {
      settings = await this.createDefaults();
    }
    return settings;
  }

  /**
   * Create default settings
   * @returns {Promise<Object>} Created settings
   */
  async createDefaults() {
    const now = new Date().toISOString();
    const defaultSettings = {
      ...DEFAULT_SETTINGS,
      id: SETTINGS_KEY,
      createdAt: now,
      updatedAt: now,
    };
    return this.create(defaultSettings);
  }

  /**
   * Get settings or null if not exists
   * @returns {Promise<Object|null>} Settings object or null
   */
  async findSettings() {
    return this.findById(SETTINGS_KEY);
  }

  /**
   * Update settings
   * @param {Object} data - Settings data to update
   * @returns {Promise<Object>} Updated settings
   */
  async updateSettings(data) {
    const existing = await this.getSettings();
    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    const validated = UpdateSettingsSchema.parse(updated);
    return this.put(STORES.SETTINGS, validated);
  }

  /**
   * Update a single setting
   * @param {string} key - Setting key
   * @param {*} value - Setting value
   * @returns {Promise<Object>} Updated settings
   */
  async setSetting(key, value) {
    const existing = await this.getSettings();
    const updated = {
      ...existing,
      [key]: value,
      updatedAt: new Date().toISOString(),
    };
    const validated = UpdateSettingsSchema.parse(updated);
    return this.put(STORES.SETTINGS, validated);
  }

  /**
   * Get a single setting
   * @param {string} key - Setting key
   * @returns {Promise<*>} Setting value
   */
  async getSetting(key) {
    const settings = await this.getSettings();
    return settings[key];
  }

  /**
   * Reset settings to defaults
   * @returns {Promise<Object>} Reset settings
   */
  async resetToDefaults() {
    await this.delete(SETTINGS_KEY);
    return this.createDefaults();
  }

  /**
   * Export settings as JSON
   * @returns {Promise<string>} JSON string
   */
  async exportSettings() {
    const settings = await this.getSettings();
    return JSON.stringify(settings, null, 2);
  }

  /**
   * Import settings from JSON
   * @param {string} jsonString - JSON string
   * @returns {Promise<Object>} Imported settings
   */
  async importSettings(jsonString) {
    const data = JSON.parse(jsonString);
    const validated = SettingsSchema.parse(data);
    return this.put(STORES.SETTINGS, validated);
  }

  /**
   * Validate settings data
   * @param {Object} data - Settings data
   * @returns {Object} Validated data
   */
  validate(data) {
    return CreateSettingsSchema.parse(data);
  }

  /**
   * Validate update data
   * @param {Object} data - Update data
   * @returns {Object} Validated data
   */
  validateUpdate(data) {
    return UpdateSettingsSchema.parse(data);
  }

  /**
   * Override findAll - settings is a singleton
   * @returns {Promise<Array>}
   */
  async findAll() {
    const settings = await this.getSettings();
    return [settings];
  }

  /**
   * Override count - settings is a singleton
   * @returns {Promise<number>}
   */
  async count() {
    const settings = await this.findSettings();
    return settings ? 1 : 0;
  }
}

export default new SettingsRepository();
