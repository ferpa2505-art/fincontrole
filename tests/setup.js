import { vi } from 'vitest';

// Mock IndexedDB for tests
globalThis.indexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
};

// Mock service worker
globalThis.navigator.serviceWorker = {
  register: vi.fn(),
  ready: Promise.resolve({
    pushManager: {
      subscribe: vi.fn(),
    },
  }),
};

// Mock matchMedia
globalThis.matchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Mock ResizeObserver
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
globalThis.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
globalThis.sessionStorage = sessionStorageMock;

// Mock fetch
globalThis.fetch = vi.fn();

// Silence console.warn in tests unless explicitly testing warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('act(') || args[0]?.includes?.('Warning:')) {
    return;
  }
  originalWarn.apply(console, args);
};
