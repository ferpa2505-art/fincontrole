/**
 * Main entry point for fincontrole PWA
 * Initializes all core modules and starts the application
 *
 * Architecture:
 * - Initializes logger first
 * - Initializes storage (IndexedDB + fallback)
 * - Initializes state store (reactive global state)
 * - Initializes router (hash-based SPA navigation)
 * - Initializes i18n (internationalization)
 * - Sets up global error handling
 * - Registers service worker for offline support
 */

import logger from './utils/logger.js';
import store from './state/store.js';
import router from './router/index.js';
import i18n, { init as initI18n } from './i18n/index.js';

// Make core modules globally available for debugging (dev only)
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.__FINCONTROLE__ = {
    store,
    router,
    i18n,
    logger,
  };
}

/**
 * Initialize the application
 * @returns {Promise<void>}
 */
async function initApp() {
  logger.info('[App] Starting fincontrole PWA initialization...');

  try {
    // 1. Initialize i18n (needs to be early for localized error messages)
    await initI18n();
    logger.info(`[App] i18n initialized (locale: ${i18n.getLocale()})`);

    // 2. Initialize state store (loads data from storage)
    await store.init();
    logger.info('[App] State store initialized');

    // 3. Initialize router (handles navigation)
    await router.init();
    logger.info('[App] Router initialized');

    // 4. Set up global error handlers
    setupGlobalErrorHandlers();

    // 5. Register service worker for offline support
    await registerServiceWorker();

    // 6. Set up keyboard shortcuts
    setupKeyboardShortcuts();

    // 7. Apply theme from settings
    applyTheme();

    // 8. Initialize UI (will be implemented by feature modules)
    await initializeUI();

    logger.info('[App] fincontrole PWA initialized successfully');

    // Dispatch custom event for feature modules
    window.dispatchEvent(
      new CustomEvent('fincontrole:ready', {
        detail: { store, router, i18n },
      })
    );
  } catch (error) {
    logger.error('[App] Failed to initialize application:', error);
    showFatalError(error);
  }
}

/**
 * Set up global error handlers
 */
function setupGlobalErrorHandlers() {
  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', event => {
    logger.error('[App] Unhandled promise rejection:', event.reason);
    // Prevent default browser behavior
    event.preventDefault();
  });

  // Global JS errors
  window.addEventListener('error', event => {
    logger.error('[App] Global error:', event.error || event.message);
  });

  // Offline/online events
  window.addEventListener('online', () => {
    logger.info('[App] Network status: online');
    window.dispatchEvent(new CustomEvent('fincontrole:online'));
  });

  window.addEventListener('offline', () => {
    logger.warn('[App] Network status: offline');
    window.dispatchEvent(new CustomEvent('fincontrole:offline'));
  });

  // Visibility change (for sync on focus)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      logger.debug('[App] App became visible');
      window.dispatchEvent(
        new CustomEvent('fincontrole:visibilitychange', {
          detail: { visible: true },
        })
      );
    }
  });
}

/**
 * Register service worker for PWA offline support
 * @returns {Promise<void>}
 */
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });

      logger.info('[App] Service Worker registered:', registration.scope);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            logger.info('[App] New version available, prompting user...');
            showUpdatePrompt();
          }
        });
      });

      // Listen for controller change (update applied)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        logger.info('[App] Service Worker updated, reloading...');
        window.location.reload();
      });
    } catch (error) {
      logger.warn('[App] Service Worker registration failed:', error);
    }
  } else {
    logger.warn('[App] Service Worker not supported');
  }
}

/**
 * Show update available prompt
 */
function showUpdatePrompt() {
  // Dispatch event for UI to handle
  window.dispatchEvent(new CustomEvent('fincontrole:update-available'));
}

/**
 * Apply theme from settings
 */
function applyTheme() {
  const state = store.getState();
  const theme = state.settings?.theme || 'system';

  if (theme === 'system') {
    // Use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }

  logger.debug(`[App] Theme applied: ${theme}`);
}

/**
 * Set up keyboard shortcuts
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', event => {
    // Ctrl/Cmd + K: Focus search (future)
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      window.dispatchEvent(
        new CustomEvent('fincontrole:shortcut', {
          detail: { action: 'search' },
        })
      );
    }

    // Ctrl/Cmd + N: New transaction (future)
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
      event.preventDefault();
      window.dispatchEvent(
        new CustomEvent('fincontrole:shortcut', {
          detail: { action: 'new-transaction' },
        })
      );
    }

    // Escape: Close modals (future)
    if (event.key === 'Escape') {
      window.dispatchEvent(
        new CustomEvent('fincontrole:shortcut', {
          detail: { action: 'close-modal' },
        })
      );
    }
  });
}

/**
 * Initialize UI components
 * This will be extended by feature modules
 * @returns {Promise<void>}
 */
async function initializeUI() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    await new Promise(resolve => {
      document.addEventListener('DOMContentLoaded', resolve);
    });
  }

  // Set app name in title
  document.title = i18n.t('appName');

  // Initialize any global UI elements
  logger.debug('[App] UI initialized');
}

/**
 * Show fatal error screen
 * @param {Error} error
 */
function showFatalError(error) {
  const container = document.getElementById('app') || document.body;
  container.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      text-align: center;
      font-family: system-ui, sans-serif;
    ">
      <h1 style="color: #dc2626; margin-bottom: 16px;">${i18n.t('error')}</h1>
      <p style="color: #374151; margin-bottom: 24px; max-width: 500px;">
        ${i18n.t('appName')} failed to start. Please try refreshing the page.
      </p>
      <details style="text-align: left; max-width: 500px; margin-bottom: 24px;">
        <summary style="cursor: pointer; color: #6b7280;">Technical Details</summary>
        <pre style="
          background: #f3f4f6;
          padding: 12px;
          border-radius: 4px;
          overflow: auto;
          font-size: 12px;
          color: #1f2937;
        ">${error.message}\n${error.stack || ''}</pre>
      </details>
      <button onclick="window.location.reload()" style="
        background: #2563eb;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        font-size: 16px;
        cursor: pointer;
      ">
        ${i18n.t('back')} / Refresh
      </button>
    </div>
  `;
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Export for testing
export { initApp, store, router, i18n };

export default {
  initApp,
  store,
  router,
  i18n,
};
