/**
 * Client-side router for fincontrole PWA
 * Hash-based routing for offline-first SPA
 *
 * Called by:
 * - src/main.js (app initialization)
 * - Feature modules for navigation
 *
 * Architecture:
 * - Hash-based routes (#/path)
 * - Route registration with handlers
 * - Before/after navigation guards
 * - Lazy-loaded route handlers
 */

import logger from '../utils/logger.js';
import store from '../state/store.js';

/**
 * Route definition
 * @typedef {Object} Route
 * @property {string} path - Route pattern (e.g., '/', '/accounts', '/transactions/:id')
 * @property {Function} handler - Async function to handle route
 * @property {Object} meta - Route metadata (title, requiresAuth, etc.)
 */

/**
 * Router class for hash-based SPA navigation
 */
class Router {
  constructor() {
    this.routes = [];
    this.currentRoute = null;
    this.beforeGuards = [];
    this.afterGuards = [];
    this.isInitialized = false;
    this.notFoundHandler = null;

    logger.info('[Router] Router initialized');
  }

  /**
   * Register a route
   * @param {string} path - Route pattern
   * @param {Function} handler - Route handler function
   * @param {Object} meta - Route metadata
   * @returns {Router} - Returns this for chaining
   */
  addRoute(path, handler, meta = {}) {
    const route = {
      path: this._normalizePath(path),
      handler,
      meta: {
        title: meta.title || '',
        requiresAuth: meta.requiresAuth || false,
        ...meta,
      },
      regex: this._pathToRegex(path),
      paramNames: this._extractParamNames(path),
    };

    this.routes.push(route);
    logger.debug(`[Router] Registered route: ${path}`);
    return this;
  }

  /**
   * Set 404 handler
   * @param {Function} handler - Not found handler
   * @returns {Router}
   */
  setNotFoundHandler(handler) {
    this.notFoundHandler = handler;
    return this;
  }

  /**
   * Add before navigation guard
   * @param {Function} guard - Guard function (to, from, next)
   * @returns {Router}
   */
  beforeEach(guard) {
    this.beforeGuards.push(guard);
    return this;
  }

  /**
   * Add after navigation guard
   * @param {Function} guard - Guard function (to, from)
   * @returns {Router}
   */
  afterEach(guard) {
    this.afterGuards.push(guard);
    return this;
  }

  /**
   * Initialize router and start listening
   * @returns {Promise<void>}
   */
  async init() {
    if (this.isInitialized) {
      logger.debug('[Router] Already initialized');
      return;
    }

    // Handle initial hash
    const initialHash = window.location.hash.slice(1) || '/';
    await this.navigate(initialHash, { replace: true });

    // Listen for hash changes
    window.addEventListener('hashchange', event => {
      const newHash = event.newURL.split('#')[1] || '/';
      const oldHash = event.oldURL.split('#')[1] || '/';
      this._handleNavigation(newHash, oldHash);
    });

    this.isInitialized = true;
    logger.info('[Router] Router started listening for hash changes');
  }

  /**
   * Navigate to a route
   * @param {string} path - Target path
   * @param {Object} options - Navigation options
   * @param {boolean} options.replace - Replace history entry
   * @returns {Promise<void>}
   */
  async navigate(path, options = {}) {
    const normalizedPath = this._normalizePath(path);
    const currentPath = this.currentRoute ? this.currentRoute.path : null;

    // Run before guards
    const guardResult = await this._runGuards(this.beforeGuards, normalizedPath, currentPath);
    if (guardResult === false) {
      logger.debug('[Router] Navigation cancelled by guard');
      return;
    }

    // Find matching route
    const match = this._matchRoute(normalizedPath);

    if (match) {
      this.currentRoute = {
        path: normalizedPath,
        params: match.params,
        route: match.route,
      };

      // Update hash without triggering hashchange
      if (options.replace) {
        history.replaceState(null, '', `#${normalizedPath}`);
      } else {
        history.pushState(null, '', `#${normalizedPath}`);
      }

      // Execute route handler
      try {
        await match.route.handler(match.params, this.currentRoute);
        logger.info(`[Router] Navigated to: ${normalizedPath}`);
      } catch (error) {
        logger.error(`[Router] Route handler error for ${normalizedPath}:`, error);
        throw error;
      }

      // Run after guards
      await this._runGuards(this.afterGuards, normalizedPath, currentPath);
    } else if (this.notFoundHandler) {
      // Handle 404
      this.currentRoute = {
        path: normalizedPath,
        params: {},
        route: null,
      };

      if (options.replace) {
        history.replaceState(null, '', `#${normalizedPath}`);
      } else {
        history.pushState(null, '', `#${normalizedPath}`);
      }

      await this.notFoundHandler(normalizedPath);
      logger.warn(`[Router] Route not found: ${normalizedPath}`);
    } else {
      logger.warn(`[Router] No route matched and no 404 handler: ${normalizedPath}`);
    }
  }

  /**
   * Get current route info
   * @returns {Object|null}
   */
  getCurrentRoute() {
    return this.currentRoute;
  }

  /**
   * Go back in history
   */
  back() {
    history.back();
  }

  /**
   * Go forward in history
   */
  forward() {
    history.forward();
  }

  /**
   * Navigate to a specific history entry
   * @param {number} delta - Steps to go (-1 = back, 1 = forward)
   */
  go(delta) {
    history.go(delta);
  }

  /**
   * Normalize path (ensure leading slash)
   * @param {string} path
   * @returns {string}
   * @private
   */
  _normalizePath(path) {
    if (!path || path === '') return '/';
    return path.startsWith('/') ? path : `/${path}`;
  }

  /**
   * Convert path pattern to regex
   * @param {string} path
   * @returns {RegExp}
   * @private
   */
  _pathToRegex(path) {
    const escaped = path
      .replace(/\//g, '\\/')
      .replace(/:([^/]+)/g, '([^/]+)')
      .replace(/\*/g, '.*');
    return new RegExp(`^${escaped}$`);
  }

  /**
   * Extract parameter names from path pattern
   * @param {string} path
   * @returns {string[]}
   * @private
   */
  _extractParamNames(path) {
    const matches = path.match(/:([^/]+)/g);
    return matches ? matches.map(m => m.slice(1)) : [];
  }

  /**
   * Match current path to registered routes
   * @param {string} path
   * @returns {Object|null}
   * @private
   */
  _matchRoute(path) {
    for (const route of this.routes) {
      const match = path.match(route.regex);
      if (match) {
        const params = {};
        route.paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });
        return { route, params };
      }
    }
    return null;
  }

  /**
   * Handle hashchange event
   * @param {string} newHash
   * @param {string} oldHash
   * @private
   */
  async _handleNavigation(newHash, oldHash) {
    const normalizedNew = this._normalizePath(newHash);
    const normalizedOld = this._normalizePath(oldHash);

    // Run before guards
    const guardResult = await this._runGuards(this.beforeGuards, normalizedNew, normalizedOld);
    if (guardResult === false) {
      // Revert hash if guard prevents navigation
      history.replaceState(null, '', `#${normalizedOld}`);
      logger.debug('[Router] Navigation reverted by guard');
      return;
    }

    // Find matching route
    const match = this._matchRoute(normalizedNew);

    if (match) {
      this.currentRoute = {
        path: normalizedNew,
        params: match.params,
        route: match.route,
      };

      try {
        await match.route.handler(match.params, this.currentRoute);
        logger.info(`[Router] Navigated to: ${normalizedNew}`);
      } catch (error) {
        logger.error(`[Router] Route handler error for ${normalizedNew}:`, error);
        // Revert on error
        history.replaceState(null, '', `#${normalizedOld}`);
        throw error;
      }

      // Run after guards
      await this._runGuards(this.afterGuards, normalizedNew, normalizedOld);
    } else if (this.notFoundHandler) {
      this.currentRoute = {
        path: normalizedNew,
        params: {},
        route: null,
      };

      await this.notFoundHandler(normalizedNew);
      logger.warn(`[Router] Route not found: ${normalizedNew}`);
    } else {
      logger.warn(`[Router] No route matched and no 404 handler: ${normalizedNew}`);
    }
  }

  /**
   * Run navigation guards
   * @param {Function[]} guards
   * @param {string} to
   * @param {string} from
   * @returns {Promise<boolean>}
   * @private
   */
  async _runGuards(guards, to, from) {
    for (const guard of guards) {
      try {
        const result = await guard(to, from, allowed => {
          // Allow navigation to continue
          if (allowed === false) return false;
          return true;
        });
        if (result === false) return false;
      } catch (error) {
        logger.error('[Router] Guard error:', error);
        return false;
      }
    }
    return true;
  }
}

// Export singleton instance
export const router = new Router();

export default router;
