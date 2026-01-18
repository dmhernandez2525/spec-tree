/**
 * Vitest Test Setup
 *
 * Global test setup for Spec Tree application
 * Includes polyfills, mocks, and global configurations
 */

import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Global test configuration
beforeAll(() => {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(() => []),
  }));

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(() => []),
  }));

  // Mock HTMLCanvasElement.getContext
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Array(4) })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => []),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
  });

  // Mock URL.createObjectURL for file uploads
  global.URL.createObjectURL = vi.fn(() => 'mocked-url');
  global.URL.revokeObjectURL = vi.fn();

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });

  // Mock sessionStorage (separate from localStorage to prevent cross-contamination)
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };
  Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

  // Mock window.scrollTo
  window.scrollTo = vi.fn();

  // Mock environment variables
  // NODE_ENV is read-only in TypeScript, but we can set other env vars
  process.env.NEXT_PUBLIC_STRAPI_API_URL = 'http://localhost:1337';
  process.env.NEXT_PUBLIC_MICROSERVICE_URL = 'http://localhost:3001';
});

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Global cleanup
afterAll(() => {
  vi.restoreAllMocks();
});
