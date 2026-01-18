/**
 * MSW (Mock Service Worker) Setup
 *
 * Configures MSW for intercepting API requests during tests
 */

import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

// Start server before all tests
// Use 'error' in CI to catch unhandled requests, 'warn' locally for development
beforeAll(() => {
  const onUnhandledRequest = process.env.CI ? 'error' : 'warn';
  server.listen({ onUnhandledRequest });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Close server after all tests
afterAll(() => {
  server.close();
});
