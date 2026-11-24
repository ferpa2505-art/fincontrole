/**
 * Simple logger utility for production-safe logging
 * Replaces direct console.log/warn/error usage
 *
 * Can be extended with proper logging libraries (pino, winston, etc.)
 * when the project grows.
 */

const isDevelopment = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

/**
 * Log levels
 * @readonly
 * @enum {number}
 */
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

/**
 * Current log level (can be configured at runtime)
 * @type {number}
 */
let currentLogLevel = isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;

/**
 * Format log message with timestamp and level
 * @param {string} level - Log level string
 * @param {string} message - Log message
 * @param {*} [meta] - Additional metadata
 * @returns {string} Formatted log message
 */
function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString();
  const metaStr = meta !== undefined ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
}

/**
 * Logger object with level-based methods
 */
export const logger = {
  /**
   * Set the minimum log level
   * @param {number} level - Log level from LogLevel enum
   */
  setLevel(level) {
    currentLogLevel = level;
  },

  /**
   * Debug level logging (only in development)
   * @param {string} message - Log message
   * @param {*} [meta] - Additional metadata
   */
  debug(message, meta) {
    if (currentLogLevel <= LogLevel.DEBUG) {
      console.debug(formatMessage('DEBUG', message, meta));
    }
  },

  /**
   * Info level logging
   * @param {string} message - Log message
   * @param {*} [meta] - Additional metadata
   */
  info(message, meta) {
    if (currentLogLevel <= LogLevel.INFO) {
      console.info(formatMessage('INFO', message, meta));
    }
  },

  /**
   * Warning level logging
   * @param {string} message - Log message
   * @param {*} [meta] - Additional metadata
   */
  warn(message, meta) {
    if (currentLogLevel <= LogLevel.WARN) {
      console.warn(formatMessage('WARN', message, meta));
    }
  },

  /**
   * Error level logging
   * @param {string} message - Log message
   * @param {*} [meta] - Additional metadata
   */
  error(message, meta) {
    if (currentLogLevel <= LogLevel.ERROR) {
      console.error(formatMessage('ERROR', message, meta));
    }
  },
};

export default logger;
