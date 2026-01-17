/**
 * MSW (Mock Service Worker) Setup
 *
 * Configures MSW for intercepting API requests during tests
 */

import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Close server after all tests
afterAll(() => {
  server.close();
});
