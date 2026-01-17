/**
 * MSW Server Configuration
 *
 * Creates and exports the MSW server instance for Node.js tests
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Create MSW server instance
export const server = setupServer(...handlers);

// Server lifecycle management
export const startServer = () => {
  server.listen({
    onUnhandledRequest: 'warn',
  });
};

export const stopServer = () => {
  server.close();
};

export const resetServer = () => {
  server.resetHandlers();
};

// Helper to add runtime handlers (prepends new handlers while keeping base handlers)
export const addHandlers = (...newHandlers: Parameters<typeof server.use>) => {
  server.use(...newHandlers);
};

// Helper to completely replace all handlers for specific tests
// Note: This removes all base handlers and replaces them with the provided handlers
export const replaceHandlers = (
  ...newHandlers: Parameters<typeof server.use>
) => {
  server.resetHandlers(...newHandlers);
};

export default server;
